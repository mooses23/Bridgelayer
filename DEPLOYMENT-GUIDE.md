# Deployment Guide: Profile Loading Fix

## Overview

This deployment fixes the "Unable to load profile" error for users like `firmsyncdev@gmail.com` by implementing automatic profile provisioning.

**Deployment Time**: ~5 minutes
**Downtime**: None
**Risk Level**: Low (fully backward compatible)

## Pre-Deployment

### 1. Backup Database (if production)

```bash
# For local development - Supabase handles backup
# For production - backup your Supabase database through Supabase dashboard
```

### 2. Review Changes

```bash
cd /workspaces/Bridgelayer

# View migrations
ls -la supabase/migrations/ | grep 20250803 && ls -la supabase/migrations/ | grep 20250805

# View code changes
git diff HEAD -- src/utils/supabase/middleware.ts
git diff HEAD -- src/hooks/useAuth.ts
```

## Deployment Steps

### Step 1: Ensure Supabase is Running

```bash
cd /workspaces/Bridgelayer

# Check status
supabase status

# If not running, start it
supabase start
```

### Step 2: Apply Migrations

```bash
# List current migrations
supabase migration list

# Apply pending migrations (includes our 2 new ones)
supabase migration up

# Verify migrations applied
supabase migration list
# Should show:
#   20250803_auto_provision_profiles.sql ✓
#   20250805_repair_missing_profiles.sql ✓
```

### Step 3: Verify Database Changes

```bash
# Run diagnostic query from supabase/fixes/check-profile-provisioning.sql

# Check triggers are active
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%auth_user%';

# Should output:
# - on_auth_user_created
# - on_auth_user_email_changed
```

### Step 4: Restart Application

```bash
# Stop the dev server if running (Ctrl+C)

# Restart with new code
npm run dev

# Or use the task:
# Run task: Dev Server with Hot Reload
```

### Step 5: Test the Fix

#### Test A New User Signup

1. Go to <http://localhost:3000/login>
2. Click "Create Account" or "Continue with Google"
3. Sign up with a test email (e.g., `test-newuser@example.com`)
4. Complete authentication
5. Should be redirected to home page ✅

#### Test B Existing User (`firmsyncdev@gmail.com`)

1. Go to <http://localhost:3000/login>
2. Sign in with `firmsyncdev@gmail.com`
3. Should either:
   - Show profile-not-found page (if migration didn't run)
   - Go directly to home page (if migration already ran) ✅
4. Click "Check Profile Now" to manually trigger provisioning

#### Test C Verify Profile Created

```bash
# In database (via Supabase dashboard or CLI)
SELECT id, email, role, tenant_id FROM public.profiles
WHERE email = 'test-newuser@example.com' 
OR email = 'firmsyncdev@gmail.com';

# Should show both profiles with:
# - role: 'tenant_user'
# - vertical_id: 1
# - tenant_id: NULL
```

## Validation

### Check Triggers Work

```sql
-- Insert a test auth user (careful in production!)
-- And verify profile is auto-created

-- Or use this read-only check:
SELECT COUNT(*) as trigger_count FROM information_schema.triggers
WHERE trigger_schema = 'public' 
AND (trigger_name = 'on_auth_user_created' 
  OR trigger_name = 'on_auth_user_email_changed');
-- Should return: 2
```

### Check Profiles Created

```sql
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'tenant_user' THEN 1 END) as tenant_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins
FROM public.profiles;
```

### Check for Missing Profiles

```sql
SELECT COUNT(*) as users_without_profiles
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Should return: 0 (after repair migration)
```

## Rollback (if needed)

```bash
# If you need to rollback
supabase migration down

# This will:
# - Drop triggers
# - Drop functions
# - Profiles already created remain (won't be deleted)

# Restart application
npm run dev
```

## Monitoring

### Watch Logs

```bash
# Terminal 1: Supabase logs
supabase status

# Terminal 2: App logs
npm run dev
# Look for messages like:
# [Middleware] User ... has no profile record
# [Provision Profile] Successfully created profile
```

### Check Key Metrics

- Number of new profiles created (should increase with new signups)
- No "Unable to load profile" errors in logs
- Profile-not-found page visited = 0 times (ideally)

### Error Monitoring

- Check browser console for errors
- Check server logs for 500 errors
- Monitor `/api/auth/provision-profile` endpoint calls

## What to Do If Things Break

### Issue: Migrations Won't Apply

```bash
# Check migration status
supabase migration list --dry-run

# If stuck, try:
supabase db reset
supabase migration up
```

### Issue: Profiles Not Creating

```bash
# Check if triggers are active
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND trigger_name LIKE '%auth_user%';

# Run repair migration manually
supabase db execute << EOF
  -- Copy repair migration SQL from:
  -- supabase/migrations/20250805_repair_missing_profiles.sql
EOF
```

### Issue: Users Still Getting Errors

```bash
# Use API endpoint to manually provision
curl -X POST http://localhost:3000/api/auth/provision-profile \
  -H "Content-Type: application/json"

# Or use helper script
chmod +x scripts/provision-users.sh
./scripts/provision-users.sh "user@example.com"
```

## Post-Deployment

### Day 1

- ✅ Monitor logs for errors
- ✅ Test with multiple users
- ✅ Verify new user signups work
- ✅ Check existing users can login

### Week 1

- ✅ Monitor error tracking
- ✅ Check for any "profile not found" errors
- ✅ Verify email changes sync correctly

### Success Indicators

✅ No "Unable to load profile" errors  
✅ New users auto-provisioned  
✅ Existing users with missing profiles fixed  
✅ Profile-not-found page rarely (never) visited  
✅ Clean logs with no profile-related errors

## Files Changed

| File | Type | Status |
|------|------|--------|
| `supabase/migrations/20250803_auto_provision_profiles.sql` | Migration | ✨ NEW |
| `supabase/migrations/20250805_repair_missing_profiles.sql` | Migration | ✨ NEW |
| `src/utils/supabase/middleware.ts` | Code | 🔄 UPDATED |
| `src/app/auth/profile-not-found/page.tsx` | UI | ✨ NEW |
| `src/app/api/auth/provision-profile/route.ts` | API | ✨ NEW |
| `src/hooks/useAuth.ts` | Code | 🔄 UPDATED |
| `supabase/fixes/check-profile-provisioning.sql` | Tool | ✨ NEW |
| `scripts/provision-users.sh` | Script | ✨ NEW |

## Support

If you encounter issues:

1. Check the logs with the debugging queries in `supabase/fixes/check-profile-provisioning.sql`
2. Run the diagnostic checks in step 5
3. Consult `PROFILE-FIX-DOCUMENTATION.md` for detailed info
4. Use `PROFILE-FIX-QUICKREF.md` for quick answers

---

**Version**: 1.0  
**Last Updated**: Dec 5, 2025  
**Status**: Ready for Production
