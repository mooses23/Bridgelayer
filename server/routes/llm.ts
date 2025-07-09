import express from 'express';
import { llmService } from '../services/llmService';
import { tabLlmService } from '../services/tabLlmService';
import { promptTemplateService } from '../services/promptTemplateService';
import { requireAuth, requireRole, requireTenantAccess } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Initialize default templates (admin only)
router.post('/templates/initialize', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await promptTemplateService.initializeDefaultTemplates();
    res.json({ message: 'Default templates initialized successfully' });
  } catch (error) {
    console.error('Template initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize templates' });
  }
});

// Set firm's OpenAI API key
router.post('/settings/api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'Valid API key required' });
    }

    await llmService.setFirmApiKey(firmId, apiKey, userId);
    res.json({ message: 'API key configured successfully' });
  } catch (error) {
    console.error('API key configuration error:', error);
    res.status(500).json({ error: 'Failed to configure API key' });
  }
});

// Get firm's LLM settings
router.get('/settings', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    if (!firmId) {
      return res.status(400).json({ error: 'Firm ID required' });
    }
    const settings = await llmService.getFirmSettings(firmId);
    res.json(settings);
  } catch (error) {
    console.error('Get LLM settings error:', error);
    res.status(500).json({ error: 'Failed to get LLM settings' });
  }
});

// Get firm's LLM usage statistics
router.get('/usage/stats', async (req, res) => {
  try {
    const firmId = req.user?.firmId;

    if (!firmId) {
      return res.status(400).json({ error: 'Firm ID required' });
    }

    const stats = await llmService.getFirmUsageStats(firmId);
    res.json(stats);
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Dashboard insights
router.get('/insights/dashboard', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getDashboardInsights(firmId, userId);
    res.json(insights);
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard insights' });
  }
});

// Client insights
router.get('/insights/clients/:clientId?', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const clientId = req.params.clientId ? parseInt(req.params.clientId) : undefined;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getClientInsights(firmId, userId, clientId);
    res.json(insights);
  } catch (error) {
    console.error('Client insights error:', error);
    res.status(500).json({ error: 'Failed to generate client insights' });
  }
});

// Case insights
router.get('/insights/cases/:caseId?', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const caseId = req.params.caseId ? parseInt(req.params.caseId) : undefined;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getCaseInsights(firmId, userId, caseId);
    res.json(insights);
  } catch (error) {
    console.error('Case insights error:', error);
    res.status(500).json({ error: 'Failed to generate case insights' });
  }
});

// Document insights
router.get('/insights/documents/:documentId?', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const documentId = req.params.documentId ? parseInt(req.params.documentId) : undefined;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getDocumentInsights(firmId, userId, documentId);
    res.json(insights);
  } catch (error) {
    console.error('Document insights error:', error);
    res.status(500).json({ error: 'Failed to generate document insights' });
  }
});

// Calendar insights
router.get('/insights/calendar', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getCalendarInsights(firmId, userId);
    res.json(insights);
  } catch (error) {
    console.error('Calendar insights error:', error);
    res.status(500).json({ error: 'Failed to generate calendar insights' });
  }
});

// Task insights
router.get('/insights/tasks', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getTaskInsights(firmId, userId);
    res.json(insights);
  } catch (error) {
    console.error('Task insights error:', error);
    res.status(500).json({ error: 'Failed to generate task insights' });
  }
});

// Billing insights
router.get('/insights/billing', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    const insights = await tabLlmService.getBillingInsights(firmId, userId);
    res.json(insights);
  } catch (error) {
    console.error('Billing insights error:', error);
    res.status(500).json({ error: 'Failed to generate billing insights' });
  }
});

// Paralegal insights
router.post('/insights/paralegal', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const { requestType, query } = req.body;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    if (!requestType) {
      return res.status(400).json({ error: 'Request type required' });
    }

    const insights = await tabLlmService.getParalegalInsights(firmId, userId, requestType, query);
    res.json(insights);
  } catch (error) {
    console.error('Paralegal insights error:', error);
    res.status(500).json({ error: 'Failed to generate paralegal insights' });
  }
});

// Custom query for any tab
router.post('/insights/custom', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const { tabType, query } = req.body;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    if (!tabType || !query) {
      return res.status(400).json({ error: 'Tab type and query required' });
    }

    const insights = await tabLlmService.getCustomInsights(firmId, userId, tabType, query);
    res.json(insights);
  } catch (error) {
    console.error('Custom insights error:', error);
    res.status(500).json({ error: 'Failed to process custom query' });
  }
});

