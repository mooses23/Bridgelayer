import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { storage } from "./storage";
import { login, logout, getSession, refreshToken } from "./auth/jwt-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes - JWT based
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/session", getSession);
  app.post("/api/auth/refresh", refreshToken);

  // Basic tenant route - handles both subdomains and Replit workspace IDs
  app.get("/api/tenant/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // For development in Replit, return a default tenant
      if (identifier.includes('-') && identifier.length > 20) {
        const tenant = {
          id: 1,
          name: "Demo Law Firm",
          subdomain: "demo",
          features: {
            billingEnabled: true,
            documentsEnabled: true,
            intakeEnabled: true,
            communicationsEnabled: true,
            calendarEnabled: true
          }
        };
        return res.json({ tenant });
      }

      // Try to find firm by slug/subdomain
      const firm = await storage.getFirmByTenant(identifier);
      
      if (!firm) {
        // Return default tenant for development
        const tenant = {
          id: 1,
          name: "Demo Law Firm", 
          subdomain: "demo",
          features: {
            billingEnabled: true,
            documentsEnabled: true,
            intakeEnabled: true,
            communicationsEnabled: true,
            calendarEnabled: true
          }
        };
        return res.json({ tenant });
      }

      const tenant = {
        id: firm.id,
        name: firm.name,
        subdomain: firm.subdomain,
        features: {
          billingEnabled: true,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true
        }
      };

      res.json({ tenant });
    } catch (error) {
      console.error("Error fetching tenant:", error);
      
      // Return default tenant on error for development
      const tenant = {
        id: 1,
        name: "Demo Law Firm",
        subdomain: "demo", 
        features: {
          billingEnabled: true,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true
        }
      };
      res.json({ tenant });
    }
  });

  // Basic firm route - simplified for now
  app.get("/api/firms/:id", async (req, res) => {
    try {
      const firmId = parseInt(req.params.id);
      const firm = await storage.getFirm(firmId);
      
      if (!firm) {
        return res.status(404).json({ error: "Firm not found" });
      }

      const firmWithFeatures = {
        ...firm,
        features: {
          billingEnabled: true,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true
        }
      };

      res.json(firmWithFeatures);
    } catch (error) {
      console.error("Error retrieving firm:", error);
      res.status(500).json({ error: "Failed to retrieve firm" });
    }
  });

  // Admin system health route - simplified for now
  app.get("/api/admin/system-health", (req, res) => {
    try {
      const healthData = {
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        logs: {
          total: 0,
          lastHour: 0,
          lastDay: 0,
          errorCount: 0,
          warnCount: 0,
          sources: ["server"]
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development"
      };

      res.json(healthData);
    } catch (error) {
      console.error("Error getting system health:", error);
      res.status(500).json({ error: "Failed to get system health" });
    }
  });

  // Admin logs route - simplified for now
  app.get("/api/admin/logs", (req, res) => {
    try {
      const logs = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Application started successfully",
          source: "server",
          metadata: {}
        }
      ];

      res.json({ logs });
    } catch (error) {
      console.error("Error getting logs:", error);
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  // Dashboard summary endpoint - simplified for now
  app.get("/api/dashboard-summary", async (req, res) => {
    try {
      const tenantId = req.query.tenant as string;

      const summary = {
        totalCases: 24,
        activeClients: 12,
        documentsReviewed: 48,
        billableHours: "156.5",
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

  // Cases endpoint
  app.get('/api/cases', async (req, res) => {
    try {
      const cases = [
        { id: 1, name: "Smith v. Jones", status: "active", priority: "high", dueDate: new Date(Date.now() + 86400000 * 3).toISOString() },
        { id: 2, name: "Contract Review - ABC Corp", status: "active", priority: "medium", dueDate: new Date(Date.now() + 86400000 * 7).toISOString() },
        { id: 3, name: "Estate Planning - Johnson", status: "pending", priority: "low", dueDate: new Date(Date.now() + 86400000 * 14).toISOString() }
      ];

      res.json(cases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Cases summary endpoint
  app.get('/api/cases-summary', async (req, res) => {
    try {
      const summary = {
        totalCases: 24,
        activeCases: 18,
        highPriority: 6,
        upcomingDeadlines: 3
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching cases summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}