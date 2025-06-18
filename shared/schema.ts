import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Firms table for multi-tenancy
export const firms = pgTable("firms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  plan: text("plan").notNull().default("starter"),
  status: text("status").notNull().default("active"),
  onboarded: boolean("onboarded").notNull().default(false),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  email: text("email").notNull().unique(),
  username: text("username"),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("viewer"),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  folderId: integer("folder_id"),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  documentType: text("document_type"),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  assignedReviewer: integer("assigned_reviewer").references(() => users.id),
  reviewStatus: text("review_status").notNull().default("pending"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document analyses table
export const documentAnalyses = pgTable("document_analyses", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  analysisType: text("analysis_type").notNull(),
  result: jsonb("result").notNull(),
  confidence: integer("confidence"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull().default("active"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cases table
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time logs table
export const timeLogs = pgTable("time_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  clientId: integer("client_id").references(() => clients.id),
  caseId: integer("case_id").references(() => cases.id),
  hours: integer("hours").notNull(),
  description: text("description").notNull(),
  billableRate: integer("billable_rate"),
  customField: text("custom_field"),
  isLocked: boolean("is_locked").default(false),
  lockedAt: timestamp("locked_at"),
  invoiceId: integer("invoice_id"),
  loggedAt: timestamp("logged_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  caseId: integer("case_id").references(() => cases.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").notNull().default("draft"),
  amount: integer("amount").notNull(),
  paidDate: timestamp("paid_date"),
  dueDate: timestamp("due_date"),
  terms: text("terms"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice line items table
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  timeLogId: integer("time_log_id").references(() => timeLogs.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  rate: integer("rate").notNull(),
  amount: integer("amount").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Billing permissions table
export const billingPermissions = pgTable("billing_permissions", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  canViewBilling: boolean("can_view_billing").default(false),
  canEditBilling: boolean("can_edit_billing").default(false),
  canCreateInvoices: boolean("can_create_invoices").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Firm billing settings table
export const firmBillingSettings = pgTable("firm_billing_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs table - Fixed with all required columns
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  actorId: integer("actor_id").references(() => users.id).notNull(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Client intakes table
export const clientIntakes = pgTable("client_intakes", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  intakeNumber: text("intake_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  region: text("region").notNull(),
  matterType: text("matter_type").notNull(),
  caseType: text("case_type").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  caseDescription: text("case_description").notNull(),
  status: text("status").notNull().default("received"),
  assignedTo: integer("assigned_to").references(() => users.id),
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Other required tables for full functionality
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientAuth = pgTable("client_auth", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  loginToken: text("login_token"),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billingForms = pgTable("billing_forms", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  formData: jsonb("form_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional missing tables
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  parentId: integer("parent_id"),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const firmAnalysisSettings = pgTable("firm_analysis_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  title: text("title").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => messageThreads.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemAdmins = pgTable("system_admins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Old firmIntegrations table removed - using new comprehensive integration architecture below

export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding system tables
export const onboardingSessions = pgTable("onboarding_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  adminUserId: integer("admin_user_id").references(() => users.id),
  currentStep: integer("current_step").notNull().default(1),
  stepData: jsonb("step_data"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, abandoned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const firmBranding = pgTable("firm_branding", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const firmPreferences = pgTable("firm_preferences", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull().unique(),
  defaultLanguage: text("default_language").default("en"),
  timezone: text("timezone").default("America/New_York"),
  practiceAreas: text("practice_areas").array(),
  caseTypes: text("case_types").array(),
  fileRetentionDays: integer("file_retention_days").default(2555), // 7 years
  auditTrailEnabled: boolean("audit_trail_enabled").default(true),
  folderStructure: text("folder_structure").default("by_matter"), // by_matter, by_date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const firmTemplates = pgTable("firm_templates", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileUrl: text("file_url").notNull(),
  templateType: text("template_type"), // letterhead, intake_form, engagement_letter, etc.
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceAgreements = pgTable("compliance_agreements", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  agreementType: text("agreement_type").notNull(), // nda, terms_of_service, privacy_policy
  version: text("version").notNull(),
  acceptedBy: integer("accepted_by").references(() => users.id).notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const documentTypeTemplates = pgTable("document_type_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const availableIntegrations = pgTable("available_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  configSchema: jsonb("config_schema"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clientIntakes.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminGhostSessions = pgTable("admin_ghost_sessions", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id).notNull(),
  targetFirmId: integer("target_firm_id").references(() => firms.id).notNull(),
  sessionToken: uuid("session_token").defaultRandom().notNull().unique(),
  permissions: jsonb("permissions"),
  auditTrail: jsonb("audit_trail"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiTriageResults = pgTable("ai_triage_results", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  intakeId: integer("intake_id").references(() => clientIntakes.id),
  documentId: integer("document_id").references(() => documents.id),
  resourceType: text("resource_type").notNull(),
  aiSummary: text("ai_summary").notNull(),
  aiConfidenceScore: integer("ai_confidence_score").notNull(),
  isHumanReviewed: boolean("is_human_reviewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const firmSettings = pgTable("firm_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  storageProvider: text("storage_provider"),
  oauthTokens: text("oauth_tokens"),
  apiKeys: text("api_keys"),
  features: text("features"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform-level integration definitions (Admin managed)
export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  category: text("category").notNull(),
  provider: text("provider").notNull(),
  logoUrl: text("logo_url"),
  webhookUrl: text("webhook_url"),
  apiBaseUrl: text("api_base_url"),
  authType: text("auth_type").notNull(), // oauth2, api_key, webhook
  status: text("status").default("active"),
  version: text("version"),
  isActive: boolean("is_active").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  planRestrictions: text("plan_restrictions").array(), // which plans can access
  configSchema: jsonb("config_schema"), // JSON schema for configuration
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm-level integration enablement (Firm Admin controlled)
export const firmIntegrations = pgTable("firm_integrations", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  isEnabled: boolean("is_enabled").default(true),
  configuration: jsonb("configuration"), // firm-specific config
  apiCredentials: text("api_credentials"), // encrypted credentials
  webhookSecret: text("webhook_secret"),
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: text("sync_status").default("pending"), // pending, active, error, disabled
  errorMessage: text("error_message"),
  enabledBy: integer("enabled_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-level integration permissions (User role based)
export const userIntegrationPermissions = pgTable("user_integration_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  firmIntegrationId: integer("firm_integration_id").references(() => firmIntegrations.id).notNull(),
  canRead: boolean("can_read").default(true),
  canWrite: boolean("can_write").default(false),
  canConfigure: boolean("can_configure").default(false),
  canDisable: boolean("can_disable").default(false),
  grantedBy: integer("granted_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration usage tracking and audit
export const integrationAuditLogs = pgTable("integration_audit_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // enabled, disabled, configured, api_call, webhook_received
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Integration API rate limiting per firm
export const integrationRateLimits = pgTable("integration_rate_limits", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  requestsPerHour: integer("requests_per_hour").default(1000),
  requestsPerDay: integer("requests_per_day").default(10000),
  currentHourlyUsage: integer("current_hourly_usage").default(0),
  currentDailyUsage: integer("current_daily_usage").default(0),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertFirmSchema = createInsertSchema(firms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalysisSchema = createInsertSchema(documentAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeLogSchema = createInsertSchema(timeLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingPermissionSchema = createInsertSchema(billingPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertFirmBillingSettingsSchema = createInsertSchema(firmBillingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Onboarding schemas
export const insertOnboardingSessionSchema = createInsertSchema(onboardingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirmBrandingSchema = createInsertSchema(firmBranding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirmPreferencesSchema = createInsertSchema(firmPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirmTemplateSchema = createInsertSchema(firmTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceAgreementSchema = createInsertSchema(complianceAgreements).omit({
  id: true,
  acceptedAt: true,
});

export const insertClientIntakeSchema = createInsertSchema(clientIntakes).omit({
  id: true,
  submittedAt: true,
  processedAt: true,
  updatedAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirmAnalysisSettingsSchema = createInsertSchema(firmAnalysisSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminGhostSessionSchema = createInsertSchema(adminGhostSessions).omit({
  id: true,
  sessionToken: true,
  startedAt: true,
  endedAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiTriageResultSchema = createInsertSchema(aiTriageResults).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientAuthSchema = createInsertSchema(clientAuth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingFormSchema = createInsertSchema(billingForms).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAdminSchema = createInsertSchema(systemAdmins).omit({
  id: true,
  createdAt: true,
});

// Old insertFirmIntegrationSchema removed - duplicate definition resolved

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTypeTemplateSchema = createInsertSchema(documentTypeTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertAvailableIntegrationSchema = createInsertSchema(availableIntegrations).omit({
  id: true,
  createdAt: true,
});

export const insertFirmSettingsSchema = createInsertSchema(firmSettings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertPlatformIntegrationSchema = createInsertSchema(platformIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirmIntegrationSchema = createInsertSchema(firmIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserIntegrationPermissionSchema = createInsertSchema(userIntegrationPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationAuditLogSchema = createInsertSchema(integrationAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertIntegrationRateLimitSchema = createInsertSchema(integrationRateLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertFirm = z.infer<typeof insertFirmSchema>;
export type Firm = typeof firms.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type DocumentAnalysis = typeof documentAnalyses.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertTimeLog = z.infer<typeof insertTimeLogSchema>;
export type TimeLog = typeof timeLogs.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertBillingPermission = z.infer<typeof insertBillingPermissionSchema>;
export type BillingPermission = typeof billingPermissions.$inferSelect;
export type InsertFirmBillingSettings = z.infer<typeof insertFirmBillingSettingsSchema>;
export type FirmBillingSettings = typeof firmBillingSettings.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertClientIntake = z.infer<typeof insertClientIntakeSchema>;
export type ClientIntake = typeof clientIntakes.$inferSelect;
export type InsertFirmAnalysisSettings = z.infer<typeof insertFirmAnalysisSettingsSchema>;
export type FirmAnalysisSettings = typeof firmAnalysisSettings.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertAdminGhostSession = z.infer<typeof insertAdminGhostSessionSchema>;
export type AdminGhostSession = typeof adminGhostSessions.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertAiTriageResult = z.infer<typeof insertAiTriageResultSchema>;
export type AiTriageResult = typeof aiTriageResults.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertClientAuth = z.infer<typeof insertClientAuthSchema>;
export type ClientAuth = typeof clientAuth.$inferSelect;
export type InsertBillingForm = z.infer<typeof insertBillingFormSchema>;
export type BillingForm = typeof billingForms.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAdmin = z.infer<typeof insertSystemAdminSchema>;
export type SystemAdmin = typeof systemAdmins.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertDocumentTypeTemplate = z.infer<typeof insertDocumentTypeTemplateSchema>;
export type DocumentTypeTemplate = typeof documentTypeTemplates.$inferSelect;
export type InsertAvailableIntegration = z.infer<typeof insertAvailableIntegrationSchema>;
export type AvailableIntegration = typeof availableIntegrations.$inferSelect;
export type InsertFirmSettings = z.infer<typeof insertFirmSettingsSchema>;
export type FirmSettings = typeof firmSettings.$inferSelect;

// New Integration Architecture Types
export type InsertPlatformIntegration = z.infer<typeof insertPlatformIntegrationSchema>;
export type PlatformIntegration = typeof platformIntegrations.$inferSelect;
export type InsertFirmIntegration = z.infer<typeof insertFirmIntegrationSchema>;
export type FirmIntegration = typeof firmIntegrations.$inferSelect;
export type InsertUserIntegrationPermission = z.infer<typeof insertUserIntegrationPermissionSchema>;
export type UserIntegrationPermission = typeof userIntegrationPermissions.$inferSelect;
export type InsertIntegrationAuditLog = z.infer<typeof insertIntegrationAuditLogSchema>;
export type IntegrationAuditLog = typeof integrationAuditLogs.$inferSelect;
export type InsertIntegrationRateLimit = z.infer<typeof insertIntegrationRateLimitSchema>;
export type IntegrationRateLimit = typeof integrationRateLimits.$inferSelect;