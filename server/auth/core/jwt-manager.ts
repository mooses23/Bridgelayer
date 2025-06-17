import jwt from 'jsonwebtoken';
import { Request } from 'express';
import crypto from 'crypto';

/**
 * JWT Manager - Core token management for multi-tenant authentication
 * Handles access/refresh tokens, blacklisting, and secure cookie management
 */
export class JWTManager {
  private static readonly ACCESS_TOKEN_EXPIRY = '2h';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly ADMIN_TOKEN_EXPIRY = '4h';
  
  // In-memory blacklist (in production, use Redis or database)
  private static blacklistedTokens = new Set<string>();

  /**
   * Generate access token with user permissions
   */
  static generateAccessToken(payload: {
    userId: number;
    email: string;
    role: string;
    firmId?: number;
    tenantId?: string;
    permissions?: string[];
  }): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        firmId: payload.firmId,
        tenantId: payload.tenantId,
        permissions: payload.permissions || [],
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { 
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: 'firmsync-auth',
        audience: 'firmsync-app'
      }
    );
  }

  /**
   * Generate admin token with elevated permissions
   */
  static generateAdminToken(payload: {
    userId: number;
    email: string;
    role: string;
    permissions: string[];
    tenantScope?: string;
  }): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        tenantScope: payload.tenantScope || 'platform',
        type: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { 
        expiresIn: this.ADMIN_TOKEN_EXPIRY,
        issuer: 'firmsync-auth',
        audience: 'firmsync-admin'
      }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: {
    userId: number;
    tenantId?: string;
    tokenVersion: number;
  }): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    return jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        tokenVersion: payload.tokenVersion,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { 
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: 'firmsync-auth',
        audience: 'firmsync-refresh'
      }
    );
  }

  /**
   * Generate session token for onboarding
   */
  static generateSessionToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate token and return payload
   */
  static async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    error?: string;
  }> {
    try {
      // Check if token is blacklisted
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      if (this.blacklistedTokens.has(tokenHash)) {
        return { valid: false, error: 'Token has been revoked' };
      }

      const secret = process.env.JWT_SECRET || 'fallback-secret-key';
      const decoded = jwt.verify(token, secret, {
        issuer: 'firmsync-auth'
      });

      return { valid: true, payload: decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: 'Token validation failed' };
    }
  }

  /**
   * Extract token from request headers or cookies
   */
  static extractTokenFromRequest(req: Request): string | null {
    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try cookies
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    }

    return null;
  }

  /**
   * Rotate tokens (refresh flow)
   */
  static async rotateTokens(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    newRefreshToken?: string;
    error?: string;
  }> {
    try {
      const validation = await this.validateToken(refreshToken);
      
      if (!validation.valid || validation.payload?.type !== 'refresh') {
        return { success: false, error: 'Invalid refresh token' };
      }

      const { userId, tenantId, tokenVersion } = validation.payload;

      // Blacklist old refresh token
      this.blacklistToken(refreshToken);

      // Generate new tokens
      const newAccessToken = this.generateAccessToken({
        userId,
        email: '', // Would be fetched from database in real implementation
        role: '', // Would be fetched from database
        tenantId
      });

      const newRefreshToken = this.generateRefreshToken({
        userId,
        tenantId,
        tokenVersion: tokenVersion + 1
      });

      return {
        success: true,
        accessToken: newAccessToken,
        newRefreshToken
      };
    } catch (error) {
      console.error('Token rotation error:', error);
      return { success: false, error: 'Token rotation failed' };
    }
  }

  /**
   * Blacklist a token
   */
  static blacklistToken(token: string): void {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    this.blacklistedTokens.add(tokenHash);
    
    // Clean up old tokens periodically (in production, use database with TTL)
    if (this.blacklistedTokens.size > 10000) {
      this.blacklistedTokens.clear();
    }
  }

  /**
   * Get secure cookie options for access token
   */
  static getCookieOptions(isProduction: boolean = false) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' as const : 'lax' as const,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: '/'
    };
  }

  /**
   * Get secure cookie options for refresh token
   */
  static getRefreshCookieOptions(isProduction: boolean = false) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh'
    };
  }

  /**
   * Decode token without validation (for inspection)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}