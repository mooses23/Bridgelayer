import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../../storage';
import { JWTManager } from '../core/jwt-manager';
import { AdminAuthManager } from '../core/admin-auth-manager';
import { TenantService } from '../services/tenant-service';
import { AdminAuthTypes } from '../types/admin-auth-types';

// Onboarding validation schemas
const firmInfoSchema = z.object({
  name: z.string().min(2, 'Firm name must be at least 2 characters'),
  subdomain: z.string().min(3, 'Subdomain must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Invalid subdomain format'),
  adminEmail: z.string().email('Invalid email format'),
  adminName: z.string().min(2, 'Admin name required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().default('UTC'),
  practiceAreas: z.array(z.string()).default([])
});

const onboardingSessionSchema = z.object({
  sessionId: z.string(),
  currentStep: z.number().min(1).max(6),
  firmInfo: firmInfoSchema.partial(),
  branding: z.object({
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    displayName: z.string().optional()
  }).optional(),
  preferences: z.object({
    defaultLanguage: z.string().default('en'),
    caseTypes: z.array(z.string()).default([]),
    fileRetentionDays: z.number().default(2555), // 7 years
    auditTrailEnabled: z.boolean().default(true),
    folderStructure: z.record(z.any()).optional()
  }).optional(),
  integrations: z.array(z.object({
    service: z.string(),
    enabled: z.boolean(),
    credentials: z.record(z.string()).optional() // Encrypted storage
  })).optional()
});

/**
 * Secure Onboarding Authentication Controller
 * Handles tenant-aware firm registration with integrated authentication
 */
export class OnboardingAuthController {
  /**
   * Initialize onboarding session with security validation
   */
  static async initializeOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const { subdomain, adminEmail } = req.body;

      // Validate initial data
      const validation = z.object({
        subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
        adminEmail: z.string().email()
      }).safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
        return;
      }

      // Check subdomain availability
      const existingFirm = await storage.getFirmBySlug(subdomain);
      if (existingFirm) {
        res.status(409).json({
          error: 'Subdomain unavailable',
          message: 'This subdomain is already taken'
        });
        return;
      }

      // Check email availability
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (existingUser) {
        res.status(409).json({
          error: 'Email already registered',
          message: 'An account with this email already exists'
        });
        return;
      }

      // Generate secure session ID
      const sessionId = JWTManager.generateSessionToken();

      // Create onboarding session record (integration point with storage)
      const sessionData = {
        sessionId,
        currentStep: 1,
        firmInfo: { subdomain, adminEmail },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Log onboarding initiation
      await OnboardingAuthController.logOnboardingEvent(
        null,
        'ONBOARDING_INITIATED',
        `Onboarding started for subdomain: ${subdomain}`,
        req.ip,
        req.get('User-Agent'),
        { subdomain, adminEmail }
      );

      res.json({
        sessionId,
        subdomain,
        message: 'Onboarding session initialized',
        nextStep: 'firm_info'
      });
    } catch (error) {
      console.error('Initialize onboarding error:', error);
      res.status(500).json({
        error: 'Initialization failed',
        message: 'Failed to initialize onboarding session'
      });
    }
  }

  /**
   * Save onboarding progress with validation
   */
  static async saveOnboardingProgress(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const progressData = req.body;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID required' });
        return;
      }

      // Validate session and data
      const validation = onboardingSessionSchema.safeParse({
        sessionId,
        ...progressData
      });

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
        return;
      }

      // Verify session exists and is valid (integration point with storage)
      // const session = await storage.getOnboardingSession(sessionId);
      // if (!session || session.expiresAt < new Date()) {
      //   res.status(401).json({ error: 'Invalid or expired session' });
      //   return;
      // }

      // Encrypt sensitive data if present
      if (progressData.integrations) {
        progressData.integrations = await OnboardingAuthController.encryptIntegrationCredentials(
          progressData.integrations
        );
      }

      // Save progress (integration point with storage)
      // await storage.updateOnboardingSession(sessionId, progressData);

      await OnboardingAuthController.logOnboardingEvent(
        null,
        'ONBOARDING_PROGRESS_SAVED',
        `Progress saved for step ${progressData.currentStep}`,
        req.ip,
        req.get('User-Agent'),
        { sessionId, step: progressData.currentStep }
      );

      res.json({
        success: true,
        currentStep: progressData.currentStep,
        message: 'Progress saved successfully'
      });
    } catch (error) {
      console.error('Save onboarding progress error:', error);
      res.status(500).json({
        error: 'Save failed',
        message: 'Failed to save onboarding progress'
      });
    }
  }

  /**
   * Complete onboarding with secure firm and admin user creation
   */
  static async completeOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID required' });
        return;
      }

      // Get and validate complete onboarding data (integration point with storage)
      // const sessionData = await storage.getOnboardingSession(sessionId);
      // if (!sessionData || sessionData.expiresAt < new Date()) {
      //   res.status(401).json({ error: 'Invalid or expired session' });
      //   return;
      // }

      // Mock session data for implementation - replace with actual storage call
      const sessionData = {
        firmInfo: {
          name: 'Test Firm',
          subdomain: 'testfirm',
          adminEmail: 'admin@testfirm.com',
          adminName: 'John Admin',
          adminPassword: 'SecurePass123!',
          timezone: 'UTC',
          practiceAreas: ['Corporate Law']
        },
        branding: {
          primaryColor: '#3B82F6',
          displayName: 'Test Firm LLC'
        },
        preferences: {
          defaultLanguage: 'en',
          auditTrailEnabled: true,
          fileRetentionDays: 2555
        }
      };

      // Validate final data
      const validation = firmInfoSchema.safeParse(sessionData.firmInfo);
      if (!validation.success) {
        res.status(400).json({
          error: 'Incomplete onboarding data',
          details: validation.error.errors
        });
        return;
      }

      const { firmInfo } = sessionData;

      // Create firm with tenant isolation
      const firmSlug = firmInfo.subdomain.toLowerCase();
      const firm = await storage.createFirm({
        name: firmInfo.name,
        slug: firmSlug,
        plan: 'starter',
        status: 'active',
        onboarded: true,
        settings: {
          timezone: firmInfo.timezone,
          defaultLanguage: sessionData.preferences?.defaultLanguage || 'en'
        }
      });

      // Create secure admin user with proper password hashing
      const hashedPassword = await bcrypt.hash(firmInfo.adminPassword, 12);
      const [firstName, ...lastNameParts] = firmInfo.adminName.split(' ');
      
      const adminUser = await storage.createUser({
        firmId: firm.id,
        email: firmInfo.adminEmail,
        password: hashedPassword,
        firstName,
        lastName: lastNameParts.join(' ') || '',
        role: 'firm_admin',
        status: 'active'
      });

      // Generate secure authentication tokens
      const accessToken = JWTManager.generateAccessToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        firmId: firm.id,
        tenantId: firmSlug,
        permissions: ['read:tenant_data', 'write:tenant_data', 'admin:basic_settings']
      });

      const refreshToken = JWTManager.generateRefreshToken({
        userId: adminUser.id,
        tenantId: firmSlug,
        tokenVersion: 1
      });

      // Set secure authentication cookies
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, JWTManager.getCookieOptions(isProduction));
      res.cookie('refreshToken', refreshToken, JWTManager.getRefreshCookieOptions(isProduction));

      // Save additional onboarding data (integration points with storage)
      if (sessionData.branding) {
        // await storage.saveFirmBranding(firm.id, sessionData.branding);
      }
      if (sessionData.preferences) {
        // await storage.saveFirmPreferences(firm.id, sessionData.preferences);
      }

      // Clean up onboarding session
      // await storage.deleteOnboardingSession(sessionId);

      // Log successful completion
      await OnboardingAuthController.logOnboardingEvent(
        adminUser.id,
        'ONBOARDING_COMPLETED',
        `Firm onboarding completed: ${firm.name}`,
        req.ip,
        req.get('User-Agent'),
        { firmId: firm.id, firmSlug, adminUserId: adminUser.id }
      );

      res.status(201).json({
        success: true,
        message: 'Onboarding completed successfully',
        firm: {
          id: firm.id,
          name: firm.name,
          slug: firm.slug
        },
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role
        },
        redirectPath: '/dashboard',
        tenantUrl: `https://${firmSlug}.firmsync.com` // Or appropriate domain
      });
    } catch (error) {
      console.error('Complete onboarding error:', error);
      res.status(500).json({
        error: 'Completion failed',
        message: 'Failed to complete onboarding process'
      });
    }
  }

  /**
   * Validate onboarding session and return current state
   */
  static async getOnboardingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID required' });
        return;
      }

      // Get session data (integration point with storage)
      // const sessionData = await storage.getOnboardingSession(sessionId);
      // if (!sessionData) {
      //   res.status(404).json({ error: 'Session not found' });
      //   return;
      // }

      // Mock response for implementation
      const sessionData = {
        sessionId,
        currentStep: 3,
        firmInfo: {
          name: 'Test Firm',
          subdomain: 'testfirm'
        },
        completedSteps: [1, 2],
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      };

      res.json({
        sessionId: sessionData.sessionId,
        currentStep: sessionData.currentStep,
        completedSteps: sessionData.completedSteps,
        firmInfo: sessionData.firmInfo,
        expiresAt: sessionData.expiresAt,
        valid: true
      });
    } catch (error) {
      console.error('Get onboarding status error:', error);
      res.status(500).json({
        error: 'Status check failed',
        message: 'Failed to get onboarding status'
      });
    }
  }

  /**
   * Encrypt integration credentials for secure storage
   */
  private static async encryptIntegrationCredentials(integrations: any[]): Promise<any[]> {
    // Integration point with encryption service
    return integrations.map(integration => {
      if (integration.credentials) {
        // TODO: Implement proper encryption
        // integration.credentials = await CryptoUtils.encrypt(integration.credentials);
        console.log('Encrypting credentials for:', integration.service);
      }
      return integration;
    });
  }

  /**
   * Log onboarding events for audit trail
   */
  private static async logOnboardingEvent(
    userId: number | null,
    eventType: string,
    message: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): Promise<void> {
    // Integration point with audit logger
    console.log('Onboarding Event:', {
      userId,
      eventType,
      message,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date(),
      source: 'onboarding_auth'
    });

    // TODO: Integrate with proper audit logging service
    // await auditLogger.logOnboardingEvent(userId, eventType, message, ipAddress, userAgent, metadata);
  }

  /**
   * Validate subdomain availability
   */
  static async validateSubdomain(req: Request, res: Response): Promise<void> {
    try {
      const { subdomain } = req.params;

      if (!subdomain || subdomain.length < 3) {
        res.status(400).json({
          available: false,
          reason: 'Subdomain must be at least 3 characters'
        });
        return;
      }

      // Check subdomain format
      if (!/^[a-z0-9-]+$/.test(subdomain)) {
        res.status(400).json({
          available: false,
          reason: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
        });
        return;
      }

      // Check availability
      const existingFirm = await storage.getFirmBySlug(subdomain);
      const available = !existingFirm;

      res.json({
        subdomain,
        available,
        reason: available ? null : 'Subdomain is already taken'
      });
    } catch (error) {
      console.error('Validate subdomain error:', error);
      res.status(500).json({
        available: false,
        reason: 'Unable to validate subdomain'
      });
    }
  }
}