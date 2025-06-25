#!/bin/bash

# Comprehensive Authentication Route Testing Script
# Tests both owner and admin login routes with curl commands

set -e  # Exit on any error

# Configuration
BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
API_BASE="$BASE_URL/api/auth"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test credentials (update these based on your test data)
VALID_OWNER_EMAIL="owner@firmsync.com"
VALID_OWNER_PASSWORD="password123"
OWNER_MASTER_KEY="${OWNER_MASTER_KEY:-your-master-key-here}"

VALID_ADMIN_EMAIL="admin@firmsync.com"
VALID_ADMIN_PASSWORD="admin123"

INVALID_EMAIL="fake@example.com"
INVALID_PASSWORD="wrongpassword"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
log_test() {
    echo -e "\n${CYAN}🧪 Testing: $1${NC}"
    ((TESTS_RUN++))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to make HTTP requests and validate responses
test_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local test_name="$5"
    
    echo -e "${BLUE}📡 Making $method request to: $endpoint${NC}"
    
    if [ -n "$data" ]; then
        echo -e "${BLUE}📦 Request data: $data${NC}"
    fi
    
    # Make the request and capture response
    local response
    local status_code
    local content_type
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}\n%{content_type}" "$API_BASE$endpoint" || echo "CURL_ERROR")
    else
        response=$(curl -s -w "\n%{http_code}\n%{content_type}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint" || echo "CURL_ERROR")
    fi
    
    if [ "$response" = "CURL_ERROR" ]; then
        log_failure "$test_name - Request failed (curl error)"
        return 1
    fi
    
    # Parse response
    local response_body=$(echo "$response" | head -n -2)
    status_code=$(echo "$response" | tail -n 2 | head -n 1)
    content_type=$(echo "$response" | tail -n 1)
    
    echo -e "${BLUE}📄 Response body:${NC}"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo -e "${BLUE}📊 Status code: $status_code${NC}"
    echo -e "${BLUE}📋 Content-Type: $content_type${NC}"
    
    # Validate status code
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$test_name - Status code $expected_status"
    else
        log_failure "$test_name - Wrong status code (expected $expected_status, got $status_code)"
        return 1
    fi
    
    # Validate content type
    if [[ "$content_type" == *"application/json"* ]]; then
        log_success "$test_name - Response is JSON format"
    else
        log_failure "$test_name - Response is NOT JSON format (got: $content_type)"
        return 1
    fi
    
    # Validate JSON structure
    if echo "$response_body" | jq '.' >/dev/null 2>&1; then
        log_success "$test_name - Valid JSON structure"
    else
        log_failure "$test_name - Invalid JSON structure"
        return 1
    fi
    
    # Additional validation for success responses
    if [ "$expected_status" = "200" ]; then
        # Check for required fields in success response
        local has_user=$(echo "$response_body" | jq -r '.user // empty')
        local has_token=$(echo "$response_body" | jq -r '.token // empty')
        local has_success=$(echo "$response_body" | jq -r '.success // empty')
        
        if [ -n "$has_user" ] && [ -n "$has_token" ] && [ "$has_success" = "true" ]; then
            log_success "$test_name - Has required success fields (user, token, success)"
        else
            log_failure "$test_name - Missing required success fields"
            return 1
        fi
        
        # Extract and display user role
        local user_role=$(echo "$response_body" | jq -r '.user.role // empty')
        if [ -n "$user_role" ]; then
            log_info "User role: $user_role"
        fi
        
        # Validate token format (should be a non-empty string)
        local token_length=$(echo "$response_body" | jq -r '.token | length')
        if [ "$token_length" -gt 10 ]; then
            log_success "$test_name - Token appears valid (length: $token_length)"
        else
            log_failure "$test_name - Token appears invalid (length: $token_length)"
            return 1
        fi
    fi
    
    # Additional validation for error responses
    if [ "$expected_status" != "200" ]; then
        local has_error=$(echo "$response_body" | jq -r '.error // empty')
        local has_success=$(echo "$response_body" | jq -r '.success // empty')
        
        if [ -n "$has_error" ] && [ "$has_success" = "false" ]; then
            log_success "$test_name - Has required error fields (error, success:false)"
        else
            log_failure "$test_name - Missing required error fields"
            return 1
        fi
    fi
    
    return 0
}

# Test functions
test_health_check() {
    log_test "Health Check"
    test_request "GET" "/health" "" "200" "Health Check"
}

test_owner_login_valid() {
    log_test "Owner Login - Valid Credentials"
    local data="{\"email\":\"$VALID_OWNER_EMAIL\",\"password\":\"$VALID_OWNER_PASSWORD\",\"masterKey\":\"$OWNER_MASTER_KEY\"}"
    test_request "POST" "/owner-login" "$data" "200" "Owner Login Valid"
}

