import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { type Request, type Response, type NextFunction } from 'express';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '2h';
const REFRESH_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  firmId?: number | null;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
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

// Generate JWT tokens
export function generateTokens(user: any) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firmId: user.firmId
  };

  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

// Set auth cookies with proper Replit configuration
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: false, // Development mode - internal requests
    sameSite: 'none' as const, // Allow cross-origin transmission
    path: '/',
  };

  res.cookie('auth_token', accessToken, {
    ...cookieOptions,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Clear auth cookies
export function clearAuthCookies(res: Response) {
  res.clearCookie('auth_token');
  res.clearCookie('refresh_token');
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// JWT Authentication middleware
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    // Get user from database
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
      firm: user.firm
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin role middleware
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'platform_admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Login handler with JWT tokens
export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔐 JWT Login attempt:', { email: req.body.email });

    const { email, password } = req.body;
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
    const { accessToken, refreshToken } = generateTokens(user);

    // Set HttpOnly cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Determine redirect path
    let redirectPath = '/dashboard';
    if (user.role === 'admin' || user.role === 'platform_admin' || user.role === 'super_admin') {
      redirectPath = '/admin';
    } else if (user.firmId && !user.firm?.onboardingComplete) {
      redirectPath = '/onboarding';
    }

    console.log('✅ JWT Login successful:', { userId: user.id, role: user.role, redirectPath });

    res.json({
      message: 'Logged in',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      },
      redirectPath
    });
  } catch (error) {
    console.error('JWT Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Logout handler
export const logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ success: true });
};

// Get current session
export const getSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = req.cookies.auth_token;

    console.log('🔍 JWT Session check:', {
      hasToken: !!token,
      cookies: Object.keys(req.cookies)
    });

    if (!token) {
      return res.status(401).json({ message: 'No active session' });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid session token' });
    }

    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ JWT Session valid:', { userId: user.id, role: user.role });

    res.json({
      userId: user.id,
      role: user.role,
      firmId: user.firmId,
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
    console.error('JWT Session error:', error);
    res.status(401).json({ message: 'Session validation failed' });
  }
};

// Token refresh handler
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Token refresh failed' });
  }
};