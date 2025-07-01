import { HybridAuthRepository } from './hybrid-auth.repository';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('HybridAuthRepository', () => {
  const hybridAuthRepository = new HybridAuthRepository();

  beforeAll(async () => {
    await db.insert(users).values({
      id: 4,
      email: 'hybrid@example.com',
      firstName: 'Hybrid',
      lastName: 'User',
      role: 'user',
      oauthProvider: 'google',
      oauthId: 'google-oauth-id',
      firmId: null
    });
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, 4));
  });

  it('should find a user by OAuth provider and ID', async () => {
    const user = await hybridAuthRepository.findUserByOAuth('google', 'google-oauth-id');
    expect(user).toBeDefined();
    expect(user?.email).toBe('hybrid@example.com');
  });

  it('should return undefined for non-existent OAuth user', async () => {
    const user = await hybridAuthRepository.findUserByOAuth('google', 'nonexistent-oauth-id');
    expect(user).toBeUndefined();
  });
});
