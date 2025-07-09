import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Configure WebSocket for Neon Database
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Check your .env file.");
}

// Create database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3,
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle({ client: pool });

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // First, check what role enum values are available
    const enumResult = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    `);
    
    console.log('Available roles:', enumResult.rows.map(r => r.enumlabel));

    // Hash password for admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if admin user already exists (using raw SQL to avoid schema issues)
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      ['admin@firmsync.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists: admin@firmsync.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Use the first available admin-like role
    const availableRoles = enumResult.rows.map(r => r.enumlabel);
    const adminRole = availableRoles.find(role => 
      role.includes('admin') || role === 'owner'
    ) || availableRoles[0];

    console.log(`Using role: ${adminRole}`);

    // Create admin user using raw SQL
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, role, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING id, email, role
    `, ['admin@firmsync.com', hashedPassword, adminRole]);

    const adminUser = result.rows[0];

    console.log('✅ Created admin user:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });
    console.log('🔑 Email: admin@firmsync.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
createAdminUser().catch(console.error);
