import redisClient from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Redis Caching Service
 * Provides methods for caching and retrieving data from Redis
 */
export class CacheService {
  private defaultTTL: number = 3600; // 1 hour in seconds
  
  /**
   * Set a value in the cache
   * 
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.set(key, serializedValue, 'EX', ttl || this.defaultTTL);
      logger.debug(`Cache set: ${key}`);
    } catch (error) {
      logger.error(`Failed to set cache for key ${key}:`, error);
    }
  }
  
  /**
   * Get a value from the cache
   * 
   * @param key - The cache key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      
      if (!value) {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }
      
      logger.debug(`Cache hit: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Failed to get cache for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a value from the cache
   * 
   * @param key - The cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete cache for key ${key}:`, error);
    }
  }
  
  /**
   * Delete multiple values by pattern
   * 
   * @param pattern - The pattern to match keys
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Failed to delete cache by pattern ${pattern}:`, error);
    }
  }
  
  /**
   * Get or set cache value (if not exists)
   * 
   * @param key - The cache key
   * @param fetchFn - Function to fetch data if cache miss
   * @param ttl - Time to live in seconds
   */
  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Set value in hash
   * 
   * @param hash - The hash name
   * @param field - The field name
   * @param value - The value to cache
   * @param ttl - Time to live for the entire hash in seconds
   */
  async hset(hash: string, field: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.hset(hash, field, serializedValue);
      
      // Set expiry on the hash if ttl is provided
      if (ttl) {
        await redisClient.expire(hash, ttl);
      }
      
      logger.debug(`Cache hset: ${hash}:${field}`);
    } catch (error) {
      logger.error(`Failed to set cache for hash ${hash} field ${field}:`, error);
    }
  }
  
  /**
   * Get value from hash
   * 
   * @param hash - The hash name
   * @param field - The field name
   */
  async hget<T>(hash: string, field: string): Promise<T | null> {
    try {
      const value = await redisClient.hget(hash, field);
      
      if (!value) {
        logger.debug(`Cache miss: ${hash}:${field}`);
        return null;
      }
      
      logger.debug(`Cache hit: ${hash}:${field}`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Failed to get cache for hash ${hash} field ${field}:`, error);
      return null;
    }
  }    /**
     * Cache query results with pagination support
     */
    public async cacheQueryResults<T>(
        key: string,
        queryFn: () => Promise<T>,
        ttl: number = 300, // 5 minutes default
        page?: number,
        pageSize?: number
    ): Promise<T> {
        const cacheKey = page && pageSize 
            ? `${key}:page=${page}:size=${pageSize}`
            : key;

        const cached = await this.get<T>(cacheKey);
        if (cached) {
            return cached;
        }

        const results = await queryFn();
        await this.set(cacheKey, results, ttl);
        return results;
    }
  }

  /**
   * Invalidate cached query results for a specific pattern
   */
  public async invalidateQueryCache(pattern: string): Promise<void> {
    await this.deleteByPattern(`${pattern}*`);
  }

  /**
   * Cache query results with firm-specific key
   */
  public async cacheFirmQueryResults<T>(
    firmId: number,
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    return this.cacheQueryResults(
      `firm:${firmId}:${key}`,
      queryFn,
      ttl
    );
  }

  /**
   * Invalidate all cached queries for a specific firm
   */
  public async invalidateFirmCache(firmId: number): Promise<void> {
    await this.deleteByPattern(`firm:${firmId}:*`);
  }
}

// Export singleton instance
export const cacheService = new CacheService();
