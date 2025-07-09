import { storage } from '../storage.js';

/**
 * PHASE 2: TENANT SERVICE - Database Query Examples with FirmId Scoping
 * 
 * This service demonstrates how to properly scope all database queries 
 * to ensure tenant isolation and prevent cross-tenant data leakage.
 */

export class TenantService {
  
  /**
   * Example: Get tenant-scoped dashboard data
   * All queries MUST include firmId in WHERE clause
   */
  static async getDashboardData(firmId: number) {
    try {
      // Example of properly scoped queries
      const [caseCount, clientCount, documentCount, taskCount] = await Promise.all([
        // Cases scoped to firm
        storage.db.query(`
          SELECT COUNT(*) as count 
          FROM cases 
          WHERE firm_id = $1 AND status = 'active'
        `, [firmId]),
        
        // Clients scoped to firm
        storage.db.query(`
          SELECT COUNT(*) as count 
          FROM clients 
          WHERE firm_id = $1 AND status = 'active'
        `, [firmId]),
        
        // Documents scoped to firm
        storage.db.query(`
          SELECT COUNT(*) as count 
          FROM documents 
          WHERE firm_id = $1
        `, [firmId]),
        
        // Tasks scoped to firm
        storage.db.query(`
          SELECT COUNT(*) as count 
          FROM tasks 
          WHERE firm_id = $1 AND status = 'pending'
        `, [firmId])
      ]);

      return {
        totalCases: caseCount.rows[0].count,
        totalClients: clientCount.rows[0].count,
        totalDocuments: documentCount.rows[0].count,
        pendingTasks: taskCount.rows[0].count,
        firmId // Always include firmId in response for audit
      };
    } catch (error) {
      console.error(`Dashboard data query failed for firm ${firmId}:`, error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  /**
   * Example: Get firm cases with proper scoping
   */
  static async getFirmCases(firmId: number, filters: any = {}) {
    try {
      let query = `
        SELECT c.*, cl.name as client_name 
        FROM cases c 
        LEFT JOIN clients cl ON c.client_id = cl.id 
        WHERE c.firm_id = $1
      `;
      const params = [firmId];

      // Add additional filters while maintaining firm scoping
      if (filters.status) {
        query += ` AND c.status = $${params.length + 1}`;
        params.push(filters.status);
      }

      if (filters.priority) {
        query += ` AND c.priority = $${params.length + 1}`;
        params.push(filters.priority);
      }

      query += ` ORDER BY c.created_at DESC`;

      const result = await storage.db.query(query, params);
      
      return result.rows.map(row => ({
        ...row,
        firmId // Ensure firmId is always included
      }));
    } catch (error) {
      console.error(`Cases query failed for firm ${firmId}:`, error);
      throw new Error('Failed to fetch cases');
    }
  }

  /**
   * Example: Get firm clients with proper scoping
   */
  static async getFirmClients(firmId: number, page: number = 1, limit: number = 50) {
    try {
      const offset = (page - 1) * limit;
      
      const [clientsResult, countResult] = await Promise.all([
        storage.db.query(`
          SELECT id, name, email, phone, status, created_at, updated_at
          FROM clients 
          WHERE firm_id = $1 
          ORDER BY name ASC 
          LIMIT $2 OFFSET $3
        `, [firmId, limit, offset]),
        
        storage.db.query(`
          SELECT COUNT(*) as total 
          FROM clients 
          WHERE firm_id = $1
        `, [firmId])
      ]);

      return {
        clients: clientsResult.rows.map(row => ({ ...row, firmId })),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      };
    } catch (error) {
      console.error(`Clients query failed for firm ${firmId}:`, error);
      throw new Error('Failed to fetch clients');
    }
  }

  /**
   * Example: Create new client with firm scoping
   */
  static async createClient(firmId: number, clientData: any) {
    try {
      const { name, email, phone, address } = clientData;
      
      const result = await storage.db.query(`
        INSERT INTO clients (firm_id, name, email, phone, address, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
        RETURNING *
      `, [firmId, name, email, phone, address]);

      return {
        ...result.rows[0],
        firmId
      };
    } catch (error) {
      console.error(`Client creation failed for firm ${firmId}:`, error);
      throw new Error('Failed to create client');
    }
  }

  /**
   * Example: Update client with firm validation
   */
  static async updateClient(firmId: number, clientId: number, updates: any) {
    try {
      // First verify the client belongs to the firm
      const existingClient = await storage.db.query(`
        SELECT id FROM clients 
        WHERE id = $1 AND firm_id = $2
      `, [clientId, firmId]);

      if (existingClient.rows.length === 0) {
        throw new Error('Client not found or access denied');
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 3; // Start after id and firmId

      for (const [key, value] of Object.entries(updates)) {
        if (['name', 'email', 'phone', 'address', 'status'].includes(key)) {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = NOW()');

      const query = `
        UPDATE clients 
        SET ${updateFields.join(', ')}
        WHERE id = $1 AND firm_id = $2
        RETURNING *
      `;

      const result = await storage.db.query(query, [clientId, firmId, ...updateValues]);
      
      return {
        ...result.rows[0],
        firmId
      };
    } catch (error) {
      console.error(`Client update failed for firm ${firmId}, client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Example: Delete client with firm validation
   */
  static async deleteClient(firmId: number, clientId: number) {
    try {
      const result = await storage.db.query(`
        DELETE FROM clients 
        WHERE id = $1 AND firm_id = $2
        RETURNING id
      `, [clientId, firmId]);

      if (result.rows.length === 0) {
        throw new Error('Client not found or access denied');
      }

      return { success: true, deletedId: clientId, firmId };
    } catch (error) {
      console.error(`Client deletion failed for firm ${firmId}, client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Example: Get firm documents with proper scoping
   */
  static async getFirmDocuments(firmId: number, documentType?: string) {
    try {
      let query = `
        SELECT id, name, type, size, created_at, updated_at, created_by
        FROM documents 
        WHERE firm_id = $1
      `;
      const params = [firmId];

      if (documentType) {
        query += ` AND type = $${params.length + 1}`;
        params.push(documentType);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await storage.db.query(query, params);
      
      return result.rows.map(row => ({
        ...row,
        firmId
      }));
    } catch (error) {
      console.error(`Documents query failed for firm ${firmId}:`, error);
      throw new Error('Failed to fetch documents');
    }
  }

  /**
   * Example: Get firm billing/invoices with proper scoping
   */
  static async getFirmInvoices(firmId: number, status?: string) {
    try {
      let query = `
        SELECT i.*, c.name as client_name
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.firm_id = $1
      `;
      const params = [firmId];

      if (status) {
        query += ` AND i.status = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY i.created_at DESC`;

      const result = await storage.db.query(query, params);
      
      return result.rows.map(row => ({
        ...row,
        firmId
      }));
    } catch (error) {
      console.error(`Invoices query failed for firm ${firmId}:`, error);
      throw new Error('Failed to fetch invoices');
    }
  }

  /**
   * SECURITY VALIDATION: Check if user can access firm data
   */
  static async validateUserFirmAccess(userId: number, firmId: number): Promise<boolean> {
    try {
      const result = await storage.db.query(`
        SELECT u.id 
        FROM users u 
        WHERE u.id = $1 AND u.firm_id = $2
      `, [userId, firmId]);

      return result.rows.length > 0;
    } catch (error) {
      console.error(`Firm access validation failed for user ${userId}, firm ${firmId}:`, error);
      return false;
    }
  }

  /**
   * AUDIT: Log all tenant data access for security monitoring
   */
  static async logTenantAccess(userId: number, firmId: number, action: string, resource: string) {
    try {
      await storage.db.query(`
        INSERT INTO audit_logs (user_id, firm_id, action, resource, timestamp, ip_address)
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `, [userId, firmId, action, resource, 'server-internal']);
    } catch (error) {
      console.error('Failed to log tenant access:', error);
      // Don't throw - logging failure shouldn't break the main operation
    }
  }
}

/**
 * CRITICAL SECURITY RULES FOR ALL DATABASE QUERIES:
 * 
 * 1. ALWAYS include firm_id in WHERE clause for tenant-scoped tables
 * 2. NEVER trust client-provided firmId - always get from authenticated user
 * 3. ALWAYS validate user belongs to firm before any operation
 * 4. ALWAYS include firmId in response data for audit trails
 * 5. ALWAYS log tenant access for security monitoring
 * 6. NEVER use SELECT * - always specify columns needed
 * 7. ALWAYS use parameterized queries to prevent SQL injection
 * 8. ALWAYS handle errors gracefully without exposing internal details
 */

export default TenantService;
