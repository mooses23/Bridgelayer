import request from 'supertest';
import app from '../app';

describe('AuthController Integration Tests', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'ValidPassword123!' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'InvalidPassword' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'NewUserPassword123!',
        firstName: 'New',
        lastName: 'User'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('newuser@example.com');
  });
});
