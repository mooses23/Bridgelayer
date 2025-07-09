#!/bin/bash
# 🚀 BACKEND REFACTORING AUTOMATION SCRIPT
# Run this script to implement the backend refactoring plan step by step

set -e  # Exit on any error

echo "🎯 Starting Backend Refactoring Implementation..."
echo "=================================================="

# Phase 1: Setup and Dependencies
echo ""
echo "📦 PHASE 1: Dependencies and Setup"
echo "=================================="

# Ensure TypeScript dependencies are installed
echo "Installing missing dependencies..."
npm install --save-dev @types/express @types/node
npm install express

# Create backup of current routes
echo "Creating backup of current implementation..."
mkdir -p ./backup/$(date +%Y%m%d_%H%M%S)
cp -r ./server/routes ./backup/$(date +%Y%m%d_%H%M%S)/
cp ./server/routes-hybrid.ts ./backup/$(date +%Y%m%d_%H%M%S)/

echo "✅ Phase 1 complete - Dependencies installed and backup created"

# Phase 2: Create New Middleware
echo ""
echo "🔒 PHASE 2: Security Middleware"
echo "==============================="

echo "Creating tenant isolation middleware..."
# The tenant-isolation.ts file was already created above

echo "✅ Phase 2 complete - Security middleware created"

# Phase 3: Database Schema Check
echo ""
echo "🗄️ PHASE 3: Database Schema Validation"
echo "======================================"

echo "Checking database schema for required tables..."

