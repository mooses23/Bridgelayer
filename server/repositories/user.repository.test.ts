import { UserRepository } from './user.repository';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('UserRepository', () => {
  const userRepository = new UserRepository();

  beforeAll(async () => {
    await db.insert(users).values({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      firmId: 1
    });
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, 1));
  });

  it('should find a user by email', async () => {
    const user = await userRepository.findByEmail('test@example.com');
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
  });

  it('should find a user by ID', async () => {
    const user = await userRepository.findById(1);
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
  });

  it('should return undefined for non-existent user', async () => {
    const user = await userRepository.findByEmail('nonexistent@example.com');
    expect(user).toBeUndefined();
  });
});
