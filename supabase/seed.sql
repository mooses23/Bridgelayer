-- Seed data for Bridgelayer development
-- Run this after the core schema migration

-- Insert demo users into Supabase Auth
-- Passwords are 'password' for all users
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@bridgelayer.com', crypt('password', gen_salt('bf')), NOW(), null, null, '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'admin@firmsync.com', crypt('password', gen_salt('bf')), NOW(), null, null, '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'firm@example.com', crypt('password', gen_salt('bf')), NOW(), null, null, '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
('44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'user@example.com', crypt('password', gen_salt('bf')), NOW(), null, null, '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Insert demo profiles
INSERT INTO public.profiles (id, tenant_id, vertical_id, role, display_name, email) VALUES
-- Super admin (platform owner)
('11111111-1111-1111-1111-111111111111', NULL, 1, 'super_admin', 'Platform Admin', 'admin@bridgelayer.com'),

-- Vertical admin (FirmSync admin)
('22222222-2222-2222-2222-222222222222', NULL, 1, 'admin', 'FirmSync Admin', 'admin@firmsync.com'),

-- Tenant admin (Firm admin)
('33333333-3333-3333-3333-333333333333', 1, 1, 'tenant_admin', 'John Firm Admin', 'firm@example.com'),

-- Tenant user (Regular firm user)
('44444444-4444-4444-4444-444444444444', 1, 1, 'tenant_user', 'Jane Firm User', 'user@example.com')

ON CONFLICT (id) DO NOTHING;

-- Insert demo clients for tenant 1
INSERT INTO firmsync.clients (tenant_id, first_name, last_name, email, phone, address, status) VALUES
(1, 'Michael', 'Johnson', 'mjohnson@email.com', '555-0101', '{"street": "123 Main St", "city": "Springfield", "state": "IL", "zip": "62701"}', 'active'),
(1, 'Sarah', 'Williams', 'swilliams@email.com', '555-0102', '{"street": "456 Oak Ave", "city": "Springfield", "state": "IL", "zip": "62702"}', 'active'),
(1, 'Robert', 'Davis', 'rdavis@email.com', '555-0103', '{"street": "789 Pine St", "city": "Springfield", "state": "IL", "zip": "62703"}', 'active'),
(1, 'Emily', 'Brown', 'ebrown@email.com', '555-0104', '{"street": "321 Elm St", "city": "Springfield", "state": "IL", "zip": "62704"}', 'inactive'),
(1, 'David', 'Wilson', 'dwilson@email.com', '555-0105', '{"street": "654 Maple Dr", "city": "Springfield", "state": "IL", "zip": "62705"}', 'active')

ON CONFLICT DO NOTHING;

-- Insert demo cases for tenant 1
INSERT INTO firmsync.cases (tenant_id, client_id, title, description, status, priority) VALUES
(1, (SELECT id FROM firmsync.clients WHERE email = 'mjohnson@email.com'), 'Personal Injury Claim', 'Motor vehicle accident case requiring settlement negotiation', 'open', 'high'),
(1, (SELECT id FROM firmsync.clients WHERE email = 'swilliams@email.com'), 'Divorce Proceedings', 'Contested divorce with child custody considerations', 'open', 'medium'),
(1, (SELECT id FROM firmsync.clients WHERE email = 'rdavis@email.com'), 'Contract Dispute', 'Business contract breach requiring litigation', 'pending', 'medium'),
(1, (SELECT id FROM firmsync.clients WHERE email = 'ebrown@email.com'), 'Estate Planning', 'Will and trust document preparation', 'closed', 'low'),
(1, (SELECT id FROM firmsync.clients WHERE email = 'dwilson@email.com'), 'Criminal Defense', 'DUI defense case with court appearances', 'open', 'urgent')

ON CONFLICT DO NOTHING;

-- Insert a default portal layout for the demo tenant
INSERT INTO public.portal_layouts (tenant_id, page_slug, configuration) VALUES
(
    1,
    'dashboard',
    '{
        "version": 1,
        "grid": {
            "rows": [
                {
                    "columns": [
                        {
                            "width": "col-span-4",
                            "componentIds": ["BillingSummary"]
                        },
                        {
                            "width": "col-span-8",
                            "componentIds": ["RecentCasesTable"]
                        }
                    ]
                }
            ]
        }
    }'::jsonb
)
ON CONFLICT (tenant_id, page_slug) DO UPDATE 
SET configuration = EXCLUDED.configuration;
