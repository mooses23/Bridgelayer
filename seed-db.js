import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema.js";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function seed() {
  try {
    // Create default user
    const [user] = await db.insert(schema.users).values({
      username: "demo_user",
      email: "demo@firmsync.com",
    }).returning();
    
    console.log("Created user:", user);

    // Create default analysis features
    const [features] = await db.insert(schema.analysisFeatures).values({
      userId: user.id,
      summarization: true,
      riskAnalysis: true,
      clauseExtraction: true,
      crossReference: false,
      formatting: true,
    }).returning();
    
    console.log("Created features:", features);
    console.log("Database seeded successfully!");
    
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
