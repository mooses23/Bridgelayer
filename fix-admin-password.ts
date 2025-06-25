import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { users } from "./shared/schema.ts";
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import 'dotenv/config';

async function updateAdminPassword() {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema: { users } });

  // Hash the correct password
  const correctPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(correctPassword, 10);
  console.log('New hashed password:', hashedPassword);

  // Update the admin user's password
  const updatedUser = await db
    .update(users)
    .set({ 
      password: hashedPassword,
      updatedAt: new Date()
    })
    .where(eq(users.email, 'admin@firmsync.com'))
    .returning();

  console.log('✅ Updated admin user password:', {
    id: updatedUser[0].id,
    email: updatedUser[0].email,
    role: updatedUser[0].role
  });

  // Test the new password
  const isValid = await bcrypt.compare(correctPassword, hashedPassword);
  console.log('✅ Password verification test:', isValid);
  
  await pool.end();
}

updateAdminPassword().catch(console.error);
