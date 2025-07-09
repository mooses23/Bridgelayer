# Schema Migration and Data Flow Testing Guide

This document provides a comprehensive guide for testing the schema migration and data flow in the FirmSync application.

## Testing Overview

The testing process consists of three main parts:

1. **Schema Migration Validation** - Validates that the data from the old schema has been properly migrated to the new schema.
2. **API Flow Testing** - Tests the API endpoints for each section of the tenant portal.
3. **Frontend Integration Testing** - Verifies that the frontend components are correctly using the API.

## Prerequisites

- Node.js 14+ installed
- PostgreSQL database with both old and new schema data
- Environment variables properly configured in `.env` file:
  ```
  DATABASE_URL=postgres://username:password@localhost:5432/bridgelayer
  API_URL=http://localhost:3000/api
  TEST_EMAIL=admin@example.com
  TEST_PASSWORD=password123
  TEST_TENANT_SLUG=test-firm
  NODE_ENV=development
  ```

## Running the Tests

### Automated Testing Script

Run the comprehensive testing script which executes all validation steps:

```bash
chmod +x ./test-end-to-end.sh
./test-end-to-end.sh
```

You can also run specific parts of the test:

```bash
# Skip migration validation
./test-end-to-end.sh --skip-migration

# Skip API testing
./test-end-to-end.sh --skip-api
```

### Manual Testing

#### Schema Migration Validation

1. Run the validation script:
   ```bash
   node validate-migration.js
   ```

2. Review the output for any data discrepancies.

#### API Flow Testing

1. Start the API server:
   ```bash
   npm run dev
   ```

2. Run the API test script:
   ```bash
   node test-api-flow.js
   ```

#### Frontend Integration Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to http://localhost:3000.

3. Log in and verify each section of the tenant portal:
   - Dashboard - Check stats and visualization
   - Clients - View clients list and create new client
   - Cases - View cases list and create new case
   - Calendar - View events and create new event
   - Paralegal+ - View documents and upload new document
   - Billing - View invoices and create new invoice
   - Settings - View firm settings and update information

## Test Files

- `validate-migration.js` - Validates schema migration
- `test-api-flow.js` - Tests API endpoints for each portal section
- `test-end-to-end.sh` - Orchestrates the entire testing process

## What to Look For

### Migration Validation

- All records from the old schema should exist in the new schema
- Key data fields (IDs, names, relationships) should match
- No data corruption or missing fields

### API Testing

- All endpoints should return proper status codes (200 OK)
- Data structures should match the expected schema
- Create/update operations should work correctly
- Error handling should be appropriate

### Frontend Integration

- Components should display data from the API correctly
- Forms should submit data and update the UI
- Error states should be handled gracefully
- Performance should be acceptable

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check that the database server is running
   - Ensure database user has proper permissions

2. **API Server Issues**
   - Check server logs for errors
   - Verify API_URL is pointing to the correct server
   - Ensure server has started successfully

3. **Authentication Issues**
   - Verify test credentials are correct
   - Check that token is being properly stored and sent

4. **Schema Mismatch**
   - Compare schema files for structure differences
   - Check migration script for missing field mappings
   - Verify data types match between schemas

## Next Steps After Successful Testing

1. Document any issues discovered during testing
2. Apply fixes as needed
3. Run the tests again to verify fixes
4. Prepare migration plan for production environment
5. Create database backups before migration
6. Schedule migration during low-traffic period

## Conclusion

Thorough testing of the schema migration and data flow ensures that the new refactored architecture works correctly and that all data is preserved during the migration process. Following this testing guide will help identify and resolve any issues before deploying to production.
