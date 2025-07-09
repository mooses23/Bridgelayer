import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { firms, users, firmUsers, refreshTokens } from '../../../shared/schema';
import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';

/**
 * Unified Authentication Controller
 * Merges JWT and session-based authentication with role-based access control
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - JWT_SECRET: Secret key for signing JWT tokens (min 32 characters)
 * - OWNER_MASTER_KEY: Master key required for owner-level authentication
 * - JWT_EXPIRES_IN: Access token expiration time (default: 15m)
 * - REFRESH_TOKEN_EXPIRES_IN: Refresh token expiration time (default: 7d)
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - MICROSOFT_CLIENT_ID: Microsoft OAuth client ID
 * - MICROSOFT_CLIENT_SECRET: Microsoft OAuth client secret
 * - GITHUB_CLIENT_ID: GitHub OAuth client ID
 * - GITHUB_CLIENT_SECRET: GitHub OAuth client secret
 */
class AuthController {
  private JWT_SECRET: string;
  private JWT_EXPIRES_IN: string;
  private REFRESH_TOKEN_EXPIRES_IN: string;
  private isProduction: boolean;
  private googleClient: OAuth2Client;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.isProduction = process.env.NODE_ENV === 'production';

    // Initialize OAuth clients
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  /**
   * Extract tenant information from request
   */
  extractTenantFromRequest(req) {
    // Try subdomain first
    const host = req.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }
    
