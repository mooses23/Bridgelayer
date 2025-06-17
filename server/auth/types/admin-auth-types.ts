/**
 * TypeScript type definitions for Admin Authentication System
 */

export namespace AdminAuthTypes {
  // Admin validation result
  export interface AdminValidationResult {
    valid: boolean;
    reason?: 'USER_NOT_FOUND' | 'INSUFFICIENT_ROLE' | 'INSUFFICIENT_PERMISSION' | 'TENANT_ACCESS_DENIED' | 'VALIDATION_ERROR';
    adminUser?: {
      id: number;
      email: string;
      role: string;
      permissions: string[];
    };
  }

  // Authentication extraction result
  export interface AuthExtractionResult {
    success: boolean;
    reason?: 'NO_VALID_AUTH' | 'EXTRACTION_ERROR';
    user?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      firmId?: number | null;
    };
  }

  // Ghost mode session
  export interface GhostSession {
    id: number;
    adminUserId: number;
    targetFirmId: number;
    sessionToken: string;
    isActive: boolean;
    startedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    auditTrail: GhostAuditEntry[];
  }

  // Ghost mode audit entry
  export interface GhostAuditEntry {
    timestamp: Date;
    action: string;
    resource: string;
    data?: any;
  }

  // Admin permissions
  export type AdminPermission = 
    | 'read:all_tenants'
    | 'write:all_tenants'
    | 'ghost_mode'
    | 'system_config'
    | 'security_audit'
    | 'read:own_tenant'
    | 'write:own_tenant'
    | 'user_management'
    | 'read:tenant_data'
    | 'write:tenant_data'
    | 'firm_settings';

  // Admin roles
  export type AdminRole = 'platform_admin' | 'admin' | 'super_admin';
}