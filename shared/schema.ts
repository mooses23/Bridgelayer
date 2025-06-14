import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  documentType: text("document_type"),
  content: text("content"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  analyzedAt: timestamp("analyzed_at"),
});

export const documentAnalyses = pgTable("document_analyses", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  analysisType: text("analysis_type").notNull(), // 'summarization', 'risk', 'clause', 'cross_reference', 'formatting'
  result: jsonb("result").notNull(),
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisFeatures = pgTable("analysis_features", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  summarization: boolean("summarization").default(true),
  riskAnalysis: boolean("risk_analysis").default(true),
  clauseExtraction: boolean("clause_extraction").default(true),
  crossReference: boolean("cross_reference").default(false),
  formatting: boolean("formatting").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  analyzedAt: true,
});

export const insertAnalysisSchema = createInsertSchema(documentAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertAnalysisFeaturesSchema = createInsertSchema(analysisFeatures).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type DocumentAnalysis = typeof documentAnalyses.$inferSelect;
export type InsertAnalysisFeatures = z.infer<typeof insertAnalysisFeaturesSchema>;
export type AnalysisFeatures = typeof analysisFeatures.$inferSelect;
