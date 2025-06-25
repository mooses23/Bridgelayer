# 🧪 Authentication Testing Guide

This guide helps you test the enhanced authentication routes for both owner and admin login functionality.

## 📋 Prerequisites

1. **Server Running**: Make sure your FirmSync server is running on `http://localhost:3000`
2. **Database Seeded**: Ensure you have test users in your database
3. **Environment Variables**: Configure your environment variables including `JWT_SECRET` and `OWNER_MASTER_KEY`

## 🚀 Quick Start

### 1. Start Your Server
```bash
npm run dev
```

### 2. Test Server Health
```bash
npm run test:auth:quick
```

### 3. Run Comprehensive Tests

**Option A: Node.js Test Suite (Recommended)**
```bash
npm run test:auth
```

**Option B: Shell Script Tests**
```bash
npm run test:auth:shell
```

**Option C: Manual curl commands**
```bash
./test-auth-routes.sh
```

## 📊 Test Coverage

### ✅ Owner Login Tests
- [x] Valid credentials with master key
- [x] Invalid email/password
- [x] Wrong master key
- [x] Missing master key
- [x] Input validation (email format, password length)

### ✅ Admin Login Tests  
- [x] Valid credentials
- [x] Invalid email/password
- [x] Input validation (empty fields, invalid email format)

### ✅ Security Tests
- [x] Rate limiting (prevents brute force attacks)
- [x] JSON response format validation
- [x] Status code verification
- [x] Error response structure
- [x] Token format validation

### ✅ API Health Check
- [x] Service availability
- [x] Feature status verification

## 🔧 Configuration

### Test Credentials Setup

1. **Copy the example configuration:**
```bash
cp .env.test.example .env.test
```

2. **Update with your actual credentials:**
```bash
# Edit .env.test with your test user credentials
OWNER_MASTER_KEY=your-actual-master-key
TEST_OWNER_EMAIL=owner@firmsync.com
TEST_OWNER_PASSWORD=password123
TEST_ADMIN_EMAIL=admin@firmsync.com  
TEST_ADMIN_PASSWORD=admin123
```

3. **Load test environment:**
```bash
source .env.test
```

## 📝 Manual Testing

### Owner Login Endpoint: `POST /api/auth/owner-login`

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "password123", 
    "masterKey": "your-master-key"
  }'
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "message": "Owner login successful",
  "user": {
    "id": 1,
    "email": "owner@firmsync.com",
    "role": "owner",
    "firmId": null,
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": "1h",
  "loginTime": "2025-06-25T10:30:00.000Z",
  "authMethod": "jwt"
}
```

**Invalid Credentials Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS",
  "timestamp": "2025-06-25T10:30:00.000Z"
}
```

### Admin Login Endpoint: `POST /api/auth/admin-login`

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@firmsync.com",
    "password": "admin123"
  }'
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "message": "Admin login successful", 
  "user": {
    "id": 2,
    "email": "admin@firmsync.com",
    "role": "admin",
    "firmId": 1,
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": "1h",
  "loginTime": "2025-06-25T10:30:00.000Z",
  "authMethod": "jwt"
}
```

## 🛡️ Security Features Tested

### 1. Rate Limiting
- **Limit**: 5 attempts per 15 minutes per IP
- **Test**: Make 6+ rapid requests to trigger rate limiting
- **Expected**: 429 status after 5 attempts

### 2. Input Validation
- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Master Key**: Required for owner login

### 3. Response Security
- **Headers**: `Content-Type: application/json`
- **Structure**: Consistent error/success format
- **Tokens**: JWT with proper expiration

## 🐛 Troubleshooting

### Common Issues

**1. Server Not Running**
```
❌ Server is not accessible. Please start the server first.
```
**Solution**: Run `npm run dev` in another terminal

**2. Database Connection Error**
```
❌ Database connection error
```
**Solution**: Check your database is running and `DATABASE_URL` is correct

**3. Invalid Master Key**
```
❌ Invalid master key
```
**Solution**: Set correct `OWNER_MASTER_KEY` in environment variables

**4. Rate Limit Issues**
```
❌ Too many login attempts
```
**Solution**: Wait 15 minutes or restart server (in-memory rate limiting)

### Debug Mode

Run tests with debug output:
```bash
DEBUG=true npm run test:auth
```

## 📈 Test Results Interpretation

### Success Indicators
- ✅ All status codes match expected values
- ✅ JSON responses have correct structure
- ✅ Tokens are generated and valid format
- ✅ User objects contain required fields
- ✅ Rate limiting activates appropriately

### Failure Indicators
- ❌ Wrong status codes (500 instead of 401)
- ❌ HTML responses instead of JSON
- ❌ Missing token or user data
- ❌ Rate limiting not working
- ❌ Invalid error response format

## 🔄 Continuous Testing

### Integration with CI/CD
Add to your `.github/workflows/test.yml`:
```yaml
- name: Test Authentication Routes
  run: |
    npm run dev &
    sleep 5
    npm run test:auth
```

### Pre-deployment Checklist
- [ ] All authentication tests pass
- [ ] Rate limiting is functional
- [ ] Error responses are in JSON format
- [ ] Tokens are properly formatted
- [ ] Input validation works correctly

## 📚 Next Steps

After successful authentication testing:

1. **Test Protected Routes**: Use generated tokens to test protected endpoints
2. **Token Refresh**: Implement and test token refresh functionality  
3. **Session Management**: Test session invalidation and logout
4. **Integration Tests**: Test full authentication flows with frontend
5. **Performance Tests**: Load test authentication endpoints

## 🆘 Support

If you encounter issues with the authentication system:

1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure database has proper test data
4. Confirm all dependencies are installed
5. Review the enhanced authentication controller code

For additional help, refer to the authentication architecture documentation or contact the development team.
