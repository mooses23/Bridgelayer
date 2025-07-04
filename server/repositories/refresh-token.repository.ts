import { BaseRepository } from './base.repository';
import { refreshTokens } from '@shared/schema';
import type { InferModel } from 'drizzle-orm';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { db } from '../db';

// Define the types for RefreshToken
export type RefreshToken = InferModel<typeof refreshTokens>;
export type InsertRefreshToken = InferModel<typeof refreshTokens, 'insert'>;
export type UpdateRefreshToken = Partial<Omit<InsertRefreshToken, 'id'>>;

/**
 * Repository for RefreshToken operations
 */
export class RefreshTokenRepository extends BaseRepository<RefreshToken, InsertRefreshToken, UpdateRefreshToken> {
  constructor() {
    super('refreshTokens');
  }

  /**
   * Find a token by its value
   */
  async findByToken(token: string): Promise<RefreshToken | undefined> {
    const result = await db.select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          isNull(refreshTokens.revokedAt)
        )
      )
      .limit(1);
    
    return result[0];
  }

  /**
   * Find tokens for a user
   */
  async findByUserId(userId: number): Promise<RefreshToken[]> {
    return db.select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt)
        )
      );
  }

  /**
   * Revoke a specific token
   */
  async revokeToken(token: string): Promise<boolean> {
    const result = await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));
    
    return result.rowCount > 0;
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: number): Promise<number> {
    const result = await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt)
        )
      );
    
    return result.rowCount;
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date();
    const result = await db.delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, now));
    
    return result.rowCount;
  }
}
