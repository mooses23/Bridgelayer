import { BaseRepository } from './base.repository';
import { firms, firmUsers, users } from '@shared/schema';
import type { InferModel } from 'drizzle-orm';
import { eq, ilike, and, isNull, SQL } from 'drizzle-orm';
import { db } from '../db';
import { NotFoundError } from '../utils/errors';

// Define the types for Firm
export type Firm = InferModel<typeof firms>;
export type InsertFirm = InferModel<typeof firms, 'insert'>;
export type UpdateFirm = Partial<Omit<InsertFirm, 'id'>>;

// Define the types for FirmUser
export type FirmUser = InferModel<typeof firmUsers>;
export type InsertFirmUser = InferModel<typeof firmUsers, 'insert'>;
export type UpdateFirmUser = Partial<Omit<InsertFirmUser, 'id'>>;

/**
 * Repository for Firm operations
 */
export class FirmRepository extends BaseRepository<Firm, InsertFirm, UpdateFirm> {
  constructor() {
    super('firms');
  }

  /**
   * Find a firm by subdomain
   */
  async findBySubdomain(subdomain: string): Promise<Firm | undefined> {
    const result = await db.select()
      .from(firms)
      .where(
        and(
          eq(firms.subdomain, subdomain.toLowerCase()),
          isNull(firms.deletedAt)
        )
      )
      .limit(1);
    
    return result[0];
  }

  /**
   * Find firms by name (partial match)
   */
  async searchByName(name: string): Promise<Firm[]> {
    return db.select()
      .from(firms)
      .where(
        and(
          ilike(firms.name, `%${name}%`),
          isNull(firms.deletedAt)
        )
      );
  }

  /**
   * Find firms by billing plan
   */
  async findByBillingPlan(plan: string): Promise<Firm[]> {
    return db.select()
      .from(firms)
      .where(
        and(
          eq(firms.billingPlan, plan),
          isNull(firms.deletedAt)
        )
      );
  }

  /**
   * Update firm settings
   */
  async updateFirmSettings(firmId: number, settings: any): Promise<Firm | undefined> {
    const [result] = await db.update(firms)
      .set({ 
        ...settings,
        updatedAt: new Date()
      })
      .where(eq(firms.id, firmId))
      .returning();
    
    return result;
  }
  
  /**
   * Soft delete a firm
   */
  async softDelete(firmId: number): Promise<boolean> {
    const result = await db.update(firms)
      .set({ deletedAt: new Date() })
      .where(eq(firms.id, firmId));
    
    return result.rowCount > 0;
  }
  
  /**
   * Get users belonging to a firm
   */
  async getFirmUsers(firmId: number): Promise<any[]> {
    const result = await db
      .select({
        id: firmUsers.id,
        firmId: firmUsers.firmId,
        userId: firmUsers.userId,
        isOwner: firmUsers.isOwner,
        role: firmUsers.role,
        createdAt: firmUsers.createdAt,
        updatedAt: firmUsers.updatedAt,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(firmUsers)
      .innerJoin(users, eq(firmUsers.userId, users.id))
      .where(
        and(
          eq(firmUsers.firmId, firmId),
          isNull(users.deletedAt)
        )
      );
      
    return result;
  }
  
  /**
   * Get a specific user in a firm
   */
  async getFirmUser(firmId: number, userId: number): Promise<FirmUser | undefined> {
    const result = await db.select()
      .from(firmUsers)
      .where(
        and(
          eq(firmUsers.firmId, firmId),
          eq(firmUsers.userId, userId)
        )
      )
      .limit(1);
      
    return result[0];
  }
  
  /**
   * Get owner users of a firm
   */
  async getFirmOwners(firmId: number): Promise<FirmUser[]> {
    return db.select()
      .from(firmUsers)
      .where(
        and(
          eq(firmUsers.firmId, firmId),
          eq(firmUsers.isOwner, true)
        )
      );
  }
  
  /**
   * Add a user to a firm
   */
  async addFirmUser(firmId: number, userId: number, options: { isOwner?: boolean, role?: string }): Promise<FirmUser> {
    const [result] = await db.insert(firmUsers)
      .values({
        firmId,
        userId,
        isOwner: options.isOwner || false,
        role: options.role || 'member',
        createdAt: new Date()
      })
      .returning();
      
    return result;
  }
  
  /**
   * Remove a user from a firm
   */
  async removeFirmUser(firmId: number, userId: number): Promise<boolean> {
    const result = await db.delete(firmUsers)
      .where(
        and(
          eq(firmUsers.firmId, firmId),
          eq(firmUsers.userId, userId)
        )
      );
      
    return result.rowCount > 0;
  }
  
  /**
   * Update a user's role in a firm
   */
  async updateFirmUser(firmId: number, userId: number, updateData: { isOwner?: boolean, role?: string }): Promise<FirmUser | undefined> {
    const [result] = await db.update(firmUsers)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(firmUsers.firmId, firmId),
          eq(firmUsers.userId, userId)
        )
      )
      .returning();
      
    return result;
  }
  
  /**
   * Get firms for a specific user
   */
  async getFirmsForUser(userId: number): Promise<any[]> {
    const result = await db
      .select({
        firmId: firmUsers.firmId,
        userId: firmUsers.userId,
        isOwner: firmUsers.isOwner,
        role: firmUsers.role,
        firmName: firms.name,
        firmSubdomain: firms.subdomain,
        billingPlan: firms.billingPlan,
        practiceAreas: firms.practiceAreas
      })
      .from(firmUsers)
      .innerJoin(firms, eq(firmUsers.firmId, firms.id))
      .where(
        and(
          eq(firmUsers.userId, userId),
          isNull(firms.deletedAt)
        )
      );
      
    return result;
  }
  
  /**
   * Find a firm by ID
   */
  async findById(id: number): Promise<Firm | undefined> {
    const firm = await db.select().from(firms).where(eq(firms.id, id)).limit(1);
    if (!firm[0]) {
      throw new NotFoundError(`Firm with ID ${id} not found`);
    }
    return firm[0];
  }

  /**
   * Find a firm by slug
   */
  async findBySlug(slug: string): Promise<Firm | undefined> {
    const firm = await db.select().from(firms).where(eq(firms.slug, slug)).limit(1);
    if (!firm[0]) {
      throw new NotFoundError(`Firm with slug ${slug} not found`);
    }
    return firm[0];
  }
}
