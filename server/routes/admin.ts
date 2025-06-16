import type { Express } from "express";
import { storage } from "../storage";
import { 
  insertFirmSchema,
  insertAvailableIntegrationSchema,
  insertDocumentTypeTemplateSchema,
  insertPlatformSettingSchema
} from "@shared/schema";
import { jwtAuthMiddleware, requireAdmin } from "../auth/authMiddleware";
import express from 'express';
import { authenticateToken } from '../auth/authMiddleware';

const router = express.Router();

// System Health endpoint
router.get('/system-health', authenticateToken, async (req, res) => {
  try {
    // Mock system health data - replace with actual system monitoring
    const healthData = {
      memory: {
        used: 2.1,
        total: 8.0,
        percentage: 26
      },
      cpu: {
        usage: 15,
        cores: 4
      },
      logs: {
        errorCount: 3,
        warningCount: 12,
        infoCount: 156
      },
      database: {
        status: 'healthy',
        connections: 12,
        maxConnections: 100
      },
      tenants: {
        active: 5,
        total: 8
      },
      uptime: Math.floor(process.uptime())
    };

    res.json(healthData);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health data' });
  }
});

export default router;

export function registerAdminRoutes(app: Express) {
  // Firm management routes
  app.get('/api/admin/firms', jwtAuthMiddleware, requireAdmin, async (req, res) => {
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
          results.push({ firmId, success: false, error: error.message });
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
```

This combined file has duplicate express import and const router definition. I will extract the system health router to a different file and import it in admin.ts.

```typescript
import type { Express } from "express";
import { storage } from "../storage";
import { 
  insertFirmSchema,
  insertAvailableIntegrationSchema,
  insertDocumentTypeTemplateSchema,
  insertPlatformSettingSchema
} from "@shared/schema";
import { jwtAuthMiddleware, requireAdmin } from "../auth/authMiddleware";
import systemHealthRouter from './systemHealthRoute';

export function registerAdminRoutes(app: Express) {
  app.use('/', systemHealthRouter);

  // Firm management routes
  app.get('/api/admin/firms', jwtAuthMiddleware, requireAdmin, async (req, res) => {
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
          results.push({ firmId, success: false, error: error.message });
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
```

```typescript
// systemHealthRoute.ts
import express from 'express';
import { authenticateToken } from '../auth/authMiddleware';

const router = express.Router();

// System Health endpoint
router.get('/system-health', authenticateToken, async (req, res) => {
  try {
    // Mock system health data - replace with actual system monitoring
    const healthData = {
      memory: {
        used: 2.1,
        total: 8.0,
        percentage: 26
      },
      cpu: {
        usage: 15,
        cores: 4
      },
      logs: {
        errorCount: 3,
        warningCount: 12,
        infoCount: 156
      },
      database: {
        status: 'healthy',
        connections: 12,
        maxConnections: 100
      },
      tenants: {
        active: 5,
        total: 8
      },
      uptime: Math.floor(process.uptime())
    };

    res.json(healthData);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health data' });
  }
});

export default router;