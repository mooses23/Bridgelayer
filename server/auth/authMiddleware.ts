import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from './jwtUtils';
import { storage } from '../storage';
import { auditLogger } from '../services/auditLogger';

// Extend Express Request type to include JWT user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        firstName: string;
        lastName: string;
        firm?: any;
      };
      tenant?: {
        id: string;
        firmId: number;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload & {
    firstName: string;
    lastName: string;
    firm?: any;
  };
  tenant: {
    id: string;
    firmId: number;
  };
}

/**
 * JWT Authentication Middleware
 * Implements the security requirements from the authentication document
 */
export const jwtAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract JWT token from request
    const token = JWTUtils.extractTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No access token provided'
      });
      return;
    }

    // Verify and decode JWT token
    let payload: JWTPayload;
    try {
      payload = JWTUtils.verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'Access token is invalid or expired'
      });
      return;
    }

    // Validate tenant isolation (critical security check)
    if (!JWTUtils.validateTenantMatch(req, payload)) {
      await auditLogger.logSecurityEvent(
        payload.userId,
        payload.firmId,
        'TENANT_MISMATCH',
        'Token tenant does not match request tenant',
        req.ip,
        req.get('User-Agent')
      );

      res.status(403).json({
        error: 'Tenant mismatch',
        message: 'Access denied for this tenant'
      });
      return;
    }

    // Fetch fresh user data to ensure user still exists and has current permissions
    const user = await storage.getUser(payload.userId);
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
      return;
    }

    // Verify user still belongs to the same firm (prevent privilege escalation)
    if (user.firmId !== payload.firmId) {
      await auditLogger.logSecurityEvent(
        payload.userId,
        payload.firmId,
        'FIRM_MISMATCH',
        'User firm changed since token issued',
        req.ip,
        req.get('User-Agent')
      );

      res.status(403).json({
        error: 'Firm mismatch',
        message: 'User firm has changed'
      });
      return;
    }

    // Attach user data to request
    req.user = {
      ...payload,
      firstName: user.firstName,
      lastName: user.lastName,
      firm: user.firmId ? await storage.getFirm(user.firmId) : null
    };

    // Attach tenant context for data isolation
    req.tenant = {
      id: payload.tenantId,
      firmId: payload.firmId || 0
    };

    // Check if token is near expiry and set header for frontend to refresh
    if (JWTUtils.isTokenNearExpiry(token, 5)) {
      res.setHeader('X-Token-Refresh-Needed', 'true');
    }

    next();
  } catch (error) {
    console.error('JWT Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error', 
      message: 'Internal authentication error'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Admin role authorization
 */
export const requireAdmin = requireRole(['platform_admin', 'admin', 'super_admin']);

/**
 * Firm-level authorization (admin, owner, or staff)
 */
export const requireFirmAccess = requireRole(['firm_admin', 'firm_owner', 'paralegal']);

/**
 * Tenant isolation middleware - ensures all database queries are scoped to tenant
 */
export const enforceTenantIsolation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenant?.firmId && !['platform_admin', 'admin', 'super_admin'].includes(req.user?.role || '')) {
    res.status(403).json({
      error: 'Tenant isolation error',
      message: 'No tenant context available'
    });
    return;
  }

  // Add tenant filter helper to request for database queries
  req.getTenantFilter = () => ({ firmId: req.tenant!.firmId });

  next();
};

/**
 * Optional authentication - for public endpoints that can benefit from user context
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = JWTUtils.extractTokenFromRequest(req);

  if (token) {
    try {
      const payload = JWTUtils.verifyAccessToken(token);
      const user = await storage.getUser(payload.userId);

      if (user && user.firmId === payload.firmId) {
        req.user = {
          ...payload,
          firstName: user.firstName,
          lastName: user.lastName,
          firm: user.firmId ? await storage.getFirm(user.firmId) : null
        };

        req.tenant = {
          id: payload.tenantId,
          firmId: payload.firmId || 0
        };
      }
    } catch (error) {
      // Ignore auth errors for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Add helper method to AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      getTenantFilter?: () => { firmId: number };
    }
  }
}