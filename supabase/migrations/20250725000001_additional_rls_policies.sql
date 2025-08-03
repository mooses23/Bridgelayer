-- Additional RLS policies for security
-- Run this as a new migration

-- Admin-level access for verticals
CREATE POLICY "Admin access to verticals" ON public.verticals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- Tenant access policies  
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (
                profiles.role IN ('super_admin', 'admin') 
                OR profiles.tenant_id = tenants.id
            )
        )
    );

CREATE POLICY "Admins can manage tenants" ON public.tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- Function to get user profile (useful for RLS)
CREATE OR REPLACE FUNCTION public.user_profile()
RETURNS public.profiles
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;
