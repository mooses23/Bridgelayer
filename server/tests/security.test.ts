import request from 'supertest';
import { app } from '../app';
import { ValidationService } from '../services/validation.service';
import { EncryptionService } from '../services/encryption.service';
import { AuditService } from '../services/audit.service';

describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should block access to protected routes without token', async () => {
      const res = await request(app).get('/api/protected');
      expect(res.status).toBe(401);
    });

    it('should block access with invalid token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
    });

    it('should enforce rate limiting', async () => {
      // Make 6 requests (limit is 5)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'password' });
      }
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });
      
      expect(res.status).toBe(429);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: 'password' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate password requirements', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
          firstName: 'Test',
          lastName: 'User'
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Encryption', () => {
    const encryptionService = new EncryptionService();
    
    it('should encrypt and decrypt data correctly', () => {
      const data = 'sensitive data';
      const encrypted = encryptionService.encrypt(data);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(encrypted.encrypted).toBeDefined();
      
      const decrypted = encryptionService.decrypt(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag
      );
      expect(decrypted).toBe(data);
    });
  });

  describe('CORS and Security Headers', () => {
    it('should set security headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-xss-protection']).toBe('1; mode=block');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should enforce CORS', async () => {
      const res = await request(app)
        .get('/')
        .set('Origin', 'http://malicious-site.com');
      expect(res.status).toBe(403);
    });
  });

  describe('Audit Logging', () => {
    it('should log security events', async () => {
      const logSpy = jest.spyOn(AuditService, 'log');
      
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong-password' });
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_FAILURE'
        })
      );
    });
  });
});
