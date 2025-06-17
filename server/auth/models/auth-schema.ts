import { pgTable, serial, text, timestamp, boolean, integer, jsonb, uuid, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Enhanced Authentication Tables for Multi-Tenant System
 * Extends existing schema with secure authentication features
 */

// User sessions with JWT tracking and tenant isolation
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  firmId: integer('firm_id'), // Tenant isolation
  sessionToken: text('session_token').notNull().unique(),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  accessToken: text('access_token'), // Current JWT access token
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  metadata: jsonb('metadata') // Additional session context
}, (table) => ({
  userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
  firmIdIdx: index('user_sessions_firm_id_idx').on(table.firmId),
  sessionTokenIdx: index('user_sessions_token_idx').on(table.sessionToken),
  activeSessionsIdx: index('user_sessions_active_idx').on(table.isActive, table.expiresAt)
}));

// Token blacklist for immediate revocation
export const tokenBlacklist = pgTable('token_blacklist', {
  id: serial('id').primaryKey(),
  tokenHash: text('token_hash').notNull().unique(), // SHA-256 hash of token
  tokenType: text('token_type').notNull(), // 'access' | 'refresh' | 'admin'
  userId: integer('user_id'),
  firmId: integer('firm_id'), // Tenant context
  reason: text('reason'), // 'logout' | 'security' | 'expired' | 'revoked'
  expiresAt: timestamp('expires_at').notNull(), // Original token expiry
  blacklistedAt: timestamp('blacklisted_at').defaultNow(),
  metadata: jsonb('metadata')
}, (table) => ({
  tokenHashIdx: index('token_blacklist_hash_idx').on(table.tokenHash),
  expiryIdx: index('token_blacklist_expiry_idx').on(table.expiresAt),
  firmIdIdx: index('token_blacklist_firm_idx').on(table.firmId)
}));

// Tenant-specific authentication settings
export const tenantAuthSettings = pgTable('tenant_auth_settings', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').notNull().unique(),
  passwordPolicy: jsonb('password_policy').default({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90, // days
    preventReuse: 5 // last N passwords
  }),
  sessionTimeout: integer('session_timeout').default(1800), // seconds (30 min)
  mfaRequired: boolean('mfa_required').default(false),
  ipWhitelist: jsonb('ip_whitelist'), // Array of allowed IP ranges
  apiKeyEncryptionKey: text('api_key_encryption_key'), // Encrypted with master key
  loginAttemptLimit: integer('login_attempt_limit').default(5),
  lockoutDuration: integer('lockout_duration').default(900), // seconds (15 min)
  allowedDomains: jsonb('allowed_domains'), // Email domain restrictions
  ssoEnabled: boolean('sso_enabled').default(false),
  ssoConfig: jsonb('sso_config'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  firmIdIdx: index('tenant_auth_settings_firm_idx').on(table.firmId)
}));

// Comprehensive security audit log
export const authAuditLog = pgTable('auth_audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'), // Can be null for failed login attempts
  firmId: integer('firm_id'), // Tenant context
  sessionId: text('session_id'), // Reference to user session
  eventType: text('event_type').notNull(), // 'login' | 'logout' | 'token_refresh' | 'admin_action' | 'security_violation'
  eventCategory: text('event_category').notNull(), // 'authentication' | 'authorization' | 'admin' | 'security'
  resource: text('resource'), // What was accessed/modified
  action: text('action'), // Specific action taken
  result: text('result').notNull(), // 'success' | 'failure' | 'blocked'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  location: jsonb('location'), // Geographic info if available
  riskScore: integer('risk_score'), // 0-100 security risk assessment
  metadata: jsonb('metadata'), // Additional context
  timestamp: timestamp('timestamp').defaultNow(),
  expiresAt: timestamp('expires_at') // For automatic cleanup
}, (table) => ({
  userIdIdx: index('auth_audit_user_idx').on(table.userId),
  firmIdIdx: index('auth_audit_firm_idx').on(table.firmId),
  eventTypeIdx: index('auth_audit_event_type_idx').on(table.eventType),
  timestampIdx: index('auth_audit_timestamp_idx').on(table.timestamp),
  riskIdx: index('auth_audit_risk_idx').on(table.riskScore),
  compositeIdx: index('auth_audit_composite_idx').on(table.firmId, table.eventType, table.timestamp)
}));

