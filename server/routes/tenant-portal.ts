import { Router } from 'express';
import { requireAuth, requireFirmUser, validateFirmCode } from '../auth/middleware/auth-middleware.js';
import { requireTenantAccess, addTenantScope } from '../middleware/tenant-isolation.js';
import { storage } from '../storage.js';

const router = Router();

/**
 * NEW TENANT PORTAL ROUTES - Phase 2 Implementation
 * All routes follow /api/tenant/:firmCode/* pattern with proper tenant isolation
 */

// Apply tenant isolation middleware to all routes
router.use('/:firmCode/*', requireAuth, requireFirmUser, validateFirmCode, requireTenantAccess, addTenantScope);

/**
 * HEALTH CHECK ENDPOINT
 */

// Health check for tenant access
router.get('/:firmCode/health', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const user = req.user as any;
    const firmId = req.getTenantId!();
    
    res.json({ 
      status: 'ok', 
      firmCode,
      firmId,
      userId: user.id,
      timestamp: new Date().toISOString(),
      message: 'Tenant access verified'
    });
  } catch (error) {
    console.error('Tenant health check error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Health check failed'
    });
  }
});

/**
 * DASHBOARD TAB ENDPOINTS
 */

// Get dashboard overview for tenant
router.get('/:firmCode/dashboard', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const user = req.user as any;
    const firmId = req.getTenantId!();
    
    // Get firm-specific dashboard stats (replace with real queries)
    const stats = {
      totalCases: 12,
      totalDocuments: 45,
      monthlyRevenue: 24500,
      activeTasks: 8,
      pendingReviews: 3,
      upcomingDeadlines: 2,
      activeClients: 18,
      billableHours: 324.5
    };
    
    console.log(`📊 Dashboard accessed for firm ${firmCode} by user ${user.id}`);
    
    res.json({ 
      stats, 
      firmCode,
      firmId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get dashboard stats/metrics
router.get('/:firmCode/dashboard/stats', async (req, res) => {
  try {
    const firmId = req.getTenantId!();
    
    // Get detailed stats for dashboard widgets
    const detailedStats = {
      caseStats: {
        total: 24,
        active: 18,
        pending: 4,
        closed: 2
      },
      clientStats: {
        total: 35,
        active: 28,
        inactive: 7
      },
      financialStats: {
        monthlyRevenue: 24500,
        outstandingInvoices: 8750,
        collectionRate: 92.3
      },
      taskStats: {
        total: 47,
        overdue: 3,
        dueToday: 8,
        upcoming: 36
      }
    };
    
    res.json(detailedStats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * PROFILE/SETTINGS TAB ENDPOINTS  
 */

// Get user/firm profile
router.get('/:firmCode/profile', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const user = req.user as any;
    const firmId = req.getTenantId!();
    
    const firm = await storage.getFirm(firmId);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    console.log(`👤 Profile accessed for firm ${firmCode} by user ${user.id}`);
    
    res.json({ 
      firm: {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        status: firm.status,
        plan: firm.plan
      }, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * DOCUMENTS TAB ENDPOINTS
 */

// Get firm documents
router.get('/:firmCode/documents', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const user = req.user as any;
    const firmId = req.getTenantId!();
    
    // Get firm documents with proper tenant scoping
    const documents = await storage.getFirmDocuments(firmId);
    
    console.log(`📄 Documents accessed for firm ${firmCode} by user ${user.id}`);
    
    res.json({ 
      documents, 
      firmCode,
      count: documents?.length || 0
    });
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document templates
router.get('/:firmCode/templates', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const firmId = req.getTenantId!();
    
    // Get firm-specific templates (or default templates)
    const templates = [
      { id: 1, name: 'Contract Template', description: 'Standard contract template', firmId },
      { id: 2, name: 'Invoice Template', description: 'Billing invoice template', firmId },
      { id: 3, name: 'Letter Template', description: 'Professional letter template', firmId },
      { id: 4, name: 'Agreement Template', description: 'Standard agreement template', firmId }
    ];

    res.json({
      success: true,
      templates,
      firmCode
    });
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Generate document from template
router.post('/:firmCode/documents/generate', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const { templateId } = req.body;
    const firmId = req.getTenantId!();
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Mock document generation (integrate with actual document generation later)
    const generatedDoc = {
      id: Date.now(),
      name: `Generated Document ${Date.now()}`,
      type: 'PDF',
      templateId,
      firmCode,
      firmId,
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/documents/${Date.now()}/download`
    };

    console.log(`📝 Document generated for firm ${firmCode} from template ${templateId}`);

    res.json({
      success: true,
      document: generatedDoc
    });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

/**
 * BILLING TAB ENDPOINTS
 */

// Get billing/invoices
router.get('/:firmCode/billing', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const user = req.user as any;
    const firmId = req.getTenantId!();
    
    // Get firm invoices with proper tenant scoping
    const invoices = await storage.getFirmInvoices(firmId);
    
    console.log(`💰 Billing accessed for firm ${firmCode} by user ${user.id}`);
    
    res.json({ 
      invoices, 
      firmCode,
      count: invoices?.length || 0
    });
  } catch (error) {
    console.error('Billing fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch billing data' });
  }
});

// Get billing invoices specifically
router.get('/:firmCode/billing/invoices', async (req, res) => {
  try {
    const firmId = req.getTenantId!();
    
    const invoices = await storage.getFirmInvoices(firmId);
    
    res.json({ 
      invoices,
      total: invoices?.length || 0
    });
  } catch (error) {
    console.error('Invoices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get payment records
router.get('/:firmCode/billing/payments', async (req, res) => {
  try {
    const firmId = req.getTenantId!();
    
    // Mock payment data (replace with real queries)
    const payments = [
      {
        id: 1,
        invoiceId: 'INV-001',
        amount: 2500.00,
        date: '2025-07-01',
        method: 'Credit Card',
        status: 'Completed',
        firmId
      },
      {
        id: 2,
        invoiceId: 'INV-002', 
        amount: 3750.00,
        date: '2025-06-28',
        method: 'Bank Transfer',
        status: 'Completed',
        firmId
      }
    ];
    
    res.json({ payments });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Process payment
router.post('/:firmCode/billing/pay', async (req, res) => {
  try {
    const { invoiceId, paymentMethodId, amount } = req.body;
    const user = req.user as any;
    const firmId = req.getTenantId!();

    if (!invoiceId || !paymentMethodId || !amount) {
      return res.status(400).json({ error: 'Invoice ID, payment method, and amount are required' });
    }

    // Mock Stripe payment processing
    const paymentResult = {
      id: `payment_${Date.now()}`,
      status: 'succeeded',
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      created: Math.floor(Date.now() / 1000),
      invoice_id: invoiceId,
      firm_id: firmId
    };

    // Update invoice status in database
    await storage.updateInvoice(invoiceId, {
      status: 'paid',
      paidDate: new Date(),
      paymentId: paymentResult.id
    });

    console.log(`💳 Payment processed for firm ${req.params.firmCode} by user ${user.id}`);

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

// Create payment intent
router.post('/:firmCode/billing/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', invoiceId } = req.body;
    const firmId = req.getTenantId!();

    if (!amount || !invoiceId) {
      return res.status(400).json({ error: 'Amount and invoice ID are required' });
    }

    // Mock Stripe PaymentIntent creation
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to cents
      currency,
      status: 'requires_payment_method',
      metadata: {
        invoice_id: invoiceId,
        firm_id: firmId.toString()
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

/**
 * TIME ENTRIES ENDPOINTS
 */

// Get time entries
router.get('/:firmCode/time-entries', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const firmId = req.getTenantId!();
    
    // Get firm time entries (mock data for now)
    const timeEntries = [
      {
        id: 1,
        date: '2025-07-06',
        duration: 2.5,
        description: 'Client consultation',
        billableRate: 300,
        total: 750,
        firmId,
        status: 'pending'
      },
      {
        id: 2,
        date: '2025-07-05',
        duration: 1.75,
        description: 'Document review',
        billableRate: 300,
        total: 525,
        firmId,
        status: 'approved'
      }
    ];

    console.log(`⏰ Time entries accessed for firm ${firmCode}`);

    res.json({
      timeEntries,
      firmCode,
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0),
      totalValue: timeEntries.reduce((sum, entry) => sum + entry.total, 0)
    });
  } catch (error) {
    console.error('Time entries fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

// Create time entry
router.post('/:firmCode/time-entries', async (req, res) => {
  try {
    const { date, duration, description, billableRate } = req.body;
    const user = req.user as any;
    const firmId = req.getTenantId!();

    if (!date || !duration || !description) {
      return res.status(400).json({ error: 'Date, duration, and description are required' });
    }

    // Create time entry (mock implementation)
    const timeEntry = {
      id: Date.now(),
      date,
      duration: parseFloat(duration),
      description,
      billableRate: billableRate || 300,
      total: parseFloat(duration) * (billableRate || 300),
      firmId,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log(`⏰ Time entry created for firm ${req.params.firmCode} by user ${user.id}`);

    res.json({
      success: true,
      timeEntry
    });
  } catch (error) {
    console.error('Time entry creation error:', error);
    res.status(500).json({ error: 'Failed to create time entry' });
  }
});

/**
 * AI REVIEW ENDPOINTS
 */

// AI document/profile review
router.post('/:firmCode/ai/review', async (req, res) => {
  try {
    const { profileData, documentText, documentType } = req.body;
    const firmId = req.getTenantId!();
    
    if (!documentText && !profileData) {
      return res.status(400).json({ error: 'Document text or profile data is required' });
    }

    // Mock AI review response based on input type
    let suggestions: any = {
      issues: [],
      improvements: [],
      confidence: 0.85,
      reviewType: documentText ? 'document' : 'profile',
      firmId
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
    
    console.log(`🤖 AI review performed for firm ${req.params.firmCode}`);
    
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

export default router;
