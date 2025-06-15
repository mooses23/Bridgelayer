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

  const httpServer = app.listen(5000, "0.0.0.0", () => {
    console.log("FIRMSYNC server running on port 5000");
  });

  return httpServer;
}