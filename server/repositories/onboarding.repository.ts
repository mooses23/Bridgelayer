import { BaseRepository } from './base.repository';
import { onboardingProfiles } from '@shared/schema';
import type { InferModel } from 'drizzle-orm';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '../db';
import { NotFoundError } from '../utils/errors';

// Define the types for OnboardingProfile
export type OnboardingProfile = InferModel<typeof onboardingProfiles>;
export type InsertOnboardingProfile = InferModel<typeof onboardingProfiles, 'insert'>;
export type UpdateOnboardingProfile = Partial<Omit<InsertOnboardingProfile, 'id'>>;

/**
 * Repository for Onboarding operations
 */
export class OnboardingRepository extends BaseRepository<OnboardingProfile, InsertOnboardingProfile, UpdateOnboardingProfile> {
  constructor() {
    super('onboardingProfiles');
  }

  /**
   * Find an onboarding profile by code
   */
  async findByCode(code: string): Promise<OnboardingProfile | undefined> {
    const result = await db.select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.code, code))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find an onboarding profile by email
   */
  async findByEmail(email: string): Promise<OnboardingProfile | undefined> {
    const result = await db.select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.adminEmail, email))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find an onboarding profile by subdomain
   */
  async findBySubdomain(subdomain: string): Promise<OnboardingProfile | undefined> {
    const result = await db.select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.subdomain, subdomain))
      .limit(1);
    
    return result[0];
  }

  /**
   * Update onboarding progress
   */
  async updateProgress(id: number, step: number, data: any): Promise<OnboardingProfile | undefined> {
    const [result] = await db.update(onboardingProfiles)
      .set({ 
        currentStep: step,
        formData: data,
        updatedAt: new Date()
      })
      .where(eq(onboardingProfiles.id, id))
      .returning();
    
    return result;
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(id: number, firmId: number): Promise<OnboardingProfile | undefined> {
    const [result] = await db.update(onboardingProfiles)
      .set({ 
        status: 'completed',
        firmId, 
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(onboardingProfiles.id, id))
      .returning();
    
    return result;
  }

  /**
   * Find active onboarding sessions that haven't been completed
   */
  async findActiveSessions(): Promise<OnboardingProfile[]> {
    return db.select()
      .from(onboardingProfiles)
      .where(
        and(
          sql`${onboardingProfiles.status} = 'active'`,
          sql`${onboardingProfiles.expiresAt} > NOW()`
        )
      );
  }

  /**
   * Find expired onboarding sessions
   */
  async findExpiredSessions(): Promise<OnboardingProfile[]> {
    return db.select()
      .from(onboardingProfiles)
      .where(
        and(
          sql`${onboardingProfiles.status} = 'active'`,
          sql`${onboardingProfiles.expiresAt} < NOW()`
        )
      );
  }

  /**
   * Get onboarding statistics
   */
  async getStatistics(): Promise<{
    totalSessions: number;
    completedSessions: number;
    activeSessions: number;
    abandonedSessions: number;
  }> {
    const totalSessions = await db.select({ count: sql`count(*)` })
      .from(onboardingProfiles)
      .then(result => Number(result[0].count));
    
    const completedSessions = await db.select({ count: sql`count(*)` })
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.status, 'completed'))
      .then(result => Number(result[0].count));
    
    const activeSessions = await db.select({ count: sql`count(*)` })
      .from(onboardingProfiles)
      .where(
        and(
          sql`${onboardingProfiles.status} = 'active'`,
          sql`${onboardingProfiles.expiresAt} > NOW()`
        )
      )
      .then(result => Number(result[0].count));
    
    const abandonedSessions = await db.select({ count: sql`count(*)` })
      .from(onboardingProfiles)
      .where(
        and(
          sql`${onboardingProfiles.status} = 'active'`,
          sql`${onboardingProfiles.expiresAt} < NOW()`
        )
      )
      .then(result => Number(result[0].count));
    
    return {
      totalSessions,
      completedSessions,
      activeSessions,
      abandonedSessions
    };
  }

  /**
   * Update onboarding status for a firm
   */
  async updateOnboardingStatus(firmId: number, status: boolean): Promise<void> {
    const result = await db.update(firms).set({ onboarded: status }).where(eq(firms.id, firmId));
    if (result.rowCount === 0) {
      throw new NotFoundError(`Firm with ID ${firmId} not found for onboarding status update`);
    }
  }

  /**
   * Get onboarding status for a firm
   */
  async getOnboardingStatus(firmId: number): Promise<boolean> {
    const firm = await db.select().from(firms).where(eq(firms.id, firmId)).limit(1);
    if (!firm[0]) {
      throw new NotFoundError(`Firm with ID ${firmId} not found`);
    }
    return firm[0].onboarded;
  }
}
