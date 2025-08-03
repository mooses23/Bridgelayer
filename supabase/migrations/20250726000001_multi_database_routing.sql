-- Central routing database schema
-- This stays in your main Supabase instance

-- Enhanced tenants table with database info
ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS database_url TEXT,
    ADD COLUMN IF NOT EXISTS database_name TEXT,
    ADD COLUMN IF NOT EXISTS database_host TEXT,
    ADD COLUMN IF NOT EXISTS database_port INTEGER DEFAULT 5432,
    ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS migration_version TEXT,
    ADD COLUMN IF NOT EXISTS schema_version TEXT;

-- Tenant database migrations tracking
CREATE TABLE IF NOT EXISTS public.tenant_migrations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE CASCADE,
    migration_name TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    error_message TEXT
);

-- Database provisioning queue
CREATE TABLE public.provisioning_queue (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE CASCADE,
    action TEXT CHECK (action IN ('create', 'migrate', 'backup', 'delete')),
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);
