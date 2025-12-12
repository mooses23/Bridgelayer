// Types for tenant settings management

export interface TenantSettings {
  firmProfile: FirmProfile;
  userManagement: UserManagementSettings;
  integrations: IntegrationSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface FirmProfile {
  firmName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  website?: string;
  logo?: string;
  description?: string;
  timezone?: string;
  businessHours?: {
    start: string;
    end: string;
    days: string[];
  };
}

export interface UserManagementSettings {
  allowUserInvites: boolean;
  defaultRole: 'tenant_admin' | 'tenant_user';
  requireEmailVerification: boolean;
  maxUsers?: number;
}

export interface IntegrationSettings {
  clients?: {
    enabled: boolean;
    provider: string | null;
    mode: 'native' | 'integration' | 'hybrid';
    lastSync?: string;
  };
  calendar?: {
    enabled: boolean;
    provider: string | null;
    mode: 'native' | 'integration' | 'hybrid';
    lastSync?: string;
  };
  billing?: {
    enabled: boolean;
    provider: string | null;
    mode: 'native' | 'integration' | 'hybrid';
    lastSync?: string;
  };
  docsign?: {
    enabled: boolean;
    provider: string | null;
    mode: 'native' | 'integration' | 'hybrid';
    lastSync?: string;
  };
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
  sms?: {
    enabled: boolean;
    types: string[];
  };
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // in minutes
  ipWhitelist?: string[];
  allowedDomains?: string[];
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'super_admin' | 'admin' | 'tenant_admin' | 'tenant_user';
  status: 'active' | 'inactive' | 'invited';
  lastLogin?: string;
  createdAt: string;
}
