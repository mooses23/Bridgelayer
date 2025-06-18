import bcrypt from "bcrypt";
import { storage } from "./storage";

export async function seedAuthData() {
  try {
    console.log("Checking authentication data...");

    // Check if data already exists
    const existingAdmin = await storage.getUserByEmail("admin@firmsync.com");
    if (existingAdmin) {
      console.log("Authentication data already exists, skipping seeding");
      return;
    }

    console.log("Seeding authentication data...");

    // Get or create test firms
    let testFirm = await storage.getFirmBySlug("test-legal-firm");
    if (!testFirm) {
      testFirm = await storage.createFirm({
        name: "Test Legal Firm",
        slug: "test-legal-firm",
        plan: "professional",
        status: "active",
        onboarded: true
      });
    }

    let legalEdgeFirm = await storage.getFirmBySlug("legaledge-partners");
    if (!legalEdgeFirm) {
      legalEdgeFirm = await storage.createFirm({
        name: "LegalEdge Partners",
        slug: "legaledge-partners",
        plan: "enterprise",
        status: "active",
        onboarded: false
      });
    }

    // Create Replit demo firm that matches current subdomain
    let replitDemoFirm = await storage.getFirmBySlug("6da4d5f1-ea5d-4edf-a396-c2c16e58af64-00-2hm05yfgpvj33");
    if (!replitDemoFirm) {
      replitDemoFirm = await storage.createFirm({
        name: "Demo Legal Firm",
        slug: "6da4d5f1-ea5d-4edf-a396-c2c16e58af64-00-2hm05yfgpvj33",
        plan: "professional",
        status: "active",
        onboarded: false // Not onboarded so we can test onboarding flow
      });
    }

    // Create test users with hashed passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const ownerPassword = await bcrypt.hash("test123", 10);
    const staffPassword = await bcrypt.hash("staff123", 10);

    // System admin user (no firm association)
    const adminUser = await storage.createUser({
      email: "admin@firmsync.com",
      password: adminPassword,
      firstName: "System",
      lastName: "Admin",
      role: "admin",
      status: "active"
    });

    // Firm owner for Test Legal Firm
    const ownerUser = await storage.createUser({
      email: "owner@testfirm.com",
      password: ownerPassword,
      firstName: "John",
      lastName: "Owner",
      role: "firm_admin",
      firmId: testFirm.id,
      status: "active"
    });

    // Staff user for LegalEdge Partners
    const staffUser = await storage.createUser({
      email: "staff@legaledge.com",
      password: staffPassword,
      firstName: "Jane",
      lastName: "Paralegal",
      role: "paralegal",
      firmId: legalEdgeFirm.id,
      status: "active"
    });

    // Demo user for Replit demo firm
    const demoPassword = await bcrypt.hash("demo123", 10);
    const demoUser = await storage.createUser({
      email: "demo@demo.com",
      password: demoPassword,
      firstName: "Demo",
      lastName: "User",
      role: "firm_admin",
      firmId: replitDemoFirm.id,
      status: "active"
    });

    console.log("✅ Seeded users with hashed passwords");
    console.log("Authentication data seeded successfully!");
    console.log(`Created firms: ${testFirm.id} (${testFirm.name}), ${legalEdgeFirm.id} (${legalEdgeFirm.name})`);
    console.log(`Created users: ${adminUser.id} (admin), ${ownerUser.id} (owner), ${staffUser.id} (staff)`);
    
    return {
      firms: [testFirm, legalEdgeFirm],
      users: [adminUser, ownerUser, staffUser]
    };
  } catch (error) {
    console.error("Error seeding authentication data:", error);
    throw error;
  }
}