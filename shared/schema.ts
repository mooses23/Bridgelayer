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

// Messages/notifications system
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  documentId: integer("document_id").references(() => documents.id), // Optional document reference
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"), // info, warning, error, success
  isRead: boolean("is_read").default(false),
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

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAdminSchema = createInsertSchema(systemAdmins).omit({
  id: true,
  createdAt: true,
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
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSystemAdmin = z.infer<typeof insertSystemAdminSchema>;
export type SystemAdmin = typeof systemAdmins.$inferSelect;

// Role enums for type safety
export const UserRole = z.enum(["admin", "firm_admin", "paralegal", "viewer"]);
export const SystemAdminRole = z.enum(["admin", "super_admin"]);
export const FirmPlan = z.enum(["starter", "professional", "enterprise"]);
export const DocumentStatus = z.enum(["uploaded", "processing", "analyzed", "error"]);
export const MessageType = z.enum(["info", "warning", "error", "success"]);
