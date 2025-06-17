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