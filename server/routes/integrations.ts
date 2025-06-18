import { Router } from "express";
import { requireJWTAuth as requireAuth, requireJWTAdmin as requireAdmin } from "../auth/jwt-auth-clean";
import { integrationService } from "../services/integration-service";
import { insertPlatformIntegrationSchema, insertFirmIntegrationSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Platform Integration Management (Admin Only)
router.post("/platform", requireAdmin, async (req, res) => {
  try {
    const validatedData = insertPlatformIntegrationSchema.parse(req.body);
    const integration = await integrationService.createPlatformIntegration(validatedData);
    res.json(integration);
  } catch (error) {
    console.error("Error creating platform integration:", error);
    res.status(400).json({ error: "Failed to create platform integration" });
  }
});

router.get("/platform", requireAdmin, async (req, res) => {
  try {
    const integrations = await integrationService.getAllPlatformIntegrations();
    res.json(integrations);
  } catch (error) {
    console.error("Error fetching platform integrations:", error);
    res.status(500).json({ error: "Failed to fetch platform integrations" });
  }
});

router.put("/platform/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = insertPlatformIntegrationSchema.partial().parse(req.body);
    const integration = await integrationService.updatePlatformIntegration(id, updates);
    res.json(integration);
  } catch (error) {
    console.error("Error updating platform integration:", error);
    res.status(400).json({ error: "Failed to update platform integration" });
  }
});

// Firm Integration Management
router.post("/firm", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Validate input with API key support
    const schema = insertFirmIntegrationSchema.extend({
      apiKey: z.string().optional()
    });
    
    const validatedData = schema.parse({
      ...req.body,
      firmId: user.firmId,
      enabledBy: user.id
    });

    const integration = await integrationService.enableFirmIntegration(validatedData);
    res.json(integration);
  } catch (error) {
    console.error("Error enabling firm integration:", error);
    res.status(400).json({ error: "Failed to enable integration" });
  }
});

router.get("/firm", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const integrations = await integrationService.getFirmIntegrations(user.firmId);
    
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

router.put("/firm/:integrationId", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const integrationId = parseInt(req.params.integrationId);
    
    const schema = insertFirmIntegrationSchema.partial().extend({
      apiKey: z.string().optional()
    });
    
    const updates = schema.parse(req.body);
    
    // Add API credentials if provided
    if (updates.apiKey) {
      updates.apiCredentials = { apiKey: updates.apiKey };
      delete updates.apiKey;
    }
    
    const integration = await integrationService.updateFirmIntegration(
      user.firmId, 
      integrationId, 
      { ...updates, enabledBy: user.id }
    );
    
    res.json(integration);
  } catch (error) {
    console.error("Error updating firm integration:", error);
    res.status(400).json({ error: "Failed to update integration" });
  }
});

router.delete("/firm/:integrationId", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const integrationId = parseInt(req.params.integrationId);
    
    await integrationService.disableFirmIntegration(user.firmId, integrationId, user.id);
    res.json({ message: "Integration disabled successfully" });
  } catch (error) {
    console.error("Error disabling firm integration:", error);
    res.status(400).json({ error: "Failed to disable integration" });
  }
});

// User Integration Permissions
router.post("/permissions", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    const schema = z.object({
      userId: z.number(),
      integrationId: z.number(),
      permissions: z.object({
        canRead: z.boolean().default(true),
        canWrite: z.boolean().default(false),
        canConfigure: z.boolean().default(false)
      })
    });
    
    const { userId, integrationId, permissions } = schema.parse(req.body);
    
    const permission = await integrationService.grantUserIntegrationAccess({
      userId,
      firmId: user.firmId,
      integrationId,
      grantedBy: user.id,
      permissions
    });
    
    res.json(permission);
  } catch (error) {
    console.error("Error granting user permission:", error);
    res.status(400).json({ error: "Failed to grant permission" });
  }
});

router.get("/permissions/:userId", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = parseInt(req.params.userId);
    
    const permissions = await integrationService.getUserIntegrationPermissions(userId, user.firmId);
    res.json(permissions);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

router.delete("/permissions/:userId/:integrationId", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = parseInt(req.params.userId);
    const integrationId = parseInt(req.params.integrationId);
    
    await integrationService.revokeUserIntegrationAccess(userId, user.firmId, integrationId, user.id);
    res.json({ message: "Permission revoked successfully" });
  } catch (error) {
    console.error("Error revoking user permission:", error);
    res.status(400).json({ error: "Failed to revoke permission" });
  }
});

// Integration Access Check
router.get("/check/:integrationId", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const integrationId = parseInt(req.params.integrationId);
    
    const hasAccess = await integrationService.checkUserIntegrationAccess(
      user.id, 
      user.firmId, 
      integrationId
    );
    
    res.json({ hasAccess });
  } catch (error) {
    console.error("Error checking integration access:", error);
    res.status(500).json({ error: "Failed to check access" });
  }
});

// Integration Dashboard Data
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const dashboardData = await integrationService.getIntegrationDashboardData(user.firmId);
    
    // Sanitize API credentials in response
    dashboardData.enabledIntegrations = dashboardData.enabledIntegrations.map(integration => ({
      ...integration,
      apiCredentials: integration.apiCredentials ? { hasApiKey: true } : null
    }));
    
    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Audit Logs
router.get("/audit", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const integrationId = req.query.integrationId ? parseInt(req.query.integrationId as string) : undefined;
    
    const logs = await integrationService.getIntegrationAuditLogs(user.firmId, integrationId);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// Integration API Key Retrieval (for internal API calls)
router.get("/credentials/:integrationId", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const integrationId = parseInt(req.params.integrationId);
    
    // Check if user has access to this integration
    const hasAccess = await integrationService.checkUserIntegrationAccess(
      user.id, 
      user.firmId, 
      integrationId
    );
    
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this integration" });
    }
    
    const integrations = await integrationService.getFirmIntegrations(user.firmId);
    const integration = integrations.find(i => i.integrationId === integrationId);
    
    if (!integration || !integration.apiCredentials) {
      return res.status(404).json({ error: "Integration credentials not found" });
    }
    
    // Return actual API key for internal use
    res.json({ 
      apiKey: integration.apiCredentials.apiKey,
      integrationName: integration.name || 'Unknown Integration'
    });
  } catch (error) {
    console.error("Error retrieving integration credentials:", error);
    res.status(500).json({ error: "Failed to retrieve credentials" });
  }
});

export default router;