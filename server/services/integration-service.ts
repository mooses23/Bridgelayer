import { db } from "../db";
import { 
  platformIntegrations, 
  firmIntegrations, 
  userIntegrationPermissions,
  integrationAuditLogs,
  integrationRateLimits,
  type InsertPlatformIntegration,
  type InsertFirmIntegration,
  type InsertUserIntegrationPermission,
  type InsertIntegrationAuditLog,
  type InsertIntegrationRateLimit,
  type PlatformIntegration,
  type FirmIntegration,
  type UserIntegrationPermission
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class IntegrationService {
  
  // Platform Level Integration Management (Admin Only)
  async createPlatformIntegration(data: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const [integration] = await db
      .insert(platformIntegrations)
      .values(data)
      .returning();
    return integration;
  }

  async getAllPlatformIntegrations(): Promise<PlatformIntegration[]> {
    return await db
      .select()
      .from(platformIntegrations)
      .orderBy(desc(platformIntegrations.createdAt));
  }

  async updatePlatformIntegration(id: number, updates: Partial<InsertPlatformIntegration>): Promise<PlatformIntegration> {
    const [integration] = await db
      .update(platformIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(platformIntegrations.id, id))
      .returning();
    return integration;
  }

  // Firm Level Integration Management (One API Key Per App)
  async enableFirmIntegration(data: InsertFirmIntegration & { apiKey?: string }): Promise<FirmIntegration> {
    // Store API key at firm level for the integration (except OpenAI which is per-user)
    const integrationData = {
      ...data,
      // Store API credentials at firm level for shared integrations
      apiCredentials: data.apiKey ? { apiKey: data.apiKey } : null
    };

    const [integration] = await db
      .insert(firmIntegrations)
      .values(integrationData)
      .returning();
    
    // Log the enablement
    await this.logIntegrationAction({
      firmId: data.firmId,
      integrationId: data.integrationId,
      userId: data.enabledBy,
      action: 'enabled',
      details: { 
        status: data.status,
        hasApiKey: !!data.apiKey
      }
    });

    return integration;
  }

  async getFirmIntegrations(firmId: number): Promise<FirmIntegration[]> {
    return await db
      .select()
      .from(firmIntegrations)
      .where(eq(firmIntegrations.firmId, firmId))
      .orderBy(desc(firmIntegrations.createdAt));
  }

  async updateFirmIntegration(firmId: number, integrationId: number, updates: Partial<InsertFirmIntegration>): Promise<FirmIntegration> {
    const [integration] = await db
      .update(firmIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(firmIntegrations.firmId, firmId),
        eq(firmIntegrations.integrationId, integrationId)
      ))
      .returning();
    
    // Log the update
    if (updates.status) {
      await this.logIntegrationAction({
        firmId,
        integrationId,
        userId: updates.enabledBy || 0,
        action: 'status_changed',
        details: { newStatus: updates.status }
      });
    }

    return integration;
  }

  async disableFirmIntegration(firmId: number, integrationId: number, disabledBy: number): Promise<void> {
    await db
      .update(firmIntegrations)
      .set({ 
        status: 'disabled',
        updatedAt: new Date()
      })
      .where(and(
        eq(firmIntegrations.firmId, firmId),
        eq(firmIntegrations.integrationId, integrationId)
      ));

    // Log the disablement
    await this.logIntegrationAction({
      firmId,
      integrationId,
      userId: disabledBy,
      action: 'disabled',
      details: {}
    });
  }

  // User Level Integration Access Management
  async grantUserIntegrationAccess(data: InsertUserIntegrationPermission): Promise<UserIntegrationPermission> {
    const [permission] = await db
      .insert(userIntegrationPermissions)
      .values(data)
      .returning();
    
    // Log the access grant
    await this.logIntegrationAction({
      firmId: data.firmId,
      integrationId: data.integrationId,
      userId: data.grantedBy,
      action: 'user_access_granted',
      details: { 
        targetUserId: data.userId,
        permissions: data.permissions
      }
    });

    return permission;
  }

  async getUserIntegrationPermissions(userId: number, firmId: number): Promise<UserIntegrationPermission[]> {
    return await db
      .select()
      .from(userIntegrationPermissions)
      .where(and(
        eq(userIntegrationPermissions.userId, userId),
        eq(userIntegrationPermissions.firmId, firmId)
      ));
  }

  async revokeUserIntegrationAccess(userId: number, firmId: number, integrationId: number, revokedBy: number): Promise<void> {
    await db
      .delete(userIntegrationPermissions)
      .where(and(
        eq(userIntegrationPermissions.userId, userId),
        eq(userIntegrationPermissions.firmId, firmId),
        eq(userIntegrationPermissions.integrationId, integrationId)
      ));

    // Log the access revocation
    await this.logIntegrationAction({
      firmId,
      integrationId,
      userId: revokedBy,
      action: 'user_access_revoked',
      details: { targetUserId: userId }
    });
  }

  // Integration Authorization Check
  async checkUserIntegrationAccess(userId: number, firmId: number, integrationId: number): Promise<boolean> {
    // Check if firm has the integration enabled
    const firmIntegration = await db
      .select()
      .from(firmIntegrations)
      .where(and(
        eq(firmIntegrations.firmId, firmId),
        eq(firmIntegrations.integrationId, integrationId),
        eq(firmIntegrations.status, 'active')
      ))
      .limit(1);

    if (firmIntegration.length === 0) {
      return false;
    }

    // Check if user has permission
    const userPermission = await db
      .select()
      .from(userIntegrationPermissions)
      .where(and(
        eq(userIntegrationPermissions.userId, userId),
        eq(userIntegrationPermissions.firmId, firmId),
        eq(userIntegrationPermissions.integrationId, integrationId)
      ))
      .limit(1);

    return userPermission.length > 0;
  }

  // Rate Limiting
  async createRateLimit(data: InsertIntegrationRateLimit): Promise<void> {
    await db
      .insert(integrationRateLimits)
      .values(data);
  }

  async checkRateLimit(firmId: number, integrationId: number): Promise<boolean> {
    const rateLimit = await db
      .select()
      .from(integrationRateLimits)
      .where(and(
        eq(integrationRateLimits.firmId, firmId),
        eq(integrationRateLimits.integrationId, integrationId)
      ))
      .limit(1);

    if (rateLimit.length === 0) {
      return true; // No rate limit set
    }

    const limit = rateLimit[0];
    const now = new Date();
    const windowStart = new Date(now.getTime() - (limit.windowMinutes * 60 * 1000));

    // Check if within rate limit (simplified - in production use Redis)
    return limit.currentCount < limit.maxRequests;
  }

  // Audit Logging
  private async logIntegrationAction(data: Omit<InsertIntegrationAuditLog, 'id' | 'createdAt'>): Promise<void> {
    await db
      .insert(integrationAuditLogs)
      .values({
        ...data,
        createdAt: new Date()
      });
  }

  async getIntegrationAuditLogs(firmId: number, integrationId?: number): Promise<any[]> {
    const query = db
      .select()
      .from(integrationAuditLogs)
      .where(eq(integrationAuditLogs.firmId, firmId))
      .orderBy(desc(integrationAuditLogs.createdAt));

    if (integrationId) {
      query.where(and(
        eq(integrationAuditLogs.firmId, firmId),
        eq(integrationAuditLogs.integrationId, integrationId)
      ));
    }

    return await query;
  }

  // Complete Integration Dashboard Data
  async getIntegrationDashboardData(firmId: number): Promise<{
    availableIntegrations: PlatformIntegration[];
    enabledIntegrations: FirmIntegration[];
    userPermissions: UserIntegrationPermission[];
    recentActivity: any[];
  }> {
    const [availableIntegrations, enabledIntegrations, userPermissions, recentActivity] = await Promise.all([
      this.getAllPlatformIntegrations(),
      this.getFirmIntegrations(firmId),
      db.select().from(userIntegrationPermissions).where(eq(userIntegrationPermissions.firmId, firmId)),
      this.getIntegrationAuditLogs(firmId)
    ]);

    return {
      availableIntegrations,
      enabledIntegrations,
      userPermissions,
      recentActivity: recentActivity.slice(0, 10) // Last 10 activities
    };
  }
}

export const integrationService = new IntegrationService();