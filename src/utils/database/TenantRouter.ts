// Tenant routing and database selection utility
import { dbManager } from './ConnectionManager';
import { createClient } from '@/utils/supabase/client';

export class TenantRouter {
  private static supabase = createClient();

  /**
   * Get tenant database connection from URL or session
   */
  static async getTenantFromContext(
    tenantId?: string | number,
    userId?: string
  ): Promise<{ tenantId: number; connection: any } | null> {
    
    let resolvedTenantId: number;

    if (tenantId) {
      // From URL parameter
      resolvedTenantId = typeof tenantId === 'string' ? parseInt(tenantId) : tenantId;
    } else if (userId) {
      // From user session
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single();
      
      if (!profile?.tenant_id) return null;
      resolvedTenantId = profile.tenant_id;
    } else {
      return null;
    }

    try {
      const connection = await dbManager.getTenantConnection(resolvedTenantId);
      return { tenantId: resolvedTenantId, connection };
    } catch {
      return null;
    }
  }

  /**
   * Query tenant-specific data
   */
  static async queryTenantData<T>(
    tenantId: number,
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    const connection = await dbManager.getTenantConnection(tenantId);
    const result = await connection.query(query, params);
    return result.rows;
  }

  /**
   * Get clients for a specific tenant
   */
  static async getTenantClients(tenantId: number) {
    return this.queryTenantData(
      tenantId,
      'SELECT * FROM firm.clients ORDER BY created_at DESC',
      []
    );
  }

  /**
   * Get cases for a specific tenant
   */
  static async getTenantCases(tenantId: number) {
    return this.queryTenantData(
      tenantId,
      `SELECT c.*, cl.first_name, cl.last_name 
       FROM firm.cases c 
       LEFT JOIN firm.clients cl ON c.client_id = cl.id 
       ORDER BY c.created_at DESC`,
      []
    );
  }

  /**
   * Create new client in tenant database
   */
  static async createTenantClient(tenantId: number, clientData: any) {
    const connection = await dbManager.getTenantConnection(tenantId);
    
    const query = `
      INSERT INTO firm.clients (first_name, last_name, email, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await connection.query(query, [
      clientData.firstName,
      clientData.lastName, 
      clientData.email,
      clientData.phone
    ]);
    
    return result.rows[0];
  }

  /**
   * Middleware helper for tenant access validation
   */
  static async validateTenantAccess(
    userId: string,
    tenantId: number
  ): Promise<boolean> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    // Super admins and admins can access any tenant
    if (['super_admin', 'admin'].includes(profile.role)) {
      return true;
    }

    // Regular users can only access their own tenant
    return profile.tenant_id === tenantId;
  }
}

export default TenantRouter;
