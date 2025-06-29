import { storage } from '../storage.js';

interface AuditLogEntry {
  userId: number;
  firmId: number | null;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];

  async logLogin(userId: number, firmId: number | null, ipAddress?: string, userAgent?: string) {
    const entry: AuditLogEntry = {
      userId,
      firmId,
      action: 'LOGIN',
      details: { timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    };
    
    this.logs.push(entry);
    
    try {
      // Only create audit log if firmId exists (skip for admin users with no firm)
      if (firmId) {
        await storage.createAuditLog({
          firmId,
          userId,
          actorId: userId,
          actorName: 'User',
          action: 'LOGIN',
          resourceType: 'auth',
          ipAddress,
          userAgent
        });
      }
    } catch (error) {
      console.error('Failed to save login audit log:', error);
    }
  }

  async logLogout(userId: number, firmId: number | null, ipAddress?: string, userAgent?: string) {
    const entry: AuditLogEntry = {
      userId,
      firmId,
      action: 'LOGOUT',
      details: { timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    };
    
    this.logs.push(entry);
    
    try {
      // Only create audit log if firmId exists (skip for admin users with no firm)
      if (firmId) {
        await storage.createAuditLog({
          firmId,
          userId,
          actorId: userId,
          actorName: 'User',
          action: 'LOGOUT',
          resourceType: 'auth',
          ipAddress,
          userAgent
        });
      }
    } catch (error) {
      console.error('Failed to save logout audit log:', error);
    }
  }

  async logDocumentUpload(userId: number, firmId: number, documentId: number, filename: string) {
    try {
      await storage.createAuditLog({
        firmId,
        userId,
        actorId: userId,
        actorName: 'User',
        action: 'DOC_UPLOAD',
        resourceType: 'document',
        resourceId: documentId.toString(),
        details: { filename }
      });
    } catch (error) {
      console.error('Failed to save document upload audit log:', error);
    }
  }

  async logGhostModeAccess(adminUserId: number, targetFirmId: number, ipAddress?: string) {
    try {
      await storage.createAuditLog({
        firmId: targetFirmId,
        userId: adminUserId,
        actorId: adminUserId,
        actorName: 'Admin',
        action: 'GHOST_MODE_ACCESS',
        resourceType: 'firm',
        resourceId: targetFirmId.toString(),
        ipAddress,
        details: { ghostMode: true }
      });
    } catch (error) {
      console.error('Failed to save ghost mode audit log:', error);
    }
  }

  async logSecurityEvent(userId: number | null, firmId: number | null, eventType: string, details: string, ipAddress?: string, userAgent?: string) {
    const entry: AuditLogEntry = {
      userId: userId || 0,
      firmId,
      action: `SECURITY_${eventType}`,
      details: { eventType, description: details, timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    };
    
    this.logs.push(entry);
    
    try {
      await storage.createAuditLog({
        firmId: firmId || 0,
        userId: userId || 0,
        actorId: userId || 0,
        actorName: userId ? 'User' : 'Anonymous',
        action: `SECURITY_${eventType}`,
        resourceType: 'security',
        ipAddress,
        userAgent,
        details: { eventType, description: details }
      });
    } catch (error) {
      console.error('Failed to save security audit log:', error);
    }
  }

  async logUserCreated(userId: number, firmId: number | null, method: string, ipAddress?: string, userAgent?: string) {
    const entry: AuditLogEntry = {
      userId,
      firmId,
      action: 'USER_CREATED',
      details: { method, timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    };
    
    this.logs.push(entry);
    
    try {
      await storage.createAuditLog({
        firmId: firmId || 0,
        userId: userId,
        actorId: userId,
        actorName: 'System',
        action: 'USER_CREATED',
        resourceType: 'user',
        resourceId: userId.toString(),
        ipAddress,
        userAgent,
        details: { method }
      });
    } catch (error) {
      console.error('Failed to save user creation audit log:', error);
    }
  }

  async logError(context: string, details: any) {
    // TODO: Persist error log to DB or external service
    console.error(`[AUDIT][${context}]`, details);
  }

  getLogs(userId?: number, firmId?: number, limit: number = 10) {
    let filteredLogs = this.logs;
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (firmId) {
      filteredLogs = filteredLogs.filter(log => log.firmId === firmId);
    }
    
    return filteredLogs.slice(-limit);
  }
}

export const auditLogger = new AuditLogger();