// Encrypted API keys storage
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  firmId: integer('firm_id').notNull(), // Tenant isolation
  keyName: text('key_name').notNull(),
  encryptedKey: text('encrypted_key').notNull(), // AES-256 encrypted
  keyHash: text('key_hash').notNull(), // For validation without decryption
  permissions: jsonb('permissions').notNull(), // Array of allowed operations
  scope: text('scope').default('api'), // 'api' | 'webhook' | 'integration'
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at'),
  usageCount: integer('usage_count').default(0),
  rateLimit: integer('rate_limit'), // Requests per minute
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata')
}, (table) => ({
  userFirmIdx: index('api_keys_user_firm_idx').on(table.userId, table.firmId),
  keyHashIdx: index('api_keys_hash_idx').on(table.keyHash),
  activeKeysIdx: index('api_keys_active_idx').on(table.isActive, table.expiresAt),
  firmKeyNameUnique: unique('api_keys_firm_name_unique').on(table.firmId, table.keyName)
}));

// Onboarding sessions for secure firm registration
export const onboardingSessions = pgTable('onboarding_sessions', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').defaultRandom().notNull().unique(),
  subdomain: text('subdomain').notNull(),
  adminEmail: text('admin_email').notNull(),
  currentStep: integer('current_step').default(1),
  completedSteps: jsonb('completed_steps').default([]), // Array of completed step numbers
  firmData: jsonb('firm_data'), // Accumulated firm information
  brandingData: jsonb('branding_data'), // Logo, colors, etc.
  preferencesData: jsonb('preferences_data'), // Settings and preferences
  integrationsData: jsonb('integrations_data'), // Encrypted integration credentials
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  isCompleted: boolean('is_completed').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
}, (table) => ({
  sessionIdIdx: index('onboarding_sessions_id_idx').on(table.sessionId),
  subdomainIdx: index('onboarding_sessions_subdomain_idx').on(table.subdomain),
  emailIdx: index('onboarding_sessions_email_idx').on(table.adminEmail),
  expiryIdx: index('onboarding_sessions_expiry_idx').on(table.expiresAt),
  activeSessionsIdx: index('onboarding_active_idx').on(table.isCompleted, table.expiresAt)
}));

// Admin ghost mode sessions for secure firm access
export const adminGhostSessions = pgTable('admin_ghost_sessions', {
  id: serial('id').primaryKey(),
  adminUserId: integer('admin_user_id').notNull(),
  targetFirmId: integer('target_firm_id').notNull(),
  sessionToken: uuid('session_token').defaultRandom().notNull().unique(),
  purpose: text('purpose'), // 'support' | 'debugging' | 'audit' | 'training'
  isActive: boolean('is_active').default(true),
  permissions: jsonb('permissions'), // Specific permissions granted
  accessLevel: text('access_level').default('read'), // 'read' | 'write' | 'admin'
  auditTrail: jsonb('audit_trail').default([]), // Array of actions taken
  restrictions: jsonb('restrictions'), // Any access limitations
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  maxDuration: integer('max_duration').default(3600), // seconds (1 hour)
  metadata: jsonb('metadata')
}, (table) => ({
  adminUserIdx: index('ghost_sessions_admin_idx').on(table.adminUserId),
  targetFirmIdx: index('ghost_sessions_firm_idx').on(table.targetFirmId),
  sessionTokenIdx: index('ghost_sessions_token_idx').on(table.sessionToken),
  activeSessionsIdx: index('ghost_sessions_active_idx').on(table.isActive, table.startedAt),
  adminFirmIdx: index('ghost_sessions_admin_firm_idx').on(table.adminUserId, table.targetFirmId)
}));

