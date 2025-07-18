# Bridgelayer Development Cheat Sheet

## Quick Start Commands

```bash
# Development server
npm run dev                 # Start Next.js dev server (localhost:3000)

# Supabase local development
supabase start             # Start all Supabase services
supabase status            # Check service status
supabase stop              # Stop all services

# Database management
supabase db reset          # Reset local DB to migrations
supabase migration new name # Create new migration
supabase db push           # Push migrations to remote
supabase db pull           # Pull schema from remote

# Type generation
supabase gen types typescript --local > src/types/supabase.ts

# Deployment
vercel --prod              # Deploy to production
vercel env add VAR_NAME production  # Add environment variable
```

## Local URLs

- **App:** http://localhost:3000
- **Supabase API:** http://127.0.0.1:54321
- **Supabase Studio:** http://127.0.0.1:54323
- **Database:** postgresql://postgres:postgres@127.0.0.1:54322/postgres

## Production URLs

- **App:** https://bridgelayer-azeqlxw42-mooses-projects-7504e4bb.vercel.app
- **Supabase:** https://uowxdgkbbmhsvjagockk.supabase.co

## Environment Variables

```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://uowxdgkbbmhsvjagockk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For database migrations
DATABASE_URL="postgresql://postgres.uowxdgkbbmhsvjagockk:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.uowxdgkbbmhsvjagockk:password@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
```

## Role-Based Access

### User Roles
- **super_admin:** Platform-wide access
- **admin:** Vertical-wide access (FirmSync admin)
- **tenant_admin:** Tenant management
- **tenant_user:** Standard user access

### Navigation Structure
```
/ (Dashboard - role-based)
├── /owner/* (super_admin only)
├── /firmsync/admin/* (admin only)
└── /firmsync/:tenantId/* (tenant_admin, tenant_user)
```

## Database Schema Quick Reference

```sql
-- Core tables
profiles (id, tenant_id, vertical_id, role, display_name, email)
verticals (id, name, type, category, schema_name)
tenants (id, vertical_id, name, subdomain, settings)

-- FirmSync schema (example)
firmsync.clients
firmsync.cases
firmsync.documents
firmsync.billing
```

## Troubleshooting

```bash
# Clear caches
rm -rf .next node_modules package-lock.json
npm install

# Reset Supabase
supabase stop
supabase start

# Check logs
supabase logs
npm run build  # Check for build errors
```

## Useful Code Snippets

### Supabase Client
```typescript
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// Get session
const { data: { session } } = await supabase.auth.getSession()

// Query with RLS
const { data } = await supabase.from('table').select('*')
```

### Middleware (Route Protection)
```typescript
// middleware.ts handles auth automatically
// Routes are protected based on user role
```

---

*Keep this file handy for quick reference during development!*
