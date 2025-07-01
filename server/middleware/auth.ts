import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { FirmRepository } from '../repositories/firm.repository';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, firmUsers } from '../../shared/schema';
import { FirmService } from '../services/firm.service';
import { UserService } from '../services/user.service';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        firmId?: number | null;
        firm?: any;
      };
      firmId?: number;
      tenantContext?: {
        subdomain: string;
        firmId: number | null;
      };
    }
  }
}

// JWT authentication middleware with repository pattern
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check both cookie and authorization header for token
    let accessToken = req.cookies?.accessToken;
    
    // If not in cookie, check authorization header
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.split(' ')[1];
      }
    }
    
    if (!accessToken) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Verify JWT token
    const secret = config.JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret-key';
    
    const decoded = jwt.verify(accessToken, secret) as any;
    
    // For backward compatibility, support both token formats
    const userId = decoded.userId || decoded.sub;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    // Get user data from database using repository
    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Attach user to request
    const firmService = new FirmService();
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
      firm: user.firmId ? await firmService.getFirmById(user.firmId, req.headers['x-tenant-id'] as string || 'default') : null
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

    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const decoded = jwt.verify(accessToken, secret) as any;
    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId, req.headers['x-tenant-id'] as string || 'default');
    
    if (user) {
      const firmService = new FirmService();
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId,
        firm: user.firmId ? await firmService.getFirmById(user.firmId, req.headers['x-tenant-id'] as string || 'default') : null
      };
    }
  } catch (error) {
    // Silently continue without authentication
  }
  
  next();
};

// Auth middleware for protecting routes based on role
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as any;

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach decoded user to request
    req.user = decoded;
    
    // If user is firm_user, attach firmId
    if (decoded.role === 'firm_user') {
      req.firmId = decoded.firmId;
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireFirmUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'firm_user' || !req.firmId) {
    return res.status(403).json({ error: 'Firm access required' });
  }
  next();
};

export const validateOnboardingCode = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.params;
  
  if (!code) {
    return res.status(400).json({ error: 'Onboarding code required' });
  }

  const firm = await db.query.firms.findFirst({
    where: eq(firms.onboardingCode, code)
  });

  if (!firm) {
    return res.status(404).json({ error: 'Invalid onboarding code' });
  }

  req.firmId = firm.id;
  next();
};

export const requireActiveOnboarding = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.firmId) {
    return res.status(400).json({ error: 'Firm context required' });
  }

  const firm = await db.query.firms.findFirst({
    where: eq(firms.id, req.firmId)
  });

  if (!firm || firm.onboardingComplete) {
    return res.status(400).json({ error: 'No active onboarding found' });
  }

  next();
};