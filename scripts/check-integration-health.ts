import { db } from '../server/db';
import { firms, firmSettings } from '../server/db/schema';
import { OAuthManager } from '../server/auth/oauth/oauth-manager';
import { IntegrationHealthCheck } from '../server/services/integration-health';
import { auditLogger } from '../server/services/auditLogger';

async function runHealthCheck() {
  try {
    const oauthManager = new OAuthManager();
    const healthChecker = new IntegrationHealthCheck(oauthManager);

    // Get all firms
    const allFirms = await db.select().from(firms);

    for (const firm of allFirms) {
      // Check if firm has any OAuth integrations
      const [settings] = await db
        .select()
        .from(firmSettings)
        .where({ firmId: firm.id })
        .limit(1);

      if (settings?.oauthTokens) {
        const results = await healthChecker.checkAllIntegrations(firm.subdomain);

        // Log results
        for (const result of results) {
          if (result.status !== 'healthy') {
            await auditLogger.logWarning(
              'integration_health',
              {
                tenantId: firm.subdomain,
                provider: result.provider,
                status: result.status,
                error: result.error
              }
            );

            // TODO: Send notifications to firm admins about integration issues
            console.log(`[WARNING] Integration issue for ${firm.name} (${firm.subdomain}):`, result);
          }
        }
      }
    }

    console.log('Health check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
}

// Run the health check
runHealthCheck();
