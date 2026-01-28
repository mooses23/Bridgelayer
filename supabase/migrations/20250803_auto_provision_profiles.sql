-- Migration: Auto-provision user profiles on auth signup
-- This ensures every authenticated user gets a profile record automatically

-- Create a function that runs when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_vertical_id INTEGER;
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
  
  -- Create a profile for the new user
  INSERT INTO public.profiles (
    id,
    tenant_id,
    vertical_id,
    role,
    display_name,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NULL,                          -- No tenant assigned initially
    default_vertical_id,           -- Default vertical (FirmSync)
    'tenant_user',                 -- Default role for new users
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),  -- Display name from auth metadata or email
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Ignore if profile already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger to update profile email if auth user email changes
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;

CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_change();
