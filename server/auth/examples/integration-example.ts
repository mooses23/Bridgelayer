/**
 * Complete Integration Example: Modular Authentication System
 * Demonstrates usage of Admin Auth Manager and Onboarding Auth Controller
 * with Express routes, Drizzle ORM, and tenant-aware security
 */

import express, { Request, Response, Router } from 'express';
import { AdminAuthManager } from '../core/admin-auth-manager';
import { AdminAuthController } from '../controllers/admin-auth-controller';
import { OnboardingAuthController } from '../controllers/onboarding-auth-controller';
import { JWTManager } from '../core/jwt-manager';
import { TenantService } from '../services/tenant-service';

const router = Router();

/**
 * EXAMPLE 1: Admin Authentication Routes
 * Shows how to integrate AdminAuthManager with Express routes
 */

// Admin login with elevated security
router.post('/admin/auth/login', AdminAuthController.adminLogin);

// Platform admin dashboard - requires platform-level access
router.get('/admin/platform/dashboard', 
  AdminAuthManager.requirePlatformAdmin(),
  async (req: Request, res: Response) => {
    try {
      // Access adminContext attached by middleware
      const { permissions, role, tenantScope } = req.adminContext!;
      
      // Platform admins can see cross-tenant statistics
      const platformStats = {
        totalTenants: await getTotalTenants(),
        activeUsers: await getActiveUsersCount(),
        systemHealth: await getSystemHealth(),
        recentAdminActions: await getRecentAdminActions(req.user!.id)
      };

      res.json({
        dashboard: 'platform',
        adminUser: {
          id: req.user!.id,
          email: req.user!.email,
          role,
          permissions
        },
        stats: platformStats,
        tenantScope
      });
    } catch (error) {
      console.error('Platform dashboard error:', error);
      res.status(500).json({ error: 'Failed to load platform dashboard' });
    }
  }
);

// Tenant-specific admin access
router.get('/admin/tenant/:tenantId/dashboard',
  AdminAuthManager.requireAdmin('read:tenant_data'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { permissions, role } = req.adminContext!;

      // Validate tenant access (done by middleware, but showing explicit check)
      const hasAccess = await AdminAuthManager.validateTenantAccess(
        req.user!.id, 
        tenantId, 
        'read'
      );

      if (!hasAccess) {
        return res.status(403).json({ error: 'Tenant access denied' });
      }

      // Get tenant-specific data
      const tenantStats = await getTenantStats(tenantId);
      const tenantUsers = await getTenantUsers(tenantId);

      res.json({
        dashboard: 'tenant',
        tenantId,
        adminUser: {
          id: req.user!.id,
          email: req.user!.email,
          role,
          permissions
        },
        stats: tenantStats,
        users: tenantUsers
      });
    } catch (error) {
      console.error('Tenant dashboard error:', error);
      res.status(500).json({ error: 'Failed to load tenant dashboard' });
    }
  }
);

// Ghost mode - highest security level
router.post('/admin/ghost/:firmId/start',
  AdminAuthManager.requireGhostMode(),
  AdminAuthController.startGhostMode
);

router.post('/admin/ghost/end',
  AdminAuthManager.requireGhostMode(),
  AdminAuthController.endGhostMode
);

/**
 * EXAMPLE 2: Onboarding Authentication Routes  
 * Shows secure tenant registration with authentication integration
 */

// Initialize secure onboarding session
router.post('/onboarding/init', OnboardingAuthController.initializeOnboarding);

// Validate subdomain availability
router.get('/onboarding/validate/:subdomain', OnboardingAuthController.validateSubdomain);

// Save onboarding progress with session validation
router.put('/onboarding/:sessionId/progress', OnboardingAuthController.saveOnboardingProgress);

// Get onboarding status
router.get('/onboarding/:sessionId/status', OnboardingAuthController.getOnboardingStatus);

// Complete onboarding and create authenticated firm
router.post('/onboarding/:sessionId/complete', OnboardingAuthController.completeOnboarding);

/**
 * EXAMPLE 3: Tenant-Aware API Routes
 * Shows how to use tenant service for data isolation
 */

// Tenant-scoped data access with automatic isolation
router.get('/api/:tenantId/clients',
  AdminAuthManager.requireAdmin('read:tenant_data'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      
      // Get tenant context for data filtering
      const tenantContext = await TenantService.getTenantContext(req.user!.id, tenantId);
      if (!tenantContext) {
        return res.status(403).json({ error: 'Tenant access denied' });
      }

      // Apply tenant filtering to database queries
      const clients = await getClientsForTenant(tenantId, req.user!.id);

      res.json({
        tenantId,
        clients,
        permissions: tenantContext.permissions
      });
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  }
);

// Cross-tenant operation (platform admin only)
router.get('/api/platform/tenants',
  AdminAuthManager.requirePlatformAdmin(),
  async (req: Request, res: Response) => {
    try {
      // Platform admins can see all tenants
      const tenants = await getAllTenants();
      
      res.json({
        tenants: tenants.map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          userCount: tenant.userCount,
          lastActivity: tenant.lastActivity
        })),
        adminUser: {
          id: req.user!.id,
          role: req.adminContext!.role,
          permissions: req.adminContext!.permissions
        }
      });
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  }
);

/**
 * EXAMPLE 4: JWT Token Management
 * Shows token validation, refresh, and blacklisting
 */

// Validate current session
router.get('/auth/validate', AdminAuthController.validateAdminSession);

