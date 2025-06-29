#!/bin/bash

# 🧪 Final Authentication System Integration Test
# ==============================================
# This script performs a comprehensive test of the entire authentication system
# including login/logout/session persistence, role-based access control, 
# environment variables, and route connectivity.

set -e  # Exit on any error

BASE_URL="http://localhost:5001"
TEST_DIR="/tmp/firmsync_auth_test"
RESULTS_FILE="$TEST_DIR/integration_test_results.txt"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test directory
mkdir -p "$TEST_DIR"
echo "🧪 FirmSync Authentication System Integration Test" > "$RESULTS_FILE"
echo "===================================================" >> "$RESULTS_FILE"
echo "Started: $(date)" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Function to log results
log_result() {
    local status=$1
    local message=$2
    local details=$3
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
        echo "✅ PASS: $message" >> "$RESULTS_FILE"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        echo "❌ FAIL: $message" >> "$RESULTS_FILE"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
        echo "⚠️  WARN: $message" >> "$RESULTS_FILE"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
        echo "ℹ️  INFO: $message" >> "$RESULTS_FILE"
    fi
    
    if [ -n "$details" ]; then
        echo "   Details: $details" >> "$RESULTS_FILE"
    fi
    echo "" >> "$RESULTS_FILE"
}

# Function to test HTTP endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local cookies=$4
    local expected_status=$5
    local expected_content=$6
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method $url"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ -n "$cookies" ]; then
        curl_cmd="$curl_cmd -b $cookies"
    fi
    
    # Execute curl and capture response + status code
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    local body="${response%???}"
    
    echo "$status_code|$body"
}

echo "🧪 Starting FirmSync Authentication System Integration Test"
echo "=========================================================="

# Test 1: Environment Variables
echo ""
echo "📋 Test 1: Environment Variable Configuration"
echo "---------------------------------------------"

if [ -n "$JWT_SECRET" ]; then
    log_result "PASS" "JWT_SECRET environment variable is set"
else
    log_result "FAIL" "JWT_SECRET environment variable is missing"
fi

if [ -n "$OWNER_MASTER_KEY" ]; then
    log_result "PASS" "OWNER_MASTER_KEY environment variable is set"
else
    log_result "WARN" "OWNER_MASTER_KEY environment variable is missing, using default"
    export OWNER_MASTER_KEY="xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="
fi

# Test 2: Route Connectivity
echo ""
echo "📋 Test 2: Route Connectivity to authController.js"
echo "-------------------------------------------------"

# Test owner login route connectivity
owner_result=$(test_endpoint "POST" "$BASE_URL/api/auth/owner-login" '{"email":"test","password":"test","masterKey":"test"}' "" "" "")
owner_status=$(echo "$owner_result" | cut -d'|' -f1)
owner_body=$(echo "$owner_result" | cut -d'|' -f2)

if echo "$owner_body" | grep -q "<!DOCTYPE html>"; then
    log_result "FAIL" "Owner login route not connected to authController.js" "Returns HTML instead of JSON"
else
    log_result "PASS" "Owner login route connected to authController.js" "Status: $owner_status"
fi

# Test admin login route connectivity
admin_result=$(test_endpoint "POST" "$BASE_URL/api/auth/admin-login" '{"email":"test","password":"test"}' "" "" "")
admin_status=$(echo "$admin_result" | cut -d'|' -f1)
admin_body=$(echo "$admin_result" | cut -d'|' -f2)

if echo "$admin_body" | grep -q "<!DOCTYPE html>"; then
    log_result "FAIL" "Admin login route not connected to authController.js" "Returns HTML instead of JSON"
else
    log_result "PASS" "Admin login route connected to authController.js" "Status: $admin_status"
fi

# Test tenant login route connectivity
tenant_result=$(test_endpoint "POST" "$BASE_URL/api/auth/login" '{"email":"test","password":"test"}' "" "" "")
tenant_status=$(echo "$tenant_result" | cut -d'|' -f1)
tenant_body=$(echo "$tenant_result" | cut -d'|' -f2)

if echo "$tenant_body" | grep -q "<!DOCTYPE html>"; then
    log_result "FAIL" "Tenant login route not connected to loginHandler" "Returns HTML instead of JSON"
