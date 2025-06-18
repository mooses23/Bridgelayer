import { Request, Response, NextFunction } from 'express';

/**
 * Authentication Strategy Router
 * Determines which authentication method to use based on route patterns
 */

export type AuthStrategy = 'session' | 'jwt' | 'hybrid';

export interface AuthStrategyRequest extends Request {
  authStrategy?: AuthStrategy;
}

/**
 * Determines authentication strategy based on request route
 */
export function determineAuthStrategy(req: Request): AuthStrategy {
  const path = req.path;
  
  // Authentication endpoints use hybrid approach (create both session and JWT)
  if (path.startsWith('/api/auth/')) {
    return 'hybrid';
  }
  
  // API routes (except auth) use JWT authentication
  if (path.startsWith('/api/')) {
    return 'jwt';
  }
  
  // Web application routes use session authentication
  return 'session';
}

/**
 * Middleware that attaches authentication strategy to request
 */
export function authStrategyMiddleware(req: AuthStrategyRequest, res: Response, next: NextFunction) {
  req.authStrategy = determineAuthStrategy(req);
  
  // Add debug logging for strategy selection
  console.log(`🔀 Auth strategy for ${req.method} ${req.path}: ${req.authStrategy}`);
  
  next();
}

/**
 * Route configuration for authentication strategies
 */
export const AUTH_ROUTE_CONFIG = {
  // Web application routes (session-based)
  webRoutes: [
    '/login',
    '/logout',
    '/dashboard',
    '/admin',
    '/onboarding',
    '/client',
    '/settings',
    '/cases',
    '/documents',
    '/billing',
    '/intake'
  ],
  
  // API routes (JWT-based)
  apiRoutes: [
    '/api/documents',
    '/api/cases',
    '/api/clients',
    '/api/billing',
    '/api/analytics',
    '/api/admin',
    '/api/firm',
    '/api/users',
    '/api/tenants'
  ],
  
  // Hybrid authentication routes (create both)
  hybridRoutes: [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/session',
    '/api/auth/refresh'
  ]
};

/**
 * Validate that a route matches expected authentication strategy
 */
export function validateRouteStrategy(path: string, expectedStrategy: AuthStrategy): boolean {
  const actualStrategy = determineAuthStrategy({ path } as Request);
  return actualStrategy === expectedStrategy;
}

/**
 * Get authentication requirements for a specific route
 */
export function getRouteAuthRequirements(path: string) {
  const strategy = determineAuthStrategy({ path } as Request);
  
  switch (strategy) {
    case 'session':
      return {
        strategy: 'session',
        requiresSession: true,
        requiresJWT: false,
        cookieName: 'connect.sid',
        middleware: 'sessionAuth'
      };
      
    case 'jwt':
      return {
        strategy: 'jwt',
        requiresSession: false,
        requiresJWT: true,
        cookieName: 'accessToken',
        middleware: 'jwtAuth'
      };
      
    case 'hybrid':
      return {
        strategy: 'hybrid',
        requiresSession: false,
        requiresJWT: false,
        cookieName: 'both',
        middleware: 'hybridAuth'
      };
      
    default:
      throw new Error(`Unknown authentication strategy: ${strategy}`);
  }
}

export default {
  determineAuthStrategy,
  authStrategyMiddleware,
  validateRouteStrategy,
  getRouteAuthRequirements,
  AUTH_ROUTE_CONFIG
};