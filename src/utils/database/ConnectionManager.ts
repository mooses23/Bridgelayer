// Database connection manager for multi-tenant Neon setup
import { Pool } from 'pg';

interface TenantDatabaseConfig {
  tenantId: number;
  databaseUrl: string;
  databaseName: string;
  host: string;
  port: number;
}

class DatabaseConnectionManager {
  private connections: Map<number, Pool> = new Map();
  private centralPool: Pool;

  constructor(centralDatabaseUrl: string) {
    // Central Supabase connection for routing
    this.centralPool = new Pool({
      connectionString: centralDatabaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }

  async getTenantConfig(tenantId: number): Promise<TenantDatabaseConfig | null> {
    const query = `
      SELECT id, database_url, database_name, database_host, database_port 
      FROM public.tenants 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await this.centralPool.query(query, [tenantId]);
    return result.rows[0] || null;
  }

  async getTenantConnection(tenantId: number): Promise<Pool> {
    // Return cached connection if exists
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId)!;
    }

    // Get tenant database config
    const config = await this.getTenantConfig(tenantId);
    if (!config) {
      throw new Error(`Tenant ${tenantId} not found or inactive`);
    }

    // Create new connection pool
    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: 5, // Smaller pool per tenant
      idleTimeoutMillis: 30000,
    });

    // Cache the connection
    this.connections.set(tenantId, pool);
    return pool;
  }

  async provisionTenantDatabase(tenantId: number): Promise<boolean> {
    try {
      // This would integrate with Neon API to create new database
      const neonResponse = await this.createNeonDatabase(tenantId);
      
      // Update tenant record with database info
      await this.centralPool.query(`
        UPDATE public.tenants 
        SET database_url = $1, database_name = $2, database_host = $3, provisioned_at = NOW()
        WHERE id = $4
      `, [neonResponse.connectionString, neonResponse.databaseName, neonResponse.host, tenantId]);

      // Run initial schema migrations
      await this.runTenantMigrations(tenantId);
      
      return true;
    } catch (error) {
      console.error(`Failed to provision database for tenant ${tenantId}:`, error);
      return false;
    }
  }

  private async createNeonDatabase(tenantId: number) {
    // Integrate with Neon API
    // This is pseudo-code - you'd use Neon's actual API
    const response = await fetch('https://console.neon.tech/api/v2/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: {
          name: `firm-${tenantId}`,
          region_id: 'aws-us-east-1',
        }
      })
    });

    return response.json();
  }

  private async runTenantMigrations(tenantId: number) {
    const tenantPool = await this.getTenantConnection(tenantId);
    
    // Run firm-specific schema
    const migrations = [
      `CREATE SCHEMA IF NOT EXISTS firm;`,
      `CREATE TABLE firm.clients (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      `CREATE TABLE firm.cases (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_id UUID REFERENCES firm.clients(id),
        title TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    ];

    for (const migration of migrations) {
      await tenantPool.query(migration);
    }
  }

  async runMigrationOnAllTenants(migrationSql: string) {
    const tenants = await this.centralPool.query(
      'SELECT id FROM public.tenants WHERE is_active = true'
    );

    for (const tenant of tenants.rows) {
      try {
        const tenantPool = await this.getTenantConnection(tenant.id);
        await tenantPool.query(migrationSql);
        
        // Log successful migration
        await this.centralPool.query(`
          INSERT INTO public.tenant_migrations (tenant_id, migration_name, status)
          VALUES ($1, $2, 'success')
        `, [tenant.id, 'custom_migration']);
        
      } catch (error) {
        // Log failed migration
        await this.centralPool.query(`
          INSERT INTO public.tenant_migrations (tenant_id, migration_name, status, error_message)
          VALUES ($1, $2, 'failed', $3)
        `, [tenant.id, 'custom_migration', error.message]);
      }
    }
  }

  async closeAllConnections() {
    for (const [tenantId, pool] of this.connections) {
      await pool.end();
    }
    this.connections.clear();
    await this.centralPool.end();
  }
}

export const dbManager = new DatabaseConnectionManager(
  process.env.CENTRAL_DATABASE_URL!
);
