/**
 * Branded types for type safety
 *
 * Branded types prevent accidental mixing of similar primitive types
 * (e.g., passing a CommandId where a UserId is expected)
 */

// Branded type helper
declare const brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

// User-related branded types
export type UserId = Brand<string, 'UserId'>;
export type UserPreferencesId = Brand<string, 'UserPreferencesId'>;

// Command-related branded types
export type CommandId = Brand<string, 'CommandId'>;

// Email-related branded types
export type EmailId = Brand<string, 'EmailId'>;
export type ThreadId = Brand<string, 'ThreadId'>;

// Calendar-related branded types
export type CalendarEventId = Brand<string, 'CalendarEventId'>;

// Draft-related branded types
export type DraftId = Brand<string, 'DraftId'>;

// Follow-up-related branded types
export type FollowUpId = Brand<string, 'FollowUpId'>;

// Contact-related branded types
export type ContactPreferencesId = Brand<string, 'ContactPreferencesId'>;

// Feedback-related branded types
export type FeedbackId = Brand<string, 'FeedbackId'>;

// Audit log-related branded types
export type AuditLogId = Brand<string, 'AuditLogId'>;

// Helper functions to create branded types safely
export const createUserId = (id: string): UserId => id as UserId;
export const createCommandId = (id: string): CommandId => id as CommandId;
export const createEmailId = (id: string): EmailId => id as EmailId;
export const createThreadId = (id: string): ThreadId => id as ThreadId;
export const createCalendarEventId = (id: string): CalendarEventId => id as CalendarEventId;
export const createDraftId = (id: string): DraftId => id as DraftId;
export const createFollowUpId = (id: string): FollowUpId => id as FollowUpId;
export const createContactPreferencesId = (id: string): ContactPreferencesId =>
  id as ContactPreferencesId;
export const createFeedbackId = (id: string): FeedbackId => id as FeedbackId;
export const createAuditLogId = (id: string): AuditLogId => id as AuditLogId;
