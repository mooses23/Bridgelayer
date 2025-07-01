import { BaseService } from './base.service';
import { OnboardingRepository, OnboardingProfile } from '../repositories/onboarding.repository';
import { FirmRepository } from '../repositories/firm.repository';
import { UserRepository } from '../repositories/user.repository';
import { ValidationError } from '../middleware/validation.middleware';
import { PasswordService } from './password.service';
import { AuditService } from './audit.service';
import { StorageService } from './storage.service';
import crypto from 'crypto';
import { NotFoundError } from '../utils/errors';

/**
 * Onboarding Service handles all onboarding-related business logic
 */
export class OnboardingService extends BaseService<OnboardingProfile, OnboardingRepository> {
  private firmRepository: FirmRepository;
  private userRepository: UserRepository;
  private passwordService: PasswordService;
  private storageService: StorageService;
  
  constructor() {
    const onboardingRepository = new OnboardingRepository();
    super(onboardingRepository, 'onboardingProfile');
    
    this.firmRepository = new FirmRepository();
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.storageService = new StorageService();
    this.auditService = new AuditService();
  }

  /**
   * Check if a subdomain is available
   */
  async checkSubdomain(subdomain: string): Promise<{
    available: boolean;
    message?: string;
  }> {
    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return {
        available: false,
        message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
      };
    }

    if (subdomain.length < 3) {
      return {
        available: false,
        message: 'Subdomain must be at least 3 characters'
      };
    }

    if (subdomain.length > 20) {
      return {
        available: false,
        message: 'Subdomain cannot exceed 20 characters'
      };
    }

