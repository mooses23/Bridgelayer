import { OAuthTokenStorage } from '../../auth/oauth/token-storage';
import { OAuthManager } from '../../auth/oauth/oauth-manager';
import { auditLogger } from '../auditLogger';
import { RateLimiter } from './rate-limiter';
import { SyncLogStorage } from './sync-log-storage';
import { DataTransformer } from './data-transformer';

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
  conflicts: number;
  startedAt: Date;
  finishedAt: Date;
}

export class SyncService {
  private oauthManager: OAuthManager;
  private rateLimiter: RateLimiter;
  private transformer: DataTransformer;
  private logStorage: SyncLogStorage;

  constructor(oauthManager: OAuthManager) {
    this.oauthManager = oauthManager;
    this.rateLimiter = new RateLimiter();
    this.transformer = new DataTransformer();
    this.logStorage = new SyncLogStorage();
  }

  async syncProvider(tenantId: string, provider: string, options: { realTime?: boolean } = {}): Promise<SyncResult> {
    const startedAt = new Date();
    let recordsSynced = 0;
    let conflicts = 0;
    const errors: string[] = [];
    let attempts = 0;
    const MAX_RETRIES = 3;

    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        // Rate limiting
        if (!this.rateLimiter.allow(tenantId, provider)) {
          throw new Error('Rate limit exceeded');
        }

        // Get tokens
        const tokens = await OAuthTokenStorage.getTokens(tenantId, provider);
        if (!tokens) throw new Error('No tokens found');

        // Get provider adapter
        const adapter = this.oauthManager.getProviderAdapter(provider);
        if (!adapter) throw new Error('No adapter for provider');

        // Pull data
        const rawData = await adapter.pullData(tokens, { realTime: !!options.realTime });

        // Data validation
        if (!Array.isArray(rawData)) throw new Error('Invalid data format');
        if (rawData.length === 0) throw new Error('No data to sync');

        // Transform data for AI agent
        const transformed = this.transformer.transform(rawData, provider);

        // Store or forward data (to DB, queue, or AI agent)
        // ...existing code for storage/forwarding...
        recordsSynced = transformed.length;

        // Conflict detection/resolution (example: deduplication by unique ID)
        // TODO: Implement actual conflict logic
        // conflicts = ...;

        // Log success
        await this.logStorage.logSync({
          tenantId,
          provider,
          status: 'success',
          recordsSynced,
          conflicts,
          startedAt,
          finishedAt: new Date(),
          errors: []
        });

        return { success: true, recordsSynced, errors: [], conflicts, startedAt, finishedAt: new Date() };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errMsg);
        if (attempts >= MAX_RETRIES) {
          await this.logStorage.logSync({
            tenantId,
            provider,
            status: 'error',
            recordsSynced,
            conflicts,
            startedAt,
            finishedAt: new Date(),
            errors
          });
          await auditLogger.logError('sync_service', { tenantId, provider, error: errMsg });
          return { success: false, recordsSynced, errors, conflicts, startedAt, finishedAt: new Date() };
        }
        // Exponential backoff
        await new Promise(res => setTimeout(res, 500 * attempts));
      }
    }
    // Should not reach here
    return { success: false, recordsSynced, errors, conflicts, startedAt, finishedAt: new Date() };
  }

  async getSyncStatus(tenantId: string, provider: string) {
    return this.logStorage.getLatestStatus(tenantId, provider);
  }

  async getSyncLogs(tenantId: string, provider: string) {
    return this.logStorage.getLogs(tenantId, provider);
  }

  scheduleSync(tenantId: string, provider: string, cronExpr: string) {
    // ...existing code to schedule sync using node-cron or similar...
  }

  triggerRealTimeSync(tenantId: string, provider: string) {
    return this.syncProvider(tenantId, provider, { realTime: true });
  }
}
