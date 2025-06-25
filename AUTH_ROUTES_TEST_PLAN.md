# 🧪 Authentication Routes Test Plan

## Overview
This test plan verifies that all routes are correctly connected to the new unified `authController.js` and that proper access control is enforced for Owner, Admin, and Tenant roles.

## Test Environment Setup

### Prerequisites
1. Environment variables properly configured:
   ```bash
   JWT_SECRET=QW5vdGhlclZlcnlMb25nU2VjdXJlSldUU2VjcmV0MTIzNDU2Nzg5MA==
   OWNER_MASTER_KEY=xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI=
   ```
2. Database with test users:
   - Owner: `owner@firmsync.com` (role: `super_admin`)
   - Admin: `admin@testfirm.com` (role: `admin` or `platform_admin`)
   - Tenant: `user@testfirm.com` (role: `firm_user` or `client`)

### Test Data Setup
```javascript
// Test credentials
const testCredentials = {
  owner: {
    email: "owner@firmsync.com",
    password: "SecureOwnerPass123!",
    masterKey: "xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="
  },
  admin: {
    email: "admin@testfirm.com", 
    password: "SecureAdminPass123!"
  },
  tenant: {
    email: "user@testfirm.com",
    password: "SecureUserPass123!"
  }
};
```

---

## 1. 🔐 Owner Authentication Tests

### 1.1 Owner Login Route Test
**Endpoint**: `POST /api/auth/owner-login`
**Controller Method**: `authController.loginOwner`

#### Test Case 1.1.1: Valid Owner Login
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "SecureOwnerPass123!",
    "masterKey": "xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="
  }'
```
**Expected Response**: 
- Status: `200 OK`
- Body: Contains `success: true`, user object, `redirectPath: "/admin/platform"`
- Sets secure cookies: `accessToken`, `refreshToken`

#### Test Case 1.1.2: Missing Master Key
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "SecureOwnerPass123!"
  }'
```
**Expected Response**: 
- Status: `400 Bad Request`
- Body: `{"error": "Missing credentials", "message": "Email, password, and master key are required for owner login"}`

#### Test Case 1.1.3: Invalid Master Key
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "SecureOwnerPass123!",
    "masterKey": "invalid-master-key"
  }'
```
**Expected Response**: 
- Status: `403 Forbidden`
- Body: `{"error": "Invalid master key", "message": "Owner master key is invalid"}`

#### Test Case 1.1.4: Non-Super-Admin User
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testfirm.com",
    "password": "SecureAdminPass123!",
    "masterKey": "xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="
  }'
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid credentials", "message": "Owner account not found"}`

### 1.2 Owner Dashboard Access Test
**Endpoint**: `GET /admin/platform/*`
**Prerequisites**: Valid owner login session

#### Test Case 1.2.1: Owner Access to Platform Admin
```bash
curl -X GET http://localhost:5001/admin/system-health \
  -H "Cookie: accessToken=<owner-jwt-token>"
```
**Expected Response**: 
- Status: `200 OK`
- Access granted to platform-level admin functions

---

## 2. 👑 Admin Authentication Tests

### 2.1 Admin Login Route Test
**Endpoint**: `POST /api/auth/admin-login`
**Controller Method**: `authController.loginAdmin`

#### Test Case 2.1.1: Valid Admin Login
```bash
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testfirm.com",
    "password": "SecureAdminPass123!"
  }'
```
**Expected Response**: 
- Status: `200 OK`
- Body: Contains `success: true`, user object, `redirectPath: "/admin"`
- Sets secure cookies: `accessToken`, `refreshToken`

#### Test Case 2.1.2: Non-Admin User Attempting Admin Login
```bash
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "SecureUserPass123!"
  }'
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid credentials", "message": "Admin account not found"}`

#### Test Case 2.1.3: Invalid Admin Credentials
```bash
curl -X POST http://localhost:5001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testfirm.com",
    "password": "wrongpassword"
  }'
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid credentials", "message": "Invalid password"}`