test_owner_login_invalid_credentials() {
    log_test "Owner Login - Invalid Credentials"
    local data="{\"email\":\"$INVALID_EMAIL\",\"password\":\"$INVALID_PASSWORD\",\"masterKey\":\"$OWNER_MASTER_KEY\"}"
    test_request "POST" "/owner-login" "$data" "401" "Owner Login Invalid Credentials"
}

test_owner_login_invalid_master_key() {
    log_test "Owner Login - Invalid Master Key"
    local data="{\"email\":\"$VALID_OWNER_EMAIL\",\"password\":\"$VALID_OWNER_PASSWORD\",\"masterKey\":\"wrong-master-key\"}"
    test_request "POST" "/owner-login" "$data" "403" "Owner Login Invalid Master Key"
}

test_owner_login_missing_master_key() {
    log_test "Owner Login - Missing Master Key"
    local data="{\"email\":\"$VALID_OWNER_EMAIL\",\"password\":\"$VALID_OWNER_PASSWORD\"}"
    test_request "POST" "/owner-login" "$data" "400" "Owner Login Missing Master Key"
}

test_admin_login_valid() {
    log_test "Admin Login - Valid Credentials"
    local data="{\"email\":\"$VALID_ADMIN_EMAIL\",\"password\":\"$VALID_ADMIN_PASSWORD\"}"
    test_request "POST" "/admin-login" "$data" "200" "Admin Login Valid"
}

test_admin_login_invalid() {
    log_test "Admin Login - Invalid Credentials"
    local data="{\"email\":\"$INVALID_EMAIL\",\"password\":\"$INVALID_PASSWORD\"}"
    test_request "POST" "/admin-login" "$data" "401" "Admin Login Invalid"
}

test_input_validation() {
    log_test "Input Validation - Empty Email"
    local data="{\"email\":\"\",\"password\":\"test123\"}"
    test_request "POST" "/admin-login" "$data" "400" "Empty Email Validation"
    
    log_test "Input Validation - Invalid Email Format"
    local data="{\"email\":\"invalid-email\",\"password\":\"test123\"}"
    test_request "POST" "/admin-login" "$data" "400" "Invalid Email Format"
    
    log_test "Input Validation - Short Password"
    local data="{\"email\":\"test@example.com\",\"password\":\"123\"}"
    test_request "POST" "/admin-login" "$data" "400" "Short Password Validation"
    
    log_test "Input Validation - Missing Password"
    local data="{\"email\":\"test@example.com\"}"
    test_request "POST" "/admin-login" "$data" "400" "Missing Password"
}

test_rate_limiting() {
    log_test "Rate Limiting Test"
    log_info "Making multiple rapid requests to test rate limiting..."
    
    local data="{\"email\":\"$INVALID_EMAIL\",\"password\":\"$INVALID_PASSWORD\"}"
    
    # Make 6 rapid requests (should trigger rate limit after 5)
    for i in {1..6}; do
        echo -e "${YELLOW}Request $i:${NC}"
        response=$(curl -s -w "%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE/admin-login")
        
        status_code=$(echo "$response" | tail -c 4)
        echo "Status: $status_code"
        
        if [ "$status_code" = "429" ]; then
            log_success "Rate Limiting - Triggered after $i requests"
            return 0
        fi
        
        sleep 0.1  # Small delay between requests
    done
    
    log_info "Rate Limiting - Not triggered within 6 requests (may need more attempts)"
}

# Main execution
main() {
    echo -e "${CYAN}🚀 Starting Comprehensive Authentication Tests${NC}"
    echo -e "${YELLOW}📍 Base URL: $API_BASE${NC}"
    echo "============================================================"
    
    # Check if server is running
    if ! curl -s "$API_BASE/health" > /dev/null; then
        echo -e "${RED}❌ Server is not accessible. Please start the server first.${NC}"
        echo -e "${RED}   Trying to connect to: $API_BASE${NC}"
        exit 1
    fi
    
    log_success "Server is running and accessible"
    
    # Check if required tools are available
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. JSON validation will be limited."
    fi
    
    # Run all tests
    test_health_check
    test_owner_login_valid
    test_owner_login_invalid_credentials
    test_owner_login_invalid_master_key
    test_owner_login_missing_master_key
    test_admin_login_valid
    test_admin_login_invalid
    test_input_validation
    test_rate_limiting
    
    # Print summary
    echo ""
    echo "============================================================"
    echo -e "${CYAN}📊 TEST SUMMARY${NC}"
    echo "============================================================"
    echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
    echo -e "${BLUE}📈 Total:  $TESTS_RUN${NC}"
    
    if [ $TESTS_RUN -gt 0 ]; then
        local success_rate=$(echo "scale=1; $TESTS_PASSED * 100 / $TESTS_RUN" | bc -l 2>/dev/null || echo "N/A")
        echo -e "${YELLOW}📊 Success Rate: $success_rate%${NC}"
    fi
    
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}💥 Some tests failed. Check the output above for details.${NC}"
        exit 1
    fi
}

# Run the main function
main "$@"
