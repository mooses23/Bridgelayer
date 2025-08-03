-- Create core schema for Bridgelayer multi-tenant platform
-- This creates the foundation tables for profiles, verticals, and tenants

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create verticals table
CREATE TABLE IF NOT EXISTS public.verticals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('standalone', 'regenerative')),
    category TEXT NOT NULL,
    schema_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id SERIAL PRIMARY KEY,
    vertical_id INTEGER REFERENCES public.verticals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE SET NULL,
    vertical_id INTEGER REFERENCES public.verticals(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'tenant_admin', 'tenant_user')),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Insert default vertical (FirmSync)
INSERT INTO public.verticals (name, type, category, schema_name) 
VALUES ('FirmSync', 'standalone', 'Legal', 'firmsync')
ON CONFLICT (name) DO NOTHING;

-- Insert default tenant
INSERT INTO public.tenants (vertical_id, name, subdomain, settings)
SELECT 1, 'Demo Law Firm', 'demo-firm', '{"features": ["clients", "cases", "billing"]}'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE subdomain = 'demo-firm');

-- Create FirmSync schema for tenant-specific data
CREATE SCHEMA IF NOT EXISTS firmsync;

-- Create clients table in firmsync schema
CREATE TABLE IF NOT EXISTS firmsync.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cases table in firmsync schema
CREATE TABLE IF NOT EXISTS firmsync.cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES firmsync.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'archived')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE firmsync.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE firmsync.cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tenant isolation policies
CREATE POLICY "Tenant isolation for clients" ON firmsync.clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = clients.tenant_id
        )
    );

CREATE POLICY "Tenant isolation for cases" ON firmsync.cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = cases.tenant_id
        )
    );

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verticals_updated_at BEFORE UPDATE ON public.verticals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON firmsync.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON firmsync.cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();