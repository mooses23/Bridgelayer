import { BaseRepository } from '../repositories/base.repository';
import { AuditService } from './audit.service';
import { ValidationError } from '../middleware/validation.middleware';

/**
 * Base Service class that provides common service operations
 * All specific services should extend this class
 * 
 * @template T - Entity type
 * @template R - Repository type
 */
export abstract class BaseService<T, R extends BaseRepository<any, any, any>> {
  protected repository: R;
  protected auditService: AuditService;
  protected resourceName: string;

  constructor(repository: R, resourceName: string) {
    this.repository = repository;
    this.auditService = new AuditService();
    this.resourceName = resourceName;
  }

  /**
   * Get an entity by ID
   */
  async getById(id: number, options?: { tenant?: string }): Promise<T> {
    const entity = await this.repository.findById(id);
    
    if (!entity) {
      throw new ValidationError({ [this.resourceName]: [`${this.resourceName} not found`] });
    }

    // If the tenant context is provided, ensure the entity belongs to the tenant
    if (options?.tenant && !this.checkTenantAccess(entity, options.tenant)) {
      throw new ValidationError({ [this.resourceName]: [`${this.resourceName} not found`] });
    }

    return entity;
  }

  /**
   * Get all entities
   */
  async getAll(options?: { 
    limit?: number; 
    offset?: number; 
    tenant?: string 
  }): Promise<T[]> {
    const entities = await this.repository.findAll({ 
      limit: options?.limit, 
      offset: options?.offset
    });

    // If the tenant context is provided, filter entities that don't belong to the tenant
    if (options?.tenant) {
      return entities.filter(entity => this.checkTenantAccess(entity, options.tenant));
    }

    return entities;
  }

  /**
   * Delete an entity by ID
   */
  async deleteById(id: number, options?: { tenant?: string }): Promise<boolean> {
    // Ensure the entity exists
    const entity = await this.getById(id, options);
    
    // Delete the entity
    const success = await this.repository.deleteById(id);
    
    if (success) {
      this.auditService.log(`${this.resourceName}:deleted`, { 
        id, 
        ...(options?.tenant && { tenant: options.tenant })
      });
    }
    
    return success;
  }

  /**
   * Check if an entity belongs to a tenant
   * To be overridden by child classes
   */
  protected checkTenantAccess(entity: any, tenant: string): boolean {
    // By default, assume no tenant isolation needed
    // Services that need tenant isolation should override this method
    return true;
  }
}
