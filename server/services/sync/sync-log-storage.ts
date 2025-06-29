interface SyncLog {
  tenantId: string;
  provider: string;
  status: 'success' | 'error';
  recordsSynced: number;
  conflicts: number;
  startedAt: Date;
  finishedAt: Date;
  errors: string[];
}

export class SyncLogStorage {
  private logs: SyncLog[] = [];

  async logSync(log: SyncLog) {
    this.logs.push(log);
    // TODO: Persist to DB if needed
  }

  async getLatestStatus(tenantId: string, provider: string) {
    return this.logs.filter(l => l.tenantId === tenantId && l.provider === provider).slice(-1)[0] || null;
  }

  async getLogs(tenantId: string, provider: string) {
    return this.logs.filter(l => l.tenantId === tenantId && l.provider === provider);
  }
}
