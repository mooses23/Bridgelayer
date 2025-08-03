# 🌉 BridgeLayer Meta-SaaS Platform

## Overview

BridgeLayer is a next-generation multi-vertical SaaS platform that enables rapid creation and deployment of industry-specific portals. Built with Next.js 15, TypeScript, and Supabase, it provides a flexible framework for both standalone and scalable multi-tenant applications.

### Key Features

* **Multi-Vertical Architecture**: Support for multiple industry verticals (Legal, Medical, Education)
* **Dual Portal Types**:
  * **Standalone Verticals**: Single-tenant, customized portals
  * **Regenerative Verticals**: Multi-tenant, templated products (e.g., FirmSync)
* **Advanced Integration Layer**: Native support for industry-specific tools and services
* **AI-Powered Automation**: Built-in LLM agents for intelligent workflow automation

## 🚀 Live Deployment

- **Production:** https://bridgelayer-azeqlxw42-mooses-projects-7504e4bb.vercel.app
- **Local:** http://localhost:3000

## 🏗️ Architecture Overview

### Project Structure

```
/src
├── app/                      ← Entire Bridgelayer Next.js Application
│   ├── owner/                ← Super Admin Dashboard (Platform-wide control)
│   ├── firmsync/             ← FirmSync Regenerative Vertical
│   │   ├── admin/            ← FirmSync Admin Workshop (Portal builder)
│   │   │   ├── preview/      ← Preview page (visualize tenant portals)
│   │   │   ├── firms/        ← Step 1: Firm Setup
│   │   │   ├── integrations/ ← Step 2: Integrations
│   │   │   ├── llm/          ← Step 3: Base Agents
│   │   │   ├── docplus/      ← Step 4: Document Agents
│   │   │   └── settings/     ← Firm-specific admin settings
│   │   └── [tenantId]/       ← Dynamic FirmSync Tenant Portals (live portals)
│   │       ├── dashboard/
│   │       ├── clients/
│   │       ├── cases/
│   │       ├── calendar/
│   │       ├── billing/
│   │       ├── docusign/
│   │       ├── paralegal/
│   │       ├── reports/
│   │       └── settings/
│   └── medsync/              ← MedSync (Future Regen Vertical)
│
├── components/               ← Reusable UI Components (Buttons, Tabs, Accordions, etc.)
│   ├── layout/               ← Global layouts, navigation, footer
│   ├── forms/                ← Reusable form elements
│   └── widgets/              ← Reusable dynamic widgets
│
├── hooks/                    ← Custom React hooks (useAuth, usePortalTemplate, etc.)
├── utils/                    ← Utility functions (API calls, formatting helpers, Supabase)
├── types/                    ← TypeScript shared types (Database schema, common interfaces)
│
├── middleware.ts             ← Global route protection, role-based middleware
├── supabase/                 ← Supabase initialization, migrations, schema management
│
├── public/                   ← Public static files (logos, assets, images)
└── styles/                   ← Global CSS/Tailwind utilities
```

### 1. Owner (Bridgelayer) Vertical - Non‑Regenerative

* **Location:** `/src/app/owner`
* **Purpose:** Global management UI and API for:
  * Platform configuration
  * User/role management at `super_admin` level

#### Owner Dashboard Tabs
* **Verticals**: List/add new verticals
* **Tenants**: View all tenants across verticals
* **Users**: Manage global user roles
* **Analytics**: Platform usage & revenue
* **Settings**: Global configuration & API keys

### 2. Regenerative Vertical: FirmSync (Legal Tech)

**Location:** `/src/app/firmsync`
**Schema:** `firmsync` (nested in Postgres)
**Category:** `legal‑tech`

#### a) Admin Workshop (vertical‑wide admin)
**URL:** `/firmsync/admin`
**Role:** `admin` with `tenant_id = NULL`

**Tabs & Features:**
* **Firms**: Tenant/firm creation & management
* **Integrations**: Configure per-tenant integrations (Embed vs API‑Mirror vs AI‑Native)
* **LLM**: AI agent workflow configuration per tab
* **Doc+**: Document intelligence & pipeline settings
* **Preview**: Ghost mode to preview portal template
* **Settings**: Portal & onboarding code generation

#### b) Tenant (Firm) Portal
**URL:** `/firmsync/:tenantId`
**Role:** `tenant_admin` & `tenant_user` with `tenant_id` set

**Tabs:**
* **Clients**: Client management
* **Cases**: Case tracking and management
* **Calendar**: Schedule and appointments
* **DocSign**: Document signing workflow
* **Paralegal+**: AI-powered legal assistance
* **Billing**: Billing and invoicing

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd Bridgelayer
npm install
```

### 2. Environment Setup

Copy the environment template and configure your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uowxdgkbbmhsvjagockk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Database URLs (for migrations and direct access)
DATABASE_URL="postgresql://postgres.uowxdgkbbmhsvjagockk:your_password@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.uowxdgkbbmhsvjagockk:your_password@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
```

### 3. Supabase CLI Setup

The Supabase CLI is already installed and configured:

