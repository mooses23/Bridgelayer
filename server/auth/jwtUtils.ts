import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  tenantId: string;
  role: string;
  email: string;
  firmId?: number | null;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  tenantId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export class JWTUtils {
  private static readonly JWT_SECRET = JWT_SECRET;
  private static readonly REFRESH_SECRET = JWT_SECRET + '_refresh';

  /**
   * Generate access token with user claims
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'firmsync',
      audience: 'firmsync-users'
    });
  }

  /**
   * Generate refresh token for token rotation
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'firmsync',
      audience: 'firmsync-refresh'
    });
  }

  /**
   * Verify access token and return payload
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'firmsync',
        audience: 'firmsync-users'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token and return payload
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_SECRET, {
        issuer: 'firmsync',
        audience: 'firmsync-refresh'
      }) as RefreshTokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Extract token from request (cookie or Authorization header)
   */
  static extractTokenFromRequest(req: Request): string | null {
    // First try HttpOnly cookie (preferred for security)
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    }

    // Fallback to Authorization header for API clients
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Extract refresh token from request
   */
  static extractRefreshTokenFromRequest(req: Request): string | null {
    // Refresh tokens should only be in HttpOnly cookies for security
    return req.cookies?.refreshToken || null;
  }

  /**
   * Extract tenant ID from subdomain or token
   */
  static extractTenantFromRequest(req: Request): string | null {
    // Try to get tenant from subdomain first
    const hostname = req.get('host') || '';
    const parts = hostname.split('.');

    // If we have subdomain.firmsync.com pattern
    if (parts.length >= 3 && parts[1] === 'firmsync') {
      return parts[0];
    }

    // For localhost development, try to get from token
    const token = this.extractTokenFromRequest(req);
    if (token) {
      try {
        const payload = this.verifyAccessToken(token);
        return payload.tenantId;
      } catch {
        // Token invalid, will be handled by auth middleware
      }
    }

    return null;
  }

  /**
   * Validate that request tenant matches token tenant (security check)
   */
  static validateTenantMatch(req: Request, tokenPayload: JWTPayload): boolean {
    const requestTenant = this.extractTenantFromRequest(req);

    // For localhost development, be more lenient
    if (req.get('host')?.includes('localhost') || req.get('host')?.includes('replit')) {
      return true;
    }

    return requestTenant === tokenPayload.tenantId;
  }

  /**
   * Check if token is about to expire (for proactive refresh)
   */
  static isTokenNearExpiry(token: string, thresholdMinutes: number = 5): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded?.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const threshold = thresholdMinutes * 60;

      return decoded.exp - now <= threshold;
    } catch {
      return true;
    }
  }

  /**
   * Generate secure cookie options
   */
  static getCookieOptions(isProduction: boolean = false) {
    return {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict' as const,
      maxAge: isProduction ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000, // 15min prod, 24h dev
      path: '/'
    };
  }

  /**
   * Generate refresh token cookie options
   */
  static getRefreshCookieOptions(isProduction: boolean = false) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth'
    };
  }
}