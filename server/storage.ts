import { 
  users, 
  documents, 
  documentAnalyses, 
  analysisFeatures,
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type DocumentAnalysis,
  type InsertAnalysis,
  type AnalysisFeatures,
  type InsertAnalysisFeatures
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private analyses: Map<number, DocumentAnalysis>;
  private features: Map<number, AnalysisFeatures>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentAnalysisId: number;
  private currentFeaturesId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.analyses = new Map();
    this.features = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentAnalysisId = 1;
    this.currentFeaturesId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id,
      uploadedAt: new Date(),
      analyzedAt: null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<DocumentAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: DocumentAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date()
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getDocumentAnalyses(documentId: number): Promise<DocumentAnalysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.documentId === documentId
    );
  }

  async getAnalysisByType(documentId: number, type: string): Promise<DocumentAnalysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.documentId === documentId && analysis.analysisType === type
    );
  }

  async getUserFeatures(userId: number): Promise<AnalysisFeatures | undefined> {
    return Array.from(this.features.values()).find(
      (feature) => feature.userId === userId
    );
  }

  async updateUserFeatures(userId: number, updates: Partial<AnalysisFeatures>): Promise<AnalysisFeatures> {
    const existing = await this.getUserFeatures(userId);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.features.set(existing.id, updated);
      return updated;
    } else {
      return this.createUserFeatures({ userId, ...updates });
    }
  }

  async createUserFeatures(insertFeatures: InsertAnalysisFeatures): Promise<AnalysisFeatures> {
    const id = this.currentFeaturesId++;
    const features: AnalysisFeatures = {
      ...insertFeatures,
      id,
      summarization: insertFeatures.summarization ?? true,
      riskAnalysis: insertFeatures.riskAnalysis ?? true,
      clauseExtraction: insertFeatures.clauseExtraction ?? true,
      crossReference: insertFeatures.crossReference ?? false,
      formatting: insertFeatures.formatting ?? true,
      updatedAt: new Date()
    };
    this.features.set(id, features);
    return features;
  }
}

export const storage = new MemStorage();
