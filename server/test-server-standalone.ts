import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'tenant-test-standalone' });
});

// Mount simple tenant routes directly without external dependencies
const router = express.Router();

// Health check for tenant access
router.get('/:firmCode/health', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      message: 'Tenant portal health check successful',
      timestamp: new Date().toISOString(),
      server: 'tenant-portal-standalone',
      phase: 'Phase 3 - Standalone Testing'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Dashboard endpoint
router.get('/:firmCode/dashboard', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      dashboard: {
        activeClients: 5,
        activeCases: 12,
        upcomingEvents: 3,
        pendingTasks: 8
      },
      message: 'Dashboard data retrieved successfully',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Dashboard fetch failed' });
  }
});

// Mock data for testing
const mockClients = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678', status: 'active' }
];

const mockCases = [
  { id: 1, title: 'Contract Review', clientId: 1, status: 'active', description: 'Business contract review' },
  { id: 2, title: 'Employment Dispute', clientId: 2, status: 'active', description: 'Employment law case' }
];

const mockEvents = [
  { id: 1, title: 'Client Meeting', startTime: '2025-07-07T14:00:00Z', endTime: '2025-07-07T15:00:00Z', clientId: 1 },
  { id: 2, title: 'Court Hearing', startTime: '2025-07-08T10:00:00Z', endTime: '2025-07-08T12:00:00Z', caseId: 1 }
];

// CLIENTS CRUD ENDPOINTS
router.get('/:firmCode/clients', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      clients: mockClients,
      count: mockClients.length,
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
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const newClient = {
      id: mockClients.length + 1,
      name,
      email,
      phone: phone || null,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    mockClients.push(newClient);
    
    res.status(201).json({
      success: true,
      firmCode,
      client: newClient,
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
    const client = mockClients.find(c => c.id === parseInt(id));
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      firmCode,
      client,
      message: 'Client retrieved successfully'
    });
  } catch (error) {
    console.error('Client fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// CASES CRUD ENDPOINTS
router.get('/:firmCode/cases', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      cases: mockCases,
      count: mockCases.length,
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
    const { title, clientId, description } = req.body;
    
    if (!title || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'Title and clientId are required'
      });
    }
    
    const newCase = {
      id: mockCases.length + 1,
      title,
      clientId: parseInt(clientId),
      description: description || null,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    mockCases.push(newCase);
    
    res.status(201).json({
      success: true,
      firmCode,
      case: newCase,
      message: 'Case created successfully'
    });
  } catch (error) {
    console.error('Case creation error:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// CALENDAR CRUD ENDPOINTS
router.get('/:firmCode/calendar/events', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      events: mockEvents,
      count: mockEvents.length,
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
    const { title, startTime, endTime, clientId, caseId } = req.body;
    
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Title, start time, and end time are required'
      });
    }
    
    const newEvent = {
      id: mockEvents.length + 1,
      title,
      startTime,
      endTime,
      clientId: clientId ? parseInt(clientId) : null,
      caseId: caseId ? parseInt(caseId) : null,
      createdAt: new Date().toISOString()
    };
    
    mockEvents.push(newEvent);
    
    res.status(201).json({
      success: true,
      firmCode,
      event: newEvent,
      message: 'Calendar event created successfully'
    });
  } catch (error) {
    console.error('Calendar event creation error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// SETTINGS ENDPOINTS
router.get('/:firmCode/settings', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    res.json({
      success: true,
      firmCode,
      settings: {
        firmName: `Test Firm ${firmCode}`,
        subdomain: firmCode.toLowerCase(),
        practiceAreas: ['Corporate Law', 'Employment Law'],
        billingPlan: 'professional',
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
    const updates = req.body;
    
    res.json({
      success: true,
      firmCode,
      settings: {
        firmName: updates.firmName || `Test Firm ${firmCode}`,
        timezone: updates.timezone || 'UTC',
        dateFormat: updates.dateFormat || 'MM/dd/yyyy',
        ...updates
      },
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// TASKS ENDPOINTS
router.get('/:firmCode/tasks', async (req, res) => {
  try {
    const { firmCode } = req.params;
    
    const mockTasks = [
      { id: 1, title: 'Review contract', assignee: 'paralegal', dueDate: '2025-07-10', status: 'pending' },
      { id: 2, title: 'File motion', assignee: 'attorney', dueDate: '2025-07-08', status: 'in_progress' }
    ];
    
    res.json({
      success: true,
      firmCode,
      tasks: mockTasks,
      count: mockTasks.length,
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/:firmCode/tasks', async (req, res) => {
  try {
    const { firmCode } = req.params;
    const { title, assignee, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const newTask = {
      id: Date.now(),
      title,
      assignee: assignee || 'unassigned',
      dueDate: dueDate || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      firmCode,
      task: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.use('/api/tenant', router);

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Standalone test server running on port ${PORT}`);
  console.log(`📍 Tenant routes: http://localhost:${PORT}/api/tenant/:firmCode`);
  console.log(`✅ Phase 3 foundation endpoints ready for testing`);
});