### 2.2 Admin Dashboard Access Test
**Endpoint**: `GET /admin/*`
**Prerequisites**: Valid admin login session

#### Test Case 2.2.1: Admin Access to Firm Management
```bash
curl -X GET http://localhost:5001/admin/firms \
  -H "Cookie: accessToken=<admin-jwt-token>"
```
**Expected Response**: 
- Status: `200 OK`
- Access granted to admin functions

#### Test Case 2.2.2: Admin Tenant Isolation Test
```bash
curl -X GET http://localhost:5001/admin/firms \
  -H "Cookie: accessToken=<admin-jwt-token>" \
  -H "X-Tenant-ID: other-firm"
```
**Expected Response**: 
- Status: `403 Forbidden` (if admin doesn't have access to other-firm)
- Body: `{"error": "Access denied", "message": "Invalid tenant access for admin"}`

---

## 3. 👤 Tenant Authentication Tests

### 3.1 Tenant Login Route Test
**Endpoint**: `POST /api/auth/login`
**Controller Method**: `authController.loginTenant`

#### Test Case 3.1.1: Valid Tenant Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "SecureUserPass123!"
  }'
```
**Expected Response**: 
- Status: `200 OK`
- Body: Contains `success: true`, user object, `redirectPath: "/dashboard"`
- Sets secure cookies: `accessToken`, `refreshToken`

#### Test Case 3.1.2: Client User Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@testfirm.com",
    "password": "SecureClientPass123!"
  }'
```
**Expected Response**: 
- Status: `200 OK`
- Body: Contains `redirectPath: "/client"`

#### Test Case 3.1.3: Invalid Tenant Credentials
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "wrongpassword"
  }'
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid credentials", "message": "Email or password is incorrect"}`

#### Test Case 3.1.4: Unregistered User
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@testfirm.com",
    "password": "anypassword"
  }'
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid credentials", "message": "Email or password is incorrect"}`

### 3.2 Tenant Dashboard Access Test
**Endpoint**: `GET /dashboard/*`
**Prerequisites**: Valid tenant login session

#### Test Case 3.2.1: Tenant Access to Dashboard
```bash
curl -X GET http://localhost:5001/api/dashboard \
  -H "Cookie: accessToken=<tenant-jwt-token>"
```
**Expected Response**: 
- Status: `200 OK`
- Access granted to tenant-specific functions

#### Test Case 3.2.2: Tenant Isolation Test
```bash
curl -X GET http://localhost:5001/api/firm-data \
  -H "Cookie: accessToken=<tenant-jwt-token>" \
  -H "X-Tenant-ID: other-firm"
```
**Expected Response**: 
- Status: `403 Forbidden`
- Body: `{"error": "Access denied", "message": "Invalid tenant access"}`

---

## 4. 🔄 Session Management Tests

### 4.1 Session Validation Test
**Endpoint**: `GET /api/auth/session`
**Controller Method**: `authController.validateSession`

#### Test Case 4.1.1: Valid Session Check
```bash
curl -X GET http://localhost:5001/api/auth/session \
  -H "Cookie: accessToken=<valid-jwt-token>"
```
**Expected Response**: 
- Status: `200 OK`
- Body: Contains user info, `authMethod: "jwt"` or `"session"`

#### Test Case 4.1.2: Expired Token
```bash
curl -X GET http://localhost:5001/api/auth/session \
  -H "Cookie: accessToken=<expired-jwt-token>"
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "No active session", "message": "Authentication required"}`

#### Test Case 4.1.3: No Authentication
```bash
curl -X GET http://localhost:5001/api/auth/session
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "No active session", "message": "Authentication required"}`

### 4.2 Token Refresh Test
**Endpoint**: `POST /api/auth/refresh`
**Controller Method**: `authController.refreshTokens`

