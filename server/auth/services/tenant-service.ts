import { storage } from '../../storage';

/**
 * Tenant Service for Multi-Tenant Data Isolation
 * Handles tenant context, permissions, and data filtering
 */
export class TenantService {
  /**
   * Get tenant context for a user
   */
  static async getTenantContext(userId: number, tenantId: string): Promise<any | null> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;

      const firm = await storage.getFirmBySlug(tenantId);
      if (!firm) return null;

      // Check if user belongs to this tenant
      if (user.firmId !== firm.id && !['platform_admin', 'super_admin'].includes(user.role)) {
        return null;
      }

      return {
        tenantId: firm.slug,
        firmId: firm.id,
        firmName: firm.name,
        userRole: user.role,
        permissions: this.getUserPermissions(user.role),
        settings: firm.settings
      };
    } catch (error) {
      console.error('Error getting tenant context:', error);
      return null;
    }
  }

  /**
   * Validate user access to tenant
   */
  static async validateUserTenantAccess(userId: number, tenantId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      // Platform admins can access all tenants
      if (['platform_admin', 'super_admin'].includes(user.role)) {
        return true;
      }

      const firm = await storage.getFirmBySlug(tenantId);
      if (!firm) return false;

      return user.firmId === firm.id;
    } catch (error) {
      console.error('Error validating tenant access:', error);
      return false;
    }
  }

  /**
   * Get accessible tenants for a user
   */
  static async getUserAccessibleTenants(userId: number): Promise<any[]> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return [];

      // Platform admins can see all tenants
      if (['platform_admin', 'super_admin'].includes(user.role)) {
        const allFirms = await storage.getAllFirms();
        return allFirms.map(firm => ({
          id: firm.id,
          slug: firm.slug,
          name: firm.name,
          status: firm.status
        }));
      }

      // Regular users can only see their own tenant
      if (user.firmId) {
        const firm = await storage.getFirm(user.firmId);
        if (firm) {
          return [{
            id: firm.id,
            slug: firm.slug,
            name: firm.name,
            status: firm.status
          }];
        }
      }

      return [];
    } catch (error) {
      console.error('Error getting accessible tenants:', error);
      return [];
    }
  }

  /**
   * Get user permissions based on role
   */
  private static getUserPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      platform_admin: ['read:all_tenants', 'write:all_tenants', 'ghost_mode', 'system_config'],
      super_admin: ['read:all_tenants', 'write:all_tenants', 'ghost_mode', 'system_config', 'security_audit'],
      admin: ['read:own_tenant', 'write:own_tenant', 'user_management'],
      firm_admin: ['read:tenant_data', 'write:tenant_data', 'firm_settings'],
      paralegal: ['read:tenant_data', 'create:documents', 'review:documents'],
      client: ['read:own_data']
    };

    return permissions[role] || [];
  }
}