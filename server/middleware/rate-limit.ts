import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => console.error('Redis error:', err));

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Base rate limit options
const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
};

// Authentication rate limits
export const loginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: {
    success: false,
    error: 'Too many login attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const adminLoginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 3, // Stricter limit for admin login
  message: {
    success: false,
    error: 'Too many admin login attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// API rate limits
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Document processing rate limit
export const documentProcessingLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 documents per minute
  message: {
    success: false,
    error: 'Document processing rate limit exceeded. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
