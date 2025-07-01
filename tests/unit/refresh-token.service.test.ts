import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefreshTokenService } from '../services/refresh-token.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { cacheService } from '../services/cache.service';

// Mock repositories and services
vi.mock('../repositories/refresh-token.repository');
vi.mock('../services/cache.service', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    deleteByPattern: vi.fn()
  }
}));

describe('RefreshTokenService', () => {
  let refreshTokenService: RefreshTokenService;
  let mockRepository: jest.Mocked<RefreshTokenRepository>;
  
  const mockToken = {
    id: 1,
    token: 'test-token',
    userId: 123,
    expiresAt: new Date(Date.now() + 86400000), // 1 day in the future
    createdAt: new Date(),
    revokedAt: null,
    tenantId: 'test-tenant'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up repository mocks
    mockRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    RefreshTokenRepository.prototype.create = vi.fn().mockResolvedValue(mockToken);
    RefreshTokenRepository.prototype.findByToken = vi.fn().mockResolvedValue(mockToken);
    RefreshTokenRepository.prototype.findByUserId = vi.fn().mockResolvedValue([mockToken]);
    RefreshTokenRepository.prototype.revokeToken = vi.fn().mockResolvedValue(true);
    RefreshTokenRepository.prototype.revokeAllUserTokens = vi.fn().mockResolvedValue(1);
    RefreshTokenRepository.prototype.cleanupExpiredTokens = vi.fn().mockResolvedValue(5);
    
    refreshTokenService = new RefreshTokenService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createToken', () => {
    it('should create a token and cache it', async () => {
      const tokenData = {
        token: 'new-token',
        userId: 123,
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        tenantId: 'test-tenant'
      };
      
      await refreshTokenService.createToken(tokenData);
      
      expect(RefreshTokenRepository.prototype.create).toHaveBeenCalledWith(tokenData);
      expect(cacheService.set).toHaveBeenCalledWith(
        'refresh_token:test-token',
        mockToken,
        604800
      );
      expect(cacheService.delete).toHaveBeenCalledWith('user_refresh_tokens:123');
    });
  });

  describe('getByToken', () => {
    it('should return token from cache if available', async () => {
      vi.mocked(cacheService.get).mockResolvedValueOnce(mockToken);
      
      const result = await refreshTokenService.getByToken('test-token');
      
      expect(cacheService.get).toHaveBeenCalledWith('refresh_token:test-token');
      expect(RefreshTokenRepository.prototype.findByToken).not.toHaveBeenCalled();
      expect(result).toEqual(mockToken);
    });

    it('should fetch from database and cache if not in cache', async () => {
      vi.mocked(cacheService.get).mockResolvedValueOnce(null);
      
      const result = await refreshTokenService.getByToken('test-token');
      
      expect(cacheService.get).toHaveBeenCalledWith('refresh_token:test-token');
      expect(RefreshTokenRepository.prototype.findByToken).toHaveBeenCalledWith('test-token');
      expect(cacheService.set).toHaveBeenCalledWith(
        'refresh_token:test-token',
        mockToken,
        604800
      );
      expect(result).toEqual(mockToken);
    });
  });

  describe('getUserTokens', () => {
    it('should return tokens from cache if available', async () => {
      vi.mocked(cacheService.get).mockResolvedValueOnce([mockToken]);
      
      const result = await refreshTokenService.getUserTokens(123);
      
      expect(cacheService.get).toHaveBeenCalledWith('user_refresh_tokens:123');
      expect(RefreshTokenRepository.prototype.findByUserId).not.toHaveBeenCalled();
      expect(result).toEqual([mockToken]);
    });

    it('should fetch from database and cache if not in cache', async () => {
      vi.mocked(cacheService.get).mockResolvedValueOnce(null);
      
      const result = await refreshTokenService.getUserTokens(123);
      
      expect(cacheService.get).toHaveBeenCalledWith('user_refresh_tokens:123');
      expect(RefreshTokenRepository.prototype.findByUserId).toHaveBeenCalledWith(123);
      expect(cacheService.set).toHaveBeenCalledWith(
        'user_refresh_tokens:123',
        [mockToken],
        604800
      );
      expect(result).toEqual([mockToken]);
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token and invalidate cache', async () => {
      vi.mocked(cacheService.get).mockResolvedValueOnce(mockToken);
      
      const result = await refreshTokenService.revokeToken('test-token');
      
      expect(RefreshTokenRepository.prototype.revokeToken).toHaveBeenCalledWith('test-token');
      expect(cacheService.delete).toHaveBeenCalledWith('refresh_token:test-token');
      expect(cacheService.delete).toHaveBeenCalledWith('user_refresh_tokens:123');
      expect(result).toBe(true);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all user tokens and invalidate cache', async () => {
      const result = await refreshTokenService.revokeAllUserTokens(123);
      
      expect(RefreshTokenRepository.prototype.revokeAllUserTokens).toHaveBeenCalledWith(123);
      expect(cacheService.delete).toHaveBeenCalledWith('user_refresh_tokens:123');
      expect(result).toBe(1);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should clean up expired tokens and invalidate cache', async () => {
      const result = await refreshTokenService.cleanupExpiredTokens();
      
      expect(RefreshTokenRepository.prototype.cleanupExpiredTokens).toHaveBeenCalled();
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith('refresh_token:*');
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith('user_refresh_tokens:*');
      expect(result).toBe(5);
    });
  });
});
