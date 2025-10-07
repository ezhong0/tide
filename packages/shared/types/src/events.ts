import type { UserId, ConversationId, MessageId, EmailId } from './branded';

/**
 * Base event structure
 */
export interface BaseEvent<T extends string = string, P = any> {
  id: string;
  type: T;
  version: number;
  timestamp: string;
  userId?: UserId;
  correlationId?: string;
  payload: P;
  metadata?: Record<string, any>;
}

/**
 * User events
 */
export enum UserEventType {
  USER_REGISTERED = 'user.registered',
  USER_AUTHENTICATED = 'user.authenticated',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_PASSWORD_CHANGED = 'user.password.changed',
  USER_EMAIL_VERIFIED = 'user.email.verified',
}

export type UserRegisteredEvent = BaseEvent<
  UserEventType.USER_REGISTERED,
  {
    userId: UserId;
    email: string;
    name: string;
    registeredAt: string;
  }
>;

export type UserAuthenticatedEvent = BaseEvent<
  UserEventType.USER_AUTHENTICATED,
  {
    userId: UserId;
    email: string;
    ip: string;
    userAgent: string;
    authenticatedAt: string;
  }
>;

/**
 * Message events
 */
export enum MessageEventType {
  MESSAGE_RECEIVED = 'message.received',
  MESSAGE_PROCESSED = 'message.processed',
  MESSAGE_INTENT_DETECTED = 'message.intent.detected',
  MESSAGE_RESPONSE_GENERATED = 'message.response.generated',
}

export type MessageReceivedEvent = BaseEvent<
  MessageEventType.MESSAGE_RECEIVED,
  {
    messageId: MessageId;
    conversationId: ConversationId;
    userId: UserId;
    content: string;
    receivedAt: string;
  }
>;

/**
 * Email events
 */
export enum EmailEventType {
  EMAIL_RECEIVED = 'email.received',
  EMAIL_SENT = 'email.sent',
  EMAIL_TRIAGED = 'email.triaged',
}

export type EmailTriagedEvent = BaseEvent<
  EmailEventType.EMAIL_TRIAGED,
  {
    emailId: EmailId;
    userId: UserId;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    category: string;
  }
>;

/**
 * Event handler type
 */
export type EventHandler<T extends BaseEvent = BaseEvent> = (
  event: T
) => Promise<void> | void;

/**
 * Event publisher interface
 */
export interface EventPublisher {
  publish<T extends BaseEvent>(event: T): Promise<void>;
  publishBatch<T extends BaseEvent>(events: T[]): Promise<void>;
}
