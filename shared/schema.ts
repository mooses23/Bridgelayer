import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Firms table for multi-tenancy
export const firms = pgTable("firms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  domain: text("domain"), // Custom domain if configured
  plan: text("plan").notNull().default("starter"), // starter, professional, enterprise
  status: text("status").notNull().default("active"), // active, suspended, trial
  onboarded: boolean("onboarded").notNull().default(false), // Onboarding completion status
  settings: jsonb("settings"), // Firm-specific configurations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced users table with firm association and roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id), // Made nullable for admin users
  email: text("email").notNull().unique(),
  username: text("username"),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("viewer"), // admin, firm_owner, firm_user, viewer
  status: text("status").notNull().default("active"), // active, inactive, pending
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Folders for organizing documents within firms
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  parentId: integer("parent_id"), // Self-reference for nested folders
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced documents table with firm isolation and folder organization
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  folderId: integer("folder_id").references(() => folders.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  documentType: text("document_type"),
  content: text("content"),
  tags: text("tags").array(), // For categorization
  status: text("status").notNull().default("uploaded"), // uploaded, processing, analyzed, error
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  analyzedAt: timestamp("analyzed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentAnalyses = pgTable("document_analyses", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  analysisType: text("analysis_type").notNull(), // 'summarization', 'risk', 'clause', 'cross_reference', 'formatting'
  result: jsonb("result").notNull(),
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

// Firm-level analysis feature configuration
export const firmAnalysisSettings = pgTable("firm_analysis_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  summarization: boolean("summarization").default(true),
  riskAnalysis: boolean("risk_analysis").default(true),
  clauseExtraction: boolean("clause_extraction").default(true),
  crossReference: boolean("cross_reference").default(false),
  formatting: boolean("formatting").default(true),
  autoAnalysis: boolean("auto_analysis").default(false), // Auto-analyze on upload
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message threads for structured conversations
export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  threadId: text("thread_id").notNull().unique(), // UUID for thread identification
  title: text("title").notNull(),
  documentId: integer("document_id").references(() => documents.id), // Optional document reference
  filename: text("filename"), // Associated filename if document-related
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced messages system with threading and role-based communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").references(() => messageThreads.threadId).notNull(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  senderId: integer("sender_id").references(() => users.id),
  senderRole: text("sender_role").notNull(), // paralegal, firm_admin, bridge
  senderName: text("sender_name").notNull(),
  recipientRole: text("recipient_role"), // admin, bridge, or null for thread-wide
  content: text("content").notNull(),
  isSystemMessage: boolean("is_system_message").default(false), // For BridgeLayer automated messages
  readBy: jsonb("read_by").default('[]'), // Array of user IDs who have read this message
  createdAt: timestamp("created_at").defaultNow(),
});

// System-wide admin users (BridgeLayer staff)
export const systemAdmins = pgTable("system_admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Firm integrations (third-party services)
export const firmIntegrations = pgTable("firm_integrations", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  integrationName: text("integration_name").notNull(), // google_drive, dropbox, sharepoint, etc.
  isEnabled: boolean("is_enabled").default(false),
  oauthData: jsonb("oauth_data"), // OAuth tokens and configuration
  settings: jsonb("settings"), // Integration-specific settings
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Global platform settings (admin controls)
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // ai_features_enabled, max_documents_per_firm, etc.
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category").notNull(), // ai, limits, billing, features
  updatedBy: integer("updated_by").references(() => systemAdmins.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document type templates (admin-managed)
export const documentTypeTemplates = pgTable("document_type_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // nda, lease, employment, etc.
  displayName: text("display_name").notNull(),
  category: text("category").notNull(), // corporate, real_estate, employment, etc.
  vertical: text("vertical").notNull().default("firmsync"), // firmsync, medsync, edusync, hrsync
  defaultConfig: jsonb("default_config").notNull(), // Default analysis configuration
  promptOverride: text("prompt_override"), // Custom prompt module override
  keywords: text("keywords").array(), // Detection keywords
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => systemAdmins.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Available integrations (admin-defined)
export const availableIntegrations = pgTable("available_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // google_drive, dropbox, sharepoint
  displayName: text("display_name").notNull(),
  description: text("description"),
  oauthConfig: jsonb("oauth_config"), // OAuth endpoints and configuration
  isActive: boolean("is_active").default(true),
  requiresSetup: boolean("requires_setup").default(true),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logging table for compliance firewall
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  actorId: integer("actor_id").references(() => users.id).notNull(),
  actorName: text("actor_name").notNull(), // Store name for immutable record
  action: text("action").notNull(), // DOC_UPLOAD, DOC_REVIEW_COMPLETED, CONFIG_CHANGE, etc.
  resourceType: text("resource_type").notNull(), // 'document', 'user', 'firm', 'settings'
  resourceId: text("resource_id"), // ID of the affected resource
  details: jsonb("details"), // Additional context about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Notifications table for awareness engine
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'ai_review_ready', 'reviewer_assigned', 'message_received', 'high_risk_detected'
  title: text("title").notNull(),
  message: text("message").notNull(),
  resourceType: text("resource_type"), // 'document', 'message', 'review'
  resourceId: text("resource_id"), // ID of related resource
  isRead: boolean("is_read").default(false),
  isEmailSent: boolean("is_email_sent").default(false),
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// CRM Communication Logs for tracking client interactions
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clientIntakes.id).notNull(),
  caseId: integer("case_id").references(() => cases.id),
  userId: integer("user_id").references(() => users.id).notNull(), // Who logged the communication
  type: text("type").notNull(), // 'call', 'email', 'meeting', 'note', 'document_shared', 'invoice_sent', 'auto_system'
  direction: text("direction"), // 'inbound', 'outbound' (null for notes)
  subject: text("subject"),
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // Array of file references
  metadata: jsonb("metadata"), // Additional context (duration for calls, email headers, etc.)
  isPrivate: boolean("is_private").default(true), // Always private to firm, not shown to clients
  tags: text("tags").array(), // For categorization and filtering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Ghost Mode Sessions for super-admin firm simulation
export const adminGhostSessions = pgTable("admin_ghost_sessions", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id).notNull(),
  targetFirmId: integer("target_firm_id").references(() => firms.id).notNull(),
  sessionToken: uuid("session_token").defaultRandom().notNull().unique(),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions"), // What the admin can access in ghost mode
  auditTrail: jsonb("audit_trail"), // Track actions taken during ghost session
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Firm Form Templates for document generation
export const firmFormTemplates = pgTable("firm_form_templates", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  name: text("name").notNull(),
  documentType: text("document_type").notNull(), // 'eviction-notice', 'lease-agreement', etc.
  templateContent: text("template_content").notNull(), // The actual template content
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  isActive: boolean("is_active").default(true),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated Documents Log
export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentType: text("document_type").notNull(),
  county: text("county").notNull(),
  templateId: integer("template_id").references(() => firmFormTemplates.id),
  formData: jsonb("form_data").notNull(), // The input data used for generation
  generatedContent: text("generated_content").notNull(),
  aiPrompt: text("ai_prompt"), // The AI prompt used for generation
  status: text("status").notNull().default("generated"), // 'generated', 'downloaded', 'uploaded_to_cloud'
  createdAt: timestamp("created_at").defaultNow(),
});

// Missing tables that are referenced in storage.ts
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

export const billingPermissions = pgTable("billing_permissions", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  canViewBilling: boolean("can_view_billing").default(false),
  canEditBilling: boolean("can_edit_billing").default(false),
  canCreateInvoices: boolean("can_create_invoices").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const firmBillingSettings = pgTable("firm_billing_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  settings: jsonb("settings").notNull(),
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

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  analyzedAt: true,
  updatedAt: true,
});

export const insertAnalysisSchema = createInsertSchema(documentAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertFirmAnalysisSettingsSchema = createInsertSchema(firmAnalysisSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAdminSchema = createInsertSchema(systemAdmins).omit({
  id: true,
  createdAt: true,
});

export const insertFirmIntegrationSchema = createInsertSchema(firmIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertDocumentTypeTemplateSchema = createInsertSchema(documentTypeTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailableIntegrationSchema = createInsertSchema(availableIntegrations).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});



// Court Calendar Events table
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  caseId: integer("case_id").references(() => cases.id),
  clientId: integer("client_id").references(() => clients.id),
  documentId: integer("document_id").references(() => documents.id), // Source document if AI-suggested
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // hearing, trial, deposition, deadline, meeting
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  isAllDay: boolean("is_all_day").default(false),
  isAiSuggested: boolean("is_ai_suggested").default(false), // Auto-suggested from document analysis
  aiConfidence: integer("ai_confidence"), // 0-100 confidence score
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, rescheduled
  reminderMinutes: integer("reminder_minutes").default(60), // Minutes before event to remind
  googleCalendarId: text("google_calendar_id"), // Sync with Google Calendar
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client Intake Forms table
export const clientIntakes = pgTable("client_intakes", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  intakeNumber: text("intake_number").notNull().unique(), // Auto-generated reference
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  region: text("region").notNull(), // Region/County dropdown
  matterType: text("matter_type").notNull(), // Matter Type (Eviction, Rent Increase, etc.)
  caseType: text("case_type").notNull(), // dropdown selection
  urgencyLevel: text("urgency_level").notNull(), // low, medium, high, urgent
  caseDescription: text("case_description").notNull(),
  preferredContactMethod: text("preferred_contact_method").notNull().default("email"),
  availableTimeSlots: text("available_time_slots").array(), // For scheduling
  documentIds: text("document_ids").array(), // Uploaded documents with intake
  status: text("status").notNull().default("received"), // received, drafted, filed, archived
  assignedTo: integer("assigned_to").references(() => users.id), // Assigned reviewer
  aiTriageData: jsonb("ai_triage_data"), // AI analysis results
  followUpDate: timestamp("follow_up_date"),
  isPortalEnabled: boolean("is_portal_enabled").default(true), // Firm can enable/disable portal
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Triage Results table
export const aiTriageResults = pgTable("ai_triage_results", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  intakeId: integer("intake_id").references(() => clientIntakes.id),
  documentId: integer("document_id").references(() => documents.id),
  resourceType: text("resource_type").notNull(), // intake, document
  aiCaseType: text("ai_case_type").notNull(), // AI-detected case category
  aiUrgencyLevel: text("ai_urgency_level").notNull(), // AI-assessed urgency
  aiRecommendedActions: text("ai_recommended_actions").array(), // Array of next steps
  aiSummary: text("ai_summary").notNull(), // Brief AI-generated summary
  aiConfidenceScore: integer("ai_confidence_score").notNull(), // 0-100
  suggestedAssignee: integer("suggested_assignee").references(() => users.id), // AI-recommended reviewer
  flaggedIssues: text("flagged_issues").array(), // Potential red flags
  estimatedComplexity: text("estimated_complexity").notNull(), // low, medium, high
  isHumanReviewed: boolean("is_human_reviewed").default(false),
  humanOverride: jsonb("human_override"), // Human edits to AI assessment
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Insert schemas for new tables
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
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

export const insertAiTriageResultSchema = createInsertSchema(aiTriageResults).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
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

// Add missing insert schemas for new tables
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

// Types
export type InsertFirm = z.infer<typeof insertFirmSchema>;
export type Firm = typeof firms.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type DocumentAnalysis = typeof documentAnalyses.$inferSelect;
export type InsertFirmAnalysisSettings = z.infer<typeof insertFirmAnalysisSettingsSchema>;
export type FirmAnalysisSettings = typeof firmAnalysisSettings.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSystemAdmin = z.infer<typeof insertSystemAdminSchema>;
export type SystemAdmin = typeof systemAdmins.$inferSelect;
export type InsertFirmIntegration = z.infer<typeof insertFirmIntegrationSchema>;
export type FirmIntegration = typeof firmIntegrations.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertDocumentTypeTemplate = z.infer<typeof insertDocumentTypeTemplateSchema>;
export type DocumentTypeTemplate = typeof documentTypeTemplates.$inferSelect;
export type InsertAvailableIntegration = z.infer<typeof insertAvailableIntegrationSchema>;
export type AvailableIntegration = typeof availableIntegrations.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertClientIntake = z.infer<typeof insertClientIntakeSchema>;
export type ClientIntake = typeof clientIntakes.$inferSelect;
export type InsertAiTriageResult = z.infer<typeof insertAiTriageResultSchema>;
export type AiTriageResult = typeof aiTriageResults.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertAdminGhostSession = z.infer<typeof insertAdminGhostSessionSchema>;
export type AdminGhostSession = typeof adminGhostSessions.$inferSelect;

// Add missing types for new tables
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

// Insert schemas for billing tables (moved after table definitions)
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

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
});

export const insertFirmBillingSettingsSchema = createInsertSchema(firmBillingSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertBillingPermissionSchema = createInsertSchema(billingPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for billing tables
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertTimeLog = z.infer<typeof insertTimeLogSchema>;
export type TimeLog = typeof timeLogs.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertFirmBillingSettings = z.infer<typeof insertFirmBillingSettingsSchema>;
export type FirmBillingSettings = typeof firmBillingSettings.$inferSelect;
export type InsertBillingPermission = z.infer<typeof insertBillingPermissionSchema>;
export type BillingPermission = typeof billingPermissions.$inferSelect;

// Role enums for type safety
export const UserRole = z.enum(["admin", "firm_admin", "paralegal", "viewer"]);
export const SystemAdminRole = z.enum(["admin", "super_admin"]);
export const FirmPlan = z.enum(["starter", "professional", "enterprise"]);
export const DocumentStatus = z.enum(["uploaded", "processing", "analyzed", "error"]);
export const MessageType = z.enum(["info", "warning", "error", "success"]);
export const BillingType = z.enum(["hourly", "flat", "contingency"]);
export const InvoiceStatus = z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]);
export const PaymentStatus = z.enum(["pending", "processing", "succeeded", "failed", "refunded"]);
