/**
 * Modular Authentication System - Main Export Module
 * Provides centralized access to all authentication components
 */

// Core authentication managers
export { AdminAuthManager } from './core/admin-auth-manager';
export { JWTManager } from './core/jwt-manager';

// Authentication controllers
export { AdminAuthController } from './controllers/admin-auth-controller';
export { OnboardingAuthController } from './controllers/onboarding-auth-controller';

// Services
export { TenantService } from './services/tenant-service';

// Type definitions
export { AdminAuthTypes } from './types/admin-auth-types';

// Database schemas
export * from './models/auth-schema';

// Integration example (for reference)
export { default as authRoutes } from './examples/integration-example';

/**
 * Quick Start Integration:
 * 
 * ```typescript
 * import { AdminAuthManager, OnboardingAuthController, authRoutes } from './auth';
 * 
 * // Use in Express routes
 * app.use('/api', authRoutes);
 * 
 * // Or use individual middleware
 * app.get('/admin/dashboard', AdminAuthManager.requireAdmin(), handler);
 * app.post('/onboarding/init', OnboardingAuthController.initializeOnboarding);
 * ```
 */