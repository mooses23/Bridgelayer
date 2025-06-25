#!/bin/bash

BASE_URL="http://localhost:5001"
OWNER_MASTER_KEY="${OWNER_MASTER_KEY:-xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI=}"

echo "🧪 Testing Authentication Routes Connected to authController.js"
echo "================================================================"

# Test 1: Owner Login
echo "🔐 Testing Owner Login Route Connection..."
OWNER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/owner-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"owner@firmsync.com\",\"password\":\"test\",\"masterKey\":\"$OWNER_MASTER_KEY\"}")

if echo "$OWNER_RESPONSE" | grep -q "success\|error\|message"; then
  echo "✅ Owner login route connected to authController.loginOwner"
  echo "   Response: $(echo "$OWNER_RESPONSE" | head -c 100)..."
else
  echo "❌ Owner login route NOT connected (returning HTML/static content)"
fi

# Test 2: Admin Login
echo ""
echo "👨‍💼 Testing Admin Login Route Connection..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@testfirm.com\",\"password\":\"test\"}")

if echo "$ADMIN_RESPONSE" | grep -q "success\|error\|message"; then
  echo "✅ Admin login route connected to authController.loginAdmin"
  echo "   Response: $(echo "$ADMIN_RESPONSE" | head -c 100)..."
else
  echo "❌ Admin login route NOT connected (returning HTML/static content)"
fi

# Test 3: Tenant Login
echo ""
echo "👤 Testing Tenant Login Route Connection..."
TENANT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@testfirm.com\",\"password\":\"test\"}")

if echo "$TENANT_RESPONSE" | grep -q "success\|error\|message"; then
  echo "✅ Tenant login route connected to loginHandler"
  echo "   Response: $(echo "$TENANT_RESPONSE" | head -c 100)..."
else
  echo "❌ Tenant login route NOT connected (returning HTML/static content)"
fi

# Test 4: Session Validation
echo ""
echo "🔍 Testing Session Validation Route Connection..."
SESSION_RESPONSE=$(curl -s -X GET $BASE_URL/api/auth/session)

if echo "$SESSION_RESPONSE" | grep -q "success\|error\|message\|session\|user"; then
  echo "✅ Session validation route connected to authController.validateSession"
  echo "   Response: $(echo "$SESSION_RESPONSE" | head -c 100)..."
else
  echo "❌ Session validation route NOT connected (returning HTML/static content)"
fi

# Test 5: Logout Route
echo ""
echo "🚪 Testing Logout Route Connection..."
LOGOUT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/logout)

if echo "$LOGOUT_RESPONSE" | grep -q "success\|error\|message"; then
  echo "✅ Logout route connected to authController.logout"
  echo "   Response: $(echo "$LOGOUT_RESPONSE" | head -c 100)..."
else
  echo "❌ Logout route NOT connected (returning HTML/static content)"
fi

# Test 6: Dashboard Access (should require auth)
echo ""
echo "🔒 Testing Protected Dashboard Routes..."
DASHBOARD_RESPONSE=$(curl -s -X GET $BASE_URL/api/dashboard-summary)

if echo "$DASHBOARD_RESPONSE" | grep -q "error\|unauthorized\|authentication\|login"; then
  echo "✅ Dashboard route properly protected (requires authentication)"
else
  echo "❌ Dashboard route not properly protected: $DASHBOARD_RESPONSE"
fi

# Test 7: Integration Dashboard Access
echo ""
echo "🔒 Testing Protected Integration Dashboard..."
INTEGRATION_RESPONSE=$(curl -s -X GET $BASE_URL/api/integrations/dashboard)

if echo "$INTEGRATION_RESPONSE" | grep -q "error\|unauthorized\|authentication\|login"; then
  echo "✅ Integration dashboard properly protected (requires authentication)"
else
  echo "❌ Integration dashboard not properly protected: $INTEGRATION_RESPONSE"
fi

echo ""
echo "================================================================"
echo "🎯 Route Connection Test Summary:"
echo ""
echo "Expected Results:"
echo "✅ All auth routes should return JSON (not HTML)"
echo "✅ Protected routes should return 401/403 errors when unauthenticated"
echo "❌ If routes return HTML, they're not connected to authController.js"
echo ""
echo "Next Steps:"
echo "1. If routes are connected: Test with valid credentials"
echo "2. If routes return HTML: Fix authController.js import/export issues"
echo "3. Run full test suite in ROUTE_CONNECTION_TEST_PLAN.md"
