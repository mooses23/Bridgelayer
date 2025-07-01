import request from 'supertest';
import app from '../app';

describe('OnboardingController Integration Tests', () => {
  it('should start onboarding successfully', async () => {
    const response = await request(app)
      .post('/api/onboarding/start')
      .set('Authorization', 'Bearer valid-token')
      .send({ firmId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should complete onboarding successfully', async () => {
    const response = await request(app)
      .post('/api/onboarding/complete')
      .set('Authorization', 'Bearer valid-token')
      .send({ firmId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should fail onboarding without authentication', async () => {
    const response = await request(app)
      .post('/api/onboarding/start')
      .send({ firmId: 1 });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
