import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { storage } from './storage';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    firmId?: number;
    firm?: any;
  };
}

// Session storage for remember me tokens
const rememberTokens = new Map<string, { userId: number; expiresAt: Date }>();

// Middleware to check if user is authenticated
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Middleware to check if user is admin
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login function
export const login = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  try {
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Set session data
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.firmId = user.firmId;

    console.log('Setting session data:', { 
      userId: user.id, 
      userRole: user.role, 
      firmId: user.firmId 
    });

    // Also set JWT cookie for better persistence
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        role: user.role, 
        firmId: user.firmId,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    await new Promise((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('✅ Session saved successfully:', {
            userId: req.session.userId,
            userRole: req.session.userRole,
            sessionId: req.sessionID
          });
          resolve(true);
        }
      });
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
    };

    // If user is part of a firm, include firm data
    if (user.firmId) {
      const firm = await storage.getFirm(user.firmId);
      if (firm) {
        userData.firm = {
          id: firm.id,
          name: firm.name,
          slug: firm.slug,
          plan: firm.plan,
          status: firm.status,
          onboarded: firm.settings?.onboarded || false,
        };
      }
    }

    // Handle remember me token
    let rememberToken = null;
    if (rememberMe) {
      rememberToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      rememberTokens.set(rememberToken, {
        userId: user.id,
        expiresAt,
      });
    }

    res.json({
      ...userData,
      rememberToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout function
export const logout = async (req: Request, res: Response) => {
  // Remove remember token if it exists
  const rememberToken = req.headers.authorization?.replace('Bearer ', '');
  if (rememberToken && rememberTokens.has(rememberToken)) {
    rememberTokens.delete(rememberToken);
  }

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.clearCookie('accessToken');
    res.json({ message: 'Logged out successfully' });
  });
};

// Get current session
export const getSession = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'No active session' });
  }

  try {
    // Need to properly extract userId from session
    const userId = req.session?.user?.id || req.session?.userId;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
    };

    // Include firm data if applicable
    if (user.firmId) {
      const firm = await storage.getFirm(user.firmId);
      if (firm) {
        userData.firm = {
          id: firm.id,
          name: firm.name,
          slug: firm.slug,
          plan: firm.plan,
          status: firm.status,
          onboarded: firm.settings?.onboarded || false,
        };
      }
    }

    res.json(userData);
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify remember me token
export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || !rememberTokens.has(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const tokenData = rememberTokens.get(token)!;

  // Check if token is expired
  if (new Date() > tokenData.expiresAt) {
    rememberTokens.delete(token);
    return res.status(401).json({ message: 'Token expired' });
  }

  try {
    const user = await storage.getUser(tokenData.userId);
    if (!user) {
      rememberTokens.delete(token);
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Create new session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
    };

    // Include firm data if applicable
    if (user.firmId) {
      const firm = await storage.getFirm(user.firmId);
      if (firm) {
        userData.firm = {
          id: firm.id,
          name: firm.name,
          slug: firm.slug,
          plan: firm.plan,
          status: firm.status,
          onboarded: firm.settings?.onboarded || false,
        };
      }
    }

    res.json(userData);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};