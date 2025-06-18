import { Request, Response, NextFunction } from 'express';
import { determineAuthStrategy, AuthStrategyRequest } from '../strategy-router';
import { requireSessionAuth, requireSessionAdmin, requireSessionFirmUser } from '../session-auth';
import { requireJWTAuth, requireJWTAdmin, requireJWTFirmUser, requireJWTTenantAccess } from '../jwt-auth-clean';

/**
 * Unified Authentication Middleware System
 * Routes authentication based on request path strategy
 */

/**
 * Main authentication middleware that routes to appropriate strategy
 */
export const requireAuth = async (req: AuthStrategyRequest, res: Response, next: NextFunction) => {
  const strategy = req.authStrategy || determineAuthStrategy(req);
  
  console.log(`🔀 Using ${strategy} authentication for ${req.method} ${req.path}`);
  
  switch (strategy) {
    case 'session':
      return requireSessionAuth(req, res, next);
    
    case 'jwt':
      return requireJWTAuth(req, res, next);
    
    case 'hybrid':
      // For hybrid routes, we don't require authentication
      // They handle their own authentication logic
      return next();
    
    default:
      console.error(`Unknown authentication strategy: ${strategy}`);
      return res.status(500).json({ message: 'Authentication configuration error' });
  }
};

/**
 * Admin role middleware that routes to appropriate strategy
 */
export const requireAdmin = async (req: AuthStrategyRequest, res: Response, next: NextFunction) => {
  const strategy = req.authStrategy || determineAuthStrategy(req);
  
  console.log(`🔀 Using ${strategy} admin auth for ${req.method} ${req.path}`);
  
  switch (strategy) {
    case 'session':
      return requireSessionAdmin(req, res, next);
    
    case 'jwt':
      // First authenticate with JWT, then check admin role
      await requireJWTAuth(req, res, () => {});
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      return requireJWTAdmin(req, res, next);
    
    case 'hybrid':
      // For hybrid routes, use session auth by default for admin access
      return requireSessionAdmin(req, res, next);
    
    default:
      console.error(`Unknown authentication strategy: ${strategy}`);
      return res.status(500).json({ message: 'Authentication configuration error' });
  }
};

/**
 * Firm user role middleware that routes to appropriate strategy
 */
export const requireFirmUser = async (req: AuthStrategyRequest, res: Response, next: NextFunction) => {
  const strategy = req.authStrategy || determineAuthStrategy(req);
  
  console.log(`🔀 Using ${strategy} firm user auth for ${req.method} ${req.path}`);
  
  switch (strategy) {
    case 'session':
      return requireSessionFirmUser(req, res, next);
    
    case 'jwt':
      // First authenticate with JWT, then check firm user role
      return requireJWTAuth(req, res, (err) => {
        if (err) return next(err);
        return requireJWTFirmUser(req, res, next);
      });
    
    case 'hybrid':
      // For hybrid routes, use session auth by default for firm user access
      return requireSessionFirmUser(req, res, next);
    
    default:
      console.error(`Unknown authentication strategy: ${strategy}`);
      return res.status(500).json({ message: 'Authentication configuration error' });
  }
};

/**
 * Tenant access middleware for multi-tenant isolation
 */
export const requireTenantAccess = async (req: AuthStrategyRequest, res: Response, next: NextFunction) => {
  const strategy = req.authStrategy || determineAuthStrategy(req);
  
  console.log(`🔀 Using ${strategy} tenant access for ${req.method} ${req.path}`);
  
  switch (strategy) {
    case 'session':
      // For session routes, first authenticate then check tenant access
      return requireSessionAuth(req, res, (err) => {
        if (err) return next(err);
        
        // Manual tenant access check for session auth
        if (!req.user) {
          return res.status(401).json({ message: 'Authentication required' });
        }

        // Admin users can access any tenant
        if (['platform_admin', 'admin', 'super_admin'].includes(req.user.role)) {
          return next();
        }

        // Extract firmId from request
        const requestedFirmId = req.params.firmId || req.query.firmId || req.body.firmId;
        
        if (requestedFirmId && parseInt(requestedFirmId as string) !== req.user.firmId) {
          return res.status(403).json({ message: 'Access denied to this tenant' });
        }

        next();
      });
    
    case 'jwt':
      // First authenticate with JWT, then check tenant access
      return requireJWTAuth(req, res, (err) => {
        if (err) return next(err);
        return requireJWTTenantAccess(req, res, next);
      });
    
    case 'hybrid':
      // For hybrid routes, use session-based tenant access
      return requireAuth(req, res, (err) => {
        if (err) return next(err);
        return requireTenantAccess(req, res, next);
      });
    
    default:
      console.error(`Unknown authentication strategy: ${strategy}`);
      return res.status(500).json({ message: 'Authentication configuration error' });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no auth)
 */
export const optionalAuth = async (req: AuthStrategyRequest, res: Response, next: NextFunction) => {
  const strategy = req.authStrategy || determineAuthStrategy(req);
  
  try {
    switch (strategy) {
      case 'session':
        if (req.session && req.session.userId) {
          await requireSessionAuth(req, res, () => {});
        }
        break;
      
      case 'jwt':
        if (req.cookies.accessToken) {
          await requireJWTAuth(req, res, () => {});
        }
        break;
      
      case 'hybrid':
        // Try session first, then JWT
        if (req.session && req.session.userId) {
          await requireSessionAuth(req, res, () => {});
        } else if (req.cookies.accessToken) {
          await requireJWTAuth(req, res, () => {});
        }
        break;
    }
  } catch (error) {
    // Silently continue without authentication for optional auth
    console.log(`Optional auth failed for ${req.path}:`, error instanceof Error ? error.message : 'Unknown error');
  }
  
  next();
};

/**
 * Role checking utilities that work with unified auth
 */
export const hasRole = (req: Request, role: string): boolean => {
  return req.user?.role === role;
};

export const hasAnyRole = (req: Request, roles: string[]): boolean => {
  return req.user?.role ? roles.includes(req.user.role) : false;
};

export const isAdmin = (req: Request): boolean => {
  return hasAnyRole(req, ['platform_admin', 'admin', 'super_admin']);
};

export const isFirmUser = (req: Request): boolean => {
  return hasAnyRole(req, ['firm_admin', 'paralegal']);
};

export const canAccessTenant = (req: Request, firmId: number): boolean => {
  if (isAdmin(req)) return true;
  return req.user?.firmId === firmId;
};

/**
 * Debug middleware to log authentication details
 */
export const debugAuth = (req: AuthStrategyRequest, res: Response, next: NextFunction) => {
  const strategy = req.authStrategy || determineAuthStrategy(req);
  
  console.log('🔍 Auth Debug:', {
    path: req.path,
    method: req.method,
    strategy,
    hasSession: !!(req.session && req.session.userId),
    hasJWT: !!req.cookies.accessToken,
    hasRefreshToken: !!req.cookies.refreshToken,
    user: req.user ? {
      id: req.user.id,
      role: req.user.role,
      firmId: req.user.firmId
    } : null
  });
  
  next();
};

export default {
  requireAuth,
  requireAdmin,
  requireFirmUser,
  requireTenantAccess,
  optionalAuth,
  hasRole,
  hasAnyRole,
  isAdmin,
  isFirmUser,
  canAccessTenant,
  debugAuth
};