import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheService } from '../services/cache.service';
import Redis from 'ioredis';

// Mock Redis
vi.mock('ioredis');
vi.mock('../config/redis', () => {
  return {
    default: new Redis(),
    redisClient: new Redis()
  };
});

// Mock logger
vi.mock('../utils/logger', () => {
  return {
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }
  };
});

describe('CacheService', () => {
  let cacheService: CacheService;
  const mockRedis = Redis.prototype;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheService = new CacheService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('set', () => {
    it('should set a value in Redis with default TTL', async () => {
      mockRedis.set = vi.fn().mockResolvedValue('OK');
      
      await cacheService.set('test-key', { foo: 'bar' });
      
      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key', 
        JSON.stringify({ foo: 'bar' }), 
        'EX', 
        3600
      );
    });

    it('should set a value with custom TTL', async () => {
      mockRedis.set = vi.fn().mockResolvedValue('OK');
      
      await cacheService.set('test-key', { foo: 'bar' }, 300);
      
      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key', 
        JSON.stringify({ foo: 'bar' }), 
        'EX', 
        300
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Redis error');
      mockRedis.set = vi.fn().mockRejectedValue(error);
      
      await cacheService.set('test-key', { foo: 'bar' });
      
      const { logger } = await import('../utils/logger');
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to set cache for key test-key:',
        error
      );
    });
  });

  describe('get', () => {
    it('should get a value from Redis', async () => {
      mockRedis.get = vi.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' }));
      
      const result = await cacheService.get('test-key');
      
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null for cache miss', async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      
      const result = await cacheService.get('test-key');
      
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      const error = new Error('Redis error');
      mockRedis.get = vi.fn().mockRejectedValue(error);
      
      const result = await cacheService.get('test-key');
      
      const { logger } = await import('../utils/logger');
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get cache for key test-key:',
        error
      );
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a key from Redis', async () => {
      mockRedis.del = vi.fn().mockResolvedValue(1);
      
      await cacheService.delete('test-key');
      
      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('deleteByPattern', () => {
    it('should delete keys matching a pattern', async () => {
      mockRedis.keys = vi.fn().mockResolvedValue(['key1', 'key2']);
      mockRedis.del = vi.fn().mockResolvedValue(2);
      
      await cacheService.deleteByPattern('test-*');
      
      expect(mockRedis.keys).toHaveBeenCalledWith('test-*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
    });

    it('should not call del if no keys match', async () => {
      mockRedis.keys = vi.fn().mockResolvedValue([]);
      mockRedis.del = vi.fn();
      
      await cacheService.deleteByPattern('test-*');
      
      expect(mockRedis.keys).toHaveBeenCalledWith('test-*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedValue = { foo: 'cached' };
      const fetchFn = vi.fn().mockResolvedValue({ foo: 'fresh' });
      
      vi.spyOn(cacheService, 'get').mockResolvedValue(cachedValue);
      vi.spyOn(cacheService, 'set').mockResolvedValue(undefined);
      
      const result = await cacheService.getOrSet('test-key', fetchFn);
      
      expect(cacheService.get).toHaveBeenCalledWith('test-key');
      expect(fetchFn).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
      expect(result).toEqual(cachedValue);
    });

    it('should fetch and cache value if not exists', async () => {
      const freshValue = { foo: 'fresh' };
      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      
      vi.spyOn(cacheService, 'get').mockResolvedValue(null);
      vi.spyOn(cacheService, 'set').mockResolvedValue(undefined);
      
      const result = await cacheService.getOrSet('test-key', fetchFn, 600);
      
      expect(cacheService.get).toHaveBeenCalledWith('test-key');
      expect(fetchFn).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith('test-key', freshValue, 600);
      expect(result).toEqual(freshValue);
    });
  });

  describe('hset and hget', () => {
    it('should set and get a value in a hash', async () => {
      mockRedis.hset = vi.fn().mockResolvedValue(1);
      mockRedis.hget = vi.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' }));
      
      await cacheService.hset('test-hash', 'test-field', { foo: 'bar' });
      const result = await cacheService.hget('test-hash', 'test-field');
      
      expect(mockRedis.hset).toHaveBeenCalledWith('test-hash', 'test-field', JSON.stringify({ foo: 'bar' }));
      expect(mockRedis.hget).toHaveBeenCalledWith('test-hash', 'test-field');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should set TTL on hash when specified', async () => {
      mockRedis.hset = vi.fn().mockResolvedValue(1);
      mockRedis.expire = vi.fn().mockResolvedValue(1);
      
      await cacheService.hset('test-hash', 'test-field', { foo: 'bar' }, 300);
      
      expect(mockRedis.hset).toHaveBeenCalledWith('test-hash', 'test-field', JSON.stringify({ foo: 'bar' }));
      expect(mockRedis.expire).toHaveBeenCalledWith('test-hash', 300);
    });
  });
});
