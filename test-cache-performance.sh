#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== FirmSync Caching Performance Test ===${NC}"

# Test URL - Adjust as needed
BASE_URL="http://localhost:3000"
LOGIN_URL="$BASE_URL/api/auth/login"
USER_URL="$BASE_URL/api/users/me"

# Login credentials
EMAIL="admin@firmsync.com"
PASSWORD="adminPassword123!"

echo -e "${BLUE}Logging in to get auth token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt)

# Check if login was successful
if [[ $LOGIN_RESPONSE == *"\"success\":true"* ]]; then
  echo -e "${GREEN}Login successful${NC}"
else
  echo -e "${RED}Login failed: $LOGIN_RESPONSE${NC}"
  exit 1
fi

# Extract the token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Function to measure response time
measure_time() {
  local url="$1"
  local description="$2"
  local start_time=$(date +%s.%N)
  
  curl -s -X GET "$url" \
    -H "Authorization: Bearer $TOKEN" \
    -b cookies.txt > /dev/null
  
  local end_time=$(date +%s.%N)
  local time_taken=$(echo "$end_time - $start_time" | bc)
  echo -e "${BLUE}$description${NC} took ${GREEN}${time_taken}s${NC}"
  
  echo "$time_taken"
}

echo -e "\n${BLUE}Testing user profile endpoint (first request - DB hit)${NC}"
FIRST_TIME=$(measure_time "$USER_URL" "First request")

echo -e "\n${BLUE}Testing user profile endpoint (second request - expected cache hit)${NC}"
SECOND_TIME=$(measure_time "$USER_URL" "Second request")

# Calculate improvement
IMPROVEMENT=$(echo "($FIRST_TIME - $SECOND_TIME) / $FIRST_TIME * 100" | bc -l)
IMPROVEMENT=$(printf "%.2f" $IMPROVEMENT)

echo -e "\n${BLUE}Performance Summary:${NC}"
echo -e "First request (DB hit): ${GREEN}${FIRST_TIME}s${NC}"
echo -e "Second request (Cache hit): ${GREEN}${SECOND_TIME}s${NC}"
echo -e "Performance improvement: ${GREEN}${IMPROVEMENT}%${NC}"

if (( $(echo "$IMPROVEMENT > 10" | bc -l) )); then
  echo -e "\n${GREEN}✓ Caching is working effectively (>10% improvement)${NC}"
else
  echo -e "\n${RED}✗ Caching may not be working optimally (<10% improvement)${NC}"
fi

# Clean up
rm cookies.txt 2>/dev/null

echo -e "\n${BLUE}Test completed.${NC}"
