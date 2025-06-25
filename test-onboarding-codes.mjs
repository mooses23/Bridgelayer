#!/usr/bin/env node

/**
 * Test utility for onboarding code system
 * Tests the unique code generation and workflow coordination
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testOnboardingCodeSystem() {
  console.log('🎯 Testing Onboarding Code System...\n');

  try {
    // Test 1: Generate new onboarding code
    console.log('1. Testing code generation...');
    const createResponse = await fetch(`${BASE_URL}/api/onboarding/codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test', // Would need real session in production
      },
      body: JSON.stringify({
        notes: 'Test onboarding for ABC Law Firm'
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Code generated:', createData.data.code);
      
      const testCode = createData.data.code;

      // Test 2: Update Step 1 (Firm Data)
      console.log('\n2. Testing Step 1 update (Firm Data)...');
      const step1Response = await fetch(`${BASE_URL}/api/onboarding/codes/${testCode}/step/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            firmName: 'ABC Law Firm',
            practiceAreas: ['Corporate Law', 'Litigation'],
            adminName: 'John Smith',
            adminEmail: 'john@abclaw.com'
          },
          complete: true
        })
      });

      if (step1Response.ok) {
        const step1Data = await step1Response.json();
        console.log('✅ Step 1 completed. Progress:', step1Data.data.progressPercentage + '%');
      }

      // Test 3: Update Step 2 (Integrations)
      console.log('\n3. Testing Step 2 update (Integrations)...');
      const step2Response = await fetch(`${BASE_URL}/api/onboarding/codes/${testCode}/step/2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIntegrations: [1, 3, 5], // Example integration IDs
          integrationConfigs: {
            '1': { enabled: true, settings: { apiKey: 'xxx' } },
            '3': { enabled: true, settings: { webhook: 'https://...' } }
          },
          complete: true
        })
      });

      if (step2Response.ok) {
        const step2Data = await step2Response.json();
        console.log('✅ Step 2 completed. Progress:', step2Data.data.progressPercentage + '%');
      }

      // Test 4: Get current state
      console.log('\n4. Testing profile retrieval...');
      const getResponse = await fetch(`${BASE_URL}/api/onboarding/codes/${testCode}`);
      
      if (getResponse.ok) {
        const profileData = await getResponse.json();
        console.log('✅ Profile retrieved:', {
          code: profileData.data.code,
          status: profileData.data.status,
          progress: profileData.data.progressPercentage + '%',
          stepsCompleted: profileData.data.totalStepsCompleted + '/4'
        });
      }

      // Test 5: List all codes
      console.log('\n5. Testing code listing...');
      const listResponse = await fetch(`${BASE_URL}/api/onboarding/codes`);
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('✅ Found', listData.data.length, 'onboarding profiles');
        listData.data.forEach((profile) => {
          console.log(`   - ${profile.code}: ${profile.progressPercentage}% complete`);
        });
      }

    } else {
      console.log('❌ Failed to create onboarding code:', await createResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testOnboardingCodeSystem();

export { testOnboardingCodeSystem };
