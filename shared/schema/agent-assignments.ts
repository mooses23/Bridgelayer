import { InferModel } from 'drizzle-orm';
import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { agents } from './agents';
import { document_types } from './document-types';

export const agent_assignments = pgTable('agent_assignments', {
  documentTypeId: text('document_type_id').references(() => document_types.id, { onDelete: 'cascade' }).primaryKey(),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  workflow: jsonb('workflow').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const agent_assignments_relations = relations(agent_assignments, ({ one }) => ({
  agent: one(agents, {
    fields: [agent_assignments.agentId],
    references: [agents.id],
  }),
  documentType: one(document_types, {
    fields: [agent_assignments.documentTypeId],
    references: [document_types.id],
  }),
}));

// Export TypeScript types
export type AgentAssignment = InferModel<typeof agent_assignments>;
export type NewAgentAssignment = InferModel<typeof agent_assignments, 'insert'>;
