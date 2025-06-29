import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to protect /app/* routes
 * Ensures user has role 'firm_user' and valid firmCode
 */
export async function requireFirmUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Check session first
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check role
    if (user.role !== 'firm_user') {
      return res.status(403).json({ message: 'Firm user access required' });
    }

    // Check firmId
    if (!user.firmId) {
      return res.status(403).json({ message: 'No firm association' });
    }

    // Optionally validate firmCode from URL params
    const { firmCode } = req.params;
    if (firmCode) {
      const firm = await storage.getFirm(user.firmId);
      if (!firm || firm.slug !== firmCode) {
        return res.status(403).json({ message: 'Invalid firm access' });
      }
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Firm user middleware error:', error);
    res.status(500).json({ message: 'Authorization check failed' });
  }
}
