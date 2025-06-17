import { storage } from '../../storage';
import { AdminAuthTypes } from '../types/admin-auth-types';

/**
 * Tenant-specific authentication and authorization service
 * Handles multi-tenant access control and validation
 */
export class TenantService {
  /**
   * Validate user has access to specific tenant
   */
  static async validateUserTenantAccess(
    userId: number,
    tenantId: string
  ): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      // Platform admins can access all tenants
      if (['platform_admin', 'super_admin'].includes(user.role)) {
        return true;
      }

      // Regular users can only access their own tenant
      if (user.firmId) {
        const firm = await storage.getFirm(user.firmId);
        return firm?.slug === tenantId;
      }

      return false;
    } catch (error) {
      console.error('Tenant access validation error:', error);
      return false;
    }
  }

  /**
   * Get tenant configuration and permissions for user
   */
  static async getTenantContext(
    userId: number,
    tenantId: string
  ): Promise<AdminAuthTypes.TenantAccessContext | null> {
    try {
      const hasAccess = await this.validateUserTenantAccess(userId, tenantId);
      if (!hasAccess) return null;

      const user = await storage.getUser(userId);
      if (!user) return null;

      // Define permissions based on role and tenant
      let permissions: string[] = [];
      
      if (['platform_admin', 'super_admin'].includes(user.role)) {
        permissions = [
          'read:all_data',
          'write:all_data',
          'admin:users',
          'admin:settings',
          'admin:billing',
          'admin:audit'
        ];
      } else if (user.role === 'admin') {
        permissions = [
          'read:tenant_data',
          'write:tenant_data',
          'admin:users',
          'admin:settings'
        ];
      } else if (user.role === 'firm_admin') {
        permissions = [
          'read:tenant_data',
          'write:tenant_data',
          'admin:basic_settings'
        ];
      }

      return {
        tenantId,
        permissions,
        restrictions: user.role === 'admin' ? ['no_cross_tenant'] : []
      };
    } catch (error) {
      console.error('Get tenant context error:', error);
      return null;
    }
  }

  /**
   * Get all accessible tenants for a user
   */
  static async getUserAccessibleTenants(userId: number): Promise<string[]> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return [];

      // Platform admins can access all tenants
      if (['platform_admin', 'super_admin'].includes(user.role)) {
        const firms = await storage.getAllFirms();
        return firms.map(firm => firm.slug);
      }

      // Regular users can only access their own tenant
      if (user.firmId) {
        const firm = await storage.getFirm(user.firmId);
        return firm ? [firm.slug] : [];
      }

      return [];
    } catch (error) {
      console.error('Get accessible tenants error:', error);
      return [];
    }
  }

  /**
   * Enforce tenant isolation in database queries
   */
  static createTenantFilter(
    userId: number,
    userRole: string,
    tenantId?: string
  ): { firmId?: number } | {} {
    // Platform admins can see all data if no tenant specified
    if (['platform_admin', 'super_admin'].includes(userRole) && !tenantId) {
      return {};
    }

    // All other cases require firm-scoped data
    return { firmId: userId };
  }

  /**
   * Validate tenant operation permissions
   */
  static async validateTenantOperation(
    userId: number,
    tenantId: string,
    operation: 'read' | 'write' | 'admin',
    resource: string
  ): Promise<boolean> {
    try {
      const context = await this.getTenantContext(userId, tenantId);
      if (!context) return false;

      const requiredPermission = `${operation}:${resource}`;
      const hasGenericPermission = context.permissions.some(perm => 
        perm === `${operation}:all_data` || 
        perm === `${operation}:tenant_data`
      );

      return context.permissions.includes(requiredPermission) || hasGenericPermission;
    } catch (error) {
      console.error('Validate tenant operation error:', error);
      return false;
    }
  }
}