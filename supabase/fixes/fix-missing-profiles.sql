-- SQL Script to diagnose and fix missing profiles
-- Run this in Supabase SQL Editor to check and fix profile issues

-- 1. Check how many auth users don't have profiles
SELECT 
  COUNT(*) as missing_profile_count,
  STRING_AGG(u.email, ', ') as emails
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. List all users without profiles (easier to read)
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 3. Fix: Create missing profiles for specific user
-- Replace 'firmsyncdev@gmail.com' with the actual email
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
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Verify the fix
SELECT 
  u.id,
  u.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.vertical_id,
  p.tenant_id,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'firmsyncdev@gmail.com';

-- 5. Fix ALL missing profiles at once
-- Uncomment to apply to all users
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
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/
