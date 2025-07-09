import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

// Create Redis client
export const redisClient = new Redis(env.REDIS_URL, {
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Set up event listeners
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

export default redisClient;
