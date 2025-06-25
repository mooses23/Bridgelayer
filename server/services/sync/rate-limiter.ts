export class RateLimiter {
  private limits: Map<string, { count: number; reset: number }> = new Map();
  private readonly WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 10; // max syncs per minute per tenant/provider

  allow(tenantId: string, provider: string): boolean {
    const key = `${tenantId}:${provider}`;
    const now = Date.now();
    const entry = this.limits.get(key);
    if (!entry || now > entry.reset) {
      this.limits.set(key, { count: 1, reset: now + this.WINDOW });
      return true;
    }
    if (entry.count < this.MAX_REQUESTS) {
      entry.count++;
      return true;
    }
    return false;
  }
}
