import { storage } from '../storage.js';
import type { InsertAuditLog } from '@shared/schema';

export class AuditService {
  static async logAction(params: {
    firmId: number;
    actorId: number;
    actorName: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditLog: InsertAuditLog = {
        firmId: params.firmId,
        actorId: params.actorId,
        actorName: params.actorName,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      };

      await storage.createAuditLog(auditLog);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging shouldn't break the main operation
    }
  }

  static async getFirmAuditLogs(firmId: number, limit?: number) {
    return await storage.getFirmAuditLogs(firmId, limit);
  }

  static async getAuditLogsByAction(firmId: number, action: string) {
    return await storage.getAuditLogsByAction(firmId, action);
  }

  static async getAuditLogsByDateRange(firmId: number, startDate: Date, endDate: Date) {
    return await storage.getAuditLogsByDateRange(firmId, startDate, endDate);
  }
}

// Audit action constants
export const AUDIT_ACTIONS = {
  DOC_UPLOAD: 'DOC_UPLOAD',
  DOC_REVIEW_COMPLETED: 'DOC_REVIEW_COMPLETED',
  REVIEWER_ASSIGNED: 'REVIEWER_ASSIGNED',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  MESSAGE_SENT: 'MESSAGE_SENT',
  FIRM_SETTINGS_UPDATE: 'FIRM_SETTINGS_UPDATE',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  FOLDER_CREATED: 'FOLDER_CREATED',
  FOLDER_DELETED: 'FOLDER_DELETED',
  ANALYSIS_SETTINGS_UPDATED: 'ANALYSIS_SETTINGS_UPDATED',
} as const;