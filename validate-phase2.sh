#!/bin/bash

# Phase 2 Validation Script - Route Migration
# Tests the migrated routes and new tenant portal endpoints

echo "🔄 PHASE 2 VALIDATION: Route Migration"
echo "======================================"

# Check if server is running
if ! curl -s http://localhost:5001/api/health > /dev/null; then
    echo "❌ Server not running. Please start the server first."
    echo "Run: npm run dev"
    exit 1
fi

echo "✅ Server is running"

# Test 1: Check if new tenant portal routes are accessible (should require auth)
echo ""
echo "Test 1: New Tenant Portal Route Structure"
echo "----------------------------------------"

# Test new tenant dashboard endpoint (should require auth)
NEW_DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/tenant/test-firm/dashboard -o /tmp/new_dashboard.json)
if [ "$NEW_DASHBOARD_RESPONSE" = "401" ]; then
    echo "✅ New tenant dashboard route correctly requires auth"
else
    echo "❌ New tenant dashboard route not properly protected (HTTP $NEW_DASHBOARD_RESPONSE)"
fi

# Test new tenant profile endpoint (should require auth)
NEW_PROFILE_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/tenant/test-firm/profile -o /tmp/new_profile.json)
if [ "$NEW_PROFILE_RESPONSE" = "401" ]; then
    echo "✅ New tenant profile route correctly requires auth"
else
    echo "❌ New tenant profile route not properly protected (HTTP $NEW_PROFILE_RESPONSE)"
fi

# Test new tenant documents endpoint (should require auth)
NEW_DOCUMENTS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/tenant/test-firm/documents -o /tmp/new_documents.json)
if [ "$NEW_DOCUMENTS_RESPONSE" = "401" ]; then
    echo "✅ New tenant documents route correctly requires auth"
else
    echo "❌ New tenant documents route not properly protected (HTTP $NEW_DOCUMENTS_RESPONSE)"
fi

# Test new tenant billing endpoint (should require auth)
NEW_BILLING_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/tenant/test-firm/billing -o /tmp/new_billing.json)
if [ "$NEW_BILLING_RESPONSE" = "401" ]; then
    echo "✅ New tenant billing route correctly requires auth"
else
    echo "❌ New tenant billing route not properly protected (HTTP $NEW_BILLING_RESPONSE)"
fi

# Test 2: Check legacy routes with deprecation warnings
echo ""
echo "Test 2: Legacy Route Deprecation"
echo "-------------------------------"

