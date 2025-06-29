import { OAuthTokenStorage } from './oauth/token-storage';
import { OAuthManager } from './oauth/oauth-manager';
import { auditLogger } from '../services/auditLogger';

interface HealthCheckResult {
  provider: string;
  status: 'healthy' | 'expired' | 'error';
  lastChecked: Date;
  error?: string;
}

export class IntegrationHealthCheck {
  private oauthManager: OAuthManager;
  private healthCache: Map<string, { result: HealthCheckResult; timestamp: Date }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(oauthManager: OAuthManager) {
    this.oauthManager = oauthManager;
  }

  async checkIntegrationHealth(tenantId: string, provider: string): Promise<HealthCheckResult> {
    // Check cache first
    const cacheKey = `${tenantId}:${provider}`;
    const cached = this.healthCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.CACHE_TTL) {
      return cached.result;
    }

    try {
      // Get tokens
      const tokens = await OAuthTokenStorage.getTokens(tenantId, provider);
      if (!tokens) {
        const result = {
          provider,
          status: 'error' as const,
          lastChecked: new Date(),
          error: 'No tokens found'
        };
        this.healthCache.set(cacheKey, { result, timestamp: new Date() });
        return result;
      }

      // Check if access token is expired
      if (tokens.expiresIn) {
        const expiryTime = new Date((tokens as any).createdAt).getTime() + (tokens.expiresIn * 1000);
        if (Date.now() >= expiryTime) {
          // Try to refresh the token
          try {
            await this.oauthManager.refreshTokens(tenantId, provider);
          } catch (error) {
            const result = {
              provider,
              status: 'expired' as const,
              lastChecked: new Date(),
              error: 'Token expired and refresh failed'
            };
            this.healthCache.set(cacheKey, { result, timestamp: new Date() });
            return result;
          }
        }
      }

      // Token is valid
      const result = {
        provider,
        status: 'healthy' as const,
        lastChecked: new Date()
      };
      this.healthCache.set(cacheKey, { result, timestamp: new Date() });
      return result;

    } catch (error) {
      // Log the error
      console.error(`Health check error for ${provider}:`, error);
      await auditLogger.logError(
        'integration_health_check',
        {
          tenantId,
          provider,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      const result = {
        provider,
        status: 'error' as const,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      this.healthCache.set(cacheKey, { result, timestamp: new Date() });
      return result;
    }
  }

  async checkAllIntegrations(tenantId: string): Promise<HealthCheckResult[]> {
    const status = await this.oauthManager.getIntegrationStatus(tenantId);
    const results: HealthCheckResult[] = [];

    for (const [provider, isConnected] of Object.entries(status)) {
      if (isConnected) {
        const health = await this.checkIntegrationHealth(tenantId, provider);
        results.push(health);
      }
    }

    return results;
  }

  clearCache(): void {
    this.healthCache.clear();
  }
}
