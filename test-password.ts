import bcrypt from 'bcrypt';

async function testPassword() {
  const storedHash = '$2b$10$K8Qzk9M1q5U7t6Y.o8vOke3EQzU8dCgOJzJ.M1H.8xN4zL2HUXE1K';
  const testPassword = 'admin123';
  
  const isValid = await bcrypt.compare(testPassword, storedHash);
  console.log('Password "admin123" matches stored hash:', isValid);
  
  // Let's also test other possible passwords
  const possiblePasswords = ['admin123', 'password', 'admin', 'tempPassword123!'];
  
  for (const pwd of possiblePasswords) {
    const matches = await bcrypt.compare(pwd, storedHash);
    console.log(`Password "${pwd}" matches:`, matches);
  }
}

testPassword().catch(console.error);