// User login attempts tracking for security
export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  ipAddress: text('ip_address').notNull(),
  success: boolean('success').notNull(),
  failureReason: text('failure_reason'), // 'invalid_password' | 'user_not_found' | 'account_locked'
  userAgent: text('user_agent'),
  location: jsonb('location'),
  attemptedAt: timestamp('attempted_at').defaultNow(),
  firmId: integer('firm_id') // Set if successful login or known user
}, (table) => ({
  emailIdx: index('login_attempts_email_idx').on(table.email),
  ipIdx: index('login_attempts_ip_idx').on(table.ipAddress),
  timeIdx: index('login_attempts_time_idx').on(table.attemptedAt),
  emailIpIdx: index('login_attempts_email_ip_idx').on(table.email, table.ipAddress)
}));

// Relations for type safety and joins
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  // Will relate to existing users table when available
}));

export const authAuditLogRelations = relations(authAuditLog, ({ one }) => ({
  // Will relate to existing users and firms tables when available
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  // Will relate to existing users and firms tables when available
}));

// Zod schemas for validation
export const insertUserSessionSchema = createInsertSchema(userSessions);
export const selectUserSessionSchema = createSelectSchema(userSessions);

export const insertTokenBlacklistSchema = createInsertSchema(tokenBlacklist);
export const selectTokenBlacklistSchema = createSelectSchema(tokenBlacklist);

export const insertTenantAuthSettingsSchema = createInsertSchema(tenantAuthSettings);
export const selectTenantAuthSettingsSchema = createSelectSchema(tenantAuthSettings);

export const insertAuthAuditLogSchema = createInsertSchema(authAuditLog);
export const selectAuthAuditLogSchema = createSelectSchema(authAuditLog);

export const insertApiKeySchema = createInsertSchema(apiKeys, {
  permissions: z.array(z.string()),
  metadata: z.record(z.any()).optional()
});
export const selectApiKeySchema = createSelectSchema(apiKeys);

export const insertOnboardingSessionSchema = createInsertSchema(onboardingSessions, {
  completedSteps: z.array(z.number()),
  firmData: z.record(z.any()).optional(),
  brandingData: z.record(z.any()).optional(),
  preferencesData: z.record(z.any()).optional(),
  integrationsData: z.record(z.any()).optional()
});
export const selectOnboardingSessionSchema = createSelectSchema(onboardingSessions);

export const insertAdminGhostSessionSchema = createInsertSchema(adminGhostSessions, {
  permissions: z.array(z.string()).optional(),
  auditTrail: z.array(z.record(z.any())).optional(),
  restrictions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});
export const selectAdminGhostSessionSchema = createSelectSchema(adminGhostSessions);

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts, {
  location: z.record(z.any()).optional()
});
export const selectLoginAttemptSchema = createSelectSchema(loginAttempts);

// Type exports for TypeScript
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export type TokenBlacklist = typeof tokenBlacklist.$inferSelect;
export type InsertTokenBlacklist = typeof tokenBlacklist.$inferInsert;

export type TenantAuthSettings = typeof tenantAuthSettings.$inferSelect;
export type InsertTenantAuthSettings = typeof tenantAuthSettings.$inferInsert;

export type AuthAuditLog = typeof authAuditLog.$inferSelect;
export type InsertAuthAuditLog = typeof authAuditLog.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

export type OnboardingSession = typeof onboardingSessions.$inferSelect;
export type InsertOnboardingSession = typeof onboardingSessions.$inferInsert;

export type AdminGhostSession = typeof adminGhostSessions.$inferSelect;
export type InsertAdminGhostSession = typeof adminGhostSessions.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;