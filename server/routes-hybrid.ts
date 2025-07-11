import type { Express } from "express";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { authStrategyMiddleware } from "./auth/strategy-router";
import { requireAuth, requireTenantAccess, validateOnboardingCode, requireFirmUserWithTenant, requireFirmUser, requireRole } from "./middleware/auth";
import { refreshJWTTokens } from "./auth/jwt-auth-clean";
import { loginHandler } from "./services/authService";
// Import new unified authentication controller
import authController from './authController';

// Create admin middleware
const requireAdmin = requireRole(['admin', 'platform_admin', 'super_admin']);

// Import LLM routes
import llmRoutes from "./routes/llm";
import documentStencilRoutes from "./routes/documentStencils";
import onboardingCodesRoutes from "./routes/onboarding-codes";
import adminRoutes from "./routes/admin";
import simpleFirmsRoutes from "./routes/simple-firms";
import agentAssignmentsRoutes from "./routes/agent-assignments";
import ownerAnalyticsRoutes from "./routes/owner-analytics";

// JWT validation function matching working admin endpoints
async function validateJWTAuth(req: any) {
  try {
    const jwtToken = req.cookies.accessToken;
    console.log("🔍 JWT Debug - Token exists:", !!jwtToken);
    console.log("🔍 JWT Debug - All cookies:", Object.keys(req.cookies || {}));
    
    if (!jwtToken) {
      return { success: false, error: "No JWT token found" };
    }

    const jwt = await import('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
    const payload = jwt.verify(jwtToken, secret) as any;
    console.log("🔍 JWT Debug - Payload:", { userId: payload?.userId, type: payload?.type, role: payload?.role });
    
    if (payload && payload.type === 'access') {
      const user = await storage.getUser(payload.userId);
      console.log("🔍 JWT Debug - User found:", !!user, user?.role);
      if (user) {
        return { success: true, user };
      }
    }
    
    return { success: false, error: "Invalid token" };
  } catch (error) {
    console.log("🔍 JWT Debug - Error:", (error as Error).message);
    return { success: false, error: "JWT validation failed" };
  }
}

export async function registerRoutes(app: Express): Promise<void> {
  // Apply authentication strategy middleware to all routes
  app.use(authStrategyMiddleware);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Registration endpoint for new firms
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firmName, subdomain, firstName, lastName, adminEmail, adminPassword } = req.body;
      console.log('📝 Registration attempt:', { firmName, subdomain, adminEmail });

      if (!firmName || !subdomain || !firstName || !lastName || !adminEmail || !adminPassword) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if firm slug already exists
      const existingFirm = await storage.getFirmBySlug(subdomain);
      if (existingFirm) {
        return res.status(400).json({ error: 'Subdomain already taken' });
      }

      // Check if admin email already exists
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create firm
      const newFirm = await storage.createFirm({
        name: firmName,
        slug: subdomain,
        status: 'active',
        plan: 'trial',
        onboarded: false,
        settings: {}
      });

      // Create admin user
      const newUser = await storage.createUser({
        email: adminEmail,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'firm_admin',
        firmId: newFirm.id,
        status: 'active'
      });

      console.log('✅ Registration successful:', { firmId: newFirm.id, userId: newUser.id });

      res.json({
        message: 'Registration successful',
        firm: {
          id: newFirm.id,
          name: newFirm.name,
          slug: newFirm.slug
        },
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        redirectTo: '/onboarding'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Unified Authentication Routes
  app.post("/api/auth/login", loginHandler);
  app.post("/api/auth/owner-login", authController.loginOwner);
  app.post("/api/auth/admin-login", authController.loginAdmin);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/session", authController.validateSession);
  app.get("/api/auth/status", authController.validateSession);
  app.post("/api/auth/refresh", refreshJWTTokens);

  // Test endpoint to debug authController issues
  app.get("/api/auth/test", (req, res) => {
    try {
      console.log("🧪 Testing authController access...");
      console.log("AuthController available:", !!authController);
      console.log("AuthController methods:", Object.keys(authController || {}));
      res.json({ 
        success: true, 
        authControllerLoaded: !!authController,
        methods: Object.keys(authController || {}),
        loginOwnerType: typeof authController?.loginOwner
      });
    } catch (error) {
      console.error("❌ Test endpoint error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tenant lookup endpoint - handles both subdomains and Replit workspace IDs
  app.get("/api/tenant/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // For development in Replit, return a default tenant
      if (identifier.includes('-') && identifier.length > 20) {
        const tenant = {
          id: identifier,
          name: "Demo Legal Firm",
          slug: identifier,
          onboarded: false,
          plan: "professional",
          features: {
            billingEnabled: true,
            documentsEnabled: true,
            intakeEnabled: true,
            communicationsEnabled: true,
            calendarEnabled: true,
            aiDebug: false,
            adminGhostMode: false
          }
        };
        return res.json({ tenant });
      }

      // Try to find firm by slug/subdomain
      const firm = await storage.getFirmBySlug(identifier);
      
      if (!firm) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const tenant = {
        id: firm.slug,
        name: firm.name,
        slug: firm.slug,
        onboarded: firm.onboarded,
        plan: firm.plan,
        features: {
          billingEnabled: true,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          aiDebug: false,
          adminGhostMode: false
        }
      };

      res.json({ tenant });
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ error: 'Failed to fetch tenant' });
    }
  });

  // Firm portal API routes (protected by requireFirmUser middleware)
  app.get('/api/app/profile/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      const firm = await storage.getFirm(user.firmId);
      
      if (!firm || firm.slug !== firmCode) {
        return res.status(404).json({ error: 'Firm not found' });
      }
      
      res.json({ firm, user });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.get('/api/app/dashboard/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Get basic dashboard stats
      const stats = {
        totalCases: 12,
        totalDocuments: 45,
        monthlyRevenue: 24500,
        activeTasks: 8
      };
      
      res.json({ stats, firmCode });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  app.get('/api/app/documents/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Get firm documents
      const documents = await storage.getFirmDocuments(user.firmId);
      
      res.json({ documents, firmCode });
    } catch (error) {
      console.error('Documents fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/app/ai/review', requireAuth, requireFirmUser, async (req, res) => {
    try {
      const { profileData, documentText, documentType } = req.body;
      
      if (!documentText && !profileData) {
        return res.status(400).json({ error: 'Document text or profile data is required' });
      }

      // Mock AI review response based on input type
      let suggestions: any = {
        issues: [],
        improvements: [],
        confidence: 0.85,
        reviewType: documentText ? 'document' : 'profile'
      };

      if (documentText) {
        // Document review
        suggestions.issues = [
          'Potential missing clause in liability section',
          'Date format inconsistency detected'
        ];
        suggestions.improvements = [
          'Consider adding force majeure clause',
          'Standardize date format throughout document',
          'Add dispute resolution mechanism'
        ];
        suggestions.documentType = documentType || 'contract';
      } else {
        // Profile/firm review
        suggestions.improvements = [
          'Consider adding more detailed client intake questions',
          'Billing settings could be optimized for better cash flow',
          'Practice areas could be more specific',
          'Add client communication preferences'
        ];
        suggestions.issues = [
          'Missing backup contact information',
          'Incomplete billing configuration'
        ];
      }
      
      res.json({ 
        success: true, 
        suggestions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI review error:', error);
      res.status(500).json({ error: 'AI review failed' });
    }
  });

  app.get('/api/app/billing/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Get firm invoices
      const invoices = await storage.getFirmInvoices(user.firmId);
      
      res.json({ invoices, firmCode });
    } catch (error) {
      console.error('Billing fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch billing data' });
    }
  });

  // Payment processing endpoint
  app.post('/api/app/billing/pay', requireAuth, requireFirmUser, async (req, res) => {
    try {
      const { invoiceId, paymentMethodId, amount } = req.body;
      const user = req.user as any;

      if (!invoiceId || !paymentMethodId || !amount) {
        return res.status(400).json({ error: 'Invoice ID, payment method, and amount are required' });
      }

      // Mock Stripe payment processing
      // In production, this would integrate with actual Stripe API
      const paymentResult = {
        id: `payment_${Date.now()}`,
        status: 'succeeded',
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
        invoice_id: invoiceId,
        firm_id: user.firmId
      };

      // Update invoice status in database
      await storage.updateInvoice(invoiceId, {
        status: 'paid',
        paidDate: new Date(),
        paymentId: paymentResult.id
      });

      res.json({
        success: true,
        payment: paymentResult,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // Create payment intent for Stripe
  app.post('/api/app/billing/create-payment-intent', requireAuth, requireFirmUser, async (req, res) => {
    try {
      const { amount, currency = 'usd', invoiceId } = req.body;
      const user = req.user as any;

      if (!amount || !invoiceId) {
        return res.status(400).json({ error: 'Amount and invoice ID are required' });
      }

      // Mock Stripe PaymentIntent creation
      // In production, this would call stripe.paymentIntents.create()
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount * 100, // Convert to cents
        currency,
        status: 'requires_payment_method',
        metadata: {
          invoice_id: invoiceId,
          firm_id: user.firmId.toString()
        }
      };

      res.json({
        success: true,
        paymentIntent
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Current user's firm endpoint - used by RoleRouter to check onboarding status
  app.get('/api/firm', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user.firmId) {
        return res.status(404).json({ error: 'No firm associated with user' });
      }
      
      const firm = await storage.getFirm(user.firmId);
      
      if (!firm) {
        return res.status(404).json({ error: 'Firm not found' });
      }

      res.json({ 
        id: firm.id,
        name: firm.name,
        onboarded: firm.onboarded,
        status: firm.status,
        plan: firm.plan
      });
    } catch (error) {
      console.error('Current firm fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch firm data' });
    }
  });

   // Basic firm route
   app.get("/api/firms/:id", requireAuth, async (req, res) => {
    try {
      const firmId = parseInt(req.params.id);
      const firm = await storage.getFirm(firmId);
      
      if (!firm) {
        return res.status(404).json({ error: 'Firm not found' });
      }

      res.json({ firm });
    } catch (error) {
      console.error("Error fetching firm:", error);
      res.status(500).json({ error: 'Failed to fetch firm' });
    }
  });

  // Admin routes
  app.get("/api/admin/firms", requireAdmin, async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      res.json({ firms });
    } catch (error) {
      console.error("Error fetching firms:", error);
      res.status(500).json({ error: 'Failed to fetch firms' });
    }
  });

  // Dashboard summary endpoint - NOW REQUIRES TENANT SCOPING
  app.get("/api/dashboard-summary/:firmCode", requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Ensure user belongs to the requested firm
      if (!user.firmId) {
        return res.status(403).json({ error: 'User not associated with any firm' });
      }

      // Get firm-specific dashboard data
      const summary = {
        totalCases: 24,
        activeClients: 18,
        documentsReviewed: 156,
        billableHours: 324.5,
        pendingReviews: 8,
        upcomingDeadlines: 3,
        firmCode: firmCode,
        firmId: user.firmId
      };

      console.log(`📊 Dashboard summary accessed for firm ${firmCode} by user ${user.id}`);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  });

  // Cases endpoints - NOW REQUIRE TENANT SCOPING
  app.get("/api/cases/:firmCode", requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Ensure user belongs to the requested firm
      if (!user.firmId) {
        return res.status(403).json({ error: 'User not associated with any firm' });
      }

      // Get firm-specific cases (in production, query by firmId)
      const cases = [
        {
          id: 1,
          title: "Smith v. ABC Corp",
          status: "Active",
          priority: "High",
          dueDate: "2025-07-01",
          assignedTo: "Sarah Johnson",
          firmId: user.firmId
        },
        {
          id: 2,
          title: "Johnson Contract Review",
          status: "Review",
          priority: "Medium",
          dueDate: "2025-06-25",
          assignedTo: "Mike Chen",
          firmId: user.firmId
        }
      ];

      console.log(`⚖️ Cases accessed for firm ${firmCode} by user ${user.id}`);
      res.json({ cases, firmCode });
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  });

  app.get("/api/cases-summary/:firmCode", requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Ensure user belongs to the requested firm
      if (!user.firmId) {
        return res.status(403).json({ error: 'User not associated with any firm' });
      }

      // Get firm-specific case summary
      const summary = {
        totalCases: 24,
        activeCases: 18,
        highPriority: 6,
        upcomingDeadlines: 3,
        firmCode: firmCode,
        firmId: user.firmId
      };

      console.log(`📋 Cases summary accessed for firm ${firmCode} by user ${user.id}`);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching cases summary:", error);
      res.status(500).json({ error: 'Failed to fetch cases summary' });
    }
  });

  // ===== UNIFIED INTEGRATION MANAGEMENT ROUTES =====
  
  // Admin Integration Dashboard - Platform-wide management
  app.get("/api/integrations/dashboard", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Admin gets platform-wide view, firm users get their firm-specific view
      const firmId = user.role === 'admin' ? null : user.firmId;
      
      const availableIntegrations = await storage.getAllPlatformIntegrations();
      const enabledIntegrations = firmId ? await storage.getFirmIntegrations(firmId) : [];
      
      // Sanitize API credentials in response
      const sanitizedIntegrations = enabledIntegrations.map(integration => ({
        ...integration,
        apiCredentials: integration.apiCredentials ? { hasApiKey: true } : null
      }));
      
      res.json({
        availableIntegrations,
        enabledIntegrations: sanitizedIntegrations,
        userPermissions: [],
        recentActivity: []
      });
    } catch (error) {
      console.error("Error fetching integration dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Platform Integrations - Admin only
  app.get("/api/integrations/platform", requireAdmin, async (req, res) => {
    try {
      const integrations = await storage.getAllPlatformIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching platform integrations:", error);
      res.status(500).json({ error: "Failed to fetch platform integrations" });
    }
  });

  // Available Integrations - Public for onboarding (no auth required)
  app.get("/api/integrations/available", async (req, res) => {
    try {
      const availableIntegrations = await storage.getAllPlatformIntegrations();
      res.json(availableIntegrations);
    } catch (error) {
      console.error("Error fetching available integrations:", error);
      res.status(500).json({ error: "Failed to fetch available integrations" });
    }
  });

  // Firm Integrations - Get firm-specific integrations
  app.get("/api/integrations/firm", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.firmId) {
        return res.status(401).json({ message: "Firm authentication required" });
      }
      
      const integrations = await storage.getFirmIntegrations(user.firmId);
      
      // Remove API credentials from response for security
      const sanitizedIntegrations = integrations.map(integration => ({
        ...integration,
        apiCredentials: integration.apiCredentials ? { hasApiKey: true } : null
      }));
      
      res.json(sanitizedIntegrations);
    } catch (error) {
      console.error("Error fetching firm integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  // Enable Firm Integration - Firm users only
  app.post("/api/integrations/firm", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.firmId) {
        return res.status(401).json({ message: "Firm authentication required" });
      }
      
      const integrationData = {
        ...req.body,
        firmId: user.firmId,
        enabledBy: user.id
      };

      const integration = await storage.enableFirmIntegration(integrationData);
      res.json(integration);
    } catch (error) {
      console.error("Error enabling firm integration:", error);
      res.status(400).json({ error: "Failed to enable integration" });
    }
  });

  // Onboarding Completion Route
  app.post("/api/onboarding/complete", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const formData = req.body;
      
      console.log('📝 Onboarding completion:', { firmId: user.firmId, userId: user.id });
      
      // Update firm as onboarded
      await storage.updateFirm(user.firmId, {
        onboarded: true,
        settings: {
          ...formData.preferences,
          integrations: formData.selectedIntegrations || [],
          apiKeys: formData.apiKeys || {}
        }
      });
      
      // Process selected integrations
      if (formData.selectedIntegrations && formData.selectedIntegrations.length > 0) {
        for (const integrationId of formData.selectedIntegrations) {
          const integrationCredentials = formData.integrationCredentials?.[integrationId];
          
          if (integrationCredentials) {
            await storage.enableFirmIntegration({
              firmId: user.firmId,
              integrationId: integrationId,
              apiCredentials: integrationCredentials,
              enabledBy: user.id
            });
          }
        }
      }
      
      console.log('✅ Onboarding completed successfully');
      
      res.json({
        message: 'Onboarding completed successfully',
        redirectTo: '/dashboard'
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  });

  // Ghost Mode API Routes
  app.get("/api/admin/firms", requireAdmin, async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      
      // Add user count and activity data for each firm
      const firmsWithStats = await Promise.all(
        firms.map(async (firm) => {
          try {
            const users = await storage.getUsersByFirmId(firm.id);
            return {
              ...firm,
              userCount: users.length,
              lastActivity: users.length > 0 ? 'Active' : 'No activity'
            };
          } catch (error) {
            return {
              ...firm,
              userCount: 0,
              lastActivity: 'No activity'
            };
          }
        })
      );

      res.json(firmsWithStats);
    } catch (error) {
      console.error("Error fetching firms for ghost mode:", error);
      res.status(500).json({ error: "Failed to fetch firms" });
    }
  });

  app.get("/api/admin/ghost/current", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const sessions = await storage.getGhostSessions(user.id);
      const currentSession = sessions.find(session => session.isActive);
      
      if (currentSession) {
        const firm = await storage.getFirm(currentSession.targetFirmId);
        res.json({
          ...currentSession,
          firmName: firm?.name || 'Unknown Firm'
        });
      } else {
        res.json({ isActive: false });
      }
    } catch (error) {
      console.error("Error fetching current ghost session:", error);
      res.status(500).json({ error: "Failed to fetch ghost session" });
    }
  });

  app.post("/api/admin/ghost/start", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { firmId, purpose, notes } = req.body;

      if (!firmId || !purpose) {
        return res.status(400).json({ error: "Firm ID and purpose are required" });
      }

      // Check if there's already an active session
      const existingSessions = await storage.getGhostSessions(user.id);
      const activeSession = existingSessions.find(session => session.isActive);
      
      if (activeSession) {
        return res.status(400).json({ error: "You already have an active ghost session" });
      }

      // Create new ghost session
      const sessionData = {
        adminUserId: user.id,
        targetFirmId: firmId,
        sessionToken: crypto.randomUUID(),
        isActive: true,
        permissions: { read: true, write: false },
        auditTrail: [{
          action: 'session_started',
          timestamp: new Date().toISOString(),
          purpose,
          notes
        }],
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const session = await storage.createGhostSession(sessionData);
      
      // Get firm name for response
      const firm = await storage.getFirm(firmId);
      
      res.json({
        ...session,
        firmName: firm?.name || 'Unknown Firm'
      });
    } catch (error) {
      console.error("Error starting ghost session:", error);
      res.status(500).json({ error: "Failed to start ghost session" });
    }
  });

  app.post("/api/admin/ghost/end/:sessionToken", requireAdmin, async (req, res) => {
    try {
      const { sessionToken } = req.params;
      const success = await storage.endGhostSession(sessionToken);
      
      if (success) {
        res.json({ message: "Ghost session ended successfully" });
      } else {
        res.status(404).json({ error: "Ghost session not found" });
      }
    } catch (error) {
      console.error("Error ending ghost session:", error);
      res.status(500).json({ error: "Failed to end ghost session" });
    }
  });

  // Onboarding Templates API Routes
  app.get("/api/admin/onboarding-templates", requireAdmin, async (req, res) => {
    try {
      // Mock templates data - in production this would come from database
      const templates = [
        {
          id: 1,
          name: "Personal Injury Law Firm",
          description: "Complete template for personal injury practices with intake forms, case management, and client communications",
          firmInfo: {
            practiceAreas: ["Personal Injury", "Auto Accidents", "Slip & Fall"],
            firmSize: "Small (2-10 attorneys)"
          },
          branding: {
            primaryColor: "#DC2626",
            secondaryColor: "#FEE2E2"
          },
          preferences: {
            caseTypes: ["Motor Vehicle Accidents", "Premises Liability", "Medical Malpractice"],
            defaultLanguage: "English"
          },
          integrations: ["DocuSign", "QuickBooks"],
          documentTemplates: [
            { name: "Client Intake Form", type: "intake" },
            { name: "Retainer Agreement", type: "contract" },
            { name: "Medical Records Request", type: "discovery" }
          ],
          createdAt: "2025-01-15T00:00:00Z",
          isDefault: true
        },
        {
          id: 2,
          name: "Corporate Law Firm",
          description: "Enterprise template for corporate law practices with contract management and business formation tools",
          firmInfo: {
            practiceAreas: ["Corporate Law", "Business Formation", "Contract Law"],
            firmSize: "Medium (11-50 attorneys)"
          },
          branding: {
            primaryColor: "#1D4ED8",
            secondaryColor: "#DBEAFE"
          },
          preferences: {
            caseTypes: ["Business Formation", "Contract Review", "Mergers & Acquisitions"],
            defaultLanguage: "English"
          },
          integrations: ["Microsoft 365", "Slack", "DocuSign"],
          documentTemplates: [
            { name: "Operating Agreement", type: "corporate" },
            { name: "NDA Template", type: "contract" },
            { name: "Employment Agreement", type: "employment" }
          ],
          createdAt: "2025-01-10T00:00:00Z",
          isDefault: false
        },
        {
          id: 3,
          name: "Family Law Practice",
          description: "Specialized template for family law with divorce proceedings, custody agreements, and client support",
          firmInfo: {
            practiceAreas: ["Family Law", "Divorce", "Child Custody"],
            firmSize: "Small (2-10 attorneys)"
          },
          branding: {
            primaryColor: "#7C3AED",
            secondaryColor: "#EDE9FE"
          },
          preferences: {
            caseTypes: ["Divorce", "Child Custody", "Adoption", "Domestic Relations"],
            defaultLanguage: "English"
          },
          integrations: ["Google Workspace", "DocuSign"],
          documentTemplates: [
            { name: "Divorce Petition", type: "family" },
            { name: "Custody Agreement", type: "family" },
            { name: "Financial Disclosure", type: "discovery" }
          ],
          createdAt: "2025-01-05T00:00:00Z",
          isDefault: false
        }
      ];

      res.json(templates);
    } catch (error) {
      console.error("Error fetching onboarding templates:", error);
      res.status(500).json({ error: "Failed to fetch onboarding templates" });
    }
  });

  app.post("/api/admin/onboarding-templates/:templateId/clone", requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      
      // In production, this would clone the template in the database
      // For now, return a mock cloned template
      const clonedTemplate = {
        id: Date.now(), // Temporary ID
        name: `Cloned Template ${templateId}`,
        description: "Cloned template for editing",
        isClone: true,
        originalTemplateId: parseInt(templateId)
      };

      res.json(clonedTemplate);
    } catch (error) {
      console.error("Error cloning template:", error);
      res.status(500).json({ error: "Failed to clone template" });
    }
  });

  app.get("/api/admin/template-preview/:templateId", requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      
      // In production, this would fetch the full template data
      // For now, redirect to a preview interface
      res.json({ 
        message: "Template preview functionality",
        templateId,
        previewUrl: `/admin/template-preview/${templateId}`
      });
    } catch (error) {
      console.error("Error fetching template preview:", error);
      res.status(500).json({ error: "Failed to fetch template preview" });
    }
  });

  // Register API routes
  app.use("/api/llm", llmRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/document-stencils", documentStencilRoutes);
  app.use("/api/onboarding", onboardingCodesRoutes);
  app.use("/api/simple-firms", simpleFirmsRoutes);
  app.use("/api/agent-assignments", agentAssignmentsRoutes);
  app.use("/api/owner/analytics", ownerAnalyticsRoutes);

  // ===== PHASE 2: NEW TENANT PORTAL ROUTES =====
  // Import and register the new tenant portal routes
  const tenantPortalRoutes = await import("./routes/tenant-portal.js");
  app.use("/api/tenant", tenantPortalRoutes.default);

  // ===== PHASE 2: LEGACY /API/APP ROUTE MIGRATION =====
  // Migrate existing /api/app/* routes to new /api/tenant/:firmCode/* structure
  // Keep legacy routes with deprecation warnings for backward compatibility

  // MIGRATED: Profile route (was /api/app/profile/:firmCode)
  app.get('/api/app/profile/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/profile/${req.params.firmCode} called. Use /api/tenant/${req.params.firmCode}/profile instead`);
    
    // Add deprecation header
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/profile instead');
    
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      const firm = await storage.getFirm(user.firmId);
      
      if (!firm || firm.slug !== firmCode) {
        return res.status(404).json({ error: 'Firm not found' });
      }
      
      res.json({ 
        firm, 
        user,
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/profile`
      });
    } catch (error) {
      console.error('Legacy profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // MIGRATED: Dashboard route (was /api/app/dashboard/:firmCode)  
  app.get('/api/app/dashboard/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/dashboard/${req.params.firmCode} called. Use /api/tenant/${req.params.firmCode}/dashboard instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/dashboard instead');
    
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Get basic dashboard stats
      const stats = {
        totalCases: 12,
        totalDocuments: 45,
        monthlyRevenue: 24500,
        activeTasks: 8
      };
      
      res.json({ 
        stats, 
        firmCode,
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/dashboard`
      });
    } catch (error) {
      console.error('Legacy dashboard fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // MIGRATED: Documents route (was /api/app/documents/:firmCode)
  app.get('/api/app/documents/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/documents/${req.params.firmCode} called. Use /api/tenant/${req.params.firmCode}/documents instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/documents instead');
    
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Get firm documents
      const documents = await storage.getFirmDocuments(user.firmId);
      
      res.json({ 
        documents, 
        firmCode,
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/documents`
      });
    } catch (error) {
      console.error('Legacy documents fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // MIGRATED: AI Review route (was /api/app/ai/review)
  app.post('/api/app/ai/review', requireAuth, requireFirmUser, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/ai/review called. Use /api/tenant/:firmCode/ai/review instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/ai/review instead');
    
    try {
      const { profileData, documentText, documentType } = req.body;
      
      if (!documentText && !profileData) {
        return res.status(400).json({ error: 'Document text or profile data is required' });
      }

      // Mock AI review response
      let suggestions: any = {
        issues: [],
        improvements: [],
        confidence: 0.85,
        reviewType: documentText ? 'document' : 'profile'
      };

      if (documentText) {
        suggestions.issues = [
          'Potential missing clause in liability section',
          'Date format inconsistency detected'
        ];
        suggestions.improvements = [
          'Consider adding force majeure clause',
          'Standardize date format throughout document',
          'Add dispute resolution mechanism'
        ];
        suggestions.documentType = documentType || 'contract';
      } else {
        suggestions.improvements = [
          'Consider adding more detailed client intake questions',
          'Billing settings could be optimized for better cash flow',
          'Practice areas could be more specific'
        ];
        suggestions.issues = [
          'Missing backup contact information',
          'Incomplete billing configuration'
        ];
      }
      
      res.json({ 
        success: true, 
        suggestions,
        timestamp: new Date().toISOString(),
        _deprecated: true,
        _newEndpoint: '/api/tenant/:firmCode/ai/review'
      });
    } catch (error) {
      console.error('Legacy AI review error:', error);
      res.status(500).json({ error: 'AI review failed' });
    }
  });

  // MIGRATED: Billing route (was /api/app/billing/:firmCode)
  app.get('/api/app/billing/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/billing/${req.params.firmCode} called. Use /api/tenant/${req.params.firmCode}/billing instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/billing instead');
    
    try {
      const { firmCode } = req.params;
      const user = req.user as any;
      
      // Get firm invoices
      const invoices = await storage.getFirmInvoices(user.firmId);
      
      res.json({ 
        invoices, 
        firmCode,
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/billing`
      });
    } catch (error) {
      console.error('Legacy billing fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch billing data' });
    }
  });

  // MIGRATED: Billing Pay route (was /api/app/billing/pay)
  app.post('/api/app/billing/pay', requireAuth, requireFirmUser, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/billing/pay called. Use /api/tenant/:firmCode/billing/pay instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/billing/pay instead');
    
    try {
      const { invoiceId, paymentMethodId, amount } = req.body;
      const user = req.user as any;

      if (!invoiceId || !paymentMethodId || !amount) {
        return res.status(400).json({ error: 'Invoice ID, payment method, and amount are required' });
      }

      // Mock payment processing
      const paymentResult = {
        id: `payment_${Date.now()}`,
        status: 'succeeded',
        amount: amount * 100,
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
        invoice_id: invoiceId,
        firm_id: user.firmId
      };

      await storage.updateInvoice(invoiceId, {
        status: 'paid',
        paidDate: new Date(),
        paymentId: paymentResult.id
      });

      res.json({
        success: true,
        payment: paymentResult,
        message: 'Payment processed successfully',
        _deprecated: true,
        _newEndpoint: '/api/tenant/:firmCode/billing/pay'
      });
    } catch (error) {
      console.error('Legacy payment processing error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // MIGRATED: Create Payment Intent route (was /api/app/billing/create-payment-intent)
  app.post('/api/app/billing/create-payment-intent', requireAuth, requireFirmUser, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/billing/create-payment-intent called. Use /api/tenant/:firmCode/billing/create-payment-intent instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/billing/create-payment-intent instead');
    
    try {
      const { amount, currency = 'usd', invoiceId } = req.body;
      const user = req.user as any;

      if (!amount || !invoiceId) {
        return res.status(400).json({ error: 'Amount and invoice ID are required' });
      }

      // Mock Stripe PaymentIntent creation
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount * 100,
        currency,
        status: 'requires_payment_method',
        metadata: {
          invoice_id: invoiceId,
          firm_id: user.firmId.toString()
        }
      };

      res.json({
        success: true,
        paymentIntent,
        _deprecated: true,
        _newEndpoint: '/api/tenant/:firmCode/billing/create-payment-intent'
      });
    } catch (error) {
      console.error('Legacy payment intent creation error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // MIGRATED: Templates route (was /api/app/templates/:firmCode)
  app.get('/api/app/templates/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/templates/${req.params.firmCode} called. Use /api/tenant/${req.params.firmCode}/templates instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/templates instead');
    
    try {
      const { firmCode } = req.params;
      
      const templates = [
        { id: 1, name: 'Contract Template', description: 'Standard contract template' },
        { id: 2, name: 'Invoice Template', description: 'Billing invoice template' },
        { id: 3, name: 'Letter Template', description: 'Professional letter template' },
        { id: 4, name: 'Agreement Template', description: 'Standard agreement template' }
      ];

      res.json({
        success: true,
        templates,
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/templates`
      });
    } catch (error) {
      console.error('Legacy templates fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // MIGRATED: Document Generation route (was /api/app/documents/:firmCode/generate)
  app.post('/api/app/documents/:firmCode/generate', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/documents/${req.params.firmCode}/generate called. Use /api/tenant/${req.params.firmCode}/documents/generate instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/documents/generate instead');
    
    try {
      const { firmCode } = req.params;
      const { templateId } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const generatedDoc = {
        id: Date.now(),
        name: `Generated Document ${Date.now()}`,
        type: 'PDF',
        templateId,
        firmCode,
        createdAt: new Date().toISOString(),
        downloadUrl: `/api/documents/${Date.now()}/download`
      };

      res.json({
        success: true,
        document: generatedDoc,
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/documents/generate`
      });
    } catch (error) {
      console.error('Legacy document generation error:', error);
      res.status(500).json({ error: 'Failed to generate document' });
    }
  });

  // MIGRATED: Time Entries Get route (was /api/app/time-entries/:firmCode)
  app.get('/api/app/time-entries/:firmCode', requireAuth, requireFirmUser, requireFirmUserWithTenant, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/time-entries/${req.params.firmCode} called. Use /api/tenant/${req.params.firmCode}/time-entries instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/time-entries instead');
    
    try {
      const { firmCode } = req.params;
      
      const timeEntries = [
        {
          id: 1,
          date: '2025-07-06',
          duration: 2.5,
          description: 'Client consultation',
          billableRate: 300,
          total: 750
        }
      ];

      res.json({
        timeEntries,
        firmCode,
        totalHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0),
        totalValue: timeEntries.reduce((sum, entry) => sum + entry.total, 0),
        _deprecated: true,
        _newEndpoint: `/api/tenant/${firmCode}/time-entries`
      });
    } catch (error) {
      console.error('Legacy time entries fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch time entries' });
    }
  });

  // MIGRATED: Time Entries Post route (was /api/app/time-entries)
  app.post('/api/app/time-entries', requireAuth, requireFirmUser, async (req, res) => {
    console.warn(`⚠️ DEPRECATED: /api/app/time-entries called. Use /api/tenant/:firmCode/time-entries instead`);
    
    res.set('X-Deprecation-Warning', 'This endpoint is deprecated. Use /api/tenant/:firmCode/time-entries instead');
    
    try {
      const { date, duration, description, billableRate } = req.body;
      const user = req.user as any;

      if (!date || !duration || !description) {
        return res.status(400).json({ error: 'Date, duration, and description are required' });
      }

      const timeEntry = {
        id: Date.now(),
        date,
        duration: parseFloat(duration),
        description,
        billableRate: billableRate || 300,
        total: parseFloat(duration) * (billableRate || 300),
        userId: user.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        timeEntry,
        _deprecated: true,
        _newEndpoint: '/api/tenant/:firmCode/time-entries'
      });
    } catch (error) {
      console.error('Legacy time entry creation error:', error);
      res.status(500).json({ error: 'Failed to create time entry' });
    }
  });

  // Routes registered successfully
}

export default registerRoutes;