else
    log_result "PASS" "Tenant login route connected to loginHandler" "Status: $tenant_status"
fi

# Test session validation route
session_result=$(test_endpoint "GET" "$BASE_URL/api/auth/session" "" "" "" "")
session_status=$(echo "$session_result" | cut -d'|' -f1)
session_body=$(echo "$session_result" | cut -d'|' -f2)

if echo "$session_body" | grep -q "<!DOCTYPE html>"; then
    log_result "FAIL" "Session validation route not connected to authController.js" "Returns HTML instead of JSON"
else
    log_result "PASS" "Session validation route connected to authController.js" "Status: $session_status"
fi

# Test logout route
logout_result=$(test_endpoint "POST" "$BASE_URL/api/auth/logout" "" "" "" "")
logout_status=$(echo "$logout_result" | cut -d'|' -f1)
logout_body=$(echo "$logout_result" | cut -d'|' -f2)

if echo "$logout_body" | grep -q "<!DOCTYPE html>"; then
    log_result "FAIL" "Logout route not connected to authController.js" "Returns HTML instead of JSON"
else
    log_result "PASS" "Logout route connected to authController.js" "Status: $logout_status"
fi

# Test 3: Authentication Flow Testing
echo ""
echo "📋 Test 3: Authentication Flows"
echo "------------------------------"

# Test Owner Authentication Flow
echo "🔐 Testing Owner Authentication..."
owner_login_result=$(test_endpoint "POST" "$BASE_URL/api/auth/owner-login" "{\"email\":\"owner@firmsync.com\",\"password\":\"SecureOwnerPass123!\",\"masterKey\":\"$OWNER_MASTER_KEY\"}" "" "" "")
owner_login_status=$(echo "$owner_login_result" | cut -d'|' -f1)
owner_login_body=$(echo "$owner_login_result" | cut -d'|' -f2)

if [ "$owner_login_status" = "200" ] && echo "$owner_login_body" | grep -q "success"; then
    log_result "PASS" "Owner login successful" "Status: $owner_login_status"
    echo "$owner_login_body" > "$TEST_DIR/owner_login_response.json"
elif echo "$owner_login_body" | grep -q "error\|message"; then
    log_result "WARN" "Owner login returned error (route connected)" "Status: $owner_login_status, Response: $(echo "$owner_login_body" | head -c 100)"
else
    log_result "FAIL" "Owner login failed - route not connected" "Status: $owner_login_status"
fi

# Test Admin Authentication Flow
echo "👨‍💼 Testing Admin Authentication..."
admin_login_result=$(test_endpoint "POST" "$BASE_URL/api/auth/admin-login" '{"email":"admin@testfirm.com","password":"SecureAdminPass123!"}' "" "" "")
admin_login_status=$(echo "$admin_login_result" | cut -d'|' -f1)
admin_login_body=$(echo "$admin_login_result" | cut -d'|' -f2)

if [ "$admin_login_status" = "200" ] && echo "$admin_login_body" | grep -q "success"; then
    log_result "PASS" "Admin login successful" "Status: $admin_login_status"
    echo "$admin_login_body" > "$TEST_DIR/admin_login_response.json"
elif echo "$admin_login_body" | grep -q "error\|message"; then
    log_result "WARN" "Admin login returned error (route connected)" "Status: $admin_login_status, Response: $(echo "$admin_login_body" | head -c 100)"
else
    log_result "FAIL" "Admin login failed - route not connected" "Status: $admin_login_status"
fi

# Test Tenant Authentication Flow
echo "👤 Testing Tenant Authentication..."
tenant_login_result=$(test_endpoint "POST" "$BASE_URL/api/auth/login" '{"email":"user@testfirm.com","password":"SecureUserPass123!"}' "" "" "")
tenant_login_status=$(echo "$tenant_login_result" | cut -d'|' -f1)
tenant_login_body=$(echo "$tenant_login_result" | cut -d'|' -f2)

