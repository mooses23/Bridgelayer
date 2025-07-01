import { AuthRepository } from './auth.repository';
import { db } from '../db';
import { refreshTokens } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('AuthRepository', () => {
  const authRepository = new AuthRepository();

  beforeAll(async () => {
    await db.insert(refreshTokens).values({
      id: 1,
      userId: 1,
      token: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });
  });

  afterAll(async () => {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, 1));
  });

  it('should find a refresh token by token', async () => {
    const token = await authRepository.findRefreshToken('test-refresh-token');
    expect(token).toBeDefined();
    expect(token?.token).toBe('test-refresh-token');
  });

  it('should return undefined for non-existent token', async () => {
    const token = await authRepository.findRefreshToken('nonexistent-token');
    expect(token).toBeUndefined();
  });

  it('should delete a refresh token', async () => {
    await authRepository.deleteRefreshToken('test-refresh-token');
    const token = await authRepository.findRefreshToken('test-refresh-token');
    expect(token).toBeUndefined();
  });
});
