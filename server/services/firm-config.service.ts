import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { firms, firmIntegrations, platformIntegrations } from '../../shared/schema.js';
import { FirmIntegrationConfig } from '../interfaces/agent-backend.interfaces.js';

/**
 * Firm Configuration Service
 * 
 * Bridges onboarding integration selections to agent routing decisions.
 * Manages firm-specific integration configurations and credentials.
 */
export class FirmConfigService {
  
  /**
   * Get all integrations configured for a firm
   */
  async getFirmIntegrations(firmId: number): Promise<string[]> {
    try {
      const integrations = await db
        .select({
          integrationName: platformIntegrations.name
        })
        .from(firmIntegrations)
        .innerJoin(platformIntegrations, eq(firmIntegrations.integrationId, platformIntegrations.id))
        .where(eq(firmIntegrations.firmId, firmId));
      
      return integrations.map(i => i.integrationName);
    } catch (error) {
      console.error('Failed to get firm integrations:', error);
      return [];
    }
  }

  /**
   * Check if a specific integration is enabled for a firm
   */
  async isIntegrationEnabled(firmId: number, integrationName: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(firmIntegrations)
        .innerJoin(platformIntegrations, eq(firmIntegrations.integrationId, platformIntegrations.id))
        .where(
          eq(firmIntegrations.firmId, firmId),
          eq(platformIntegrations.name, integrationName)
        )
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Failed to check integration status:', error);
      return false;
    }
  }

  /**
   * Get complete integration configuration for a firm
   */
  async getFirmIntegrationConfig(firmId: number): Promise<FirmIntegrationConfig> {
    try {
      const firm = await db
        .select()
        .from(firms)
        .where(eq(firms.id, firmId))
        .limit(1);
      
      if (!firm[0]) {
        throw new Error(`Firm ${firmId} not found`);
      }

      const integrations = await db
        .select({
          name: platformIntegrations.name,
          config: firmIntegrations.config,
          apiKey: firmIntegrations.apiKey,
          accessToken: firmIntegrations.accessToken,
          refreshToken: firmIntegrations.refreshToken,
          tokenExpiresAt: firmIntegrations.tokenExpiresAt
        })
        .from(firmIntegrations)
        .innerJoin(platformIntegrations, eq(firmIntegrations.integrationId, platformIntegrations.id))
        .where(eq(firmIntegrations.firmId, firmId));
      
      // Build integration config object
      const config: FirmIntegrationConfig = {
        firmId,
        integrations: {}
      };

      for (const integration of integrations) {
        config.integrations[integration.name] = {
          enabled: true,
          ...integration.config as any,
          accessToken: integration.accessToken || undefined,
          refreshToken: integration.refreshToken || undefined,
          expiresAt: integration.tokenExpiresAt || undefined
        };
      }

      return config;
    } catch (error) {
      console.error('Failed to get firm integration config:', error);
      return { firmId, integrations: {} };
    }
  }

  /**
   * Finalize integrations from onboarding step 2
   */
  async finalizeOnboardingIntegrations(
    firmId: number, 
    selectedIntegrations: string[],
    integrationConfigs: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Get platform integration IDs for selected integrations
      const platformIntegrationsList = await db
        .select()
        .from(platformIntegrations)
        .where(eq(platformIntegrations.isActive, true));
      
      const platformMap = new Map(
        platformIntegrationsList.map(p => [p.name, p])
      );

      // Create firm integrations for each selected integration
      for (const integrationName of selectedIntegrations) {
        const platformIntegration = platformMap.get(integrationName);
        
        if (!platformIntegration) {
          console.warn(`Platform integration ${integrationName} not found`);
          continue;
        }

        const config = integrationConfigs[integrationName] || {};
        
        // Check if integration already exists
        const existing = await db
          .select()
          .from(firmIntegrations)
          .where(
            eq(firmIntegrations.firmId, firmId),
            eq(firmIntegrations.integrationId, platformIntegration.id)
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(firmIntegrations).values({
            firmId,
            integrationId: platformIntegration.id,
            config: config,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          // Update existing integration
          await db
            .update(firmIntegrations)
            .set({
              config: config,
              isActive: true,
              updatedAt: new Date()
            })
            .where(eq(firmIntegrations.id, existing[0].id));
        }
      }

      // Mark onboarding as having integration setup completed
      await db
        .update(firms)
        .set({
          step2_selectedIntegrations: selectedIntegrations,
          step2_integrationConfigs: integrationConfigs,
          updatedAt: new Date()
        })
        .where(eq(firms.id, firmId));

    } catch (error) {
      console.error('Failed to finalize onboarding integrations:', error);
      throw error;
    }
  }

  /**
   * Update integration credentials (OAuth tokens, API keys)
   */
  async updateIntegrationCredentials(
    firmId: number,
    integrationName: string,
    credentials: {
      apiKey?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
      additionalConfig?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const platformIntegration = await db
        .select()
        .from(platformIntegrations)
        .where(eq(platformIntegrations.name, integrationName))
        .limit(1);
      
      if (!platformIntegration[0]) {
        throw new Error(`Platform integration ${integrationName} not found`);
      }

      await db
        .update(firmIntegrations)
        .set({
          apiKey: credentials.apiKey,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          tokenExpiresAt: credentials.expiresAt,
          config: credentials.additionalConfig,
          updatedAt: new Date()
        })
        .where(
          eq(firmIntegrations.firmId, firmId),
          eq(firmIntegrations.integrationId, platformIntegration[0].id)
        );
        
    } catch (error) {
      console.error('Failed to update integration credentials:', error);
      throw error;
    }
  }

  /**
   * Get integration credentials for API calls
   */
  async getIntegrationCredentials(
    firmId: number,
    integrationName: string
  ): Promise<{
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    config?: Record<string, any>;
  } | null> {
    try {
      const result = await db
        .select({
          apiKey: firmIntegrations.apiKey,
          accessToken: firmIntegrations.accessToken,
          refreshToken: firmIntegrations.refreshToken,
          expiresAt: firmIntegrations.tokenExpiresAt,
          config: firmIntegrations.config
        })
        .from(firmIntegrations)
        .innerJoin(platformIntegrations, eq(firmIntegrations.integrationId, platformIntegrations.id))
        .where(
          eq(firmIntegrations.firmId, firmId),
          eq(platformIntegrations.name, integrationName)
        )
        .limit(1);
      
      if (!result[0]) {
        return null;
      }

      return {
        apiKey: result[0].apiKey || undefined,
        accessToken: result[0].accessToken || undefined,
        refreshToken: result[0].refreshToken || undefined,
        expiresAt: result[0].expiresAt || undefined,
        config: result[0].config as Record<string, any> || {}
      };
    } catch (error) {
      console.error('Failed to get integration credentials:', error);
      return null;
    }
  }

  /**
   * Disable an integration for a firm
   */
  async disableIntegration(firmId: number, integrationName: string): Promise<void> {
    try {
      const platformIntegration = await db
        .select()
        .from(platformIntegrations)
        .where(eq(platformIntegrations.name, integrationName))
        .limit(1);
      
      if (!platformIntegration[0]) {
        throw new Error(`Platform integration ${integrationName} not found`);
      }

      await db
        .update(firmIntegrations)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(
          eq(firmIntegrations.firmId, firmId),
          eq(firmIntegrations.integrationId, platformIntegration[0].id)
        );
    } catch (error) {
      console.error('Failed to disable integration:', error);
      throw error;
    }
  }

  /**
   * Get integration health status for admin dashboard
   */
  async getIntegrationHealthStatus(firmId: number): Promise<Record<string, any>> {
    try {
      const integrations = await db
        .select({
          name: platformIntegrations.name,
          isActive: firmIntegrations.isActive,
          lastUsedAt: firmIntegrations.lastUsedAt,
          errorCount: firmIntegrations.errorCount
        })
        .from(firmIntegrations)
        .innerJoin(platformIntegrations, eq(firmIntegrations.integrationId, platformIntegrations.id))
        .where(eq(firmIntegrations.firmId, firmId));
      
      const healthStatus: Record<string, any> = {};
      
      for (const integration of integrations) {
        healthStatus[integration.name] = {
          enabled: integration.isActive,
          lastUsed: integration.lastUsedAt,
          errorCount: integration.errorCount || 0,
          status: this.calculateHealthStatus(integration)
        };
      }

      return healthStatus;
    } catch (error) {
      console.error('Failed to get integration health status:', error);
      return {};
    }
  }

  private calculateHealthStatus(integration: any): 'healthy' | 'degraded' | 'down' {
    if (!integration.isActive) return 'down';
    if ((integration.errorCount || 0) > 5) return 'degraded';
    if (integration.lastUsedAt && 
        Date.now() - new Date(integration.lastUsedAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
      return 'degraded'; // No activity in 7 days
    }
    return 'healthy';
  }
}

export const firmConfigService = new FirmConfigService();
