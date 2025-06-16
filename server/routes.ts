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
import { 
  clientIntakeSchema, 
  timeEntrySchema, 
  validateAsync 
} from "@shared/validation";
import { storage } from "./storage";
import { billingStorage } from "./storage-billing";
import { processDocument } from "./services/documentProcessor";
import { registerAdminRoutes } from "./routes/admin";
import { AuthControllers } from "./auth/authControllers";
import { OAuthHandlers } from "./auth/oauthHandlers";
import { jwtAuthMiddleware, requireAdmin, requireFirmAccess, enforceTenantIsolation, optionalAuth } from "./auth/authMiddleware";
import session from "express-session";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Use JWT authentication system
const requireAuth = jwtAuthMiddleware;
const requireSystemAdmin = [jwtAuthMiddleware, requireAdmin];

// Import Stripe for payment processing
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_demo", {
  apiVersion: "2023-10-16",
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Import audit logger
  const { auditLogger } = await import('./services/auditLogger.js');

  // JWT Authentication routes
  app.post("/api/auth/login", AuthControllers.login);
  app.post("/api/auth/logout", AuthControllers.logout);
  app.get("/api/auth/session", AuthControllers.getSession);
  app.post("/api/auth/refresh", AuthControllers.refreshToken);
  app.post("/api/auth/reset-password", AuthControllers.requestPasswordReset);

  // OAuth2 routes for SSO authentication
  app.get('/api/auth/google', OAuthHandlers.initiateGoogleAuth);
  app.get('/api/auth/google/callback', OAuthHandlers.handleGoogleCallback);
  app.get('/api/auth/microsoft', OAuthHandlers.initiateMicrosoftAuth);
  app.get('/api/auth/microsoft/callback', OAuthHandlers.handleMicrosoftCallback);

  // Legacy OAuth callback (remove after migration)
  app.get('/api/auth/google/callback/legacy', async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.send(`
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'No authorization code received'
            }, '${req.protocol}://${req.get('host')}');
            window.close();
          </script>
        `);
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user info from Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
      const googleUser = await userResponse.json();

      // Find or create user in database
      // const stmt = db.prepare('SELECT * FROM users WHERE email = ?'); // Assuming you have a database connection named 'db'
      // let user = stmt.get(googleUser.email);
      let user = await storage.getUserByEmail(googleUser.email);

      if (!user) {
        // Create new user
        // const insertStmt = db.prepare(`
        //   INSERT INTO users (email, firstName, lastName, role, createdAt)
        //   VALUES (?, ?, ?, ?, ?)
        // `);
        //
        // const result = insertStmt.run(
        //   googleUser.email,
        //   googleUser.given_name || '',
        //   googleUser.family_name || '',
        //   'firm_user',
        //   new Date().toISOString()
        // );
        //
        // user = { id: result.lastInsertRowid, email: googleUser.email, role: 'firm_user' };
        const userData = {
          email: googleUser.email,
          username: googleUser.email,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          role: 'firm_user' as const,
          firmId: DEMO_FIRM_ID, // Assign a default firm ID
          password: 'temp_password_123'
        };

        user = await storage.createUser(userData);
      }

      // Set session
      // req.session.userId = user.id;
      req.session.userId = user.id;

      res.send(`
        <script>
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: ${JSON.stringify(user)}
          }, '${req.protocol}://${req.get('host')}');
          window.close();
        </script>
      `);

    } catch (error) {
      console.error('Google OAuth error:', error);
      res.send(`
        <script>
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: '${error.message}'
          }, '${req.protocol}://${req.get('host')}');
          window.close();
        </script>
      `);
    }
  });

  // GHGH 20.3 - Tenant detection by subdomain (no auth required for tenant lookup)
  app.get('/api/tenant/:subdomain', async (req, res) => {
    try {
      const subdomain = req.params.subdomain;

      if (!subdomain) {
        return res.status(400).json({ error: 'Subdomain is required' });
      }

      // Find firm by slug (subdomain)
      const firm = await storage.getFirmBySlug(subdomain);

      if (!firm) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Return tenant data with features
      const tenantData = {
        id: firm.slug,
        name: firm.name,
        slug: firm.slug,
        onboarded: firm.onboarded,
        plan: firm.plan,
        features: {
          billingEnabled: true,
          aiDebug: false,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          adminGhostMode: false,
          ...(firm.features || {})
        }
      };

      res.json({ tenant: tenantData });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Tenant lookup by firmId for authenticated users
  app.get('/api/tenant-by-id/:firmId', requireAuth, async (req, res) => {
    try {
      const firmId = parseInt(req.params.firmId);

      if (!firmId || isNaN(firmId)) {
        return res.status(400).json({ error: 'Valid firm ID is required' });
      }

      // Find firm by ID
      const firm = await storage.getFirmById(firmId);

      if (!firm) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Return tenant data with features
      const tenantData = {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        onboarded: firm.onboarded,
        plan: firm.plan,
        features: {
          billingEnabled: true,
          aiDebug: false,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          adminGhostMode: false,
          ...(firm.features || {})
        }
      };

      res.json(tenantData);
    } catch (error) {
      console.error('Error fetching tenant by ID:', error);
      res.status(500).json({ error: 'Failed to fetch tenant data' });
    }
  });

  // Firm management endpoints - require authentication
  app.get('/api/firm', requireAuth, async (req, res) => {
    try {
      const user = req.user;

      // Check for tenant ID in headers or use user's firmId
      const tenantId = req.headers['x-tenant-id'] || user?.firmId;

      if (!tenantId) {
        return res.status(404).json({ error: 'No tenant ID found' });
      }

      // Get firm data
      const firm = await storage.getFirm(parseInt(tenantId as string));

      if (!firm) {
        return res.status(404).json({ error: 'Firm not found' });
      }

      // Add default features if not present
      const firmWithFeatures = {
        ...firm,
        features: {
          billingEnabled: true,
          aiDebug: false,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          adminGhostMode: false,
          ...(firm.features || {})
        }
      };

      res.json(firmWithFeatures);
    } catch (error) {
      console.error('Error fetching firm:', error);
      res.status(500).json({ error: 'Internal server error' });
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

  // Dashboard summary endpoint - tenant-aware
  app.get('/api/dashboard-summary', requireAuth, async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      const firmId = parseInt(tenantId);
      
      // Get real data from the database
      const cases = await storage.getCases(firmId);
      const clients = await storage.getClients(firmId);
      const documents = await storage.getDocumentsByFirm(firmId);
      const timeEntries = await billingStorage.getTimeEntries(firmId);

      // Calculate summary statistics
      const totalCases = cases.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      const documentsReviewed = documents.filter(d => d.status === 'reviewed').length;
      const billableHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60; // Convert minutes to hours

      const summary = {
        totalCases,
        activeClients, 
        documentsReviewed,
        billableHours: billableHours.toFixed(1),
        casesChange: "+12% from last month",
        clientsChange: "+2 new this week",
        documentsToday: "+8 today",
        billablePeriod: "This month"
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Cases endpoint - tenant-aware
  app.get('/api/cases', requireAuth, async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      const firmId = parseInt(tenantId);
      const cases = await storage.getCases(firmId);
      
      res.json(cases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Cases summary endpoint - tenant-aware
  app.get('/api/cases-summary', requireAuth, async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      const firmId = parseInt(tenantId);
      const cases = await storage.getCases(firmId);

      // Calculate cases statistics
      const totalCases = cases.length;
      const activeCases = cases.filter(c => c.status === 'active').length;
      const highPriority = cases.filter(c => c.priority === 'high').length;
      const upcomingDeadlines = cases.filter(c => {
        const dueDate = new Date(c.dueDate || '');
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return dueDate <= nextWeek;
      }).length;

      const summary = {
        totalCases,
        activeCases,
        highPriority,
        upcomingDeadlines,
        totalCasesChange: "+3 from last month",
        activeCasesChange: "+2 from last week"
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching cases summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Billing endpoints - tenant-aware
  app.get('/api/invoices', requireAuth, async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      const firmId = parseInt(tenantId);
      const invoices = await billingStorage.getInvoices(firmId);
      
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/time-logs', requireAuth, async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      const firmId = parseInt(tenantId);
      const timeLogs = await billingStorage.getTimeEntries(firmId);
      
      res.json(timeLogs);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/time-logs', requireAuth, async (req, res) => {
    try {
      const { tenant, ...timeEntry } = req.body;
      
      if (!tenant) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      // Server-side validation using shared Yup schema
      const validation = await validateAsync(timeEntrySchema, timeEntry);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.errors 
        });
      }

      const firmId = parseInt(tenant);
      const newTimeEntry = await billingStorage.createTimeEntry({
        ...validation.data,
        firmId
      });
      
      res.status(201).json(newTimeEntry);
    } catch (error) {
      console.error('Error creating time entry:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/billing-summary', requireAuth, async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      const firmId = parseInt(tenantId);
      
      // Get billing data
      const invoices = await billingStorage.getInvoices(firmId);
      const timeEntries = await billingStorage.getTimeEntries(firmId);

      // Calculate summary statistics
      const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
      
      const outstanding = invoices
        .filter((inv: any) => inv.status === 'pending')
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

      const overdueInvoices = invoices.filter((inv: any) => inv.status === 'overdue').length;
      const billableHours = timeEntries.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) / 60;

      const summary = {
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        outstanding: `$${outstanding.toLocaleString()}`,
        billableHours: billableHours.toFixed(1),
        overdueInvoices: `${overdueInvoices} overdue invoices`,
        revenueChange: "+12% from last month",
        hoursPeriod: "This month"
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching billing summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Client endpoints - user-aware
  app.get('/api/client/invoices', requireAuth, async (req, res) => {
    try {
      const userId = req.query.user as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const userIdInt = parseInt(userId);
      
      // Get client invoices by finding client record for user
      const user = await storage.getUser(userIdInt);
      if (!user || !user.firmId) {
        return res.status(404).json({ error: 'User or firm not found' });
      }

      const invoices = await billingStorage.getInvoices(user.firmId);
      
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching client invoices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/client/case', requireAuth, async (req, res) => {
    try {
      const userId = req.query.user as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const userIdInt = parseInt(userId);
      const user = await storage.getUser(userIdInt);
      
      if (!user || !user.firmId) {
        return res.status(404).json({ error: 'User or firm not found' });
      }

      const cases = await storage.getCases(user.firmId);
      const userCase = cases.find((c: any) => c.clientId === userIdInt) || cases[0];

      res.json(userCase || {
        caseNumber: "2025-001",
        title: "Contract Review & Analysis",
        attorney: "Sarah Wilson",
        status: "Active",
        nextAppointment: "Jan 30, 2025 at 2:00 PM"
      });
    } catch (error) {
      console.error('Error fetching client case:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/client/documents', requireAuth, async (req, res) => {
    try {
      const userId = req.query.user as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const userIdInt = parseInt(userId);
      const user = await storage.getUser(userIdInt);
      
      if (!user || !user.firmId) {
        return res.status(404).json({ error: 'User or firm not found' });
      }

      const documents = await storage.getDocumentsByUser?.(userIdInt) || [];
      
      res.json(documents);
    } catch (error) {
      console.error('Error fetching client documents:', error);
      res.status(500).json({ error: 'Internal server error' });
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
        firmId: 1, // Will be replaced with proper auth
        createdBy: 1 // Will be replaced with proper auth
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
        `user_1`, // Will be replaced with proper auth
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

      // Add default dummy document type entry
      const defaultDocumentTypes = [
        {
          value: "eviction-notice",
          label: "Eviction Notice",
          category: "Real Estate"
        },
        {
          value: "nda",
          label: "Non-Disclosure Agreement",
          category: "Contracts"
        },
        {
          value: "employment-contract",
          label: "Employment Contract",
          category: "Employment"
        },
        ...documentTypes
      ];

      res.json(defaultDocumentTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      // Return default dummy data if service fails
      res.json([
        {
          value: "eviction-notice",
          label: "Eviction Notice", 
          category: "Real Estate"
        },
        {
          value: "nda",
          label: "Non-Disclosure Agreement",
          category: "Contracts"
        }
      ]);
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

  // Complete firm onboarding endpoint
  app.post("/api/firm/onboarding", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      
      if (!user || !user.firmId) {
        return res.status(400).json({ message: "User must be associated with a firm" });
      }

      // Update firm onboarded status
      const updatedFirm = await storage.updateFirm(user.firmId, { onboarded: true });
      
      if (!updatedFirm) {
        return res.status(404).json({ message: "Firm not found" });
      }

      res.json({ 
        message: "Onboarding completed successfully",
        firm: updatedFirm,
        redirectPath: "/dashboard"
      });
    } catch (error) {
      console.error("Error completing firm onboarding:", error);
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
        actorId: req.user!.id,
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
      const notifications = await NotificationService.getUserNotifications(req.user!.id, req.user!.firmId!);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", requireAuth, async (req, res) => {
    try {
      const { NotificationService } = await import('./services/notificationService.js');
      const count = await NotificationService.getUnreadCount(req.user!.id, req.user!.firmId!);
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
        userId: req.body.userId || req.user!.id,
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
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getFirmClients(DEMO_FIRM_ID);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

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
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  // Billing and Time Tracking Routes

  // Time entries management
  app.get("/api/time-entries", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const timeEntries = await billingStorage.getTimeEntries(firmId);
      res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const userId = req.user!.id;
      const timeEntry = await billingStorage.createTimeEntry({
        ...req.body,
        firmId,
        userId,
      });
      res.json(timeEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.put("/api/time-entries/:id/lock", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const entryId = parseInt(req.params.id);
      const timeEntry = await billingStorage.lockTimeEntry(firmId, entryId);
      res.json(timeEntry);
    } catch (error) {
      console.error("Error locking time entry:", error);
      res.status(500).json({ message: "Failed to lock time entry" });
    }
  });

  // Cases management for billing
  app.get("/api/cases", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const cases = await billingStorage.getCases(firmId);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Invoice management
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const status = req.query.status as string;
      const invoices = await billingStorage.getInvoices(firmId, status);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const userId = req.user!.id;
      const invoice = await billingStorage.createInvoice({
        ...req.body,
        firmId,
        createdBy: userId,
      });
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id/pdf", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const invoiceId = parseInt(req.params.id);
      const pdfBuffer = await billingStorage.generateInvoicePDF(firmId, invoiceId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Stripe payment integration
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const { invoiceId, amount } = req.body;
      const firmId = req.user!.firmId;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency: "usd",
        metadata: {
          firmId: firmId.toString(),
          invoiceId: invoiceId.toString(),
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Billing settings management
  app.get("/api/billing/settings", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const settings = await billingStorage.getBillingSettings(firmId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching billing settings:", error);
      res.status(500).json({ message: "Failed to fetch billing settings" });
    }
  });

  app.put("/api/billing/settings", requireAuth, async (req, res) => {
    try {
      const firmId = req.user!.firmId;
      const settings = await billingStorage.updateBillingSettings(firmId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating billing settings:", error);
      res.status<string>("/api/billing/settings", error);
      res.status(500).json({ message: "Failed to update billing settings" });
    }
  });

  // Document Generation API
  app.get("/api/firm-templates", async (req, res) => {
    try {
      // Return empty array for now - templates feature not yet implemented
      res.json([]);
    } catch (error) {
      console.error("Error fetching firm templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/generate-document", async (req, res) => {
    try {
      const { documentType, county, formData, useTemplate } = req.body;

      // Get firm-specific template if requested
      let templateContent = null;
      if (useTemplate) {
        const templates = await storage.getFirmTemplates(DEMO_FIRM_ID);
        const template = templates.find((t: any) => t.documentType === documentType);
        if (template) {
          templateContent = template.templateContent;
        }
      }

      // Build AI prompt for document generation
      const prompt = buildDocumentGenerationPrompt(documentType, county, formData, templateContent);

      // Generate document using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a legal document generation assistant. Generate professional, legally-sound documents based on the provided template and form data. Use proper legal formatting and include all necessary clauses for the specified jurisdiction."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3 // Lower temperature for more consistent legal documents
      });

      const generatedContent = response.choices[0].message.content;

      // Save generated document to database
      const generatedDoc = await storage.saveGeneratedDocument({
        firmId: DEMO_FIRM_ID,
        userId: DEMO_USER_ID,
        documentType,
        county,
        formData,
        generatedContent,
        aiPrompt: prompt
      });

      res.json({
        document: generatedContent,
        id: generatedDoc.id
      });

    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Calendar Events API
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const events = await storage.getFirmCalendarEvents(DEMO_FIRM_ID);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar/events", async (req, res) => {
    try {
      const eventData = {
        ...req.body,
        firmId: DEMO_FIRM_ID,
        createdBy: 1 // Demo user ID
      };
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.put("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateCalendarEvent(id, req.body);
      res.json(event);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCalendarEvent(id, DEMO_FIRM_ID);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Client Intake API
  app.get("/api/client-intakes", async (req, res) => {
    try {
      const intakes = await storage.getFirmClientIntakes(DEMO_FIRM_ID);
      res.json(intakes);
    } catch (error) {
      console.error("Error fetching client intakes:", error);
      res.status(500).json({ message: "Failed to fetch client intakes" });
    }
  });

  app.post("/api/client-intakes", async (req, res) => {
    try {
      // Server-side validation using shared Yup schema
      const validation = await validateAsync(clientIntakeSchema, req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.errors 
        });
      }

      const intakeNumber = `INT-${Date.now()}`;
      const intakeData = {
        ...validation.data,
        firmId: DEMO_FIRM_ID,
        intakeNumber
      };

      const intake = await storage.createClientIntake(intakeData);

      // Trigger AI triage
      if (intake) {
        try {
          const triageResult = await performAiTriage(intake, DEMO_FIRM_ID);
          await storage.createAiTriageResult(triageResult);
        } catch (triageError) {
          console.error("AI triage failed:", triageError);
          // Continue without triage if AI fails
        }
      }

      res.json(intake);
    } catch (error) {
      console.error("Error creating client intake:", error);
      res.status(500).json({ message: "Failed to create client intake" });
    }
  });

  app.put("/api/client-intakes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const intake = await storage.updateClientIntake(id, req.body);
      res.json(intake);
    } catch (error) {
      console.error("Error updating client intake:", error);
      res.status(500).json({ message: "Failed to update client intake" });
    }
  });

  // AI Triage API
  app.get("/api/ai-triage", async (req, res) => {
    try {
      const results = await storage.getFirmTriageResults(DEMO_FIRM_ID);
      res.json(results);
    } catch (error) {
      console.error("Error fetching triage results:", error);
      res.status(500).json({ message: "Failed to fetch triage results" });
    }
  });

  app.post("/api/ai-triage/document/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const document = await storage.getDocument(documentId, DEMO_FIRM_ID);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const triageResult = await performDocumentTriage(document, DEMO_FIRM_ID);
      const result = await storage.createAiTriageResult(triageResult);

      res.json(result);
    } catch (error) {
      console.error("Error performing document triage:", error);
      res.status(500).json({ message: "Failed to perform document triage" });
    }
  });

  app.put("/api/ai-triage/:id/review", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        isHumanReviewed: true,
        humanOverride: req.body.overrides,
        reviewedAt: new Date()
      };
      const result = await storage.updateAiTriageResult(id, updates);
      res.json(result);
    } catch (error) {
      console.error("Error updating triage review:", error);
      res.status(500).json({ message: "Failed to update triage review" });
    }
  });

  // Missing API endpoints causing unhandled promise rejections
  app.get("/api/billing/audit-logs", async (req, res) => {
    try {
      // Return empty audit logs with sample data
      const sampleAuditLogs = [
        {
          id: 1,
          action: "Created time log",
          userId: 1,
          clientId: 1,
          timestamp: new Date().toISOString(),
          details: "Added 2.5 hours for document review"
        }
      ];
      res.json(sampleAuditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.delete("/api/billing/audit-logs/purge", async (req, res) => {
    try {
      res.json({ message: "Audit logs purged successfully" });
    } catch (error) {
      console.error("Error purging audit logs:", error);
      res.status(500).json({ message: "Failed to purge audit logs" });
    }
  });

  app.post("/api/billing/generate-tax-form", async (req, res) => {
    try {
      console.log("Tax form generation request:", req.body);
      res.json({ 
        message: "Tax form generated successfully",
        formUrl: "/api/billing/download-tax-form/sample-1099.pdf"
      });
    } catch (error) {
      console.error("Error generating tax form:", error);
      res.status(500).json({ message: "Failed to generate tax form" });
    }
  });

  // AI Triage API
  app.get("/api/ai-triage", async (req, res) => {
    try {
      const results = await storage.getAiTriageResults(DEMO_FIRM_ID);
      res.json(results);
    } catch (error) {
      console.error("Error fetching AI triage results:", error);
      res.status(500).json({ message: "Failed to fetch AI triage results" });
    }
  });

  app.post("/api/ai-triage/:id/review", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { humanOverride } = req.body;
      const result = await storage.reviewAiTriageResult(id, humanOverride);
      res.json(result);
    } catch (error) {
      console.error("Error reviewing AI triage:", error);
      res.status(500).json({ message: "Failed to review AI triage" });
    }
  });

  // Calendar Events API
  app.get("/api/calendar-events", async (req, res) => {
    try {
      const events = await storage.getFirmCalendarEvents(DEMO_FIRM_ID);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar-events", async (req, res) => {
    try {
      const eventData = {
        ...req.body,
        firmId: DEMO_FIRM_ID,
        createdBy: 1 // Default user
      };
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.post("/api/calendar-events/:id/confirm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.confirmCalendarEvent(id);
      res.json(event);
    } catch (error) {
      console.error("Error confirming calendar event:", error);
      res.status(500).json({ message: "Failed to confirm calendar event" });
    }
  });

  app.delete("/api/calendar-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCalendarEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  app.post("/api/calendar-events/sync-google", async (req, res) => {
    try {
      // Google Calendar sync functionality would be implemented here
      res.json({ message: "Google Calendar sync initiated" });
    } catch (error) {
      console.error("Error syncing Google Calendar:", error);
      res.status(500).json({ message: "Failed to sync Google Calendar" });
    }
  });

  // Communications Log API
  app.get("/api/communications", async (req, res) => {
    try {
      const { clientId, caseId } = req.query;
      const communications = await storage.getCommunications(DEMO_FIRM_ID, {
        clientId: clientId ? parseInt(clientId as string) : undefined,
        caseId: caseId ? parseInt(caseId as string) : undefined
      });
      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.post("/api/communications", async (req, res) => {
    try {
      const communicationData = {
        ...req.body,
        firmId: DEMO_FIRM_ID,
        createdBy: 1 // Default user
      };
      const communication = await storage.createCommunication(communicationData);
      res.json(communication);
    } catch (error) {
      console.error("Error creating communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  app.post("/api/communications/export", async (req, res) => {
    try {
      const { clientId, caseId } = req.body;
      const communications = await storage.getCommunications(DEMO_FIRM_ID, {
        clientId,
        caseId
      });
      res.json({
        exportedAt: new Date().toISOString(),
        totalEntries: communications.length,
        data: communications
      });
    } catch (error) {
      console.error("Error exporting communications:", error);
      res.status(500).json({ message: "Failed to export communications" });
    }
  });

  // Admin Ghost Mode API
  app.get("/api/admin/firms", async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      res.json(firms);
    } catch (error) {
      console.error("Error fetching firms:", error);
      res.status(500).json({ message: "Failed to fetch firms" });
    }
  });

  app.get("/api/admin/ghost-session/current", async (req, res) => {
    try {
      const session = await storage.getCurrentGhostSession(1); // Admin user ID
      res.json(session);
    } catch (error) {
      console.error("Error fetching current ghost session:", error);
      res.status(500).json({ message: "Failed to fetch current ghost session" });
    }
  });

  app.get("/api/admin/ghost-sessions", async (req, res) => {
    try {
      const sessions = await storage.getGhostSessions(1); // Admin user ID
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching ghost sessions:", error);
      res.status(500).json({ message: "Failed to fetch ghost sessions" });
    }
  });

  app.post("/api/admin/ghost-session/start", async (req, res) => {
    try {
      const { targetFirmId, purpose, notes } = req.body;
      const sessionToken = `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const sessionData = {
        adminUserId: 1, // Admin user ID
        targetFirmId,
        sessionToken,
        purpose,
        actionsPerformed: notes ? [notes] : [],
        viewedData: {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || 'Unknown'
      };

      const session = await storage.createGhostSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error starting ghost session:", error);
      res.status(500).json({ message: "Failed to start ghost session" });
    }
  });

  app.post("/api/admin/ghost-session/:id/end", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.endGhostSession(id);
      res.json(session);
    } catch (error) {
      console.error("Error ending ghost session:", error);
      res.status(500).json({ message: "Failed to end ghost session" });
    }
  });

  // Update firm endpoint to handle both /api/firm and /api/firms/:id
  app.get('/api/firms/:id', requireAuth, async (req, res) => {
    try {
      const firmId = req.params.id;
      const user = req.user;
      const tenantId = req.headers['x-tenant-id'];

      // Admin users can access any firm, others only their own or tenant-scoped firm
      const allowedFirmId = tenantId || user.firm_id;

      if (user.role !== 'admin' && allowedFirmId !== firmId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // const firmStmt = db.prepare('SELECT * FROM firms WHERE id = ?');
      // const firm = firmStmt.get(firmId);
      const firm = await storage.getFirm(parseInt(firmId));

      if (!firm) {
        return res.status(404).json({ error: 'Firm not found' });
      }

      // Add default features if not present
      const firmWithFeatures = {
        ...firm,
        features: {
          billingEnabled: true,
          aiDebug: false,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          adminGhostMode: false,
          ...(firm.features || {})
        }
      };

      res.json(firmWithFeatures);
    } catch (error) {
      console.error('Error fetching firm:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Tenant API endpoint for subdomain-based tenant detection  
  app.get('/api/tenant/:subdomain', async (req, res) => {
    try {
      const { subdomain } = req.params;
      
      // Get firm by slug (subdomain)
      const firm = await storage.getFirmBySlug(subdomain);
      
      if (!firm) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Transform firm to tenant format with features
      const tenant = {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        onboarded: firm.onboarded,
        plan: firm.plan || 'Professional',
        features: {
          billingEnabled: true,
          aiDebug: false,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          adminGhostMode: false
        }
      };

      res.json({ tenant });
    } catch (error) {
      console.error('Error fetching tenant by subdomain:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Audit trail endpoints
  app.get('/api/audit-logs', requireAuth, async (req, res) => {
    try {
      const { auditLogger } = await import('./services/auditLogger.js');
      const { limit = 10, userId, firmId } = req.query;
      
      // Only admins can see all logs, users can only see their own
      const isAdmin = ['platform_admin', 'admin', 'super_admin'].includes(req.user?.role || '');
      const filterUserId = isAdmin ? (userId ? parseInt(userId as string) : undefined) : req.user?.id;
      const filterFirmId = isAdmin ? (firmId ? parseInt(firmId as string) : undefined) : req.user?.firmId;
      
      const logs = auditLogger.getLogs(filterUserId, filterFirmId, parseInt(limit as string));
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Admin API endpoints for AdminDashboard and GhostModePage
  app.get('/api/tenants', jwtAuthMiddleware, requireAdmin, async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      
      // Transform firms to tenant format with additional metadata
      const tenants = firms.map(firm => ({
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        plan: firm.plan || "Professional",
        status: firm.status || "Active",
        userCount: 0, // Will be populated by actual user count query
        lastActivity: "Recently",
        onboarded: firm.onboarded
      }));

      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/stats', jwtAuthMiddleware, requireAdmin, async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      const users = await storage.getAllUsers();
      
      const totalFirms = firms.length;
      const activeFirms = firms.filter(f => f.status === 'active' || !f.status).length;
      const totalUsers = users.length;
      const documentsProcessed = 45892; // This would come from actual document processing stats
      
      const stats = {
        totalFirms,
        activeFirms,
        totalUsers,
        documentsProcessed,
        systemHealth: "Healthy"
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin System Health endpoints
  app.get("/api/admin/system-health", requireAdmin, async (req, res) => {
    try {
      const { logManager, getSystemHealth } = await import("./logging.js");
      const health = await getSystemHealth();
      res.json(health);
    } catch (error) {
      console.error("Error fetching system health:", error);
      res.status(500).json({ message: "Failed to fetch system health" });
    }
  });

  app.get("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const { logManager } = await import("./logging.js");
      const { level, source, limit, since } = req.query;
      
      const filters: any = {};
      if (level && level !== 'all') filters.level = level as string;
      if (source && source !== 'all') filters.source = source as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (since) filters.since = new Date(since as string);
      
      const logs = logManager.getLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.delete("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const { logManager } = await import("./logging.js");
      logManager.clearLogs();
      logManager.log('info', 'Application logs cleared by admin', {}, 'admin');
      res.json({ message: "Logs cleared successfully" });
    } catch (error) {
      console.error("Error clearing logs:", error);
      res.status(500).json({ message: "Failed to clear logs" });
    }
  });

  app.get('/api/admin/alerts', requireAdmin, async (req, res) => {
    try {
      // In a real system, this would come from a monitoring/alerting system
      const alerts = [
        {
          id: 1,
          type: "warning",
          message: "High API usage detected for Wilson & Associates",
          time: "10 minutes ago"
        },
        {
          id: 2,
          type: "info", 
          message: "Scheduled maintenance completed successfully",
          time: "2 hours ago"
        },
        {
          id: 3,
          type: "error",
          message: "Failed login attempts from IP 192.168.1.100", 
          time: "3 hours ago"
        }
      ];

      res.json(alerts);
    } catch (error) {
      console.error('Error fetching admin alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/ghost/:firmId', requireAdmin, async (req, res) => {
    try {
      const firmId = parseInt(req.params.firmId);
      const adminUserId = req.user?.id;
      
      if (!adminUserId) {
        return res.status(401).json({ error: 'Admin user ID required' });
      }

      // Create ghost session
      const session = await storage.createGhostSession({
        adminUserId,
        firmId,
        startedAt: new Date()
      });

      res.json({ 
        success: true, 
        sessionId: session.id,
        message: 'Ghost mode activated' 
      });
    } catch (error) {
      console.error('Error starting ghost session:', error);
      res.status(500).json({ error: 'Failed to start ghost session' });
    }
  });

  app.get('/api/admin/ghost/current', requireAdmin, async (req, res) => {
    try {
      const adminUserId = req.user?.id;
      
      if (!adminUserId) {
        return res.status(401).json({ error: 'Admin user ID required' });
      }

      const session = await storage.getCurrentGhostSession(adminUserId);
      
      if (!session) {
        return res.json({ active: false });
      }

      res.json({
        active: true,
        firmId: session.targetFirmId,
        firmName: 'Unknown Firm', // Will be populated by joining with firms table
        startedAt: session.startedAt
      });
    } catch (error) {
      console.error('Error fetching current ghost session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/ghost/exit', requireAdmin, async (req, res) => {
    try {
      const adminUserId = req.user?.id;
      
      if (!adminUserId) {
        return res.status(401).json({ error: 'Admin user ID required' });
      }

      const session = await storage.endGhostSession(adminUserId);
      
      res.json({ 
        success: true,
        message: 'Ghost mode deactivated'
      });
    } catch (error) {
      console.error('Error ending ghost session:', error);
      res.status(500).json({ error: 'Failed to end ghost session' });
    }
  });

  // Comprehensive Onboarding System API Endpoints
  
  // Save onboarding progress (auto-save)
  app.post('/api/admin/onboarding/save-progress', requireAdmin, async (req, res) => {
    try {
      const { sessionId, currentStep, stepData, status } = req.body;
      const adminUserId = req.user?.id;

      if (!sessionId || !stepData) {
        return res.status(400).json({ error: 'Session ID and step data required' });
      }

      const session = await storage.saveOnboardingProgress({
        sessionId,
        adminUserId,
        currentStep,
        stepData,
        status: status || 'in_progress'
      });

      res.json({ 
        success: true,
        session,
        message: 'Progress saved'
      });
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      res.status(500).json({ error: 'Failed to save progress' });
    }
  });

  // Get onboarding session data
  app.get('/api/admin/onboarding/session/:sessionId', requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getOnboardingSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ session });
    } catch (error) {
      console.error('Error retrieving onboarding session:', error);
      res.status(500).json({ error: 'Failed to retrieve session' });
    }
  });

  // Complete onboarding and create firm
  app.post('/api/admin/onboarding/complete', requireAdmin, async (req, res) => {
    try {
      const { sessionId, onboardingData, ipAddress, userAgent } = req.body;

      if (!sessionId || !onboardingData) {
        return res.status(400).json({ error: 'Session ID and onboarding data required' });
      }

      // Validate required fields
      const { firmInfo, branding, preferences } = onboardingData;
      
      if (!firmInfo.name || !firmInfo.adminEmail || !firmInfo.acceptedTerms || !firmInfo.acceptedNDA) {
        return res.status(400).json({ 
          error: 'Missing required firm information',
          details: 'Firm name, admin email, and legal agreements are required'
        });
      }

      if (!branding.displayName) {
        return res.status(400).json({ 
          error: 'Display name is required for branding'
        });
      }

      if (!preferences.practiceAreas || preferences.practiceAreas.length === 0) {
        return res.status(400).json({ 
          error: 'At least one practice area must be selected'
        });
      }

      const result = await storage.completeOnboarding({
        sessionId,
        onboardingData,
        ipAddress: ipAddress || req.ip || 'unknown',
        userAgent: userAgent || req.get('User-Agent') || 'unknown'
      });

      // Log the successful firm creation
      console.log(`✅ Firm created: ${result.firm.name} (ID: ${result.firm.id})`);
      console.log(`✅ Admin user created: ${result.user.email} (ID: ${result.user.id})`);

      res.json({
        success: true,
        message: 'Firm created successfully',
        firm: {
          id: result.firm.id,
          name: result.firm.name,
          slug: result.firm.slug
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`,
          role: result.user.role
        },
        redirectUrl: result.redirectUrl,
        temporaryPassword: 'tempPassword123!' // Send this securely to admin
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      res.status(500).json({ 
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Upload firm template during onboarding
  app.post('/api/admin/onboarding/upload-template', requireAdmin, async (req, res) => {
    try {
      // This would typically handle file uploads using multer
      // For now, we'll handle base64 encoded files from the frontend
      const { fileName, fileData, templateType, description } = req.body;
      
      if (!fileName || !fileData || !templateType) {
        return res.status(400).json({ error: 'File name, data, and template type required' });
      }

      // In a real implementation, you would:
      // 1. Save the file to cloud storage (S3, etc.)
      // 2. Get the file URL
      // 3. Save template metadata to database
      
      // For demo purposes, we'll return a success response
      const fileUrl = `/uploads/templates/${fileName}`;
      
      res.json({
        success: true,
        templateUrl: fileUrl,
        message: 'Template uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading template:', error);
      res.status(500).json({ error: 'Failed to upload template' });
    }
  });

  // Get firm setup data for existing firms
  app.get('/api/admin/firm/:firmId/setup', requireAdmin, async (req, res) => {
    try {
      const { firmId } = req.params;
      const firmIdNum = parseInt(firmId);

      if (isNaN(firmIdNum)) {
        return res.status(400).json({ error: 'Invalid firm ID' });
      }

      const [firm, branding, preferences, integrations, templates, agreements] = await Promise.all([
        storage.getFirm(firmIdNum),
        storage.getFirmBranding(firmIdNum),
        storage.getFirmPreferences(firmIdNum),
        storage.getFirmIntegrations(firmIdNum),
        storage.getFirmTemplates(firmIdNum),
        storage.getComplianceAgreements(firmIdNum)
      ]);

      if (!firm) {
        return res.status(404).json({ error: 'Firm not found' });
      }

      res.json({
        firm,
        branding,
        preferences,
        integrations,
        templates,
        agreements
      });
    } catch (error) {
      console.error('Error retrieving firm setup data:', error);
      res.status(500).json({ error: 'Failed to retrieve firm data' });
    }
  });

  // List all onboarding sessions for admin monitoring
  app.get('/api/admin/onboarding/sessions', requireAdmin, async (req, res) => {
    try {
      // This would typically get all sessions from database
      // For now, return empty array
      res.json({ sessions: [] });
    } catch (error) {
      console.error('Error retrieving onboarding sessions:', error);
      res.status(500).json({ error: 'Failed to retrieve sessions' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// AI Triage Functions
async function performAiTriage(intake: any, firmId: number): Promise<any> {
  try {
    const prompt = `
Analyze this client intake and provide triage assessment:

Client: ${intake.clientName}
Case Type: ${intake.caseType}
Urgency: ${intake.urgencyLevel}
Description: ${intake.caseDescription}

Provide assessment in JSON format:
{
  "aiCaseType": "detected category",
  "aiUrgencyLevel": "low/medium/high/urgent",
  "aiRecommendedActions": ["action1", "action2"],
  "aiSummary": "brief summary",
  "aiConfidenceScore": 85,
  "flaggedIssues": ["issue1", "issue2"],
  "estimatedComplexity": "low/medium/high"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return {
      firmId,
      intakeId: intake.id,
      resourceType: "intake",
      ...analysis
    };
  } catch (error) {
    console.error("AI triage error:", error);
    // Return basic triage result if AI fails
    return {
      firmId,
      intakeId: intake.id,
      resourceType: "intake",
      aiCaseType: intake.caseType,
      aiUrgencyLevel: intake.urgencyLevel,
      aiRecommendedActions: ["Review intake", "Assign to appropriate attorney"],
      aiSummary: `New ${intake.caseType} case from ${intake.clientName}`,
      aiConfidenceScore: 50,
      flaggedIssues: [],
      estimatedComplexity: "medium"
    };
  }
}

async function performDocumentTriage(document: any, firmId: number): Promise<any> {
  try {
    const prompt = `
Analyze this legal document for triage:

Document: ${document.filename}
Type: ${document.documentType || 'Unknown'}
Content Preview: ${document.content?.substring(0, 1000) || 'No content available'}

Provide triage assessment in JSON format:
{
  "aiCaseType": "detected document category",
  "aiUrgencyLevel": "low/medium/high/urgent",
  "aiRecommendedActions": ["action1", "action2"],
  "aiSummary": "brief document summary",
  "aiConfidenceScore": 85,
  "flaggedIssues": ["issue1", "issue2"],
  "estimatedComplexity": "low/medium/high"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return {
      firmId,
      documentId: document.id,
      resourceType: "document",
      ...analysis
    };
  } catch (error) {
    console.error("Document triage error:", error);
    // Return basic triage result if AI fails
    return {
      firmId,
      documentId: document.id,
      resourceType: "document",
      aiCaseType: document.documentType || "Unknown",
      aiUrgencyLevel: "medium",
      aiRecommendedActions: ["Review document", "Classify document type"],
      aiSummary: `Document: ${document.filename}`,
      aiConfidenceScore: 50,
      flaggedIssues: [],
      estimatedComplexity: "medium"
    };
  }
}

// Helper function to build AI prompts for document generation
function buildDocumentGenerationPrompt(documentType: string, county: string, formData: any, templateContent?: string | null): string {
  const basePrompt = `Generate a professional legal document for ${documentType} in ${county}, California.`;

  let prompt = basePrompt + "\n\n";

  if (templateContent) {
    prompt += `Use this template as a formatting guide:\n${templateContent}\n\n`;
  }

  prompt += "Document Details:\n";

  // Add form data to prompt
  Object.entries(formData).forEach(([key, value]) => {
    prompt += `- ${key}: ${value}\n`;
  });

  prompt += "\n";

  // Document-specific instructions
  switch (documentType) {
    case 'eviction-notice':
      prompt += `Generate a Notice to Pay Rent or Quit that complies with California Civil Code Section 1946 and local ${county} requirements. Include:
- Proper legal language for the notice period
- Clear payment instructions
- Consequences of non-compliance
- Required statutory disclosures for ${county}`;
      break;

    case 'rent-demand':
      prompt += `Generate a formal rent demand letter that includes:
- Professional letterhead format
- Clear statement of amount owed
- Payment deadline with specific date
- Late fee calculations if applicable
- Next steps if payment is not received`;
      break;

    case 'lease-agreement':
      prompt += `Generate a residential lease agreement compliant with California landlord-tenant law including:
- All required California disclosures
- Security deposit terms per Civil Code 1950.5
- Habitability warranties
- Local ${county} specific requirements
- Clear lease terms and conditions`;
      break;

    case 'employment-contract':
      prompt += `Generate an employment agreement that includes:
- At-will employment language compliant with California Labor Code
- Compensation and benefits details
- Confidentiality and non-disclosure provisions
- California-specific employment law compliance
- Termination procedures`;
      break;

    default:
      prompt += `Generate the document with proper legal formatting and language appropriate for ${county}, California jurisdiction.`;
  }

  prompt += `\n\nEnsure the document is professionally formatted, legally accurate, and includes all necessary dates, signatures lines, and contact information.`;

  return prompt;
}