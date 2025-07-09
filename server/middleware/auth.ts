import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository';
import { FirmRepository } from '../repositories/firm.repository';
import { eq } from 'drizzle-orm';
import { db } from '../db';
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
    const secret = env.JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret-key';
    
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
export const requireModernJWTAdmin = requireAuth;

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

// Tenant validation helper functions for Phase 1 enhancement

/**
 * Validates that a user can access a specific tenant (firm)
 * @param firmCode - The tenant's firm code from URL
 * @param user - The authenticated user object
 * @returns Promise<{valid: boolean, firm?: any, error?: string}>
 */
export const validateTenantScope = async (firmCode: string, user: any): Promise<{valid: boolean, firm?: any, error?: string}> => {
  try {
    // Admin users can access any tenant
    if (user.role === 'admin' || user.role === 'platform_admin' || user.role === 'super_admin') {
      // For admins, we still need to verify the firm exists
      const firmService = new FirmService();
      const firm = await firmService.getFirmBySlug(firmCode);
      if (!firm) {
        return { valid: false, error: 'Firm not found' };
      }
      return { valid: true, firm };
    }

    // Regular users must belong to the requested firm
    if (!user.firmId) {
      return { valid: false, error: 'User not associated with any firm' };
    }

    const firmService = new FirmService();
    const userFirm = await firmService.getFirmById(user.firmId, 'default');
    
    if (!userFirm) {
      return { valid: false, error: 'User firm not found' };
    }

    if (userFirm.slug !== firmCode) {
      return { valid: false, error: 'Access denied: User can only access their own firm' };
    }

    return { valid: true, firm: userFirm };
  } catch (error) {
    console.error('Tenant scope validation error:', error);
    return { valid: false, error: 'Tenant validation failed' };
  }
};

/**
 * Middleware to attach tenant information to request without strict validation
 * Used for routes that need tenant context but don't require strict enforcement
 */
export const attachTenantInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firmCode } = req.params;
    const user = req.user;

    if (firmCode && user) {
      const validation = await validateTenantScope(firmCode, user);
      if (validation.valid && validation.firm) {
        req.tenantContext = {
          subdomain: validation.firm.slug,
          firmId: validation.firm.id
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail the request, just log and continue
    console.warn('Failed to attach tenant info:', error);
    next();
  }
};

/**
 * Enhanced firm user middleware with tenant scope validation
 * Replaces basic requireFirmUser for routes that need tenant isolation
 */
export const requireFirmUserWithTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First ensure user is authenticated and is a firm user
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!['firm_admin', 'paralegal', 'firm_user'].includes(req.user.role)) {
      res.status(403).json({ error: 'Firm user access required' });
      return;
    }

    // Then validate tenant scope if firmCode is in params
    const { firmCode } = req.params;
    if (firmCode) {
      const validation = await validateTenantScope(firmCode, req.user);
      if (!validation.valid) {
        res.status(403).json({ error: validation.error || 'Tenant access denied' });
        return;
      }
      
      // Attach validated tenant context
      req.tenantContext = {
        subdomain: validation.firm!.slug,
        firmId: validation.firm!.id
      };
    }

    next();
  } catch (error) {
    console.error('Firm user tenant validation error:', error);
    res.status(500).json({ error: 'Authentication validation failed' });
  }
};