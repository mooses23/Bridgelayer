# Multi-Tenant Database Architecture for AI-First Legal Tech

## Overview

This system implements a sophisticated multi-tenant architecture where each law firm gets its own dedicated Neon database with identical schemas. This design ensures complete data isolation while allowing LLMs and AI agents to understand and work with firm-specific data accurately.

## Architecture Components

### 🏗️ Core Architecture

1. **Central Supabase**: Authentication, routing, and metadata storage
2. **Per-Firm Neon Databases**: Isolated data storage with identical schemas
3. **Database Router**: Connection management, caching, and query routing
4. **Encrypted Storage**: Secure connection string management

### 🔧 Key Features

- ✅ **Complete Data Isolation**: Each firm's data in separate Neon databases
- ✅ **Identical Schemas**: Consistent structure for LLM understanding
- ✅ **Encrypted Connections**: Secure storage of database URLs
- ✅ **Connection Caching**: 5-minute TTL for performance optimization
- ✅ **Automatic Provisioning**: New firm = new Neon database
- ✅ **Admin Management**: Full CRUD operations for firm management

## File Structure

```
src/
├── lib/
│   ├── database-router.ts          # Core routing logic
│   ├── schema/
│   │   └── firm-database-schema.sql # Identical schema for all firms
│   └── test-multi-tenant.ts        # System verification tests
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── firms/route.ts       # Admin firm management
│   │   ├── firms/
│   │   │   └── [tenantId]/
│   │   │       └── clients/route.ts # Firm-specific data access
│   │   └── test/
│   │       └── multi-tenant/route.ts # System testing
│   └── firmsync/
│       └── admin/
│           └── firms/page.tsx       # Admin UI for firm management
└── supabase/
    └── migrations/
        └── 20250127000001_multi_tenant_routing.sql
```

## Environment Setup

Required environment variables in `.env.local`:

```bash
# Supabase (Central routing & auth)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Neon (Per-firm databases)
NEON_API_KEY=your-neon-api-key
NEON_ORGANIZATION_ID=your-neon-org-id
NEON_PROJECT_ID=your-neon-project-id

# Security
DATABASE_ENCRYPTION_KEY=your-32-char-encryption-key
```

## Usage Examples

### 1. Admin: Create New Firm

```typescript
// POST /api/admin/firms
{
  "firmName": "Smith & Associates Legal",
  "planType": "professional"
}
```

This automatically:
- Creates a new Neon database
- Sets up identical schema
- Encrypts and stores connection string
- Returns firm credentials

### 2. LLM: Query Firm Data

```typescript
// GET /api/firms/firm_123456789/clients
// Only returns clients for this specific firm
```

### 3. Data Isolation Verification

```typescript
// Test the system
// GET /api/test/multi-tenant
```

## Database Schema

All firm databases have identical schemas including:

- **Clients**: Individual and corporate clients
- **Cases**: Legal matters and proceedings  
- **Documents**: Case files and document management
- **Events**: Calendar and scheduling
- **Time Entries**: Billable hour tracking
- **Notes**: General notes and annotations
- **Contacts**: Related parties and contacts

## LLM Benefits

### Why This Architecture is Perfect for AI Agents

1. **Data Isolation**: LLMs only see one firm's data, preventing cross-contamination
2. **Schema Consistency**: Same structure across all firms = reliable AI understanding
3. **Performance**: Connection caching ensures fast response times
4. **Security**: Encrypted storage and isolated databases
5. **Scalability**: Each firm can grow independently

### Example LLM Query

```sql
-- This query works identically across all firms
-- but only returns data for the specific firm
SELECT 
  c.title as case_title,
  c.case_type,
  cl.first_name || ' ' || cl.last_name as client_name,
  c.status
FROM firmsync.cases c
JOIN firmsync.clients cl ON c.client_id = cl.id
WHERE c.status = 'open'
ORDER BY c.created_at DESC;
```

## API Routes

### Admin Routes
- `POST /api/admin/firms` - Create new firm
- `GET /api/admin/firms` - List all firms with status

### Firm-Specific Routes
- `GET /api/firms/[tenantId]/clients` - Get firm's clients
- `POST /api/firms/[tenantId]/clients` - Create client for firm
- `GET /api/firms/[tenantId]/cases` - Get firm's cases
- `POST /api/firms/[tenantId]/cases` - Create case for firm

### Testing Routes
- `GET /api/test/multi-tenant` - Verify system functionality

## Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access Admin Interface**:
   ```
   http://localhost:3000/firmsync/admin/firms
   ```

3. **Create Test Firms**:
   - Use the admin interface to create new firms
   - Each gets its own Neon database automatically

4. **Test Data Isolation**:
   ```
   GET http://localhost:3000/api/test/multi-tenant
   ```

5. **Query Firm Data**:
   ```
   GET http://localhost:3000/api/firms/[tenantId]/clients
   ```

## Security Considerations

- Connection strings are encrypted using AES-256
- Each firm's database is completely isolated
- Admin routes require authentication (TODO: implement)
- Row-level security policies (TODO: enhance)

## Performance Features

- **Connection Pooling**: Max 5 connections per firm database
- **Connection Caching**: 5-minute TTL to reduce latency
- **Query Optimization**: Indexed columns for common queries
- **Efficient Routing**: Direct database access without middleware overhead

## Monitoring

The system includes built-in monitoring for:
- Connection health per firm
- Database provisioning status
- Cache hit/miss ratios
- Query performance metrics

## Future Enhancements

- [ ] Advanced admin authentication
- [ ] Schema migration system
- [ ] Database backup automation
- [ ] Advanced monitoring dashboard
- [ ] AWS internal networking
- [ ] Custom schema per firm (if needed)

---

This architecture provides the perfect foundation for AI-first legal tech, ensuring your LLMs can work effectively with firm-specific data while maintaining complete isolation and security.
