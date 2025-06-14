import {
  type User,
  type InsertUser,
  type Document,
  type InsertDocument,
  type DocumentAnalysis,
  type InsertAnalysis,
  type AnalysisFeatures,
  type InsertAnalysisFeatures,
  users,
  documents,
  documentAnalyses,
  analysisFeatures,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getUserDocuments(userId: number): Promise<Document[]>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  
  createAnalysis(analysis: InsertAnalysis): Promise<DocumentAnalysis>;
  getDocumentAnalyses(documentId: number): Promise<DocumentAnalysis[]>;
  getAnalysisByType(documentId: number, type: string): Promise<DocumentAnalysis | undefined>;
  
  getUserFeatures(userId: number): Promise<AnalysisFeatures | undefined>;
  updateUserFeatures(userId: number, features: Partial<AnalysisFeatures>): Promise<AnalysisFeatures>;
  createUserFeatures(features: InsertAnalysisFeatures): Promise<AnalysisFeatures>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

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

  async getUserFeatures(userId: number): Promise<AnalysisFeatures | undefined> {
    const [features] = await db.select().from(analysisFeatures).where(eq(analysisFeatures.userId, userId));
    return features || undefined;
  }

  async updateUserFeatures(userId: number, updates: Partial<AnalysisFeatures>): Promise<AnalysisFeatures> {
    const [features] = await db
      .update(analysisFeatures)
      .set(updates)
      .where(eq(analysisFeatures.userId, userId))
      .returning();
    return features;
  }

  async createUserFeatures(insertFeatures: InsertAnalysisFeatures): Promise<AnalysisFeatures> {
    const [features] = await db
      .insert(analysisFeatures)
      .values(insertFeatures)
      .returning();
    return features;
  }
}

export const storage = new DatabaseStorage();