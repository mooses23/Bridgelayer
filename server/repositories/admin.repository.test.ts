import { AdminRepository } from './admin.repository';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('AdminRepository', () => {
  const adminRepository = new AdminRepository();

  beforeAll(async () => {
    await db.insert(users).values({
      id: 3,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      firmId: null
    });
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, 3));
  });

  it('should find an admin user by email', async () => {
    const admin = await adminRepository.findAdminByEmail('admin@example.com');
    expect(admin).toBeDefined();
    expect(admin?.email).toBe('admin@example.com');
  });

  it('should return undefined for non-existent admin', async () => {
    const admin = await adminRepository.findAdminByEmail('nonexistent@example.com');
    expect(admin).toBeUndefined();
  });
});