    // Fallback to header or query parameter
    return req.headers['x-tenant-id'] || req.query.tenant || 'default';
  }

  /**
   * Generate JWT tokens and store refresh token
   */
  private async generateTokens(user: any) {
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        firmId: user.firmId
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    const refreshToken = randomBytes(40).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Store hashed refresh token
    await db.insert(refreshTokens).values({
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt,
      createdAt: new Date()
    });

    return { accessToken, refreshToken };
  }

  /**
   * Set secure cookies for tokens
   */
  setTokenCookies(res, accessToken, refreshToken) {
    const cookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  /**
   * Clear authentication cookies
   */
  clearTokenCookies(res) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  /**
   * Create user session
   */
  async createUserSession(req, user) {
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.firmId = user.firmId;
      req.session.email = user.email;
      // Set req.session.user with role for easy access
      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firmId: user.firmId,
        firstName: user.firstName,
        lastName: user.lastName
      };
    }
  }

  /**
   * Destroy user session
   */
  async destroyUserSession(req) {
    return new Promise((resolve) => {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Validate tenant access for user
   */
  async validateTenantAccess(user, tenantId) {
    if (['platform_admin', 'super_admin'].includes(user.role)) {
      return true;
    }

    if (user.firmId && tenantId !== 'default') {
      try {
        const firmService = new FirmService();
        const firm = await firmService.getFirmById(user.firmId, tenantId);
        return firm && firm.slug === tenantId;
      } catch (error) {
        console.error('Tenant validation error:', error);
        return false;
      }
    }

    return tenantId === 'default';
  }

  /**
   * Owner login - highest level access
   */
  async ownerLogin(req, res) {
    try {
      const { email, password, masterKey } = req.body;

      if (!email || !password || !masterKey) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Email, password, and master key are required for owner login'
        });
      }

      // Verify master key
      const expectedMasterKey = process.env.OWNER_MASTER_KEY;
      if (!expectedMasterKey || masterKey !== expectedMasterKey) {
        return res.status(403).json({
          error: 'Invalid master key',
          message: 'Owner master key is invalid'
        });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== 'super_admin') {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Owner account not found'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid password'
        });
      }

      // Create both session and JWT tokens
      await this.createUserSession(req, user);
      const { accessToken, refreshToken } = this.generateTokens(user, 'platform');
      this.setTokenCookies(res, accessToken, refreshToken);

      res.json({
        success: true,
        message: 'Owner login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId
        },
        redirectPath: '/admin/platform',
        authMethods: ['session', 'jwt'],
        accessLevel: 'owner'
      });

    } catch (error) {
      console.error('Owner login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'Internal server error during owner login'
      });
    }
  }

  /**
   * Admin login - platform and firm admin access
   */
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !['admin', 'platform_admin', 'super_admin'].includes(user.role)) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Admin account not found'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid password'
        });
      }

      const tenantId = this.extractTenantFromRequest(req);
      
      // Validate tenant access
      const hasAccess = await this.validateTenantAccess(user, tenantId);
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Invalid tenant access for admin'
        });
      }

      // Create both session and JWT tokens
      await this.createUserSession(req, user);
      const { accessToken, refreshToken } = this.generateTokens(user, tenantId);
      this.setTokenCookies(res, accessToken, refreshToken);

      let redirectPath = '/admin';
      if (user.role === 'platform_admin' || user.role === 'super_admin') {
        redirectPath = '/admin/platform';
      }

      res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId
        },
        redirectPath,
        authMethods: ['session', 'jwt'],
        accessLevel: 'admin'
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'Internal server error during admin login'
      });
    }
  }

  /**
   * Tenant login - regular user and client access
   */
  async tenantLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      const tenantId = this.extractTenantFromRequest(req);

      // Validate tenant access for regular users
      const hasAccess = await this.validateTenantAccess(user, tenantId);
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Invalid tenant access'
        });
      }

      // Create both session and JWT tokens
      await this.createUserSession(req, user);
      const { accessToken, refreshToken } = this.generateTokens(user, tenantId);
      this.setTokenCookies(res, accessToken, refreshToken);

      // Determine redirect path based on role and onboarding status
      let redirectPath = '/dashboard';
      try {
        if (user.role === 'client') {
          redirectPath = '/client';
        } else if (user.firmId) {
          const firmService = new FirmService();
          const firm = await firmService.getFirmById(user.firmId, tenantId);
          if (firm && !firm.onboarded) {
            redirectPath = '/onboarding';
          }
        }
      } catch (error) {
        console.error('Redirect path determination error:', error);
        // Continue with default redirect path
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId
        },
        redirectPath,
        authMethods: ['session', 'jwt'],
        accessLevel: 'tenant'
      });

    } catch (error) {
      console.error('Tenant login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'Internal server error during tenant login'
      });
    }
  }

  /**
   * Unified logout
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        // Find and delete refresh token
        const tokens = await db.select()
          .from(refreshTokens)
          .where(
            eq(refreshTokens.expiresAt, new Date())
          );

        const validToken = tokens.find(token => 
          bcrypt.compareSync(refreshToken, token.token)
        );

        if (validToken) {
          await db.delete(refreshTokens)
            .where(eq(refreshTokens.id, validToken.id));
        }
      }

      // Destroy session
      await this.destroyUserSession(req);

      // Clear JWT cookies
      this.clearTokenCookies(res);

      res.json({
        success: true,
        message: 'Logout successful',
        clearedAuth: ['session', 'jwt']
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
    }
  }

  /**
   * Enhanced session validation with fallback
   */
  async validateSession(req, res) {
    try {
      let user = null;
      let authMethod = null;

      // Priority 1: Check server-side session
      if (req.session && req.session.userId) {
        try {
          user = await storage.getUser(req.session.userId);
          if (user) {
            authMethod = 'session';
          } else {
            // Session user not found, destroy invalid session
            await this.destroyUserSession(req);
          }
        } catch (error) {
          console.error('Session user lookup error:', error);
          await this.destroyUserSession(req);
        }
      }

      // Priority 2: Fallback to JWT token validation
      if (!user) {
        const token = req.cookies.accessToken;
        if (token) {
          try {
            const payload = jwt.verify(token, this.JWT_SECRET);
            if (payload && payload.type === 'access') {
              user = await storage.getUser(payload.userId);
              if (user) {
                authMethod = 'jwt';
                
                // Validate tenant access if tenant is specified
                if (payload.tenantId && payload.tenantId !== 'default') {
                  const hasAccess = await this.validateTenantAccess(user, payload.tenantId);
                  if (!hasAccess) {
                    return res.status(403).json({
                      error: 'Access denied',
                      message: 'Invalid tenant access'
                    });
                  }
                }
              }
            }
          } catch (jwtError) {
            // JWT is invalid or expired, clear the cookie
            this.clearTokenCookies(res);
          }
        }
      }

      if (!user) {
        return res.status(401).json({
          error: 'No active session',
          message: 'Authentication required'
        });
      }

      // Return session information
      res.json({
        success: true,
        userId: user.id,
        role: user.role,
        firmId: user.firmId,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        authMethod,
        tenantId: req.session?.tenantId || 'default'
      });

    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({
        error: 'Session validation failed',
        message: 'Internal server error during session validation'
      });
    }
  }

  /**
   * Refresh JWT tokens
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ 
          success: false,
          error: 'Refresh token required',
          code: 'REFRESH_TOKEN_REQUIRED'
        });
      }

      // Find valid refresh token
      const existingTokens = await db.select()
        .from(refreshTokens)
        .where(
          eq(refreshTokens.expiresAt, new Date())
        );

      const validToken = existingTokens.find(token => 
        bcrypt.compareSync(refreshToken, token.token)
      );

      if (!validToken) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Get user data
      const user = await db.select()
        .from(users)
        .where(eq(users.id, validToken.userId))
        .limit(1);

      if (!user[0]) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user[0]);

      // Delete old refresh token
      await db.delete(refreshTokens)
        .where(eq(refreshTokens.id, validToken.id));

      return res.json({
        success: true,
        ...tokens
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Dual-mode login handler for BridgeLayer admin and FirmSync users
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password, mode } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // BridgeLayer Admin Login
      if (mode === 'bridgelayer') {
        const admin = await db.query.users.findFirst({
          where: eq(users.email, email),
          columns: {
            id: true,
            email: true,
            password: true,
            role: true
          }
        });

        if (!admin || admin.role !== 'admin') {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate admin tokens
        const { accessToken, refreshToken } = this.generateTokens({
          id: admin.id,
          email: admin.email,
          role: 'admin'
        });

        return res.json({
          user: { id: admin.id, email: admin.email, role: 'admin' },
          accessToken,
          refreshToken,
          redirect: '/admin'
        });
      }

      // FirmSync User Login
      if (mode === 'firm') {
        const firmUser = await db.query.firmUsers.findFirst({
          where: eq(firmUsers.email, email),
          columns: {
            id: true,
            email: true,
            password: true,
            firmId: true,
            role: true
          },
          with: {
            firm: {
              columns: {
                id: true,
                name: true,
                status: true,
                onboardingComplete: true
              }
            }
          }
        });

        if (!firmUser || !firmUser.firm) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, firmUser.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check firm status
        if (firmUser.firm.status !== 'active') {
          return res.status(403).json({ error: 'Firm account is not active' });
        }

        // Generate firm user tokens
        const { accessToken, refreshToken } = this.generateTokens({
          id: firmUser.id,
          email: firmUser.email,
          role: 'firm_user',
          firmId: firmUser.firmId
        });

        return res.json({
          user: {
            id: firmUser.id,
            email: firmUser.email,
            role: 'firm_user',
            firmId: firmUser.firmId,
            firmName: firmUser.firm.name
          },
          accessToken,
          refreshToken,
          redirect: firmUser.firm.onboardingComplete ? '/firm' : '/firm/onboarding'
        });
      }

      return res.status(400).json({ error: 'Invalid login mode' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handle OAuth logins
   */
  async handleOAuthCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;
      const provider = state?.toString().split(':')[0];
      
      if (!code || !provider) {
        return res.status(400).send(`
          <script>
            window.opener.postMessage({ type: 'oauth_error', error: 'Invalid request' }, '${process.env.APP_URL}');
            window.close();
          </script>
        `);
      }

      let userInfo;
      switch (provider) {
        case 'google':
          userInfo = await this.verifyGoogleToken(code.toString());
          break;
        // Add other providers here
        default:
          throw new Error('Unsupported provider');
      }

      // Find or create user
      let user = await db.select()
        .from(users)
        .where(eq(users.email, userInfo.email))
        .limit(1);

      if (!user[0]) {
        // Create new user
        const [newUser] = await db.insert(users)
          .values({
            email: userInfo.email,
            role: 'firm_user', // Default to firm user for OAuth
            oauthProvider: provider,
            oauthId: userInfo.id,
            createdAt: new Date()
          })
          .returning();
        
        user = [newUser];
      }

      // Generate tokens
      const tokens = await this.generateTokens(user[0]);

      // Return success response
      return res.send(`
        <script>
          window.opener.postMessage({
            type: 'oauth_success',
            ...${JSON.stringify({
              ...tokens,
              user: {
                id: user[0].id,
                email: user[0].email,
                role: user[0].role
              }
            })}
          }, '${process.env.APP_URL}');
          window.close();
        </script>
      `);
    } catch (error) {
      console.error('OAuth error:', error);
      return res.status(500).send(`
        <script>
          window.opener.postMessage({
            type: 'oauth_error',
            error: 'Authentication failed'
          }, '${process.env.APP_URL}');
          window.close();
        </script>
      `);
    }
  }

  /**
   * Verify Google OAuth token
   */
  private async verifyGoogleToken(code: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: code,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid token');

    return {
      id: payload.sub,
      email: payload.email!,
      name: payload.name,
      picture: payload.picture
    };
  }
}

