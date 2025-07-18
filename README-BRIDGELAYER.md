# Bridgelayer Meta‑SaaS Platform

## Overview

Bridgelayer is a multi‑tenant, multi‑vertical platform built with Next.js and Supabase. Each vertical can be one of two types:

* **Standalone Verticals** (single‑tenant, one‑off sites)
* **Regenerative Verticals** (multi‑tenant, scalable products like FirmSync)

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth with Google OAuth

## Quick Start

### 1. Environment Setup

Copy the environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The platform uses a role-based access control system with the following core tables:

### `public.profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id INTEGER REFERENCES tenants(id),
  vertical_id INTEGER REFERENCES verticals(id),
  role TEXT CHECK (role IN ('super_admin', 'admin', 'tenant_admin', 'tenant_user')),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `public.verticals`
```sql
CREATE TABLE verticals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('standalone', 'regenerative')),
  category TEXT NOT NULL,
  schema_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `public.tenants`
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  vertical_id INTEGER REFERENCES verticals(id),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Roles & Access

### Super Admin (`super_admin`)
- **Location**: `/owner/*`
- **Access**: Platform-wide administration
- **Features**:
  - Manage all verticals
  - View all tenants across verticals
  - Global user management
  - Platform analytics and settings

### Vertical Admin (`admin`)
- **Location**: `/firmsync/admin/*` (example for FirmSync)
- **Access**: Vertical-wide administration
- **Features**:
  - Tenant creation and management
  - Integration configuration
  - AI/LLM workflow setup
  - Document pipeline management

### Tenant Admin (`tenant_admin`)
- **Location**: `/firmsync/:tenantId/*`
- **Access**: Single tenant administration
- **Features**:
  - Manage tenant users
  - Configure tenant settings
  - Access all tenant features

### Tenant User (`tenant_user`)
- **Location**: `/firmsync/:tenantId/*`
- **Access**: Limited tenant access
- **Features**:
  - Use assigned features
  - View own data only

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/         # Authentication pages
│   │   └── auth/
│   ├── owner/             # Super admin dashboard
│   │   ├── dashboard/
│   │   ├── verticals/
│   │   ├── tenants/
│   │   ├── users/
│   │   ├── analytics/
│   │   └── settings/
│   └── firmsync/          # FirmSync vertical
│       ├── admin/         # Vertical admin pages
│       └── [tenantId]/    # Tenant-specific pages
├── utils/
│   └── supabase/          # Supabase client configuration
├── types/
│   └── database.ts        # TypeScript definitions
└── components/            # Reusable React components
```

## FirmSync Vertical Example

FirmSync is a legal-tech regenerative vertical with:

### Admin Workshop (`/firmsync/admin`)
- **Firms**: Create and manage law firm tenants
- **Integrations**: Configure per-tenant integrations
- **LLM**: Set up AI agent workflows
- **Doc+**: Document intelligence pipelines
- **Preview**: Ghost mode portal preview
- **Settings**: Generate onboarding code

### Tenant Portal (`/firmsync/:tenantId`)
- **Clients**: Client relationship management
- **Cases**: Case tracking and management
- **Calendar**: Scheduling and appointments
- **DocSign**: Document signing workflows
- **Paralegal+**: AI-powered legal assistance
- **Billing**: Invoicing and payment processing

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Or deploy manually
vercel --prod
```

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Authentication Flow

1. Users visit the platform and are redirected to `/login`
2. Users can authenticate via email/password or Google OAuth
3. Upon successful authentication, users are redirected to role-appropriate dashboards
4. Middleware protects routes and ensures proper access control

## Next Steps

1. Set up your Supabase project and database schema
2. Configure Google OAuth in Supabase Auth settings
3. Add your environment variables
4. Customize the verticals for your use case
5. Deploy to Vercel

---

*Built with ❤️ by the Bridgelayer team*