// Refresh expired tokens
router.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const result = await JWTManager.rotateTokens(refreshToken);
    
    if (!result.success) {
      return res.status(401).json({ error: 'Token refresh failed' });
    }

    // Set new tokens
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', result.accessToken, JWTManager.getCookieOptions(isProduction));
    res.cookie('refreshToken', result.newRefreshToken, JWTManager.getRefreshCookieOptions(isProduction));

    res.json({
      success: true,
      message: 'Tokens refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout with token blacklisting
router.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    const accessToken = JWTManager.extractTokenFromRequest(req);
    const refreshToken = req.cookies?.refreshToken;

    // Blacklist tokens
    if (accessToken) {
      JWTManager.blacklistToken(accessToken);
    }
    if (refreshToken) {
      JWTManager.blacklistToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Helper Functions (Integration Points with Storage Layer)
 */

async function getTotalTenants(): Promise<number> {
  // Integration point with storage
  const { storage } = await import('../../storage');
  const firms = await storage.getAllFirms();
  return firms.length;
}

async function getActiveUsersCount(): Promise<number> {
  // Integration point with storage
  const { storage } = await import('../../storage');
  const users = await storage.getAllUsers();
  return users.filter(user => user.status === 'active').length;
}

async function getSystemHealth(): Promise<any> {
  // Integration point with monitoring service
  return {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    lastCheck: new Date()
  };
}

async function getRecentAdminActions(adminUserId: number): Promise<any[]> {
  // Integration point with audit log - would be implemented with actual audit service
  console.log('Getting recent admin actions for user:', adminUserId);
  return [];
}

async function getTenantStats(tenantId: string): Promise<any> {
  // Integration point with analytics service
  const { storage } = await import('../../storage');
  
  try {
    const firm = await storage.getFirmBySlug(tenantId);
    if (!firm) {
      throw new Error('Tenant not found');
    }

    // Get basic tenant statistics
    const users = await storage.getAllUsers();
    const tenantUsers = users.filter(user => user.firmId === firm.id);
    
    return {
      firmId: firm.id,
      userCount: tenantUsers.length,
      activeUsers: tenantUsers.filter(user => user.status === 'active').length,
      plan: firm.plan,
      status: firm.status,
      onboarded: firm.onboarded,
      lastActivity: new Date()
    };
  } catch (error) {
    console.error('Error getting tenant stats:', error);
    return {
      userCount: 0,
      activeUsers: 0,
      plan: 'unknown',
      status: 'unknown'
    };
  }
}

async function getTenantUsers(tenantId: string): Promise<any[]> {
  // Integration point with storage
  const { storage } = await import('../../storage');
  
  try {
    const firm = await storage.getFirmBySlug(tenantId);
    if (!firm) {
      return [];
    }

    const users = await storage.getAllUsers();
    return users
      .filter(user => user.firmId === firm.id)
      .map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      }));
  } catch (error) {
    console.error('Error getting tenant users:', error);
    return [];
  }
}

async function getClientsForTenant(tenantId: string, userId: number): Promise<any[]> {
  // Integration point with storage with tenant filtering
  const { storage } = await import('../../storage');
  
  try {
    const firm = await storage.getFirmBySlug(tenantId);
    if (!firm) {
      return [];
    }

    // This would use actual client data when available
    // For now, return empty array as clients table may not exist
    return [];
  } catch (error) {
    console.error('Error getting clients for tenant:', error);
    return [];
  }
}

async function getAllTenants(): Promise<any[]> {
  // Integration point with storage (platform admin only)
  const { storage } = await import('../../storage');
  
  try {
    const firms = await storage.getAllFirms();
    const users = await storage.getAllUsers();
    
    return firms.map(firm => {
      const firmUsers = users.filter(user => user.firmId === firm.id);
      return {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        status: firm.status,
        plan: firm.plan,
        userCount: firmUsers.length,
        onboarded: firm.onboarded,
        lastActivity: firm.updatedAt || firm.createdAt
      };
    });
  } catch (error) {
    console.error('Error getting all tenants:', error);
    return [];
  }
}

/**
 * Security-aware error handler
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  console.error('Auth route error:', error);

  // Log security-relevant errors
  if (error.type === 'security' || error.status === 403 || error.status === 401) {
    logSecurityEvent(
      req.user?.id || null,
      req.user?.firmId || null,
      'AUTH_ERROR',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
  }

  // Don't expose internal errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(error.status || 500).json({
    error: error.status < 500 ? error.message : 'Internal server error',
    ...(isDevelopment && { details: error.stack })
  });
});

async function logSecurityEvent(
  userId: number | null,
  firmId: number | null | undefined,
  eventType: string,
  message: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Integration point with audit logger
  console.log('Security Event:', {
    userId,
    firmId,
    eventType,
    message,
    ipAddress,
    userAgent,
    timestamp: new Date()
  });
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import this router in your main Express app:
 *    ```typescript
 *    import authRoutes from './auth/examples/integration-example';
 *    app.use('/api', authRoutes);
 *    ```
 * 
 * 2. Ensure environment variables are set:
 *    - JWT_SECRET: Secret key for JWT signing
 *    - NODE_ENV: 'development' or 'production'
 *    - DATABASE_URL: PostgreSQL connection string
 * 
 * 3. Run database migrations to create auth tables:
 *    ```bash
 *    npm run db:push
 *    ```
 * 
 * 4. Test the authentication flow:
 *    - POST /api/admin/auth/login (admin credentials)
 *    - GET /api/admin/platform/dashboard (platform admin)
 *    - POST /api/onboarding/init (new firm registration)
 *    - POST /api/onboarding/{sessionId}/complete
 * 
 * 5. Security Features Enabled:
 *    - JWT access/refresh token rotation
 *    - Tenant-scoped data isolation  
 *    - Admin permission validation
 *    - Comprehensive audit logging
 *    - Ghost mode for support access
 *    - Secure onboarding with session tracking
 */

export default router;