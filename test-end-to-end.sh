#!/bin/bash

# Colors for output formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   BRIDGELAYER SCHEMA MIGRATION TESTING     ${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Check if environment is set up properly
echo -e "${YELLOW}Checking environment...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating sample file...${NC}"
    echo "DATABASE_URL=postgres://username:password@localhost:5432/bridgelayer" > .env
    echo "API_URL=http://localhost:3000/api" >> .env
    echo "TEST_EMAIL=admin@example.com" >> .env
    echo "TEST_PASSWORD=password123" >> .env
    echo "TEST_TENANT_SLUG=test-firm" >> .env
    echo "NODE_ENV=development" >> .env
    echo -e "${YELLOW}Created sample .env file. Please update with correct values before continuing.${NC}"
    read -p "Press Enter to continue or Ctrl+C to abort..."
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Step 1: Start by running the migration validation script
echo -e "${CYAN}Step 1: Validating existing schema structure...${NC}"
node validate-migration.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema validation successful!${NC}"
else
    echo -e "${RED}✗ Schema validation failed. Please fix the issues before proceeding.${NC}"
    exit 1
fi

# Step 2: Run the actual migration script
echo -e "${CYAN}Step 2: Running migration script...${NC}"
echo -e "${YELLOW}WARNING: This will modify your database. Make sure you have a backup.${NC}"
read -p "Continue with migration? (y/n): " confirm

if [ "$confirm" = "y" ]; then
    chmod +x ./migrate-schema.sh
    ./migrate-schema.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migration completed successfully!${NC}"
    else
        echo -e "${RED}✗ Migration failed. Check logs for details.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Migration skipped. Continuing with testing...${NC}"
fi

# Step 3: Verify API endpoints work correctly
echo -e "${CYAN}Step 3: Testing API endpoints...${NC}"
echo -e "${YELLOW}Make sure your API server is running.${NC}"

# Check if server is running
curl -s ${API_URL:-http://localhost:3000/api}/health > /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}API server does not appear to be running. Starting server...${NC}"
    # Start the server in background
    npm run dev &
    SERVER_PID=$!
    echo -e "${YELLOW}Server started with PID: ${SERVER_PID}${NC}"
    echo -e "${YELLOW}Waiting 10 seconds for server to initialize...${NC}"
    sleep 10
fi

node test-api-flow.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ API testing completed successfully!${NC}"
else
    echo -e "${RED}✗ API testing encountered errors. See log for details.${NC}"
    # Don't exit here, continue to next step
fi

# Clean up background server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo -e "${YELLOW}Stopping API server (PID: ${SERVER_PID})${NC}"
    kill $SERVER_PID
fi

# Step 4: Verify frontend components are using the API correctly
echo -e "${CYAN}Step 4: Validating frontend component integration...${NC}"
echo -e "${YELLOW}This is a manual step. Please verify the following:${NC}"
echo "- Dashboard is displaying data from the API"
echo "- Clients page is showing client data and allows creating new clients"
echo "- Cases page is showing case data and allows creating new cases"
echo "- Calendar shows events and allows creating new events"
echo "- Paralegal+ shows documents and allows upload"
echo "- Billing shows invoices and allows creating new invoices"
echo "- Settings shows firm information and allows updates"
echo ""
echo -e "${YELLOW}To verify, run the development server (if not already running):${NC}"
echo "  npm run dev"
echo -e "${YELLOW}Then open your browser to http://localhost:3000${NC}"
echo ""

# Summary
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}             TESTING SUMMARY               ${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "${GREEN}Schema validation:${NC} Complete"
echo -e "${GREEN}Schema migration:${NC} ${confirm:-n}"
echo -e "${GREEN}API endpoint testing:${NC} Complete"
echo -e "${GREEN}Frontend integration:${NC} Manual verification needed"
echo ""
echo -e "${CYAN}============================================${NC}"

# Final notes
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. If any tests failed, review the logs and fix issues"
echo "2. Manually verify the frontend components"
echo "3. Run any additional tests specific to your application"
echo "4. Once everything is validated, update your production database"
echo ""
echo -e "${CYAN}Testing complete!${NC}"
