# 🧪 BridgeLayer Platform Authentication Testing

This directory contains comprehensive testing tools for the multi-vertical platform's dual authentication system.

## Platform Testing Overview

BridgeLayer uses a sophisticated three-tier role model with dual authentication (Session + JWT) across multiple industry verticals.

### 🏗️ **Role-Based Testing**
- **Platform Admin**: Firm onboarding, cross-platform access, ghost mode
- **Owner (Bridgelayer)**: Multi-tenant operational management (NO onboarding)  
- **Tenant (Firms)**: Isolated vertical-specific access

### 🌐 **Multi-Vertical Testing**
- **FIRMSYNC** (Legal): Law firm document processing
- **MEDSYNC** (Medical): Healthcare document analysis
- **EDUSYNC** (Education): Educational workflows
- **HRSYNC** (HR): Human resources management

## Test Files

### 📋 `AUTH_ROUTES_TEST_PLAN.md`
Complete test plan documentation with:
- Manual test cases for all authentication routes
- Expected responses and error codes
- Security and edge case testing
- Comprehensive test coverage checklist

### 🤖 `test-auth-routes.js`
Automated test script for full test suite:
```bash
# Install dependencies
npm install axios

# Run full automated test suite
node test-auth-routes.js
```

### ⚡ `quick-auth-test.sh`
Quick manual verification script:
```bash
# Make executable and run
chmod +x quick-auth-test.sh
./quick-auth-test.sh [base_url]

# Example
./quick-auth-test.sh http://localhost:5001
```

## Test Coverage

### ✅ Platform Admin Authentication
- Cross-platform system access
- Firm onboarding via left side nav
- Ghost mode verification (renamed, integrated into admin nav)
- Multi-vertical system configuration

### ✅ Owner (Bridgelayer) Authentication  
- Multi-tenant operational access
- **NO onboarding capabilities** (Admin-exclusive)
- Client relationship management
- Vertical-specific oversight

### ✅ Tenant (Firm) Authentication
- Isolated firm-scoped access
- Vertical-specific document processing
- Role-based permissions within firm
- Cross-tenant access prevention
- Invalid credentials rejection  
- Unregistered user rejection
- Proper role-based redirects

### ✅ Session Management
- Session validation with/without auth
- Token refresh functionality
- Logout and cookie clearing
- Expired token handling

### ✅ Security Features
- Rate limiting enforcement
- CORS configuration
- Security headers
- Error message consistency

## Environment Setup

Ensure these environment variables are configured:
```bash
JWT_SECRET=QW5vdGhlclZlcnlMb25nU2VjdXJlSldUU2VjcmV0MTIzNDU2Nzg5MA==
OWNER_MASTER_KEY=xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI=
```

## Test Database Users

Create test users with these credentials:
```javascript
{
  owner: {
    email: "owner@firmsync.com",
    password: "SecureOwnerPass123!",
    role: "super_admin"
  },
  admin: {
    email: "admin@testfirm.com", 
    password: "SecureAdminPass123!",
    role: "admin" or "platform_admin"
  },
  tenant: {
    email: "user@testfirm.com",
    password: "SecureUserPass123!",
    role: "firm_user"
  },
  client: {
    email: "client@testfirm.com",
    password: "SecureClientPass123!",
    role: "client"
  }
}
```

## CI/CD Integration

Add to your pipeline:
```yaml
- name: Test Authentication Routes
  run: |
    npm start &
    sleep 10  # Wait for server
    node test-auth-routes.js
    pkill -f "npm start"
```

## Expected Results

All tests should pass with:
- Proper status codes (200, 401, 403, etc.)
- Secure cookie handling
- Role-based access control
- Error message consistency
- Rate limiting enforcement

## Troubleshooting

### Server Not Running
```bash
# Start the server first
npm start
# Then run tests in another terminal
```

### Missing Dependencies
```bash
npm install axios assert
```

### Environment Variables
```bash
# Check if .env file exists and has required variables
grep -E "JWT_SECRET|OWNER_MASTER_KEY" .env
```

### Database Connection
```bash
# Ensure database is running and seeded with test users
# Check connection string in .env
```

## Manual Testing with curl

Quick test examples:
```bash
# Health check
curl http://localhost:5001/api/health

# Owner login (should fail with invalid key)
curl -X POST http://localhost:5001/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test","masterKey":"invalid"}'

# Session check (should fail without auth)
curl http://localhost:5001/api/auth/session
```

## Test Results Interpretation

### ✅ Success Indicators
- All login methods work with valid credentials
- Invalid credentials properly rejected
- Rate limiting enforced
- Secure cookies set
- Proper redirects for each role

### ❌ Failure Indicators
- 500 errors (server issues)
- Incorrect status codes
- Missing security headers
- Broken redirects
- Authentication bypass

Run these tests after any authentication-related changes to ensure system integrity!