#### Test Case 4.2.1: Valid Refresh Token
```bash
curl -X POST http://localhost:5001/api/auth/refresh \
  -H "Cookie: refreshToken=<valid-refresh-token>"
```
**Expected Response**: 
- Status: `200 OK`
- Body: `{"success": true, "message": "Tokens refreshed successfully"}`
- Sets new `accessToken` and `refreshToken` cookies

#### Test Case 4.2.2: Invalid Refresh Token
```bash
curl -X POST http://localhost:5001/api/auth/refresh \
  -H "Cookie: refreshToken=invalid-token"
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid refresh token", "message": "Refresh token is invalid or expired"}`

### 4.3 Logout Test
**Endpoint**: `POST /api/auth/logout`
**Controller Method**: `authController.logout`

#### Test Case 4.3.1: Successful Logout
```bash
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Cookie: accessToken=<valid-jwt-token>"
```
**Expected Response**: 
- Status: `200 OK`
- Body: `{"success": true, "message": "Logout successful", "clearedAuth": ["session", "jwt"]}`
- Clears all authentication cookies

---

## 5. 🚫 Unauthorized Access Tests

### 5.1 Cross-Role Access Attempts

#### Test Case 5.1.1: Tenant Attempting Owner Login
```bash
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testfirm.com",
    "password": "SecureUserPass123!",
    "masterKey": "xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="
  }'
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Body: `{"error": "Invalid credentials", "message": "Owner account not found"}`

#### Test Case 5.1.2: Tenant Attempting Admin Routes
```bash
curl -X GET http://localhost:5001/admin/system-health \
  -H "Cookie: accessToken=<tenant-jwt-token>"
```
**Expected Response**: 
- Status: `403 Forbidden`
- Body: Error indicating insufficient privileges

#### Test Case 5.1.3: Admin Attempting Owner-Only Functions
```bash
curl -X GET http://localhost:5001/admin/platform/super-admin-settings \
  -H "Cookie: accessToken=<admin-jwt-token>"
```
**Expected Response**: 
- Status: `403 Forbidden`
- Body: Error indicating insufficient privileges

---

## 6. 🔒 Security Tests

### 6.1 Rate Limiting Tests

#### Test Case 6.1.1: Login Rate Limiting
```bash
# Attempt 6 rapid login requests (limit is 5 per 15 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "wrong@email.com", "password": "wrongpass"}' \
    -w "\nStatus: %{http_code}\n"
done
```
**Expected Response**: 
- First 5 requests: `401 Unauthorized`
- 6th request: `429 Too Many Requests`

#### Test Case 6.1.2: Admin Login Rate Limiting
```bash
# Attempt 4 rapid admin login requests (limit is 3 per 15 minutes)
for i in {1..4}; do
  curl -X POST http://localhost:5001/api/auth/admin-login \
    -H "Content-Type: application/json" \
    -d '{"email": "wrong@email.com", "password": "wrongpass"}' \
    -w "\nStatus: %{http_code}\n"
done
```
**Expected Response**: 
- First 3 requests: `401 Unauthorized`
- 4th request: `429 Too Many Requests`

### 6.2 Session Security Tests

#### Test Case 6.2.1: Cookie Security Attributes
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@testfirm.com", "password": "SecureUserPass123!"}' \
  -v
```
**Expected Response**: 
- Cookies should have `HttpOnly`, `Secure` (in production), `SameSite` attributes
- Example: `Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict`

#### Test Case 6.2.2: Token Expiration Enforcement
```bash
# Wait for token expiration (15 minutes) or manually create expired token
curl -X GET http://localhost:5001/api/auth/session \
  -H "Cookie: accessToken=<expired-token>"
```
**Expected Response**: 
- Status: `401 Unauthorized`
- Expired tokens should be rejected

---

## 7. 📝 Test Automation Script

Create a comprehensive test script to run all tests:

