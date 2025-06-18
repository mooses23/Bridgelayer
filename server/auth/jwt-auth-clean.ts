import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { type Request, type Response, type NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Clean JWT Authentication System for API Routes
 * Handles stateless JWT authentication with automatic token refresh
 */

const JWT_SECRET = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
const JWT_ACCESS_EXPIRES = '2h';
const JWT_REFRESH_EXPIRES = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  firmId?: number | null;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface JWTAuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    firmId?: number | null;
    firm?: any;
  };
}

/**
 * Generate JWT access and refresh tokens
 */
export function generateJWTTokens(user: any) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firmId: user.firmId
  };

  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
}

/**
 * Set JWT cookies with proper configuration for Replit
 */
export function setJWTCookies(res: Response, accessToken: string, refreshToken: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: false, // Replit development uses HTTP
    sameSite: 'lax' as const, // Changed to lax for better compatibility with same-origin requests
    path: '/'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  console.log('🍪 JWT cookies set:', { 
    accessTokenLength: accessToken.length, 
    refreshTokenLength: refreshToken.length,
    cookieOptions 
  });
}

/**
 * Clear JWT cookies
 */
export function clearJWTCookies(res: Response) {
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    path: '/'
  };
  
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
}

/**
 * Verify JWT token and return payload
 */
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.log('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * JWT Authentication middleware for API routes
 */
export const requireJWTAuth = async (req: JWTAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;

    console.log('🔑 JWT Auth Check:', {
      hasToken: !!token,
      path: req.path,
      cookies: Object.keys(req.cookies || {})
    });

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const payload = verifyJWTToken(token);
    if (!payload || payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    // Get user from database to ensure they still exist
    const user = await storage.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId
    };

    console.log('✅ JWT authentication successful:', { userId: user.id, role: user.role });
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Admin role middleware for JWT-authenticated routes
 */
export const requireJWTAdmin = async (req: JWTAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'platform_admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

/**
 * Firm user role middleware for JWT-authenticated routes
 */
export const requireJWTFirmUser = async (req: JWTAuthenticatedRequest, res: Response, next: NextFunction) => {
  const firmRoles = ['firm_admin', 'paralegal'];
  if (!req.user || !firmRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Firm access required' });
  }
  next();
};

/**
 * Tenant access validation for JWT-authenticated routes
 */
export const requireJWTTenantAccess = (req: JWTAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin users can access any tenant
  if (['platform_admin', 'admin', 'super_admin'].includes(req.user.role)) {
    return next();
  }

  // Extract firmId from request (query, params, or body)
  const requestedFirmId = req.params.firmId || req.query.firmId || req.body.firmId;
  
  if (requestedFirmId && parseInt(requestedFirmId as string) !== req.user.firmId) {
    return res.status(403).json({ message: 'Access denied to this tenant' });
  }

  next();
};

/**
 * JWT token refresh handler
 */
export const refreshJWTTokens = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    console.log('🔄 JWT token refresh attempt:', { hasRefreshToken: !!refreshToken });

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const payload = verifyJWTToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Get user data to generate new tokens
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateJWTTokens(user);

    // Set new cookies
    setJWTCookies(res, accessToken, newRefreshToken);

    console.log('✅ JWT tokens refreshed successfully:', { userId: user.id });

    res.json({ 
      message: 'Tokens refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      }
    });
  } catch (error) {
    console.error('JWT token refresh error:', error);
    res.status(401).json({ message: 'Token refresh failed' });
  }
};

/**
 * JWT-based login handler (for API-only authentication)
 */
export const jwtLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 JWT login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateJWTTokens(user);

    // Set HttpOnly cookies
    setJWTCookies(res, accessToken, refreshToken);

    console.log('✅ JWT login successful:', { userId: user.id, role: user.role });

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      }
    });
  } catch (error) {
    console.error('JWT login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * JWT-based logout handler
 */
export const jwtLogout = async (req: Request, res: Response) => {
  try {
    clearJWTCookies(res);
    console.log('✅ JWT logout successful');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('JWT logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

/**
 * Validate JWT authentication (for API validation)
 */
export const validateJWTAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const payload = verifyJWTToken(token);
    if (!payload || payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      }
    });
  } catch (error) {
    console.error('JWT validation error:', error);
    res.status(401).json({ message: 'Authentication validation failed' });
  }
};

export default {
  generateJWTTokens,
  setJWTCookies,
  clearJWTCookies,
  verifyJWTToken,
  requireJWTAuth,
  requireJWTAdmin,
  requireJWTFirmUser,
  requireJWTTenantAccess,
  refreshJWTTokens,
  jwtLogin,
  jwtLogout,
  validateJWTAuth
};