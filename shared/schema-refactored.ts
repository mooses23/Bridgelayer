// schema-refactored.ts

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, varchar, bigint, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'firm_user']);
export const oauthProviderEnum = pgEnum('oauth_provider', ['google', 'microsoft', 'github']);

// Tenant Management
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
  onboardingCode: text("onboarding_code").unique(),
  onboardingStep: integer("onboarding_step").default(1),
  openaiApiKey: text("openai_api_key"),
  logoUrl: text("logo_url"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone")
});

// User Management
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  oauthProvider: oauthProviderEnum('oauth_provider'),
  oauthId: varchar('oauth_id', { length: 255 }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: roleEnum('role').notNull().default('firm_user'),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
  profilePictureUrl: text("profile_picture_url"),
  phoneNumber: text("phone_number")
});

// Firm Users
export const firmUsers = pgTable('firm_users', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => firms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  isOwner: boolean('is_owner').notNull().default(false),
  role: varchar('role', { length: 255 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Onboarding
export const onboardingProfiles = pgTable("onboarding_profiles", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  firmId: integer("firm_id").references(() => firms.id),
  status: text("status").notNull().default("in_progress"),
  stepData: jsonb("step_data"),
  totalStepsCompleted: integer("total_steps_completed").default(0),
  progressPercentage: integer("progress_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Clients/Cases
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
  secondaryEmail: text("secondary_email"),
  secondaryPhone: text("secondary_phone")
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
  updatedAt: timestamp("updated_at").defaultNow()
});

// Billing
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").notNull().default("draft"),
  amount: integer("amount").notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  paymentMethod: text("payment_method"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Calendar
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  eventType: text("event_type").notNull().default("meeting"),
  status: text("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Documents/Agents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: text("status").default("processing"),
  metadata: jsonb("metadata"),
  documentType: text("document_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  priority: text("priority").notNull().default("normal"),
  isRead: boolean("is_read").default(false),
  expiresAt: timestamp("expires_at"),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Audit/Logging
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// System Settings
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  encrypted: boolean("encrypted").default(false),
  updatedAt: timestamp("updated_at").defaultNow()
});

// System Alerts
export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Communication Logs
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communicationType: text("communication_type").notNull(),
  direction: text("direction").notNull(),
  subject: text("subject"),
  content: text("content"),
  participants: jsonb("participants"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Additional domains (e.g., payments) to be added subsequently following the same pattern.
