import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';

// Rate limiter using Redis
const redisRateLimiter = rateLimit({
  store: new (require('rate-limit-redis'))({
    client: redis,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Brute force protection
const bruteForceProtection = rateLimit({
  store: new (require('rate-limit-redis'))({
    client: redis,
    prefix: 'brute-force:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts
  skipSuccessfulRequests: true,
});

// Request signature verification
const verifyRequestSignature = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const signature = req.headers['x-request-signature'];
  const timestamp = req.headers['x-timestamp'];
  
  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing request signature' });
  }

  const payload = JSON.stringify(req.body) + timestamp;
  const expectedSignature = createHash('sha256')
    .update(payload + process.env.API_SECRET)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn('Invalid request signature', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({ error: 'Invalid request signature' });
  }

  next();
};

// Security headers middleware
const securityMiddleware = [
  // Basic security headers
  helmet(),
  
  // Custom CSP
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.firmsync.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  }),
  
  // CORS configuration
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://firmsync.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-signature', 'x-timestamp'],
    credentials: true,
    maxAge: 86400,
  }),
  
  // Rate limiting
  redisRateLimiter,
  
  // Brute force protection for auth endpoints
  (req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('/auth/')) {
      return bruteForceProtection(req, res, next);
    }
    next();
  },
  
  // Request signature verification for sensitive endpoints
  (req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('/admin/') || req.method !== 'GET') {
      return verifyRequestSignature(req, res, next);
    }
    next();
  },
];

export default securityMiddleware;
