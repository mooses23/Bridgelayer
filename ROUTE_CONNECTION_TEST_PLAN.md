# 🧪 Authentication Routes Test Plan - Updated

## Overview
This test plan verifies that all routes are correctly connected to the new unified `authController.js` and that proper access control is enforced for Owner, Admin, and Tenant roles.

## Discovered Routes

### Authentication Routes (Connected to authController.js)
- `POST /api/auth/owner-login` → `authController.loginOwner`
- `POST /api/auth/admin-login` → `authController.loginAdmin`
- `POST /api/auth/login` → `loginHandler` (tenant login)
- `POST /api/auth/logout` → `authController.logout`
- `GET /api/auth/session` → `authController.validateSession`
- `POST /api/auth/refresh` → `refreshJWTTokens`

### Dashboard Routes (Protected)
- `GET /api/app/dashboard/:firmCode` (Requires: auth + firmUser + validFirmCode)
- `GET /api/dashboard-summary` (Requires: auth)
- `GET /api/integrations/dashboard` (Requires: auth)

## Test Plan

---

## 1. 🔐 Owner Routes Testing

### 1.1 Owner Login Route
**Endpoint**: `POST /api/auth/owner-login`
**Controller**: `authController.loginOwner`

#### Test Case 1.1.1: Valid Owner Login
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "SecureOwnerPass123!",
    "masterKey": "'$OWNER_MASTER_KEY'"
  }'
```
**Expected**: ✅ 200 OK with user object and session cookies

#### Test Case 1.1.2: Missing Master Key
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@firmsync.com", "password": "test"}'
```
**Expected**: ❌ 400 Bad Request - "Master key required"

#### Test Case 1.1.3: Invalid Master Key
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "test",
    "masterKey": "invalid-key"
  }'
```
**Expected**: ❌ 403 Forbidden - "Invalid master key"

### 1.2 Owner Dashboard Access
**Endpoint**: `GET /api/integrations/dashboard` (Owner can access all admin features)

#### Test Case 1.2.1: Owner Access to Integration Dashboard
```bash
# First login as owner to get session
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "owner@firmsync.com", "password": "SecureOwnerPass123!", "masterKey": "'$OWNER_MASTER_KEY'"}'

# Then access dashboard
curl -X GET http://localhost:5001/api/integrations/dashboard \
  -b cookies.txt
```
**Expected**: ✅ 200 OK with dashboard data

---

## 2. 👨‍💼 Admin Routes Testing

### 2.1 Admin Login Route
**Endpoint**: `POST /api/auth/admin-login`
**Controller**: `authController.loginAdmin`

#### Test Case 2.1.1: Valid Admin Login
```bash
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testfirm.com",
    "password": "SecureAdminPass123!"
  }'
```
**Expected**: ✅ 200 OK with admin user object and session

#### Test Case 2.1.2: Invalid Admin Credentials
```bash
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testfirm.com",
    "password": "wrongpassword"
  }'
```
**Expected**: ❌ 401 Unauthorized - "Invalid credentials"

#### Test Case 2.1.3: Non-Admin User Attempting Admin Login
```bash
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "SecureUserPass123!"
  }'
```
**Expected**: ❌ 401 Unauthorized - "Admin access required"

### 2.2 Admin Dashboard Access
**Endpoint**: `GET /api/dashboard-summary`

#### Test Case 2.2.1: Admin Access to Dashboard Summary
```bash
# Login as admin
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{"email": "admin@testfirm.com", "password": "SecureAdminPass123!"}'

# Access dashboard
curl -X GET http://localhost:5001/api/dashboard-summary \
  -b admin_cookies.txt
```
**Expected**: ✅ 200 OK with firm-specific dashboard data

---

## 3. 👤 Tenant Routes Testing

### 3.1 Tenant Login Route
**Endpoint**: `POST /api/auth/login` (General login for tenants)
**Controller**: `loginHandler` (should route to tenant login logic)

#### Test Case 3.1.1: Valid Tenant Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "SecureUserPass123!"
  }'
```
**Expected**: ✅ 200 OK with tenant user object

#### Test Case 3.1.2: Invalid Tenant Credentials
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "wrongpassword"
  }'
```
**Expected**: ❌ 401 Unauthorized - "Invalid credentials"

### 3.2 Tenant Dashboard Access
**Endpoint**: `GET /api/app/dashboard/:firmCode`

#### Test Case 3.2.1: Tenant Access to Own Firm Dashboard
```bash
# Login as tenant
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -c tenant_cookies.txt \
  -d '{"email": "user@testfirm.com", "password": "SecureUserPass123!"}'

# Access firm dashboard (replace FIRM_CODE with actual firm code)
curl -X GET http://localhost:5001/api/app/dashboard/FIRM_CODE \
  -b tenant_cookies.txt
```
**Expected**: ✅ 200 OK with firm dashboard data

#### Test Case 3.2.2: Tenant Access to Wrong Firm Dashboard
```bash
curl -X GET http://localhost:5001/api/app/dashboard/WRONG_FIRM_CODE \
  -b tenant_cookies.txt
