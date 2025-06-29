import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
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
  }
}

// JWT authentication middleware
export const requireModernJWTAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    // Verify JWT token
    const jwtModule = await import('jsonwebtoken');
    const jwt = jwtModule.default || jwtModule;
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const decoded = jwt.verify(accessToken, secret) as any;
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Get user data from database
    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
      firm: user.firmId ? await storage.getFirm(user.firmId) : null
    };

    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin role middleware
export const requireModernJWTAdmin = requireModernJWTAuth;

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Firm user middleware (admin or paralegal)
export const requireFirmUser = requireRole(['firm_admin', 'paralegal']);

// Multi-tenant middleware - ensures user can only access their firm's data
export const requireTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin users can access any tenant
  if (['platform_admin', 'admin', 'super_admin'].includes(req.user.role)) {
    return next();
  }

  // Extract firmId from request (query, params, or body)
  const requestedFirmId = req.params.firmId || req.query.firmId || req.body.firmId;
  
  if (requestedFirmId && parseInt(requestedFirmId) !== req.user.firmId) {
    return res.status(403).json({ message: 'Access denied to this tenant' });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalModernAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return next();
    }

    const jwtModule = await import('jsonwebtoken');
    const jwt = jwtModule.default || jwtModule;
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const decoded = jwt.verify(accessToken, secret) as any;
    const user = await storage.getUserById(decoded.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId,
        firm: user.firmId ? await storage.getFirm(user.firmId) : null
      };
    }
  } catch (error) {
    // Silently continue without authentication
  }
  
  next();
};