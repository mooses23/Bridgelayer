import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';

export interface TenantRequest extends Request {
  tenant?: {
    firmId: number;
    firmCode: string;
    firm: any;
  };
  tenantQuery?: {
    firmId: number;
    addFirmScope: (queryParams: any) => any;
  };
  user?: any;
  params: any;
  ip: string;
  originalUrl: string;
  get(name: string): string | undefined;
}

/**
 * Middleware to enforce tenant isolation for all /api/tenant/:firmCode/* routes
 * Validates firmCode, loads firm data, and ensures user belongs to the firm
 */
export const requireTenantAccess = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { firmCode } = req.params;
    const user = req.user as any;

    // Validate firmCode parameter exists
    if (!firmCode) {
      return res.status(400).json({ 
        error: 'Firm code required',
        code: 'MISSING_FIRM_CODE'
      });
    }

    // Validate user is authenticated
    if (!user || !user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    // Load firm by slug/code
    const firm = await storage.getFirmBySlug(firmCode);
    if (!firm) {
      return res.status(404).json({ 
        error: 'Firm not found',
        code: 'FIRM_NOT_FOUND'
      });
    }

    // Verify user belongs to this firm (except for admins in ghost mode)
    if (user.role !== 'admin' && user.firmId !== firm.id) {
      console.warn(`🚨 SECURITY ALERT - Tenant isolation violation: User ${user.id} (firm ${user.firmId}, role: ${user.role}) attempted to access firm ${firm.id} (${firm.name}) from IP ${req.ip}`);
      
      // Log detailed audit information
      console.warn('Tenant access violation details:', {
        userId: user.id,
        userEmail: user.email,
        userFirmId: user.firmId,
        attemptedFirmId: firm.id,
        attemptedFirmCode: firmCode,
        userRole: user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        url: req.originalUrl
      });
      
      return res.status(403).json({ 
        error: 'Access denied to this firm',
        code: 'TENANT_ACCESS_DENIED'
      });
    }

    // Check for admin ghost mode
    if (user.role === 'admin' && user.firmId !== firm.id) {
      const ghostSessions = await storage.getActiveGhostSessions(user.id);
      const activeSession = ghostSessions.find((session: any) => session.isActive && session.targetFirmId === firm.id);
      if (!activeSession) {
        console.warn(`🚨 Admin ghost session required: User ${user.id} attempted to access firm ${firm.id} without active ghost session`);
        return res.status(403).json({ 
          error: 'Admin must start ghost session to access this firm',
          code: 'GHOST_SESSION_REQUIRED'
        });
      }
      console.log(`👻 Admin ${user.id} accessing firm ${firm.id} via ghost session ${activeSession.id}`);
    }

    // Attach tenant context to request
    req.tenant = {
      firmId: firm.id,
      firmCode: firm.slug,
      firm: firm
    };

    // Log tenant access for audit
    console.log(`🏢 Tenant access granted: User ${user.id} (${user.email}, role: ${user.role}) → Firm ${firm.id} (${firm.slug}) from IP ${req.ip}`);
    
    // Log successful access details for audit trail
    console.log('Tenant access details:', {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      firmId: firm.id,
      firmCode: firm.slug,
      firmName: firm.name,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      url: req.originalUrl,
      isAdminAccess: user.role === 'admin' && user.firmId !== firm.id
    });

    next();
  } catch (error) {
    console.error('❌ Tenant isolation middleware error:', error);
    res.status(500).json({ 
      error: 'Tenant validation failed',
      code: 'TENANT_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware to scope database queries to current tenant
 * Automatically adds firmId to query contexts
 */
export const addTenantScope = (req: TenantRequest, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(500).json({ 
      error: 'Tenant context missing - ensure requireTenantAccess runs first',
      code: 'MISSING_TENANT_CONTEXT'
    });
  }

  // Enhance req with tenant-scoped query helpers
  req.tenantQuery = {
    firmId: req.tenant.firmId,
    addFirmScope: (queryParams: any) => ({
      ...queryParams,
      firmId: req.tenant!.firmId
    })
  };

  next();
};

/**
 * Validation middleware for tenant route parameters
 */
export const validateTenantParams = (req: Request, res: Response, next: NextFunction) => {
  const { firmCode } = req.params;
  
  // Validate firmCode format (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(firmCode)) {
    return res.status(400).json({ 
      error: 'Invalid firm code format',
      code: 'INVALID_FIRM_CODE_FORMAT'
    });
  }

  // Additional parameter validation can be added here
  next();
};

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        firmId: number;
        firmCode: string;
        firm: any;
      };
      tenantQuery?: {
        firmId: number;
        addFirmScope: (queryParams: any) => any;
      };
    }
  }
}
