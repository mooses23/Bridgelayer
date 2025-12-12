# Testing Guide: Profile Loading Fix

## Test 1: New User Signup (Automatic Profile Creation)

**What to test:** New users get automatic profiles via database trigger

### Steps:
1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Continue with Google" (or sign up with new email)
4. Complete OAuth/signup flow
5. Should redirect to home page (not error)

### Expected Result:
- ✅ No "Error: Unable to load profile" message
- ✅ User can access home page
- ✅ useAuth hook successfully loads profile

### How to Verify:
```sql
-- In Supabase SQL Editor, check if profile was created:
SELECT * FROM public.profiles 
WHERE email = 'your-test-email@example.com';

-- Should return one row with:
-- - id: UUID from auth.users
-- - role: 'tenant_user'
-- - vertical_id: 1 (or FirmSync)
-- - tenant_id: NULL
-- - email: your-test-email@example.com
```

---

## Test 2: Existing User Without Profile

**What to test:** Existing user redirected to profile-not-found page

### Setup:
1. Manually create an auth user without a profile:
```sql
-- In Supabase SQL Editor:
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'authenticated',
  'authenticated',
  'noprofile@test.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
```

### Steps:
1. Manually test by logging in as that user (or simulate session)
2. Try to access /firmsync/admin
3. Should see profile-not-found page

### Expected Result:
- ✅ Redirected to /auth/profile-not-found
- ✅ Page shows user's email
- ✅ "Check Profile Now" button visible
- ✅ Console shows warning: "[Middleware] User X has no profile record"

---

## Test 3: Profile-Not-Found Page

**What to test:** User can recover from missing profile state

### Steps:
1. Access /auth/profile-not-found directly
2. Observe page content
3. Click "Check Profile Now"
4. Wait for API response

### Expected Result:
- ✅ Page shows clear explanation
- ✅ Displays user's email
- ✅ "Check Profile Now" button triggers POST to /api/auth/check-profile
- ✅ If profile exists, redirects to home
- ✅ If profile doesn't exist, shows "retry attempt: X"
- ✅ "Sign Out" button works

---

## Test 4: Check Profile API Endpoint

**What to test:** API correctly reports and creates profiles

### Test 4a: GET Request (Check Status)
```bash
# Should return profile if it exists
curl -X GET http://localhost:3000/api/auth/check-profile \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Expected responses:
# 200 + {"status": "exists", "profile": {...}}  - Profile exists
# 404 + {"error": "Profile not found", ...}     - Profile missing
# 401 + {"error": "Not authenticated"}          - Not logged in
```

### Test 4b: POST Request (Create/Check)
```bash
# Create profile if missing, or return existing
curl -X POST http://localhost:3000/api/auth/check-profile \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Expected responses:
# 200 + {"status": "exists", "profile": {...}}   - Already exists
# 200 + {"status": "created", "profile": {...}}  - Just created
```

### Expected Result:
- ✅ Returns correct status
- ✅ Creates profile if missing
- ✅ Returns profile data on success
- ✅ Proper error handling

---

## Test 5: Middleware Route Protection

**What to test:** Middleware correctly handles profile checks

### Steps:
1. Create user without profile (see Test 2 setup)
2. Try to access:
   - /owner/dashboard → Should redirect
   - /firmsync/admin → Should redirect
   - /firmsync/1 → Should redirect
   - /login → Should allow

### Expected Result:
- ✅ Protected routes redirect to /auth/profile-not-found
- ✅ Public routes (login, auth) allow access
- ✅ Console shows warning logs for missing profiles

---

## Test 6: Email Verification After Update

**What to test:** Profile email updates when auth user email changes

### Steps:
1. Create user with email "test@example.com"
2. Create profile with same email
3. Update auth user email to "newemail@example.com"
4. Check if profile email updated

### Expected Result:
- ✅ Profile email automatically updates
- ✅ Both tables stay in sync

---

## Test 7: Bulk User Import

**What to test:** Creating profiles for multiple existing users

### Steps:
1. Create multiple auth users manually (without profiles)
2. Run SQL from supabase/fixes/fix-missing-profiles.sql
3. Run the "Fix ALL missing profiles" query

### Expected Result:
- ✅ All auth users now have profiles
- ✅ All new profiles have correct default values

---

## Test 8: Logging and Monitoring

**What to test:** Error logging works for debugging

### Steps:
1. Create user without profile
2. Try to access protected route
3. Check browser console
4. Check server logs

### Expected Result:
- ✅ Server logs warning: "[Middleware] User X has no profile record"
- ✅ Browser shows helpful error page
- ✅ Retry count increases on each check

---

## Performance Tests

### Test: Trigger Performance
**Objective:** Ensure auto-provisioning doesn't slow down signup

```sql
-- Measure trigger execution time
EXPLAIN ANALYZE
INSERT INTO auth.users (...) VALUES (...);
```

Expected: < 50ms for profile creation

### Test: Middleware Performance
**Objective:** Ensure profile lookup doesn't slow down requests

Expected: < 100ms for profile query in middleware

---

## Error Cases

### Test: Multiple Profile Creation
```sql
-- Create duplicate attempts - should be handled gracefully
INSERT INTO auth.users (...) VALUES (user1);
INSERT INTO auth.users (...) VALUES (user1);  -- Duplicate
```

Expected: ON CONFLICT handles gracefully ✅

### Test: Vertical Missing
```sql
-- Update scenario where FirmSync vertical is deleted
DELETE FROM public.verticals WHERE name = 'FirmSync';
INSERT INTO auth.users (...) VALUES (new_user);
```

Expected: Profile created with vertical_id = 1 (fallback) ✅

---

## Rollback Testing

### Test: Revert Migration
```bash
supabase migration revert
```

Expected:
- ✅ Triggers dropped
- ✅ Functions dropped
- ✅ New signups fail silently (old behavior)

### Test: Re-apply Migration
```bash
supabase migration up
```

Expected:
- ✅ Triggers recreated
- ✅ New signups work again

---

## Checklist for Sign-off

- [ ] Test 1: New user signup works
- [ ] Test 2: Existing user without profile redirects correctly
- [ ] Test 3: Profile-not-found page works
- [ ] Test 4: Check profile API works
- [ ] Test 5: Middleware protects routes
- [ ] Test 6: Email updates sync
- [ ] Test 7: Bulk import works
- [ ] Test 8: Logging works
- [ ] Performance: Signup < 500ms
- [ ] Performance: Middleware < 100ms
- [ ] Error handling works for edge cases
- [ ] Rollback/re-apply works

---

## Debugging Tips

If tests fail, check:

1. **Migration applied?**
   ```bash
   supabase migration list
   ```

2. **Triggers created?**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name LIKE '%auth_user%';
   ```

3. **Function exists?**
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

4. **Profile data?**
   ```sql
   SELECT * FROM public.profiles 
   WHERE email = 'test@example.com';
   ```

5. **Middleware logs?**
   ```bash
   npm run dev  # Check server console for warnings
   ```

6. **API endpoint?**
   ```bash
   curl http://localhost:3000/api/auth/check-profile
   ```
