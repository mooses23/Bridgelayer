-- Migration: Repair existing users without profiles
-- This migration creates profiles for any existing auth users that don't have profiles

-- Get the FirmSync vertical ID (or first active vertical)
DO $$
DECLARE
  default_vertical_id INTEGER;
  users_created INTEGER;
BEGIN
  -- Get the default FirmSync vertical
  SELECT id INTO default_vertical_id FROM public.verticals 
  WHERE name = 'FirmSync' AND is_active = true 
  LIMIT 1;
  
  -- If no vertical found, use the first active one
  IF default_vertical_id IS NULL THEN
    SELECT id INTO default_vertical_id FROM public.verticals 
    WHERE is_active = true 
    LIMIT 1;
  END IF;
  
  -- If still no vertical, use id 1 as fallback
  IF default_vertical_id IS NULL THEN
    default_vertical_id := 1;
  END IF;
  
  -- Create profiles for all users without profiles
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
    default_vertical_id,
    'tenant_user',
    COALESCE(u.raw_user_meta_data->>'full_name', u.email),
    u.email,
    NOW(),
    NOW()
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Get count of profiles created
  GET DIAGNOSTICS users_created = ROW_COUNT;
  
  -- Log the result
  RAISE NOTICE 'Created profiles for % users that were missing profiles', users_created;
END $$;

-- Verify the repair
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (
    SELECT COUNT(*)
    FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  ) as users_without_profiles;
