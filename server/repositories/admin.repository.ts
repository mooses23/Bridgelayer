import { BaseRepository } from './base.repository';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { users, firms, ghostSessions } from '@shared/schema';
import type { InferModel } from 'drizzle-orm';
import { NotFoundError } from '../utils/errors';

// Define the types for GhostSession
export type GhostSession = InferModel<typeof ghostSessions>;
export type InsertGhostSession = InferModel<typeof ghostSessions, 'insert'>;
export type UpdateGhostSession = Partial<Omit<InsertGhostSession, 'id'>>;

/**
 * Repository for Admin operations
 */
export class AdminRepository extends BaseRepository<GhostSession, InsertGhostSession, UpdateGhostSession> {
  constructor() {
    super('ghostSessions');
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(tenantId?: string): Promise<any[]> {
    const query = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(
      sql`${users.role} IN ('admin', 'platform_admin', 'super_admin')`
    );
    
    return query;
  }

  /**
   * Verify admin access to tenant
   */
  async verifyAdminTenantAccess(adminId: number, tenantId: string): Promise<boolean> {
    // Super admins and platform admins can access any tenant
    const adminUser = await db.select()
      .from(users)
      .where(eq(users.id, adminId))
      .limit(1);

    if (adminUser.length === 0) {
      return false;
    }

    if (['super_admin', 'platform_admin'].includes(adminUser[0].role)) {
      return true;
    }

    // Firm admins can only access their own firm
    if (adminUser[0].role === 'admin' && adminUser[0].firmId) {
      const firm = await db.select()
        .from(firms)
        .where(eq(firms.id, adminUser[0].firmId))
        .limit(1);

      return firm.length > 0 && firm[0].subdomain === tenantId;
    }

    return false;
  }

  /**
   * Create a ghost mode session
   */
  async createGhostSession(adminId: number, firmId: number, purpose: string, notes?: string): Promise<GhostSession> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    const [session] = await db.insert(ghostSessions)
      .values({
        adminUserId: adminId,
        targetFirmId: firmId,
        sessionToken,
        isActive: true,
        purpose,
        notes,
        startedAt: new Date(),
        ipAddress: null,
        userAgent: null
      })
      .returning();
      
    return session;
  }

  /**
   * End a ghost mode session
   */
  async endGhostSession(sessionToken: string): Promise<GhostSession | undefined> {
    const [session] = await db.update(ghostSessions)
      .set({
        isActive: false,
        endedAt: new Date()
      })
      .where(eq(ghostSessions.sessionToken, sessionToken))
      .returning();
      
    return session;
  }

  /**
   * Get all active ghost sessions
   */
  async getActiveGhostSessions(adminId?: number): Promise<GhostSession[]> {
    const query = db.select()
      .from(ghostSessions)
      .where(
        and(
          eq(ghostSessions.isActive, true),
          adminId ? eq(ghostSessions.adminUserId, adminId) : undefined
        )
      )
      .orderBy(desc(ghostSessions.startedAt));
      
    return query;
  }
  
  /**
   * Get ghost session by token
   */
  async getGhostSessionByToken(sessionToken: string): Promise<GhostSession | undefined> {
    const sessions = await db.select()
      .from(ghostSessions)
      .where(eq(ghostSessions.sessionToken, sessionToken))
      .limit(1);
      
    return sessions[0];
  }
  
  /**
   * Get system statistics for admin dashboard
   */
  async getSystemStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql`count(*)` })
      .from(users)
      .then(res => Number(res[0].count));
      
    const totalFirms = await db.select({ count: sql`count(*)` })
      .from(firms)
      .then(res => Number(res[0].count));
      
    const activeFirms = await db.select({ count: sql`count(*)` })
      .from(firms)
      .where(eq(firms.status, 'active'))
      .then(res => Number(res[0].count));
    
    return {
      totalUsers,
      totalFirms,
      activeFirms,
      timestamp: new Date()
    };
  }

  /**
   * Find admin by email
   */
  async findAdminByEmail(email: string): Promise<User | undefined> {
    const admin = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!admin[0]) {
      throw new NotFoundError(`Admin with email ${email} not found`);
    }
    return admin[0];
  }
}
