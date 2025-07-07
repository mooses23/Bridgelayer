# End-to-End Testing for FirmSync Schema Migration

This document outlines the process for thoroughly testing the data flow end-to-end and validating the migration scripts for the FirmSync schema refactoring project.

## Overview

The testing process involves several steps:

1. Validating the existing schema structure
2. Running the migration scripts
3. Testing API endpoints for all tenant portal tabs
4. Verifying frontend-backend integration

## Prerequisites

Before running the tests, ensure you have:

- Node.js (v16+) installed
- PostgreSQL database with schema loaded
- `.env` file with proper configuration (see below)

## Environment Setup

Create a `.env` file in the project root with the following variables:

```
DATABASE_URL=postgres://username:password@localhost:5432/bridgelayer
API_URL=http://localhost:3000/api
TEST_EMAIL=admin@example.com
TEST_PASSWORD=password123
TEST_TENANT_SLUG=test-firm
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## Running the Tests

### Option 1: Automatic Testing Script

The `test-end-to-end.sh` script will run all the tests in sequence:

```bash
# Make the script executable
chmod +x test-end-to-end.sh

# Run the test script
./test-end-to-end.sh
```

This script will:
1. Validate the schema structure
2. Offer to run the migration (optional)
3. Test API endpoints
4. Provide instructions for manual frontend verification

### Option 2: Manual Testing

#### Step 1: Validate Schema

```bash
node validate-migration.js
```

This script checks:
- All tables in the new schema exist
- Record counts match between old and new schemas
- Sample records for data integrity
- Relationships between tables

#### Step 2: Run Migration

```bash
chmod +x migrate-schema.sh
./migrate-schema.sh
```

This script:
- Creates backup of the old schema
- Transfers data from old schema tables to new schema tables
- Updates relationships to maintain data integrity

#### Step 3: Test API Endpoints

```bash
node test-api-flow.js
```

This script tests:
- Authentication
- All endpoints used by the tenant portal tabs
- Response formats matching the expected schema

#### Step 4: Verify Frontend Integration

Manually verify that all frontend components display data correctly:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to each tenant portal tab and verify:
   - Dashboard: Summary statistics and recent items are displayed
   - Clients: Client list is populated and new clients can be created
   - Cases: Case list is populated and new cases can be created
   - Calendar: Events are displayed and new events can be created
   - Paralegal+: Documents are displayed and can be uploaded
   - Billing: Invoices are displayed and new invoices can be created
   - Settings: Firm information is displayed and can be updated

## Troubleshooting

### API Errors

If API tests fail, check:
- Server is running
- Database connection is configured correctly
- JWT_SECRET is set correctly in .env

### Migration Errors

If migration fails, check:
- Database connection
- Table permissions
- Schema compatibility issues

### Frontend Issues

If frontend components don't display data:
- Check browser console for errors
- Verify API requests in Network tab
- Confirm that API endpoints return expected data format

## Restoring from Backup

If the migration fails or introduces issues, you can restore from backup:

```bash
# Restore schema from backup
cp ./shared/schema.ts.bak ./shared/schema.ts
```

## Next Steps After Successful Testing

1. Document any manual steps required for production deployment
2. Create database backup before running migration on production
3. Schedule migration during off-peak hours
4. Monitor system after migration for any anomalies
