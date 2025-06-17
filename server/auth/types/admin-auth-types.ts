/**
 * Type definitions for Admin Authentication System
 */

export namespace AdminAuthTypes {
  // Admin user information
  export interface AdminUser {
    id: number;
    email: string;
    role: string;
    permissions: string[];
  }

  // Admin validation result
  export interface AdminValidationResult {
    valid: boolean;
    reason?: 'USER_NOT_FOUND' | 'INSUFFICIENT_ROLE' | 'INSUFFICIENT_PERMISSION' | 'TENANT_ACCESS_DENIED' | 'VALIDATION_ERROR';
    adminUser?: AdminUser;
  }

  // Authentication extraction result
  export interface AuthExtractionResult {
    success: boolean;
    user?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      firmId?: number | null;
    };
    reason?: string;
  }

  // Admin action audit log entry
  export interface AdminActionLog {
    adminUserId: number;
    action: string;
    resource: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }

  // Ghost mode session
  export interface GhostSession {
    id: number;
    adminUserId: number;
    targetFirmId: number;
    sessionToken: string;
    isActive: boolean;
    startedAt: Date;
    endedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    auditTrail: GhostAction[];
  }

  // Ghost mode action
  export interface GhostAction {
    timestamp: Date;
    action: string;
    resource: string;
    data?: Record<string, any>;
  }

  // Tenant access permissions
  export interface TenantAccessContext {
    tenantId: string;
    permissions: string[];
    restrictions?: string[];
  }

  // Admin session context
  export interface AdminSessionContext {
    userId: number;
    role: string;
    permissions: string[];
    tenantAccess: TenantAccessContext[];
    ghostMode?: boolean;
    sessionId: string;
  }
}