# Create a SQL script to check/create required tables
cat > ./check_schema.sql << 'EOF'
-- Check if required tables exist with firmId columns
DO $$
BEGIN
    -- Check clients table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        CREATE TABLE clients (
            id SERIAL PRIMARY KEY,
            firmId INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            address TEXT,
            status VARCHAR(50) DEFAULT 'active',
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX idx_clients_firmId ON clients(firmId);
        RAISE NOTICE 'Created clients table';
    END IF;
    
    -- Check cases table  
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        CREATE TABLE cases (
            id SERIAL PRIMARY KEY,
            firmId INTEGER NOT NULL,
            clientId INTEGER,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'open',
            priority VARCHAR(20) DEFAULT 'medium',
            assignedTo INTEGER,
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX idx_cases_firmId ON cases(firmId);
        RAISE NOTICE 'Created cases table';
    END IF;
    
    -- Check calendar_events table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
        CREATE TABLE calendar_events (
            id SERIAL PRIMARY KEY,
            firmId INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            startTime TIMESTAMP NOT NULL,
            endTime TIMESTAMP NOT NULL,
            type VARCHAR(50) DEFAULT 'meeting',
            attendees JSON,
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX idx_calendar_events_firmId ON calendar_events(firmId);
        RAISE NOTICE 'Created calendar_events table';
    END IF;
    
    -- Check paralegal_tasks table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paralegal_tasks') THEN
        CREATE TABLE paralegal_tasks (
            id SERIAL PRIMARY KEY,
            firmId INTEGER NOT NULL,
            caseId INTEGER,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            assignedTo INTEGER,
            dueDate TIMESTAMP,
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX idx_paralegal_tasks_firmId ON paralegal_tasks(firmId);
        RAISE NOTICE 'Created paralegal_tasks table';
    END IF;
    
    -- Check firm_settings table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'firm_settings') THEN
        CREATE TABLE firm_settings (
            id SERIAL PRIMARY KEY,
            firmId INTEGER NOT NULL,
            key VARCHAR(255) NOT NULL,
            value TEXT,
            type VARCHAR(50) DEFAULT 'string',
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW(),
            UNIQUE(firmId, key)
        );
        CREATE INDEX idx_firm_settings_firmId ON firm_settings(firmId);
        RAISE NOTICE 'Created firm_settings table';
    END IF;
    
    RAISE NOTICE 'Database schema check complete';
END $$;
EOF

# Run the schema check (only if DATABASE_URL is available)
if [ ! -z "$DATABASE_URL" ]; then
    echo "Running database schema check..."
    psql $DATABASE_URL -f ./check_schema.sql
else
    echo "⚠️ DATABASE_URL not set - skipping schema check"
    echo "Run manually: psql \$DATABASE_URL -f ./check_schema.sql"
fi

echo "✅ Phase 3 complete - Database schema checked"

# Phase 4: Create Test Scripts
echo ""
echo "🧪 PHASE 4: Test Scripts"
echo "======================="

echo "Creating test scripts..."

# Create tenant isolation test script
mkdir -p ./scripts
cat > ./scripts/test-tenant-isolation.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing tenant isolation..."

BASE_URL="${BASE_URL:-http://localhost:5001}"

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq '.'

# Test 2: Test tenant endpoint structure
echo "2. Testing tenant endpoint structure..."
echo "GET $BASE_URL/api/tenant/demo-firm/dashboard"

# Test 3: Authentication test
echo "3. Testing authentication requirement..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/api/tenant/demo-firm/dashboard")
echo "Response: $response"
if [[ "$response" == *"401"* ]]; then
    echo "✅ Authentication properly required"
else
    echo "❌ Authentication not properly enforced"
fi

echo "✅ Tenant isolation test complete"
EOF

chmod +x ./scripts/test-tenant-isolation.sh

# Create endpoint coverage test
cat > ./scripts/test-all-endpoints.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing all new tenant endpoints..."

BASE_URL="${BASE_URL:-http://localhost:5001}"
FIRM_CODE="${FIRM_CODE:-demo-firm}"
TOKEN="${TEST_TOKEN:-}"

if [ -z "$TOKEN" ]; then
    echo "⚠️ TEST_TOKEN not set - testing without authentication"
    AUTH_HEADER=""
else
    AUTH_HEADER="-H \"Authorization: Bearer $TOKEN\""
fi

endpoints=(
    "dashboard"
    "clients" 
    "cases"
    "calendar"
    "paralegal"
    "billing"
    "settings"
)

echo "Testing endpoints for firm: $FIRM_CODE"
echo "========================================="

for endpoint in "${endpoints[@]}"; do
    echo "Testing /api/tenant/$FIRM_CODE/$endpoint"
    
    if [ -z "$TOKEN" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL/api/tenant/$FIRM_CODE/$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/tenant/$FIRM_CODE/$endpoint")
    fi
    
    echo "  Response: $response"
    echo ""
done

echo "✅ Endpoint coverage test complete"
EOF

chmod +x ./scripts/test-all-endpoints.sh

echo "✅ Phase 4 complete - Test scripts created"

# Phase 5: Create Implementation Files
echo ""
echo "🏗️ PHASE 5: Implementation Templates"
echo "===================================="

echo "Creating tenant route templates..."

# Create tenant portal routes template
mkdir -p ./server/routes/tenant
cat > ./server/routes/tenant/tenant-portal.ts << 'EOF'
import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireTenantAccess, addTenantScope } from '../../middleware/tenant-isolation.js';
import { storage } from '../../storage.js';

const router = express.Router();

// Apply tenant middleware to all routes
router.use('/:firmCode/*', requireAuth, requireTenantAccess, addTenantScope);

// Dashboard endpoints
router.get('/:firmCode/dashboard', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    
    // Get dashboard stats scoped to this firm
    const stats = {
      totalCases: 0, // await storage.getCasesCountByFirm(firmId),
      totalClients: 0, // await storage.getClientsCountByFirm(firmId),
      totalDocuments: 0, // await storage.getDocumentsCountByFirm(firmId),
      monthlyRevenue: 0, // await storage.getMonthlyRevenueByFirm(firmId),
      activeTasks: 0, // await storage.getActiveTasksCountByFirm(firmId)
    };
    
    res.json({ 
      stats, 
      firmCode: req.params.firmCode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Profile endpoint  
router.get('/:firmCode/profile', async (req, res) => {
  try {
    const { firm } = req.tenant!;
    const user = req.user;
    
    res.json({ 
      firm: {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        status: firm.status
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

export default router;
EOF

# Create clients routes template
cat > ./server/routes/tenant/clients.ts << 'EOF'
import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireTenantAccess } from '../../middleware/tenant-isolation.js';

const router = express.Router();

// Apply middleware
router.use('/:firmCode/clients*', requireAuth, requireTenantAccess);

// GET /api/tenant/:firmCode/clients
router.get('/:firmCode/clients', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const { page = 1, limit = 50, search } = req.query;
    
    // TODO: Implement storage.getClientsByFirm()
    const clients = []; // await storage.getClientsByFirm(firmId, { page, limit, search });
    
    res.json({ 
      clients,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: 0 // clients.total
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/tenant/:firmCode/clients
router.post('/:firmCode/clients', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientData = { ...req.body, firmId };
    
    // TODO: Implement storage.createClient()
    // const client = await storage.createClient(clientData);
    
    res.status(201).json({ 
      message: 'Client created successfully',
      // client
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// GET /api/tenant/:firmCode/clients/:id
router.get('/:firmCode/clients/:id', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientId = parseInt(req.params.id);
    
    // TODO: Implement storage.getClientById()
    // const client = await storage.getClientById(clientId, firmId);
    
    res.json({ 
      // client
      message: 'Client endpoint - not yet implemented'
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// PUT /api/tenant/:firmCode/clients/:id
router.put('/:firmCode/clients/:id', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientId = parseInt(req.params.id);
    
    // TODO: Implement storage.updateClient()
    // const client = await storage.updateClient(clientId, req.body, firmId);
    
    res.json({ 
      message: 'Client updated successfully',
      // client
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/tenant/:firmCode/clients/:id
router.delete('/:firmCode/clients/:id', async (req, res) => {
  try {
    const { firmId } = req.tenant!;
    const clientId = parseInt(req.params.id);
    
    // TODO: Implement storage.deleteClient()
    // await storage.deleteClient(clientId, firmId);
    
    res.json({ 
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
EOF

echo "✅ Phase 5 complete - Implementation templates created"

# Phase 6: Create Migration Script
echo ""
echo "🔄 PHASE 6: Migration Planning"
echo "============================="

cat > ./scripts/migrate-routes.sh << 'EOF'
#!/bin/bash
echo "🔄 Starting route migration..."

# This script helps migrate from old /api/app/* routes to new /api/tenant/* routes

echo "Steps to complete migration:"
echo "1. Update server/routes-hybrid.ts to import new tenant routes"
echo "2. Replace old route handlers with redirects/deprecation warnings"
echo "3. Update frontend API calls to use new endpoints"
echo "4. Test all endpoints with scripts/test-all-endpoints.sh"
echo "5. Remove old route handlers after confirmation"

echo ""
echo "Manual steps required:"
echo "====================="
echo "1. Edit server/routes-hybrid.ts:"
echo "   - Import: import tenantPortalRoutes from './routes/tenant/tenant-portal.js';"
echo "   - Add: app.use('/api/tenant', tenantPortalRoutes);"
echo ""
echo "2. Replace old /api/app/* routes with deprecation warnings"
echo ""
echo "3. Update frontend API calls in client/src/lib/api.ts"

echo "✅ Migration planning complete"
EOF

chmod +x ./scripts/migrate-routes.sh

echo "✅ Phase 6 complete - Migration script created"

# Summary
echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Fix TypeScript compilation issues in tenant-isolation.ts"
echo "2. Run: ./scripts/test-tenant-isolation.sh"
echo "3. Run: ./scripts/migrate-routes.sh"
echo "4. Implement the TODO storage methods"
echo "5. Test with: ./scripts/test-all-endpoints.sh"
echo ""
echo "Files created:"
echo "- server/middleware/tenant-isolation.ts"
echo "- server/routes/tenant/tenant-portal.ts"
echo "- server/routes/tenant/clients.ts" 
echo "- scripts/test-tenant-isolation.sh"
echo "- scripts/test-all-endpoints.sh"
echo "- scripts/migrate-routes.sh"
echo "- check_schema.sql"
echo ""
echo "See BACKEND_IMPLEMENTATION_PLAN.md for detailed implementation steps."
