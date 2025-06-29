import { db } from '../db';
import agentAssignments from './agent-assignments';
import { eq } from 'drizzle-orm';
import { agent_assignments, agents } from '@shared/schema';

// Export a unified storage interface
export const storage = {
  ...agentAssignments,

  // Agent Assignments Methods
  async getAgentAssignments() {
    return db.select().from(agent_assignments);
  },
  
  async getAgentAssignment(documentTypeId: string) {
    return db.select()
      .from(agent_assignments)
      .where(eq(agent_assignments.documentTypeId, documentTypeId))
      .limit(1)
      .then(rows => rows[0]);
  },

  async upsertAgentAssignment(data: { documentTypeId: string; agentId: string; workflow: any; }) {
    return db.insert(agent_assignments)
      .values(data)
      .onConflictDoUpdate({
        target: agent_assignments.documentTypeId,
        set: { agentId: data.agentId, workflow: data.workflow }
      })
      .returning();
  },

  async deleteAgentAssignment(documentTypeId: string) {
    return db.delete(agent_assignments)
      .where(eq(agent_assignments.documentTypeId, documentTypeId));
  },

  async getAgent(agentId: string) {
    return db.select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1)
      .then(rows => rows[0]);
  },

  // ... other storage methods
};
