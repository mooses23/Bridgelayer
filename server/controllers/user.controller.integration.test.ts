import request from 'supertest';
import app from '../app';

describe('UserController Integration Tests', () => {
  it('should retrieve user profile successfully', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
  });

  it('should update user profile successfully', async () => {
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', 'Bearer valid-token')
      .send({ firstName: 'Updated', lastName: 'User' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.firstName).toBe('Updated');
  });

  it('should fail to retrieve profile without authentication', async () => {
    const response = await request(app)
      .get('/api/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
