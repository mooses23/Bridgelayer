import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssistantService } from '../services/AssistantService';
import { Logger } from '../lib/logger';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      beta: {
        assistants: {
          create: vi.fn(),
          update: vi.fn(),
        },
        threads: {
          create: vi.fn(),
          delete: vi.fn(),
          messages: {
            create: vi.fn(),
            list: vi.fn(),
          },
          runs: {
            create: vi.fn(),
            retrieve: vi.fn(),
          },
        },
      },
      files: {
        create: vi.fn(),
      },
    })),
  };
});

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    firmAssistant: {
      create: vi.fn(),
      update: vi.fn(),
    },
    threadSession: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    assistantMessage: {
      create: vi.fn(),
    },
    knowledgeBaseFile: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('AssistantService', () => {
  let service: AssistantService;
  let mockOpenAI: any;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = new Logger('test');
    service = new AssistantService('test-api-key', mockLogger);
    mockOpenAI = new OpenAI();
  });

  describe('createAssistant', () => {
    it('should create an assistant successfully', async () => {
      const mockAssistant = {
        id: 'asst_123',
        name: 'Test Assistant',
        model: 'gpt-4',
        metadata: { firmId: 'firm_123' },
      };

      mockOpenAI.beta.assistants.create.mockResolvedValueOnce(mockAssistant);

      const result = await service.createAssistant({
        firmId: 'firm_123',
        name: 'Test Assistant',
        instructions: 'Test instructions',
        role: 'analyst',
      });

      expect(result).toBeDefined();
      expect(result.assistantId).toBe('asst_123');
    });

    it('should handle errors when creating an assistant', async () => {
      const error = new Error('API Error');
      mockOpenAI.beta.assistants.create.mockRejectedValueOnce(error);

      await expect(
        service.createAssistant({
          firmId: 'firm_123',
          name: 'Test Assistant',
          instructions: 'Test instructions',
          role: 'analyst',
        })
      ).rejects.toThrow();
    });
  });

  describe('sendMessage', () => {
    it('should send a message and start a run', async () => {
      const mockMessage = {
        id: 'msg_123',
        thread_id: 'thread_123',
        role: 'user',
        content: [{ type: 'text', text: 'Test message' }],
      };

      const mockRun = {
        id: 'run_123',
        status: 'queued',
      };

      mockOpenAI.beta.threads.messages.create.mockResolvedValueOnce(mockMessage);
      mockOpenAI.beta.threads.runs.create.mockResolvedValueOnce(mockRun);

      const result = await service.sendMessage({
        threadId: 'thread_123',
        content: 'Test message',
      });

      expect(result).toBeDefined();
      expect(result.threadId).toBe('thread_123');
    });
  });

  describe('waitForResponse', () => {
    it('should wait for completion and return messages', async () => {
      const mockRun = {
        id: 'run_123',
        status: 'completed',
        assistant_id: 'asst_123',
      };

      const mockMessages = {
        data: [
          {
            id: 'msg_123',
            role: 'assistant',
            content: [{ type: 'text', text: 'Response' }],
          },
        ],
      };

      mockOpenAI.beta.threads.runs.retrieve.mockResolvedValueOnce(mockRun);
      mockOpenAI.beta.threads.messages.list.mockResolvedValueOnce(mockMessages);

      const result = await service.waitForResponse('thread_123', 'run_123');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle failed runs', async () => {
      const mockRun = {
        id: 'run_123',
        status: 'failed',
        last_error: { message: 'Run failed' },
      };

      mockOpenAI.beta.threads.runs.retrieve.mockResolvedValueOnce(mockRun);

      await expect(
        service.waitForResponse('thread_123', 'run_123')
      ).rejects.toThrow('Run failed');
    });
  });
});
