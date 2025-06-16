import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { auditLogger } from "./services/auditLogger";

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

export interface AuthenticatedRequest extends Request {
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

// Middleware to check if user is authenticated
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('Session check:', {
    sessionExists: !!req.session,
    userId: req.session?.userId,
    userRole: req.session?.userRole,
    sessionId: req.sessionID,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    cookies: req.headers.cookie,
    fullSession: req.session
  });

  // Check if session exists and has userId
  if (!req.session || !req.session.userId) {
    console.log('❌ Authentication failed: No session or userId');
    return res.status(401).json({ message: 'No active session' });
  }

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

  next();
}

// Middleware to check if user is admin
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    const adminRoles = ['platform_admin', 'admin', 'super_admin'];
    if (!req.user || !adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", { email, password });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log("No user found for", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("User found:", { id: user.id, email: user.email, hasPassword: !!user.password });

    const valid = await bcrypt.compare(password, user.password);
    console.log("Password valid?", valid);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session data and save properly before responding
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.firmId = user.firmId;

    console.log('Setting session data:', {
      userId: user.id,
      userRole: user.role,
      firmId: user.firmId
    });

    // Save session before sending response (critical for persistence)
    req.session.save(async (err) => {
      if (err) {
        console.error('Session save failed:', err);
        return res.status(500).json({ error: "Session save failed" });
      }

      console.log('✅ Session saved successfully:', {
        userId: req.session.userId,
        userRole: req.session.userRole,
        sessionId: req.sessionID
      });

      // Determine redirect path based on role and onboarding state
      let redirectPath = '/dashboard'; // default

      try {
        if (user.role === 'admin') {
          redirectPath = '/admin';
        } else if ((user.role === 'firm_owner' || user.role === 'firm_admin' || user.role === 'paralegal') && user.firmId) {
          // Check firm onboarding status
          const firm = await storage.getFirm(user.firmId);
          if (firm && !firm.onboarded) {
            redirectPath = '/onboarding';
          } else {
            redirectPath = '/dashboard';
          }
        }
      } catch (firmLookupError) {
        console.warn('Firm lookup failed, using default redirect:', firmLookupError);
      }

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
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Logout handler
export const logout = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ success: true });
  });
};

// Get current session
export const getSession = async (req: Request, res: Response) => {
  try {
    console.log('getSession check:', {
      sessionExists: !!req.session,
      sessionId: req.sessionID,
      userId: req.session?.userId,
      userRole: req.session?.userRole,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      cookies: req.headers.cookie,
      fullSession: req.session
    });

    if (!req.session || !req.session.userId) {
      console.log('❌ Session check failed: No session or userId');
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
    console.error("Session error:", error);
    res.status(500).json({ message: "Session check failed" });
  }
};