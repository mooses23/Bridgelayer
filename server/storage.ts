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
  type MessageThread,
  type InsertMessageThread,
  type SystemAdmin,
  type InsertSystemAdmin,
  type FirmIntegration,
  type InsertFirmIntegration,
  type PlatformSetting,
  type InsertPlatformSetting,
  type DocumentTypeTemplate,
  type InsertDocumentTypeTemplate,
  type AvailableIntegration,
  type InsertAvailableIntegration,
  type AuditLog,
  type InsertAuditLog,
  type Notification,
  type InsertNotification,
  type CalendarEvent,
  type InsertCalendarEvent,
  type ClientIntake,
  type InsertClientIntake,
  type AiTriageResult,
  type InsertAiTriageResult,
  type CommunicationLog,
  type InsertCommunicationLog,
  type AdminGhostSession,
  type InsertAdminGhostSession,
  type Client,
  type InsertClient,
  type Case,
  type InsertCase,
  type TimeLog,
  type InsertTimeLog,
  type Invoice,
  type InsertInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type FirmBillingSettings,
  type InsertFirmBillingSettings,
  type BillingPermission,
  type InsertBillingPermission,
  users,
  firms,
  documents,
  documentAnalyses,
  clients,
  cases,
  timeLogs,
  invoices,
  invoiceLineItems,
  firmBillingSettings,
  billingPermissions,
  firmAnalysisSettings,
  messageThreads,
  folders,
  messages,
  systemAdmins,
  firmIntegrations,
  platformSettings,
  documentTypeTemplates,
  availableIntegrations,
  auditLogs,
  notifications,
  calendarEvents,
  clientIntakes,
  aiTriageResults,
  communicationLogs,
  adminGhostSessions,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, isNull } from "drizzle-orm";

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
  
  // Message threads system
  createMessageThread(thread: InsertMessageThread): Promise<MessageThread>;
  getMessageThread(threadId: string): Promise<MessageThread | undefined>;
  getFirmMessageThreads(firmId: number): Promise<MessageThread[]>;
  updateMessageThread(threadId: string, updates: Partial<MessageThread>): Promise<MessageThread | undefined>;
  resolveMessageThread(threadId: string, resolvedBy: number): Promise<boolean>;
  
  // Messages system
  createMessage(message: InsertMessage): Promise<Message>;
  getThreadMessages(threadId: string): Promise<Message[]>;
  getFirmMessages(firmId: number): Promise<Message[]>;
  markMessageAsRead(messageId: number, userId: number): Promise<boolean>;
  getUnreadMessageCount(userId: number): Promise<number>;
  
  // System admin management
  createSystemAdmin(admin: InsertSystemAdmin): Promise<SystemAdmin>;
  getSystemAdmin(id: number): Promise<SystemAdmin | undefined>;
  getSystemAdminByEmail(email: string): Promise<SystemAdmin | undefined>;
  
  // Admin panel operations - Firm management
  getAllFirms(): Promise<Firm[]>;
  updateFirmVertical(firmId: number, vertical: string): Promise<Firm | undefined>;
  
  // Admin panel operations - Integration management
  getAvailableIntegrations(): Promise<AvailableIntegration[]>;
  createAvailableIntegration(integration: InsertAvailableIntegration): Promise<AvailableIntegration>;
  updateAvailableIntegration(id: number, updates: Partial<AvailableIntegration>): Promise<AvailableIntegration | undefined>;
  getFirmIntegrations(firmId: number): Promise<FirmIntegration[]>;
  updateFirmIntegration(firmId: number, integrationName: string, updates: Partial<FirmIntegration>): Promise<FirmIntegration | undefined>;
  
  // Admin panel operations - Document type templates
  getDocumentTypeTemplates(): Promise<DocumentTypeTemplate[]>;
  createDocumentTypeTemplate(template: InsertDocumentTypeTemplate): Promise<DocumentTypeTemplate>;
  updateDocumentTypeTemplate(id: number, updates: Partial<DocumentTypeTemplate>): Promise<DocumentTypeTemplate | undefined>;
  deleteDocumentTypeTemplate(id: number): Promise<boolean>;
  
  // Admin panel operations - Platform settings
  getPlatformSettings(): Promise<PlatformSetting[]>;
  updatePlatformSetting(key: string, value: any, adminId: number): Promise<PlatformSetting | undefined>;
  createPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting>;
  
  // Audit logging operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getFirmAuditLogs(firmId: number, limit?: number): Promise<AuditLog[]>;
  getAuditLogsByAction(firmId: number, action: string): Promise<AuditLog[]>;
  getAuditLogsByDateRange(firmId: number, startDate: Date, endDate: Date): Promise<AuditLog[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number, firmId: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number, firmId: number): Promise<number>;
  getFirmNotifications(firmId: number): Promise<Notification[]>;
  deleteNotification(notificationId: number, userId: number): Promise<boolean>;
  
  // Billing operations
  createClient(client: InsertClient): Promise<Client>;
  getFirmClients(firmId: number): Promise<Client[]>;
  getClient(id: number, firmId: number): Promise<Client | undefined>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number, firmId: number): Promise<boolean>;
  
  createCase(caseData: InsertCase): Promise<Case>;
  getFirmCases(firmId: number): Promise<Case[]>;
  getClientCases(clientId: number, firmId: number): Promise<Case[]>;
  getCase(id: number, firmId: number): Promise<Case | undefined>;
  updateCase(id: number, updates: Partial<Case>): Promise<Case | undefined>;
  deleteCase(id: number, firmId: number): Promise<boolean>;
  
  createTimeLog(timeLog: InsertTimeLog): Promise<TimeLog>;
  getFirmTimeLogs(firmId: number): Promise<TimeLog[]>;
  getUserTimeLogs(userId: number, firmId: number): Promise<TimeLog[]>;
  getTimeLog(id: number, firmId: number): Promise<TimeLog | undefined>;
  updateTimeLog(id: number, updates: Partial<TimeLog>): Promise<TimeLog | undefined>;
  deleteTimeLog(id: number, firmId: number): Promise<boolean>;
  lockTimeLog(id: number, firmId: number): Promise<boolean>;
  getUnbilledTimeLogs(firmId: number): Promise<TimeLog[]>;
  
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getFirmInvoices(firmId: number): Promise<Invoice[]>;
  getClientInvoices(clientId: number, firmId: number): Promise<Invoice[]>;
  getInvoice(id: number, firmId: number): Promise<Invoice | undefined>;
  updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number, firmId: number): Promise<boolean>;
  
  createInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  getInvoiceLineItems(invoiceId: number): Promise<InvoiceLineItem[]>;
  updateInvoiceLineItem(id: number, updates: Partial<InvoiceLineItem>): Promise<InvoiceLineItem | undefined>;
  deleteInvoiceLineItem(id: number): Promise<boolean>;
  reorderInvoiceLineItems(invoiceId: number, itemIds: number[]): Promise<boolean>;
  
  getFirmBillingSettings(firmId: number): Promise<FirmBillingSettings | undefined>;
  updateFirmBillingSettings(firmId: number, settings: Partial<FirmBillingSettings>): Promise<FirmBillingSettings>;
  createFirmBillingSettings(settings: InsertFirmBillingSettings): Promise<FirmBillingSettings>;
  
  getBillingPermissions(userId: number, firmId: number): Promise<BillingPermission | undefined>;
  updateBillingPermissions(userId: number, firmId: number, permissions: Partial<BillingPermission>): Promise<BillingPermission>;
  createBillingPermissions(permissions: InsertBillingPermission): Promise<BillingPermission>;
  
  // Calendar Events
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getFirmCalendarEvents(firmId: number): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number, firmId: number): Promise<CalendarEvent | undefined>;
  updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number, firmId: number): Promise<boolean>;
  getUpcomingEvents(firmId: number, days: number): Promise<CalendarEvent[]>;
  
  // Client Intakes
  createClientIntake(intake: InsertClientIntake): Promise<ClientIntake>;
  getFirmClientIntakes(firmId: number): Promise<ClientIntake[]>;
  getClientIntake(id: number, firmId: number): Promise<ClientIntake | undefined>;
  updateClientIntake(id: number, updates: Partial<ClientIntake>): Promise<ClientIntake | undefined>;
  deleteClientIntake(id: number, firmId: number): Promise<boolean>;
  getIntakesByStatus(firmId: number, status: string): Promise<ClientIntake[]>;
  
  // AI Triage Results
  createAiTriageResult(result: InsertAiTriageResult): Promise<AiTriageResult>;
  getAiTriageResult(id: number, firmId: number): Promise<AiTriageResult | undefined>;
  getTriageResultByIntake(intakeId: number, firmId: number): Promise<AiTriageResult | undefined>;
  getTriageResultByDocument(documentId: number, firmId: number): Promise<AiTriageResult | undefined>;
  updateAiTriageResult(id: number, updates: Partial<AiTriageResult>): Promise<AiTriageResult | undefined>;
  getFirmTriageResults(firmId: number): Promise<AiTriageResult[]>;
  
  // CRM Communication Logs
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  getFirmCommunicationLogs(firmId: number): Promise<CommunicationLog[]>;
  getClientCommunicationLogs(clientId: number, firmId: number): Promise<CommunicationLog[]>;
  getCaseCommunicationLogs(caseId: number, firmId: number): Promise<CommunicationLog[]>;
  getCommunicationLog(id: number, firmId: number): Promise<CommunicationLog | undefined>;
  updateCommunicationLog(id: number, updates: Partial<CommunicationLog>): Promise<CommunicationLog | undefined>;
  deleteCommunicationLog(id: number, firmId: number): Promise<boolean>;
  
  // Admin Ghost Mode
  createAdminGhostSession(session: InsertAdminGhostSession): Promise<AdminGhostSession>;
  getActiveGhostSessions(adminUserId: number): Promise<AdminGhostSession[]>;
  getGhostSessionByToken(sessionToken: string): Promise<AdminGhostSession | undefined>;
  endGhostSession(sessionToken: string): Promise<boolean>;
  updateGhostSessionAuditTrail(sessionToken: string, auditTrail: any): Promise<AdminGhostSession | undefined>;
  
  // Document Generation
  getFirmTemplates(firmId: number): Promise<any[]>;
  saveGeneratedDocument(data: {
    firmId: number;
    userId: number;
    documentType: string;
    county: string;
    formData: any;
    generatedContent: string;
    aiPrompt: string;
  }): Promise<any>;
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
    return (result.rowCount || 0) > 0;
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
    return (result.rowCount || 0) > 0;
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

  // Message threads system
  async createMessageThread(insertThread: InsertMessageThread): Promise<MessageThread> {
    const [thread] = await db
      .insert(messageThreads)
      .values(insertThread)
      .returning();
    return thread;
  }

  async getMessageThread(threadId: string): Promise<MessageThread | undefined> {
    const [thread] = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.threadId, threadId));
    return thread;
  }

  async getFirmMessageThreads(firmId: number): Promise<MessageThread[]> {
    return await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.firmId, firmId))
      .orderBy(desc(messageThreads.updatedAt));
  }

  async updateMessageThread(threadId: string, updates: Partial<MessageThread>): Promise<MessageThread | undefined> {
    const [thread] = await db
      .update(messageThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(messageThreads.threadId, threadId))
      .returning();
    return thread;
  }

  async resolveMessageThread(threadId: string, resolvedBy: number): Promise<boolean> {
    const result = await db
      .update(messageThreads)
      .set({ 
        isResolved: true, 
        resolvedBy, 
        resolvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(messageThreads.threadId, threadId));
    return (result.rowCount || 0) > 0;
  }

  // Messages system
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // Update thread's updatedAt timestamp
    await db
      .update(messageThreads)
      .set({ updatedAt: new Date() })
      .where(eq(messageThreads.threadId, insertMessage.threadId));
    
    return message;
  }

  async getThreadMessages(threadId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(asc(messages.createdAt));
  }

  async getFirmMessages(firmId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.firmId, firmId))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<boolean> {
    // Get current readBy array
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
    if (!message) return false;

    const currentReadBy = Array.isArray(message.readBy) ? message.readBy : [];
    if (currentReadBy.includes(userId)) return true; // Already read

    const updatedReadBy = [...currentReadBy, userId];
    const result = await db
      .update(messages)
      .set({ readBy: updatedReadBy })
      .where(eq(messages.id, messageId));
    return (result.rowCount || 0) > 0;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(sql`NOT (${messages.readBy} ? ${userId.toString()})`);
    return result[0]?.count ?? 0;
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

  // Admin panel operations - Firm management
  async getAllFirms(): Promise<Firm[]> {
    return await db.select().from(firms).orderBy(firms.name);
  }

  async updateFirmVertical(firmId: number, vertical: string): Promise<Firm | undefined> {
    const [firm] = await db
      .update(firms)
      .set({ 
        settings: sql`COALESCE(settings, '{}') || '{"vertical": "${vertical}"}'`,
        updatedAt: new Date() 
      })
      .where(eq(firms.id, firmId))
      .returning();
    return firm;
  }

  // Admin panel operations - Integration management
  async getAvailableIntegrations(): Promise<AvailableIntegration[]> {
    return await db.select().from(availableIntegrations).orderBy(availableIntegrations.displayName);
  }

  async createAvailableIntegration(insertIntegration: InsertAvailableIntegration): Promise<AvailableIntegration> {
    const [integration] = await db
      .insert(availableIntegrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateAvailableIntegration(id: number, updates: Partial<AvailableIntegration>): Promise<AvailableIntegration | undefined> {
    const [integration] = await db
      .update(availableIntegrations)
      .set(updates)
      .where(eq(availableIntegrations.id, id))
      .returning();
    return integration;
  }

  async getFirmIntegrations(firmId: number): Promise<FirmIntegration[]> {
    return await db.select().from(firmIntegrations).where(eq(firmIntegrations.firmId, firmId));
  }

  async updateFirmIntegration(firmId: number, integrationName: string, updates: Partial<FirmIntegration>): Promise<FirmIntegration | undefined> {
    const [integration] = await db
      .update(firmIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(firmIntegrations.firmId, firmId), eq(firmIntegrations.integrationName, integrationName)))
      .returning();
    return integration;
  }

  // Admin panel operations - Document type templates
  async getDocumentTypeTemplates(): Promise<DocumentTypeTemplate[]> {
    return await db.select().from(documentTypeTemplates).orderBy(documentTypeTemplates.vertical, documentTypeTemplates.category, documentTypeTemplates.displayName);
  }

  async createDocumentTypeTemplate(insertTemplate: InsertDocumentTypeTemplate): Promise<DocumentTypeTemplate> {
    const [template] = await db
      .insert(documentTypeTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateDocumentTypeTemplate(id: number, updates: Partial<DocumentTypeTemplate>): Promise<DocumentTypeTemplate | undefined> {
    const [template] = await db
      .update(documentTypeTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentTypeTemplates.id, id))
      .returning();
    return template;
  }

  async deleteDocumentTypeTemplate(id: number): Promise<boolean> {
    const result = await db.delete(documentTypeTemplates).where(eq(documentTypeTemplates.id, id));
    return result.rowCount > 0;
  }

  // Admin panel operations - Platform settings
  async getPlatformSettings(): Promise<PlatformSetting[]> {
    return await db.select().from(platformSettings).orderBy(platformSettings.category, platformSettings.key);
  }

  async updatePlatformSetting(key: string, value: any, adminId: number): Promise<PlatformSetting | undefined> {
    const [setting] = await db
      .update(platformSettings)
      .set({ 
        value: value,
        updatedBy: adminId,
        updatedAt: new Date() 
      })
      .where(eq(platformSettings.key, key))
      .returning();
    return setting;
  }

  async createPlatformSetting(insertSetting: InsertPlatformSetting): Promise<PlatformSetting> {
    const [setting] = await db
      .insert(platformSettings)
      .values(insertSetting)
      .returning();
    return setting;
  }

  // Audit logging operations
  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(insertAuditLog)
      .returning();
    return auditLog;
  }

  async getFirmAuditLogs(firmId: number, limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.firmId, firmId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  async getAuditLogsByAction(firmId: number, action: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.firmId, firmId), eq(auditLogs.action, action)))
      .orderBy(desc(auditLogs.timestamp));
  }

  async getAuditLogsByDateRange(firmId: number, startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.firmId, firmId),
        sql`${auditLogs.timestamp} >= ${startDate}`,
        sql`${auditLogs.timestamp} <= ${endDate}`
      ))
      .orderBy(desc(auditLogs.timestamp));
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: number, firmId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.firmId, firmId)))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date() 
      })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getUnreadNotificationCount(userId: number, firmId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.firmId, firmId),
        eq(notifications.isRead, false)
      ));
    return result[0]?.count || 0;
  }

  async getFirmNotifications(firmId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.firmId, firmId))
      .orderBy(desc(notifications.createdAt));
  }

  async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Billing operations implementation
  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async getFirmClients(firmId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.firmId, firmId)).orderBy(clients.name);
  }

  async getClient(id: number, firmId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.firmId, firmId)));
    return client || undefined;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db.update(clients).set({ ...updates, updatedAt: new Date() }).where(eq(clients.id, id)).returning();
    return client || undefined;
  }

  async deleteClient(id: number, firmId: number): Promise<boolean> {
    const result = await db.delete(clients).where(and(eq(clients.id, id), eq(clients.firmId, firmId))).returning();
    return result.length > 0;
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    const [caseRecord] = await db.insert(cases).values(insertCase).returning();
    return caseRecord;
  }

  async getFirmCases(firmId: number): Promise<Case[]> {
    return await db.select().from(cases).where(eq(cases.firmId, firmId)).orderBy(cases.name);
  }

  async getClientCases(clientId: number, firmId: number): Promise<Case[]> {
    return await db.select().from(cases).where(and(eq(cases.clientId, clientId), eq(cases.firmId, firmId))).orderBy(cases.name);
  }

  async getCase(id: number, firmId: number): Promise<Case | undefined> {
    const [caseRecord] = await db.select().from(cases).where(and(eq(cases.id, id), eq(cases.firmId, firmId)));
    return caseRecord || undefined;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case | undefined> {
    const [caseRecord] = await db.update(cases).set({ ...updates, updatedAt: new Date() }).where(eq(cases.id, id)).returning();
    return caseRecord || undefined;
  }

  async deleteCase(id: number, firmId: number): Promise<boolean> {
    const result = await db.delete(cases).where(and(eq(cases.id, id), eq(cases.firmId, firmId))).returning();
    return result.length > 0;
  }

  async createTimeLog(insertTimeLog: InsertTimeLog): Promise<TimeLog> {
    const [timeLog] = await db.insert(timeLogs).values(insertTimeLog).returning();
    return timeLog;
  }

  async getFirmTimeLogs(firmId: number): Promise<TimeLog[]> {
    return await db.select().from(timeLogs).where(eq(timeLogs.firmId, firmId)).orderBy(desc(timeLogs.loggedAt));
  }

  async getUserTimeLogs(userId: number, firmId: number): Promise<TimeLog[]> {
    return await db.select().from(timeLogs).where(and(eq(timeLogs.userId, userId), eq(timeLogs.firmId, firmId))).orderBy(desc(timeLogs.loggedAt));
  }

  async getTimeLog(id: number, firmId: number): Promise<TimeLog | undefined> {
    const [timeLog] = await db.select().from(timeLogs).where(and(eq(timeLogs.id, id), eq(timeLogs.firmId, firmId)));
    return timeLog || undefined;
  }

  async updateTimeLog(id: number, updates: Partial<TimeLog>): Promise<TimeLog | undefined> {
    const [timeLog] = await db.update(timeLogs).set({ ...updates, updatedAt: new Date() }).where(eq(timeLogs.id, id)).returning();
    return timeLog || undefined;
  }

  async deleteTimeLog(id: number, firmId: number): Promise<boolean> {
    const result = await db.delete(timeLogs).where(and(eq(timeLogs.id, id), eq(timeLogs.firmId, firmId))).returning();
    return result.length > 0;
  }

  async lockTimeLog(id: number, firmId: number): Promise<boolean> {
    const [timeLog] = await db.update(timeLogs).set({ isLocked: true, lockedAt: new Date() }).where(and(eq(timeLogs.id, id), eq(timeLogs.firmId, firmId))).returning();
    return !!timeLog;
  }

  async getUnbilledTimeLogs(firmId: number): Promise<TimeLog[]> {
    return await db.select().from(timeLogs).where(and(eq(timeLogs.firmId, firmId), isNull(timeLogs.invoiceId))).orderBy(desc(timeLogs.loggedAt));
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async getFirmInvoices(firmId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.firmId, firmId)).orderBy(desc(invoices.createdAt));
  }

  async getClientInvoices(clientId: number, firmId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(and(eq(invoices.clientId, clientId), eq(invoices.firmId, firmId))).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number, firmId: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.firmId, firmId)));
    return invoice || undefined;
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set({ ...updates, updatedAt: new Date() }).where(eq(invoices.id, id)).returning();
    return invoice || undefined;
  }

  async deleteInvoice(id: number, firmId: number): Promise<boolean> {
    const result = await db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.firmId, firmId))).returning();
    return result.length > 0;
  }

  async createInvoiceLineItem(insertLineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    const [lineItem] = await db.insert(invoiceLineItems).values(insertLineItem).returning();
    return lineItem;
  }

  async getInvoiceLineItems(invoiceId: number): Promise<InvoiceLineItem[]> {
    return await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId)).orderBy(invoiceLineItems.sortOrder);
  }

  async updateInvoiceLineItem(id: number, updates: Partial<InvoiceLineItem>): Promise<InvoiceLineItem | undefined> {
    const [lineItem] = await db.update(invoiceLineItems).set(updates).where(eq(invoiceLineItems.id, id)).returning();
    return lineItem || undefined;
  }

  async deleteInvoiceLineItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id)).returning();
    return result.length > 0;
  }

  async reorderInvoiceLineItems(invoiceId: number, itemIds: number[]): Promise<boolean> {
    try {
      for (let i = 0; i < itemIds.length; i++) {
        await db.update(invoiceLineItems).set({ sortOrder: i }).where(and(eq(invoiceLineItems.id, itemIds[i]), eq(invoiceLineItems.invoiceId, invoiceId)));
      }
      return true;
    } catch (error) {
      console.error("Error reordering invoice line items:", error);
      return false;
    }
  }

  async getFirmBillingSettings(firmId: number): Promise<FirmBillingSettings | undefined> {
    const [settings] = await db.select().from(firmBillingSettings).where(eq(firmBillingSettings.firmId, firmId));
    return settings || undefined;
  }

  async updateFirmBillingSettings(firmId: number, updates: Partial<FirmBillingSettings>): Promise<FirmBillingSettings> {
    const [settings] = await db.update(firmBillingSettings).set({ ...updates, updatedAt: new Date() }).where(eq(firmBillingSettings.firmId, firmId)).returning();
    if (!settings) throw new Error("Billing settings not found");
    return settings;
  }

  async createFirmBillingSettings(insertSettings: InsertFirmBillingSettings): Promise<FirmBillingSettings> {
    const [settings] = await db.insert(firmBillingSettings).values(insertSettings).returning();
    return settings;
  }

  async getBillingPermissions(userId: number, firmId: number): Promise<BillingPermission | undefined> {
    const [permissions] = await db.select().from(billingPermissions).where(and(eq(billingPermissions.userId, userId), eq(billingPermissions.firmId, firmId)));
    return permissions || undefined;
  }

  async updateBillingPermissions(userId: number, firmId: number, updates: Partial<BillingPermission>): Promise<BillingPermission> {
    const [permissions] = await db.update(billingPermissions).set({ ...updates, updatedAt: new Date() }).where(and(eq(billingPermissions.userId, userId), eq(billingPermissions.firmId, firmId))).returning();
    if (!permissions) throw new Error("Billing permissions not found");
    return permissions;
  }

  async createBillingPermissions(insertPermissions: InsertBillingPermission): Promise<BillingPermission> {
    const [permissions] = await db.insert(billingPermissions).values(insertPermissions).returning();
    return permissions;
  }

  // Payment processing methods
  async createPayment(data: any): Promise<any> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async updatePaymentByStripeId(stripePaymentIntentId: string, updates: any): Promise<any> {
    const [payment] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
      .returning();
    return payment;
  }

  // Client portal methods
  async getClientAuthByToken(token: string): Promise<any> {
    const [auth] = await db.select().from(clientAuth).where(eq(clientAuth.loginToken, token));
    return auth || null;
  }

  async getClientAuthByEmail(email: string): Promise<any> {
    const [auth] = await db.select().from(clientAuth).where(eq(clientAuth.email, email));
    return auth || null;
  }

  async updateClientAuth(id: number, updates: any): Promise<any> {
    const [auth] = await db
      .update(clientAuth)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clientAuth.id, id))
      .returning();
    return auth;
  }

  async getClientPayments(clientId: number): Promise<any[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.clientId, clientId))
      .orderBy(desc(payments.createdAt));
  }

  // Analytics methods
  async getProfitabilityAnalytics(firmId: number): Promise<any> {
    const analytics = await db
      .select({
        caseId: timeLogs.caseId,
        clientId: timeLogs.clientId,
        totalHours: sql<number>`sum(${timeLogs.hours})`,
        totalBilled: sql<number>`sum(${timeLogs.billableRate} * ${timeLogs.hours} / 60)`,
        invoiceCount: sql<number>`count(distinct ${timeLogs.invoiceId})`
      })
      .from(timeLogs)
      .where(eq(timeLogs.firmId, firmId))
      .groupBy(timeLogs.caseId, timeLogs.clientId);
    
    return analytics;
  }

  async getHourlyRateAnalytics(firmId: number): Promise<any> {
    const analytics = await db
      .select({
        userId: timeLogs.userId,
        avgRate: sql<number>`avg(${timeLogs.billableRate})`,
        totalHours: sql<number>`sum(${timeLogs.hours})`,
        totalBilled: sql<number>`sum(${timeLogs.billableRate} * ${timeLogs.hours} / 60)`
      })
      .from(timeLogs)
      .where(eq(timeLogs.firmId, firmId))
      .groupBy(timeLogs.userId);
    
    return analytics;
  }

  // Tax form generation
  async generateTaxForm(formType: string, data: any): Promise<any> {
    const formRecord = await db.insert(billingForms).values({
      firmId: data.firmId,
      formType,
      formName: `${formType}-${data.year}`,
      formData: data,
      createdBy: 1
    }).returning();

    return {
      formId: formRecord[0].id,
      formType,
      year: data.year,
      generatedData: data.contractorData
    };
  }

  // System alerts
  async createSystemAlert(data: any): Promise<any> {
    const [alert] = await db.insert(systemAlerts).values(data).returning();
    return alert;
  }

  async getSystemAlerts(firmId: number): Promise<any[]> {
    return await db
      .select()
      .from(systemAlerts)
      .where(and(
        eq(systemAlerts.firmId, firmId),
        eq(systemAlerts.isRead, false)
      ))
      .orderBy(desc(systemAlerts.createdAt));
  }

  async markAlertAsRead(alertId: number, userId: number): Promise<any> {
    const [alert] = await db
      .update(systemAlerts)
      .set({ 
        isRead: true, 
        readBy: userId, 
        readAt: new Date() 
      })
      .where(eq(systemAlerts.id, alertId))
      .returning();
    return alert;
  }

  // Calendar Events Implementation
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [calendarEvent] = await db
      .insert(calendarEvents)
      .values(event)
      .returning();
    return calendarEvent;
  }

  async getFirmCalendarEvents(firmId: number): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.firmId, firmId))
      .orderBy(asc(calendarEvents.startTime));
  }

  async getCalendarEvent(id: number, firmId: number): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.firmId, firmId)));
    return event || undefined;
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .update(calendarEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return event || undefined;
  }

  async deleteCalendarEvent(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(calendarEvents)
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.firmId, firmId)));
    return (result.rowCount || 0) > 0;
  }

  async getUpcomingEvents(firmId: number, days: number): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return await db
      .select()
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.firmId, firmId),
        sql`${calendarEvents.startTime} >= ${startDate}`,
        sql`${calendarEvents.startTime} <= ${endDate}`
      ))
      .orderBy(asc(calendarEvents.startTime));
  }

  // Client Intakes Implementation
  async createClientIntake(intake: InsertClientIntake): Promise<ClientIntake> {
    const [clientIntake] = await db
      .insert(clientIntakes)
      .values(intake)
      .returning();
    return clientIntake;
  }

  async getFirmClientIntakes(firmId: number): Promise<ClientIntake[]> {
    return await db
      .select()
      .from(clientIntakes)
      .where(eq(clientIntakes.firmId, firmId))
      .orderBy(desc(clientIntakes.submittedAt));
  }

  async getClientIntake(id: number, firmId: number): Promise<ClientIntake | undefined> {
    const [intake] = await db
      .select()
      .from(clientIntakes)
      .where(and(eq(clientIntakes.id, id), eq(clientIntakes.firmId, firmId)));
    return intake || undefined;
  }

  async updateClientIntake(id: number, updates: Partial<ClientIntake>): Promise<ClientIntake | undefined> {
    const [intake] = await db
      .update(clientIntakes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clientIntakes.id, id))
      .returning();
    return intake || undefined;
  }

  async deleteClientIntake(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(clientIntakes)
      .where(and(eq(clientIntakes.id, id), eq(clientIntakes.firmId, firmId)));
    return (result.rowCount || 0) > 0;
  }

  async getIntakesByStatus(firmId: number, status: string): Promise<ClientIntake[]> {
    return await db
      .select()
      .from(clientIntakes)
      .where(and(eq(clientIntakes.firmId, firmId), eq(clientIntakes.status, status)))
      .orderBy(desc(clientIntakes.submittedAt));
  }

  // AI Triage Results Implementation
  async createAiTriageResult(result: InsertAiTriageResult): Promise<AiTriageResult> {
    const [triageResult] = await db
      .insert(aiTriageResults)
      .values(result)
      .returning();
    return triageResult;
  }

  async getAiTriageResult(id: number, firmId: number): Promise<AiTriageResult | undefined> {
    const [result] = await db
      .select()
      .from(aiTriageResults)
      .where(and(eq(aiTriageResults.id, id), eq(aiTriageResults.firmId, firmId)));
    return result || undefined;
  }

  async getTriageResultByIntake(intakeId: number, firmId: number): Promise<AiTriageResult | undefined> {
    const [result] = await db
      .select()
      .from(aiTriageResults)
      .where(and(
        eq(aiTriageResults.intakeId, intakeId),
        eq(aiTriageResults.firmId, firmId)
      ));
    return result || undefined;
  }

  async getTriageResultByDocument(documentId: number, firmId: number): Promise<AiTriageResult | undefined> {
    const [result] = await db
      .select()
      .from(aiTriageResults)
      .where(and(
        eq(aiTriageResults.documentId, documentId),
        eq(aiTriageResults.firmId, firmId)
      ));
    return result || undefined;
  }

  async updateAiTriageResult(id: number, updates: Partial<AiTriageResult>): Promise<AiTriageResult | undefined> {
    const [result] = await db
      .update(aiTriageResults)
      .set(updates)
      .where(eq(aiTriageResults.id, id))
      .returning();
    return result || undefined;
  }

  async getFirmTriageResults(firmId: number): Promise<AiTriageResult[]> {
    return await db
      .select()
      .from(aiTriageResults)
      .where(eq(aiTriageResults.firmId, firmId))
      .orderBy(desc(aiTriageResults.createdAt));
  }

  // CRM Communication Logs Implementation
  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const [communicationLog] = await db
      .insert(communicationLogs)
      .values(log)
      .returning();
    return communicationLog;
  }

  async getFirmCommunicationLogs(firmId: number): Promise<CommunicationLog[]> {
    return await db
      .select()
      .from(communicationLogs)
      .where(eq(communicationLogs.firmId, firmId))
      .orderBy(desc(communicationLogs.createdAt));
  }

  async getClientCommunicationLogs(clientId: number, firmId: number): Promise<CommunicationLog[]> {
    return await db
      .select()
      .from(communicationLogs)
      .where(and(
        eq(communicationLogs.clientId, clientId),
        eq(communicationLogs.firmId, firmId)
      ))
      .orderBy(desc(communicationLogs.createdAt));
  }

  async getCaseCommunicationLogs(caseId: number, firmId: number): Promise<CommunicationLog[]> {
    return await db
      .select()
      .from(communicationLogs)
      .where(and(
        eq(communicationLogs.caseId, caseId),
        eq(communicationLogs.firmId, firmId)
      ))
      .orderBy(desc(communicationLogs.createdAt));
  }

  async getCommunicationLog(id: number, firmId: number): Promise<CommunicationLog | undefined> {
    const [log] = await db
      .select()
      .from(communicationLogs)
      .where(and(eq(communicationLogs.id, id), eq(communicationLogs.firmId, firmId)));
    return log || undefined;
  }

  async updateCommunicationLog(id: number, updates: Partial<CommunicationLog>): Promise<CommunicationLog | undefined> {
    const [log] = await db
      .update(communicationLogs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communicationLogs.id, id))
      .returning();
    return log || undefined;
  }

  async deleteCommunicationLog(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(communicationLogs)
      .where(and(eq(communicationLogs.id, id), eq(communicationLogs.firmId, firmId)));
    return (result.rowCount || 0) > 0;
  }

  // Admin Ghost Mode Implementation
  async createAdminGhostSession(session: InsertAdminGhostSession): Promise<AdminGhostSession> {
    const [ghostSession] = await db
      .insert(adminGhostSessions)
      .values(session)
      .returning();
    return ghostSession;
  }

  async getActiveGhostSessions(adminUserId: number): Promise<AdminGhostSession[]> {
    return await db
      .select()
      .from(adminGhostSessions)
      .where(and(
        eq(adminGhostSessions.adminUserId, adminUserId),
        eq(adminGhostSessions.isActive, true)
      ))
      .orderBy(desc(adminGhostSessions.startedAt));
  }

  async getGhostSessionByToken(sessionToken: string): Promise<AdminGhostSession | undefined> {
    const [session] = await db
      .select()
      .from(adminGhostSessions)
      .where(eq(adminGhostSessions.sessionToken, sessionToken));
    return session || undefined;
  }

  async endGhostSession(sessionToken: string): Promise<boolean> {
    const result = await db
      .update(adminGhostSessions)
      .set({ 
        isActive: false, 
        endedAt: new Date() 
      })
      .where(eq(adminGhostSessions.sessionToken, sessionToken));
    return (result.rowCount || 0) > 0;
  }

  async updateGhostSessionAuditTrail(sessionToken: string, auditTrail: any): Promise<AdminGhostSession | undefined> {
    const [session] = await db
      .update(adminGhostSessions)
      .set({ auditTrail })
      .where(eq(adminGhostSessions.sessionToken, sessionToken))
      .returning();
    return session || undefined;
  }
}

// Document Generation Storage Methods
DatabaseStorage.prototype.getFirmTemplates = async function(firmId: number): Promise<any[]> {
  const result = await db.execute(sql`
    SELECT * FROM firm_form_templates 
    WHERE firm_id = ${firmId} AND is_active = true 
    ORDER BY name ASC
  `);
  return result.rows || [];
};

DatabaseStorage.prototype.saveGeneratedDocument = async function(data: {
  firmId: number;
  userId: number;
  documentType: string;
  county: string;
  formData: any;
  generatedContent: string;
  aiPrompt: string;
}): Promise<any> {
  const result = await db.execute(sql`
    INSERT INTO generated_documents 
    (firm_id, user_id, document_type, county, form_data, generated_content, ai_prompt, status) 
    VALUES (${data.firmId}, ${data.userId}, ${data.documentType}, ${data.county}, 
            ${JSON.stringify(data.formData)}, ${data.generatedContent}, ${data.aiPrompt}, 'generated')
    RETURNING *
  `);
  return result.rows[0];
};

export const storage = new DatabaseStorage();