```
**Expected**: ❌ 403 Forbidden - "Access denied to this firm"

---

## 4. 🔒 Unauthorized Access Error Handling

### 4.1 Dashboard Access Without Authentication

#### Test Case 4.1.1: Unauthenticated Dashboard Access
```bash
curl -X GET http://localhost:5001/api/dashboard-summary
```
**Expected**: ❌ 401 Unauthorized - "Authentication required"

#### Test Case 4.1.2: Unauthenticated Firm Dashboard Access
```bash
curl -X GET http://localhost:5001/api/app/dashboard/testfirm
```
**Expected**: ❌ 401 Unauthorized - "Authentication required"

#### Test Case 4.1.3: Unauthenticated Integration Dashboard Access
```bash
curl -X GET http://localhost:5001/api/integrations/dashboard
```
**Expected**: ❌ 401 Unauthorized - "Authentication required"

### 4.2 Cross-Role Access Attempts

#### Test Case 4.2.1: Tenant Attempting Owner-Only Operations
```bash
# Login as tenant first
curl -X POST http://localhost:5001/api/auth/login \
  -c tenant_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email": "user@testfirm.com", "password": "SecureUserPass123!"}'

# Try to access owner-level integration dashboard
curl -X GET http://localhost:5001/api/integrations/dashboard \
  -b tenant_cookies.txt
```
**Expected**: ❌ 403 Forbidden - "Insufficient permissions"

### 4.3 Session Validation

#### Test Case 4.3.1: Valid Session Check
```bash
# Login first
curl -X POST http://localhost:5001/api/auth/admin-login \
  -c session_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@testfirm.com", "password": "SecureAdminPass123!"}'

# Check session
curl -X GET http://localhost:5001/api/auth/session \
  -b session_cookies.txt
```
**Expected**: ✅ 200 OK with user session data

#### Test Case 4.3.2: Invalid/Expired Session Check
```bash
curl -X GET http://localhost:5001/api/auth/session
```
**Expected**: ❌ 401 Unauthorized - "Invalid session"

---

## 5. 🧪 Quick Test Script

Save this as `test-auth-routes.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5001"
OWNER_MASTER_KEY="${OWNER_MASTER_KEY:-xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI=}"

echo "🧪 Testing Authentication Routes Connected to authController.js"
echo "================================================================"

# Test 1: Owner Login
echo "🔐 Testing Owner Login..."
OWNER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"owner@firmsync.com\",\"password\":\"test\",\"masterKey\":\"$OWNER_MASTER_KEY\"}")

if echo "$OWNER_RESPONSE" | grep -q "success"; then
  echo "✅ Owner login route connected"
else
  echo "❌ Owner login route failed: $OWNER_RESPONSE"
fi

# Test 2: Admin Login
echo "👨‍💼 Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@testfirm.com\",\"password\":\"test\"}")

if echo "$ADMIN_RESPONSE" | grep -q "error\|message"; then
  echo "✅ Admin login route connected (got response)"
else
  echo "❌ Admin login route failed: $ADMIN_RESPONSE"
fi

# Test 3: Tenant Login
echo "👤 Testing Tenant Login..."
TENANT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@testfirm.com\",\"password\":\"test\"}")

if echo "$TENANT_RESPONSE" | grep -q "error\|message\|success"; then
  echo "✅ Tenant login route connected (got response)"
else
  echo "❌ Tenant login route failed: $TENANT_RESPONSE"
fi

# Test 4: Session Validation
echo "🔍 Testing Session Validation..."
SESSION_RESPONSE=$(curl -s -X GET $BASE_URL/api/auth/session)

if echo "$SESSION_RESPONSE" | grep -q "error\|message"; then
  echo "✅ Session validation route connected"
else
  echo "❌ Session validation route failed: $SESSION_RESPONSE"
fi

# Test 5: Unauthorized Dashboard Access
echo "🔒 Testing Unauthorized Access..."
UNAUTH_RESPONSE=$(curl -s -X GET $BASE_URL/api/dashboard-summary)

if echo "$UNAUTH_RESPONSE" | grep -q "error\|unauthorized"; then
  echo "✅ Unauthorized access properly blocked"
else
  echo "❌ Unauthorized access not blocked: $UNAUTH_RESPONSE"
fi

echo "================================================================"
echo "✅ Route Connection Test Complete"
```

## 6. ✅ Success Criteria

The test plan passes when:

1. **Owner Routes**: 
   - ✅ `POST /api/auth/owner-login` connects to `authController.loginOwner`
   - ✅ Owner can access integration dashboard
   - ✅ Master key validation works

2. **Admin Routes**:
   - ✅ `POST /api/auth/admin-login` connects to `authController.loginAdmin`
   - ✅ Admin can access dashboard summary
   - ✅ Role validation prevents non-admins from admin login

3. **Tenant Routes**:
   - ✅ `POST /api/auth/login` handles tenant authentication
   - ✅ Tenant can access firm-specific dashboards
   - ✅ Firm code validation prevents cross-firm access

4. **Error Handling**:
   - ✅ All protected routes return 401 when unauthenticated
   - ✅ Cross-role access attempts return 403
   - ✅ Invalid credentials return appropriate error messages
   - ✅ Session validation works correctly

Run the quick test script to verify all routes are properly connected to the authController.js!
