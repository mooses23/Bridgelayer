import { type Assistant, type Thread, type Message, type Run } from 'openai/resources/beta/assistants/assistants';

export type AssistantRole = 'researcher' | 'analyst' | 'coordinator' | 'reviewer';

export interface FirmAssistant {
  id: string;
  firmId: string;
  assistantId: string; // OpenAI Assistant ID
  name: string;
  role: AssistantRole;
  description: string;
  model: string;
  instructions: string;
  tools: AssistantTool[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface AssistantTool {
  type: 'code_interpreter' | 'retrieval' | 'function';
  function?: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface ThreadSession {
  id: string;
  firmId: string;
  threadId: string; // OpenAI Thread ID
  assistantId: string;
  title: string;
  status: 'active' | 'completed' | 'archived';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface MessageContent {
  type: 'text' | 'image_file' | 'file';
  text?: string;
  file_id?: string;
}

export interface AssistantMessage {
  id: string;
  threadId: string;
  assistantId: string | null;
  content: MessageContent[];
  role: 'user' | 'assistant' | 'system';
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface KnowledgeBaseFile {
  id: string;
  firmId: string;
  fileId: string; // OpenAI File ID
  filename: string;
  purpose: 'assistants' | 'fine-tune';
  mimeType: string;
  size: number;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface AssistantError extends Error {
  code: string;
  status?: number;
  details?: Record<string, any>;
}

// OpenAI API Response Types
export interface OpenAIAssistant extends Assistant {}
export interface OpenAIThread extends Thread {}
export interface OpenAIMessage extends Message {}
export interface OpenAIRun extends Run {}
