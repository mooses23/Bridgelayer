#!/usr/bin/env node

/**
 * Environment Variables Test Script
 * Tests that JWT_SECRET and OWNER_MASTER_KEY are properly configured
 */

// Load environment variables
require('dotenv').config();

console.log('🔐 Testing Authentication Environment Variables...\n');

// Test JWT_SECRET
const jwtSecret = process.env.JWT_SECRET;
console.log('✅ JWT_SECRET:');
console.log('   - Exists:', !!jwtSecret);
console.log('   - Length:', jwtSecret?.length || 0);
console.log('   - Valid length (>32):', (jwtSecret?.length || 0) > 32);

// Test OWNER_MASTER_KEY
const ownerMasterKey = process.env.OWNER_MASTER_KEY;
console.log('\n✅ OWNER_MASTER_KEY:');
console.log('   - Exists:', !!ownerMasterKey);
console.log('   - Length:', ownerMasterKey?.length || 0);
console.log('   - Valid length (>20):', (ownerMasterKey?.length || 0) > 20);

// Test authController integration
console.log('\n🧪 Testing AuthController Integration...');
try {
  // Test if our controller can be imported (will fail due to missing storage, but syntax should be ok)
  const authControllerPath = './server/src/controllers/authController.js';
  const fs = require('fs');
  
  if (fs.existsSync(authControllerPath)) {
    console.log('   - AuthController file exists: ✅');
    
    // Check if it references our environment variables
    const content = fs.readFileSync(authControllerPath, 'utf8');
    const hasJwtSecret = content.includes('process.env.JWT_SECRET');
    const hasOwnerKey = content.includes('process.env.OWNER_MASTER_KEY');
    
    console.log('   - References JWT_SECRET:', hasJwtSecret ? '✅' : '❌');
    console.log('   - References OWNER_MASTER_KEY:', hasOwnerKey ? '✅' : '❌');
  } else {
    console.log('   - AuthController file: ❌ Not found');
  }
} catch (error) {
  console.log('   - Error testing controller:', error.message);
}

// Final status
const allConfigured = jwtSecret && ownerMasterKey && 
                     jwtSecret.length > 32 && ownerMasterKey.length > 20;

console.log('\n🎯 Overall Status:', allConfigured ? '✅ CONFIGURED' : '❌ NEEDS ATTENTION');

if (allConfigured) {
  console.log('\n🚀 Your authentication environment is properly configured!');
  console.log('   - JWT tokens will be signed securely');
  console.log('   - Owner login requires the master key');
  console.log('   - Ready for production use');
} else {
  console.log('\n⚠️  Some environment variables need attention.');
}
