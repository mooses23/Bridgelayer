import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { users, firms } from "./shared/schema.ts";
import { eq } from 'drizzle-orm';
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

const db = drizzle({ client: pool, schema: { users, firms } });

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Hash password for admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@firmsync.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists: admin@firmsync.com');
    } else {
      // Create admin user
      const [adminUser] = await db
        .insert(users)
        .values({
          email: 'admin@firmsync.com',
          passwordHash: hashedPassword,
          role: 'super_admin',
        })
        .returning();

      console.log('✅ Created admin user:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: `${adminUser.firstName} ${adminUser.lastName}`
      });
    }

    // Check if test firm already exists
    const existingFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.slug, 'test-law-firm'))
      .limit(1);

    if (existingFirm.length > 0) {
      console.log('✅ Test firm already exists: test-law-firm');
    } else {
      // Create test firm
      const [testFirm] = await db
        .insert(firms)
        .values({
          name: 'Test Law Firm',
          slug: 'test-law-firm',
          subdomain: 'testfirm',
          plan: 'starter',
          status: 'active',
          onboarded: true,
          onboardingComplete: true,
        })
        .returning();

      console.log('✅ Created test firm:', {
        id: testFirm.id,
        name: testFirm.name,
        slug: testFirm.slug,
      });
    }

    console.log('\n🎉 Database setup complete!');
    console.log('🔐 Admin login credentials:');
    console.log('   Email: admin@firmsync.com');
    console.log('   Password: admin123');
    console.log('   Role: super_admin');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
createAdminUser()
  .then(() => {
    console.log('✅ Admin setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin setup failed:', error);
    process.exit(1);
  });
