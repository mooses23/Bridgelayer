import {
  type Document,
  type InsertDocument,
  type DocumentAnalysis,
  type InsertAnalysis,
  documents,
  documentAnalyses,
} from "../../shared/schema";
import { db } from "../db";
import { eq, and } from "drizzle-orm";

export class DocumentStorage {
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
    return await db.select().from(documents).where(eq(documents.firmId, firmId));
  }

  async getDocumentsByFirmId(firmId: number): Promise<Document[]> {
    return this.getFirmDocuments(firmId);
  }

  async getFolderDocuments(folderId: number, firmId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.folderId, folderId), eq(documents.firmId, firmId)));
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.firmId, firmId)));
    return (result.rowCount ?? 0) > 0;
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
    return await db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.documentId, documentId));
  }

  async getAnalysisByType(documentId: number, type: string): Promise<DocumentAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(documentAnalyses)
      .where(and(eq(documentAnalyses.documentId, documentId), eq(documentAnalyses.analysisType, type)));
    return analysis || undefined;
  }
}
