# Redis Caching Strategy

## Overview

This document outlines the Redis caching strategy implemented in the Firmsync application to optimize performance and reduce database load.

## Cache Service

The application uses a centralized `CacheService` that provides methods for interacting with Redis. Key features:

- Set/get values with optional TTL
- Delete single keys or keys by pattern
- Getters with automatic fetch fallback
- Support for hash operations

## Cached Resources

The following resources are cached:

### User Data
- Key format: `user:id:{id}` and `user:email:{email}`
- TTL: 1 hour
- Invalidation: On user update or delete
- Cache hit: Reduces database queries for frequent user lookups

### Firm Data
- Key format: `firm:id:{id}:tenant:{tenantId}` and `firm:slug:{slug}:tenant:{tenantId}`
- TTL: 1 hour
- Invalidation: On firm update or delete
- Cache hit: Reduces database queries for frequent firm lookups

### Refresh Tokens
- Key format: `refresh_token:{token}` and `user_refresh_tokens:{userId}`
- TTL: 7 days (matching token validity)
- Invalidation: On token revocation or expiration
- Cache hit: Improves token validation performance

## Cache Invalidation Strategies

1. **Direct invalidation**: When a resource is updated or deleted, related cache keys are explicitly invalidated.
2. **TTL-based expiration**: Resources automatically expire from cache after a specified time.
3. **Pattern-based invalidation**: For maintenance operations like cleaning up expired tokens.

## Performance Benefits

- Reduced database load for frequently accessed data
- Lower latency for authentication operations
- Improved throughput for API endpoints

## Monitoring and Maintenance

- Expired tokens are cleaned up daily via scheduled task
- Cache operations are logged for debugging and monitoring

## Future Enhancements

1. **Query result caching**: Cache complex query results for reporting endpoints
2. **Cache warming**: Pre-populate cache for predictable access patterns
3. **Distributed locking**: Implement Redis-based locking for concurrent operations
4. **Cache analytics**: Track hit/miss ratios to tune caching strategy
