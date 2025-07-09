import { Request, Response, NextFunction } from 'express';
import { JWTManager } from '../core/jwt-manager';
import { storage } from '../../storage';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    firmId?: number | null;
  };
  params: any;
  ip: string;
  originalUrl: string;
  get(name: string): string | undefined;
}

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = JWTManager.extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const validation = await JWTManager.validateToken(token);
    if (!validation.valid) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    // Get user from database
    const user = await storage.getUser(validation.payload.userId);
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
      firmId: user.firmId
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Admin Authorization Middleware
 * Requires admin role after authentication
 */
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const adminRoles = ['platform_admin', 'admin', 'super_admin'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Firm User Authorization Middleware
 * Requires firm_user or firm_admin role after authentication
 */
export const requireFirmUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const firmUserRoles = ['firm_user', 'firm_admin'];
    if (!firmUserRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Firm user access required' });
    }

    if (!req.user.firmId) {
      return res.status(403).json({ message: 'Valid firm association required' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Enhanced Tenant Validation Middleware for Phase 1
 * Validates tenant scope and prevents cross-tenant data leakage
 */

/**
 * Validates that a user can access a specific tenant (firm) by firmCode
 * @param firmCode - The tenant's firm code from URL
 * @param user - The authenticated user object
 * @returns Promise<{valid: boolean, firm?: any, error?: string}>
 */
export const validateTenantScope = async (firmCode: string, user: any): Promise<{valid: boolean, firm?: any, error?: string}> => {
  try {
    if (!firmCode) {
      return { valid: false, error: 'Firm code required' };
    }

    if (!user) {
      return { valid: false, error: 'User authentication required' };
    }

    // Admin users can access any tenant (for admin functions)
    if (['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
      const firm = await storage.getFirmBySlug(firmCode);
      if (!firm) {
        return { valid: false, error: 'Firm not found' };
      }
      return { valid: true, firm };
    }

    // Regular users must belong to the requested firm
    if (!user.firmId) {
      return { valid: false, error: 'User not associated with any firm' };
    }

    const userFirm = await storage.getFirm(user.firmId);
    if (!userFirm) {
      return { valid: false, error: 'User firm not found' };
    }

    // Check if user's firm matches requested firmCode
    if (userFirm.slug !== firmCode) {
      return { 
        valid: false, 
        error: 'Access denied: User can only access their own firm data' 
      };
    }

    return { valid: true, firm: userFirm };
  } catch (error) {
    console.error('Tenant scope validation error:', error);
    return { valid: false, error: 'Tenant validation failed' };
  }
};

/**
 * Enhanced firm code validation with better tenant isolation
 * Replaces the basic validateFirmCode middleware
 */
export const validateFirmCodeEnhanced = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { firmCode } = req.params;
    const validation = await validateTenantScope(firmCode, req.user);

    if (!validation.valid) {
      // Log security violation for audit
      console.warn(`🚨 SECURITY: Tenant access violation blocked`, {
        userId: req.user.id,
        userEmail: req.user.email,
        userFirmId: req.user.firmId,
        requestedFirmCode: firmCode,
        error: validation.error,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        url: req.originalUrl
      });

      return res.status(403).json({ 
        message: validation.error || 'Tenant access denied',
        code: 'TENANT_ACCESS_DENIED'
      });
    }

    // Log successful access for audit trail
    console.log(`✅ Tenant access granted: User ${req.user.id} → Firm ${validation.firm!.id} (${firmCode})`);

    next();
  } catch (error) {
    console.error('Enhanced firm validation error:', error);
    res.status(500).json({ error: 'Firm validation failed' });
  }
};

/**
 * Create middleware that requires authentication
 */
export const createAuthMiddleware = () => {
  return [requireAuth];
};

/**
 * Create middleware that requires admin access
 */
export const createAdminMiddleware = () => {
  return [requireAuth, requireAdmin];
};

/**
 * Create middleware that requires firm user access
 */
export const createFirmUserMiddleware = () => {
  return [requireAuth, requireFirmUser];
};

/**
 * Create enhanced middleware that requires firm user access with enhanced tenant validation
 * Use this instead of createFirmUserWithValidationMiddleware for new routes
 */
export const createFirmUserWithEnhancedValidationMiddleware = () => {
  return [requireAuth, requireFirmUser, validateFirmCodeEnhanced];
};