```javascript
// test-auth-routes.js
const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:5001';
const testCredentials = {
  owner: {
    email: "owner@firmsync.com",
    password: "SecureOwnerPass123!",
    masterKey: "xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="
  },
  admin: {
    email: "admin@testfirm.com", 
    password: "SecureAdminPass123!"
  },
  tenant: {
    email: "user@testfirm.com",
    password: "SecureUserPass123!"
  }
};

async function runAuthTests() {
  console.log('🧪 Starting Authentication Routes Test Suite...\n');
  
  // Test 1: Owner Login
  console.log('1. Testing Owner Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/owner-login`, testCredentials.owner);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    console.log('✅ Owner login successful');
  } catch (error) {
    console.log('❌ Owner login failed:', error.response?.data || error.message);
  }
  
  // Test 2: Admin Login
  console.log('2. Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, testCredentials.admin);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    console.log('✅ Admin login successful');
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
  }
  
  // Test 3: Tenant Login
  console.log('3. Testing Tenant Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, testCredentials.tenant);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    console.log('✅ Tenant login successful');
  } catch (error) {
    console.log('❌ Tenant login failed:', error.response?.data || error.message);
  }
  
  // Test 4: Invalid Master Key
  console.log('4. Testing Invalid Master Key...');
  try {
    const invalidOwner = { ...testCredentials.owner, masterKey: 'invalid-key' };
    await axios.post(`${BASE_URL}/api/auth/owner-login`, invalidOwner);
    console.log('❌ Should have failed with invalid master key');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Invalid master key properly rejected');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // Test 5: Session Validation
  console.log('5. Testing Session Validation...');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/session`);
    // Should fail without authentication
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthenticated session validation properly rejected');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  console.log('\n🎯 Test Suite Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAuthTests().catch(console.error);
}

module.exports = { runAuthTests };
```

---

## 8. ✅ Test Checklist

### Pre-Test Setup
- [ ] Environment variables configured
- [ ] Database seeded with test users
- [ ] Server running on port 5001
- [ ] Test credentials verified

### Owner Tests
- [ ] Valid owner login succeeds
- [ ] Missing master key rejected
- [ ] Invalid master key rejected  
- [ ] Non-super-admin user rejected
- [ ] Owner can access platform admin routes

### Admin Tests
- [ ] Valid admin login succeeds
- [ ] Non-admin user rejected
- [ ] Invalid credentials rejected
- [ ] Admin can access admin routes
- [ ] Tenant isolation enforced

### Tenant Tests
- [ ] Valid tenant login succeeds
- [ ] Client role redirects correctly
- [ ] Invalid credentials rejected
- [ ] Unregistered user rejected
- [ ] Tenant can access dashboard
- [ ] Cross-tenant access blocked

### Session Management
- [ ] Session validation works
- [ ] Expired tokens rejected
- [ ] No auth properly handled
- [ ] Token refresh works
- [ ] Invalid refresh token rejected
- [ ] Logout clears all auth

### Security Tests
- [ ] Rate limiting enforced
- [ ] Cookies have security attributes
- [ ] Token expiration enforced
- [ ] Cross-role access blocked

### Error Handling
- [ ] All error responses include proper status codes
- [ ] Error messages are informative but not exposing
- [ ] Consistent error response format

---

## 9. 🚀 Running the Tests

### Manual Testing
1. Start the server: `npm start`
2. Use curl commands from each test case
3. Verify responses match expected results

### Automated Testing
1. Install dependencies: `npm install axios`
2. Run test script: `node test-auth-routes.js`
3. Review test results

### Continuous Integration
Add to your CI/CD pipeline:
```yaml
- name: Run Authentication Tests
  run: |
    npm start &
    sleep 10  # Wait for server to start
    node test-auth-routes.js
    pkill -f "npm start"  # Stop server
```

This comprehensive test plan ensures that your new unified `authController.js` is properly connected to all routes and enforces the correct access control for Owner, Admin, and Tenant roles.