// Create singleton instance
const authController = new AuthController();

module.exports = {
  // Preferred naming convention (as requested)
  loginOwner: authController.ownerLogin.bind(authController),
  loginAdmin: authController.adminLogin.bind(authController),
  loginTenant: authController.tenantLogin.bind(authController),
  // Legacy naming for backward compatibility
  ownerLogin: authController.ownerLogin.bind(authController),
  adminLogin: authController.adminLogin.bind(authController),
  tenantLogin: authController.tenantLogin.bind(authController),
  // Session management
  logout: authController.logout.bind(authController),
  validateSession: authController.validateSession.bind(authController),
  refreshToken: authController.refreshToken.bind(authController),
  AuthController
};

// Test Plan
/*
1. Owner routes:
   - POST /owner/login: Test owner login with valid/invalid credentials.
   - GET /owner/dashboard: Access owner dashboard (requires owner login).

2. Admin routes:
   - POST /admin/login: Test admin login with valid/invalid credentials.
   - GET /admin/dashboard: Access admin dashboard (requires admin login).

3. Tenant routes:
   - POST /tenant/login: Test tenant login with valid/invalid credentials.
   - GET /tenant/dashboard: Access tenant dashboard (requires tenant login).

4. Error handling:
   - Test unauthorized access to protected routes (e.g., /admin/dashboard) without login.
   - Test invalid token handling by accessing routes with expired/invalid JWT.
   - Test session expiration and re-login flow.
*/
