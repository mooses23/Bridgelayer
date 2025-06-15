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

    // Create test firms
    const testFirm = await storage.createFirm({
      name: "Test Legal Firm",
      slug: "test-legal-firm",
      plan: "professional",
      status: "active",
      onboarded: true
    });

    const legalEdgeFirm = await storage.createFirm({
      name: "LegalEdge Partners",
      slug: "legaledge-partners",
      plan: "enterprise",
      status: "active",
      onboarded: false
    });

    // Create test users with hashed passwords (using "password" for all demo accounts)
    const passwordHash = await bcrypt.hash("password", 10);

    // System admin user (no firm association)
    const adminUser = await storage.createUser({
      email: "admin@firmsync.com",
      passwordHash: passwordHash,
      firstName: "System",
      lastName: "Admin",
      role: "admin",
      status: "active"
    });

    // Firm owner for Test Legal Firm
    const ownerUser = await storage.createUser({
      email: "owner@testfirm.com",
      passwordHash: passwordHash,
      firstName: "John",
      lastName: "Owner",
      role: "firm_admin",
      firmId: testFirm.id,
      status: "active"
    });

    // Staff user for LegalEdge Partners
    const staffUser = await storage.createUser({
      email: "staff@legaledge.com",
      passwordHash: passwordHash,
      firstName: "Jane",
      lastName: "Paralegal",
      role: "paralegal",
      firmId: legalEdgeFirm.id,
      status: "active"
    });

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