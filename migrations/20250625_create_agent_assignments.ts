import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const createAgentAssignmentsTable = sql`
  CREATE TABLE IF NOT EXISTS agent_assignments (
    document_type_id TEXT PRIMARY KEY REFERENCES document_types(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    workflow JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_agent_assignments_agent_id ON agent_assignments(agent_id);
`;

async function main() {
  console.log('Running migration: create agent assignments table');
  
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    await db.execute(createAgentAssignmentsTable);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main().finally(() => {
  pool.end();
});
