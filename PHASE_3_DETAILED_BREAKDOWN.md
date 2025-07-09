# 📋 PHASE 3: NEW ENDPOINT CREATION - DETAILED BREAKDOWN

## 🎯 Overview
Phase 3 transforms the current scattered API endpoints into a clean, tenant-scoped structure that matches the frontend tabs 1:1. Instead of implementing everything at once, we'll build incrementally, one tab at a time.

---

## 🚀 STEP 3.1: FOUNDATION SETUP (Day 1)

### **Goal:** Set up the core infrastructure for tenant routes

### **3.1.1 Create Base Route Structure**
**Priority:** CRITICAL
**Time:** 2 hours

**Create:** `server/routes/tenant/index.ts`
```typescript
import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireTenantAccess, addTenantScope } from '../../middleware/tenant-isolation.js';

const router = express.Router();

// Apply tenant middleware to all routes
router.use('/:firmCode/*', requireAuth, requireTenantAccess, addTenantScope);

// Health check for tenant access
router.get('/:firmCode/health', async (req, res) => {
  const { firm, firmId } = req.tenant!;
  res.json({ 
    status: 'ok', 
    firmCode: req.params.firmCode,
    firmId,
    firmName: firm.name
  });
});

export default router;
```

### **3.1.2 Register Tenant Routes**
**Priority:** CRITICAL
**Time:** 30 minutes

**Update:** `server/routes-hybrid.ts`
```typescript
// Add at top
import tenantRoutes from './routes/tenant/index.js';

// Add after existing routes
app.use('/api/tenant', tenantRoutes);
```

### **3.1.3 Test Foundation**
**Priority:** CRITICAL
**Time:** 30 minutes

**Create:** `scripts/test-tenant-foundation.sh`
```bash
#!/bin/bash
echo "🧪 Testing tenant route foundation..."

# Test valid access
curl -H "Authorization: Bearer $FIRM_TOKEN" \
     http://localhost:5001/api/tenant/demo-firm/health

# Expected: {"status":"ok","firmCode":"demo-firm",...}
```

**Acceptance Criteria:**
- ✅ Tenant health endpoint responds successfully
- ✅ Proper tenant context is available in req.tenant
- ✅ 403 returned for invalid firm access

---

## 🏢 STEP 3.2: DASHBOARD TAB (Day 1-2)

### **Goal:** Implement the dashboard endpoint that already exists but make it tenant-scoped

### **3.2.1 Create Dashboard Route**
**Priority:** HIGH
**Time:** 3 hours

**Create:** `server/routes/tenant/dashboard.ts`
```typescript
import express from 'express';
import { storage } from '../../storage.js';

const router = express.Router();

// GET /api/tenant/:firmCode/dashboard
router.get('/', async (req, res) => {
  try {
    const { firmId, firm } = req.tenant!;
    
    // Get existing dashboard data but scope to firm
    const [cases, clients, recentActivity] = await Promise.all([
      storage.getCasesByFirm(firmId),
      storage.getClientsByFirm(firmId), 
      storage.getRecentActivityByFirm(firmId)
    ]);

    const stats = {
      totalCases: cases.length,
      activeCases: cases.filter(c => c.status === 'active').length,
      totalClients: clients.length,
      recentActivity: recentActivity.slice(0, 10)
    };

    res.json({ 
      stats, 
      firm: { id: firmId, name: firm.name, code: req.params.firmCode }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
```

### **3.2.2 Register Dashboard Route**
**Priority:** HIGH  
**Time:** 15 minutes

**Update:** `server/routes/tenant/index.ts`
```typescript
import dashboardRoutes from './dashboard.js';

// Add route
router.use('/:firmCode/dashboard', dashboardRoutes);
```

### **3.2.3 Test Dashboard**
**Priority:** HIGH
**Time:** 30 minutes

```bash
# Test dashboard endpoint
curl -H "Authorization: Bearer $FIRM_TOKEN" \
     http://localhost:5001/api/tenant/demo-firm/dashboard
```

**Acceptance Criteria:**
- ✅ Dashboard returns firm-scoped statistics
- ✅ No data leakage from other firms
- ✅ Proper error handling

---

## 👥 STEP 3.3: CLIENTS TAB (Day 2)

### **Goal:** Build complete CRUD operations for clients

### **3.3.1 Verify Clients Schema**
**Priority:** CRITICAL
**Time:** 1 hour

**Check:** `shared/schema.ts` for clients table
```typescript
// Verify this exists:
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
```

