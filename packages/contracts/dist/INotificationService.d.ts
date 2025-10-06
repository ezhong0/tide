/**
 * Notification Service Contract
 * Push notifications, in-app notifications, and alerts
 *
 * Performance Requirements:
 * - Send notification: <100ms
 * - Batch send: <500ms for 100 notifications
 * - Query notifications: <50ms
 */
import { Result, UserId, Timestamp } from '@tide/types';
export interface INotificationService {
    /**
     * Send a notification to user
     * @param userId User to notify
     * @param notification Notification details
     * @returns Notification ID
     * @performance <100ms
     */
    send(userId: UserId, notification: NotificationPayload): Promise<Result<string>>;
    /**
     * Send notification to multiple users
     * @param userIds Array of user IDs
     * @param notification Notification details
     * @returns Array of notification IDs
     * @performance <500ms for 100 users
     */
    sendBatch(userIds: UserId[], notification: NotificationPayload): Promise<Result<string[]>>;
    /**
     * Schedule a notification for later
     * @param userId User to notify
     * @param notification Notification details
     * @param scheduledFor When to send
     * @returns Scheduled notification ID
     * @performance <50ms
     */
    schedule(userId: UserId, notification: NotificationPayload, scheduledFor: Timestamp): Promise<Result<string>>;
    /**
     * Cancel a scheduled notification
     * @param notificationId Notification to cancel
     * @returns Success status
     * @performance <30ms
     */
    cancelScheduled(notificationId: string): Promise<Result<void>>;
    /**
     * Get notifications for user
     * @param userId User identifier
     * @param filter Optional filter
     * @returns Array of notifications
     * @performance <50ms for 100 notifications
     */
    getNotifications(userId: UserId, filter?: NotificationFilter): Promise<Result<Notification[]>>;
    /**
     * Get single notification
     * @param notificationId Notification identifier
     * @returns Notification details
     * @performance <30ms
     */
    getNotification(notificationId: string): Promise<Result<Notification | null>>;
    /**
     * Mark notification as read
     * @param notificationId Notification to mark
     * @returns Success status
     * @performance <30ms
     */
    markAsRead(notificationId: string): Promise<Result<void>>;
    /**
     * Mark multiple notifications as read
     * @param notificationIds Array of notification IDs
     * @returns Number marked
     * @performance <50ms for 100 notifications
     */
    markManyAsRead(notificationIds: string[]): Promise<Result<number>>;
    /**
     * Mark all notifications as read
     * @param userId User identifier
     * @returns Number marked
     * @performance <100ms
     */
    markAllAsRead(userId: UserId): Promise<Result<number>>;
    /**
     * Delete a notification
     * @param notificationId Notification to delete
     * @returns Success status
     * @performance <30ms
     */
    deleteNotification(notificationId: string): Promise<Result<void>>;
    /**
     * Delete multiple notifications
     * @param notificationIds Array of notification IDs
     * @returns Number deleted
     * @performance <50ms for 100 notifications
     */
    deleteManyNotifications(notificationIds: string[]): Promise<Result<number>>;
    /**
     * Clear all notifications
     * @param userId User identifier
     * @returns Number cleared
     * @performance <100ms
     */
    clearAll(userId: UserId): Promise<Result<number>>;
    /**
     * Get unread count
     * @param userId User identifier
     * @returns Unread count
     * @performance <20ms
     */
    getUnreadCount(userId: UserId): Promise<Result<number>>;
    /**
     * Subscribe to real-time notifications
     * @param userId User identifier
     * @param handler Notification handler
     * @returns Subscription handle
     * @performance Real-time
     */
    subscribe(userId: UserId, handler: NotificationHandler): Result<NotificationSubscription>;
    /**
     * Update notification preferences
     * @param userId User identifier
     * @param preferences Updated preferences
     * @returns Success status
     * @performance <50ms
     */
    updatePreferences(userId: UserId, preferences: Partial<NotificationPreferences>): Promise<Result<void>>;
    /**
     * Get notification preferences
     * @param userId User identifier
     * @returns User preferences
     * @performance <30ms
     */
    getPreferences(userId: UserId): Promise<Result<NotificationPreferences>>;
    /**
     * Register device for push notifications
     * @param userId User identifier
     * @param device Device details
     * @returns Registration ID
     * @performance <100ms
     */
    registerDevice(userId: UserId, device: DeviceRegistration): Promise<Result<string>>;
    /**
     * Unregister device
     * @param userId User identifier
     * @param deviceId Device to unregister
     * @returns Success status
     * @performance <50ms
     */
    unregisterDevice(userId: UserId, deviceId: string): Promise<Result<void>>;
    /**
     * List registered devices
     * @param userId User identifier
     * @returns Array of devices
     * @performance <50ms
     */
    listDevices(userId: UserId): Promise<Result<RegisteredDevice[]>>;
    /**
     * Send test notification
     * @param userId User identifier
     * @param deviceId Optional device ID
     * @returns Success status
     * @performance <100ms
     */
    sendTest(userId: UserId, deviceId?: string): Promise<Result<void>>;
    /**
     * Get notification statistics
     * @param userId User identifier
     * @param period Time period
     * @returns Statistics
     * @performance <100ms
     */
    getStatistics(userId: UserId, period: TimePeriod): Promise<Result<NotificationStats>>;
    /**
     * Create notification template
     * @param template Template details
     * @returns Template ID
     * @performance <50ms
     */
    createTemplate(template: NotificationTemplate): Promise<Result<string>>;
    /**
     * Send templated notification
     * @param userId User identifier
     * @param templateId Template to use
     * @param variables Template variables
     * @returns Notification ID
     * @performance <100ms
     */
    sendFromTemplate(userId: UserId, templateId: string, variables: Record<string, unknown>): Promise<Result<string>>;
    /**
     * Snooze a notification
     * @param notificationId Notification to snooze
     * @param until When to show again
     * @returns Success status
     * @performance <30ms
     */
    snooze(notificationId: string, until: Timestamp): Promise<Result<void>>;
    /**
     * Archive notifications
     * @param notificationIds Notifications to archive
     * @returns Number archived
     * @performance <50ms for 100 notifications
     */
    archive(notificationIds: string[]): Promise<Result<number>>;
}
export interface NotificationPayload {
    title: string;
    body: string;
    type: NotificationType;
    priority: NotificationPriority;
    category?: NotificationCategory;
    icon?: string;
    image?: string;
    action?: NotificationAction;
    data?: Record<string, unknown>;
    sound?: string;
    badge?: number;
    persistent?: boolean;
    groupId?: string;
}
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'alert';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'email' | 'calendar' | 'task' | 'system' | 'security' | 'social';
export interface NotificationAction {
    type: 'open-url' | 'deep-link' | 'callback';
    label: string;
    url?: string;
    callback?: string;
    data?: Record<string, unknown>;
}
export interface Notification extends NotificationPayload {
    id: string;
    userId: UserId;
    createdAt: Timestamp;
    readAt?: Timestamp;
    snoozedUntil?: Timestamp;
    archivedAt?: Timestamp;
    status: NotificationStatus;
    deliveredAt?: Timestamp;
    clickedAt?: Timestamp;
}
export type NotificationStatus = 'pending' | 'delivered' | 'read' | 'snoozed' | 'archived' | 'failed';
export interface NotificationFilter {
    status?: NotificationStatus[];
    type?: NotificationType[];
    category?: NotificationCategory[];
    unreadOnly?: boolean;
    fromDate?: Timestamp;
    toDate?: Timestamp;
    limit?: number;
    offset?: number;
}
export type NotificationHandler = (notification: Notification) => void;
export interface NotificationSubscription {
    id: string;
    unsubscribe: () => void;
    pause: () => void;
    resume: () => void;
}
export interface NotificationPreferences {
    enabled: boolean;
    channels: NotificationChannel[];
    quiet: {
        enabled: boolean;
        start: string;
        end: string;
    };
    categories: Record<NotificationCategory, CategoryPreference>;
    sounds: boolean;
    vibration: boolean;
    badges: boolean;
}
export interface NotificationChannel {
    type: 'push' | 'in-app' | 'email' | 'sms';
    enabled: boolean;
    priority?: NotificationPriority[];
}
export interface CategoryPreference {
    enabled: boolean;
    channel: NotificationChannel['type'][];
    priority: NotificationPriority;
}
export interface DeviceRegistration {
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    token: string;
    appVersion?: string;
    osVersion?: string;
}
export interface RegisteredDevice {
    id: string;
    deviceId: string;
    platform: DeviceRegistration['platform'];
    registeredAt: Timestamp;
    lastUsed?: Timestamp;
    active: boolean;
}
export interface TimePeriod {
    start: Timestamp;
    end: Timestamp;
}
export interface NotificationStats {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
    byType: Record<NotificationType, number>;
    byCategory: Record<NotificationCategory, number>;
    averageReadTime: number;
    peakHours: number[];
}
export interface NotificationTemplate {
    id?: string;
    name: string;
    title: string;
    body: string;
    type: NotificationType;
    category: NotificationCategory;
    variables: string[];
}
//# sourceMappingURL=INotificationService.d.ts.map