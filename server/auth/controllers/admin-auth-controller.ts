import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { storage } from '../../storage';
import { JWTManager } from '../core/jwt-manager';
import { AdminAuthManager } from '../core/admin-auth-manager';
import { TenantService } from '../services/tenant-service';
import { AdminAuthTypes } from '../types/admin-auth-types';

/**
 * Admin Authentication Controller
 * Handles admin-specific authentication endpoints and operations
 */
export class AdminAuthController {
  /**
   * Admin login with elevated permissions
   */
  static async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, tenantId } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
        return;
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        await AdminAuthController.logSecurityEvent(
          null,
          null,
          'ADMIN_LOGIN_FAILED',
          `Failed admin login attempt for email: ${email}`,
          req.ip,
          req.get('User-Agent')
        );

        res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
        return;
      }

      // Verify admin role
      const validation = await AdminAuthManager.validateAdminAccess(user.id);
      if (!validation.valid) {
        await AdminAuthController.logSecurityEvent(
          user.id,
          user.firmId,
          'NON_ADMIN_LOGIN_ATTEMPT',
          'Non-admin user attempted admin login',
          req.ip,
          req.get('User-Agent')
        );

        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await AdminAuthController.logSecurityEvent(
          user.id,
          user.firmId,
          'ADMIN_LOGIN_FAILED',
          'Invalid password for admin user',
          req.ip,
          req.get('User-Agent')
        );

        res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
        return;
      }

      // Validate tenant access if specified
      if (tenantId) {
        const hasAccess = await AdminAuthManager.validateTenantAccess(user.id, tenantId);
        if (!hasAccess) {
          await AdminAuthController.logSecurityEvent(
            user.id,
            user.firmId,
            'TENANT_ACCESS_DENIED',
            `Admin attempted to access unauthorized tenant: ${tenantId}`,
            req.ip,
            req.get('User-Agent')
          );

          res.status(403).json({
            error: 'Tenant access denied',
            message: 'Insufficient privileges for requested tenant'
          });
          return;
        }
      }

      // Generate admin tokens with elevated permissions
      const accessToken = JWTManager.generateAdminToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: validation.adminUser?.permissions || [],
        tenantScope: tenantId || 'platform'
      });

      const refreshToken = JWTManager.generateRefreshToken({
        userId: user.id,
        tenantId: tenantId,
        tokenVersion: 1
      });

      // Set secure cookies
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, JWTManager.getCookieOptions(isProduction));
      res.cookie('refreshToken', refreshToken, JWTManager.getRefreshCookieOptions(isProduction));

      // Log successful admin login
      await AdminAuthController.logSecurityEvent(
        user.id,
        user.firmId,
        'ADMIN_LOGIN_SUCCESS',
        'Successful admin login',
        req.ip,
        req.get('User-Agent')
      );

      // Determine redirect path based on admin role
      let redirectPath = '/admin';
      if (user.role === 'platform_admin' || user.role === 'super_admin') {
        redirectPath = '/admin/platform';
      } else if (tenantId) {
        redirectPath = `/admin/tenant/${tenantId}`;
      }

      res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: validation.adminUser?.permissions || []
        },
        tenantAccess: tenantId ? await TenantService.getTenantContext(user.id, tenantId) : null,
        redirectPath
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal server error during admin login'
      });
    }
  }

  /**
   * Start ghost mode session
   */
  static async startGhostMode(req: Request, res: Response): Promise<void> {
    try {
      const { targetFirmId, purpose, notes } = req.body;
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!targetFirmId) {
        res.status(400).json({ error: 'Target firm ID required' });
        return;
      }

      // Validate ghost mode permissions
      const validation = await AdminAuthManager.validateAdminAccess(adminUserId, 'ghost_mode');
      if (!validation.valid) {
        res.status(403).json({ error: 'Ghost mode access denied' });
        return;
      }

      // Verify target firm exists
      const targetFirm = await storage.getFirm(targetFirmId);
      if (!targetFirm) {
        res.status(404).json({ error: 'Target firm not found' });
        return;
      }

      // Generate ghost session token
      const sessionToken = JWTManager.generateSessionToken();

      // Create ghost session record (integration point with storage)
      const ghostSession: AdminAuthTypes.GhostSession = {
        id: 0, // Will be set by database
        adminUserId,
        targetFirmId,
        sessionToken,
        isActive: true,
        startedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        auditTrail: [{
          timestamp: new Date(),
          action: 'SESSION_STARTED',
          resource: 'ghost_mode',
          data: { purpose, notes }
        }]
      };

      // Log ghost mode initiation
      await AdminAuthController.logSecurityEvent(
        adminUserId,
        targetFirmId,
        'GHOST_MODE_STARTED',
        `Ghost mode session started for firm: ${targetFirm.name}`,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        sessionToken,
        targetFirm: {
          id: targetFirm.id,
          name: targetFirm.name,
          slug: targetFirm.slug
        },
        permissions: validation.adminUser?.permissions || [],
        message: 'Ghost mode session started'
      });
    } catch (error) {
      console.error('Ghost mode start error:', error);
      res.status(500).json({ error: 'Failed to start ghost mode session' });
    }
  }

  /**
   * End ghost mode session
   */
  static async endGhostMode(req: Request, res: Response): Promise<void> {
    try {
      const { sessionToken } = req.body;
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Log ghost mode termination
      await AdminAuthController.logSecurityEvent(
        adminUserId,
        null,
        'GHOST_MODE_ENDED',
        'Ghost mode session ended',
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Ghost mode session ended'
      });
    } catch (error) {
      console.error('Ghost mode end error:', error);
      res.status(500).json({ error: 'Failed to end ghost mode session' });
    }
  }

  /**
   * Get admin user profile with permissions
   */
  static async getAdminProfile(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await storage.getUser(adminUserId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const validation = await AdminAuthManager.validateAdminAccess(user.id);
      if (!validation.valid) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      // Get accessible tenants
      const accessibleTenants = await TenantService.getUserAccessibleTenants(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        permissions: validation.adminUser?.permissions || [],
        accessibleTenants,
        adminLevel: validation.adminUser?.role || ''
      });
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({ error: 'Failed to get admin profile' });
    }
  }

  /**
   * Validate admin token and refresh if needed
   */
  static async validateAdminSession(req: Request, res: Response): Promise<void> {
    try {
      const token = JWTManager.extractTokenFromRequest(req);

      if (!token) {
        res.status(401).json({ error: 'No authentication token' });
        return;
      }

      const validation = await JWTManager.validateToken(token);
      if (!validation.valid) {
        // Try to refresh token
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          const rotationResult = await JWTManager.rotateTokens(refreshToken);
          if (rotationResult.success) {
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('accessToken', rotationResult.accessToken, JWTManager.getCookieOptions(isProduction));
            res.cookie('refreshToken', rotationResult.newRefreshToken, JWTManager.getRefreshCookieOptions(isProduction));

            res.json({
              valid: true,
              refreshed: true,
              message: 'Token refreshed successfully'
            });
            return;
          }
        }

        res.status(401).json({ error: 'Invalid or expired session' });
        return;
      }

      res.json({
        valid: true,
        payload: validation.payload,
        message: 'Session valid'
      });
    } catch (error) {
      console.error('Admin session validation error:', error);
      res.status(500).json({ error: 'Session validation failed' });
    }
  }

  /**
   * Log security events (integration point with audit logger)
   */
  private static async logSecurityEvent(
    userId: number | null,
    firmId: number | null | undefined,
    eventType: string,
    message: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Integration point with audit logger service
    console.log('Admin Security Event:', {
      userId,
      firmId,
      eventType,
      message,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      source: 'admin_auth'
    });

    // TODO: Integrate with proper audit logging service
    // await auditLogger.logSecurityEvent(userId, firmId, eventType, message, ipAddress, userAgent);
  }
}