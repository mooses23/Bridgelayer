import { InferModel } from 'drizzle-orm';
import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  firmId: text('firm_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  status: text('status').default('active').notNull(),
  model: text('model').default('gpt-4').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  temperature: text('temperature').default('0.7').notNull(),
  maxTokens: text('max_tokens').default('2000').notNull(),
  capabilities: jsonb('capabilities').default({}).notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export TypeScript types
export type Agent = InferModel<typeof agents>;
export type NewAgent = InferModel<typeof agents, 'insert'>;
