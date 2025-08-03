-- Helper functions for RLS policies
-- Extracts a claim from the JWT

CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT)
RETURNS JSONB AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, NULL)::jsonb
$$ LANGUAGE SQL STABLE;

-- Extracts the tenant_id from the JWT claims
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS BIGINT AS $$
  SELECT (public.get_my_claim('tenant_id'))::bigint;
$$ LANGUAGE SQL STABLE;

-- Extracts the user_role from the JWT claims
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT (public.get_my_claim('user_role'))::text;
$$ LANGUAGE SQL STABLE;