**If missing, create migration:**
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER REFERENCES firms(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX clients_firm_id_idx ON clients(firm_id);
```

### **3.3.2 Create Clients Route**
**Priority:** HIGH
**Time:** 4 hours

**Create:** `server/routes/tenant/clients.ts`
```typescript
import express from 'express';
import { storage } from '../../storage.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

// GET /api/tenant/:firmCode/clients
router.get('/', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const { page = 1, limit = 50, search } = req.query;
    
    const clients = await storage.getClientsByFirm(firmId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string
    });
    
    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/tenant/:firmCode/clients
router.post('/', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const validatedData = clientSchema.parse(req.body);
    
    const client = await storage.createClient(firmId, validatedData);
    res.status(201).json({ client });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// GET /api/tenant/:firmCode/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientId = parseInt(req.params.id);
    
    const client = await storage.getClientByIdAndFirm(clientId, firmId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// PUT /api/tenant/:firmCode/clients/:id
router.put('/:id', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientId = parseInt(req.params.id);
    const validatedData = clientSchema.parse(req.body);
    
    const client = await storage.updateClientByIdAndFirm(clientId, firmId, validatedData);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ client });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/tenant/:firmCode/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientId = parseInt(req.params.id);
    
    const success = await storage.deleteClientByIdAndFirm(clientId, firmId);
    if (!success) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
```

### **3.3.3 Add Storage Methods**
**Priority:** HIGH
**Time:** 2 hours

**Update:** `server/storage.ts` (add these methods)
```typescript
// Add to storage class
async getClientsByFirm(firmId: number, options: { page?: number, limit?: number, search?: string } = {}) {
  // Implementation for getting clients by firm
}

async createClient(firmId: number, data: any) {
  // Implementation for creating client
}

async getClientByIdAndFirm(clientId: number, firmId: number) {
  // Implementation for getting specific client
}

async updateClientByIdAndFirm(clientId: number, firmId: number, data: any) {
  // Implementation for updating client
}

async deleteClientByIdAndFirm(clientId: number, firmId: number) {
  // Implementation for deleting client
}
```

### **3.3.4 Register & Test Clients**
**Priority:** HIGH
**Time:** 1 hour

**Update:** `server/routes/tenant/index.ts`
```typescript
import clientRoutes from './clients.js';
router.use('/:firmCode/clients', clientRoutes);
```

**Test:**
```bash
# Test CRUD operations
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com"}' \
     http://localhost:5001/api/tenant/demo-firm/clients
```

**Acceptance Criteria:**
- ✅ Can create, read, update, delete clients
- ✅ All operations are firm-scoped
- ✅ Proper validation and error handling
- ✅ Pagination works for client listing

---

## ⚖️ STEP 3.4: CASES TAB (Day 3)

### **Goal:** Build complete CRUD operations for cases

### **3.4.1 Verify Cases Schema & Add Missing Fields**
**Priority:** CRITICAL
**Time:** 1 hour

**Check/Update:** `shared/schema.ts`
```typescript
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  clientId: integer("client_id").references(() => clients.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("open"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
```

### **3.4.2 Create Cases Route**
**Priority:** HIGH
**Time:** 4 hours

**Create:** `server/routes/tenant/cases.ts`
```typescript
import express from 'express';
import { storage } from '../../storage.js';
import { z } from 'zod';

const router = express.Router();

const caseSchema = z.object({
  clientId: z.number().int().positive(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignedTo: z.number().int().positive().optional(),
  dueDate: z.string().optional()
});

// GET /api/tenant/:firmCode/cases
router.get('/', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const { page = 1, limit = 50, status, priority, assignedTo } = req.query;
    
    const cases = await storage.getCasesByFirm(firmId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
      priority: priority as string,
      assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined
    });
    
    res.json({ cases });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// POST /api/tenant/:firmCode/cases
router.post('/', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const validatedData = caseSchema.parse(req.body);
    
    // Verify client belongs to this firm
    const client = await storage.getClientByIdAndFirm(validatedData.clientId, firmId);
    if (!client) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    const case_ = await storage.createCase(firmId, validatedData);
    res.status(201).json({ case: case_ });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create case error:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// Continue with GET/:id, PUT/:id, DELETE/:id similar to clients...

export default router;
```

### **3.4.3 Add Cases Storage Methods**
**Priority:** HIGH
**Time:** 2 hours

**Acceptance Criteria:**
- ✅ Cases CRUD operations work
- ✅ Cases are linked to clients within same firm
- ✅ Status and priority filtering works
- ✅ Assignment to firm users works

---

## 📅 STEP 3.5: CALENDAR TAB (Day 4)

### **Goal:** Create calendar events system

### **3.5.1 Create Calendar Schema**
**Priority:** CRITICAL
**Time:** 1 hour

**Add to:** `shared/schema.ts`
```typescript
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: varchar("type", { length: 50 }).default("meeting"),
  attendees: json("attendees").$type<number[]>(), // User IDs
  caseId: integer("case_id").references(() => cases.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
```

### **3.5.2 Create Calendar Routes**
**Priority:** HIGH
**Time:** 4 hours

**Create:** `server/routes/tenant/calendar.ts`
- GET calendar overview
- GET/POST/PUT/DELETE events
- Filter by date range, type, attendees

**Acceptance Criteria:**
- ✅ Calendar events CRUD works
- ✅ Events can be linked to cases
- ✅ Multi-user attendance supported
- ✅ Date range filtering works

---

## 🔧 STEP 3.6: PARALEGAL TAB (Day 5)

### **Goal:** Create task management for paralegals

### **3.6.1 Create Paralegal Tasks Schema**
**Priority:** CRITICAL
**Time:** 1 hour

**Add to:** `shared/schema.ts`
```typescript
export const paralegalTasks = pgTable("paralegal_tasks", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id),
  caseId: integer("case_id").references(() => cases.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
```

### **3.6.2 Create Paralegal Routes**
**Priority:** HIGH
**Time:** 4 hours

**Create:** `server/routes/tenant/paralegal.ts`
- Task management CRUD
- Task assignment and completion
- Progress tracking

**Acceptance Criteria:**
- ✅ Tasks can be created and assigned
- ✅ Tasks linked to specific cases
- ✅ Status tracking and completion
- ✅ Due date management

---

## ⚙️ STEP 3.7: SETTINGS TAB (Day 6)

### **Goal:** Firm settings and user management

### **3.7.1 Create Settings Routes**
**Priority:** HIGH
**Time:** 4 hours

**Create:** `server/routes/tenant/settings.ts`
- Firm settings management
- User management within firm
- Permissions and roles

### **3.7.2 Update Firm Settings Schema**
**Priority:** MEDIUM
**Time:** 1 hour

**Check/Add:** Firm settings table if needed

**Acceptance Criteria:**
- ✅ Firm settings can be updated
- ✅ Users can be managed within firm
- ✅ Role-based permissions work

---

## 💰 STEP 3.8: BILLING TAB (Day 7)

### **Goal:** Integrate existing billing with tenant structure

### **3.8.1 Create Billing Routes**
**Priority:** HIGH
**Time:** 4 hours

**Create:** `server/routes/tenant/billing.ts`
- Move existing billing logic to tenant-scoped routes
- Invoice management
- Payment processing

**Acceptance Criteria:**
- ✅ Billing data is firm-scoped
- ✅ Invoice generation works
- ✅ Payment processing integrated

---

## 🧪 STEP 3.9: COMPREHENSIVE TESTING (Day 8)

### **Goal:** Test all new endpoints together

### **3.9.1 Create Test Suite**
**Priority:** CRITICAL
**Time:** 4 hours

**Create:** `scripts/test-all-tenant-endpoints.sh`
```bash
#!/bin/bash
echo "🧪 Testing all tenant endpoints..."

FIRM_CODE="demo-firm"
BASE_URL="http://localhost:5001/api/tenant/$FIRM_CODE"

# Test each tab
endpoints=(
  "dashboard"
  "clients" 
  "cases"
  "calendar"
  "paralegal"
  "billing"
  "settings"
)

for endpoint in "${endpoints[@]}"; do
  echo "Testing $endpoint..."
  curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/$endpoint"
done
```

### **3.9.2 Integration Testing**
**Priority:** HIGH
**Time:** 3 hours

- Test data relationships (clients → cases → tasks)
- Test cross-tenant isolation
- Test frontend integration
- Performance testing

**Acceptance Criteria:**
- ✅ All 7 tabs have working APIs
- ✅ No cross-tenant data leakage
- ✅ Proper error handling throughout
- ✅ Frontend can consume all endpoints

---

## 🎯 SUCCESS METRICS

After completing Phase 3, you should have:

1. **Complete API Coverage:** All 7 frontend tabs have corresponding backend endpoints
2. **Tenant Isolation:** All endpoints properly scope data by firmId
3. **CRUD Operations:** Full create, read, update, delete for all entities
4. **Data Relationships:** Proper linking between clients, cases, tasks, etc.
5. **Error Handling:** Consistent error responses and validation
6. **Testing:** Comprehensive test coverage for all endpoints

**Final Test:** 
```bash
# Should work without errors
curl http://localhost:5001/api/tenant/demo-firm/dashboard
curl http://localhost:5001/api/tenant/demo-firm/clients  
curl http://localhost:5001/api/tenant/demo-firm/cases
curl http://localhost:5001/api/tenant/demo-firm/calendar
curl http://localhost:5001/api/tenant/demo-firm/paralegal
curl http://localhost:5001/api/tenant/demo-firm/billing
curl http://localhost:5001/api/tenant/demo-firm/settings
```

This breakdown allows you to implement Phase 3 incrementally, testing each piece as you go, rather than trying to build everything at once.