// Template management routes

// Get firm templates
router.get('/templates/:tabType?', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const tabType = req.params.tabType;

    if (!firmId) {
      return res.status(400).json({ error: 'Firm ID required' });
    }

    const templates = await promptTemplateService.getFirmTemplates(firmId, tabType);
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Create custom template
router.post('/templates', async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const { tabType, promptName, basePrompt, systemPrompt, contextInstructions, responseFormat } = req.body;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Firm ID and User ID required' });
    }

    if (!tabType || !promptName || !basePrompt) {
      return res.status(400).json({ error: 'Tab type, prompt name, and base prompt required' });
    }

    const templateId = await promptTemplateService.createFirmTemplate(
      firmId,
      tabType,
      { promptName, basePrompt, systemPrompt, contextInstructions, responseFormat },
      userId
    );

    if (templateId) {
      res.json({ id: templateId, message: 'Template created successfully' });
    } else {
      res.status(500).json({ error: 'Failed to create template' });
    }
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/templates/:templateId', async (req, res) => {
  try {
    const templateId = parseInt(req.params.templateId);
    const updates = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID required' });
    }

    const success = await promptTemplateService.updateTemplate(templateId, updates);
    
    if (success) {
      res.json({ message: 'Template updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update template' });
    }
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Clone template
router.post('/templates/:templateId/clone', async (req, res) => {
  try {
    const sourceTemplateId = parseInt(req.params.templateId);
    const firmId = req.user?.firmId;
    const userId = req.user?.id;
    const { newName } = req.body;

    if (!sourceTemplateId || !firmId || !userId || !newName) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newTemplateId = await promptTemplateService.cloneTemplate(
      sourceTemplateId,
      firmId,
      newName,
      userId
    );

    if (newTemplateId) {
      res.json({ id: newTemplateId, message: 'Template cloned successfully' });
    } else {
      res.status(500).json({ error: 'Failed to clone template' });
    }
  } catch (error) {
    console.error('Clone template error:', error);
    res.status(500).json({ error: 'Failed to clone template' });
  }
});

// Cache cleanup (admin only)
router.post('/cache/cleanup', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await llmService.cleanupCache();
    res.json({ message: 'Cache cleaned up successfully' });
  } catch (error) {
    console.error('Cache cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup cache' });
  }
});

// =============================================================================
// PHASE 3: LLM FUNCTION API ENDPOINTS - All 11 Functions
// =============================================================================

