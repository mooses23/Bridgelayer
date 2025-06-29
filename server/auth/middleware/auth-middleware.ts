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
 * Firm Code Validation Middleware
 * Validates that the firmCode in the URL matches the user's firm
 */
export const validateFirmCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { firmCode } = req.params;
    if (!firmCode) {
      return res.status(400).json({ message: 'Firm code is required' });
    }

    // Get user's firm information to validate firmCode
    const storage = require('../../storage').storage;
    const firm = await storage.getFirmById(req.user.firmId);
    
    if (!firm || firm.subdomain !== firmCode) {
      return res.status(403).json({ message: 'Access denied for this firm' });
    }

    next();
  } catch (error) {
    console.error('Firm validation error:', error);
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
 * Create middleware that requires firm user access with firm validation
 */
export const createFirmUserWithValidationMiddleware = () => {
  return [requireAuth, requireFirmUser, validateFirmCode];
};