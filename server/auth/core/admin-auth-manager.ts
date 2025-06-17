import { Request, Response, NextFunction } from 'express';
import { storage } from '../../storage';
import { JWTManager } from './jwt-manager';
import { TenantService } from '../services/tenant-service';
import { AdminAuthTypes } from '../types/admin-auth-types';

/**
 * Centralized Admin Authentication Manager
 * Handles all admin-level authentication, authorization, and audit logging
 */
export class AdminAuthManager {
  private static readonly ADMIN_ROLES = ['platform_admin', 'admin', 'super_admin'];
  private static readonly ADMIN_PERMISSIONS = {
    platform_admin: ['read:all_tenants', 'write:all_tenants', 'ghost_mode', 'system_config'],
    admin: ['read:own_tenant', 'write:own_tenant', 'user_management'],
    super_admin: ['read:all_tenants', 'write:all_tenants', 'ghost_mode', 'system_config', 'security_audit']
  };

  /**
   * Validates if user has admin privileges
   */
  static async validateAdminAccess(
    userId: number,
    requiredPermission?: string,
    tenantId?: string
  ): Promise<AdminAuthTypes.AdminValidationResult> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { valid: false, reason: 'USER_NOT_FOUND' };
      }

      // Check if user has admin role
      if (!this.ADMIN_ROLES.includes(user.role)) {
        return { valid: false, reason: 'INSUFFICIENT_ROLE' };
      }

      // Check specific permission if required
      if (requiredPermission) {
        const userPermissions = this.ADMIN_PERMISSIONS[user.role as keyof typeof this.ADMIN_PERMISSIONS] || [];
        if (!userPermissions.includes(requiredPermission)) {
          return { valid: false, reason: 'INSUFFICIENT_PERMISSION' };
        }
      }

      // Check tenant scope for non-platform admins
      if (tenantId && user.role !== 'platform_admin' && user.role !== 'super_admin') {
        const hasAccess = await TenantService.validateUserTenantAccess(userId, tenantId);
        if (!hasAccess) {
          return { valid: false, reason: 'TENANT_ACCESS_DENIED' };
        }
      }

      return {
        valid: true,
        adminUser: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: this.ADMIN_PERMISSIONS[user.role as keyof typeof this.ADMIN_PERMISSIONS] || []
        }
      };
    } catch (error) {
      console.error('Admin validation error:', error);
      return { valid: false, reason: 'VALIDATION_ERROR' };
    }
  }

  /**
   * Admin authentication middleware
   */
  static requireAdmin(requiredPermission?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Extract user from JWT or session
        const authResult = await this.extractUserFromRequest(req);
        if (!authResult.success) {
          await this.logSecurityEvent(
            null,
            null,
            'ADMIN_AUTH_FAILED',
            'Admin authentication failed',
            req.ip,
            req.get('User-Agent')
          );
          return res.status(401).json({
            error: 'Authentication required',
            message: 'Valid admin authentication required'
          });
        }

        // Validate admin access
        const validation = await this.validateAdminAccess(
          authResult.user!.id,
          requiredPermission,
          req.params.tenantId
        );

        if (!validation.valid) {
          await this.logSecurityEvent(
            authResult.user!.id,
            authResult.user!.firmId,
            'ADMIN_ACCESS_DENIED',
            `Admin access denied: ${validation.reason}`,
            req.ip,
            req.get('User-Agent')
          );
          return res.status(403).json({
            error: 'Access denied',
            message: 'Insufficient admin privileges'
          });
        }

        // Attach admin context to request
        req.user = authResult.user!;
        req.adminContext = {
          permissions: validation.adminUser?.permissions || [],
          role: validation.adminUser?.role || '',
          tenantScope: req.params.tenantId || 'global'
        };

        // Log admin action
        await this.logAdminAction(
          authResult.user!.id,
          req.method,
          req.originalUrl,
          req.ip,
          req.get('User-Agent')
        );

        next();
      } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
          error: 'Authentication error',
          message: 'Internal server error during admin authentication'
        });
      }
    };
  }

  /**
   * Ghost mode authentication - highest security level
   */
  static requireGhostMode() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authResult = await this.extractUserFromRequest(req);
        if (!authResult.success) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const validation = await this.validateAdminAccess(
          authResult.user!.id,
          'ghost_mode'
        );

        if (!validation.valid) {
          await this.logSecurityEvent(
            authResult.user!.id,
            authResult.user!.firmId,
            'GHOST_MODE_DENIED',
            'Ghost mode access denied',
            req.ip,
            req.get('User-Agent')
          );
          return res.status(403).json({
            error: 'Ghost mode access denied',
            message: 'Insufficient privileges for ghost mode'
          });
        }

        req.user = authResult.user!;
        req.adminContext = {
          permissions: validation.adminUser?.permissions || [],
          role: validation.adminUser?.role || '',
          tenantScope: 'ghost',
          ghostMode: true
        };

        next();
      } catch (error) {
        console.error('Ghost mode middleware error:', error);
        res.status(500).json({ error: 'Ghost mode authentication failed' });
      }
    };
  }

  /**
   * Platform-level admin access (cross-tenant operations)
   */
  static requirePlatformAdmin() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authResult = await this.extractUserFromRequest(req);
        if (!authResult.success) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await storage.getUser(authResult.user!.id);
        if (!user || !['platform_admin', 'super_admin'].includes(user.role)) {
          await this.logSecurityEvent(
            authResult.user!.id,
            authResult.user!.firmId,
            'PLATFORM_ACCESS_DENIED',
            'Platform admin access denied',
            req.ip,
            req.get('User-Agent')
          );
          return res.status(403).json({
            error: 'Platform access denied',
            message: 'Platform administrator privileges required'
          });
        }

        req.user = authResult.user!;
        req.adminContext = {
          permissions: this.ADMIN_PERMISSIONS[user.role as keyof typeof this.ADMIN_PERMISSIONS],
          role: user.role,
          tenantScope: 'platform'
        };

        next();
      } catch (error) {
        console.error('Platform admin middleware error:', error);
        res.status(500).json({ error: 'Platform authentication failed' });
      }
    };
  }

  /**
   * Extract user from JWT token or session
   */
  private static async extractUserFromRequest(req: Request): Promise<AdminAuthTypes.AuthExtractionResult> {
    try {
      // Try JWT first
      const token = JWTManager.extractTokenFromRequest(req);
      
      if (token) {
        const jwtResult = await JWTManager.validateToken(token);
        if (jwtResult.valid && jwtResult.payload) {
          const user = await storage.getUser(jwtResult.payload.userId);
          if (user) {
            return {
              success: true,
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                firmId: user.firmId
              }
            };
          }
        }
      }

      // Fallback to session
      if ((req as any).session?.userId) {
        const user = await storage.getUser((req as any).session.userId);
        if (user) {
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              firmId: user.firmId
            }
          };
        }
      }

      return { success: false, reason: 'NO_VALID_AUTH' };
    } catch (error) {
      console.error('Auth extraction error:', error);
      return { success: false, reason: 'EXTRACTION_ERROR' };
    }
  }

  /**
   * Check if user can access specific tenant
   */
  static async validateTenantAccess(
    userId: number,
    tenantId: string,
    operation: 'read' | 'write' = 'read'
  ): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      // Platform admins can access all tenants
      if (['platform_admin', 'super_admin'].includes(user.role)) {
        return true;
      }

      // Regular admins can only access their own tenant
      if (user.role === 'admin' && user.firmId) {
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
   * Log security events (stub for audit logger integration)
   */
  private static async logSecurityEvent(
    userId: number | null,
    firmId: number | null | undefined,
    eventType: string,
    message: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Integration point with audit logger
    console.log('Security Event:', {
      userId,
      firmId,
      eventType,
      message,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
  }

  /**
   * Log admin actions (stub for audit logger integration)
   */
  private static async logAdminAction(
    adminUserId: number,
    method: string,
    url: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Integration point with audit logger
    console.log('Admin Action:', {
      adminUserId,
      action: `${method} ${url}`,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
  }
}

// Extend Express Request interface for admin context
declare global {
  namespace Express {
    interface Request {
      adminContext?: {
        permissions: string[];
        role: string;
        tenantScope: string;
        ghostMode?: boolean;
      };
    }
  }
}