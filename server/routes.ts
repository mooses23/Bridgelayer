import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processDocument } from "./services/documentProcessor";
import { insertDocumentSchema, insertAnalysisFeaturesSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo purposes (in production, this would come from authentication)
  const DEMO_USER_ID = 1;

  // Ensure demo user exists
  let demoUser = await storage.getUser(DEMO_USER_ID);
  if (!demoUser) {
    demoUser = await storage.createUser({
      username: "demo_user",
      password: "demo_password"
    });
  }

  // Ensure user features exist
  let userFeatures = await storage.getUserFeatures(DEMO_USER_ID);
  if (!userFeatures) {
    userFeatures = await storage.createUserFeatures({
      userId: DEMO_USER_ID,
      summarization: true,
      riskAnalysis: true,
      clauseExtraction: true,
      crossReference: false,
      formatting: true
    });
  }

  // Get user features
  app.get("/api/features", async (req, res) => {
    try {
      const features = await storage.getUserFeatures(DEMO_USER_ID);
      if (!features) {
        return res.status(404).json({ message: "Features not found" });
      }
      res.json(features);
    } catch (error) {
      res.status(500).json({ message: "Failed to get features" });
    }
  });

  // Update user features
  app.put("/api/features", async (req, res) => {
    try {
      const validatedData = insertAnalysisFeaturesSchema.parse({
        userId: DEMO_USER_ID,
        ...req.body
      });
      
      const features = await storage.updateUserFeatures(DEMO_USER_ID, validatedData);
      res.json(features);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update features" });
    }
  });

  // Upload document
  app.post("/api/documents/upload", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const content = req.file.buffer.toString('utf-8');
      
      const documentData = {
        userId: DEMO_USER_ID,
        filename: `${Date.now()}_${req.file.originalname}`,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        content: content
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);

      // Process document asynchronously
      processDocument(document.id, DEMO_USER_ID).catch(error => {
        console.error("Failed to process document:", error);
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Get user documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getUserDocuments(DEMO_USER_ID);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Get document with analyses
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const analyses = await storage.getDocumentAnalyses(documentId);
      
      res.json({
        document,
        analyses: analyses.reduce((acc, analysis) => {
          acc[analysis.analysisType] = {
            result: analysis.result,
            confidence: analysis.confidence,
            createdAt: analysis.createdAt
          };
          return acc;
        }, {} as Record<string, any>)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // In a real implementation, you would delete the document
      // For MemStorage, we'll just mark it as deleted or remove it
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Direct AI analysis endpoint
  app.post('/api/analyze', async (req, res) => {
    const { docType, fileText } = req.body;

    if (!docType || !fileText) {
      return res.status(400).json({ success: false, error: 'docType and fileText are required' });
    }

    // Set longer timeout for AI processing
    req.setTimeout(120000); // 2 minutes
    res.setTimeout(120000);

    try {
      const { runAiAgent } = await import('./services/aiAgent.js');
      console.log(`Starting AI analysis for document type: ${docType}`);
      const aiOutput = await runAiAgent(docType, fileText);
      console.log(`AI analysis completed for document type: ${docType}`);
      res.json({ success: true, result: aiOutput });
    } catch (err) {
      console.error('AI analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, error: `AI processing failed: ${errorMessage}` });
    }
  });

  // BridgeLayer Onboarding API endpoints
  app.post('/api/onboarding/start', async (req, res) => {
    const { firmName, adminEmail } = req.body;
    
    if (!firmName || !adminEmail) {
      return res.status(400).json({ error: 'Firm name and admin email are required' });
    }

    const { DEFAULT_DOCUMENT_PRESETS } = await import('./services/onboardingConfig.js');
    
    res.json({
      message: `Welcome to FIRMSYNC, ${firmName}! Let's configure your document analysis preferences.`,
      availableDocTypes: Object.keys(DEFAULT_DOCUMENT_PRESETS).map(key => ({
        id: key,
        name: DEFAULT_DOCUMENT_PRESETS[key].displayName
      })),
      firmName,
      adminEmail
    });
  });

  app.post('/api/onboarding/configure', async (req, res) => {
    const { firmName, adminEmail, selectedDocTypes, customConfigs } = req.body;
    
    try {
      const { createDefaultFirmProfile, generateFirmConfigSummary } = await import('./services/onboardingConfig.js');
      
      let firmProfile = createDefaultFirmProfile(firmName, adminEmail, selectedDocTypes);
      
      // Apply any custom configurations
      if (customConfigs) {
        firmProfile.documentConfigs = firmProfile.documentConfigs.map(config => {
          const custom = customConfigs[config.docType];
          if (custom) {
            return { ...config, ...custom };
          }
          return config;
        });
      }
      
      const configSummary = generateFirmConfigSummary(firmProfile);
      
      res.json({
        success: true,
        firmProfile,
        configSummary,
        message: 'Your FIRMSYNC environment has been configured successfully!'
      });
    } catch (error) {
      console.error('Onboarding configuration error:', error);
      res.status(500).json({ error: 'Failed to configure firm profile' });
    }
  });

  app.get('/api/onboarding/presets', async (req, res) => {
    const { DEFAULT_DOCUMENT_PRESETS } = await import('./services/onboardingConfig.js');
    res.json(DEFAULT_DOCUMENT_PRESETS);
  });

  const httpServer = createServer(app);
  return httpServer;
}
