import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { auditLogger } from "../services/auditLogger";

/**
 * Session-Based Authentication System for Web Application Routes
 * Handles traditional web authentication with PostgreSQL session persistence
 */

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        firmId?: number | null;
        firm?: any;
      };
    }
  }
}

// Session type extension
declare module "express-session" {
  interface SessionData {
    userId?: number;
    userRole?: string;
    firmId?: number | null;
  }
}

export interface SessionAuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    firmId?: number | null;
    firm?: any;
  };
}

/**
 * Session authentication middleware for web routes
 */
export const requireSessionAuth = async (req: SessionAuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('🔐 Session Auth Check:', {
    sessionExists: !!req.session,
    userId: req.session?.userId,
    userRole: req.session?.userRole,
    sessionId: req.sessionID,
    path: req.path
  });

  // Check if session exists and has userId
  if (!req.session || !req.session.userId) {
    console.log('❌ Session authentication failed: No session or userId');
    return res.status(401).json({ message: 'No active session' });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    // Set user on request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId
    };

    console.log('✅ Session authentication successful:', { userId: user.id, role: user.role });
    next();
  } catch (error) {
    console.error('Session authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

/**
 * Admin role middleware for session-authenticated routes
 */
export const requireSessionAdmin = async (req: SessionAuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireSessionAuth(req, res, () => {
    const adminRoles = ['platform_admin', 'admin', 'super_admin'];
    if (!req.user || !adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};

/**
 * Firm user role middleware for session-authenticated routes
 */
export const requireSessionFirmUser = async (req: SessionAuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireSessionAuth(req, res, () => {
    const firmRoles = ['firm_admin', 'paralegal'];
    if (!req.user || !firmRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Firm access required" });
    }
    next();
  });
};

/**
 * Create user session after successful authentication
 */
export const createUserSession = async (req: Request, user: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.firmId = user.firmId;

    console.log('💾 Creating session:', {
      userId: user.id,
      userRole: user.role,
      firmId: user.firmId
    });

    req.session.save((err) => {
      if (err) {
        console.error('Session save failed:', err);
        reject(new Error('Session creation failed'));
      } else {
        console.log('✅ Session created successfully:', {
          userId: req.session.userId,
          sessionId: req.sessionID
        });
        resolve();
      }
    });
  });
};

/**
 * Destroy user session
 */
export const destroyUserSession = async (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction failed:', err);
        reject(new Error('Session destruction failed'));
      } else {
        console.log('✅ Session destroyed successfully');
        resolve();
      }
    });
  });
};

/**
 * Get current session user
 */
export const getSessionUser = async (req: Request): Promise<any | null> => {
  if (!req.session || !req.session.userId) {
    return null;
  }

  try {
    const user = await storage.getUser(req.session.userId);
    return user;
  } catch (error) {
    console.error('Session user lookup failed:', error);
    return null;
  }
};

/**
 * Validate and refresh session data
 */
export const validateSession = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Session validation check:', {
      sessionExists: !!req.session,
      sessionId: req.sessionID,
      userId: req.session?.userId,
      userRole: req.session?.userRole
    });

    if (!req.session || !req.session.userId) {
      console.log('❌ Session validation failed: No session or userId');
      return res.status(401).json({ message: "No active session" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      userId: req.session.userId,
      role: req.session.userRole,
      firmId: req.session.firmId,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      }
    });
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(500).json({ message: "Session validation failed" });
  }
};

/**
 * Session-based login handler
 */
export const sessionLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Session login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("👤 User found:", { id: user.id, email: user.email, hasPassword: !!user.password });

    const valid = await bcrypt.compare(password, user.password);
    console.log("🔑 Password valid:", valid);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create session
    await createUserSession(req, user);

    // Determine redirect path based on role and onboarding state
    let redirectPath = '/dashboard'; // default

    try {
      if (user.role === 'admin' || user.role === 'platform_admin' || user.role === 'super_admin') {
        redirectPath = '/admin';
      } else if ((user.role === 'firm_owner' || user.role === 'firm_admin' || user.role === 'paralegal') && user.firmId) {
        // Check firm onboarding status
        const firm = await storage.getFirm(user.firmId);
        if (firm && !firm.onboarded) {
          redirectPath = '/onboarding';
        } else {
          redirectPath = '/dashboard';
        }
      } else if (user.role === 'client') {
        redirectPath = '/client';
      }
    } catch (firmLookupError) {
      console.warn('Firm lookup failed, using default redirect:', firmLookupError);
    }

    console.log('✅ Session login successful:', { userId: user.id, role: user.role, redirectPath });

    res.json({
      message: "Logged in",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      },
      redirectPath
    });
  } catch (error) {
    console.error("Session login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * Session-based logout handler
 */
export const sessionLogout = async (req: Request, res: Response) => {
  try {
    await destroyUserSession(req);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error("Session logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

export default {
  requireSessionAuth,
  requireSessionAdmin,
  requireSessionFirmUser,
  createUserSession,
  destroyUserSession,
  getSessionUser,
  validateSession,
  sessionLogin,
  sessionLogout
};