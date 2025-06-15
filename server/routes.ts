import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { z } from "zod";
import { 
  insertDocumentSchema, 
  insertFirmAnalysisSettingsSchema, 
  insertFirmSchema,
  insertUserSchema,
  insertFolderSchema,
  insertMessageSchema
} from "@shared/schema";
import { storage } from "./storage";
import { processDocument } from "./services/documentProcessor";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Demo data for development - in production this would come from authentication
const DEMO_FIRM_ID = 1;
const DEMO_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // Firm management endpoints
  app.get("/api/firm", async (req, res) => {
    try {
      const firm = await storage.getFirm(DEMO_FIRM_ID);
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      res.json(firm);
    } catch (error) {
      console.error("Error fetching firm:", error);
      res.status(500).json({ message: "Failed to fetch firm data" });
    }
  });

  app.post("/api/firm", async (req, res) => {
    try {
      const validatedData = insertFirmSchema.parse(req.body);
      const firm = await storage.createFirm(validatedData);
      res.status(201).json(firm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid firm data", errors: error.errors });
      }
      console.error("Error creating firm:", error);
      res.status(500).json({ message: "Failed to create firm" });
    }
  });

  // User management endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsersByFirm(DEMO_FIRM_ID);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        ...req.body,
        firmId: DEMO_FIRM_ID
      });
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Folder management endpoints
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFirmFolders(DEMO_FIRM_ID);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.parse({
        ...req.body,
        firmId: DEMO_FIRM_ID,
        createdBy: DEMO_USER_ID
      });
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      console.error("Error creating folder:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const success = await storage.deleteFolder(folderId, DEMO_FIRM_ID);
      if (!success) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json({ message: "Folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Document management endpoints with firm isolation
  app.get("/api/documents", async (req, res) => {
    try {
      const { folderId } = req.query;
      let documents;
      
      if (folderId) {
        documents = await storage.getFolderDocuments(parseInt(folderId as string), DEMO_FIRM_ID);
      } else {
        documents = await storage.getFirmDocuments(DEMO_FIRM_ID);
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId, DEMO_FIRM_ID);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents/upload", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const content = req.file.buffer.toString('utf-8');
      const selectedDocType = req.body.documentType || undefined;
      const firmId = `firm_${DEMO_FIRM_ID}`;
      
      // Process document upload with prompt routing
      const { processDocumentUpload } = await import('./services/documentUploadProcessor.js');
      const processedDoc = await processDocumentUpload(
        firmId,
        `${Date.now()}_${req.file.originalname}`,
        content,
        req.file.size,
        `user_${DEMO_USER_ID}`,
        selectedDocType
      );
      
      const documentData = {
        firmId: DEMO_FIRM_ID,
        folderId: req.body.folderId ? parseInt(req.body.folderId) : null,
        userId: DEMO_USER_ID,
        filename: processedDoc.metadata.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        content: content,
        documentType: processedDoc.metadata.doc_type,
        status: "uploaded" as const
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);

      // Process document analysis in background
      processDocument(document.id, DEMO_USER_ID).catch(error => {
        console.error("Document analysis failed:", error);
      });

      res.status(201).json({
        ...document,
        promptGenerated: true,
        promptPath: processedDoc.promptPath,
        reviewLogPath: processedDoc.metaPath,
        autoDetected: processedDoc.metadata.auto_detected
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const success = await storage.deleteDocument(documentId, DEMO_FIRM_ID);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Document analysis endpoints
  app.get("/api/documents/:id/analyses", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      // Verify document belongs to firm
      const document = await storage.getDocument(documentId, DEMO_FIRM_ID);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const analyses = await storage.getDocumentAnalyses(documentId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching document analyses:", error);
      res.status(500).json({ message: "Failed to fetch document analyses" });
    }
  });

  // Document type management endpoints
  app.get("/api/document-types", async (req, res) => {
    try {
      const { getDocumentTypeOptions } = await import('./services/documentTypeDetection.js');
      const documentTypes = getDocumentTypeOptions();
      res.json(documentTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      res.status(500).json({ message: "Failed to fetch document types" });
    }
  });

  // Firm review logs endpoint
  app.get("/api/firms/:firmId/review-logs", async (req, res) => {
    try {
      const firmId = req.params.firmId;
      const { getFirmProcessedDocuments } = await import('./services/documentUploadProcessor.js');
      const processedDocs = await getFirmProcessedDocuments(firmId);
      res.json(processedDocs);
    } catch (error) {
      console.error("Error fetching review logs:", error);
      res.status(500).json({ message: "Failed to fetch review logs" });
    }
  });

  // Firm analysis settings endpoints
  app.get("/api/firm/analysis-settings", async (req, res) => {
    try {
      let settings = await storage.getFirmAnalysisSettings(DEMO_FIRM_ID);
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = {
          firmId: DEMO_FIRM_ID,
          summarization: true,
          riskAnalysis: true,
          clauseExtraction: true,
          crossReference: false,
          formatting: true,
          autoAnalysis: false
        };
        settings = await storage.createFirmAnalysisSettings(defaultSettings);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching firm analysis settings:", error);
      res.status(500).json({ message: "Failed to fetch analysis settings" });
    }
  });

  app.put("/api/firm/analysis-settings", async (req, res) => {
    try {
      const validatedData = insertFirmAnalysisSettingsSchema.parse({
        firmId: DEMO_FIRM_ID,
        ...req.body
      });
      
      const settings = await storage.updateFirmAnalysisSettings(DEMO_FIRM_ID, validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error updating analysis settings:", error);
      res.status(500).json({ message: "Failed to update analysis settings" });
    }
  });

  // Onboarding endpoints
  app.post("/api/onboarding/start", async (req, res) => {
    try {
      const { firmName, adminEmail } = req.body;
      
      // Create slug from firm name
      const slug = firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Create the firm
      const firmData = {
        name: firmName,
        slug,
        plan: "starter" as const,
        adminEmail
      };
      
      const firm = await storage.createFirm(firmData);
      
      // Create admin user
      const userData = {
        firmId: firm.id,
        email: adminEmail,
        username: adminEmail,
        password: "temp_password_123", // In production, this would be handled by proper auth
        firstName: "Admin",
        lastName: "User",
        role: "firm_admin" as const
      };
      
      const user = await storage.createUser(userData);
      
      res.json({ 
        firm, 
        user,
        message: "Firm setup started successfully" 
      });
    } catch (error) {
      console.error("Error starting onboarding:", error);
      res.status(500).json({ message: "Failed to start onboarding" });
    }
  });

  app.post("/api/onboarding/configure", async (req, res) => {
    try {
      const { firmName, adminEmail, selectedDocTypes, documentConfigs } = req.body;
      
      // Create config files for each selected document type
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const firmSlug = firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const firmDir = path.join(process.cwd(), 'firms', firmSlug);
      const configDir = path.join(firmDir, 'config');
      
      // Ensure directories exist
      await fs.mkdir(configDir, { recursive: true });
      
      // Generate config files for each document type
      for (const docType of selectedDocTypes) {
        const config = documentConfigs[docType];
        if (config) {
          const configData = {
            docType: config.docType,
            displayName: config.displayName,
            enabled: config.enabled,
            features: {
              summarize: config.summarize,
              risk: true, // Always enable risk analysis
              clauses: config.clauseCheck,
              crossref: false,
              formatting: true
            },
            riskLevel: config.riskLevel || 'medium',
            reviewer: config.reviewer,
            suggestionMode: config.suggestionMode,
            customInstructions: ''
          };
          
          const configPath = path.join(configDir, `${docType}.json`);
          await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
        }
      }
      
      // Create summary file
      const summaryData = {
        firmName,
        adminEmail,
        setupDate: new Date().toISOString(),
        documentTypes: selectedDocTypes,
        configurations: documentConfigs
      };
      
      const summaryPath = path.join(firmDir, 'onboarding-summary.json');
      await fs.writeFile(summaryPath, JSON.stringify(summaryData, null, 2));
      
      res.json({ 
        message: "Onboarding completed successfully",
        configPath: configDir,
        documentTypes: selectedDocTypes.length
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Messages endpoints
  app.get("/api/messages", async (req, res) => {
    try {
      const { type } = req.query;
      let messages;
      
      if (type === 'user') {
        messages = await storage.getUserMessages(DEMO_USER_ID);
      } else {
        messages = await storage.getFirmMessages(DEMO_FIRM_ID);
      }
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        firmId: DEMO_FIRM_ID,
        fromUserId: DEMO_USER_ID
      });
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const success = await storage.markMessageAsRead(messageId);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Create HTTP server but don't start listening - let index.ts handle that
  const { createServer } = await import('http');
  const httpServer = createServer(app);

  return httpServer;
}