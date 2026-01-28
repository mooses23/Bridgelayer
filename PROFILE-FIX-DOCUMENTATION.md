# Fix for: firmsyncdev@gmail.com Profile Loading Error

## Problem Analysis

**Issue:** `firmsyncdev@gmail.com` is routing to "Error: Unable to load profile"

**Root Cause:** When a user authenticates through Supabase (email/password or OAuth), an auth user is created in `auth.users`, but no corresponding record is created in the `public.profiles` table. This causes:

1. **Middleware fails silently** - The middleware queries for a profile, gets `NULL`, and was not explicitly handling this case
2. **Profile loading fails** - Any component trying to load the user's profile hits an error
3. **Routes fail** - Protected routes depend on profile data for role-based access control

## Solution Implemented

### 1. **Auto-Provisioning Migration** (`20250803_auto_provision_profiles.sql`)

Created database triggers that automatically create a profile when:
- A new user signs up through Supabase Auth
- A user's email is updated

**Key features:**
- Automatically assigns users to the default FirmSync vertical
- Sets default role to `tenant_user`
- Uses email as display name initially
- Gracefully handles edge cases (no vertical found, etc.)

### 2. **Improved Middleware** (`src/utils/supabase/middleware.ts`)

Enhanced the middleware to:
- Explicitly handle users without profiles
- Redirect to `/auth/profile-not-found` when profile is missing
- Add better error logging for debugging
- Prevent access to protected routes for users without profiles

### 3. **Profile Not Found Page** (`src/app/auth/profile-not-found/page.tsx`)

Created a user-friendly page that:
- Explains the profile setup is in progress
- Shows the user's email
- Provides a "Check Profile Now" button to retry
- Allows users to sign out if needed
- Displays helpful support contact information

## How to Deploy

### Step 1: Apply the Migration

```bash
cd /workspaces/Bridgelayer

# Start Supabase if not already running
supabase start

# Apply the migration
supabase migration up
```

Or manually apply the SQL from `supabase/migrations/20250803_auto_provision_profiles.sql` to your database.

### Step 2: Restart the Development Server

```bash
npm run dev
```

## Testing

### For New Users

1. Go to `/login`
2. Sign up with a new email (e.g., `test@example.com`)
3. Complete OAuth or email/password signup
4. The profile should be automatically created within the database trigger
5. You should be redirected to the home page

### For Existing Users (like firmsyncdev@gmail.com)

If the user already exists in auth but has no profile:

```sql
-- Manually create the missing profile
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
  1,
  'tenant_user',
  u.email,
  u.email,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'firmsyncdev@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );
```

Then the user can log in normally.

## Files Modified

1. **Created:** `supabase/migrations/20250803_auto_provision_profiles.sql`
   - Database migration with auto-provisioning triggers

2. **Modified:** `src/utils/supabase/middleware.ts`
   - Added better error handling for missing profiles
   - Redirects to profile-not-found page

3. **Created:** `src/app/auth/profile-not-found/page.tsx`
   - User-friendly error page with retry capability

## Benefits

- ✅ New users automatically get profiles created
- ✅ No more "Unable to load profile" errors
- ✅ Better error messages and user guidance
- ✅ Graceful fallback if profile doesn't exist
- ✅ Maintains data consistency between auth.users and profiles

## Future Considerations

1. Add admin dashboard to manually manage user profiles
2. Implement email verification before profile creation
3. Add role assignment options during signup
4. Implement tenant assignment flow
5. Add profile completion form (name, phone, etc.) on first login
