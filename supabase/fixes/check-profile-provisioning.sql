-- Helper SQL scripts to debug and fix profile provisioning issues

-- 1. Check for users without profiles
SELECT 
  u.id,
  u.email,
  u.created_at as auth_created_at,
  p.id as profile_id,
  p.email as profile_email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 2. Find the FirmSync vertical ID (needed for profile creation)
SELECT id, name, is_active FROM public.verticals WHERE name = 'FirmSync';

-- 3. Manually create a profile for a specific user (replace EMAIL with actual email)
-- First, uncomment and modify the email, then execute
/*
INSERT INTO public.profiles (
  id,
  tenant_id,
  vertical_id,
  role,
  display_name,
  email,
  created_at,
  updated_at
)
SELECT
  u.id,
  NULL,
  (SELECT id FROM public.verticals WHERE name = 'FirmSync' LIMIT 1),
  'tenant_user',
  u.email,
  u.email,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'firmsyncdev@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
*/

-- 4. Check profile count and distribution by role
SELECT 
  role,
  COUNT(*) as count,
  COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as unassigned_to_tenant
FROM public.profiles
GROUP BY role
ORDER BY count DESC;

-- 5. Verify triggers are active
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE '%auth_user%' OR trigger_name LIKE '%provision%')
ORDER BY trigger_name;

-- 6. Check recent profile creations (last 24 hours)
SELECT 
  id,
  email,
  role,
  created_at,
  EXTRACT(HOUR FROM NOW() - created_at) as hours_ago
FROM public.profiles
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 7. Check for email mismatches between auth and profiles
SELECT 
  u.id,
  u.email as auth_email,
  p.email as profile_email,
  CASE WHEN u.email = p.email THEN 'Match' ELSE 'MISMATCH' END as status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email != p.email
ORDER BY u.email;
