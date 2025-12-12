# Bridgelayer Profile Loading Error - Complete Fix

## Overview

Fixed the issue where `firmsyncdev@gmail.com` (and other new users) route to "Error: Unable to load profile".

## Root Cause

When users authenticate via Supabase Auth (OAuth, email/password), a record is created in `auth.users` but **no corresponding profile was created in `public.profiles`**. This breaks:

1. Middleware role-based routing (can't check user role without profile)
2. Component profile loading (useAuth hook fails to fetch profile)
3. Dashboard access (routes expect profile data)

## Solution Components

### 1. Database Trigger for Auto-Provisioning

**File:** `supabase/migrations/20250803_auto_provision_profiles.sql`

When a user signs up:

- ✅ Automatically creates a profile record
- ✅ Assigns to FirmSync vertical by default
- ✅ Sets role to `tenant_user`
- ✅ Handles email updates

```sql
-- Trigger fires when new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Enhanced Middleware

**File:** `src/utils/supabase/middleware.ts`

Now explicitly handles users without profiles:

- ✅ Detects when profile is missing
- ✅ Logs the issue for debugging
- ✅ Redirects to `/auth/profile-not-found`
- ✅ Prevents access to protected routes

```typescript
if (profileError || !profile) {
  console.warn(`User ${user.email} has no profile record`);
  
  if (pathname.startsWith('/owner') || pathname.startsWith('/firmsync')) {
    return NextResponse.redirect(`${origin}/auth/profile-not-found`);
  }
}
```

### 3. Profile Not Found Page

**File:** `src/app/auth/profile-not-found/page.tsx`

User-friendly error page with:

- ✅ Clear explanation of what's happening
- ✅ Displays user's email
- ✅ "Check Profile Now" button to retry
- ✅ Auto-provision API call
- ✅ Sign out option
- ✅ Support contact info

### 4. Profile Check/Creation API

**File:** `src/app/api/auth/check-profile/route.ts`

API endpoints to verify and create profiles:

```bash
# Check current user's profile status
GET /api/auth/check-profile

# Create missing profile (or check if exists)
POST /api/auth/check-profile
```

Returns:

- `200 + {status: 'exists'}` - Profile already exists
- `200 + {status: 'created'}` - Just created the profile
- `404` - Profile being auto-provisioned (retry in a moment)

### 5. Helper Scripts & SQL

**Diagnostic SQL:** `supabase/fixes/fix-missing-profiles.sql`

- Check how many users are missing profiles
- List all affected users
- Manually fix individual or all users

**Provisioning Script:** `scripts/provision-users.sh`

- Command-line tool to create missing profiles
- Usage: `./scripts/provision-users.sh <email>`

## Deployment Steps

### Step 1: Apply Migration

```bash
cd /workspaces/Bridgelayer

# Start Supabase
supabase start

# Apply the new migration
supabase migration up
```

### Step 2: Restart Development Server

```bash
npm run dev
```

### Step 3: Test New User Signup

```text
1. Go to http://localhost:3000/login
2. Click "Continue with Google" or sign up with email
3. Complete the OAuth/signup flow
4. Should be redirected to home page (not profile-not-found)
```

### Step 4 (If needed): Fix Existing User

For `firmsyncdev@gmail.com` if they already exist:

### Option A Use SQL in Supabase Dashboard

1. Go to SQL Editor in Supabase
2. Copy content from `supabase/fixes/fix-missing-profiles.sql`
3. Run the "Fix for specific user" query with the email

### Option B Use API Endpoint

```bash
# While logged in as that user
curl -X POST http://localhost:3000/api/auth/check-profile
```

### Option C Use Provisioning Script

```bash
chmod +x scripts/provision-users.sh
./scripts/provision-users.sh firmsyncdev@gmail.com
```

## Testing Checklist

- [ ] New user signup creates profile automatically
- [ ] New user can access home page after signup
- [ ] Existing user without profile sees profile-not-found page
- [ ] Profile-not-found page "Check Now" button works
- [ ] Profile-not-found page sign out works
- [ ] Middleware correctly logs missing profiles
- [ ] GET /api/auth/check-profile returns correct status
- [ ] POST /api/auth/check-profile creates missing profile

## Files Modified

```text
✨ Created:
  └─ supabase/migrations/20250803_auto_provision_profiles.sql
  └─ supabase/fixes/fix-missing-profiles.sql
  └─ src/app/auth/profile-not-found/page.tsx
  └─ src/app/api/auth/check-profile/route.ts
  └─ scripts/provision-users.sh
  └─ PROFILE-FIX-DOCUMENTATION.md

📝 Modified:
  └─ src/utils/supabase/middleware.ts
```

## Monitoring

After deployment, monitor for:

1. **Logs** - Check for "User X has no profile" warnings
2. **Errors** - Any profile query errors in console
3. **Routes** - Verify protected routes redirect correctly
4. **User Experience** - New signups flow smoothly

## Rollback (if needed)

```bash
# To revert to previous migration state
supabase migration list
supabase migration up [REVISION] # to specific version

# Or manually drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_email_change();
```

## Future Improvements

1. **Profile Completion Form** - Ask for display name, phone, etc. on first login
2. **Tenant Assignment Flow** - Show tenant selection during/after signup
3. **Role Assignment** - Allow different default roles based on signup context
4. **Email Verification** - Require email verification before creating profile
5. **Admin Dashboard** - Manually manage user profiles and roles
6. **Bulk Import** - Import users from CSV and auto-create profiles

## Support

For questions or issues:

1. Check the diagnostic SQL in `supabase/fixes/fix-missing-profiles.sql`
2. Review middleware logs for error details
3. Use `/api/auth/check-profile` endpoint to test
4. Check Supabase logs for trigger execution errors
