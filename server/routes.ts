import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { storage } from "./storage";
import { authStrategyMiddleware } from "./auth/strategy-router";
import { requireAuth, requireAdmin, requireFirmUser, requireTenantAccess } from "./auth/middleware/unified-auth-middleware";
import { hybridLogin, hybridLogout, hybridSessionCheck, hybridAuthStatus } from "./auth/hybrid-controller";
import { refreshJWTTokens } from "./auth/jwt-auth-clean";
import integrationRoutes from "./routes/integrations";

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

  // Admin firms management endpoint
  app.get("/api/admin/firms", requireAuth, requireAdmin, async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      
      // Enhance firms with additional metadata for admin view
      const enhancedFirms = await Promise.all(firms.map(async (firm) => {
        const users = await storage.getUsersByFirm(firm.id);
        const documents = await storage.getFirmDocuments(firm.id);
        
        return {
          ...firm,
          userCount: users.length,
          documentsCount: documents.length,
          casesCount: 0, // Will be implemented when cases system is added
          onboardingProgress: firm.onboarded ? 100 : 25,
          lastActivity: "Recently",
          createdAt: firm.createdAt || new Date().toISOString()
        };
      }));

      res.json(enhancedFirms);
    } catch (error) {
      console.error("Error fetching firms for admin:", error);
      res.status(500).json({ error: 'Failed to fetch firms' });
    }
  });

  // Admin create new firm endpoint
  app.post("/api/admin/firms", requireAuth, requireAdmin, async (req, res) => {
    try {
      const {
        firmName,
        firmSlug,
        description,
        website,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        practiceAreas,
        firmSize,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminRole,
        enabledFeatures,
        billingRate,
        timezone
      } = req.body;

      // Create the firm
      const newFirm = await storage.createFirm({
        name: firmName,
        slug: firmSlug,
        description: description || null,
        website: website || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        onboarded: false,
        plan: "professional",
        features: {
          billingEnabled: enabledFeatures.includes("billing"),
          documentsEnabled: enabledFeatures.includes("documents"),
          intakeEnabled: enabledFeatures.includes("intake"),
          communicationsEnabled: enabledFeatures.includes("communications"),
          calendarEnabled: enabledFeatures.includes("calendar"),
          analyticsEnabled: enabledFeatures.includes("analytics"),
          aiDebug: false,
          adminGhostMode: false
        }
      });

      // Create the admin user for the firm
      const adminUser = await storage.createUser({
        email: adminEmail,
        password: "temp_password_123", // Will need to be changed on first login
        firstName: adminFirstName,
        lastName: adminLastName,
        role: adminRole || "firm_admin",
        firmId: newFirm.id,
        active: true
      });

      res.json({
        message: "Firm created successfully",
        firm: newFirm,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role
        }
      });
    } catch (error) {
      console.error("Error creating firm:", error);
      res.status(500).json({ error: 'Failed to create firm' });
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

  // Integration routes
  app.use("/api/integrations", integrationRoutes);

  // Create HTTP server
  const server = createServer(app);
  return server;
}