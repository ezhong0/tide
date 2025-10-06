/**
 * Branded types for type safety
 *
 * Branded types prevent accidental mixing of similar primitive types
 * (e.g., passing a CommandId where a UserId is expected)
 */
declare const brand: unique symbol;
type Brand<T, TBrand extends string> = T & {
    readonly [brand]: TBrand;
};
export type UserId = Brand<string, 'UserId'>;
export type UserPreferencesId = Brand<string, 'UserPreferencesId'>;
export type CommandId = Brand<string, 'CommandId'>;
export type EmailId = Brand<string, 'EmailId'>;
export type ThreadId = Brand<string, 'ThreadId'>;
export type CalendarEventId = Brand<string, 'CalendarEventId'>;
export type DraftId = Brand<string, 'DraftId'>;
export type FollowUpId = Brand<string, 'FollowUpId'>;
export type ContactPreferencesId = Brand<string, 'ContactPreferencesId'>;
export type FeedbackId = Brand<string, 'FeedbackId'>;
export type AuditLogId = Brand<string, 'AuditLogId'>;
export declare const createUserId: (id: string) => UserId;
export declare const createCommandId: (id: string) => CommandId;
export declare const createEmailId: (id: string) => EmailId;
export declare const createThreadId: (id: string) => ThreadId;
export declare const createCalendarEventId: (id: string) => CalendarEventId;
export declare const createDraftId: (id: string) => DraftId;
export declare const createFollowUpId: (id: string) => FollowUpId;
export declare const createContactPreferencesId: (id: string) => ContactPreferencesId;
export declare const createFeedbackId: (id: string) => FeedbackId;
export declare const createAuditLogId: (id: string) => AuditLogId;
export {};
//# sourceMappingURL=branded.types.d.ts.map