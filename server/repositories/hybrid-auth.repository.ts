import { BaseRepository } from './base.repository';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../db';
import { users, refreshTokens } from '@shared/schema';
import type { InferModel } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { NotFoundError } from '../utils/errors';

// Define the types for HybridAuth
export type RefreshToken = InferModel<typeof refreshTokens>;
export type User = InferModel<typeof users>;

/**
 * Repository for Hybrid Authentication operations
 */
export class HybridAuthRepository {
  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find user by ID
   */
  async findUserById(id: number): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find user by OAuth provider
   */
  async findUserByOAuth(provider: string, oauthId: string): Promise<User | undefined> {
    const user = await db.select()
      .from(users)
      .where(
        and(
          eq(users.oauthProvider, provider),
          eq(users.oauthId, oauthId)
        )
      )
      .limit(1);
    
    if (!user[0]) {
      throw new NotFoundError(`User with OAuth provider ${provider} and ID ${oauthId} not found`);
    }
    
    return user[0];
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId: number, hashedToken: string, expiresAt: Date): Promise<RefreshToken> {
    const [token] = await db.insert(refreshTokens)
      .values({
        userId,
        token: hashedToken,
        expiresAt,
        createdAt: new Date()
      })
      .returning();
    
    return token;
  }

  /**
   * Find refresh token
   */
  async findRefreshToken(refreshToken: string): Promise<RefreshToken | undefined> {
    // Get all non-revoked tokens
    const tokens = await db.select()
      .from(refreshTokens)
      .where(
        and(
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date())
        )
      );

    // Compare hashed tokens
    for (const token of tokens) {
      try {
        if (await bcrypt.compare(refreshToken, token.token)) {
          return token;
        }
      } catch (error) {
        console.error('Token comparison error:', error);
      }
    }
    
    return undefined;
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(tokenId: number): Promise<boolean> {
    const [token] = await db.update(refreshTokens)
      .set({
        revokedAt: new Date()
      })
      .where(eq(refreshTokens.id, tokenId))
      .returning();
    
    return !!token;
  }

  /**
   * Revoke all refresh tokens for user
   */
  async revokeAllUserTokens(userId: number): Promise<number> {
    const result = await db.update(refreshTokens)
      .set({
        revokedAt: new Date()
      })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt)
        )
      );
    
    return result.rowCount || 0;
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(userId: number): Promise<void> {
    await db.update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Create user from OAuth
   */
  async createOAuthUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    oauthProvider: string;
    oauthId: string;
    role?: string;
  }): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        oauthProvider: data.oauthProvider,
        oauthId: data.oauthId,
        role: data.role || 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return user;
  }
}
