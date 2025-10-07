/**
 * Branded type helper for creating nominal types
 */
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

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
export function createUserId(id: string): UserId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user ID');
  }
  return id as UserId;
}

export function createConversationId(id: string): ConversationId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid conversation ID');
  }
  return id as ConversationId;
}

export function createMessageId(id: string): MessageId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid message ID');
  }
  return id as MessageId;
}
