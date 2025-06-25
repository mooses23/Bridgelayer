import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
console.log('Database connection string:', connectionString);

const pool = new Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Async initialization function instead of top-level await
async function initializePool() {
  try {
    await pool.connect();
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

// Initialize the pool
initializePool();

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  // ...other methods
};