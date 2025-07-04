import request from 'supertest';
import app from '../../server/app';

describe('Authentication E2E Tests', () => {
  it('should register, login, and access protected route successfully', async () => {
    // Register new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'e2euser@example.com',
        password: 'E2EPassword123!',
        firstName: 'E2E',
        lastName: 'User'
      });

    expect(registerResponse.status).toBe(200);
    expect(registerResponse.body.success).toBe(true);

    // Login with new user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'e2euser@example.com', password: 'E2EPassword123!' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    const token = loginResponse.body.accessToken;

    // Access protected route
    const protectedResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(200);
    expect(protectedResponse.body.success).toBe(true);
    expect(protectedResponse.body.user.email).toBe('e2euser@example.com');
  });
});
