import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon Database with proper fallback
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool with conservative settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3,
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  query_timeout: 15000,
  statement_timeout: 15000,
});

export const db = drizzle({ client: pool, schema });

// Enhanced error handling with retry logic
let isPoolHealthy = true;

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  isPoolHealthy = false;

  // Attempt to recover after a delay
  setTimeout(() => {
    console.log('Attempting to restore database connection...');
    isPoolHealthy = true;
  }, 5000);
});

pool.on('connect', () => {
  console.log('Database connected successfully');
  isPoolHealthy = true;
});

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database connection wrapper with retry
export const withDatabase = async (operation: () => Promise<any>, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Database operation failed (attempt ${attempt + 1}):`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      
      // Reset pool health on connection errors
      if (error.message.includes('Connection terminated') || error.message.includes('connect')) {
        isPoolHealthy = false;
        setTimeout(() => {
          isPoolHealthy = true;
        }, 2000);
      }
    }
  }
};

// Graceful shutdown handling
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Shutting down database connections...');
  try {
    await pool.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Database initialization will be handled by Drizzle migrations
// The schema is defined in shared/schema.ts and applied via drizzle-kit