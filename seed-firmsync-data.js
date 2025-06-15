import { db } from "./server/db.ts";
import { clients, clientIntakes } from "./shared/schema.ts";

async function seedFirmSyncData() {
  try {
    console.log("🌱 Seeding FirmSync demo data...");
    
    const DEMO_FIRM_ID = 1;
    
    // Add demo clients
    const clientsData = [
      {
        firmId: DEMO_FIRM_ID,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "(555) 123-4567",
        status: "active",
        address: "123 Main St, Los Angeles, CA 90210",
        notes: "Landlord-tenant dispute case",
        createdBy: 1
      },
      {
        firmId: DEMO_FIRM_ID,
        name: "Michael Chen",
        email: "m.chen@company.com",
        phone: "(555) 987-6543",
        status: "active",
        address: "456 Business Ave, Orange County, CA 92602",
        notes: "Employment law consultation",
        createdBy: 1
      },
      {
        firmId: DEMO_FIRM_ID,
        name: "Emma Rodriguez",
        email: "emma.rodriguez@gmail.com",
        phone: "(555) 555-0123",
        status: "prospective",
        address: "789 Residential Blvd, Riverside, CA 92501",
        notes: "Personal injury case inquiry",
        createdBy: 1
      }
    ];

    const insertedClients = await db.insert(clients).values(clientsData).returning();
    console.log(`✅ Inserted ${insertedClients.length} demo clients`);

    // Add demo client intakes
    const intakesData = [
      {
        firmId: DEMO_FIRM_ID,
        intakeNumber: "INT-240001",
        clientName: "Sarah Johnson",
        clientEmail: "sarah.johnson@email.com",
        clientPhone: "(555) 123-4567",
        region: "Los Angeles County",
        matterType: "Eviction",
        caseType: "landlord-tenant",
        urgencyLevel: "high",
        caseDescription: "Landlord is attempting to evict without proper 30-day notice. Tenant has been current on rent payments but received eviction notice citing lease violations that tenant disputes.",
        preferredContactMethod: "email",
        status: "received"
      },
      {
        firmId: DEMO_FIRM_ID,
        intakeNumber: "INT-240002",
        clientName: "Michael Chen",
        clientEmail: "m.chen@company.com",
        clientPhone: "(555) 987-6543",
        region: "Orange County",
        matterType: "Employment Law",
        caseType: "employment",
        urgencyLevel: "medium",
        caseDescription: "Employee believes they were wrongfully terminated due to requesting accommodations for disability. Company claims termination was for performance issues.",
        preferredContactMethod: "phone",
        status: "received"
      },
      {
        firmId: DEMO_FIRM_ID,
        intakeNumber: "INT-240003",
        clientName: "Emma Rodriguez",
        clientEmail: "emma.rodriguez@gmail.com",
        clientPhone: "(555) 555-0123",
        region: "Riverside County",
        matterType: "Personal Injury",
        caseType: "personal-injury",
        urgencyLevel: "medium",
        caseDescription: "Car accident at intersection. Client sustained neck and back injuries. Other driver ran red light according to witness statements.",
        preferredContactMethod: "email",
        status: "received"
      }
    ];

    const insertedIntakes = await db.insert(clientIntakes).values(intakesData).returning();
    console.log(`✅ Inserted ${insertedIntakes.length} demo client intakes`);

    console.log("🎉 FirmSync demo data seeding completed successfully!");
    console.log("\nDemo data includes:");
    console.log("- 3 demo clients (active and prospective)");
    console.log("- 3 client intake forms covering different matter types");
    console.log("- Multi-tenant isolation (all scoped to firmId: 1)");
    
  } catch (error) {
    console.error("❌ Error seeding FirmSync data:", error);
    throw error;
  }
}

// Run the seeding function
seedFirmSyncData()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });