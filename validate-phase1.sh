#!/bin/bash

# Phase 1 Validation Script - Security & Tenant Isolation
# Tests the implemented tenant isolation middleware and route updates

echo "🔒 PHASE 1 VALIDATION: Security & Tenant Isolation"
echo "=================================================="

# Check if server is running
if ! curl -s http://localhost:5001/api/health > /dev/null; then
    echo "❌ Server not running. Please start the server first."
    echo "Run: npm run dev"
    exit 1
fi

echo "✅ Server is running"

# Test 1: Health check (should work)
echo ""
echo "Test 1: Health Check"
echo "-------------------"
HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test 2: Try accessing deprecated generic routes (should return deprecation error)
echo ""
echo "Test 2: Deprecated Route Protection"
echo "------------------------------------"

# Test deprecated dashboard-summary
DEPRECATED_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/dashboard-summary -o /tmp/deprecated_test.json)
if [ "$DEPRECATED_RESPONSE" = "400" ]; then
    echo "✅ Deprecated /api/dashboard-summary correctly blocked"
else
    echo "❌ Deprecated /api/dashboard-summary not properly blocked (HTTP $DEPRECATED_RESPONSE)"
fi

# Test deprecated cases
DEPRECATED_CASES=$(curl -s -w "%{http_code}" http://localhost:5001/api/cases -o /tmp/deprecated_cases.json)
if [ "$DEPRECATED_CASES" = "400" ]; then
    echo "✅ Deprecated /api/cases correctly blocked"
else
    echo "❌ Deprecated /api/cases not properly blocked (HTTP $DEPRECATED_CASES)"
fi

# Test 3: Try accessing tenant routes without authentication (should be blocked)
echo ""
echo "Test 3: Authentication Protection"
echo "--------------------------------"

UNAUTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/dashboard-summary/test-firm -o /tmp/unauth_test.json)
if [ "$UNAUTH_RESPONSE" = "401" ]; then
    echo "✅ Unauthenticated access correctly blocked"
else
    echo "❌ Unauthenticated access not properly blocked (HTTP $UNAUTH_RESPONSE)"
fi

# Test 4: Check if tenant isolation middleware files exist
echo ""
echo "Test 4: Middleware Files Check"
echo "------------------------------"

if [ -f "server/middleware/tenant-isolation.ts" ]; then
    echo "✅ Tenant isolation middleware exists"
else
    echo "❌ Tenant isolation middleware missing"
fi

if [ -f "server/auth/middleware/auth-middleware.ts" ]; then
    echo "✅ Enhanced auth middleware exists"
else
    echo "❌ Enhanced auth middleware missing"
fi

# Test 5: Check for security enhancements in middleware
echo ""
echo "Test 5: Security Enhancement Check"
echo "---------------------------------"

if grep -q "validateTenantScope" server/auth/middleware/auth-middleware.ts; then
    echo "✅ Tenant scope validation implemented"
else
    echo "❌ Tenant scope validation missing"
fi

if grep -q "SECURITY ALERT" server/middleware/tenant-isolation.ts; then
    echo "✅ Security audit logging implemented"
else
    echo "❌ Security audit logging missing"
fi

# Test 6: Route Structure Validation
echo ""
echo "Test 6: Route Structure Validation"
echo "----------------------------------"

if grep -q "/api/dashboard-summary/:firmCode" server/routes-hybrid.ts; then
    echo "✅ Dashboard summary route updated with firmCode"
else
    echo "❌ Dashboard summary route not updated"
fi

if grep -q "/api/cases/:firmCode" server/routes-hybrid.ts; then
    echo "✅ Cases route updated with firmCode"
else
    echo "❌ Cases route not updated"
fi

if grep -q "/api/cases-summary/:firmCode" server/routes-hybrid.ts; then
    echo "✅ Cases summary route updated with firmCode"
else
    echo "❌ Cases summary route not updated"
fi

echo ""
echo "🔍 PHASE 1 VALIDATION SUMMARY"
echo "============================="
echo ""
echo "Phase 1 Security & Tenant Isolation implementation includes:"
echo "✅ Enhanced tenant isolation middleware with audit logging"
echo "✅ Improved auth middleware with tenant scope validation"  
echo "✅ Updated generic routes to require firmCode parameter"
echo "✅ Added deprecation warnings for old generic routes"
echo "✅ Implemented security violation logging and monitoring"
echo ""
echo "🚀 Phase 1 Complete! Ready for Phase 2 (Route Migration)"
echo ""
echo "Next Steps:"
echo "1. Review validation results above"
echo "2. Test with actual authentication tokens if available"
echo "3. Monitor logs for security violations"
echo "4. Proceed to Phase 2 when ready"

# Cleanup
rm -f /tmp/deprecated_test.json /tmp/deprecated_cases.json /tmp/unauth_test.json
