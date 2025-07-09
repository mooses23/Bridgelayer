import { Router } from 'express';
import { db } from '../db';
import { clients, cases, documents, invoices, calendarEvents } from '../../shared/schema-refactored';
import { eq } from 'drizzle-orm';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication middleware
router.use(authenticateJWT);

// Get tenant firm by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!result) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching firm by slug:', error);
    res.status(500).json({ message: 'Failed to fetch firm data' });
  }
});

// Dashboard APIs
router.get('/:slug/dashboard/summary', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    // Count clients, cases, documents, and invoices
    const clientCount = await db.select({ count: db.fn.count() })
      .from(clients)
      .where(eq(clients.firmId, firm.id));
      
    const caseCount = await db.select({ count: db.fn.count() })
      .from(cases)
      .where(eq(cases.firmId, firm.id));
      
    const documentCount = await db.select({ count: db.fn.count() })
      .from(documents)
      .where(eq(documents.firmId, firm.id));
      
    const invoiceCount = await db.select({ count: db.fn.count() })
      .from(invoices)
      .where(eq(invoices.firmId, firm.id));
      
    // Get recent items
    const recentCases = await db.select()
      .from(cases)
      .where(eq(cases.firmId, firm.id))
      .orderBy(db.desc(cases.createdAt))
      .limit(5);
      
    const recentClients = await db.select()
      .from(clients)
      .where(eq(clients.firmId, firm.id))
      .orderBy(db.desc(clients.createdAt))
      .limit(5);
      
    // Get upcoming events
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingEvents = await db.select()
      .from(calendarEvents)
      .where(eq(calendarEvents.firmId, firm.id))
      .where(db.sql`${calendarEvents.startTime} >= ${now.toISOString()}`)
      .where(db.sql`${calendarEvents.startTime} <= ${nextWeek.toISOString()}`)
      .orderBy(calendarEvents.startTime)
      .limit(5);
    
    res.json({
      stats: {
        clientCount: clientCount[0]?.count || 0,
        caseCount: caseCount[0]?.count || 0,
        documentCount: documentCount[0]?.count || 0,
        invoiceCount: invoiceCount[0]?.count || 0
      },
      recentCases,
      recentClients,
      upcomingEvents
    });
  } catch (error) {
    logger.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Client APIs
router.get('/:slug/clients', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.select()
      .from(clients)
      .where(eq(clients.firmId, firm.id));
    
    // Enhance client data with additional info
    const enhancedClients = await Promise.all(result.map(async (client) => {
      // Count active cases for each client
      const activeCases = await db.select({ count: db.fn.count() })
        .from(cases)
        .where(eq(cases.clientId, client.id))
        .where(eq(cases.status, 'Active'));
      
      return {
        ...client,
        activeCases: activeCases[0]?.count || 0
      };
    }));
    
    res.json(enhancedClients);
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Failed to fetch client data' });
  }
});

router.post('/:slug/clients', async (req, res) => {
  try {
    const { slug } = req.params;
    const clientData = req.body;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.insert(clients).values({
      ...clientData,
      firmId: firm.id,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ message: 'Failed to create client' });
  }
});

// Cases APIs
router.get('/:slug/cases', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.select({
      id: cases.id,
      firmId: cases.firmId,
      clientId: cases.clientId,
      title: cases.title,
      description: cases.description,
      status: cases.status,
      createdBy: cases.createdBy,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
      clientName: clients.name
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(eq(cases.firmId, firm.id));
    
    // Enhance case data with document counts
    const enhancedCases = await Promise.all(result.map(async (caseItem) => {
      const documentCount = await db.select({ count: db.fn.count() })
        .from(documents)
        .where(db.sql`document_type = 'case' AND metadata->>'caseId' = ${caseItem.id.toString()}`);
      
      return {
        ...caseItem,
        client: caseItem.clientName,
        documentsCount: documentCount[0]?.count || 0
      };
    }));
    
    res.json(enhancedCases);
  } catch (error) {
    logger.error('Error fetching cases:', error);
    res.status(500).json({ message: 'Failed to fetch case data' });
  }
});

router.post('/:slug/cases', async (req, res) => {
  try {
    const { slug } = req.params;
    const caseData = req.body;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.insert(cases).values({
      ...caseData,
      firmId: firm.id,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error creating case:', error);
    res.status(500).json({ message: 'Failed to create case' });
  }
});

// Calendar APIs
router.get('/:slug/calendar', async (req, res) => {
  try {
    const { slug } = req.params;
    const { start, end } = req.query;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    let query = db.select()
      .from(calendarEvents)
      .where(eq(calendarEvents.firmId, firm.id));
    
    // Add date range filtering if provided
    if (start) {
      query = query.where(db.sql`${calendarEvents.startTime} >= ${start}`);
    }
    
    if (end) {
      query = query.where(db.sql`${calendarEvents.endTime} <= ${end}`);
    }
    
    const result = await query.orderBy(calendarEvents.startTime);
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar data' });
  }
});

router.post('/:slug/calendar', async (req, res) => {
  try {
    const { slug } = req.params;
    const eventData = req.body;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.insert(calendarEvents).values({
      ...eventData,
      firmId: firm.id,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error creating calendar event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Document APIs
router.get('/:slug/documents', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.select()
      .from(documents)
      .where(eq(documents.firmId, firm.id))
      .orderBy(db.desc(documents.uploadedAt));
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

router.post('/:slug/documents', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Handle file upload with multer middleware
    // This is a simplified version, you would need to add multer middleware
    // and handle the file upload properly in a real implementation
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    // Mock implementation - in a real app you would process the uploaded file
    const fileData = {
      fileName: req.body.fileName || 'document.pdf',
      originalName: req.body.originalName || 'document.pdf',
      fileSize: req.body.fileSize || 1024,
      mimeType: req.body.mimeType || 'application/pdf',
      documentType: req.body.documentType,
      metadata: req.body.metadata || {}
    };
    
    const result = await db.insert(documents).values({
      ...fileData,
      firmId: firm.id,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Invoice APIs
router.get('/:slug/invoices', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.select()
      .from(invoices)
      .where(eq(invoices.firmId, firm.id))
      .orderBy(db.desc(invoices.createdAt));
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

router.post('/:slug/invoices', async (req, res) => {
  try {
    const { slug } = req.params;
    const invoiceData = req.body;
    
    const firm = await db.query.firms.findFirst({
      where: eq(db.schema.firms.slug, slug)
    });
    
    if (!firm) {
      return res.status(404).json({ message: 'Firm not found' });
    }
    
    const result = await db.insert(invoices).values({
      ...invoiceData,
      firmId: firm.id,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
});

export default router;
