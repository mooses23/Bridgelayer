import { storage } from '../storage.js';
import type { InsertNotification } from '@shared/schema';

export class NotificationService {
  static async createNotification(params: {
    firmId: number;
    userId: number;
    type: string;
    title: string;
    message: string;
    resourceType?: string;
    resourceId?: string;
    priority?: string;
  }): Promise<void> {
    try {
      const notification: InsertNotification = {
        firmId: params.firmId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        priority: params.priority || 'normal',
        isRead: false,
      };

      await storage.createNotification(notification);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  static async notifyFirmUsers(params: {
    firmId: number;
    userIds: number[];
    type: string;
    title: string;
    message: string;
    resourceType?: string;
    resourceId?: string;
    priority?: string;
  }): Promise<void> {
    const promises = params.userIds.map(userId =>
      this.createNotification({
        firmId: params.firmId,
        userId,
        type: params.type,
        title: params.title,
        message: params.message,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        priority: params.priority,
      })
    );

    await Promise.all(promises);
  }

  static async getUserNotifications(userId: number, firmId: number) {
    return await storage.getUserNotifications(userId, firmId);
  }

  static async markAsRead(notificationId: number, userId: number) {
    return await storage.markNotificationAsRead(notificationId, userId);
  }

  static async getUnreadCount(userId: number, firmId: number) {
    return await storage.getUnreadNotificationCount(userId, firmId);
  }
}

// Notification type constants
export const NOTIFICATION_TYPES = {
  AI_REVIEW_READY: 'ai_review_ready',
  REVIEWER_ASSIGNED: 'reviewer_assigned',
  MESSAGE_RECEIVED: 'message_received',
  HIGH_RISK_DETECTED: 'high_risk_detected',
  DOCUMENT_UPLOADED: 'document_uploaded',
  ANALYSIS_COMPLETED: 'analysis_completed',
  SYSTEM_ALERT: 'system_alert',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;