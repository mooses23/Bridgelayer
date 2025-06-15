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
import { registerAdminRoutes } from "./routes/admin";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Demo data for development - in production this would come from authentication
const DEMO_FIRM_ID = 1;
const DEMO_USER_ID = 1;

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  // Message threads endpoints
  app.get("/api/message-threads", async (req, res) => {
    try {
      const threads = await storage.getFirmMessageThreads(DEMO_FIRM_ID);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching message threads:", error);
      res.status(500).json({ message: "Failed to fetch message threads" });
    }
  });

  app.post("/api/message-threads", async (req, res) => {
    try {
      const { title, filename, documentId } = req.body;
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const threadData = {
        firmId: DEMO_FIRM_ID,
        threadId,
        title,
        filename: filename || null,
        documentId: documentId || null,
        createdBy: DEMO_USER_ID
      };
      
      const thread = await storage.createMessageThread(threadData);
      res.status(201).json(thread);
    } catch (error) {
      console.error("Error creating message thread:", error);
      res.status(500).json({ message: "Failed to create message thread" });
    }
  });

  app.get("/api/message-threads/:threadId/messages", async (req, res) => {
    try {
      const { threadId } = req.params;
      const messages = await storage.getThreadMessages(threadId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching thread messages:", error);
      res.status(500).json({ message: "Failed to fetch thread messages" });
    }
  });

  app.post("/api/messages/send", async (req, res) => {
    try {
      const { threadId, content, recipientRole, senderRole } = req.body;
      
      if (!threadId || !content || !senderRole) {
        return res.status(400).json({ message: "Missing required fields: threadId, content, senderRole" });
      }

      // Get current user info for sender details
      const currentUser = await storage.getUser(DEMO_USER_ID);
      const senderName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Unknown User";

      const messageData = {
        threadId,
        firmId: DEMO_FIRM_ID,
        senderId: DEMO_USER_ID,
        senderRole,
        senderName,
        recipientRole: recipientRole || null,
        content,
        isSystemMessage: false,
        readBy: [DEMO_USER_ID] // Mark as read by sender
      };
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const success = await storage.markMessageAsRead(messageId, DEMO_USER_ID);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.put("/api/message-threads/:threadId/resolve", async (req, res) => {
    try {
      const { threadId } = req.params;
      const success = await storage.resolveMessageThread(threadId, DEMO_USER_ID);
      if (!success) {
        return res.status(404).json({ message: "Thread not found" });
      }
      res.json({ message: "Thread marked as resolved" });
    } catch (error) {
      console.error("Error resolving thread:", error);
      res.status(500).json({ message: "Failed to resolve thread" });
    }
  });

  // AI Review endpoints
  app.post("/api/review/analyze", async (req, res) => {
    try {
      const { firm_id, filename } = req.body;

      if (!firm_id || !filename) {
        return res.status(400).json({ 
          message: "Missing required fields: firm_id and filename" 
        });
      }

      // Construct file paths
      const firmDir = path.join(process.cwd(), 'firms', firm_id);
      const filePath = path.join(firmDir, 'files', filename);
      const promptPath = path.join(firmDir, 'review_logs', `${path.parse(filename).name}_prompt.txt`);
      const responsePath = path.join(firmDir, 'review_logs', `${path.parse(filename).name}_response.txt`);

      // Check if files exist
      try {
        await fs.access(filePath);
        await fs.access(promptPath);
      } catch (error) {
        return res.status(404).json({ 
          message: "Required files not found. Ensure document and prompt exist." 
        });
      }

      // Read file content and prompt
      const [fileContent, promptContent] = await Promise.all([
        fs.readFile(filePath, 'utf-8'),
        fs.readFile(promptPath, 'utf-8')
      ]);

      console.log(`[AI Review] Starting analysis for ${filename} (firm: ${firm_id})`);

      // Send request to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional legal document analysis assistant. Provide thorough, evidence-based analysis following the provided prompt instructions."
          },
          {
            role: "user",
            content: `${promptContent}\n\n--- DOCUMENT CONTENT ---\n${fileContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const aiAnalysis = response.choices[0].message.content;

      if (!aiAnalysis) {
        throw new Error("No response received from AI analysis");
      }

      // Save AI response to file
      await fs.writeFile(responsePath, aiAnalysis, 'utf-8');

      console.log(`[AI Review] Analysis completed for ${filename}, saved to ${responsePath}`);

      res.json({
        message: "AI analysis completed successfully",
        analysis_file: `${path.parse(filename).name}_response.txt`,
        firm_id,
        filename,
        analysis_length: aiAnalysis.length,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('[AI Review] Error during analysis:', error);
      
      if (error.code === 'insufficient_quota') {
        return res.status(402).json({
          message: "OpenAI API quota exceeded. Please check your billing status.",
          error_type: "quota_exceeded"
        });
      }
      
      if (error.code === 'invalid_api_key') {
        return res.status(401).json({
          message: "Invalid OpenAI API key. Please check your configuration.",
          error_type: "auth_error"
        });
      }

      res.status(500).json({ 
        message: "Failed to complete AI analysis",
        error: error.message || "Unknown error occurred"
      });
    }
  });

  app.get("/api/review/status/:firm_id/:filename", async (req, res) => {
    try {
      const { firm_id, filename } = req.params;
      
      const baseFilename = path.parse(filename).name;
      const responsePath = path.join(process.cwd(), 'firms', firm_id, 'review_logs', `${baseFilename}_response.txt`);
      
      try {
        const stats = await fs.stat(responsePath);
        const content = await fs.readFile(responsePath, 'utf-8');
        
        res.json({
          status: 'reviewed',
          completed_at: stats.mtime.toISOString(),
          analysis_length: content.length,
          response_file: `${baseFilename}_response.txt`
        });
      } catch (error) {
        res.json({
          status: 'pending',
          completed_at: null,
          analysis_length: 0,
          response_file: null
        });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to check review status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/review/result/:firm_id/:filename", async (req, res) => {
    try {
      const { firm_id, filename } = req.params;
      
      const baseFilename = path.parse(filename).name;
      const responsePath = path.join(process.cwd(), 'firms', firm_id, 'review_logs', `${baseFilename}_response.txt`);
      
      try {
        const content = await fs.readFile(responsePath, 'utf-8');
        const stats = await fs.stat(responsePath);
        
        res.json({
          analysis: content,
          completed_at: stats.mtime.toISOString(),
          filename: `${baseFilename}_response.txt`,
          length: content.length
        });
      } catch (error) {
        res.status(404).json({
          message: "Analysis result not found. Document may not have been reviewed yet."
        });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to retrieve analysis result",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Vertical Plugin System API endpoints
  app.get("/api/vertical/config/:firmId", async (req, res) => {
    try {
      const firmId = parseInt(req.params.firmId);
      const { getFirmVerticalInfo } = await import('./services/verticalAwareDocumentProcessor.js');
      
      const verticalInfo = await getFirmVerticalInfo(firmId);
      res.json(verticalInfo);
    } catch (error) {
      console.error("Error fetching vertical configuration:", error);
      res.status(500).json({ message: "Failed to fetch vertical configuration" });
    }
  });

  app.get("/api/vertical/document-types/:firmId", async (req, res) => {
    try {
      const firmId = parseInt(req.params.firmId);
      const { getFirmDocumentTypes } = await import('./services/verticalAwareDocumentProcessor.js');
      
      const documentTypes = await getFirmDocumentTypes(firmId);
      res.json(documentTypes);
    } catch (error) {
      console.error("Error fetching vertical document types:", error);
      res.status(500).json({ message: "Failed to fetch document types" });
    }
  });

  app.post("/api/vertical/analyze", async (req, res) => {
    try {
      const { documentId, firmId } = req.body;
      
      if (!documentId || !firmId) {
        return res.status(400).json({ message: "Document ID and Firm ID are required" });
      }

      const { processDocumentWithVertical } = await import('./services/verticalAwareDocumentProcessor.js');
      
      await processDocumentWithVertical(documentId, firmId);
      res.json({ 
        message: "Document processed successfully with vertical-aware analysis",
        status: "completed"
      });
    } catch (error) {
      console.error("Error processing document with vertical analysis:", error);
      res.status(500).json({ 
        message: "Failed to process document",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/vertical/available", async (req, res) => {
    try {
      const availableVerticals = [
        {
          name: "firmsync",
          displayName: "FIRMSYNC - Legal Document Analysis",
          industry: "legal",
          description: "Comprehensive legal document analysis for law firms"
        },
        {
          name: "medsync", 
          displayName: "MEDSYNC - Medical Document Analysis",
          industry: "healthcare",
          description: "Clinical document analysis for healthcare providers"
        },
        {
          name: "edusync",
          displayName: "EDUSYNC - Educational Document Analysis", 
          industry: "education",
          description: "Academic document analysis for educational institutions"
        },
        {
          name: "hrsync",
          displayName: "HRSYNC - HR Document Analysis",
          industry: "human_resources", 
          description: "Human resources document analysis for HR professionals"
        }
      ];
      
      res.json(availableVerticals);
    } catch (error) {
      console.error("Error fetching available verticals:", error);
      res.status(500).json({ message: "Failed to fetch available verticals" });
    }
  });

  // Enterprise-grade systems API endpoints
  
  // 1. Audit Logging API
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const { AuditService } = await import('./services/auditService.js');
      const { limit, action, startDate, endDate } = req.query;
      
      let logs;
      if (action) {
        logs = await AuditService.getAuditLogsByAction(DEMO_FIRM_ID, action as string);
      } else if (startDate && endDate) {
        logs = await AuditService.getAuditLogsByDateRange(
          DEMO_FIRM_ID, 
          new Date(startDate as string), 
          new Date(endDate as string)
        );
      } else {
        logs = await AuditService.getFirmAuditLogs(DEMO_FIRM_ID, limit ? parseInt(limit as string) : undefined);
      }
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.post("/api/audit-logs", async (req, res) => {
    try {
      const { AuditService } = await import('./services/auditService.js');
      await AuditService.logAction({
        firmId: DEMO_FIRM_ID,
        actorId: DEMO_USER_ID,
        actorName: req.body.actorName || "System User",
        action: req.body.action,
        resourceType: req.body.resourceType,
        resourceId: req.body.resourceId,
        details: req.body.details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ message: "Audit log created successfully" });
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ message: "Failed to create audit log" });
    }
  });

  // 2. Notifications API
  app.get("/api/notifications", async (req, res) => {
    try {
      const { NotificationService } = await import('./services/notificationService.js');
      const notifications = await NotificationService.getUserNotifications(DEMO_USER_ID, DEMO_FIRM_ID);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", async (req, res) => {
    try {
      const { NotificationService } = await import('./services/notificationService.js');
      const count = await NotificationService.getUnreadCount(DEMO_USER_ID, DEMO_FIRM_ID);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const { NotificationService } = await import('./services/notificationService.js');
      await NotificationService.createNotification({
        firmId: DEMO_FIRM_ID,
        userId: req.body.userId || DEMO_USER_ID,
        type: req.body.type,
        title: req.body.title,
        message: req.body.message,
        resourceType: req.body.resourceType,
        resourceId: req.body.resourceId,
        priority: req.body.priority,
      });
      
      res.json({ message: "Notification created successfully" });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { NotificationService } = await import('./services/notificationService.js');
      const notificationId = parseInt(req.params.id);
      const success = await NotificationService.markAsRead(notificationId, DEMO_USER_ID);
      
      if (success) {
        res.json({ message: "Notification marked as read" });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // 3. Analytics Dashboard API
  app.get("/api/analytics", async (req, res) => {
    try {
      const { AnalyticsService } = await import('./services/analyticsService.js');
      const analytics = await AnalyticsService.getFirmAnalytics(DEMO_FIRM_ID);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Create HTTP server but don't start listening - let index.ts handle that
  // Register admin routes for BridgeLayer staff
  registerAdminRoutes(app);

  const { createServer } = await import('http');
  // Billing API endpoints
  const DEMO_FIRM_ID = 1; // Using same firm ID as other endpoints

  // Billing settings endpoints
  app.get("/api/billing/settings", async (req, res) => {
    try {
      let settings = await storage.getFirmBillingSettings(DEMO_FIRM_ID);
      if (!settings) {
        // Create default billing settings
        const defaultSettings = {
          firmId: DEMO_FIRM_ID,
          billingEnabled: false,
          defaultHourlyRate: 25000, // $250.00
          defaultFlatRate: 500000, // $5000.00
          defaultContingencyRate: 3300, // 33%
          invoiceTerms: "Payment due within 30 days",
          lockTimeLogsAfterDays: 30,
          hideAnalyticsTab: false
        };
        settings = await storage.createFirmBillingSettings(defaultSettings);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching billing settings:", error);
      res.status(500).json({ message: "Failed to fetch billing settings" });
    }
  });

  app.patch("/api/billing/settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateFirmBillingSettings(DEMO_FIRM_ID, updates);
      res.json(settings);
    } catch (error) {
      console.error("Error updating billing settings:", error);
      res.status(500).json({ message: "Failed to update billing settings" });
    }
  });

  // Client endpoints
  app.get("/api/billing/clients", async (req, res) => {
    try {
      const clients = await storage.getFirmClients(DEMO_FIRM_ID);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/billing/clients", async (req, res) => {
    try {
      const clientData = {
        ...req.body,
        firmId: DEMO_FIRM_ID,
        createdBy: 1 // Demo user ID
      };
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Case endpoints
  app.get("/api/billing/cases", async (req, res) => {
    try {
      const cases = await storage.getFirmCases(DEMO_FIRM_ID);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.post("/api/billing/cases", async (req, res) => {
    try {
      const caseData = {
        ...req.body,
        firmId: DEMO_FIRM_ID,
        createdBy: 1 // Demo user ID
      };
      const case_ = await storage.createCase(caseData);
      res.json(case_);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  // Time log endpoints
  app.get("/api/billing/time-logs", async (req, res) => {
    try {
      const timeLogs = await storage.getFirmTimeLogs(DEMO_FIRM_ID);
      res.json(timeLogs);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });

  app.post("/api/billing/time-logs", async (req, res) => {
    try {
      const timeLogData = {
        ...req.body,
        firmId: DEMO_FIRM_ID,
        userId: 1 // Demo user ID
      };
      const timeLog = await storage.createTimeLog(timeLogData);
      res.json(timeLog);
    } catch (error) {
      console.error("Error creating time log:", error);
      res.status(500).json({ message: "Failed to create time log" });
    }
  });

  app.patch("/api/billing/time-logs/:id", async (req, res) => {
    try {
      const timeLogId = parseInt(req.params.id);
      const updates = req.body;
      const timeLog = await storage.updateTimeLog(timeLogId, updates);
      if (!timeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }
      res.json(timeLog);
    } catch (error) {
      console.error("Error updating time log:", error);
      res.status(500).json({ message: "Failed to update time log" });
    }
  });

  app.delete("/api/billing/time-logs/:id", async (req, res) => {
    try {
      const timeLogId = parseInt(req.params.id);
      const success = await storage.deleteTimeLog(timeLogId, DEMO_FIRM_ID);
      if (!success) {
        return res.status(404).json({ message: "Time log not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting time log:", error);
      res.status(500).json({ message: "Failed to delete time log" });
    }
  });

  // Invoice endpoints
  app.get("/api/billing/invoices", async (req, res) => {
    try {
      const invoices = await storage.getFirmInvoices(DEMO_FIRM_ID);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/billing/invoices", async (req, res) => {
    try {
      const { timeLogIds, ...invoiceData } = req.body;
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const invoice = await storage.createInvoice({
        ...invoiceData,
        firmId: DEMO_FIRM_ID,
        invoiceNumber,
        createdBy: 1 // Demo user ID
      });

      // Create line items from time logs
      if (timeLogIds && timeLogIds.length > 0) {
        const timeLogs = await storage.getFirmTimeLogs(DEMO_FIRM_ID);
        const selectedLogs = timeLogs.filter(log => timeLogIds.includes(log.id));
        
        for (let i = 0; i < selectedLogs.length; i++) {
          const log = selectedLogs[i];
          const hours = log.hours / 60;
          const rate = log.billableRate || 25000; // Default rate
          const amount = Math.round(hours * rate);
          
          await storage.createInvoiceLineItem({
            invoiceId: invoice.id,
            timeLogId: log.id,
            description: log.description,
            quantity: log.hours, // Store in minutes
            rate,
            amount,
            sortOrder: i
          });

          // Mark time log as billed
          await storage.updateTimeLog(log.id, { invoiceId: invoice.id });
        }
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get("/api/billing/invoices/:id/line-items", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const lineItems = await storage.getInvoiceLineItems(invoiceId);
      res.json(lineItems);
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
      res.status(500).json({ message: "Failed to fetch invoice line items" });
    }
  });

  app.patch("/api/billing/invoices/:id/line-items/reorder", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { itemIds } = req.body;
      const success = await storage.reorderInvoiceLineItems(invoiceId, itemIds);
      res.json({ success });
    } catch (error) {
      console.error("Error reordering invoice line items:", error);
      res.status(500).json({ message: "Failed to reorder invoice line items" });
    }
  });

  // Stripe payment processing endpoints
  app.post("/api/billing/create-payment-intent", async (req, res) => {
    try {
      const { invoiceId, amount, clientEmail } = req.body;
      
      // Get firm billing settings to retrieve Stripe keys
      const settings = await storage.getFirmBillingSettings(DEMO_FIRM_ID);
      if (!settings?.stripeEnabled || !settings.stripeSecretKey) {
        return res.status(400).json({ message: "Stripe not configured for this firm" });
      }

      const stripe = require('stripe')(settings.stripeSecretKey);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount should already be in cents
        currency: 'usd',
        metadata: {
          invoiceId: invoiceId.toString(),
          firmId: DEMO_FIRM_ID.toString()
        },
        receipt_email: clientEmail
      });

      // Store payment record
      await storage.createPayment({
        firmId: DEMO_FIRM_ID,
        invoiceId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        status: 'pending'
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/billing/stripe-webhook", async (req, res) => {
    try {
      const settings = await storage.getFirmBillingSettings(DEMO_FIRM_ID);
      if (!settings?.stripeWebhookSecret) {
        return res.status(400).json({ message: "Webhook secret not configured" });
      }

      const stripe = require('stripe')(settings.stripeSecretKey);
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, settings.stripeWebhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle successful payment
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { invoiceId, firmId } = paymentIntent.metadata;

        // Update payment record
        await storage.updatePaymentByStripeId(paymentIntent.id, {
          status: 'succeeded',
          processedAt: new Date(),
          webhookVerified: true,
          paymentMethod: paymentIntent.charges.data[0]?.payment_method_details?.type
        });

        // Update invoice status
        await storage.updateInvoice(parseInt(invoiceId), {
          status: 'paid',
          paidAt: new Date()
        });

        // Create system alert for successful payment
        await storage.createSystemAlert({
          firmId: parseInt(firmId),
          alertType: 'payment_success',
          title: 'Payment Received',
          message: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received for invoice #${invoiceId}`,
          severity: 'info'
        });
      }

      // Handle failed payment
      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        const { invoiceId, firmId } = paymentIntent.metadata;

        await storage.updatePaymentByStripeId(paymentIntent.id, {
          status: 'failed',
          webhookVerified: true
        });

        // Create alert for failed payment
        await storage.createSystemAlert({
          firmId: parseInt(firmId),
          alertType: 'payment_failed',
          title: 'Payment Failed',
          message: `Payment failed for invoice #${invoiceId}: ${paymentIntent.last_payment_error?.message}`,
          severity: 'warning'
        });
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Client portal endpoints
  app.post("/api/client-portal/login", async (req, res) => {
    try {
      const { email, password, token } = req.body;
      
      if (token) {
        // Token-based login (secure one-click links)
        const clientAuth = await storage.getClientAuthByToken(token);
        if (!clientAuth || !clientAuth.isActive || 
            (clientAuth.tokenExpiresAt && new Date() > clientAuth.tokenExpiresAt)) {
          return res.status(401).json({ message: "Invalid or expired token" });
        }
        
        await storage.updateClientAuth(clientAuth.id, { lastLoginAt: new Date() });
        res.json({ 
          success: true, 
          clientId: clientAuth.clientId,
          firmId: clientAuth.firmId 
        });
      } else {
        // Email/password login
        const clientAuth = await storage.getClientAuthByEmail(email);
        if (!clientAuth || !clientAuth.isActive) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // In production, verify password hash here
        await storage.updateClientAuth(clientAuth.id, { lastLoginAt: new Date() });
        res.json({ 
          success: true, 
          clientId: clientAuth.clientId,
          firmId: clientAuth.firmId 
        });
      }
    } catch (error) {
      console.error("Client portal login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/client-portal/:clientId/invoices", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const invoices = await storage.getClientInvoices(clientId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/client-portal/:clientId/payments", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const payments = await storage.getClientPayments(clientId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching client payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Advanced analytics endpoints
  app.get("/api/billing/analytics/profitability", async (req, res) => {
    try {
      const analytics = await storage.getProfitabilityAnalytics(DEMO_FIRM_ID);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching profitability analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/billing/analytics/hourly-rates", async (req, res) => {
    try {
      const analytics = await storage.getHourlyRateAnalytics(DEMO_FIRM_ID);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching hourly rate analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // AI-powered form generation
  app.post("/api/billing/generate-1099", async (req, res) => {
    try {
      const { year, contractorData } = req.body;
      
      // Use existing AI service to generate 1099 form
      const formData = await storage.generateTaxForm('1099', {
        year,
        firmId: DEMO_FIRM_ID,
        contractorData
      });

      res.json({ formData });
    } catch (error) {
      console.error("Error generating 1099 form:", error);
      res.status(500).json({ message: "Failed to generate 1099 form" });
    }
  });

  // System alerts for admins
  app.get("/api/billing/alerts", async (req, res) => {
    try {
      const alerts = await storage.getSystemAlerts(DEMO_FIRM_ID);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching system alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/billing/alerts/:id/read", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      await storage.markAlertAsRead(alertId, 1); // Demo user ID
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}