import { db } from "./db";
import { 
  clients, 
  cases, 
  timeLogs, 
  invoices, 
  invoiceLineItems, 
  firmBillingSettings,
  billingPermissions,
  type Client,
  type Case,
  type TimeLog,
  type Invoice,
  type InvoiceLineItem,
  type FirmBillingSettings,
  type InsertClient,
  type InsertCase,
  type InsertTimeLog,
  type InsertInvoice,
  type InsertInvoiceLineItem,
  type InsertFirmBillingSettings
} from "@shared/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

// Billing-specific storage methods
export class BillingStorage {
  // Client management
  async getClients(firmId: number): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.firmId, firmId));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }

  // Case management
  async getCases(firmId: number): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.firmId, firmId));
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db
      .insert(cases)
      .values(caseData)
      .returning();
    return newCase;
  }

  // Time tracking
  async getTimeEntries(firmId: number): Promise<any[]> {
    const entries = await db
      .select({
        id: timeLogs.id,
        description: timeLogs.description,
        hours: timeLogs.hours,
        hourlyRate: timeLogs.billableRate,
        customField: timeLogs.customField,
        entryDate: timeLogs.loggedAt,
        isLocked: timeLogs.isLocked,
        invoiceId: timeLogs.invoiceId,
        createdAt: timeLogs.createdAt,
        clientId: timeLogs.clientId,
        caseId: timeLogs.caseId,
        clientName: clients.name,
        caseName: cases.name,
      })
      .from(timeLogs)
      .leftJoin(clients, eq(timeLogs.clientId, clients.id))
      .leftJoin(cases, eq(timeLogs.caseId, cases.id))
      .where(eq(timeLogs.firmId, firmId))
      .orderBy(desc(timeLogs.loggedAt));
    
    return entries.map(entry => ({
      ...entry,
      client: entry.clientId ? { 
        firstName: entry.clientName?.split(' ')[0] || '', 
        lastName: entry.clientName?.split(' ').slice(1).join(' ') || '' 
      } : null,
      case: entry.caseId ? { name: entry.caseName } : null,
    }));
  }

  async createTimeEntry(timeEntry: InsertTimeLog): Promise<TimeLog> {
    const [newEntry] = await db
      .insert(timeLogs)
      .values(timeEntry)
      .returning();
    return newEntry;
  }

  async lockTimeEntry(firmId: number, entryId: number): Promise<TimeLog> {
    const [lockedEntry] = await db
      .update(timeLogs)
      .set({ 
        isLocked: true, 
        lockedAt: new Date() 
      })
      .where(and(
        eq(timeLogs.firmId, firmId),
        eq(timeLogs.id, entryId)
      ))
      .returning();
    return lockedEntry;
  }

  // Invoice management
  async getInvoices(firmId: number, status?: string): Promise<any[]> {
    let query = db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        total: invoices.total,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        createdAt: invoices.createdAt,
        clientId: invoices.clientId,
        caseId: invoices.caseId,
        clientName: clients.name,
        caseName: cases.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(cases, eq(invoices.caseId, cases.id));

    const whereConditions = status && status !== 'all' 
      ? and(eq(invoices.firmId, firmId), eq(invoices.status, status))
      : eq(invoices.firmId, firmId);

    const results = await query
      .where(whereConditions)
      .orderBy(desc(invoices.createdAt));
    
    return results.map(invoice => ({
      ...invoice,
      issueDate: invoice.createdAt,
      client: { 
        firstName: invoice.clientName?.split(' ')[0] || '', 
        lastName: invoice.clientName?.split(' ').slice(1).join(' ') || '' 
      },
      case: invoice.caseId ? { name: invoice.caseName } : null,
      lineItems: []
    }));
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoiceData)
      .returning();
    return newInvoice;
  }

  async generateInvoicePDF(firmId: number, invoiceId: number): Promise<Buffer> {
    // Simple PDF generation placeholder
    const pdfContent = `Invoice #${invoiceId} - Firm ${firmId}`;
    return Buffer.from(pdfContent, 'utf-8');
  }

  // Billing settings
  async getBillingSettings(firmId: number): Promise<FirmBillingSettings | null> {
    const settings = await db
      .select()
      .from(firmBillingSettings)
      .where(eq(firmBillingSettings.firmId, firmId))
      .limit(1);
    
    return settings[0] || null;
  }

  async updateBillingSettings(firmId: number, settings: Partial<InsertFirmBillingSettings>): Promise<FirmBillingSettings> {
    const existing = await this.getBillingSettings(firmId);
    
    if (existing) {
      const [updated] = await db
        .update(firmBillingSettings)
        .set(settings)
        .where(eq(firmBillingSettings.firmId, firmId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(firmBillingSettings)
        .values({ 
          firmId, 
          settings: settings.settings || {},
          ...settings 
        })
        .returning();
      return created;
    }
  }
}

export const billingStorage = new BillingStorage();