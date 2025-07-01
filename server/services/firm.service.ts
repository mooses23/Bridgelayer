import { FirmRepository } from '../repositories/firm.repository';
import { UserRepository } from '../repositories/user.repository';
import { ValidationError } from '../middleware/validation.middleware';
import { AuditService } from './audit.service';
import { authService } from './auth.service';
import { EncryptionService } from './encryption.service';
import { NotFoundError } from '../utils/errors';
import { cacheService } from './cache.service';

/**
 * Firm Service handles all firm-related business logic
 */
export class FirmService {
  private firmRepository: FirmRepository;
  private userRepository: UserRepository;
  private auditService: AuditService;
  private encryptionService: EncryptionService;
  private readonly FIRM_CACHE_PREFIX = 'firm:';
  private readonly FIRM_CACHE_TTL = 3600; // 1 hour

  constructor() {
    this.firmRepository = new FirmRepository();
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
    this.encryptionService = new EncryptionService();
  }

  /**
   * Get firm by ID
   */
  async getFirmById(id: number, tenantId: string) {
    const cacheKey = `${this.FIRM_CACHE_PREFIX}id:${id}:tenant:${tenantId}`;
    
    // Try to get firm from cache first
    const cachedFirm = await cacheService.get(cacheKey);
    if (cachedFirm) {
      return cachedFirm;
    }
    
    // If not in cache, get from database
    const firm = await this.firmRepository.findById(id);
    if (!firm) {
      throw new NotFoundError(`Firm with ID ${id} not found`);
    }
    
    // Cache the firm
    await cacheService.set(cacheKey, firm, this.FIRM_CACHE_TTL);
    
    return firm;
  }

  /**
   * Get firm by slug
   */
  async getFirmBySlug(slug: string, tenantId: string) {
    const cacheKey = `${this.FIRM_CACHE_PREFIX}slug:${slug}:tenant:${tenantId}`;
    
    // Try to get firm from cache first
    const cachedFirm = await cacheService.get(cacheKey);
    if (cachedFirm) {
      return cachedFirm;
    }
    
    // If not in cache, get from database
    const firm = await this.firmRepository.findBySlug(slug);
    if (!firm) {
      throw new NotFoundError(`Firm with slug ${slug} not found`);
    }
    
    // Cache the firm
    await cacheService.set(cacheKey, firm, this.FIRM_CACHE_TTL);
    
    return firm;
  }

  /**
   * Create a new firm
   */
  async createFirm(firmData: {
    name: string;
    subdomain?: string;
    practiceAreas?: string[];
    billingPlan?: string;
    ownerEmail?: string;
    ownerPassword?: string;
    ownerFirstName?: string;
    ownerLastName?: string;
    openaiKey?: string;
  }) {
    // Check if subdomain is available if provided
    if (firmData.subdomain) {
      const existingFirm = await this.firmRepository.findBySubdomain(firmData.subdomain);
      if (existingFirm) {
        throw new ValidationError({ subdomain: ['Subdomain is already in use'] });
      }
    }

    // Encrypt sensitive data if needed
    let encryptedOpenaiKey = undefined;
    if (firmData.openaiKey) {
      encryptedOpenaiKey = await this.encryptionService.encrypt(firmData.openaiKey);
    }

    // Create the firm
    const firm = await this.firmRepository.create({
      name: firmData.name,
      subdomain: firmData.subdomain,
      practiceAreas: firmData.practiceAreas as any,
      billingPlan: firmData.billingPlan,
      openaiKey: encryptedOpenaiKey,
      createdAt: new Date()
    });

    // Create the owner user if email and password are provided
    if (firmData.ownerEmail && firmData.ownerPassword) {
      const userData = {
        email: firmData.ownerEmail,
        password: firmData.ownerPassword,
        firstName: firmData.ownerFirstName,
        lastName: firmData.ownerLastName,
        role: 'firm_user'
      };

      const { user } = await authService.register(userData);
      
      // Associate the user with the firm
      await this.firmRepository.addFirmUser(firm.id, user.id, { isOwner: true, role: 'owner' });
      
      this.auditService.log('firm:created', { 
        firmId: firm.id, 
        firmName: firm.name,
        userId: user.id
      });
    } else {
      this.auditService.log('firm:created', { 
        firmId: firm.id, 
        firmName: firm.name
      });
    }

    return this.sanitizeFirm(firm);
  }

