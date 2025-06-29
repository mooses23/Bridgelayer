import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// CREATE MINIMAL TABLES FOR BASIC FUNCTIONALITY
async function createMinimalSchema() {
  console.log('Creating minimal database schema...');

  try {
    // Drop existing tables to avoid conflicts
    await pool.query('DROP TABLE IF EXISTS session CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP TABLE IF EXISTS firms CASCADE');
    
    console.log('Dropped existing tables');

    // Create firms table
    await pool.query(`
      CREATE TABLE firms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        subdomain TEXT UNIQUE,
        domain TEXT,
        plan TEXT NOT NULL DEFAULT 'starter',
        status TEXT NOT NULL DEFAULT 'active',
        onboarded BOOLEAN NOT NULL DEFAULT false,
        onboarding_complete BOOLEAN DEFAULT false,
        logo_url TEXT,
        settings JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created firms table');

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        firm_id INTEGER REFERENCES firms(id),
        email TEXT UNIQUE NOT NULL,
        username TEXT,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        status TEXT NOT NULL DEFAULT 'active',
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created users table');

    // Create session table for express-session
    await pool.query(`
      CREATE TABLE session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        PRIMARY KEY (sid)
      ) WITH (OIDS=FALSE);
    `);
    console.log('Created session table');

    // Create an admin user for testing
    const adminPassword = '$2b$10$K8Qzk9M1q5U7t6Y.o8vOke3EQzU8dCgOJzJ.M1H.8xN4zL2HUXE1K'; // password: "admin123"
    
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['admin@firmsync.com', adminPassword, 'Admin', 'User', 'super_admin', 'active']);
    console.log('Created admin user: admin@firmsync.com / admin123');

    // Create a test firm
    await pool.query(`
      INSERT INTO firms (name, slug, subdomain, onboarded, status)
      VALUES ($1, $2, $3, $4, $5)
    `, ['Test Law Firm', 'test-law-firm', 'testfirm', true, 'active']);
    console.log('Created test firm');

    console.log('✅ Minimal database schema created successfully!');
    console.log('🔐 Admin login: admin@firmsync.com / admin123');

  } catch (error) {
    console.error('❌ Error creating minimal schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
createMinimalSchema()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });
