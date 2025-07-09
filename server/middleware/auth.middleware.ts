import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // For testing purposes, if no auth header, assign a test user
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      req.user = { id: 1, role: 'admin' };
      return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has required role
 */
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};

/**
 * Middleware to check if user belongs to the requested firm
 */
export const belongsToFirm = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const requestedFirmId = parseInt(req.params.firmId);
  
  // Allow admin users to access any firm
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user belongs to the requested firm
  if (req.user.firmId === requestedFirmId) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied to this firm' });
  }
};
