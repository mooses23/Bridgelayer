import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { auditLogger } from "../services/auditLogger";
import { createUserSession, destroyUserSession } from "./session-auth";
import { generateJWTTokens, setJWTCookies, clearJWTCookies } from "./jwt-auth-clean";

/**
 * Hybrid Authentication Controller
 * Handles authentication endpoints that create both session and JWT authentication
 */

/**
 * Unified login endpoint that creates both session and JWT authentication
 */
export const hybridLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Hybrid login attempt:", { email });

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

    // Create session for web navigation
    await createUserSession(req, user);
    console.log("✅ Session created for web routes");

    // Generate JWT tokens for API calls
    const { accessToken, refreshToken } = generateJWTTokens(user);
    setJWTCookies(res, accessToken, refreshToken);
    console.log("✅ JWT tokens created for API routes");

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

    // Log successful authentication
    console.log('📝 Login audit log:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      authMethod: 'hybrid',
      redirectPath
    });

    console.log('✅ Hybrid login successful:', { userId: user.id, role: user.role, redirectPath });

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
      redirectPath,
      authMethods: ['session', 'jwt'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Hybrid login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * Unified logout endpoint that destroys both session and JWT authentication
 */
export const hybridLogout = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    
    // Destroy session
    await destroyUserSession(req);
    console.log("✅ Session destroyed");

    // Clear JWT cookies
    clearJWTCookies(res);
    console.log("✅ JWT cookies cleared");

    // Log logout event
    if (userId) {
      console.log('📝 Logout audit log:', {
        userId,
        authMethod: 'hybrid',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Hybrid logout successful');
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully',
      clearedAuth: ['session', 'jwt']
    });
  } catch (error) {
    console.error("Hybrid logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

/**
 * Session validation endpoint (prioritizes session over JWT for web routes)
 */
export const hybridSessionCheck = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Hybrid session validation:', {
      sessionExists: !!req.session,
      sessionId: req.sessionID,
      userId: req.session?.userId,
      userRole: req.session?.userRole,
      hasJWTCookie: !!req.cookies.accessToken
    });

    // Priority 1: Check session for web application
    if (req.session && req.session.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          console.log('✅ Session validation successful');
          return res.json({
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
            },
            authMethod: 'session'
          });
        } else {
          console.log('❌ User not found in database, destroying session');
          req.session.destroy(() => {});
        }
      } catch (userLookupError) {
        console.error('User lookup error:', userLookupError);
        req.session.destroy(() => {});
      }
    }

    // Priority 2: Fallback to JWT validation if no session
    const jwtToken = req.cookies.accessToken;
    if (jwtToken) {
      try {
        const jwt = await import('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
        const payload = jwt.verify(jwtToken, secret) as any;
        
        if (payload && payload.type === 'access') {
          const user = await storage.getUser(payload.userId);
          if (user) {
            console.log('✅ JWT fallback validation successful');
            return res.json({
              userId: payload.userId,
              role: payload.role,
              firmId: payload.firmId,
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                firmId: user.firmId
              },
              authMethod: 'jwt'
            });
          }
        }
      } catch (jwtError) {
        console.log('JWT validation failed:', jwtError instanceof Error ? jwtError.message : 'Unknown error');
      }
    }

    console.log('❌ No valid authentication found');
    return res.status(401).json({ message: "No active session" });

  } catch (error) {
    console.error("Hybrid session check error:", error);
    res.status(500).json({ message: "Session validation failed" });
  }
};

/**
 * Authentication status endpoint for debugging
 */
export const hybridAuthStatus = async (req: Request, res: Response) => {
  try {
    const hasSession = !!(req.session && req.session.userId);
    const hasJWT = !!req.cookies.accessToken;
    const hasRefreshToken = !!req.cookies.refreshToken;

    let sessionValid = false;
    let jwtValid = false;
    let user = null;

    // Check session validity
    if (hasSession && req.session.userId) {
      try {
        user = await storage.getUser(req.session.userId);
        sessionValid = !!user;
      } catch (error) {
        sessionValid = false;
      }
    }

    // Check JWT validity
    if (hasJWT) {
      try {
        const jwt = await import('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
        const payload = jwt.verify(req.cookies.accessToken, secret) as any;
        jwtValid = payload && payload.type === 'access';
        
        if (jwtValid && !user && payload.userId) {
          user = await storage.getUser(payload.userId);
        }
      } catch (error) {
        jwtValid = false;
      }
    }

    res.json({
      authentication: {
        hasSession,
        hasJWT,
        hasRefreshToken,
        sessionValid,
        jwtValid,
        authenticated: sessionValid || jwtValid
      },
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        firmId: user.firmId
      } : null,
      session: hasSession ? {
        userId: req.session.userId,
        userRole: req.session.userRole,
        firmId: req.session.firmId,
        sessionId: req.sessionID
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Auth status check error:", error);
    res.status(500).json({ message: "Auth status check failed" });
  }
};

export default {
  hybridLogin,
  hybridLogout,
  hybridSessionCheck,
  hybridAuthStatus
};