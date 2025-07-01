import http from 'k6/http';
import { sleep, check } from 'k6';
import { config } from './config.js';

export const options = {
  ...config,
  scenarios: {
    firms_crud: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
    },
  },
};

export default function() {
  // Test firm-related endpoints
  const res = http.get(`${config.baseUrl}/api/firms`, {
    headers: { 'Content-Type': 'application/json' }
  });

  check(res, {
    'firms fetch successful': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  // Test search functionality
  const searchRes = http.get(`${config.baseUrl}/api/firms/search?q=test`, {
    headers: { 'Content-Type': 'application/json' }
  });

  check(searchRes, {
    'search successful': (r) => r.status === 200,
    'search time OK': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
