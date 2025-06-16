import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { storage } from "./storage";
import { requireAuth, requireAdmin } from "./auth/authMiddleware-simple";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Basic auth routes
  app.get("/api/session", async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json({ user });
    } catch (error) {
      console.error("Session error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Basic tenant route
  app.get("/api/tenant/:subdomain", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const firm = await storage.getFirmByTenant(subdomain);
      
      if (!firm) {
        return res.status(404).json({ error: "Tenant not found" });
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
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  // Basic firm route
  app.get("/api/firms/:id", requireAuth, async (req, res) => {
    try {
      const firmId = parseInt(req.params.id);
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

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

  // Admin system health route
  app.get("/api/admin/system-health", requireAdmin, (req, res) => {
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

  // Admin logs route
  app.get("/api/admin/logs", requireAdmin, (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}