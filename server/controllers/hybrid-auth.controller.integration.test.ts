import request from 'supertest';
import app from '../app';

describe('HybridAuthController Integration Tests', () => {
  it('should login successfully with hybrid auth', async () => {
    const response = await request(app)
      .post('/api/hybrid-auth/login')
      .send({ email: 'hybrid@example.com', password: 'ValidPassword123!' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
  });

  it('should fail hybrid auth login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/hybrid-auth/login')
      .send({ email: 'hybrid@example.com', password: 'InvalidPassword' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should refresh token successfully', async () => {
    const response = await request(app)
      .post('/api/hybrid-auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
  });
});
