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
  settings: jsonb("settings"), // Firm-specific configurations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced users table with firm association and roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("viewer"), // admin, firm_admin, paralegal, viewer
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

// Billing and time tracking tables
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull().default("active"), // active, inactive, archived
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  caseNumber: text("case_number"),
  status: text("status").notNull().default("active"), // active, closed, on_hold
  billingType: text("billing_type").notNull().default("hourly"), // hourly, flat, contingency
  hourlyRate: integer("hourly_rate"), // In cents
  flatFee: integer("flat_fee"), // In cents
  contingencyRate: integer("contingency_rate"), // Percentage * 100
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
  description: text("description").notNull(),
  hours: integer("hours").notNull(), // In minutes for precision
  customField: text("custom_field"), // Additional custom data
  billableRate: integer("billable_rate"), // Rate at time of entry (cents)
  isLocked: boolean("is_locked").default(false),
  lockedAt: timestamp("locked_at"),
  invoiceId: integer("invoice_id"), // Reference to invoice when billed
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
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, cancelled
  subtotal: integer("subtotal").notNull(), // In cents
  taxAmount: integer("tax_amount").default(0), // In cents
  total: integer("total").notNull(), // In cents
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  terms: text("terms"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  timeLogId: integer("time_log_id").references(() => timeLogs.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1), // Hours or units
  rate: integer("rate").notNull(), // Rate per unit in cents
  amount: integer("amount").notNull(), // Total in cents
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const firmBillingSettings = pgTable("firm_billing_settings", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  defaultHourlyRate: integer("default_hourly_rate").default(25000), // $250.00 in cents
  defaultFlatRate: integer("default_flat_rate").default(500000), // $5000.00 in cents
  defaultContingencyRate: integer("default_contingency_rate").default(3300), // 33% as 3300
  invoiceTerms: text("invoice_terms").default("Payment due within 30 days"),
  logoUrl: text("logo_url"),
  billingPlatform: text("billing_platform"), // stripe, lawpay, other
  billingPlatformUrl: text("billing_platform_url"), // iframe/embed URL
  lockTimeLogsAfterDays: integer("lock_time_logs_after_days").default(30),
  hideAnalyticsTab: boolean("hide_analytics_tab").default(false),
  billingEnabled: boolean("billing_enabled").default(false),
  // Stripe integration
  stripeEnabled: boolean("stripe_enabled").default(false),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  stripeWebhookSecret: text("stripe_webhook_secret"),
  // LawPay integration
  lawpayEnabled: boolean("lawpay_enabled").default(false),
  lawpayApiKey: text("lawpay_api_key"),
  lawpayMerchantId: text("lawpay_merchant_id"),
  // Client portal settings
  clientPortalEnabled: boolean("client_portal_enabled").default(false),
  requireClientLogin: boolean("require_client_login").default(true),
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
  canViewReports: boolean("can_view_reports").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  createdAt: true,
});

export const insertFirmBillingSettingsSchema = createInsertSchema(firmBillingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingPermissionSchema = createInsertSchema(billingPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Payment processing tables
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  clientId: integer("client_id").references(() => clients.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  lawpayTransactionId: text("lawpay_transaction_id"),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull().default("pending"), // PaymentStatus enum
  paymentMethod: text("payment_method"), // card, bank_transfer, etc
  processedAt: timestamp("processed_at"),
  webhookVerified: boolean("webhook_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client authentication for portal access
export const clientAuth = pgTable("client_auth", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  loginToken: text("login_token"), // For secure one-click links
  tokenExpiresAt: timestamp("token_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing audit logs
export const billingAuditLogs = pgTable("billing_audit_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // time_log, invoice, payment, etc
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Billing forms storage (for AI-powered form generation)
export const billingForms = pgTable("billing_forms", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  formType: text("form_type").notNull(), // 1099, invoice_template, etc
  formName: text("form_name").notNull(),
  formData: jsonb("form_data").notNull(),
  templatePath: text("template_path"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System alerts for admins
export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  alertType: text("alert_type").notNull(), // billing_disabled, storage_high, payment_failed
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("info"), // info, warning, error, critical
  isRead: boolean("is_read").default(false),
  readBy: integer("read_by").references(() => users.id),
  readAt: timestamp("read_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional insert schemas for new tables
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

export const insertBillingAuditLogSchema = createInsertSchema(billingAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBillingFormSchema = createInsertSchema(billingForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
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
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertClientAuth = z.infer<typeof insertClientAuthSchema>;
export type ClientAuth = typeof clientAuth.$inferSelect;
export type InsertBillingAuditLog = z.infer<typeof insertBillingAuditLogSchema>;
export type BillingAuditLog = typeof billingAuditLogs.$inferSelect;
export type InsertBillingForm = z.infer<typeof insertBillingFormSchema>;
export type BillingForm = typeof billingForms.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;

// Role enums for type safety
export const UserRole = z.enum(["admin", "firm_admin", "paralegal", "viewer"]);
export const SystemAdminRole = z.enum(["admin", "super_admin"]);
export const FirmPlan = z.enum(["starter", "professional", "enterprise"]);
export const DocumentStatus = z.enum(["uploaded", "processing", "analyzed", "error"]);
export const MessageType = z.enum(["info", "warning", "error", "success"]);
export const BillingType = z.enum(["hourly", "flat", "contingency"]);
export const InvoiceStatus = z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]);
export const PaymentStatus = z.enum(["pending", "processing", "succeeded", "failed", "refunded"]);
