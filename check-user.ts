import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { users } from "./shared/schema.ts";
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function checkUser() {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema: { users } });

  const user = await db.select().from(users).where(eq(users.email, 'admin@firmsync.com')).limit(1);
  console.log('Admin user found:', user);
  
  if (user.length > 0) {
    console.log('User details:', {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
      hasPassword: !!user[0].password,
      passwordLength: user[0].password?.length
    });
  }
  
  await pool.end();
}

checkUser().catch(console.error);