  /**
   * Update a firm
   */
  async updateFirm(id: number, firmData: {
    name?: string;
    subdomain?: string;
    practiceAreas?: string[];
    billingPlan?: string;
    openaiKey?: string;
  }) {
    // Check if firm exists
    const existingFirm = await this.firmRepository.findById(id);
    if (!existingFirm) {
      throw new ValidationError({ firm: ['Firm not found'] });
    }

    // Check if subdomain is available if changed
    if (firmData.subdomain && firmData.subdomain !== existingFirm.subdomain) {
      const firmWithSubdomain = await this.firmRepository.findBySubdomain(firmData.subdomain);
      if (firmWithSubdomain && firmWithSubdomain.id !== id) {
        throw new ValidationError({ subdomain: ['Subdomain is already in use'] });
      }
    }

    // Encrypt sensitive data if needed
    let encryptedOpenaiKey = undefined;
    if (firmData.openaiKey) {
      encryptedOpenaiKey = await this.encryptionService.encrypt(firmData.openaiKey);
    }

    // Update the firm
    const updateData = {
      ...(firmData.name && { name: firmData.name }),
      ...(firmData.subdomain && { subdomain: firmData.subdomain }),
      ...(firmData.practiceAreas && { practiceAreas: firmData.practiceAreas as any }),
      ...(firmData.billingPlan && { billingPlan: firmData.billingPlan }),
      ...(encryptedOpenaiKey && { openaiKey: encryptedOpenaiKey }),
      updatedAt: new Date()
    };

    const updatedFirm = await this.firmRepository.updateById(id, updateData);
    
    // Invalidate the cache for the updated firm
    const cacheKey = `${this.FIRM_CACHE_PREFIX}${id}`;
    await cacheService.del(cacheKey);

    this.auditService.log('firm:updated', { 
      firmId: id,
      updatedFields: Object.keys(firmData)
    });

    return this.sanitizeFirm(updatedFirm);
  }

  /**
   * Delete a firm (soft delete)
   */
  async deleteFirm(id: number) {
    const success = await this.firmRepository.softDelete(id);
    
    if (success) {
      this.auditService.log('firm:deleted', { firmId: id });
    }
    
    return { success };
  }

  /**
   * Get firm users
   */
  async getFirmUsers(firmId: number) {
    const firm = await this.firmRepository.findById(firmId);
    if (!firm) {
      throw new ValidationError({ firm: ['Firm not found'] });
    }

    return this.firmRepository.getFirmUsers(firmId);
  }

  /**
   * Add user to firm
   */
  async addUserToFirm(firmId: number, userId: number, options: { isOwner?: boolean, role?: string }) {
    // Check if firm exists
    const firm = await this.firmRepository.findById(firmId);
    if (!firm) {
      throw new ValidationError({ firm: ['Firm not found'] });
    }

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError({ user: ['User not found'] });
    }

    // Check if user is already in firm
    const existingFirmUser = await this.firmRepository.getFirmUser(firmId, userId);
    if (existingFirmUser) {
      throw new ValidationError({ user: ['User is already in firm'] });
    }

    // Add user to firm
    const firmUser = await this.firmRepository.addFirmUser(firmId, userId, {
      isOwner: options.isOwner || false,
      role: options.role || 'member'
    });

    this.auditService.log('firm:user:added', { 
      firmId,
      userId,
      role: options.role || 'member',
      isOwner: options.isOwner || false
    });

    return firmUser;
  }

  /**
   * Remove user from firm
   */
  async removeUserFromFirm(firmId: number, userId: number) {
    // Check if firm exists
    const firm = await this.firmRepository.findById(firmId);
    if (!firm) {
      throw new ValidationError({ firm: ['Firm not found'] });
    }

    // Check if user is in firm
    const firmUser = await this.firmRepository.getFirmUser(firmId, userId);
    if (!firmUser) {
      throw new ValidationError({ user: ['User is not in firm'] });
    }

    // Don't allow removing the last owner
    if (firmUser.isOwner) {
      const owners = await this.firmRepository.getFirmOwners(firmId);
      if (owners.length <= 1) {
        throw new ValidationError({ user: ['Cannot remove the last firm owner'] });
      }
    }

    // Remove user from firm
    const success = await this.firmRepository.removeFirmUser(firmId, userId);

    if (success) {
      this.auditService.log('firm:user:removed', { firmId, userId });
    }

    return { success };
  }

  /**
   * Sanitize firm data before returning to clients
   * - Don't expose sensitive fields
   */
  private sanitizeFirm(firm) {
    if (!firm) return null;
    
    // Create a copy to avoid modifying the original
    const sanitized = { ...firm };
    
    // Don't expose the encrypted OpenAI key
    if (sanitized.openaiKey) {
      sanitized.hasOpenaiKey = true;
      delete sanitized.openaiKey;
    } else {
      sanitized.hasOpenaiKey = false;
    }
    
    return sanitized;
  }
}

// Export a singleton instance
export const firmService = new FirmService();
