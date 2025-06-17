import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AdminAuthTypes } from '../types/admin-auth-types';

/**
 * Centralized JWT Token Management
 * Handles token generation, validation, and rotation for multi-tenant authentication
 */
export class JWTManager {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
  private static readonly ACCESS_TOKEN_EXPIRES = '30m';
  private static readonly REFRESH_TOKEN_EXPIRES = '7d';
  private static readonly ALGORITHM = 'HS256';

  // Token blacklist for immediate revocation
  private static tokenBlacklist = new Set<string>();

  /**
   * Generate access token with tenant context
   */
  static generateAccessToken(payload: {
    userId: number;
    email: string;
    role: string;
    firmId?: number | null;
    tenantId?: string;
    permissions?: string[];
  }): string {
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      firmId: payload.firmId,
      tenantId: payload.tenantId,
      permissions: payload.permissions || [],
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    };

    return jwt.sign(tokenPayload, this.JWT_SECRET, {
      algorithm: this.ALGORITHM,
      expiresIn: this.ACCESS_TOKEN_EXPIRES
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: {
    userId: number;
    tenantId?: string;
    tokenVersion?: number;
  }): string {
    const tokenPayload = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      tokenVersion: payload.tokenVersion || 1,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    return jwt.sign(tokenPayload, this.JWT_SECRET, {
      algorithm: this.ALGORITHM,
      expiresIn: this.REFRESH_TOKEN_EXPIRES
    });
  }

  /**
   * Generate session token for database tracking
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate and decode JWT token
   */
  static async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    reason?: string;
  }> {
    try {
      // Check blacklist first
      if (this.tokenBlacklist.has(token)) {
        return { valid: false, reason: 'TOKEN_BLACKLISTED' };
      }

      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: [this.ALGORITHM]
      });

      return { valid: true, payload: decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, reason: 'TOKEN_EXPIRED' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, reason: 'TOKEN_INVALID' };
      }
      return { valid: false, reason: 'VALIDATION_ERROR' };
    }
  }

  /**
   * Extract token from request headers or cookies
   */
  static extractTokenFromRequest(req: any): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    }

    if (req.cookies?.auth_token) {
      return req.cookies.auth_token;
    }

    return null;
  }

  /**
   * Extract tenant ID from request
   */
  static extractTenantFromRequest(req: any): string | null {
    // URL path tenant extraction: /api/tenant/endpoint
    if (req.params?.tenantId) {
      return req.params.tenantId;
    }

    // Subdomain extraction
    const hostname = req.get('host') || '';
    const subdomain = hostname.split('.')[0];
    
    // Skip localhost and known non-tenant subdomains
    if (subdomain && !['localhost', 'www', 'api', 'admin'].includes(subdomain)) {
      return subdomain;
    }

    // Header-based tenant
    if (req.headers['x-tenant-id']) {
      return req.headers['x-tenant-id'];
    }

    return null;
  }

  /**
   * Generate cookie options for secure token storage
   */
  static getCookieOptions(isProduction: boolean = false): any {
    return {
      httpOnly: true,
      secure: isProduction, // HTTPS in production
      sameSite: isProduction ? 'strict' : 'none',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    };
  }

  /**
   * Generate refresh cookie options
   */
  static getRefreshCookieOptions(isProduction: boolean = false): any {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth'
    };
  }

  /**
   * Blacklist token for immediate revocation
   */
  static blacklistToken(token: string): void {
    this.tokenBlacklist.add(token);
    
    // Clean up expired tokens from blacklist periodically
    if (this.tokenBlacklist.size > 10000) {
      this.cleanupBlacklist();
    }
  }

  /**
   * Remove expired tokens from blacklist
   */
  private static cleanupBlacklist(): void {
    const tokensToRemove: string[] = [];
    
    this.tokenBlacklist.forEach(token => {
      try {
        jwt.verify(token, this.JWT_SECRET);
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          tokensToRemove.push(token);
        }
      }
    });
    
    tokensToRemove.forEach(token => this.tokenBlacklist.delete(token));
  }

  /**
   * Rotate tokens - generate new access token from valid refresh token
   */
  static async rotateTokens(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    newRefreshToken?: string;
    reason?: string;
  }> {
    try {
      const validation = await this.validateToken(refreshToken);
      
      if (!validation.valid || validation.payload?.type !== 'refresh') {
        return { success: false, reason: 'INVALID_REFRESH_TOKEN' };
      }

      const payload = validation.payload;
      
      // Generate new tokens
      const newAccessToken = this.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        firmId: payload.firmId,
        tenantId: payload.tenantId,
        permissions: payload.permissions
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: payload.userId,
        tenantId: payload.tenantId,
        tokenVersion: (payload.tokenVersion || 1) + 1
      });

      // Blacklist old refresh token
      this.blacklistToken(refreshToken);

      return {
        success: true,
        accessToken: newAccessToken,
        newRefreshToken: newRefreshToken
      };
    } catch (error) {
      console.error('Token rotation error:', error);
      return { success: false, reason: 'ROTATION_ERROR' };
    }
  }

  /**
   * Validate token permissions for specific operation
   */
  static validateTokenPermissions(
    tokenPayload: any,
    requiredPermission: string
  ): boolean {
    if (!tokenPayload || !tokenPayload.permissions) {
      return false;
    }

    return tokenPayload.permissions.includes(requiredPermission);
  }

  /**
   * Create admin-specific token with elevated permissions
   */
  static generateAdminToken(payload: {
    userId: number;
    email: string;
    role: string;
    permissions: string[];
    tenantScope?: string;
  }): string {
    const tokenPayload = {
      ...payload,
      type: 'admin_access',
      adminLevel: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes for admin tokens
    };

    return jwt.sign(tokenPayload, this.JWT_SECRET, {
      algorithm: this.ALGORITHM,
      expiresIn: '15m'
    });
  }
}