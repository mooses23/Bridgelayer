/**
 * End-to-End API Flow Test
 * 
 * This script tests the complete data flow from frontend to backend
 * across all the tenant portal tabs to ensure data integrity and API functionality.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from './server/utils/logger.js';

// Load environment variables
dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TENANT_SLUG = 'test-firm';
let authToken = '';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// API client with auth token handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Main test runner
async function runTests() {
  logger.info('Starting end-to-end API flow tests');
  logger.info(`API URL: ${API_BASE_URL}`);
  logger.info(`Test tenant: ${TEST_TENANT_SLUG}`);
  
  try {
    // Step 1: Authentication
    await testAuthentication();
    
    // Step 2: Test each tenant portal tab
    await testDashboard();
    await testClients();
    await testCases();
    await testCalendar();
    await testParalegalPlus();
    await testBilling();
    await testSettings();
    
    // Step 3: Test data creation and updates
    await testDataCreation();
    
    // Print test results
    logger.info('\n===== TEST RESULTS =====');
    logger.info(`Total tests: ${testResults.passed + testResults.failed + testResults.skipped}`);
    logger.info(`Passed: ${testResults.passed}`);
    logger.info(`Failed: ${testResults.failed}`);
    logger.info(`Skipped: ${testResults.skipped}`);
    
    if (testResults.failed > 0) {
      logger.error('\nFailed tests:');
      testResults.tests
        .filter(test => test.status === 'failed')
        .forEach((test, i) => {
          logger.error(`[${i+1}] ${test.name}: ${test.error}`);
        });
      
      process.exit(1);
    } else {
      logger.info('\nAll tests passed successfully!');
    }
  } catch (error) {
    logger.error('Test execution error:', error);
    process.exit(1);
  }
}

// Authentication test
async function testAuthentication() {
  await runTest('Authentication', async () => {
    const credentials = {
      email: process.env.TEST_USER_EMAIL || 'admin@test.com',
      password: process.env.TEST_USER_PASSWORD || 'password'
    };
    
    const response = await apiClient.post('/auth/login', credentials);
    
    if (!response.data.token) {
      throw new Error('No auth token received');
    }
    
    authToken = response.data.token;
    logger.info(`Authenticated successfully as ${credentials.email}`);
  });
}

// Dashboard test
async function testDashboard() {
  await runTest('Dashboard data fetch', async () => {
    const response = await apiClient.get(`/tenant/${TEST_TENANT_SLUG}/dashboard`);
    
    if (!response.data || !response.data.stats) {
      throw new Error('Invalid dashboard data structure');
    }
    
    logger.info('Dashboard data validated successfully');
  });
}

// Clients test
async function testClients() {
  await runTest('Clients list fetch', async () => {
    const response = await apiClient.get(`/tenant/${TEST_TENANT_SLUG}/clients`);
    
    if (!Array.isArray(response.data)) {
      throw new Error('Expected clients data to be an array');
    }
    
    logger.info(`Retrieved ${response.data.length} clients`);
  });
}

// Cases test
async function testCases() {
  await runTest('Cases list fetch', async () => {
    const response = await apiClient.get(`/tenant/${TEST_TENANT_SLUG}/cases`);
    
    if (!Array.isArray(response.data)) {
      throw new Error('Expected cases data to be an array');
    }
    
    logger.info(`Retrieved ${response.data.length} cases`);
  });
}

// Calendar test
async function testCalendar() {
  await runTest('Calendar events fetch', async () => {
    // Get current date range for this month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const response = await apiClient.get(`/tenant/${TEST_TENANT_SLUG}/calendar?start=${startOfMonth}&end=${endOfMonth}`);
    
    if (!Array.isArray(response.data)) {
      throw new Error('Expected calendar events to be an array');
    }
    
    logger.info(`Retrieved ${response.data.length} calendar events`);
  });
}

// Paralegal Plus test
async function testParalegalPlus() {
  await runTest('Documents fetch', async () => {
    const response = await apiClient.get(`/tenant/${TEST_TENANT_SLUG}/documents`);
    
    if (!Array.isArray(response.data)) {
      throw new Error('Expected documents to be an array');
    }
    
    logger.info(`Retrieved ${response.data.length} documents`);
  });
}

// Billing test
async function testBilling() {
  await runTest('Invoices fetch', async () => {
    const response = await apiClient.get(`/tenant/${TEST_TENANT_SLUG}/invoices`);
    
    if (!Array.isArray(response.data)) {
      throw new Error('Expected invoices to be an array');
    }
    
    logger.info(`Retrieved ${response.data.length} invoices`);
  });
}

// Settings test
async function testSettings() {
  await runTest('Firm settings fetch', async () => {
    const response = await apiClient.get(`/firms/${TEST_TENANT_SLUG}`);
    
    if (!response.data || !response.data.name) {
      throw new Error('Invalid firm data structure');
    }
    
    logger.info('Firm settings validated successfully');
  });
}

// Data creation and update tests
async function testDataCreation() {
  // Create a new client
  let newClientId = null;
  
  await runTest('Client creation', async () => {
    const newClient = {
      name: `Test Client ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: '555-123-4567',
      status: 'Active'
    };
    
    const response = await apiClient.post(`/tenant/${TEST_TENANT_SLUG}/clients`, newClient);
    
    if (!response.data || !response.data.id) {
      throw new Error('Failed to create new client');
    }
    
    newClientId = response.data.id;
    logger.info(`Created new client with ID: ${newClientId}`);
  });
  
  // Create a case for the new client
  let newCaseId = null;
  
  await runTest('Case creation', async () => {
    // Skip if client creation failed
    if (!newClientId) {
      logger.warn('Skipping case creation due to failed client creation');
      return;
    }
    
    const newCase = {
      clientId: newClientId,
      title: `Test Case ${Date.now()}`,
      description: 'This is a test case created by the end-to-end test script',
      status: 'Active'
    };
    
    const response = await apiClient.post(`/tenant/${TEST_TENANT_SLUG}/cases`, newCase);
    
    if (!response.data || !response.data.id) {
      throw new Error('Failed to create new case');
    }
    
    newCaseId = response.data.id;
    logger.info(`Created new case with ID: ${newCaseId}`);
  });
  
  // Create a calendar event
  await runTest('Calendar event creation', async () => {
    // Skip if case creation failed
    if (!newCaseId) {
      logger.warn('Skipping calendar event creation due to failed case creation');
      return;
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startTime = new Date(tomorrow);
    startTime.setHours(10, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0);
    
    const newEvent = {
      title: `Meeting for Case #${newCaseId}`,
      description: 'Initial consultation',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      eventType: 'meeting',
      location: 'Conference Room A',
      status: 'confirmed'
    };
    
    const response = await apiClient.post(`/tenant/${TEST_TENANT_SLUG}/calendar`, newEvent);
    
    if (!response.data || !response.data.id) {
      throw new Error('Failed to create new calendar event');
    }
    
    logger.info(`Created new calendar event with ID: ${response.data.id}`);
  });
}

// Test helper function
async function runTest(name, testFn) {
  try {
    logger.info(`\nTEST: ${name}`);
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
    logger.info(`✅ PASSED: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ 
      name, 
      status: 'failed', 
      error: error.message || 'Unknown error' 
    });
    logger.error(`❌ FAILED: ${name}`);
    logger.error(`   Error: ${error.message}`);
    
    if (error.response) {
      logger.error(`   Status: ${error.response.status}`);
      logger.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Run the tests
runTests();
