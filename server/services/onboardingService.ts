import { db } from '../db';
import { onboardingCodes } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { OnboardingCode } from '@shared/types/auth-types';

export class OnboardingService {
  /**
   * Validate an onboarding code
   */
  static async validateCode(code: string): Promise<OnboardingCode | null> {
    const [codeRecord] = await db
      .select()
      .from(onboardingCodes)
      .where(eq(onboardingCodes.code, code))
      .limit(1);

    if (!codeRecord) {
      return null;
    }

    // Convert database record to OnboardingCode type
    return {
      id: codeRecord.id.toString(),
      code: codeRecord.code,
      firmId: codeRecord.firmId,
      type: codeRecord.type as 'setup' | 'invite' | 'recovery',
      email: codeRecord.email,
      createdAt: codeRecord.createdAt,
      expiresAt: codeRecord.expiresAt,
      usedAt: codeRecord.usedAt || undefined,
      status: codeRecord.status as 'active' | 'used' | 'expired'
    };
  }

  /**
   * Mark an onboarding code as used
   */
  static async markCodeAsUsed(code: string): Promise<void> {
    await db
      .update(onboardingCodes)
      .set({ 
        status: 'used',
        usedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(onboardingCodes.code, code));
  }

  /**
   * Create a new onboarding code
   */
  static async createCode(params: {
    firmId: number;
    email: string;
    type: 'setup' | 'invite' | 'recovery';
    expiresIn?: number;
  }): Promise<OnboardingCode> {
    const { firmId, email, type, expiresIn = 7 * 24 * 60 * 60 * 1000 } = params; // Default 7 days
    
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + expiresIn);

    const [codeRecord] = await db
      .insert(onboardingCodes)
      .values({
        code,
        firmId,
        email,
        type,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt
      })
      .returning();

    return {
      id: codeRecord.id.toString(),
      code: codeRecord.code,
      firmId: codeRecord.firmId,
      type: codeRecord.type as 'setup' | 'invite' | 'recovery',
      email: codeRecord.email,
      createdAt: codeRecord.createdAt,
      expiresAt: codeRecord.expiresAt,
      status: codeRecord.status as 'active' | 'used' | 'expired'
    };
  }

  /**
   * Generate a random 8-character code
   */
  private static generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
