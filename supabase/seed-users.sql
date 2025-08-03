-- Seed users for testing different roles
-- Run this after setting up authentication in Supabase

-- Note: You'll need to create these users through Supabase Auth first,
-- then update this file with their actual UUIDs

-- Insert test profiles (replace UUIDs with actual auth.users IDs)
INSERT INTO public.profiles (id, tenant_id, vertical_id, role, display_name, email) VALUES
-- Super Admin (Platform Owner)
('00000000-0000-0000-0000-000000000001', NULL, 1, 'super_admin', 'Platform Admin', 'admin@bridgelayer.com'),

-- FirmSync Admin (Vertical Admin)  
('00000000-0000-0000-0000-000000000002', NULL, 1, 'admin', 'FirmSync Admin', 'firmsync-admin@bridgelayer.com'),

-- Demo Firm Admin
('00000000-0000-0000-0000-000000000003', 1, 1, 'tenant_admin', 'John Smith', 'john@demo-firm.com'),

-- Demo Firm User
('00000000-0000-0000-0000-000000000004', 1, 1, 'tenant_user', 'Jane Doe', 'jane@demo-firm.com')

ON CONFLICT (id) DO NOTHING;

-- Insert sample clients for demo firm
INSERT INTO firmsync.clients (tenant_id, first_name, last_name, email, phone, status) VALUES
(1, 'Michael', 'Johnson', 'michael.johnson@email.com', '+1-555-0123', 'active'),
(1, 'Sarah', 'Williams', 'sarah.williams@email.com', '+1-555-0124', 'active'),
(1, 'David', 'Brown', 'david.brown@email.com', '+1-555-0125', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- Insert sample cases
INSERT INTO firmsync.cases (tenant_id, client_id, title, description, status, priority) VALUES
(1, (SELECT id FROM firmsync.clients WHERE first_name = 'Michael' AND last_name = 'Johnson' LIMIT 1), 'Personal Injury Case', 'Car accident claim', 'open', 'high'),
(1, (SELECT id FROM firmsync.clients WHERE first_name = 'Sarah' AND last_name = 'Williams' LIMIT 1), 'Divorce Proceedings', 'Uncontested divorce', 'pending', 'medium'),
(1, (SELECT id FROM firmsync.clients WHERE first_name = 'David' AND last_name = 'Brown' LIMIT 1), 'Contract Dispute', 'Business contract review', 'closed', 'low')
ON CONFLICT (id) DO NOTHING;
