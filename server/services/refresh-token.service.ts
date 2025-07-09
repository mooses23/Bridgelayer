import { RefreshTokenRepository, RefreshToken, InsertRefreshToken } from '../repositories/refresh-token.repository';
import { cacheService } from './cache.service';
import { ValidationError } from '../middleware/validation.middleware';
import { NotFoundError } from '../utils/errors';

/**
 * Service for managing refresh tokens with Redis caching
 */
export class RefreshTokenService {
  private repository: RefreshTokenRepository;
  private readonly TOKEN_CACHE_PREFIX = 'refresh_token:';
  private readonly USER_TOKENS_CACHE_PREFIX = 'user_refresh_tokens:';
  private readonly TOKEN_CACHE_TTL = 604800; // 7 days in seconds
  
  constructor() {
    this.repository = new RefreshTokenRepository();
  }
  
  /**
   * Create a new refresh token
   */
  async createToken(tokenData: InsertRefreshToken): Promise<RefreshToken> {
    const token = await this.repository.create(tokenData);
    
    // Cache the token
    await cacheService.set(
      `${this.TOKEN_CACHE_PREFIX}${token.token}`, 
      token, 
      this.TOKEN_CACHE_TTL
    );
    
    // Invalidate user tokens cache since we added a new token
    await cacheService.delete(`${this.USER_TOKENS_CACHE_PREFIX}${token.userId}`);
    
    return token;
  }
  
  /**
   * Get a token by its value
   */
  async getByToken(token: string): Promise<RefreshToken | undefined> {
    const cacheKey = `${this.TOKEN_CACHE_PREFIX}${token}`;
    
    // Try to get from cache first
    const cachedToken = await cacheService.get<RefreshToken>(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }
    
    // If not in cache, get from database
    const tokenData = await this.repository.findByToken(token);
    
    // Cache the token if found
    if (tokenData) {
      await cacheService.set(cacheKey, tokenData, this.TOKEN_CACHE_TTL);
    }
    
    return tokenData;
  }
  
  /**
   * Get all tokens for a user
   */
  async getUserTokens(userId: number): Promise<RefreshToken[]> {
    const cacheKey = `${this.USER_TOKENS_CACHE_PREFIX}${userId}`;
    
    // Try to get from cache first
    const cachedTokens = await cacheService.get<RefreshToken[]>(cacheKey);
    if (cachedTokens) {
      return cachedTokens;
    }
    
    // If not in cache, get from database
    const tokens = await this.repository.findByUserId(userId);
    
    // Cache the tokens
    await cacheService.set(cacheKey, tokens, this.TOKEN_CACHE_TTL);
    
    return tokens;
  }
  
  /**
   * Revoke a specific token
   */
  async revokeToken(token: string): Promise<boolean> {
    const tokenData = await this.getByToken(token);
    
    if (!tokenData) {
      throw new NotFoundError('Refresh token not found or already revoked');
    }
    
    const success = await this.repository.revokeToken(token);
    
    if (success) {
      // Invalidate token cache
      await cacheService.delete(`${this.TOKEN_CACHE_PREFIX}${token}`);
      // Invalidate user tokens cache
      await cacheService.delete(`${this.USER_TOKENS_CACHE_PREFIX}${tokenData.userId}`);
    }
    
    return success;
  }
  
  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: number): Promise<number> {
    const count = await this.repository.revokeAllUserTokens(userId);
    
    if (count > 0) {
      // Invalidate user tokens cache
      await cacheService.delete(`${this.USER_TOKENS_CACHE_PREFIX}${userId}`);
      
      // Get current tokens to invalidate individual token caches
      const tokens = await this.repository.findByUserId(userId);
      for (const token of tokens) {
        await cacheService.delete(`${this.TOKEN_CACHE_PREFIX}${token.token}`);
      }
    }
    
    return count;
  }
  
  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const count = await this.repository.cleanupExpiredTokens();
    
    if (count > 0) {
      // Since we can't know which tokens were deleted, we would need to flush the cache
      // This is a maintenance operation, so it's okay to be a bit aggressive with cache invalidation
      await cacheService.deleteByPattern(`${this.TOKEN_CACHE_PREFIX}*`);
      await cacheService.deleteByPattern(`${this.USER_TOKENS_CACHE_PREFIX}*`);
    }
    
    return count;
  }
}

// Export singleton instance
export const refreshTokenService = new RefreshTokenService();
