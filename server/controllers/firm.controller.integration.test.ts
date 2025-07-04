import request from 'supertest';
import app from '../app';

describe('FirmController Integration Tests', () => {
  it('should retrieve firm details successfully', async () => {
    const response = await request(app)
      .get('/api/firms/1')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.firm).toBeDefined();
  });

  it('should update firm details successfully', async () => {
    const response = await request(app)
      .put('/api/firms/1')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Updated Firm Name' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.firm.name).toBe('Updated Firm Name');
  });

  it('should fail to retrieve firm details without authentication', async () => {
    const response = await request(app)
      .get('/api/firms/1');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