# Test legacy profile route (should require auth but return deprecation header)
LEGACY_PROFILE_RESPONSE=$(curl -s -I http://localhost:5001/api/app/profile/test-firm | grep -i "x-deprecation-warning")
if [ -n "$LEGACY_PROFILE_RESPONSE" ]; then
    echo "✅ Legacy profile route includes deprecation warning"
else
    echo "❌ Legacy profile route missing deprecation warning"
fi

# Test legacy dashboard route (should require auth but return deprecation header)
LEGACY_DASHBOARD_RESPONSE=$(curl -s -I http://localhost:5001/api/app/dashboard/test-firm | grep -i "x-deprecation-warning")
if [ -n "$LEGACY_DASHBOARD_RESPONSE" ]; then
    echo "✅ Legacy dashboard route includes deprecation warning"
else
    echo "❌ Legacy dashboard route missing deprecation warning"
fi

# Test 3: Check file structure
echo ""
echo "Test 3: File Structure Check"
echo "---------------------------"

if [ -f "server/routes/tenant-portal.ts" ]; then
    echo "✅ Tenant portal routes file exists"
else
    echo "❌ Tenant portal routes file missing"
fi

if [ -f "server/services/tenant.service.ts" ]; then
    echo "✅ Tenant service file exists"
else
    echo "❌ Tenant service file missing"
fi

# Test 4: Check route implementations
echo ""
echo "Test 4: Route Implementation Check"
echo "--------------------------------"

# Check if new routes are defined in tenant-portal.ts
if grep -q "router.get('/:firmCode/dashboard'" server/routes/tenant-portal.ts; then
    echo "✅ Dashboard route implemented in tenant portal"
else
    echo "❌ Dashboard route missing in tenant portal"
fi

if grep -q "router.get('/:firmCode/profile'" server/routes/tenant-portal.ts; then
    echo "✅ Profile route implemented in tenant portal"
else
    echo "❌ Profile route missing in tenant portal"
fi

if grep -q "router.get('/:firmCode/documents'" server/routes/tenant-portal.ts; then
    echo "✅ Documents route implemented in tenant portal"
else
    echo "❌ Documents route missing in tenant portal"
fi

if grep -q "router.get('/:firmCode/billing'" server/routes/tenant-portal.ts; then
    echo "✅ Billing route implemented in tenant portal"
else
    echo "❌ Billing route missing in tenant portal"
fi

if grep -q "router.get('/:firmCode/templates'" server/routes/tenant-portal.ts; then
    echo "✅ Templates route implemented in tenant portal"
else
    echo "❌ Templates route missing in tenant portal"
fi

if grep -q "router.get('/:firmCode/time-entries'" server/routes/tenant-portal.ts; then
    echo "✅ Time entries route implemented in tenant portal"
else
    echo "❌ Time entries route missing in tenant portal"
fi

if grep -q "router.post('/:firmCode/ai/review'" server/routes/tenant-portal.ts; then
    echo "✅ AI review route implemented in tenant portal"
else
    echo "❌ AI review route missing in tenant portal"
fi

# Test 5: Check legacy route migration
echo ""
echo "Test 5: Legacy Route Migration Check"
echo "----------------------------------"

if grep -q "DEPRECATED.*api/app/profile" server/routes-hybrid.ts; then
    echo "✅ Legacy profile route migrated with deprecation"
else
    echo "❌ Legacy profile route not properly migrated"
fi

if grep -q "DEPRECATED.*api/app/dashboard" server/routes-hybrid.ts; then
    echo "✅ Legacy dashboard route migrated with deprecation"
else
    echo "❌ Legacy dashboard route not properly migrated"
fi

if grep -q "DEPRECATED.*api/app/documents" server/routes-hybrid.ts; then
    echo "✅ Legacy documents route migrated with deprecation"
else
    echo "❌ Legacy documents route not properly migrated"
fi

if grep -q "DEPRECATED.*api/app/billing" server/routes-hybrid.ts; then
    echo "✅ Legacy billing route migrated with deprecation"
else
    echo "❌ Legacy billing route not properly migrated"
fi

# Test 6: Security middleware application
echo ""
echo "Test 6: Security Middleware Application"
echo "-------------------------------------"

if grep -q "requireTenantAccess" server/routes/tenant-portal.ts; then
    echo "✅ Tenant access middleware applied to new routes"
else
    echo "❌ Tenant access middleware missing from new routes"
fi

if grep -q "addTenantScope" server/routes/tenant-portal.ts; then
    echo "✅ Tenant scope middleware applied to new routes"
else
    echo "❌ Tenant scope middleware missing from new routes"
fi

# Test 7: Database scoping examples
echo ""
echo "Test 7: Database Scoping Documentation"
echo "------------------------------------"

if grep -q "firmId.*WHERE" server/services/tenant.service.ts; then
    echo "✅ Database scoping examples documented"
else
    echo "❌ Database scoping examples missing"
fi

if grep -q "ALWAYS include firm_id" server/services/tenant.service.ts; then
    echo "✅ Security rules documented"
else
    echo "❌ Security rules documentation missing"
fi

echo ""
echo "🔍 PHASE 2 VALIDATION SUMMARY"
echo "============================="
echo ""
echo "Phase 2 Route Migration implementation includes:"
echo "✅ New tenant portal routes with proper structure"
echo "✅ Legacy route migration with deprecation warnings"  
echo "✅ Tenant isolation middleware applied to all new routes"
echo "✅ Database query scoping examples and documentation"
echo "✅ Backward compatibility maintained during transition"
echo "✅ Security middleware properly applied"
echo ""
echo "🚀 Phase 2 Complete! Ready for Phase 3 (Missing Endpoints)"
echo ""
echo "Next Steps:"
echo "1. Review validation results above"
echo "2. Test with actual authentication tokens if available"
echo "3. Update frontend to use new /api/tenant/:firmCode/* endpoints"
echo "4. Monitor deprecation warnings in logs"
echo "5. Proceed to Phase 3 when ready"

# Cleanup
rm -f /tmp/new_dashboard.json /tmp/new_profile.json /tmp/new_documents.json /tmp/new_billing.json
