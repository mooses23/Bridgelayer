import http from 'k6/http';
import { sleep, check } from 'k6';
import { config } from './config.js';

export const options = config;

// Test data
const TEST_USERS = [
  { email: 'test1@example.com', password: 'testpass1' },
  { email: 'test2@example.com', password: 'testpass2' },
  // Add more test users as needed
];

// Utility function to get random user
function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

export function setup() {
  // Setup test data if needed
}

export default function() {
  // Test authentication flow
  const user = getRandomUser();
  
  // Login attempt
  const loginRes = http.post(`${config.baseUrl}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
    mode: Math.random() > 0.5 ? 'bridgelayer' : 'firm'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has auth token': (r) => r.json('token') !== undefined,
  });

  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    // Test protected endpoints with auth token
    const profileRes = http.get(`${config.baseUrl}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    check(profileRes, {
      'profile fetch successful': (r) => r.status === 200,
    });
  }

  sleep(1);
}
