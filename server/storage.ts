import {
  type User,
  type InsertUser,
  type Firm,
  type InsertFirm,
  type Document,
  type InsertDocument,
  type DocumentAnalysis,
  type InsertAnalysis,
  type FirmAnalysisSettings,
  type InsertFirmAnalysisSettings,
  type Folder,
  type InsertFolder,
  type Message,
  type InsertMessage,
  type SystemAdmin,
  type InsertSystemAdmin,
  users,
  firms,
  documents,
  documentAnalyses,
  firmAnalysisSettings,
  folders,
  messages,
  systemAdmins,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Firm management
  createFirm(firm: InsertFirm): Promise<Firm>;
  getFirm(id: number): Promise<Firm | undefined>;
  getFirmBySlug(slug: string): Promise<Firm | undefined>;
  updateFirm(id: number, updates: Partial<Firm>): Promise<Firm | undefined>;
  
  // User management with multi-tenancy
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByFirm(firmId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Folder management
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFirmFolders(firmId: number): Promise<Folder[]>;
  getFolderById(id: number, firmId: number): Promise<Folder | undefined>;
  updateFolder(id: number, updates: Partial<Folder>): Promise<Folder | undefined>;
  deleteFolder(id: number, firmId: number): Promise<boolean>;
  
  // Document management with firm isolation
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number, firmId: number): Promise<Document | undefined>;
  getFirmDocuments(firmId: number): Promise<Document[]>;
  getFolderDocuments(folderId: number, firmId: number): Promise<Document[]>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number, firmId: number): Promise<boolean>;
  
  // Analysis management
  createAnalysis(analysis: InsertAnalysis): Promise<DocumentAnalysis>;
  getDocumentAnalyses(documentId: number): Promise<DocumentAnalysis[]>;
  getAnalysisByType(documentId: number, type: string): Promise<DocumentAnalysis | undefined>;
  
  // Firm analysis settings
  getFirmAnalysisSettings(firmId: number): Promise<FirmAnalysisSettings | undefined>;
  updateFirmAnalysisSettings(firmId: number, settings: Partial<FirmAnalysisSettings>): Promise<FirmAnalysisSettings>;
  createFirmAnalysisSettings(settings: InsertFirmAnalysisSettings): Promise<FirmAnalysisSettings>;
  
  // Messages system
  createMessage(message: InsertMessage): Promise<Message>;
  getFirmMessages(firmId: number): Promise<Message[]>;
  getUserMessages(userId: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // System admin management
  createSystemAdmin(admin: InsertSystemAdmin): Promise<SystemAdmin>;
  getSystemAdmin(id: number): Promise<SystemAdmin | undefined>;
  getSystemAdminByEmail(email: string): Promise<SystemAdmin | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Firm management
  async createFirm(insertFirm: InsertFirm): Promise<Firm> {
    const [firm] = await db
      .insert(firms)
      .values(insertFirm)
      .returning();
    return firm;
  }

  async getFirm(id: number): Promise<Firm | undefined> {
    const [firm] = await db.select().from(firms).where(eq(firms.id, id));
    return firm || undefined;
  }

  async getFirmBySlug(slug: string): Promise<Firm | undefined> {
    const [firm] = await db.select().from(firms).where(eq(firms.slug, slug));
    return firm || undefined;
  }

  async updateFirm(id: number, updates: Partial<Firm>): Promise<Firm | undefined> {
    const [firm] = await db
      .update(firms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(firms.id, id))
      .returning();
    return firm || undefined;
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByFirm(firmId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.firmId, firmId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Folder management
  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const [folder] = await db
      .insert(folders)
      .values(insertFolder)
      .returning();
    return folder;
  }

  async getFirmFolders(firmId: number): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.firmId, firmId));
  }

  async getFolderById(id: number, firmId: number): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.firmId, firmId)));
    return folder || undefined;
  }

  async updateFolder(id: number, updates: Partial<Folder>): Promise<Folder | undefined> {
    const [folder] = await db
      .update(folders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning();
    return folder || undefined;
  }

  async deleteFolder(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.firmId, firmId)));
    return result.rowCount > 0;
  }

  // Document management with firm isolation
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getDocument(id: number, firmId: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.firmId, firmId)));
    return document || undefined;
  }

  async getFirmDocuments(firmId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.firmId, firmId))
      .orderBy(desc(documents.uploadedAt));
  }

  async getFolderDocuments(folderId: number, firmId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.folderId, folderId), eq(documents.firmId, firmId)))
      .orderBy(desc(documents.uploadedAt));
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.firmId, firmId)));
    return result.rowCount > 0;
  }

  // Analysis management
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<DocumentAnalysis> {
    const [analysis] = await db
      .insert(documentAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getDocumentAnalyses(documentId: number): Promise<DocumentAnalysis[]> {
    return await db.select().from(documentAnalyses).where(eq(documentAnalyses.documentId, documentId));
  }

  async getAnalysisByType(documentId: number, type: string): Promise<DocumentAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(documentAnalyses)
      .where(and(
        eq(documentAnalyses.documentId, documentId),
        eq(documentAnalyses.analysisType, type)
      ));
    return analysis || undefined;
  }

  // Firm analysis settings
  async getFirmAnalysisSettings(firmId: number): Promise<FirmAnalysisSettings | undefined> {
    const [settings] = await db
      .select()
      .from(firmAnalysisSettings)
      .where(eq(firmAnalysisSettings.firmId, firmId));
    return settings || undefined;
  }

  async updateFirmAnalysisSettings(firmId: number, updates: Partial<FirmAnalysisSettings>): Promise<FirmAnalysisSettings> {
    const [settings] = await db
      .update(firmAnalysisSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(firmAnalysisSettings.firmId, firmId))
      .returning();
    return settings;
  }

  async createFirmAnalysisSettings(insertSettings: InsertFirmAnalysisSettings): Promise<FirmAnalysisSettings> {
    const [settings] = await db
      .insert(firmAnalysisSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  // Messages system
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getFirmMessages(firmId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.firmId, firmId))
      .orderBy(desc(messages.createdAt));
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.toUserId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
    return result.rowCount > 0;
  }

  // System admin management
  async createSystemAdmin(insertAdmin: InsertSystemAdmin): Promise<SystemAdmin> {
    const [admin] = await db
      .insert(systemAdmins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async getSystemAdmin(id: number): Promise<SystemAdmin | undefined> {
    const [admin] = await db.select().from(systemAdmins).where(eq(systemAdmins.id, id));
    return admin || undefined;
  }

  async getSystemAdminByEmail(email: string): Promise<SystemAdmin | undefined> {
    const [admin] = await db.select().from(systemAdmins).where(eq(systemAdmins.email, email));
    return admin || undefined;
  }
}

export const storage = new DatabaseStorage();