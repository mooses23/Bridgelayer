import { db } from './db';
import { users, firms } from '../shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function seedAuthData() {
  try {
    // Check if any firms exist - if so, skip seeding
    const existingFirms = await db.select().from(firms).limit(1);
    if (existingFirms.length > 0) {
      console.log('⏭️ Firms already exist, skipping auth data seeding');
      return false;
    }

    console.log('🌱 Seeding authentication data...');

    // Create Superadmin User
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      id: 'admin_1',
      email: 'admin@firmsync.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      firmId: null
    });

    // Create Dummy Firm A (Needs Onboarding)
    const [firmA] = await db.insert(firms).values({
      id: 'test_firm_1',
      name: 'Test & Co LLP',
      onboarded: false,
      jurisdiction: 'NJ',
      billingEnabled: true,
      ownerEmail: 'owner@testfirm.com'
    }).returning();

    // Create Firm A Owner
    const ownerPasswordHash = await bcrypt.hash('test123', 10);
    await db.insert(users).values({
      id: 'user_1',
      email: 'owner@testfirm.com',
      passwordHash: ownerPasswordHash,
      firstName: 'Test',
      lastName: 'Owner',
      role: 'firm_owner',
      firmId: firmA.id
    });

    // Create Dummy Firm B (Fully Onboarded)
    const [firmB] = await db.insert(firms).values({
      id: 'firm_b_2',
      name: 'LegalEdge PC',
      onboarded: true,
      jurisdiction: 'NY',
      billingEnabled: false,
      ownerEmail: 'staff@legaledge.com'
    }).returning();

    // Create Firm B User
    const staffPasswordHash = await bcrypt.hash('staff123', 10);
    await db.insert(users).values({
      id: 'user_2',
      email: 'staff@legaledge.com',
      passwordHash: staffPasswordHash,
      firstName: 'Legal',
      lastName: 'Staff',
      role: 'firm_user',
      firmId: firmB.id
    });

    console.log('✅ Dummy firms created');
    console.log('🔑 Use /login to test as:');
    console.log('   • admin@firmsync.com / admin123 (Superadmin)');
    console.log('   • owner@testfirm.com / test123 (Firm Owner - needs onboarding)');
    console.log('   • staff@legaledge.com / staff123 (Firm User - onboarded)');

    return true;
  } catch (error) {
    console.error('❌ Error seeding auth data:', error);
    throw error;
  }
}