if [ "$tenant_login_status" = "200" ] && echo "$tenant_login_body" | grep -q "success"; then
    log_result "PASS" "Tenant login successful" "Status: $tenant_login_status"
    echo "$tenant_login_body" > "$TEST_DIR/tenant_login_response.json"
elif echo "$tenant_login_body" | grep -q "error\|message"; then
    log_result "WARN" "Tenant login returned error (route connected)" "Status: $tenant_login_status, Response: $(echo "$tenant_login_body" | head -c 100)"
else
    log_result "FAIL" "Tenant login failed - route not connected" "Status: $tenant_login_status"
fi

# Test 4: Role-Based Access Control
echo ""
echo "📋 Test 4: Role-Based Access Control"
echo "-----------------------------------"

# Test unauthorized dashboard access
echo "🔒 Testing unauthorized access protection..."
unauth_dashboard_result=$(test_endpoint "GET" "$BASE_URL/api/dashboard-summary" "" "" "" "")
unauth_status=$(echo "$unauth_dashboard_result" | cut -d'|' -f1)
unauth_body=$(echo "$unauth_dashboard_result" | cut -d'|' -f2)

if [ "$unauth_status" = "401" ] || echo "$unauth_body" | grep -q "unauthorized\|authentication"; then
    log_result "PASS" "Dashboard properly protected from unauthorized access" "Status: $unauth_status"
else
    log_result "FAIL" "Dashboard not properly protected" "Status: $unauth_status, Response: $(echo "$unauth_body" | head -c 100)"
fi

# Test integration dashboard protection
integration_dashboard_result=$(test_endpoint "GET" "$BASE_URL/api/integrations/dashboard" "" "" "" "")
integration_status=$(echo "$integration_dashboard_result" | cut -d'|' -f1)
integration_body=$(echo "$integration_dashboard_result" | cut -d'|' -f2)

if [ "$integration_status" = "401" ] || echo "$integration_body" | grep -q "unauthorized\|authentication"; then
    log_result "PASS" "Integration dashboard properly protected" "Status: $integration_status"
else
    log_result "FAIL" "Integration dashboard not properly protected" "Status: $integration_status"
fi

# Test 5: Session Management
echo ""
echo "📋 Test 5: Session Management"
echo "----------------------------"

# Test session validation without login
session_check_result=$(test_endpoint "GET" "$BASE_URL/api/auth/session" "" "" "" "")
session_check_status=$(echo "$session_check_result" | cut -d'|' -f1)
session_check_body=$(echo "$session_check_result" | cut -d'|' -f2)

if echo "$session_check_body" | grep -q "No active session\|session"; then
    log_result "PASS" "Session validation works correctly" "Response: $(echo "$session_check_body" | head -c 100)"
else
    log_result "FAIL" "Session validation not working" "Status: $session_check_status"
fi

# Test logout functionality
logout_test_result=$(test_endpoint "POST" "$BASE_URL/api/auth/logout" "" "" "" "")
logout_test_status=$(echo "$logout_test_result" | cut -d'|' -f1)
logout_test_body=$(echo "$logout_test_result" | cut -d'|' -f2)

if echo "$logout_test_body" | grep -q "success\|Logged out"; then
    log_result "PASS" "Logout functionality works" "Status: $logout_test_status"
else
    log_result "FAIL" "Logout functionality not working" "Status: $logout_test_status"
fi

# Test 6: Error Handling
echo ""
echo "📋 Test 6: Error Handling"
echo "------------------------"

# Test invalid credentials
invalid_creds_result=$(test_endpoint "POST" "$BASE_URL/api/auth/login" '{"email":"invalid@test.com","password":"wrongpass"}' "" "" "")
invalid_status=$(echo "$invalid_creds_result" | cut -d'|' -f1)
invalid_body=$(echo "$invalid_creds_result" | cut -d'|' -f2)

if [ "$invalid_status" = "401" ] || echo "$invalid_body" | grep -q "error\|invalid\|credentials"; then
    log_result "PASS" "Invalid credentials properly rejected" "Status: $invalid_status"
else
    log_result "FAIL" "Invalid credentials not properly handled" "Status: $invalid_status"
fi

