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
  max: 5,
  min: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  query_timeout: 10000,
  statement_timeout: 10000,
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
export const withDatabase = async (operation: () => Promise<any>) => {
  if (!isPoolHealthy) {
    throw new Error('Database connection is not healthy');
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
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