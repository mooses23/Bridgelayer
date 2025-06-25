import OpenAI from 'openai';
import { type Uploadable } from 'openai/uploads';
import { Logger } from '@/lib/logger';
import {
  type FirmAssistant,
  type ThreadSession,
  type AssistantMessage,
  type KnowledgeBaseFile,
  type AssistantError,
  type OpenAIAssistant,
  type OpenAIThread,
  type OpenAIMessage,
  type OpenAIRun
} from '@/types/assistant';
import { prisma } from '@/lib/prisma';
import { retry } from '@/lib/retry';
import { createHash } from 'crypto';

export class AssistantService {
  private openai: OpenAI;
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.openai = new OpenAI({ apiKey });
    this.logger = logger;
  }

  // Assistant Management
  async createAssistant(params: {
    firmId: string;
    name: string;
    instructions: string;
    role: string;
    model?: string;
    tools?: any[];
    fileIds?: string[];
  }): Promise<FirmAssistant> {
    try {
      // Create OpenAI Assistant
      const assistant = await retry(() => this.openai.beta.assistants.create({
        name: params.name,
        instructions: params.instructions,
        model: params.model || 'gpt-4-1106-preview',
        tools: params.tools || [{ type: 'retrieval' }],
        file_ids: params.fileIds || [],
        metadata: {
          firmId: params.firmId,
          role: params.role,
        }
      }));

      // Store in database
      const firmAssistant = await prisma.firmAssistant.create({
        data: {
          firmId: params.firmId,
          assistantId: assistant.id,
          name: params.name,
          role: params.role,
          description: '',
          model: assistant.model,
          instructions: params.instructions,
          tools: params.tools || [],
          metadata: assistant.metadata || {}
        }
      });

      this.logger.info('Created assistant', { 
        assistantId: assistant.id, 
        firmId: params.firmId 
      });

      return firmAssistant;
    } catch (error) {
      this.logger.error('Failed to create assistant', { error, params });
      throw this.handleError(error);
    }
  }

  async updateAssistant(assistantId: string, updates: Partial<FirmAssistant>): Promise<FirmAssistant> {
    try {
      const assistant = await retry(() => this.openai.beta.assistants.update(
        assistantId,
        {
          name: updates.name,
          instructions: updates.instructions,
          tools: updates.tools,
          model: updates.model,
          metadata: updates.metadata,
        }
      ));

      const updated = await prisma.firmAssistant.update({
        where: { assistantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      this.logger.info('Updated assistant', { assistantId });
      return updated;
    } catch (error) {
      this.logger.error('Failed to update assistant', { error, assistantId });
      throw this.handleError(error);
    }
  }

  // Thread Management
  async createThread(params: {
    firmId: string;
    assistantId: string;
    title: string;
    metadata?: Record<string, any>;
  }): Promise<ThreadSession> {
    try {
      const thread = await retry(() => this.openai.beta.threads.create({
        metadata: {
          firmId: params.firmId,
          assistantId: params.assistantId,
          ...params.metadata
        }
      }));

      const session = await prisma.threadSession.create({
        data: {
          firmId: params.firmId,
          threadId: thread.id,
          assistantId: params.assistantId,
          title: params.title,
          status: 'active',
          metadata: thread.metadata || {}
        }
      });

      this.logger.info('Created thread', { 
        threadId: thread.id, 
        assistantId: params.assistantId 
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to create thread', { error, params });
      throw this.handleError(error);
    }
  }

  // Message Management
  async sendMessage(params: {
    threadId: string;
    content: string;
    fileIds?: string[];
  }): Promise<AssistantMessage> {
    try {
      const message = await retry(() => this.openai.beta.threads.messages.create(
        params.threadId,
        {
          role: 'user',
          content: params.content,
          file_ids: params.fileIds || []
        }
      ));

      // Start the assistant's response
      const run = await this.openai.beta.threads.runs.create(
        params.threadId,
        {
          assistant_id: message.assistant_id!,
        }
      );

      // Store in database
      const savedMessage = await prisma.assistantMessage.create({
        data: {
          threadId: params.threadId,
          content: [{ type: 'text', text: params.content }],
          role: 'user',
          metadata: {
            runId: run.id,
            fileIds: params.fileIds
          }
        }
      });

      this.logger.info('Sent message', { 
        messageId: message.id, 
        threadId: params.threadId 
      });

      return savedMessage;
    } catch (error) {
      this.logger.error('Failed to send message', { error, params });
      throw this.handleError(error);
    }
  }

  // File Management
  async uploadFile(params: {
    firmId: string;
    file: Uploadable;
    filename: string;
    purpose: 'assistants' | 'fine-tune';
  }): Promise<KnowledgeBaseFile> {
    try {
      // Generate a hash of the file content for deduplication
      // Generate a unique identifier for the file
      const hash = createHash('sha256')
        .update(params.filename + Date.now())
        .digest('hex');

      // Check if file already exists
      const existing = await prisma.knowledgeBaseFile.findFirst({
        where: {
          firmId: params.firmId,
          metadata: {
            path: ['hash'],
            equals: hash
          }
        }
      });

      if (existing) {
        return existing;
      }

      const file = await retry(() => this.openai.files.create({
        file: params.file,
        purpose: params.purpose
      }));

      const saved = await prisma.knowledgeBaseFile.create({
        data: {
          firmId: params.firmId,
          fileId: file.id,
          filename: params.filename,
          purpose: params.purpose,
          mimeType: file.mime_type || 'application/octet-stream',
          size: file.bytes,
          metadata: {
            hash,
            status: file.status
          }
        }
      });

      this.logger.info('Uploaded file', { 
        fileId: file.id, 
        firmId: params.firmId 
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to upload file', { error, filename: params.filename });
      throw this.handleError(error);
    }
  }

  // Run Management
  async waitForResponse(threadId: string, runId: string): Promise<AssistantMessage[]> {
    try {
      let run = await this.openai.beta.threads.runs.retrieve(
        threadId,
        runId
      );
      
      while (run.status === 'queued' || run.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await this.openai.beta.threads.runs.retrieve(
          threadId,
          runId
        );
      }

      if (run.status === 'failed') {
        throw new Error(run.last_error?.message || 'Run failed');
      }

      // Retrieve messages after the run
      const messages = await this.openai.beta.threads.messages.list(threadId, {
        order: 'desc',
        limit: 10
      });

      // Store assistant messages in database
      const savedMessages = await Promise.all(
        messages.data
          .filter(msg => msg.role === 'assistant')
          .map(msg => prisma.assistantMessage.create({
            data: {
              threadId,
              content: msg.content,
              role: 'assistant',
              metadata: {
                runId,
                assistantId: run.assistant_id
              }
            }
          }))
      );

      return savedMessages;
    } catch (error) {
      this.logger.error('Failed to get response', { error, threadId, runId });
      throw this.handleError(error);
    }
  }

  // Error Handling
  private handleError(error: any): AssistantError {
    const assistantError: AssistantError = new Error(
      error.message || 'Assistant service error'
    ) as AssistantError;
    
    assistantError.code = error.code || 'ASSISTANT_ERROR';
    assistantError.status = error.status;
    assistantError.details = error.details || {};

    return assistantError;
  }

  // Cleanup
  async deleteThread(threadId: string): Promise<void> {
    try {
      await this.openai.beta.threads.delete(threadId);
      await prisma.threadSession.delete({
        where: { threadId }
      });
      this.logger.info('Deleted thread', { threadId });
    } catch (error) {
      this.logger.error('Failed to delete thread', { error, threadId });
      throw this.handleError(error);
    }
  }
}
