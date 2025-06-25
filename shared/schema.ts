import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// TABLE DEFINITIONS (ALL TABLES FIRST)
// ============================================================================

// Firms table for multi-tenancy
export const firms = pgTable("firms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subdomain: text("subdomain").unique(),
  domain: text("domain"),
  plan: text("plan").notNull().default("starter"),
  status: text("status").notNull().default("active"),
  onboarded: boolean("onboarded").notNull().default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
  logoUrl: text("logo_url"),
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

// Firm users table
export const firmUsers = pgTable("firm_users", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("firm_user"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Folders table
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
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  assignedReviewer: integer("assigned_reviewer").references(() => users.id),
  reviewStatus: text("review_status").notNull().default("pending"),
  status: text("status").default("processing"),
  analyzedAt: timestamp("analyzed_at"),
  content: text("content"),
  userId: integer("user_id").references(() => users.id),
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
  subtotal: integer("subtotal").notNull(),
  taxAmount: integer("tax_amount").notNull().default(0),
  total: integer("total").notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  notes: text("notes"),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm billing settings table
export const firmBillingSettings = pgTable("firm_billing_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs table
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

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clientAuth.id),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client auth table
export const clientAuth = pgTable("client_auth", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  loginToken: text("login_token"),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing forms table
export const billingForms = pgTable("billing_forms", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  formType: text("form_type"),
  formData: jsonb("form_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System alerts table
export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  priority: text("priority").notNull().default("normal"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: text("action_url"),
  metadata: jsonb("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar events table
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  clientId: integer("client_id").references(() => clients.id),
  caseId: integer("case_id").references(() => cases.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  eventType: text("event_type").notNull().default("meeting"),
  status: text("status").notNull().default("scheduled"),
  reminderMinutes: integer("reminder_minutes").default(15),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: text("recurrence_rule"),
  attendees: jsonb("attendees"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI triage results table
export const aiTriageResults = pgTable("ai_triage_results", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientIntakeId: integer("client_intake_id").references(() => clientIntakes.id),
  documentId: integer("document_id").references(() => documents.id),
  analysisResults: jsonb("analysis_results").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  recommendedActions: jsonb("recommended_actions"),
  riskAssessment: text("risk_assessment"),
  urgencyLevel: text("urgency_level").notNull().default("medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  status: text("status").notNull().default("pending"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communication logs table
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  clientId: integer("client_id").references(() => clients.id),
  caseId: integer("case_id").references(() => cases.id),
  communicationType: text("communication_type").notNull(),
  direction: text("direction").notNull(),
  subject: text("subject"),
  content: text("content"),
  participants: jsonb("participants"),
  duration: integer("duration"),
  outcome: text("outcome"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  attachments: jsonb("attachments"),
  isConfidential: boolean("is_confidential").default(false),
  billable: boolean("billable").default(true),
  billingRate: integer("billing_rate"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin ghost sessions table
export const adminGhostSessions = pgTable("admin_ghost_sessions", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id).notNull(),
  targetFirmId: integer("target_firm_id").references(() => firms.id).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  purpose: text("purpose").notNull(),
  permissionsGranted: jsonb("permissions_granted"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  actionsPerformed: jsonb("actions_performed"),
  metadata: jsonb("metadata"),
});

// Onboarding sessions table
export const onboardingSessions = pgTable("onboarding_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  adminUserId: integer("admin_user_id").references(() => users.id),
  currentStep: integer("current_step").notNull().default(1),
  stepData: jsonb("step_data"),
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding profiles table
export const onboardingProfiles = pgTable("onboarding_profiles", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  firmId: integer("firm_id").references(() => firms.id),
  status: text("status").notNull().default("in_progress"),
  step1_firmData: jsonb("step1_firm_data"),
  step1_complete: boolean("step1_complete").default(false),
  step1_completedAt: timestamp("step1_completed_at"),
  step2_selectedIntegrations: jsonb("step2_selected_integrations"),
  step2_integrationConfigs: jsonb("step2_integration_configs"),
  step2_complete: boolean("step2_complete").default(false),
  step2_completedAt: timestamp("step2_completed_at"),
  step3_customPrompts: jsonb("step3_custom_prompts"),
  step3_llmSettings: jsonb("step3_llm_settings"),
  step3_complete: boolean("step3_complete").default(false),
  step3_completedAt: timestamp("step3_completed_at"),
  step4_finalConfiguration: jsonb("step4_final_configuration"),
  step4_generatedFile: text("step4_generated_file"),
  step4_complete: boolean("step4_complete").default(false),
  step4_completedAt: timestamp("step4_completed_at"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  notes: text("notes"),
  totalStepsCompleted: integer("total_steps_completed").default(0),
  progressPercentage: integer("progress_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm analysis settings table
export const firmAnalysisSettings = pgTable("firm_analysis_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message threads table
export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").unique(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  title: text("title").notNull(),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => messageThreads.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  content: text("content").notNull(),
  readBy: jsonb("read_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System admins table
export const systemAdmins = pgTable("system_admins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  email: text("email").notNull().unique(),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform settings table
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: text("category"),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document type templates table
export const documentTypeTemplates = pgTable("document_type_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template").notNull(),
  vertical: text("vertical"),
  category: text("category"),
  displayName: text("display_name"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Available integrations table
export const availableIntegrations = pgTable("available_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  configSchema: jsonb("config_schema"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Firm settings table
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

// Platform integrations table
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
  authType: text("auth_type").notNull(),
  status: text("status").default("active"),
  version: text("version"),
  isActive: boolean("is_active").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  planRestrictions: text("plan_restrictions").array(),
  configSchema: jsonb("config_schema"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm integrations table
export const firmIntegrations = pgTable("firm_integrations", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  integrationName: text("integration_name"),
  isEnabled: boolean("is_enabled").default(true),
  status: text("status").default("active"),
  enabledAt: timestamp("enabled_at").defaultNow(),
  name: text("name"),
  configuration: jsonb("configuration"),
  apiCredentials: text("api_credentials"),
  webhookSecret: text("webhook_secret"),
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: text("sync_status").default("pending"),
  errorMessage: text("error_message"),
  enabledBy: integer("enabled_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User integration permissions table
export const userIntegrationPermissions = pgTable("user_integration_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  firmIntegrationId: integer("firm_integration_id").references(() => firmIntegrations.id).notNull(),
  canRead: boolean("can_read").default(true),
  canWrite: boolean("can_write").default(false),
  canConfigure: boolean("can_configure").default(false),
  canDisable: boolean("can_disable").default(false),
  permissions: jsonb("permissions"),
  grantedBy: integer("granted_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration audit logs table
export const integrationAuditLogs = pgTable("integration_audit_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Integration rate limits table
export const integrationRateLimits = pgTable("integration_rate_limits", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationId: integer("integration_id").references(() => platformIntegrations.id).notNull(),
  requestsPerHour: integer("requests_per_hour").default(1000),
  requestsPerDay: integer("requests_per_day").default(10000),
  currentHourlyUsage: integer("current_hourly_usage").default(0),
  currentDailyUsage: integer("current_daily_usage").default(0),
  windowMinutes: integer("window_minutes").default(60),
  currentCount: integer("current_count").default(0),
  maxRequests: integer("max_requests").default(1000),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LLM settings table
export const firmLlmSettings = pgTable("firm_llm_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull().unique(),
  openaiApiKey: text("openai_api_key"),
  anthropicApiKey: text("anthropic_api_key"),
  defaultModel: text("default_model").default("gpt-4o"),
  maxTokens: integer("max_tokens").default(4000),
  temperature: integer("temperature").default(70),
  isActive: boolean("is_active").default(true),
  monthlyTokenLimit: integer("monthly_token_limit").default(1000000),
  currentMonthUsage: integer("current_month_usage").default(0),
  lastUsageReset: timestamp("last_usage_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LLM prompt templates table
export const llmPromptTemplates = pgTable("llm_prompt_templates", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  tabType: text("tab_type").notNull(),
  documentStencilId: integer("document_stencil_id").references(() => documentStencils.id),
  promptName: text("prompt_name").notNull(),
  basePrompt: text("base_prompt").notNull(),
  systemPrompt: text("system_prompt"),
  contextInstructions: text("context_instructions"),
  responseFormat: text("response_format"),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  version: integer("version").default(1),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm prompt configurations table
export const firmPromptConfigurations = pgTable("firm_prompt_configurations", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  tabType: text("tab_type").notNull(),
  templateId: integer("template_id").references(() => llmPromptTemplates.id),
  documentStencilId: integer("document_stencil_id").references(() => documentStencils.id),
  customPrompt: text("custom_prompt"),
  customSystemPrompt: text("custom_system_prompt"),
  customContextInstructions: text("custom_context_instructions"),
  isActive: boolean("is_active").default(true),
  configuredBy: integer("configured_by").references(() => users.id).notNull(),
  lastTestedAt: timestamp("last_tested_at"),
  testResults: jsonb("test_results"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LLM usage logs table
export const llmUsageLogs = pgTable("llm_usage_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  tabType: text("tab_type").notNull(),
  requestType: text("request_type").notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  responseTime: integer("response_time"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  requestHash: text("request_hash"),
  cost: integer("cost"),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// LLM response cache table
export const llmResponseCache = pgTable("llm_response_cache", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  requestHash: text("request_hash").notNull(),
  tabType: text("tab_type").notNull(),
  response: jsonb("response").notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  hitCount: integer("hit_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// LLM providers table
export const llmProviders = pgTable("llm_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  apiKeyName: text("api_key_name").notNull(), // The name of the key in firmLlmSettings, e.g., "openaiApiKey"
  status: text("status").default("active"),
  endpoint: text("endpoint"),
  requiresApiKey: boolean("requires_api_key").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LLM models table
export const llmModels = pgTable("llm_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  providerId: integer("provider_id").references(() => llmProviders.id).notNull(),
  description: text("description"),
  contextWindow: integer("context_window"),
  costPer1kTokens: integer("cost_per_1k_tokens"), // Stored as integer (cost in cents)
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document stencils table
export const documentStencils = pgTable("document_stencils", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fullText: text("full_text").notNull(),
  description: text("description"),
  category: text("category"),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm branding table
export const firmBranding = pgTable("firm_branding", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  secondaryColor: text("secondary_color").default("#64748b"),
  accentColor: text("accent_color").default("#f59e0b"),
  customCss: text("custom_css"),
  headerLogo: text("header_logo"),
  emailLogo: text("email_logo"),
  faviconUrl: text("favicon_url"),
  brandName: text("brand_name"),
  tagline: text("tagline"),
  websiteUrl: text("website_url"),
  socialMedia: jsonb("social_media"),
  brandingSettings: jsonb("branding_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm preferences table
export const firmPreferences = pgTable("firm_preferences", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull().unique(),
  timezone: text("timezone").default("America/New_York"),
  dateFormat: text("date_format").default("MM/DD/YYYY"),
  timeFormat: text("time_format").default("12h"),
  currency: text("currency").default("USD"),
  language: text("language").default("en"),
  notifications: jsonb("notifications"),
  features: jsonb("features"),
  integrationSettings: jsonb("integration_settings"),
  billingSettings: jsonb("billing_settings"),
  securitySettings: jsonb("security_settings"),
  customFields: jsonb("custom_fields"),
  workflowSettings: jsonb("workflow_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Firm templates table
export const firmTemplates = pgTable("firm_templates", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  description: text("description"),
  content: text("content").notNull(),
  variables: jsonb("variables"),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  version: integer("version").default(1),
  metadata: jsonb("metadata"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance agreements table
export const complianceAgreements = pgTable("compliance_agreements", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agreementType: text("agreement_type").notNull(),
  version: text("version").notNull(),
  content: text("content").notNull(),
  isAccepted: boolean("is_accepted").default(false),
  acceptedAt: timestamp("accepted_at"),
  acceptanceIpAddress: text("acceptance_ip_address"),
  acceptanceUserAgent: text("acceptance_user_agent"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
});

// ============================================================================
// INSERT SCHEMAS (AFTER ALL TABLES)
// ============================================================================

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

export const insertOnboardingSessionSchema = createInsertSchema(onboardingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingProfileSchema = createInsertSchema(onboardingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertFirmLlmSettingsSchema = createInsertSchema(firmLlmSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLlmPromptTemplateSchema = createInsertSchema(llmPromptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirmPromptConfigurationSchema = createInsertSchema(firmPromptConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLlmUsageLogSchema = createInsertSchema(llmUsageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertLlmProviderSchema = createInsertSchema(llmProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLlmModelSchema = createInsertSchema(llmModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// TYPE DEFINITIONS (AFTER ALL INSERT SCHEMAS)
// ============================================================================

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

export type InsertOnboardingSession = z.infer<typeof insertOnboardingSessionSchema>;
export type OnboardingSession = typeof onboardingSessions.$inferSelect;

export type InsertOnboardingProfile = z.infer<typeof insertOnboardingProfileSchema>;
export type OnboardingProfile = typeof onboardingProfiles.$inferSelect;

export type InsertClientIntake = z.infer<typeof insertClientIntakeSchema>;
export type ClientIntake = typeof clientIntakes.$inferSelect;

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;

export type InsertFirmAnalysisSettings = z.infer<typeof insertFirmAnalysisSettingsSchema>;
export type FirmAnalysisSettings = typeof firmAnalysisSettings.$inferSelect;

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
export type FirmSetting = typeof firmSettings.$inferSelect;

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

export type InsertLlmSettings = z.infer<typeof insertFirmLlmSettingsSchema>;
export type LlmSettings = typeof firmLlmSettings.$inferSelect;

export type InsertLlmPromptTemplate = z.infer<typeof insertLlmPromptTemplateSchema>;
export type LlmPromptTemplate = typeof llmPromptTemplates.$inferSelect;

export type InsertFirmPromptConfiguration = z.infer<typeof insertFirmPromptConfigurationSchema>;
export type FirmPromptConfiguration = typeof firmPromptConfigurations.$inferSelect;

export type InsertLlmUsageLog = z.infer<typeof insertLlmUsageLogSchema>;
export type LlmUsageLog = typeof llmUsageLogs.$inferSelect;

export type InsertLlmProvider = z.infer<typeof insertLlmProviderSchema>;
export type LlmProvider = typeof llmProviders.$inferSelect;

export type InsertLlmModel = z.infer<typeof insertLlmModelSchema>;
export type LlmModel = typeof llmModels.$inferSelect;
