const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { storage } = require('./storage');

/**
 * Unified Authentication Controller
 * Merges JWT and session-based authentication with role-based access control
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - JWT_SECRET: Secret key for signing JWT tokens (min 32 characters)
 * - OWNER_MASTER_KEY: Master key required for owner-level authentication
 * - JWT_EXPIRES_IN: Access token expiration time (default: 15m)
 * - REFRESH_TOKEN_EXPIRES_IN: Refresh token expiration time (default: 7d)
 */
class AuthController {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.isProduction = process.env.NODE_ENV === 'production';
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
   * Generate JWT tokens
   */
  generateTokens(user, tenantId = 'default') {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firmId: user.firmId,
      tenantId,
      type: 'access'
    };

    const refreshPayload = {
      userId: user.id,
      tenantId,
      type: 'refresh',
      tokenVersion: user.tokenVersion || 1
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(refreshPayload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
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
    // Platform admins and super admins can access any tenant
    if (['platform_admin', 'super_admin'].includes(user.role)) {
      return true;
    }

    // For firm-based users, check if tenant matches firm slug
    if (user.firmId && tenantId !== 'default') {
      try {
        const firm = await storage.getFirm(user.firmId);
        return firm && firm.slug === tenantId;
      } catch (error) {
        console.error('Tenant validation error:', error);
        return false;
      }
    }

    // Default tenant access for users without firm
    return tenantId === 'default';
  }

  /**
   * Owner login - highest level access
   */
  async ownerLogin(req, res) {
    try {
      // Ensure response is always JSON
      res.setHeader('Content-Type', 'application/json');

      const { email, password, masterKey } = req.body;

      // Validate required fields
      if (!email || !password || !masterKey) {
        console.log('Owner login attempt with missing credentials:', { 
          hasEmail: !!email, 
          hasPassword: !!password, 
          hasMasterKey: !!masterKey 
        });
        return res.status(400).json({
          success: false,
          error: 'Missing credentials',
          message: 'Email, password, and master key are required for owner login',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Owner login attempt with invalid email format:', email);
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL_FORMAT'
        });
      }

      // Verify master key
      const expectedMasterKey = process.env.OWNER_MASTER_KEY;
      if (!expectedMasterKey) {
        console.error('Owner master key not configured in environment variables');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error',
          message: 'Owner authentication is not properly configured',
          code: 'MASTER_KEY_NOT_CONFIGURED'
        });
      }

      if (masterKey !== expectedMasterKey) {
        console.log('Owner login attempt with invalid master key for email:', email);
        return res.status(403).json({
          success: false,
          error: 'Invalid master key',
          message: 'Owner master key is invalid',
          code: 'INVALID_MASTER_KEY'
        });
      }

      // Get user from database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log('Owner login attempt with non-existent email:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Owner account not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify user has owner privileges
      if (user.role !== 'super_admin') {
        console.log('Owner login attempt by non-owner user:', { email, role: user.role });
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Owner account not found',
          code: 'INSUFFICIENT_PRIVILEGES'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Owner login attempt with invalid password for email:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid password',
          code: 'INVALID_PASSWORD'
        });
      }

      // Create both session and JWT tokens
      await this.createUserSession(req, user);
      const { accessToken, refreshToken } = this.generateTokens(user, 'platform');
      this.setTokenCookies(res, accessToken, refreshToken);

      // Log successful login
      console.log('Successful owner login:', { 
        userId: user.id, 
        email: user.email, 
        sessionId: req.sessionID 
      });

      // Return successful response with user details and tokens
      return res.status(200).json({
        success: true,
        message: 'Owner login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens: {
          accessToken,
          refreshToken,
          sessionId: req.sessionID
        },
        redirectPath: '/admin/platform',
        authMethods: ['session', 'jwt'],
        accessLevel: 'owner',
        loginTime: new Date().toISOString()
      });

    } catch (error) {
      console.error('Owner login error:', error);
      
      // Handle specific error types
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      if (error.name === 'DatabaseError' || error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please try again later.',
          code: 'DATABASE_ERROR'
        });
      }

      // Generic server error
      return res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'Internal server error during owner login',
        code: 'INTERNAL_SERVER_ERROR'
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
          const firm = await storage.getFirm(user.firmId);
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
  async refreshTokens(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          error: 'No refresh token',
          message: 'Refresh token required'
        });
      }

      let payload;
      try {
        payload = jwt.verify(refreshToken, this.JWT_SECRET);
      } catch (error) {
        this.clearTokenCookies(res);
        return res.status(401).json({
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired'
        });
      }

      if (payload.type !== 'refresh') {
        return res.status(401).json({
          error: 'Invalid token type',
          message: 'Token is not a refresh token'
        });
      }

      const user = await storage.getUser(payload.userId);
      if (!user) {
        this.clearTokenCookies(res);
        return res.status(401).json({
          error: 'User not found',
          message: 'User account no longer exists'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user, payload.tenantId);
      this.setTokenCookies(res, accessToken, newRefreshToken);

      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        token: accessToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        message: 'Internal server error during token refresh'
      });
    }
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
  refreshTokens: authController.refreshTokens.bind(authController),
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
