#!/usr/bin/env node

/**
 * Comprehensive Authentication Route Testing Script
 * Tests both owner and admin login routes with various scenarios
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/auth`;

// Test credentials (update these based on your test data)
const TEST_CREDENTIALS = {
  validOwner: {
    email: 'owner@firmsync.com',
    password: 'password123',
    masterKey: process.env.OWNER_MASTER_KEY || 'your-master-key-here'
  },
  validAdmin: {
    email: 'admin@firmsync.com',
    password: 'admin123'
  },
  invalidOwner: {
    email: 'fake@owner.com',
    password: 'wrongpassword',
    masterKey: 'wrong-master-key'
  },
  invalidAdmin: {
    email: 'fake@admin.com',
    password: 'wrongpassword'
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

// Helper functions
const logTest = (testName) => {
  console.log(`\n🧪 Testing: ${testName}`.cyan.bold);
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`.green);
  testResults.passed++;
  testResults.total++;
};

const logFailure = (message, error) => {
  console.log(`❌ ${message}`.red);
  if (error) {
    console.log(`   Error: ${error.message || error}`.red);
  }
  testResults.failed++;
  testResults.total++;
  testResults.failures.push({ test: message, error: error?.message || error });
};

const logInfo = (message) => {
  console.log(`ℹ️  ${message}`.blue);
};

const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

const validateJsonResponse = (response, testName) => {
  if (response.headers['content-type']?.includes('application/json')) {
    logSuccess(`${testName} - Response is JSON format`);
    return true;
  } else {
    logFailure(`${testName} - Response is NOT JSON format`, 
      new Error(`Content-Type: ${response.headers['content-type']}`));
    return false;
  }
};

const validateSuccessResponse = (response, expectedRole, testName) => {
  const data = response.data;
  
  // Check status code
  if (response.status === 200) {
    logSuccess(`${testName} - Status code 200`);
  } else {
    logFailure(`${testName} - Wrong status code`, 
      new Error(`Expected 200, got ${response.status}`));
    return false;
  }
  
  // Check response structure
  const requiredFields = ['success', 'message', 'user', 'token'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length === 0) {
    logSuccess(`${testName} - Has all required fields`);
  } else {
    logFailure(`${testName} - Missing required fields`, 
      new Error(`Missing: ${missingFields.join(', ')}`));
    return false;
  }
  
  // Check user object
  if (data.user && data.user.role === expectedRole) {
    logSuccess(`${testName} - User role is correct (${expectedRole})`);
  } else {
    logFailure(`${testName} - User role incorrect`, 
      new Error(`Expected ${expectedRole}, got ${data.user?.role}`));
    return false;
  }
  
  // Check token
  if (data.token && typeof data.token === 'string' && data.token.length > 0) {
    logSuccess(`${testName} - Token provided and valid format`);
  } else {
    logFailure(`${testName} - Token invalid`, 
      new Error('Token missing or invalid format'));
    return false;
  }
  
  return true;
};

const validateErrorResponse = (response, expectedStatus, testName) => {
  // Check status code
  if (response.status === expectedStatus) {
    logSuccess(`${testName} - Status code ${expectedStatus}`);
  } else {
    logFailure(`${testName} - Wrong status code`, 
      new Error(`Expected ${expectedStatus}, got ${response.status}`));
    return false;
  }
  
  // Check error response structure
  const data = response.data;
  if (data.success === false && data.error) {
    logSuccess(`${testName} - Error response structure correct`);
  } else {
    logFailure(`${testName} - Error response structure incorrect`, 
      new Error('Missing success:false or error field'));
    return false;
  }
  
  return true;
};

// Test functions
const testOwnerLoginValid = async () => {
  logTest('Owner Login - Valid Credentials');
  
  try {
    const response = await makeRequest('POST', `${API_BASE}/owner-login`, TEST_CREDENTIALS.validOwner);
    
    validateJsonResponse(response, 'Owner Login Valid');
    validateSuccessResponse(response, 'owner', 'Owner Login Valid');
    
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    logFailure('Owner Login Valid - Request failed', error);
  }
};

const testOwnerLoginInvalid = async () => {
  logTest('Owner Login - Invalid Credentials');
  
  try {
    const response = await makeRequest('POST', `${API_BASE}/owner-login`, TEST_CREDENTIALS.invalidOwner);
    
    validateJsonResponse(response, 'Owner Login Invalid');
    validateErrorResponse(response, 401, 'Owner Login Invalid');
    
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    logFailure('Owner Login Invalid - Request failed', error);
  }
};

const testOwnerLoginMissingMasterKey = async () => {
  logTest('Owner Login - Missing Master Key');
  
  try {
    const { masterKey, ...credentialsWithoutMasterKey } = TEST_CREDENTIALS.validOwner;
    const response = await makeRequest('POST', `${API_BASE}/owner-login`, credentialsWithoutMasterKey);
    
    validateJsonResponse(response, 'Owner Login Missing Master Key');
    validateErrorResponse(response, 400, 'Owner Login Missing Master Key');
    
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    logFailure('Owner Login Missing Master Key - Request failed', error);
  }
};

const testAdminLoginValid = async () => {
  logTest('Admin Login - Valid Credentials');
  
  try {
    const response = await makeRequest('POST', `${API_BASE}/admin-login`, TEST_CREDENTIALS.validAdmin);
    
    validateJsonResponse(response, 'Admin Login Valid');
    validateSuccessResponse(response, 'admin', 'Admin Login Valid');
    
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    logFailure('Admin Login Valid - Request failed', error);
  }
};

const testAdminLoginInvalid = async () => {
  logTest('Admin Login - Invalid Credentials');
  
  try {
    const response = await makeRequest('POST', `${API_BASE}/admin-login`, TEST_CREDENTIALS.invalidAdmin);
    
    validateJsonResponse(response, 'Admin Login Invalid');
    validateErrorResponse(response, 401, 'Admin Login Invalid');
    
    logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    logFailure('Admin Login Invalid - Request failed', error);
  }
};

const testInputValidation = async () => {
  logTest('Input Validation Tests');
  
  // Test empty email
  try {
    const response = await makeRequest('POST', `${API_BASE}/admin-login`, { email: '', password: 'test123' });
    validateJsonResponse(response, 'Empty Email');
    validateErrorResponse(response, 400, 'Empty Email');
  } catch (error) {
    logFailure('Empty Email - Request failed', error);
  }
  
  // Test invalid email format
  try {
    const response = await makeRequest('POST', `${API_BASE}/admin-login`, { email: 'invalid-email', password: 'test123' });
    validateJsonResponse(response, 'Invalid Email Format');
    validateErrorResponse(response, 400, 'Invalid Email Format');
  } catch (error) {
    logFailure('Invalid Email Format - Request failed', error);
  }
  
  // Test short password
  try {
    const response = await makeRequest('POST', `${API_BASE}/admin-login`, { email: 'test@example.com', password: '123' });
    validateJsonResponse(response, 'Short Password');
    validateErrorResponse(response, 400, 'Short Password');
  } catch (error) {
    logFailure('Short Password - Request failed', error);
  }
};

const testHealthCheck = async () => {
  logTest('Health Check');
  
  try {
    const response = await makeRequest('GET', `${API_BASE}/health`);
    
    validateJsonResponse(response, 'Health Check');
    
    if (response.status === 200) {
      logSuccess('Health Check - Status code 200');
    } else {
      logFailure('Health Check - Wrong status code', 
        new Error(`Expected 200, got ${response.status}`));
    }
    
    const data = response.data;
    if (data.success && data.service) {
      logSuccess('Health Check - Response structure correct');
    } else {
      logFailure('Health Check - Response structure incorrect', 
        new Error('Missing success or service field'));
    }
    
    logInfo(`Health Status: ${JSON.stringify(data, null, 2)}`);
    
  } catch (error) {
    logFailure('Health Check - Request failed', error);
  }
};

const testRateLimit = async () => {
  logTest('Rate Limiting Test');
  logInfo('Attempting multiple rapid login requests...');
  
  try {
    const promises = [];
    for (let i = 0; i < 7; i++) { // Should exceed the 5 attempt limit
      promises.push(makeRequest('POST', `${API_BASE}/admin-login`, TEST_CREDENTIALS.invalidAdmin));
    }
    
    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    if (rateLimitedResponses.length > 0) {
      logSuccess('Rate Limiting - Rate limit triggered');
      logInfo(`Rate limited after ${responses.length - rateLimitedResponses.length} attempts`);
    } else {
      logInfo('Rate Limiting - Rate limit not triggered (may need more attempts or shorter window)');
    }
    
  } catch (error) {
    logFailure('Rate Limiting - Test failed', error);
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Authentication Tests'.rainbow.bold);
  console.log(`📍 Base URL: ${API_BASE}`.yellow);
  console.log('=' * 60);
  
  // Check if server is running
  try {
    await makeRequest('GET', `${API_BASE}/health`);
    logSuccess('Server is running and accessible');
  } catch (error) {
    console.log('❌ Server is not accessible. Please start the server first.'.red.bold);
    console.log(`   Trying to connect to: ${API_BASE}`.red);
    process.exit(1);
  }
  
  // Run all tests
  await testHealthCheck();
  await testOwnerLoginValid();
  await testOwnerLoginInvalid();
  await testOwnerLoginMissingMasterKey();
  await testAdminLoginValid();
  await testAdminLoginInvalid();
  await testInputValidation();
  await testRateLimit();
  
  // Print summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST SUMMARY'.rainbow.bold);
  console.log('=' * 60);
  
  console.log(`✅ Passed: ${testResults.passed}`.green.bold);
  console.log(`❌ Failed: ${testResults.failed}`.red.bold);
  console.log(`📈 Total:  ${testResults.total}`.blue.bold);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`.yellow.bold);
  
  if (testResults.failures.length > 0) {
    console.log('\n❌ FAILURES:'.red.bold);
    testResults.failures.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.test}`.red);
      if (failure.error) {
        console.log(`      Error: ${failure.error}`.red);
      }
    });
  }
  
  console.log('\n🎉 Testing completed!'.rainbow.bold);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testOwnerLoginValid,
  testOwnerLoginInvalid,
  testAdminLoginValid,
  testAdminLoginInvalid,
  testInputValidation,
  testHealthCheck,
  testRateLimit
};
