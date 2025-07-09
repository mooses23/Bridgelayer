import { Express } from 'express';

export function registerRoutes(app: Express) {
  // Basic API routes
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/login', (req, res) => {
    // Simple mock login for now
    res.json({ 
      message: 'Login endpoint ready',
      token: 'mock-token-123',
      user: {
        id: 1,
        email: req.body.email,
        firstName: 'Test',
        lastName: 'User'
      }
    });
  });

  app.get('/api/user/profile', (req, res) => {
    res.json({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    });
  });

  app.get('/api/firms', (req, res) => {
    res.json([
      {
        id: 1,
        name: 'Sample Law Firm',
        slug: 'sample-law-firm',
        status: 'active'
      }
    ]);
  });
}