    // Check if subdomain is in reserved list
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'dashboard', 'login', 
      'auth', 'mail', 'email', 'blog', 'shop', 'store', 'billing'];
    
    if (reservedSubdomains.includes(subdomain)) {
      return {
        available: false,
        message: 'This subdomain is reserved'
      };
    }

    // Check if subdomain is already in use
    const existingFirm = await this.firmRepository.findBySubdomain(subdomain);
    if (existingFirm) {
      return {
        available: false,
        message: 'This subdomain is already in use'
      };
    }

    // Check if subdomain is in an active onboarding session
    const existingSession = await this.repository.findBySubdomain(subdomain);
    if (existingSession && existingSession.status === 'active' && existingSession.expiresAt > new Date()) {
      return {
        available: false,
        message: 'This subdomain is already in use'
      };
    }

    return { available: true };
  }

  /**
   * Initialize a new onboarding session
   */
  async initializeSession(data: {
    firmName: string;
    subdomain: string;
    adminEmail: string;
    vertical?: string;
  }): Promise<{
    sessionId: string;
    code: string;
    expiresAt: Date;
  }> {
    const { firmName, subdomain, adminEmail, vertical = 'legal' } = data;

    // Check if email is already in use
    const existingUser = await this.userRepository.findByEmail(adminEmail);
    if (existingUser) {
      throw new ValidationError({ email: ['This email is already registered'] });
    }

    // Check if subdomain is available
    const subdomainCheck = await this.checkSubdomain(subdomain);
    if (!subdomainCheck.available) {
      throw new ValidationError({ subdomain: [subdomainCheck.message || 'Subdomain is not available'] });
    }

    // Check if there's an active session for this email
    const existingSession = await this.repository.findByEmail(adminEmail);
    if (existingSession && existingSession.status === 'active' && existingSession.expiresAt > new Date()) {
      // Return existing session
      return {
        sessionId: existingSession.id.toString(),
        code: existingSession.code,
        expiresAt: existingSession.expiresAt
      };
    }

    // Generate unique code
    const code = crypto.randomBytes(4).toString('hex');
    
    // Set expiration (48 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Create the onboarding session
    const session = await this.repository.create({
      code,
      firmName,
      subdomain,
      adminEmail,
      vertical,
      currentStep: 1,
      status: 'active',
      formData: { firmName, subdomain, adminEmail },
      createdAt: new Date(),
      expiresAt
    });

    this.auditService.log('onboarding:session:created', {
      sessionId: session.id,
      adminEmail,
      subdomain
    });

    return {
      sessionId: session.id.toString(),
      code,
      expiresAt
    };
  }

  /**
   * Verify an onboarding code
   */
  async verifyCode(code: string): Promise<OnboardingProfile> {
    const session = await this.repository.findByCode(code);
    
    if (!session) {
      throw new ValidationError({ code: ['Invalid onboarding code'] });
    }

    if (session.status !== 'active') {
      throw new ValidationError({ code: ['This onboarding session is no longer active'] });
    }

    if (session.expiresAt < new Date()) {
      throw new ValidationError({ code: ['This onboarding code has expired'] });
    }

    return session;
  }

  /**
   * Save progress for an onboarding session
   */
  async saveProgress(sessionId: number, step: number, formData: any): Promise<OnboardingProfile> {
    const session = await this.repository.findById(sessionId);
    
    if (!session) {
      throw new ValidationError({ sessionId: ['Invalid session ID'] });
    }

    if (session.status !== 'active') {
      throw new ValidationError({ sessionId: ['This onboarding session is no longer active'] });
    }

    if (session.expiresAt < new Date()) {
      throw new ValidationError({ sessionId: ['This onboarding session has expired'] });
    }

    // Merge new form data with existing data
    const updatedFormData = {
      ...session.formData,
      ...formData
    };

    const updatedSession = await this.repository.updateProgress(sessionId, step, updatedFormData);
    
    if (!updatedSession) {
      throw new Error('Failed to save onboarding progress');
    }

    this.auditService.log('onboarding:progress:saved', {
      sessionId,
      step
    });

    return updatedSession;
  }

  /**
   * Complete the onboarding process
   */
  async completeOnboarding(sessionId: number, finalData: any, files?: any): Promise<{
    firmId: number;
    adminUserId: number;
    loginCode: string;
  }> {
    const session = await this.repository.findById(sessionId);
    
    if (!session) {
      throw new ValidationError({ sessionId: ['Invalid session ID'] });
    }

    if (session.status !== 'active') {
      throw new ValidationError({ sessionId: ['This onboarding session has already been completed'] });
    }

    if (session.expiresAt < new Date()) {
      throw new ValidationError({ sessionId: ['This onboarding session has expired'] });
    }

    // Merge final data with existing form data
    const formData = {
      ...session.formData,
      ...finalData
    };

    // Extract firm and admin user details
    const {
      firmName,
      subdomain,
      adminEmail,
      adminName,
      password,
      practiceAreas = [],
      planTier = 'basic'
    } = formData;

    try {
      // Handle file uploads if provided
      let logoUrl = null;
      if (files && files.logo) {
        logoUrl = await this.handleLogoUpload(files.logo, subdomain);
      }

      // Create the firm
      const firm = await this.firmRepository.create({
        name: firmName,
        subdomain,
        practiceAreas: practiceAreas as any,
        billingPlan: planTier,
        logoUrl,
        createdAt: new Date()
      });

      // Hash password
      const passwordHash = await this.passwordService.hashPassword(password);

      // Create admin user
      const [firstName, ...lastNameParts] = adminName.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const adminUser = await this.userRepository.create({
        email: adminEmail.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'firm_user',
        createdAt: new Date()
      });

      // Associate admin with firm as owner
      await this.firmRepository.addFirmUser(firm.id, adminUser.id, {
        isOwner: true,
        role: 'owner'
      });

      // Complete the onboarding session
      await this.repository.completeOnboarding(sessionId, firm.id);

      this.auditService.log('onboarding:completed', {
        sessionId,
        firmId: firm.id,
        adminUserId: adminUser.id
      });

      // Return details needed for automatic login
      return {
        firmId: firm.id,
        adminUserId: adminUser.id,
        loginCode: session.code // Can be used for automatic first login
      };
    } catch (error) {
      this.auditService.log('onboarding:completion:failed', {
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get onboarding statistics
   */
  async getStatistics(): Promise<{
    totalSessions: number;
    completedSessions: number;
    activeSessions: number;
    abandonedSessions: number;
    conversionRate: number;
  }> {
    const stats = await this.repository.getStatistics();
    
    return {
      ...stats,
      conversionRate: stats.totalSessions > 0 
        ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
        : 0
    };
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.repository.findExpiredSessions();
    
    for (const session of expiredSessions) {
      await this.repository.updateById(session.id, { 
        status: 'expired',
        updatedAt: new Date()
      });
      
      this.auditService.log('onboarding:session:expired', {
        sessionId: session.id,
        adminEmail: session.adminEmail
      });
    }

    return expiredSessions.length;
  }

  /**
   * Handle logo file upload
   * @private
   */
  private async handleLogoUpload(file: any, subdomain: string): Promise<string> {
    try {
      const fileName = `${subdomain}-logo${Date.now()}`;
      const fileUrl = await this.storageService.uploadFile(file, fileName, 'logos');
      return fileUrl;
    } catch (error) {
      this.auditService.log('onboarding:logo-upload:failed', {
        error: error.message
      });
      throw new Error(`Failed to upload logo: ${error.message}`);
    }
  }

  /**
   * Start onboarding for a firm
   */
  async startOnboarding(firmId: number, tenantId: string): Promise<void> {
    const firm = await this.onboardingRepository.getOnboardingStatus(firmId);
    if (firm === undefined) {
      throw new NotFoundError(`Firm with ID ${firmId} not found`);
    }

    await this.onboardingRepository.updateOnboardingStatus(firmId, false);
  }

  /**
   * Complete onboarding for a firm
   */
  async completeOnboarding(firmId: number, tenantId: string): Promise<void> {
    const firm = await this.onboardingRepository.getOnboardingStatus(firmId);
    if (firm === undefined) {
      throw new NotFoundError(`Firm with ID ${firmId} not found`);
    }

    await this.onboardingRepository.updateOnboardingStatus(firmId, true);
  }
}

// Export a singleton instance
export const onboardingService = new OnboardingService();
