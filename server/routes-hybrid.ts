import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { authStrategyMiddleware } from "./auth/strategy-router";
import { requireAuth, requireAdmin, requireFirmUser, requireTenantAccess } from "./auth/middleware/unified-auth-middleware";
import { hybridLogin, hybridLogout, hybridSessionCheck, hybridAuthStatus } from "./auth/hybrid-controller";
import { refreshJWTTokens } from "./auth/jwt-auth-clean";

// JWT validation function matching working admin endpoints
async function validateJWTAuth(req: any) {
  try {
    const jwtToken = req.cookies.firmsync_access_token;
    if (!jwtToken) {
      return { success: false, error: "No JWT token found" };
    }

    const jwt = await import('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
    const payload = jwt.verify(jwtToken, secret) as any;
    
    if (payload && payload.type === 'access') {
      const user = await storage.getUser(payload.userId);
      if (user) {
        return { success: true, user };
      }
    }
    
    return { success: false, error: "Invalid token" };
  } catch (error) {
    return { success: false, error: "JWT validation failed" };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Unified Hybrid Authentication Routes
  app.post("/api/auth/login", hybridLogin);
  app.post("/api/auth/logout", hybridLogout);
  app.get("/api/auth/session", hybridSessionCheck);
  app.get("/api/auth/status", hybridAuthStatus);
  app.post("/api/auth/refresh", refreshJWTTokens);

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

  // Dashboard summary endpoint
  app.get("/api/dashboard-summary", requireAuth, async (req, res) => {
    try {
      const { tenant } = req.query;
      
      // Mock data for now - in production would fetch real metrics
      const summary = {
        totalCases: 24,
        activeClients: 18,
        documentsReviewed: 156,
        billableHours: 324.5,
        pendingReviews: 8,
        upcomingDeadlines: 3
      };

      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  });

  // Cases endpoints
  app.get("/api/cases", requireAuth, async (req, res) => {
    try {
      const { tenant } = req.query;
      
      // Mock data for cases
      const cases = [
        {
          id: 1,
          title: "Smith v. ABC Corp",
          status: "Active",
          priority: "High",
          dueDate: "2025-07-01",
          assignedTo: "Sarah Johnson"
        },
        {
          id: 2,
          title: "Johnson Contract Review",
          status: "Review",
          priority: "Medium",
          dueDate: "2025-06-25",
          assignedTo: "Mike Chen"
        }
      ];

      res.json({ cases });
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  });

  app.get("/api/cases-summary", requireAuth, async (req, res) => {
    try {
      const { tenant } = req.query;
      
      const summary = {
        totalCases: 24,
        activeCases: 18,
        highPriority: 6,
        upcomingDeadlines: 3
      };

      res.json(summary);
    } catch (error) {
      console.error("Error fetching cases summary:", error);
      res.status(500).json({ error: 'Failed to fetch cases summary' });
    }
  });

  // Integration Management Routes
  app.get("/api/integrations/dashboard", async (req, res) => {
    try {
      // Use JWT authentication like other working admin endpoints
      const authResult = await validateJWTAuth(req);
      if (!authResult.success) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = authResult.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // For admin users, provide platform-wide view (firmId = null)
      // For firm users, show their firm-specific integrations
      const firmId = user.role === 'admin' ? null : user.firmId;
      
      // Get platform integrations
      const availableIntegrations = await storage.getAllPlatformIntegrations();
      
      // Get firm integrations (empty for admin users)
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

  app.get("/api/integrations/platform", requireAdmin, async (req, res) => {
    try {
      const integrations = await storage.getAllPlatformIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching platform integrations:", error);
      res.status(500).json({ error: "Failed to fetch platform integrations" });
    }
  });

  app.post("/api/integrations/firm", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const integrationData = {
        ...req.body,
        firmId: user.firmId,
        enabledBy: user.id,
        enabledAt: new Date()
      };

      const integration = await storage.enableFirmIntegration(integrationData);
      res.json(integration);
    } catch (error) {
      console.error("Error enabling firm integration:", error);
      res.status(400).json({ error: "Failed to enable integration" });
    }
  });

  // Get available integrations for onboarding selection
  app.get("/api/integrations/available", async (req, res) => {
    try {
      const availableIntegrations = await storage.getAllPlatformIntegrations();
      res.json(availableIntegrations);
    } catch (error) {
      console.error("Error fetching available integrations:", error);
      res.status(500).json({ error: "Failed to fetch available integrations" });
    }
  });

  app.get("/api/integrations/firm", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const integrations = (user.firmId && typeof user.firmId === 'number') ? await storage.getFirmIntegrations(user.firmId) : [];
      
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

  // Create HTTP server
  const server = createServer(app);
  return server;
}