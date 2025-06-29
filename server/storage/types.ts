// Basic types for the existing database entities
type AgentAssignment = {
  documentTypeId: string;
  agentId: string;
  workflow: any;
};

type Agent = {
  id: string;
  name: string;
  [key: string]: any;  // Allow for other properties
};

export interface DatabaseStorage {
  // Agent Assignment Methods
  getAgentAssignments(): Promise<AgentAssignment[]>;
  getAgentAssignment(documentTypeId: string): Promise<AgentAssignment | undefined>;
  upsertAgentAssignment(data: { documentTypeId: string; agentId: string; workflow: any; }): Promise<AgentAssignment[]>;
  deleteAgentAssignment(documentTypeId: string): Promise<void>;
  
  // Agent Methods
  getAgent(agentId: string): Promise<Agent | undefined>;
}
