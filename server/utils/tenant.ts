
import { Request } from 'express';

export function getTenantIdFromRequest(req: Request): string {
  // Get tenant from subdomain
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  
  // Fallback to auth context if available
  if (req.user?.firmId) {
    return req.user.firmId?.toString() || subdomain;
  }
  
  // Fallback to subdomain
  return subdomain;
}

export function extractTenantFromHost(host: string): string {
  return host.split('.')[0];
}