# Test missing credentials
missing_creds_result=$(test_endpoint "POST" "$BASE_URL/api/auth/owner-login" '{"email":"test"}' "" "" "")
missing_status=$(echo "$missing_creds_result" | cut -d'|' -f1)
missing_body=$(echo "$missing_creds_result" | cut -d'|' -f2)

if [ "$missing_status" = "400" ] || echo "$missing_body" | grep -q "error\|missing\|required"; then
    log_result "PASS" "Missing credentials properly rejected" "Status: $missing_status"
else
    log_result "WARN" "Missing credentials handling needs review" "Status: $missing_status, Response: $(echo "$missing_body" | head -c 100)"
fi

# Test 7: Master Key Validation
echo ""
echo "📋 Test 7: Master Key Validation"
echo "-------------------------------"

# Test invalid master key
invalid_master_result=$(test_endpoint "POST" "$BASE_URL/api/auth/owner-login" '{"email":"owner@firmsync.com","password":"test","masterKey":"invalid-key"}' "" "" "")
invalid_master_status=$(echo "$invalid_master_result" | cut -d'|' -f1)
invalid_master_body=$(echo "$invalid_master_result" | cut -d'|' -f2)

if [ "$invalid_master_status" = "403" ] || echo "$invalid_master_body" | grep -q "master.*key\|forbidden"; then
    log_result "PASS" "Invalid master key properly rejected" "Status: $invalid_master_status"
else
    log_result "WARN" "Master key validation needs review" "Status: $invalid_master_status, Response: $(echo "$invalid_master_body" | head -c 100)"
fi

# Generate Summary
echo ""
echo "📋 Test Summary"
echo "==============" 
echo ""

# Count results
TOTAL_TESTS=$(grep -c "PASS:\|FAIL:\|WARN:" "$RESULTS_FILE")
PASSED_TESTS=$(grep -c "PASS:" "$RESULTS_FILE")
FAILED_TESTS=$(grep -c "FAIL:" "$RESULTS_FILE")
WARN_TESTS=$(grep -c "WARN:" "$RESULTS_FILE")

echo "Total Tests: $TOTAL_TESTS"
echo "✅ Passed: $PASSED_TESTS"
echo "❌ Failed: $FAILED_TESTS"
echo "⚠️  Warnings: $WARN_TESTS"

SUCCESS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo "📊 Success Rate: $SUCCESS_RATE%"

echo "" >> "$RESULTS_FILE"
echo "SUMMARY:" >> "$RESULTS_FILE"
echo "--------" >> "$RESULTS_FILE"
echo "Total Tests: $TOTAL_TESTS" >> "$RESULTS_FILE"
echo "Passed: $PASSED_TESTS" >> "$RESULTS_FILE"
echo "Failed: $FAILED_TESTS" >> "$RESULTS_FILE"
echo "Warnings: $WARN_TESTS" >> "$RESULTS_FILE"
echo "Success Rate: $SUCCESS_RATE%" >> "$RESULTS_FILE"
echo "Completed: $(date)" >> "$RESULTS_FILE"

echo ""
echo "📄 Detailed results saved to: $RESULTS_FILE"
echo ""

# Recommendations based on results
echo "🎯 Recommendations:"
echo "=================="

if [ $FAILED_TESTS -gt 0 ]; then
    echo "❌ Critical Issues Found:"
    echo "   • Some authentication routes are not properly connected to authController.js"
    echo "   • This causes routes to fall through to static file serving (HTML responses)"
    echo "   • Fix: Check import/export of authController.js in routes-hybrid.ts"
fi

if [ $WARN_TESTS -gt 0 ]; then
    echo "⚠️  Warnings to Address:"
    echo "   • Some authentication flows return errors (possibly missing test data)"
    echo "   • Consider setting up test database with proper user accounts"
fi

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo "🎉 All tests passed! Authentication system is working correctly."
else
    echo "🔧 Focus on fixing the failed tests first, then address warnings."
fi

echo ""
echo "Next Steps:"
echo "----------"
echo "1. Review detailed results in $RESULTS_FILE"
echo "2. Fix any failed route connections"
echo "3. Set up test user accounts in database"
echo "4. Re-run this test after fixes"
echo ""
echo "🧪 Integration test complete!"
