import { Router } from 'express';
import { storage } from '../storage.js';
import type { InsertClient, InsertCase, InsertCalendarEvent } from '../../shared/schema.js';

const router = Router();

/**
 * PHASE 3 TENANT ROUTES WITH DATABASE INTEGRATION
 * These routes implement the full CRUD operations for each FirmSync tab
 * Uses the actual storage layer and database schema
 */

// Health check for tenant access
router.get('/:firmCode/health', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    // In a real implementation, we would validate the firmCode exists
    // For now, we'll just return success for any valid format
    if (!firmCode || firmCode.length < 3) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid firm code' 
      });
    }
    
    res.json({
      success: true,
      firmCode,
      message: 'Tenant portal health check successful',
      timestamp: new Date().toISOString(),
      server: 'tenant-portal-enhanced-v2',
      phase: 'Phase 3 - Database Integrated'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Dashboard endpoint with real firm data
router.get('/:firmCode/dashboard', async (req, res) => {
  try {
    const { firmCode } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1; // In real implementation, get from firmCode lookup
    
    // Get real counts from database
    const [clients, cases, events] = await Promise.all([
      storage.getFirmClients(firmId),
      storage.getFirmCases(firmId),
      storage.getFirmCalendarEvents(firmId)
    ]);
    
    res.json({
      success: true,
      firmCode,
      dashboard: {
        activeClients: clients.length,
        activeCases: cases.filter(c => c.status === 'active').length,
        upcomingEvents: events.filter(e => new Date(e.startTime) > new Date()).length,
        pendingTasks: 0 // TODO: Add tasks table
      },
      message: 'Dashboard data retrieved successfully',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Dashboard fetch failed' });
  }
});

// CLIENTS CRUD ENDPOINTS
router.get('/:firmCode/clients', async (req, res) => {
  try {
    const { firmCode } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const clients = await storage.getFirmClients(firmId);
    
    res.json({
      success: true,
      firmCode,
      clients: clients.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      })),
      count: clients.length,
      message: 'Clients retrieved successfully'
    });
  } catch (error) {
    console.error('Clients fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/:firmCode/clients', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const { name, email, phone, address } = req.body;
    
    // @ts-ignore - For demo, we'll use firmId = 1 and createdBy = 1
    const firmId = 1;
    const createdBy = 1;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const clientData: InsertClient = {
      firmId,
      name,
      email,
      phone: phone || null,
      address: address || null,
      status: 'active',
      createdBy
    };
    
    const client = await storage.createClient(clientData);
    
    res.status(201).json({
      success: true,
      firmCode,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status,
        createdAt: client.createdAt
      },
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Client creation error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.get('/:firmCode/clients/:id', async (req, res) => {
  try {
    const { firmCode, id } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const client = await storage.getClient(parseInt(id), firmId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      },
      message: 'Client retrieved successfully'
    });
  } catch (error) {
    console.error('Client fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.patch('/:firmCode/clients/:id', async (req, res) => {
  try {
    const { firmCode, id } = req.params;
    const updates = req.body;
    
    const client = await storage.updateClient(parseInt(id), updates);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status,
        updatedAt: client.updatedAt
      },
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Client update error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:firmCode/clients/:id', async (req, res) => {
  try {
    const { firmCode, id } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const deleted = await storage.deleteClient(parseInt(id), firmId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Client deletion error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// CASES CRUD ENDPOINTS
router.get('/:firmCode/cases', async (req, res) => {
  try {
    const { firmCode } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const cases = await storage.getFirmCases(firmId);
    
    res.json({
      success: true,
      firmCode,
      cases: cases.map(caseRecord => ({
        id: caseRecord.id,
        title: caseRecord.title,
        name: caseRecord.name,
        description: caseRecord.description,
        status: caseRecord.status,
        clientId: caseRecord.clientId,
        createdAt: caseRecord.createdAt,
        updatedAt: caseRecord.updatedAt
      })),
      count: cases.length,
      message: 'Cases retrieved successfully'
    });
  } catch (error) {
    console.error('Cases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

router.post('/:firmCode/cases', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const { title, name, description, clientId } = req.body;
    
    // @ts-ignore - For demo, we'll use firmId = 1 and createdBy = 1
    const firmId = 1;
    const createdBy = 1;
    
    // Validate required fields
    if (!title || !name || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'Title, name, and clientId are required'
      });
    }
    
    const caseData: InsertCase = {
      firmId,
      clientId: parseInt(clientId),
      title,
      name,
      description: description || null,
      status: 'active',
      createdBy
    };
    
    const caseRecord = await storage.createCase(caseData);
    
    res.status(201).json({
      success: true,
      firmCode,
      case: {
        id: caseRecord.id,
        title: caseRecord.title,
        name: caseRecord.name,
        description: caseRecord.description,
        status: caseRecord.status,
        clientId: caseRecord.clientId,
        createdAt: caseRecord.createdAt
      },
      message: 'Case created successfully'
    });
  } catch (error) {
    console.error('Case creation error:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

router.get('/:firmCode/cases/:id', async (req, res) => {
  try {
    const { firmCode, id } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const caseRecord = await storage.getCase(parseInt(id), firmId);
    
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      case: {
        id: caseRecord.id,
        title: caseRecord.title,
        name: caseRecord.name,
        description: caseRecord.description,
        status: caseRecord.status,
        clientId: caseRecord.clientId,
        createdAt: caseRecord.createdAt,
        updatedAt: caseRecord.updatedAt
      },
      message: 'Case retrieved successfully'
    });
  } catch (error) {
    console.error('Case fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// CALENDAR CRUD ENDPOINTS
router.get('/:firmCode/calendar/events', async (req, res) => {
  try {
    const { firmCode } = req.params;
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const events = await storage.getFirmCalendarEvents(firmId);
    
    res.json({
      success: true,
      firmCode,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        eventType: event.eventType,
        status: event.status,
        clientId: event.clientId,
        caseId: event.caseId,
        createdAt: event.createdAt
      })),
      count: events.length,
      message: 'Calendar events retrieved successfully'
    });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

router.post('/:firmCode/calendar/events', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const { title, description, startTime, endTime, location, eventType, clientId, caseId } = req.body;
    
    // @ts-ignore - For demo, we'll use firmId = 1 and userId = 1
    const firmId = 1;
    const userId = 1;
    
    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Title, start time, and end time are required'
      });
    }
    
    const eventData: InsertCalendarEvent = {
      firmId,
      userId,
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || null,
      eventType: eventType || 'meeting',
      status: 'scheduled',
      clientId: clientId ? parseInt(clientId) : null,
      caseId: caseId ? parseInt(caseId) : null
    };
    
    const event = await storage.createCalendarEvent(eventData);
    
    res.status(201).json({
      success: true,
      firmCode,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        eventType: event.eventType,
        status: event.status,
        clientId: event.clientId,
        caseId: event.caseId,
        createdAt: event.createdAt
      },
      message: 'Calendar event created successfully'
    });
  } catch (error) {
    console.error('Calendar event creation error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// SETTINGS ENDPOINTS (using firm data)
router.get('/:firmCode/settings', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    const firm = await storage.getFirm(firmId);
    
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: 'Firm not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      settings: {
        firmId: firm.id,
        firmName: firm.name,
        subdomain: firm.subdomain,
        practiceAreas: firm.practiceAreas || [],
        billingPlan: firm.billingPlan,
        // Default settings
        timezone: 'UTC',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h'
      },
      message: 'Settings retrieved successfully'
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.patch('/:firmCode/settings', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const { firmName, practiceAreas, billingPlan } = req.body;
    
    // @ts-ignore - For demo, we'll use firmId = 1
    const firmId = 1;
    
    const updates: any = {};
    if (firmName) updates.name = firmName;
    if (practiceAreas) updates.practiceAreas = practiceAreas;
    if (billingPlan) updates.billingPlan = billingPlan;
    
    const firm = await storage.updateFirm(firmId, updates);
    
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: 'Firm not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      settings: {
        firmId: firm.id,
        firmName: firm.name,
        subdomain: firm.subdomain,
        practiceAreas: firm.practiceAreas || [],
        billingPlan: firm.billingPlan
      },
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// TASKS ENDPOINTS (placeholder - no tasks table yet)
router.get('/:firmCode/tasks', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      tasks: [],
      count: 0,
      message: 'Tasks retrieved successfully (placeholder - tasks table not implemented yet)'
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/:firmCode/tasks', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const taskData = req.body;
    
    res.status(201).json({
      success: true,
      firmCode,
      task: { 
        id: 'placeholder-task-' + Date.now(), 
        ...taskData,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      message: 'Task created successfully (placeholder - tasks table not implemented yet)'
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

export default router;
