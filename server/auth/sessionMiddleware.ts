import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Session-based Authentication Middleware
 * Replaces JWT system with PostgreSQL session storage
 */
export const sessionAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if session exists and has user data
    if (!req.session || !req.session.userId) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No active session'
      });
      return;
    }

    // Fetch complete user data from database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      res.status(401).json({ 
        error: 'User not found',
        message: 'User account no longer exists'
      });
      return;
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
      firm: null // Will be populated if needed
    };

    // If user has a firm, fetch firm data
    if (user.firmId) {
      const firm = await storage.getFirm(user.firmId);
      if (firm) {
        req.user.firm = firm;
        req.tenant = {
          id: firm.slug,
          firmId: firm.id
        };
      }
    }

    next();
  } catch (error) {
    console.error('Session authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Admin role authentication middleware
 */
export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await sessionAuthMiddleware(req, res, () => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No active session'
      });
      return;
    }

    const adminRoles = ['platform_admin', 'admin', 'super_admin'];
    if (!adminRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Admin access required'
      });
      return;
    }

    next();
  });
};

/**
 * Firm-level authentication middleware
 */
export const firmAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await sessionAuthMiddleware(req, res, () => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No active session'
      });
      return;
    }

    const firmRoles = ['firm_admin', 'paralegal', 'associate'];
    if (!firmRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Firm access required'
      });
      return;
    }

    next();
  });
};