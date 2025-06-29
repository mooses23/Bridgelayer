/**
 * Comprehensive authentication type definitions for FirmSync Legal
 * @packageDocumentation
 */

/**
 * Supported user roles in the system
 */
export type UserRole = 
  | 'platform_admin' 
  | 'super_admin' 
  | 'admin'
  | 'firm_admin'
  | 'paralegal'
  | 'associate'
  | 'client';

/**
 * Permission scopes for admin dashboard and API access
 */
export type Permission = 
  | 'read:all_tenants'
  | 'write:all_tenants'
  | 'ghost_mode'
  | 'system_config'
  | 'security_audit'
  | 'read:own_tenant'
  | 'write:own_tenant'
  | 'user_management';

/**
 * Tenant information for multi-tenant context
 */
export interface Tenant {
  /** Unique identifier for the tenant */
  id: string;
  /** Associated firm ID */
  firmId: number;
  /** Current subscription plan */
  plan?: string;
  /** Tenant status */
  status: 'active' | 'suspended' | 'inactive';
}

/**
 * Core user interface with role-based access control
 */
export interface User {
  /** Unique numeric identifier */
  id: number;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's role in the system */
  role: UserRole;
  /** Associated firm ID for firm users */
  firmId?: number | null;
  /** Permissions granted to the user */
  permissions: Permission[];
  /** Last login timestamp */
  lastLoginAt?: Date;
  /** Account creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Session persistence interface for server-side storage
 */
export interface Session {
  /** Session ID */
  id: string;
  /** Associated user ID */
  userId: number;
  /** User's role at time of session creation */
  userRole: UserRole;
  /** Associated firm ID */
  firmId?: number | null;
  /** Session creation timestamp */
  createdAt: Date;
  /** Session expiration timestamp */
  expiresAt: Date;
  /** Last activity timestamp */
  lastActivityAt: Date;
  /** IP address of the client */
  ipAddress: string;
  /** User agent string */
  userAgent: string;
}

/**
 * JWT token payload structure
 */
export interface JWTPayload {
  /** Subject (user ID) */
  sub: number;
  /** User's email */
  email: string;
  /** User's role */
  role: UserRole;
  /** Associated firm ID */
  firmId?: number | null;
  /** Tenant ID for multi-tenant context */
  tenantId?: string;
  /** Token type (access/refresh) */
  type: 'access' | 'refresh';
  /** Token version for invalidation */
  tokenVersion: number;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
}

/**
 * Admin dashboard specific permissions
 */
export interface AdminPermissions {
  /** Role-specific permissions */
  [key in UserRole]?: Permission[];
}

/**
 * Onboarding code validation and tracking
 */
export interface OnboardingCode {
  /** Unique identifier */
  id: string;
  /** The actual code value */
  code: string;
  /** Associated firm ID */
  firmId: number;
  /** Code type */
  type: 'setup' | 'invite' | 'recovery';
  /** Email address code was sent to */
  email: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Expiration timestamp */
  expiresAt: Date;
  /** Used timestamp */
  usedAt?: Date;
  /** Code status */
  status: 'active' | 'used' | 'expired';
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  /** Success indicator */
  success: boolean;
  /** User object if authentication successful */
  user?: User;
  /** JWT access token if using token auth */
  token?: string;
  /** Redirect path after authentication */
  redirectPath: string;
  /** Error message if authentication failed */
  error?: string;
}

/**
 * Session context for React components
 */
export interface SessionContext {
  /** Current user */
  user: User | null;
  /** Loading state */
  isLoading: boolean;
  /** Authentication state */
  isAuthenticated: boolean;
  /** Current authentication method */
  authMethod: 'session' | 'jwt' | null;
  /** JWT access token if using token auth */
  token: string | null;
  /** Login function */
  login: (email: string, password: string, mode?: 'bridgelayer' | 'firm', code?: string) => Promise<AuthResult>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Session check function */
  checkSession: () => Promise<boolean>;
  /** Token setter */
  setToken: (token: string | null) => void;
  /** Session refresh function */
  refreshSession: () => Promise<void>;
}
