import { BaseService } from './base.service';
import { AdminRepository, GhostSession } from '../repositories/admin.repository';
import { FirmRepository } from '../repositories/firm.repository';
import { UserRepository } from '../repositories/user.repository';
import { ValidationError } from '../middleware/validation.middleware';
import { AuditService } from './audit.service';
import { NotFoundError, AuthorizationError } from '../utils/errors';

/**
 * Service for Admin operations
 */
export class AdminService extends BaseService<GhostSession, AdminRepository> {
  private firmRepository: FirmRepository;
  private userRepository: UserRepository;

  constructor() {
    const adminRepository = new AdminRepository();
    super(adminRepository, 'admin');
    
    this.firmRepository = new FirmRepository();
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(tenantId?: string): Promise<any[]> {
    return this.repository.getAdminUsers(tenantId);
  }

  /**
   * Verify admin access to tenant
   */
  async verifyAdminTenantAccess(adminId: number, tenantId: string): Promise<boolean> {
    return this.repository.verifyAdminTenantAccess(adminId, tenantId);
  }

  /**
   * Start ghost mode session
   */
  async startGhostSession(adminId: number, firmId: number, purpose: string, notes?: string): Promise<{
    sessionToken: string;
    targetFirm: any;
    startedAt: Date;
  }> {
    // Verify admin user exists
    const adminUser = await this.userRepository.findById(adminId);
    if (!adminUser) {
      throw new ValidationError({ userId: ['Admin user not found'] });
    }

    // Verify admin role
    if (!['admin', 'platform_admin', 'super_admin'].includes(adminUser.role)) {
      throw new ValidationError({ userId: ['User does not have admin privileges'] });
    }

    // Verify firm exists
    const targetFirm = await this.firmRepository.findById(firmId);
    if (!targetFirm) {
      throw new ValidationError({ firmId: ['Target firm not found'] });
    }

    // Create ghost session
    const session = await this.repository.createGhostSession(
      adminId,
      firmId,
      purpose,
      notes
    );

    // Log this action
    this.auditService.log('admin:ghost_mode:started', {
      adminId,
      targetFirmId: firmId,
      sessionToken: session.sessionToken
    });

    return {
      sessionToken: session.sessionToken,
      targetFirm: {
        id: targetFirm.id,
        name: targetFirm.name,
        subdomain: targetFirm.subdomain,
        status: targetFirm.status
      },
      startedAt: session.startedAt
    };
  }

  /**
   * End ghost mode session
   */
  async endGhostSession(sessionToken: string, adminId: number): Promise<boolean> {
    // Verify session exists and is active
    const session = await this.repository.getGhostSessionByToken(sessionToken);
    if (!session) {
      throw new ValidationError({ sessionToken: ['Ghost session not found'] });
    }

    if (!session.isActive) {
      throw new ValidationError({ sessionToken: ['Ghost session is already ended'] });
    }

    // Verify admin user is the owner of the session or a super admin
    const adminUser = await this.userRepository.findById(adminId);
    if (!adminUser) {
      throw new ValidationError({ userId: ['Admin user not found'] });
    }

    if (session.adminUserId !== adminId && adminUser.role !== 'super_admin') {
      throw new ValidationError({ sessionToken: ['Not authorized to end this ghost session'] });
    }

    // End the session
    const updatedSession = await this.repository.endGhostSession(sessionToken);
    
    // Log this action
    this.auditService.log('admin:ghost_mode:ended', {
      adminId,
      targetFirmId: session.targetFirmId,
      sessionToken
    });

    return !!updatedSession;
  }

  /**
   * Get active ghost sessions
   */
  async getActiveGhostSessions(adminId?: number): Promise<GhostSession[]> {
    return this.repository.getActiveGhostSessions(adminId);
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<any> {
    return this.repository.getSystemStats();
  }

  /**
   * Get admin by email
   */
  async getAdminByEmail(email: string, tenantId: string): Promise<User> {
    const admin = await this.adminRepository.findAdminByEmail(email);
    if (!admin) {
      throw new NotFoundError(`Admin with email ${email} not found`);
    }
    return admin;
  }

  /**
   * Verify admin privileges
   */
  async verifyAdminPrivileges(userId: number, tenantId: string): Promise<void> {
    const admin = await this.adminRepository.findAdminById(userId);
    if (!admin || admin.role !== 'admin') {
      throw new AuthorizationError('User does not have admin privileges');
    }
  }
}