// 1. Document Review
router.post('/functions/document-review', async (req, res) => {
  try {
    const { documentId, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await tabLlmService.getDocumentReview(firmId, userId, documentId, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Document review error:', error);
    res.status(500).json({ error: 'Failed to perform document review' });
  }
});

// 2. Contract Analysis
router.post('/functions/contract-analysis', async (req, res) => {
  try {
    const { documentId, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await tabLlmService.getContractAnalysis(firmId, userId, documentId, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Contract analysis error:', error);
    res.status(500).json({ error: 'Failed to perform contract analysis' });
  }
});

// 3. Compliance Check
router.post('/functions/compliance-check', async (req, res) => {
  try {
    const { documentId, regulations, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await tabLlmService.getComplianceCheck(firmId, userId, documentId, regulations, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({ error: 'Failed to perform compliance check' });
  }
});

// 4. Risk Assessment
router.post('/functions/risk-assessment', async (req, res) => {
  try {
    const { documentId, riskTypes, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await tabLlmService.getRiskAssessment(firmId, userId, documentId, riskTypes, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to perform risk assessment' });
  }
});

// 5. Clause Extraction
router.post('/functions/clause-extraction', async (req, res) => {
  try {
    const { documentId, clauseTypes, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await tabLlmService.getClauseExtraction(firmId, userId, documentId, clauseTypes, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Clause extraction error:', error);
    res.status(500).json({ error: 'Failed to extract clauses' });
  }
});

// 6. Legal Research
router.post('/functions/legal-research', async (req, res) => {
  try {
    const { query, jurisdiction, practiceArea } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Research query is required' });
    }

    const result = await tabLlmService.getLegalResearch(firmId, userId, query, jurisdiction, practiceArea);
    res.json(result);
  } catch (error) {
    console.error('Legal research error:', error);
    res.status(500).json({ error: 'Failed to perform legal research' });
  }
});

// 7. Document Drafting
router.post('/functions/document-drafting', async (req, res) => {
  try {
    const { documentType, parameters, templateId } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const result = await tabLlmService.getDocumentDrafting(firmId, userId, documentType, parameters, templateId);
    res.json(result);
  } catch (error) {
    console.error('Document drafting error:', error);
    res.status(500).json({ error: 'Failed to draft document' });
  }
});

// 8. Case Strategy
router.post('/functions/case-strategy', async (req, res) => {
  try {
    const { caseId, strategyType, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!caseId) {
      return res.status(400).json({ error: 'Case ID is required' });
    }

    const result = await tabLlmService.getCaseStrategy(firmId, userId, caseId, strategyType, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Case strategy error:', error);
    res.status(500).json({ error: 'Failed to generate case strategy' });
  }
});

// 9. Discovery Management (Paralegal+)
router.post('/functions/discovery-management', async (req, res) => {
  try {
    const { caseId, discoveryType, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!caseId) {
      return res.status(400).json({ error: 'Case ID is required' });
    }

    const result = await tabLlmService.getDiscoveryManagement(firmId, userId, caseId, discoveryType, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Discovery management error:', error);
    res.status(500).json({ error: 'Failed to manage discovery' });
  }
});

// 10. Citation Research (Paralegal+)
router.post('/functions/citation-research', async (req, res) => {
  try {
    const { query, citationStyle, jurisdiction } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Citation query is required' });
    }

    const result = await tabLlmService.getCitationResearch(firmId, userId, query, citationStyle, jurisdiction);
    res.json(result);
  } catch (error) {
    console.error('Citation research error:', error);
    res.status(500).json({ error: 'Failed to research citations' });
  }
});

// 11. Document Automation (Paralegal+)
router.post('/functions/document-automation', async (req, res) => {
  try {
    const { automationType, parameters, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!automationType) {
      return res.status(400).json({ error: 'Automation type is required' });
    }

    const result = await tabLlmService.getDocumentAutomation(firmId, userId, automationType, parameters, userQuery);
    res.json(result);
  } catch (error) {
    console.error('Document automation error:', error);
    res.status(500).json({ error: 'Failed to automate document process' });
  }
});

// Batch Analysis - Process multiple functions on one document
router.post('/functions/batch-analysis', async (req, res) => {
  try {
    const { documentId, functions, userQuery } = req.body;
    const firmId = req.user?.firmId;
    const userId = req.user?.id;

    if (!firmId || !userId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    if (!documentId || !functions || !Array.isArray(functions)) {
      return res.status(400).json({ error: 'Document ID and functions array required' });
    }

    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // Process each function
    for (const functionName of functions) {
      try {
        let result;
        switch (functionName) {
          case 'document_review':
            result = await tabLlmService.getDocumentReview(firmId, userId, documentId, userQuery);
            break;
          case 'contract_analysis':
            result = await tabLlmService.getContractAnalysis(firmId, userId, documentId, userQuery);
            break;
          case 'compliance_check':
            result = await tabLlmService.getComplianceCheck(firmId, userId, documentId, [], userQuery);
            break;
          case 'risk_assessment':
            result = await tabLlmService.getRiskAssessment(firmId, userId, documentId, [], userQuery);
            break;
          case 'clause_extraction':
            result = await tabLlmService.getClauseExtraction(firmId, userId, documentId, [], userQuery);
            break;
          default:
            errors[functionName] = 'Function not supported in batch mode';
            continue;
        }
        results[functionName] = result;
      } catch (err: any) {
        errors[functionName] = err?.message || 'Unknown error';
      }
    }

    res.json({ results, errors });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: 'Failed to perform batch analysis' });
  }
});

// Function Status - Check if a function is available for the firm
router.get('/functions/status', async (req, res) => {
  try {
    const firmId = req.user?.firmId;

    if (!firmId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    // Check if firm has API key configured
    const hasApiKey = await llmService.checkFirmApiKey(firmId);
    
    const functions = [
      'document_review', 'contract_analysis', 'compliance_check', 'risk_assessment',
      'clause_extraction', 'legal_research', 'document_drafting', 'case_strategy',
      'discovery_management', 'citation_research', 'document_automation'
    ];

    const status = {
      hasApiKey,
      adminFallbackAvailable: !!process.env.OPENAI_API_KEY,
      availableFunctions: functions,
      totalFunctions: functions.length
    };

    res.json(status);
  } catch (error) {
    console.error('Function status error:', error);
    res.status(500).json({ error: 'Failed to check function status' });
  }
});

// Get all LLM providers
router.get('/admin/providers', requireRole(['admin']), async (req, res) => {
  try {
    const providers = await llmService.getAllProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error fetching LLM providers:', error);
    res.status(500).json({ error: 'Failed to fetch LLM providers' });
  }
});

// Get a specific LLM provider
router.get('/admin/providers/:id', requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const provider = await llmService.getProviderById(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error('Error fetching LLM provider:', error);
    res.status(500).json({ error: 'Failed to fetch LLM provider' });
  }
});

// Create a new LLM provider
router.post('/admin/providers', requireRole(['admin']), async (req, res) => {
  try {
    const { name, apiKeyName, endpoint, requiresApiKey, status } = req.body;
    
    if (!name || !apiKeyName) {
      return res.status(400).json({ error: 'Name and apiKeyName are required' });
    }
    
    const newProvider = await llmService.createProvider({
      name, 
      apiKeyName, 
      endpoint: endpoint || null, 
      requiresApiKey: requiresApiKey !== false, 
      status: status || 'active'
    });
    
    res.status(201).json(newProvider);
  } catch (error) {
    console.error('Error creating LLM provider:', error);
    res.status(500).json({ error: 'Failed to create LLM provider' });
  }
});

// Update an LLM provider
router.put('/admin/providers/:id', requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const { name, apiKeyName, endpoint, requiresApiKey, status } = req.body;
    const updatedProvider = await llmService.updateProvider(id, { 
      name, 
      apiKeyName, 
      endpoint, 
      requiresApiKey, 
      status 
    });
    
    if (!updatedProvider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(updatedProvider);
  } catch (error) {
    console.error('Error updating LLM provider:', error);
    res.status(500).json({ error: 'Failed to update LLM provider' });
  }
});

// Delete an LLM provider
router.delete('/admin/providers/:id', requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const result = await llmService.deleteProvider(id);
    if (!result) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting LLM provider:', error);
    res.status(500).json({ error: 'Failed to delete LLM provider' });
  }
});

// Get all LLM models
router.get('/admin/models', requireRole(['admin']), async (req, res) => {
  try {
    const models = await llmService.getAllModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching LLM models:', error);
    res.status(500).json({ error: 'Failed to fetch LLM models' });
  }
});

// Get LLM models by provider
router.get('/admin/providers/:providerId/models', requireRole(['admin']), async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const models = await llmService.getModelsByProvider(providerId);
    res.json(models);
  } catch (error) {
    console.error('Error fetching LLM models by provider:', error);
    res.status(500).json({ error: 'Failed to fetch LLM models' });
  }
});

// Get a specific LLM model
router.get('/admin/models/:id', requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid model ID' });
    }
    
    const model = await llmService.getModelById(id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json(model);
  } catch (error) {
    console.error('Error fetching LLM model:', error);
    res.status(500).json({ error: 'Failed to fetch LLM model' });
  }
});

// Create a new LLM model
router.post('/admin/models', requireRole(['admin']), async (req, res) => {
  try {
    const { name, providerId, description, contextWindow, costPer1kTokens, enabled } = req.body;
    
    if (!name || !providerId) {
      return res.status(400).json({ error: 'Name and providerId are required' });
    }
    
    const newModel = await llmService.createModel({
      name,
      providerId: parseInt(providerId),
      description,
      contextWindow: contextWindow ? parseInt(contextWindow) : null,
      costPer1kTokens: costPer1kTokens ? parseInt(costPer1kTokens) : null,
      enabled: enabled !== false
    });
    
    res.status(201).json(newModel);
  } catch (error) {
    console.error('Error creating LLM model:', error);
    res.status(500).json({ error: 'Failed to create LLM model' });
  }
});

// Update an LLM model
router.put('/admin/models/:id', requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid model ID' });
    }
    
    const { name, providerId, description, contextWindow, costPer1kTokens, enabled } = req.body;
    const updatedModel = await llmService.updateModel(id, { 
      name,
      providerId: providerId ? parseInt(providerId) : undefined,
      description,
      contextWindow: contextWindow ? parseInt(contextWindow) : undefined,
      costPer1kTokens: costPer1kTokens ? parseInt(costPer1kTokens) : undefined,
      enabled
    });
    
    if (!updatedModel) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json(updatedModel);
  } catch (error) {
    console.error('Error updating LLM model:', error);
    res.status(500).json({ error: 'Failed to update LLM model' });
  }
});

// Delete an LLM model
router.delete('/admin/models/:id', requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid model ID' });
    }
    
    const result = await llmService.deleteModel(id);
    if (!result) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting LLM model:', error);
    res.status(500).json({ error: 'Failed to delete LLM model' });
  }
});

export default router;
