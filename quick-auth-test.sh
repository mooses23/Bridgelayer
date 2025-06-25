#!/bin/bash

# Quick Manual Authentication Routes Test
# Usage: ./quick-auth-test.sh [base_url]

BASE_URL=${1:-"http://localhost:5001"}
OWNER_MASTER_KEY="xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI="

echo "🧪 Quick Authentication Routes Test"
echo "📍 Testing against: $BASE_URL"
echo "═══════════════════════════════════"

# Test 1: Health Check
echo -e "\n1️⃣  Testing Health Check..."
curl -s -o /dev/null -w "Status: %{http_code}" "$BASE_URL/api/health"
echo ""

# Test 2: Owner Login (Invalid Master Key)
echo -e "\n2️⃣  Testing Owner Login (Invalid Master Key)..."
curl -s -X POST "$BASE_URL/api/auth/owner-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@firmsync.com",
    "password": "test123",
    "masterKey": "invalid-key"
  }' \
  -w "Status: %{http_code}" \
  -o /dev/null
echo ""

# Test 3: Admin Login (Should fail without valid credentials)
echo -e "\n3️⃣  Testing Admin Login (Invalid Credentials)..."
curl -s -X POST "$BASE_URL/api/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "wrongpassword"
  }' \
  -w "Status: %{http_code}" \
  -o /dev/null
echo ""

# Test 4: Tenant Login (Should fail without valid credentials)
echo -e "\n4️⃣  Testing Tenant Login (Invalid Credentials)..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "wrongpassword"
  }' \
  -w "Status: %{http_code}" \
  -o /dev/null
echo ""

# Test 5: Session Check (No Auth)
echo -e "\n5️⃣  Testing Session Check (No Auth)..."
curl -s -X GET "$BASE_URL/api/auth/session" \
  -w "Status: %{http_code}" \
  -o /dev/null
echo ""

# Test 6: Token Refresh (No Token)
echo -e "\n6️⃣  Testing Token Refresh (No Token)..."
curl -s -X POST "$BASE_URL/api/auth/refresh" \
  -w "Status: %{http_code}" \
  -o /dev/null
echo ""

# Test 7: Logout
echo -e "\n7️⃣  Testing Logout..."
curl -s -X POST "$BASE_URL/api/auth/logout" \
  -w "Status: %{http_code}" \
  -o /dev/null
echo ""

echo -e "\n✅ Quick test complete!"
echo "Expected results:"
echo "  1. Health Check: 200"
echo "  2. Invalid Owner Login: 403"
echo "  3. Invalid Admin Login: 401"
echo "  4. Invalid Tenant Login: 401"
echo "  5. Session Check (No Auth): 401"
echo "  6. Token Refresh (No Token): 401"
echo "  7. Logout: 200"
