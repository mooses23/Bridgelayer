import { db } from '../db';
import { AgentAssignment, Agent } from '@prisma/client';

export async function getAgentAssignments(): Promise<AgentAssignment[]> {
  return db.agentAssignment.findMany({
    include: {
      agent: true,
      documentType: true,
    },
  });
}

export async function getAgentAssignment(documentTypeId: string): Promise<AgentAssignment | null> {
  return db.agentAssignment.findUnique({
    where: { documentTypeId },
    include: {
      agent: true,
      documentType: true,
    },
  });
}

export async function upsertAgentAssignment(data: {
  documentTypeId: string;
  agentId: string;
  workflow: Record<string, any>;
}): Promise<AgentAssignment> {
  return db.agentAssignment.upsert({
    where: { documentTypeId: data.documentTypeId },
    create: {
      documentTypeId: data.documentTypeId,
      agentId: data.agentId,
      workflow: data.workflow,
    },
    update: {
      agentId: data.agentId,
      workflow: data.workflow,
    },
  });
}

export async function deleteAgentAssignment(documentTypeId: string): Promise<void> {
  await db.agentAssignment.delete({
    where: { documentTypeId },
  });
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  return db.agent.findUnique({
    where: { id: agentId },
  });
}

export default {
  getAgentAssignments,
  getAgentAssignment,
  upsertAgentAssignment,
  deleteAgentAssignment,
  getAgent,
};
