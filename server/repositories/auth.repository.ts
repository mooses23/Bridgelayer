import { db } from '../db';
import { eq } from 'drizzle-orm';
import { refreshTokens } from '../schema';
import { NotFoundError } from '../utils/errors';

export type RefreshToken = {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
};

export class AuthRepository {
  async findRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const refreshToken = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1);
    if (!refreshToken[0]) {
      throw new NotFoundError(`Refresh token ${token} not found`);
    }
    return refreshToken[0];
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const result = await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    if (result.rowCount === 0) {
      throw new NotFoundError(`Refresh token ${token} not found for deletion`);
    }
  }

  // ...existing methods...
}