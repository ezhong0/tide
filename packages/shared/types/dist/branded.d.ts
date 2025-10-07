/**
 * Branded type helper for creating nominal types
 */
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & {
    [__brand]: TBrand;
};
/**
 * Branded ID types - prevents mixing different ID types
 */
export type UserId = Brand<string, 'UserId'>;
export type ConversationId = Brand<string, 'ConversationId'>;
export type MessageId = Brand<string, 'MessageId'>;
export type EmailId = Brand<string, 'EmailId'>;
export type CalendarEventId = Brand<string, 'CalendarEventId'>;
export type TaskId = Brand<string, 'TaskId'>;
export type WorkflowId = Brand<string, 'WorkflowId'>;
export type IntegrationId = Brand<string, 'IntegrationId'>;
/**
 * Validate and brand ID
 */
export declare function createUserId(id: string): UserId;
export declare function createConversationId(id: string): ConversationId;
export declare function createMessageId(id: string): MessageId;
export {};
//# sourceMappingURL=branded.d.ts.map