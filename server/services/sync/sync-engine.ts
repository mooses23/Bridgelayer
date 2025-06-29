import { SyncService } from './sync-service';
import { OAuthManager } from '../../auth/oauth/oauth-manager';
import cron from 'node-cron';

export class SyncEngine {
  private syncService: SyncService;

  constructor(oauthManager: OAuthManager) {
    this.syncService = new SyncService(oauthManager);
  }

  scheduleSync(tenantId: string, provider: string, cronExpr: string) {
    cron.schedule(cronExpr, () => {
      this.syncService.syncProvider(tenantId, provider, { realTime: false });
    });
  }

  triggerRealTimeSync(tenantId: string, provider: string) {
    return this.syncService.triggerRealTimeSync(tenantId, provider);
  }
}
