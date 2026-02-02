// Core Database Router for Multi-Tenant Firm Isolation
// Each firm gets identical schema in separate Neon databases

import { Pool, type QueryResultRow } from 'pg'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'
import NodeCache from 'node-cache'
import type { Database } from '@/types/database'

// Types
interface NeonProject {
  id: string
  name: string
  connection_uri: string
  database_name: string
}

class DatabaseRouter {
  private connectionCache: NodeCache
  private centralSupabase: SupabaseClient<Database>
  private encryptionKey: string

  constructor() {
    // Connection cache with 5-minute TTL
    this.connectionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })
    
    // Central Supabase for routing table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    // Only create Supabase client if env vars are available
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase credentials not found - DatabaseRouter will not work')
      this.centralSupabase = null as any // Will fail at runtime if actually used
    } else {
      this.centralSupabase = createClient<Database>(supabaseUrl, supabaseKey)
    }
    
    this.encryptionKey = process.env.DATABASE_ENCRYPTION_KEY || 'default-dev-key-change-in-prod'
  }

  /**
   * Get firm-specific database connection
   * This is where the magic happens - routes to correct firm DB
   */
  async getFirmDatabase(tenantId: string): Promise<Pool> {
    const cacheKey = `db-${tenantId}`
    
    // Check cache first
    const cachedConnection = this.connectionCache.get<Pool>(cacheKey)
    if (cachedConnection) {
      console.log(`📋 Using cached connection for firm ${tenantId}`)
      return cachedConnection
    }

    console.log(`🔍 Fetching database config for firm ${tenantId}`)
    
    // Get firm's database config from central routing table
    const { data: tenant, error } = await this.centralSupabase
      .from('tenants')
      .select('id, name, database_url, status')
      .eq('id', tenantId)
      .eq('is_active', true)
      .single()

    if (error || !tenant) {
      throw new Error(`Firm database not found: ${tenantId}`)
    }

    if (tenant.status !== 'active') {
      throw new Error(`Firm database is ${tenant.status}: ${tenantId}`)
    }

    if (!tenant.database_url) {
      throw new Error(`No database URL configured for firm: ${tenantId}`)
    }

    // Decrypt the database URL
    const decryptedUrl = this.decryptDatabaseUrl(tenant.database_url)
    
    // Create new connection pool for this firm
    const pool = new Pool({
      connectionString: decryptedUrl,
      max: 5, // Small pool per firm
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    // Test the connection
    try {
      const client = await pool.connect()
      await client.query('SELECT 1')
      client.release()
      console.log(`✅ Connected to firm ${tenantId} database`)
    } catch (error) {
      await pool.end()
      throw new Error(`Failed to connect to firm ${tenantId} database: ${error}`)
    }

    // Cache the connection
    this.connectionCache.set(cacheKey, pool)
    
    return pool
  }

  /**
   * Provision a new Neon database for a firm
   * Creates identical schema to all other firms
   */
  async provisionFirmDatabase(firmData: {
    tenantId: string
    name: string
    slug: string
    plan: string
  }): Promise<{ success: boolean; databaseUrl?: string; error?: string }> {
    
    console.log(`🚀 Provisioning database for firm: ${firmData.name} (${firmData.tenantId})`)
    
    try {
      // Step 1: Create Neon project
      const neonProject = await this.createNeonProject(firmData)
      
      // Step 2: Encrypt and store connection URL
      const encryptedUrl = this.encryptDatabaseUrl(neonProject.connection_uri)
      
      // Step 3: Update tenant record with database info
      const { error: updateError } = await this.centralSupabase
        .from('tenants')
        .update({
          database_url: encryptedUrl,
          database_name: neonProject.database_name,
          status: 'provisioning'
        })
        .eq('id', firmData.tenantId)

      if (updateError) {
        throw new Error(`Failed to update tenant record: ${updateError.message}`)
      }

      // Step 4: Run schema migrations on new database
      await this.setupFirmSchema(neonProject.connection_uri, firmData.tenantId)
      
      // Step 5: Mark as active
      await this.centralSupabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('id', firmData.tenantId)

      console.log(`✅ Successfully provisioned database for firm ${firmData.tenantId}`)
      
      return { 
        success: true, 
        databaseUrl: neonProject.connection_uri 
      }

    } catch (error) {
      console.error(`❌ Failed to provision database for firm ${firmData.tenantId}:`, error)
      
      // Mark as error state
      await this.centralSupabase
        .from('tenants')
        .update({ status: 'error' })
        .eq('id', firmData.tenantId)
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Create Neon project via API
   */
  private async createNeonProject(firmData: {
    tenantId: string
    name: string
    slug: string
  }): Promise<NeonProject> {
    
    const response = await fetch('https://console.neon.tech/api/v2/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: {
          name: `bridgelayer-${firmData.slug}`,
          region_id: 'aws-us-east-1', // You can make this configurable
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Neon API error: ${response.status} - ${errorText}`)
    }

    const project = await response.json()
    
    return {
      id: project.project.id,
      name: project.project.name,
      connection_uri: project.connection_uris[0].connection_uri,
      database_name: project.project.database_name || 'main'
    }
  }

  /**
   * Set up identical schema on firm's database
   * THIS IS THE CORE - SAME SCHEMA EVERYWHERE
   */
  private async setupFirmSchema(connectionUri: string, tenantId: string): Promise<void> {
    const pool = new Pool({ connectionString: connectionUri })
    
    try {
      const client = await pool.connect()
      
      console.log(`📋 Setting up schema for firm ${tenantId}`)
      
      // IDENTICAL SCHEMA FOR ALL FIRMS
      // This ensures LLMs see consistent structure everywhere
      const schemaSQL = `
        -- Create FirmSync schema (identical across ALL firms)
        CREATE SCHEMA IF NOT EXISTS firmsync;

        -- Clients table - IDENTICAL structure for all firms
        CREATE TABLE IF NOT EXISTS firmsync.clients (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(50),
          address JSONB DEFAULT '{}',
          client_type VARCHAR(50) DEFAULT 'individual',
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Cases table - IDENTICAL structure for all firms
        CREATE TABLE IF NOT EXISTS firmsync.cases (
          id SERIAL PRIMARY KEY,
          client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          case_type VARCHAR(100),
          status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'archived')),
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          opened_date DATE DEFAULT CURRENT_DATE,
          closed_date DATE,
          billing_rate DECIMAL(10,2),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Documents table - IDENTICAL structure for all firms
        CREATE TABLE IF NOT EXISTS firmsync.documents (
          id SERIAL PRIMARY KEY,
          case_id INTEGER REFERENCES firmsync.cases(id) ON DELETE CASCADE,
          client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          file_path VARCHAR(500),
          file_size INTEGER,
          file_type VARCHAR(100),
          document_type VARCHAR(100),
          analysis_status VARCHAR(50) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
          analysis_results JSONB DEFAULT '{}',
          ai_summary TEXT,
          extracted_entities JSONB DEFAULT '{}',
          uploaded_at TIMESTAMPTZ DEFAULT NOW(),
          analyzed_at TIMESTAMPTZ
        );

        -- Billing entries - IDENTICAL structure for all firms
        CREATE TABLE IF NOT EXISTS firmsync.billing (
          id SERIAL PRIMARY KEY,
          client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
          case_id INTEGER REFERENCES firmsync.cases(id) ON DELETE CASCADE,
          description TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          hours_worked DECIMAL(4,2),
          hourly_rate DECIMAL(6,2),
          bill_date DATE DEFAULT CURRENT_DATE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue')),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Calendar events - IDENTICAL structure for all firms
        CREATE TABLE IF NOT EXISTS firmsync.calendar_events (
          id SERIAL PRIMARY KEY,
          client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
          case_id INTEGER REFERENCES firmsync.cases(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(100),
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          location VARCHAR(255),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- AI chat history - IDENTICAL structure for all firms
        CREATE TABLE IF NOT EXISTS firmsync.ai_conversations (
          id SERIAL PRIMARY KEY,
          case_id INTEGER REFERENCES firmsync.cases(id) ON DELETE CASCADE,
          client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
          conversation_type VARCHAR(100) DEFAULT 'general',
          messages JSONB NOT NULL DEFAULT '[]',
          context_data JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- ITTT Framework Tables - IDENTICAL for all firms
        CREATE TABLE IF NOT EXISTS firmsync.ittt_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            trigger_type VARCHAR(100) NOT NULL,
            conditions JSONB DEFAULT '[]',
            actions JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS firmsync.ittt_executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            rule_id UUID REFERENCES firmsync.ittt_rules(id) ON DELETE CASCADE,
            trigger_type VARCHAR(100) NOT NULL,
            context_data JSONB DEFAULT '{}',
            executed_at TIMESTAMPTZ DEFAULT NOW(),
            execution_status VARCHAR(50) DEFAULT 'success'
        );

        CREATE TABLE IF NOT EXISTS firmsync.tenant_config (
            tenant_id VARCHAR(255) PRIMARY KEY,
            feature_mode VARCHAR(50) DEFAULT 'native',
            integration_provider VARCHAR(100),
            config_data JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS firmsync.client_contacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
            contact_method VARCHAR(50) NOT NULL,
            contact_notes TEXT,
            contacted_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS firmsync.tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            assigned_to VARCHAR(255),
            due_date TIMESTAMPTZ,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS firmsync.activity_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            entity_type VARCHAR(100) NOT NULL,
            entity_id VARCHAR(255) NOT NULL,
            activity_type VARCHAR(100) NOT NULL,
            description TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for performance (IDENTICAL across all firms)
        CREATE INDEX IF NOT EXISTS idx_clients_email ON firmsync.clients(email);
        CREATE INDEX IF NOT EXISTS idx_clients_status ON firmsync.clients(status);
        CREATE INDEX IF NOT EXISTS idx_cases_client_id ON firmsync.cases(client_id);
        CREATE INDEX IF NOT EXISTS idx_cases_status ON firmsync.cases(status);
        CREATE INDEX IF NOT EXISTS idx_documents_case_id ON firmsync.documents(case_id);
        CREATE INDEX IF NOT EXISTS idx_documents_analysis_status ON firmsync.documents(analysis_status);
        CREATE INDEX IF NOT EXISTS idx_billing_client_id ON firmsync.billing(client_id);
        CREATE INDEX IF NOT EXISTS idx_billing_status ON firmsync.billing(status);
        CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON firmsync.calendar_events(start_time);

        -- Triggers for updated_at timestamps (IDENTICAL across all firms)
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON firmsync.clients
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON firmsync.cases
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON firmsync.ai_conversations
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- Insert welcome data for new firm
        INSERT INTO firmsync.clients (first_name, last_name, email, client_type, metadata) 
        VALUES (
          'Welcome', 
          'Client', 
          'welcome@${tenantId.toLowerCase()}.bridgelayer.com', 
          'organization',
          '{"source": "system", "welcome": true}'
        );

        INSERT INTO firmsync.cases (client_id, title, description, case_type, metadata)
        VALUES (
          1,
          'Welcome Case',
          'This is a sample case to help you get started with FirmSync. You can edit or delete this case once you add your own.',
          'administrative',
          '{"source": "system", "welcome": true}'
        );
      `

      // Execute schema creation
      await client.query(schemaSQL)
      
      client.release()
      console.log(`✅ Schema setup complete for firm ${tenantId}`)
      
    } finally {
      await pool.end()
    }
  }

  /**
   * Encrypt database URL for storage
   */
  private encryptDatabaseUrl(url: string): string {
    return CryptoJS.AES.encrypt(url, this.encryptionKey).toString()
  }

  /**
   * Decrypt database URL for connection
   */
  private decryptDatabaseUrl(encryptedUrl: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedUrl, this.encryptionKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  /**
   * Execute query on firm-specific database
   * This is what your LLMs will use to access firm data
   */
  async queryFirmDatabase<T extends QueryResultRow = QueryResultRow>(
    tenantId: string, 
    query: string, 
    params: unknown[] = []
  ): Promise<T[]> {
    const pool = await this.getFirmDatabase(tenantId)
    const client = await pool.connect()
    
    try {
      const result = await client.query<T>(query, params)
      return result.rows
    } finally {
      client.release()
    }
  }

  /**
   * Clear connection cache (useful for testing)
   */
  clearCache(): void {
    this.connectionCache.flushAll()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.connectionCache.getStats()
  }

  /**
   * Convenience method to provision a new firm with database
   */
  async provisionNewFirm(firmName: string, options: {
    planType?: string
    adminUserId?: string
  } = {}): Promise<{ id: string; name: string; slug: string; plan_type: string; status: string; databaseUrl?: string }> {
    // Create tenant ID
    const tenantId = `firm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const slug = firmName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    
    // First, create tenant record in central Supabase
    const { data: tenant, error } = await this.centralSupabase
      .from('tenants')
      .insert({
        id: tenantId,
        name: firmName,
        slug,
        plan_type: options.planType || 'basic',
        status: 'creating',
        is_active: true,
        created_by: options.adminUserId || 'system'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create tenant record: ${error.message}`)
    }

    // Provision the database
    const result = await this.provisionFirmDatabase({
      tenantId,
      name: firmName,
      slug,
      plan: options.planType || 'basic'
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to provision database')
    }

    return {
      ...tenant,
      databaseUrl: result.databaseUrl
    }
  }

  /**
   * Test connection to a firm's database
   */
  async testFirmConnection(tenantId: string): Promise<boolean> {
    try {
      const pool = await this.getFirmDatabase(tenantId)
      const client = await pool.connect()
      await client.query('SELECT 1')
      client.release()
      return true
    } catch (error) {
      console.error(`Connection test failed for firm ${tenantId}:`, error)
      return false
    }
  }
}

// Singleton instance
export const dbRouter = new DatabaseRouter()
export default DatabaseRouter
