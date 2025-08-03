-- Create the table to store layout configurations
CREATE TABLE public.portal_layouts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tenant_id BIGINT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    page_slug TEXT NOT NULL,
    configuration JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT portal_layouts_tenant_id_page_slug_key UNIQUE (tenant_id, page_slug)
);

-- Add comments for clarity
COMMENT ON TABLE public.portal_layouts IS 'Stores the dynamic page layout configurations for each tenant.';
COMMENT ON COLUMN public.portal_layouts.page_slug IS 'The page this layout applies to, e.g., "dashboard", "clients".';
COMMENT ON COLUMN public.portal_layouts.configuration IS 'The JSONB object defining the grid, columns, and component widgets.';

-- Enable Row Level Security
ALTER TABLE public.portal_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all layouts
CREATE POLICY "Admins can manage all portal layouts"
ON public.portal_layouts FOR ALL
USING (public.get_my_role() = 'admin');

-- RLS Policy: Tenant admins can read their own layouts
CREATE POLICY "Tenant admins can read their own layouts"
ON public.portal_layouts FOR SELECT
USING (public.get_my_role() = 'tenant_admin' AND tenant_id = public.get_my_tenant_id());