import { Agent, AgentPrompt, AgentWorkflow, DocumentTemplate } from '@prisma/client';

export type AgentType = 'researcher' | 'analyst' | 'coordinator' | 'reviewer';

export type AgentCapabilities = {
  canAccessLaw?: boolean;
  canSearchPrecedents?: boolean;
  canAnalyzeContracts?: boolean;
  canExtractClauses?: boolean;
  maxDocuments?: number;
  supportedDocTypes?: string[];
  [key: string]: any;
};

export type WorkflowStep = {
  action: string;
  timeout: number;
  retries?: number;
  fallback?: string;
};

export type WorkflowRules = {
  steps: WorkflowStep[];
  fallback: {
    action: string;
    notification?: string;
  };
  conditions?: Record<string, any>;
};

export type TemplateVariable = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  required: boolean;
  description?: string;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
};

export type TemplateSchema = {
  required: string[];
  optional: string[];
  variables: Record<string, TemplateVariable>;
};

export interface AgentWithRelations extends Agent {
  prompts?: AgentPrompt[];
  workflows?: AgentWorkflow[];
}

export interface DocumentTemplateWithSchema extends DocumentTemplate {
  variables: TemplateSchema;
}

export type AgentEvent = {
  type: string;
  agentId: string;
  data: any;
  timestamp: Date;
};

export type AgentMetrics = {
  requestsProcessed: number;
  averageResponseTime: number;
  errorRate: number;
  lastActive: Date;
};

export type AgentStatus = 'idle' | 'processing' | 'error' | 'maintenance';
