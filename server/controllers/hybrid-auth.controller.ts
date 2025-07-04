import { Request, Response } from 'express';
import { HybridAuthService } from '../services/hybrid-auth.service';
import { FirmService } from '../services/firm.service';
import { ValidationService } from '../services/validation.service';
import { auditLog } from '../logging';

/**
 * Controller for hybrid authentication operations
 * Supports both session-based and JWT token-based authentication
 */
export class HybridAuthController {
  private hybridAuthService: HybridAuthService;
  private firmService: FirmService;
  private validationService: ValidationService;
  
  constructor() {
    this.hybridAuthService = new HybridAuthService();
    this.firmService = new FirmService();
    this.validationService = new ValidationService();
  }

  /**
   * @swagger
   * /api/hybrid-auth/login:
   *   post:
   *     summary: Hybrid authentication login
   *     tags: [Hybrid Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  /**
   * Login handler that supports both session and JWT authentication
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.validated;
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Audit the login attempt
      auditLog({
        action: 'LOGIN_ATTEMPT',
        actor: email,
        targetType: 'auth',
        targetId: email,
        status: 'PENDING',
        details: { method: 'password', tenantId },
        ipAddress: req.ip
      });

      // Authenticate user with tenant context
      const result = await this.hybridAuthService.authenticate(email, password, tenantId);
      
      if (!result.success) {
        auditLog({
          action: 'LOGIN_ATTEMPT',
          actor: email,
          targetType: 'auth',
          targetId: email,
          status: 'FAILED',
          details: { reason: result.error, tenantId },
          ipAddress: req.ip
        });
        return res.status(401).json({ success: false, message: result.error });
      }
      
      const { user, accessToken, refreshToken } = result;

      // Create session if it exists on the request
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.firmId = user.firmId;
        req.session.email = user.email;
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          tenantId
        };
      }
      
      // Set cookies for web clients
      if (!req.headers['x-api-client']) {
        const isProduction = process.env.NODE_ENV === 'production';
        // Set the access token cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction, 
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
        
        // Set the refresh token cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      // Audit successful login
      auditLog({
        action: 'LOGIN',
        actor: email,
        targetType: 'auth',
        targetId: email,
        status: 'SUCCESS',
        details: { 
          userId: user.id, 
          role: user.role, 
          authMethods: ['session', 'jwt'],
          tenantId 
        },
        ipAddress: req.ip
      });
      
      // Return tokens in response for API clients
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        ...(req.headers['x-api-client'] ? { accessToken, refreshToken } : {})
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }

  /**
   * @swagger
   * /api/hybrid-auth/register:
   *   post:
   *     summary: Hybrid authentication register
   *     tags: [Hybrid Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               firmCode:
   *                 type: string
   *     responses:
   *       200:
   *         description: Registration successful
   *       400:
   *         description: Invalid input or firm code
   */
  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, firmCode } = req.validated;
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Check if firm code is valid first
      let firmId: number | undefined;
      if (firmCode) {
        const firm = await this.firmService.getFirmByCode(firmCode, tenantId);
        if (!firm) {
          return res.status(400).json({ success: false, message: 'Invalid firm code' });
        }
        firmId = firm.id;
      }

      // Register user with tenant context
      const result = await this.hybridAuthService.register({
        email, 
        password, 
        firstName, 
        lastName, 
        firmId,
        tenantId
      });
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }
      
      const { user, accessToken, refreshToken } = result;

      // Create session if it exists
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.firmId = user.firmId;
        req.session.email = user.email;
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          tenantId
        };
      }
      
      // Set cookies for web clients
      if (!req.headers['x-api-client']) {
        const isProduction = process.env.NODE_ENV === 'production';
        // Set the access token cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction, 
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
        
        // Set the refresh token cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }
      
      // Audit successful registration
      auditLog({
        action: 'REGISTER',
        actor: email,
        targetType: 'user',
        targetId: user.id.toString(),
        status: 'SUCCESS',
        details: { 
          role: user.role, 
          firmId: user.firmId,
          tenantId 
        },
        ipAddress: req.ip
      });
      
      // Return tokens in response for API clients
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        ...(req.headers['x-api-client'] ? { accessToken, refreshToken } : {})
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }

  /**
   * @swagger
   * /api/hybrid-auth/oauth:
   *   post:
   *     summary: Hybrid authentication OAuth login
   *     tags: [Hybrid Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               provider:
   *                 type: string
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: OAuth login successful
   *       401:
   *         description: Invalid OAuth token
   */
  /**
   * OAuth authentication handler
   */
  async oauthLogin(req: Request, res: Response) {
    try {
      const { provider, token } = req.validated;
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Authenticate with OAuth provider
      const result = await this.hybridAuthService.authenticateOAuth(provider, token, tenantId);
      
      if (!result.success) {
        return res.status(401).json({ success: false, message: result.error });
      }
      
      const { user, accessToken, refreshToken } = result;

      // Create session if it exists
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.firmId = user.firmId;
        req.session.email = user.email;
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          tenantId
        };
      }
      
      // Set cookies for web clients
      if (!req.headers['x-api-client']) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction, 
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
        
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }
      
      // Audit successful OAuth login
      auditLog({
        action: 'LOGIN',
        actor: user.email,
        targetType: 'auth',
        targetId: user.email,
        status: 'SUCCESS',
        details: { 
          userId: user.id, 
          role: user.role, 
          authMethods: ['session', 'jwt'],
          provider,
          tenantId 
        },
        ipAddress: req.ip
      });
      
      // Return tokens in response for API clients
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        ...(req.headers['x-api-client'] ? { accessToken, refreshToken } : {})
      });
    } catch (error) {
      console.error('OAuth login error:', error);
      res.status(500).json({ success: false, message: 'OAuth authentication failed' });
    }
  }

  /**
   * @swagger
   * /api/hybrid-auth/refresh:
   *   post:
   *     summary: Refresh hybrid authentication token
   *     tags: [Hybrid Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      // Get the refresh token from cookies or request body
      const refreshToken = 
        req.cookies?.refreshToken || 
        req.body?.refreshToken || 
        '';
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided'
        });
      }
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Validate and refresh tokens
      const result = await this.hybridAuthService.refreshAccessToken(refreshToken, tenantId);
      
      if (!result.success) {
        return res.status(401).json({ success: false, message: result.error });
      }
      
      const { accessToken, newRefreshToken, user } = result;
      
      // Set new cookies for web clients
      if (!req.headers['x-api-client']) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
        
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }
      
      // Update session if it exists
      if (req.session && user) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.firmId = user.firmId;
        req.session.email = user.email;
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          tenantId
        };
      }
      
      // Return tokens in response for API clients
      return res.json({
        success: true,
        ...(req.headers['x-api-client'] ? { 
          accessToken, 
          refreshToken: newRefreshToken 
        } : {})
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ success: false, message: 'Failed to refresh token' });
    }
  }
  
  /**
   * Logout user by clearing session and blacklisting tokens
   */
  async logout(req: Request, res: Response) {
    try {
      // Get the tokens from cookies or request body
      const accessToken = req.cookies?.accessToken || req.body?.accessToken || '';
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || '';
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Extract user ID from session or token
      const userId = req.session?.userId || 
        (accessToken ? this.hybridAuthService.getUserIdFromToken(accessToken) : null);
      
      // If we have tokens, blacklist them
      if (accessToken || refreshToken) {
        await this.hybridAuthService.blacklistTokens(accessToken, refreshToken, userId, tenantId);
      }
      
      // Destroy session if it exists
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
          }
        });
      }
      
      // Clear cookies for web clients
      if (!req.headers['x-api-client']) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('accessToken', {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax'
        });
        
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax'
        });
      }
      
      // Audit successful logout
      if (userId) {
        auditLog({
          action: 'LOGOUT',
          actor: userId.toString(),
          targetType: 'auth',
          targetId: userId.toString(),
          status: 'SUCCESS',
          details: { tenantId },
          ipAddress: req.ip
        });
      }
      
      return res.json({ success: true, message: 'Successfully logged out' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }
  
  /**
   * Get current session/user info
   */
  async getSessionInfo(req: Request, res: Response) {
    try {
      // User should be available from authenticated middleware
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      // Get tenant ID from request or user
      const tenantId = req.tenant || 
        this.hybridAuthService.extractTenantFromRequest(req);
      
      // Fetch optional firm information if user has a firm
      let firm = null;
      if (user.firmId) {
        firm = await this.firmService.getFirmById(user.firmId, tenantId);
      }
      
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firmId: user.firmId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        firm: firm ? {
          id: firm.id,
          name: firm.name,
          code: firm.code
        } : null,
        tenant: tenantId,
        authMethods: [
          req.session?.userId ? 'session' : null,
          req.cookies?.accessToken || req.headers.authorization ? 'jwt' : null
        ].filter(Boolean)
      });
    } catch (error) {
      console.error('Get session info error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve session information' });
    }
  }
  
  /**
   * Reset password request
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.validated;
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Request password reset with tenant context
      const result = await this.hybridAuthService.createPasswordResetToken(email, tenantId);
      
      if (!result.success) {
        // Don't reveal if the email exists or not for security
        return res.json({
          success: true,
          message: 'If your email is registered, you will receive password reset instructions'
        });
      }
      
      // In a real implementation, send an email with the reset link
      // For now, we'll just return the token in development
      const isDev = process.env.NODE_ENV !== 'production';
      const responseData = {
        success: true,
        message: 'If your email is registered, you will receive password reset instructions'
      };
      
      // Only include the token in development mode
      if (isDev && result.token) {
        Object.assign(responseData, { 
          token: result.token,
          note: 'Token is included in response for development purposes only'
        });
      }
      
      return res.json(responseData);
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ success: false, message: 'Failed to process password reset request' });
    }
  }
  
  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.validated;
      
      // Extract tenant information
      const tenantId = this.hybridAuthService.extractTenantFromRequest(req);
      
      // Reset password with tenant context
      const result = await this.hybridAuthService.resetPassword(token, newPassword, tenantId);
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }
      
      // Audit successful password reset
      auditLog({
        action: 'PASSWORD_RESET',
        actor: result.user?.email || 'unknown',
        targetType: 'user',
        targetId: result.user?.id.toString() || 'unknown',
        status: 'SUCCESS',
        details: { tenantId },
        ipAddress: req.ip
      });
      
      return res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  }
  
  /**
   * Change password (authenticated)
   */
  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.validated;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      // Extract tenant information
      const tenantId = req.tenant || 
        this.hybridAuthService.extractTenantFromRequest(req);
      
      // Change password with tenant context
      const result = await this.hybridAuthService.changePassword(
        userId, 
        currentPassword, 
        newPassword,
        tenantId
      );
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }
      
      // Audit successful password change
      auditLog({
        action: 'PASSWORD_CHANGE',
        actor: userId.toString(),
        targetType: 'user',
        targetId: userId.toString(),
        status: 'SUCCESS',
        details: { tenantId },
        ipAddress: req.ip
      });
      
      return res.json({
        success: true,
        message: 'Password has been changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  }

  /**
   * Server health check
   */
  async healthCheck(req: Request, res: Response) {
    return res.json({
      success: true,
      message: 'Hybrid Auth Service is operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
}

export default new HybridAuthController();
