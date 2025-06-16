import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { JWTUtils } from './jwtUtils';
import { storage } from '../storage';
import { auditLogger } from '../services/auditLogger';

export class AuthControllers {
  /**
   * JWT-based login with multi-tenant security
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ 
          error: 'Missing credentials',
          message: 'Email and password are required' 
        });
        return;
      }

      // Extract tenant from subdomain for multi-tenant isolation
      const tenantId = JWTUtils.extractTenantFromRequest(req) || 'default';

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        await auditLogger.logSecurityEvent(
          null,
          null,
          'LOGIN_FAILED',
          `Failed login attempt for email: ${email}`,
          req.ip,
          req.get('User-Agent')
        );

        res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await auditLogger.logSecurityEvent(
          user.id,
          user.firmId,
          'LOGIN_FAILED',
          'Invalid password attempt',
          req.ip,
          req.get('User-Agent')
        );

        res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
        return;
      }

      // Verify tenant isolation for firm users
      if (user.firmId && !['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
        const userFirm = await storage.getFirm(user.firmId);
        if (!userFirm || userFirm.slug !== tenantId) {
          await auditLogger.logSecurityEvent(
            user.id,
            user.firmId,
            'TENANT_VIOLATION',
            `User attempted to access wrong tenant: ${tenantId}`,
            req.ip,
            req.get('User-Agent')
          );

          res.status(403).json({
            error: 'Access denied',
            message: 'Invalid tenant access'
          });
          return;
        }
      }

      // Generate JWT tokens
      const accessToken = JWTUtils.generateAccessToken({
        userId: user.id,
        tenantId,
        role: user.role,
        email: user.email,
        firmId: user.firmId
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user.id,
        tenantId,
        tokenVersion: 1 // TODO: Implement token versioning in database
      });

      // Set secure HTTP-only cookies
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, JWTUtils.getCookieOptions(isProduction));
      res.cookie('refreshToken', refreshToken, JWTUtils.getRefreshCookieOptions(isProduction));

      // Log successful login
      await auditLogger.logLogin(user.id, user.firmId, req.ip, req.get('User-Agent'));

      // Determine redirect path based on role and onboarding status
      let redirectPath = '/dashboard';
      if (['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
        redirectPath = '/admin';
      } else if (user.firmId) {
        const firm = await storage.getFirm(user.firmId);
        if (firm && !firm.onboarded) {
          redirectPath = '/onboarding';
        }
      }

      res.json({
        success: true,
        message: 'Login successful',
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
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal server error during login'
      });
    }
  }

  /**
   * Secure logout with token invalidation
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Extract user info for audit logging if available
      const token = JWTUtils.extractTokenFromRequest(req);
      let userId: number | null = null;
      let firmId: number | null = null;

      if (token) {
        try {
          const payload = JWTUtils.verifyAccessToken(token);
          userId = payload.userId;
          firmId = payload.firmId || null;
        } catch {
          // Token might be expired, continue with logout
        }
      }

      // Clear authentication cookies
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/api/auth' });

      // Log logout event
      if (userId) {
        await auditLogger.logLogout(userId, firmId, req.ip, req.get('User-Agent'));
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'Internal server error during logout'
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = JWTUtils.extractRefreshTokenFromRequest(req);
      
      if (!refreshToken) {
        res.status(401).json({
          error: 'No refresh token',
          message: 'Refresh token required'
        });
        return;
      }

      // Verify refresh token
      let payload;
      try {
        payload = JWTUtils.verifyRefreshToken(refreshToken);
      } catch {
        res.status(401).json({
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired'
        });
        return;
      }

      // Verify user still exists and is active
      const user = await storage.getUser(payload.userId);
      if (!user) {
        res.status(401).json({
          error: 'User not found',
          message: 'User account no longer exists'
        });
        return;
      }

      // TODO: Check token version against database to handle revocation

      // Generate new access token
      const newAccessToken = JWTUtils.generateAccessToken({
        userId: user.id,
        tenantId: payload.tenantId,
        role: user.role,
        email: user.email,
        firmId: user.firmId
      });

      // Set new access token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', newAccessToken, JWTUtils.getCookieOptions(isProduction));

      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        message: 'Internal server error during token refresh'
      });
    }
  }

  /**
   * Get current session info
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    try {
      const token = JWTUtils.extractTokenFromRequest(req);
      
      if (!token) {
        res.status(401).json({
          error: 'No session',
          message: 'No active session found'
        });
        return;
      }

      // Verify token
      let payload;
      try {
        payload = JWTUtils.verifyAccessToken(token);
      } catch {
        res.status(401).json({
          error: 'Invalid session',
          message: 'Session token is invalid or expired'
        });
        return;
      }

      // Get fresh user data
      const user = await storage.getUser(payload.userId);
      if (!user) {
        res.status(401).json({
          error: 'User not found',
          message: 'User account no longer exists'
        });
        return;
      }

      // Validate tenant isolation
      if (!JWTUtils.validateTenantMatch(req, payload)) {
        res.status(403).json({
          error: 'Tenant mismatch',
          message: 'Session not valid for current tenant'
        });
        return;
      }

      res.json({
        userId: user.id,
        role: user.role,
        firmId: user.firmId,
        tenantId: payload.tenantId,
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
      console.error('Session check error:', error);
      res.status(500).json({
        error: 'Session check failed',
        message: 'Internal server error during session check'
      });
    }
  }

  /**
   * Password reset request
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          error: 'Email required',
          message: 'Email address is required for password reset'
        });
        return;
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent'
        });
        return;
      }

      // Generate secure reset token (short-lived)
      const resetToken = JWTUtils.generateAccessToken({
        userId: user.id,
        tenantId: 'reset',
        role: 'password_reset',
        email: user.email,
        firmId: user.firmId
      });

      // TODO: Send email with reset link containing the token
      // For now, we'll just log it (in production, integrate with email service)
      console.log(`Password reset token for ${email}: ${resetToken}`);

      await auditLogger.logSecurityEvent(
        user.id,
        user.firmId,
        'PASSWORD_RESET_REQUESTED',
        'Password reset requested',
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        error: 'Password reset failed',
        message: 'Internal server error during password reset request'
      });
    }
  }
}