```bash
# Check installation
supabase --version  # Should show 2.31.4

# Project status
supabase status

# Start local development
supabase start

# Stop local services
supabase stop
```

**Local Development URLs:**
- **API:** http://127.0.0.1:54321
- **Database:** postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio:** http://127.0.0.1:54323
- **Storage:** http://127.0.0.1:54321/storage/v1/s3

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

### Core Tables

```sql
-- Global schema (public)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  tenant_id INTEGER NULL,
  vertical_id INTEGER NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'tenant_admin', 'tenant_user')),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verticals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('standalone', 'regenerative')),
  category TEXT NOT NULL,
  schema_name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  vertical_id INTEGER REFERENCES verticals(id),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Authentication & Authorization

### Role-Based Access Control

1. **super_admin**: Platform-wide access (Owner dashboard)
2. **admin**: Vertical-wide access (FirmSync admin workshop)
3. **tenant_admin**: Tenant management within vertical
4. **tenant_user**: Standard user access within tenant

### Row Level Security (RLS)

All tables implement RLS policies for multi-tenant isolation:

```sql
-- Example RLS policy for tenant isolation
CREATE POLICY "Users can only see their tenant data" 
ON table_name FOR ALL 
USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

## 🚀 Deployment

### Vercel Deployment

The project is configured for automatic deployment with Vercel:

```bash
# Install Vercel CLI (already installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### Environment Variables in Production

Ensure these are set in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (for migrations)
- `DIRECT_URL` (for direct database access)

## 📝 Development Workflow

### Database Migrations

```bash
# Create new migration
supabase migration new create_table_name

# Apply migrations locally
supabase db reset

# Push to remote (production)
supabase db push

# Pull schema from remote
supabase db pull
```

### Type Generation

```bash
# Generate TypeScript types from database
supabase gen types typescript --local > src/types/supabase.ts
```

### Testing

```bash
# Run local tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🧩 Key Features

### Multi-Tenant Architecture
- Tenant isolation via RLS policies
- Dynamic routing based on tenant context
- Shared resources with tenant-specific configurations

### Role-Based Navigation
- Automatic navigation based on user role
- Middleware-protected routes
- Session management with Supabase Auth

### Supabase Integration
- Real-time subscriptions
- File storage and CDN
- Row-level security
- Database functions and triggers

### Modern UI/UX
- Tailwind CSS for styling
- Responsive design
- Dark/light mode support
- Accessible components

## 📚 API Reference

### Authentication
```typescript
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

### Database Operations
```typescript
// Fetch user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Insert with RLS
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: 'value' })
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Supabase
supabase start       # Start local Supabase
supabase stop        # Stop local services
supabase status      # Check service status
supabase db reset    # Reset local database

# Vercel
vercel               # Deploy to preview
vercel --prod        # Deploy to production
```

## 🔄 Development Phases

### Phase 1: Core Setup ✅
- [x] Initialize global schema (`public.verticals`, `public.tenants`, `public.profiles`)
- [x] Scaffold nested verticals folder & schema
- [x] Write RLS policies for roles & isolation
- [x] Next.js 15 + TypeScript setup
- [x] Supabase integration
- [x] Vercel deployment
- [x] Role-based navigation

### Phase 2: Admin Workshop & Onboarding (Next)
- [ ] Build UI for dual preview/onboarding
- [ ] Store templates in JSONB
- [ ] Generate onboarding code to provision tenants & users
- [ ] Firm creation workflow
- [ ] Integration configuration system

### Phase 3: AI Intelligence
- [ ] Paralegal+ & Doc+ integration
- [ ] LLM agent orchestration per tab
- [ ] Document processing pipelines
- [ ] AI-powered workflows

### Phase 4: Scale & Additional Verticals
- [ ] Clone FirmSync pattern for MedSync, EduSync, HRSync…
- [ ] Share Integrations/LLM/Doc+ across verticals
- [ ] Multi-vertical management
- [ ] Advanced analytics and reporting

## 🛡️ Security Considerations

### Database Security
- Row Level Security (RLS) on all tables
- JWT-based authentication
- Tenant isolation at database level
- Audit logging for sensitive operations

### Application Security
- CSRF protection
- Input validation and sanitization
- Secure environment variable handling
- Rate limiting on API endpoints

## 🐛 Troubleshooting

### Common Issues

**Supabase Connection Issues:**
```bash
# Check if services are running
supabase status

# Restart services
supabase stop && supabase start

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

**Build Issues:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Type Errors:**
```bash
# Regenerate types from database
supabase gen types typescript --local > src/types/supabase.ts
```

## 📈 Performance Optimization

### Database
- Connection pooling with PgBouncer
- Query optimization with proper indexing
- Real-time subscriptions for live updates

### Frontend
- Next.js App Router for optimal performance
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Static generation where possible

## 🆘 Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vercel Documentation](https://vercel.com/docs)

### Development Tools
- **Supabase Studio:** http://127.0.0.1:54323 (local)
- **Vercel Dashboard:** https://vercel.com/dashboard
- **VS Code Extensions:** ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense

---

*Maintained by Bridgelayer Core Team – last updated: July 18, 2025*
