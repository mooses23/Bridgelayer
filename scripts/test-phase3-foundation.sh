#!/bin/bash

# Test script for Phase 3 tenant endpoints
# This validates all the foundational CRUD endpoints we've implemented

echo "🧪 Testing Phase 3 Tenant Portal Endpoints..."
echo "=============================================="

BASE_URL="http://localhost:5001"
FIRM_CODE="TEST001"
TENANT_BASE="$BASE_URL/api/tenant/$FIRM_CODE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Helper function to test endpoints
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local description="$5"
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$endpoint")
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s -w "%{http_code}" -X PATCH -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASS++))
        if [ "$method" = "GET" ] && [ -n "$body" ]; then
            echo "   Response: $(echo "$body" | jq -r '.message // .success // "OK"' 2>/dev/null || echo "Response received")"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        ((FAIL++))
        echo "   Response: $body"
    fi
    echo
}

# Check if server is running
echo "Checking if server is running on port 5001..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running on port 5001${NC}"
    echo "Please start the server first with: npx tsx server/test-server.ts"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo

# 1. Test Health Check
echo "1. Health Check Endpoint"
echo "------------------------"
test_endpoint "GET" "$TENANT_BASE/health" "" "200" "Tenant health check"

# 2. Test Dashboard
echo "2. Dashboard Endpoint"
echo "---------------------"
test_endpoint "GET" "$TENANT_BASE/dashboard" "" "200" "Dashboard data retrieval"

# 3. Test Clients CRUD
echo "3. Clients Endpoints"
echo "--------------------"
test_endpoint "GET" "$TENANT_BASE/clients" "" "200" "Get all clients"
test_endpoint "POST" "$TENANT_BASE/clients" '{"name":"John Doe","email":"john@example.com","phone":"555-1234"}' "201" "Create new client"

# 4. Test Cases CRUD
echo "4. Cases Endpoints"
echo "------------------"
test_endpoint "GET" "$TENANT_BASE/cases" "" "200" "Get all cases"
test_endpoint "POST" "$TENANT_BASE/cases" '{"title":"Contract Review","clientId":"client-1","status":"active"}' "201" "Create new case"

# 5. Test Calendar CRUD
echo "5. Calendar Endpoints"
echo "---------------------"
test_endpoint "GET" "$TENANT_BASE/calendar/events" "" "200" "Get calendar events"
test_endpoint "POST" "$TENANT_BASE/calendar/events" '{"title":"Client Meeting","date":"2025-07-07","time":"14:00"}' "201" "Create calendar event"

# 6. Test Tasks CRUD
echo "6. Tasks Endpoints"
echo "------------------"
test_endpoint "GET" "$TENANT_BASE/tasks" "" "200" "Get all tasks"
test_endpoint "POST" "$TENANT_BASE/tasks" '{"title":"Review contract","assignee":"paralegal","dueDate":"2025-07-10"}' "201" "Create new task"

# 7. Test Settings
echo "7. Settings Endpoints"
echo "---------------------"
test_endpoint "GET" "$TENANT_BASE/settings" "" "200" "Get firm settings"
test_endpoint "PATCH" "$TENANT_BASE/settings" '{"firmName":"Updated Test Firm","timezone":"EST"}' "200" "Update firm settings"

# Summary
echo
echo "=============================================="
echo "Test Summary"
echo "=============================================="
echo -e "Total tests: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Phase 3 foundation is working correctly.${NC}"
    echo
    echo "✅ Completed Phase 3 Foundation:"
    echo "   • Health check endpoint"
    echo "   • Dashboard endpoint"
    echo "   • Clients CRUD endpoints"
    echo "   • Cases CRUD endpoints"
    echo "   • Calendar CRUD endpoints"
    echo "   • Tasks CRUD endpoints"
    echo "   • Settings endpoints"
    echo
    echo "🚀 Ready for Phase 3 next steps:"
    echo "   • Add database integration"
    echo "   • Implement authentication middleware"
    echo "   • Add data validation"
    echo "   • Connect to storage layer"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
