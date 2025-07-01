import { BaseRepository } from './base.repository';
import { users } from '@shared/schema';
import type { InferModel } from 'drizzle-orm';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '../db';
import { NotFoundError } from '../utils/errors';

// Define the types for User
export type User = InferModel<typeof users> & {
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  firstName?: string;
  lastName?: string;
};
export type InsertUser = InferModel<typeof users, 'insert'> & {
  firstName?: string;
  lastName?: string;
};
export type UpdateUser = Partial<Omit<InsertUser, 'id'>>;

/**
 * Repository for User operations
 */
export class UserRepository extends BaseRepository<User, InsertUser, UpdateUser> {
  constructor() {
    super('users');
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (!user[0]) {
      throw new NotFoundError(`User with email ${email} not found`);
    }

    return user[0];
  }

  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | undefined> {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (!user[0]) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user[0];
  }

  /**
   * Find a user by OAuth provider and ID
   */
  async findByOAuth(provider: string, oauthId: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(
        and(
          eq(users.oauthProvider, provider as any),
          eq(users.oauthId, oauthId),
          isNull(users.deletedAt)
        )
      )
      .limit(1);
    
    return result[0];
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: number): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    return db.select()
      .from(users)
      .where(
        and(
          eq(users.role, role as any),
          isNull(users.deletedAt)
        )
      );
  }

  /**
   * Soft delete a user
   */
  async softDelete(userId: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId));
    
    return result.rowCount > 0;
  }

  /**
   * Set password reset token for a user
   */
  async setPasswordResetToken(
    userId: number, 
    resetToken: string, 
    expiresAt: Date
  ): Promise<void> {
    await db.update(users)
      .set({ 
        resetToken,
        resetTokenExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Find a user by reset token
   */
  async findByResetToken(resetTokenHash: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, resetTokenHash),
          sql`${users.resetTokenExpiresAt} > NOW()`,
          isNull(users.deletedAt)
        )
      )
      .limit(1);
    
    return result[0];
  }

  /**
   * Update user's password and clear reset token
   */
  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await db.update(users)
      .set({ 
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
}
