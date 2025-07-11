import type { Express } from "express";
import { storage } from "../storage";
import { 
  insertFirmSchema,
  insertAvailableIntegrationSchema,
  insertDocumentTypeTemplateSchema,
  insertPlatformSettingSchema
} from "@shared/schema";
import { requireSessionAuth } from "../auth/session-auth";
import { requireAuth, requireAdmin } from "../auth/middleware/auth-middleware";
import express from 'express';
import { getSystemHealth, logManager } from "../utils";

const router = express.Router();

// System Health endpoint
router.get('/system-health', requireAuth, requireAdmin, async (req, res) => {
  try {
    const healthData = await getSystemHealth();
    logManager.log('info', 'System health data requested', 'admin');
    res.json(healthData);
  } catch (error) {
    const err = error as Error;
    logManager.log('error', `Failed to fetch system health data: ${err.message}`, 'admin');
    res.status(500).json({ error: 'Failed to fetch system health data' });
  }
});

// Logs endpoint for system health page
router.get('/logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { level, source, limit = 100 } = req.query;
    const limitNum = parseInt(limit as string) || 100;

    let logs;
    if (level) {
      logs = logManager.getLogsByLevel(level as string, limitNum);
    } else {
      logs = logManager.getLogs(limitNum);
    }

    logManager.log('info', 'System logs requested', 'admin');

    res.json(logs);
  } catch (error) {
    const err = error as Error;
    logManager.log('error', `Failed to fetch system logs: ${err.message}`, 'admin');
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Admin stats endpoint for dashboard metrics
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Fetch basic metrics for dashboard
    const firms = await storage.getAllFirms();
    
    const stats = {
      totalFirms: firms.length,
      activeFirms: firms.filter(f => f.status === 'active').length,
      onboardingCodes: 0, // TODO: implement when onboarding profiles are available
      totalIntegrations: 0, // TODO: add when integrations table is available
      systemUptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(stats);
  } catch (error) {
    const err = error as Error;
    logManager.log('error', `Failed to fetch admin stats: ${err.message}`, 'admin');
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Firms management endpoint
router.get('/firms', requireAuth, requireAdmin, async (req, res) => {
  try {
    const firms = await storage.getAllFirms();
    res.json(firms);
  } catch (error) {
    const err = error as Error;
    logManager.log('error', `Failed to fetch firms: ${err.message}`, 'admin');
    res.status(500).json({ error: 'Failed to fetch firms' });
  }
});

// Create new firm endpoint
router.post('/firms', requireAuth, requireAdmin, async (req, res) => {
  try {
    const firmData = insertFirmSchema.parse(req.body);
    const newFirm = await storage.createFirm(firmData);

    logManager.log('info', `Firm created: ${newFirm.name}`, 'admin');
    res.json(newFirm);
  } catch (error) {
    const err = error as Error;
    logManager.log('error', `Failed to create firm: ${err.message}`, 'admin');
    res.status(500).json({ error: 'Failed to create firm' });
  }
});

// Platform integrations endpoint
router.get('/platform-integrations', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Return empty array for now since integrations table needs to be implemented
    res.json([]);
  } catch (error) {
    const err = error as Error;
    logManager.log('error', `Failed to fetch integrations: ${err.message}`, 'admin');
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

export default router;

export function registerAdminRoutes(app: Express) {
  // Firm management routes
  app.get('/api/admin/firms', requireAuth, requireAdmin, async (req, res) => {
    try {
      const firms = await storage.getAllFirms();
      res.json(firms);
    } catch (error) {
      console.error('Error fetching firms:', error);
      res.status(500).json({ message: 'Failed to fetch firms' });
    }
  });

  app.post('/api/admin/firms', requireAdmin, async (req, res) => {
    try {
      const firmData = insertFirmSchema.parse(req.body);
      const firm = await storage.createFirm(firmData);
      res.status(201).json(firm);
    } catch (error) {
      console.error('Error creating firm:', error);
      res.status(500).json({ message: 'Failed to create firm' });
    }
  });

  app.put('/api/admin/firms/:id', requireAdmin, async (req, res) => {
    try {
      const firmId = parseInt(req.params.id);
      const updates = req.body;
      const firm = await storage.updateFirm(firmId, updates);
      if (!firm) {
        return res.status(404).json({ message: 'Firm not found' });
      }
      res.json(firm);
    } catch (error) {
      console.error('Error updating firm:', error);
      res.status(500).json({ message: 'Failed to update firm' });
    }
  });

  app.put('/api/admin/firms/:id/vertical', requireAdmin, async (req, res) => {
    try {
      const firmId = parseInt(req.params.id);
      const { vertical } = req.body;
      const firm = await storage.updateFirmVertical(firmId, vertical);
      if (!firm) {
        return res.status(404).json({ message: 'Firm not found' });
      }
      res.json(firm);
    } catch (error) {
      console.error('Error updating firm vertical:', error);
      res.status(500).json({ message: 'Failed to update firm vertical' });
    }
  });

  // Integration management routes
  app.get('/api/admin/integrations/available', requireAdmin, async (req, res) => {
    try {
      const integrations = await storage.getAvailableIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error('Error fetching available integrations:', error);
      res.status(500).json({ message: 'Failed to fetch available integrations' });
    }
  });

  app.post('/api/admin/integrations/available', requireAdmin, async (req, res) => {
    try {
      const integrationData = insertAvailableIntegrationSchema.parse(req.body);
      const integration = await storage.createAvailableIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      console.error('Error creating available integration:', error);
      res.status(500).json({ message: 'Failed to create available integration' });
    }
  });

  app.put('/api/admin/integrations/available/:id', requireAdmin, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const updates = req.body;
      const integration = await storage.updateAvailableIntegration(integrationId, updates);
      if (!integration) {
        return res.status(404).json({ message: 'Integration not found' });
      }
      res.json(integration);
    } catch (error) {
      console.error('Error updating available integration:', error);
      res.status(500).json({ message: 'Failed to update available integration' });
    }
  });

  app.get('/api/admin/firms/:firmId/integrations', requireAdmin, async (req, res) => {
    try {
      const firmId = parseInt(req.params.firmId);
      const integrations = await storage.getFirmIntegrations(firmId);
      res.json(integrations);
    } catch (error) {
      console.error('Error fetching firm integrations:', error);
      res.status(500).json({ message: 'Failed to fetch firm integrations' });
    }
  });

  app.put('/api/admin/firms/:firmId/integrations/:integrationName', requireAdmin, async (req, res) => {
    try {
      const firmId = parseInt(req.params.firmId);
      const integrationName = req.params.integrationName;
      const updates = req.body;
      const integration = await storage.updateFirmIntegration(firmId, integrationName, updates);
      if (!integration) {
        return res.status(404).json({ message: 'Firm integration not found' });
      }
      res.json(integration);
    } catch (error) {
      console.error('Error updating firm integration:', error);
      res.status(500).json({ message: 'Failed to update firm integration' });
    }
  });

  // Document type templates management
  app.get('/api/admin/document-types', requireAdmin, async (req, res) => {
    try {
      const templates = await storage.getDocumentTypeTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching document type templates:', error);
      res.status(500).json({ message: 'Failed to fetch document type templates' });
    }
  });

  app.post('/api/admin/document-types', requireAdmin, async (req, res) => {
    try {
      const templateData = insertDocumentTypeTemplateSchema.parse(req.body);
      const template = await storage.createDocumentTypeTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating document type template:', error);
      res.status(500).json({ message: 'Failed to create document type template' });
    }
  });

  app.put('/api/admin/document-types/:id', requireAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const updates = req.body;
      const template = await storage.updateDocumentTypeTemplate(templateId, updates);
      if (!template) {
        return res.status(404).json({ message: 'Document type template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error updating document type template:', error);
      res.status(500).json({ message: 'Failed to update document type template' });
    }
  });

  app.delete('/api/admin/document-types/:id', requireAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const deleted = await storage.deleteDocumentTypeTemplate(templateId);
      if (!deleted) {
        return res.status(404).json({ message: 'Document type template not found' });
      }
      res.json({ message: 'Document type template deleted successfully' });
    } catch (error) {
      console.error('Error deleting document type template:', error);
      res.status(500).json({ message: 'Failed to delete document type template' });
    }
  });

  // Platform settings management
  app.get('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      res.status(500).json({ message: 'Failed to fetch platform settings' });
    }
  });

  app.post('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const settingData = insertPlatformSettingSchema.parse(req.body);
      const setting = await storage.createPlatformSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      console.error('Error creating platform setting:', error);
      res.status(500).json({ message: 'Failed to create platform setting' });
    }
  });

  app.put('/api/admin/settings/:key', requireAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const adminId = 1; // TODO: Get from authenticated admin user
      const setting = await storage.updatePlatformSetting(key, value, adminId);
      if (!setting) {
        return res.status(404).json({ message: 'Platform setting not found' });
      }
      res.json(setting);
    } catch (error) {
      console.error('Error updating platform setting:', error);
      res.status(500).json({ message: 'Failed to update platform setting' });
    }
  });

  // Bulk operations for config updates
  app.post('/api/admin/bulk/push-config', requireAdmin, async (req, res) => {
    try {
      const { targetFirms, configUpdates } = req.body;
      const results = [];

      for (const firmId of targetFirms) {
        try {
          const firm = await storage.updateFirm(firmId, configUpdates);
          results.push({ firmId, success: true, firm });
        } catch (error) {
          const err = error as Error;
          results.push({ firmId, success: false, error: err.message });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error('Error pushing config updates:', error);
      res.status(500).json({ message: 'Failed to push config updates' });
    }
  });

  // Vertical management
  app.get('/api/admin/verticals', requireAdmin, async (req, res) => {
    try {
      const verticals = [
        { name: 'firmsync', displayName: 'FIRMSYNC', industry: 'Legal', description: 'Legal document analysis and workflow management' },
        { name: 'medsync', displayName: 'MEDSYNC', industry: 'Medical', description: 'Medical document review and HIPAA compliance' },
        { name: 'edusync', displayName: 'EDUSYNC', industry: 'Education', description: 'Educational document management and accreditation' },
        { name: 'hrsync', displayName: 'HRSYNC', industry: 'Human Resources', description: 'HR document processing and EEOC compliance' }
      ];
      res.json(verticals);
    } catch (error) {
      console.error('Error fetching verticals:', error);
      res.status(500).json({ message: 'Failed to fetch verticals' });
    }
  });
}