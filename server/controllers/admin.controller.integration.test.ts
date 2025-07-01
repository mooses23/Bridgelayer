import request from 'supertest';
import app from '../app';

describe('AdminController Integration Tests', () => {
  it('should retrieve admin dashboard successfully', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.dashboard).toBeDefined();
  });

  it('should fail to retrieve admin dashboard without admin privileges', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer valid-user-token');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('should fail to retrieve admin dashboard without authentication', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
