/**
 * Base types with branded types for compile-time type safety.
 * These types ensure that values are not accidentally mixed up.
 */

// Branded types for domain-specific strings and numbers
export type UUID = string & { readonly __brand: unique symbol };
export type Timestamp = number & { readonly __brand: unique symbol };
export type Email = string & { readonly __brand: unique symbol };
export type PhoneNumber = string & { readonly __brand: unique symbol };
export type ThreadId = string & { readonly __brand: unique symbol };
export type EmailId = string & { readonly __brand: unique symbol };
export type EventId = string & { readonly __brand: unique symbol };
export type UserId = string & { readonly __brand: unique symbol };
export type AgentId = string & { readonly __brand: unique symbol };
export type SessionId = string & { readonly __brand: unique symbol };

// Type guard functions and constructors
export const UUID = (id: string): UUID => {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  return id as UUID;
};

export const Timestamp = (ts: number): Timestamp => {
  if (!Number.isFinite(ts) || ts < 0) {
    throw new Error(`Invalid timestamp: ${ts}`);
  }
  return ts as Timestamp;
};

export const Email = (email: string): Email => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
  return email.toLowerCase() as Email;
};

export const PhoneNumber = (phone: string): PhoneNumber => {
  if (!phone || !/^\+?[\d\s-()]+$/.test(phone)) {
    throw new Error(`Invalid phone number: ${phone}`);
  }
  return phone as PhoneNumber;
};

export const ThreadId = (id: string): ThreadId => id as ThreadId;
export const EmailId = (id: string): EmailId => id as EmailId;
export const EventId = (id: string): EventId => id as EventId;
export const UserId = (id: string): UserId => id as UserId;
export const AgentId = (id: string): AgentId => id as AgentId;
export const SessionId = (id: string): SessionId => id as SessionId;

// Result type for functional error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions for Result type
export const Ok = <T>(data: T): Result<T> => ({ success: true, data });
export const Err = <E = Error>(error: E): Result<never, E> => ({ success: false, error });

// Alias functions to match test expectations
export const ok = Ok;
export const err = Err;
export const isOk = <T, E>(result: Result<T, E>): result is { success: true; data: T } => result.success;
export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E } => !result.success;
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) return result.data;
  throw new Error('Called unwrap on an error result');
};
export const unwrapErr = <T, E>(result: Result<T, E>): E => {
  if (!result.success) return result.error;
  throw new Error('Called unwrapErr on a success result');
};
export const map = <T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
  result.success ? Ok(fn(result.data)) as Result<U, E> : result;
export const mapErr = <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
  !result.success ? Err(fn(result.error)) as Result<T, F> : result as Result<T, F>;
export const flatMap = <T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> =>
  result.success ? fn(result.data) : result as Result<U, E>;
export const match = <T, E, U>(result: Result<T, E>, handlers: {
  ok: (value: T) => U;
  err: (error: E) => U;
}): U => result.success ? handlers.ok(result.data) : handlers.err(result.error);

// Event sourcing base types
export interface DomainEvent {
  aggregateId: UUID;
  eventId: UUID;
  eventType: string;
  eventVersion: number;
  timestamp: Timestamp;
  userId: UserId;
  data: unknown;
  metadata: EventMetadata;
}

export interface EventMetadata {
  correlationId: UUID;
  causationId: UUID;
  userId: UserId;
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

// Command pattern base types
export interface Command {
  commandId: UUID;
  commandType: string;
  userId: UserId;
  timestamp: Timestamp;
  data: unknown;
}

// Query pattern base types
export interface Query {
  queryId: UUID;
  queryType: string;
  userId: UserId;
  parameters: unknown;
  pagination?: Pagination;
}

export interface Pagination {
  offset: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// Time-related types
export interface TimeSlot {
  start: Timestamp;
  end: Timestamp;
  available: boolean;
}

export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

// Common error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DomainError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
}


// Type guards
export const isUUID = (value: unknown): value is UUID => {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
};

export const isEmail = (value: unknown): value is Email => {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isTimestamp = (value: unknown): value is Timestamp => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
};

export const isResult = <T>(value: unknown): value is Result<T> => {
  return typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as Record<string, unknown>).success === 'boolean';
};

// Performance monitoring types
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Timestamp;
  success: boolean;
  metadata?: Record<string, unknown>;
}

// Cache-related types
export interface CacheEntry<T> {
  value: T;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

// Offline support types
export interface SyncableEntity {
  id: UUID;
  version: number;
  lastModified: Timestamp;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict';
}

export interface SyncConflict {
  entityId: UUID;
  localVersion: number;
  remoteVersion: number;
  localData: unknown;
  remoteData: unknown;
}

// Agent-related base types
export interface AgentContext {
  userId: UserId;
  sessionId: SessionId;
  conversationHistory: ConversationTurn[];
  userPreferences: UserPreferences;
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  workingHours: TimeRange;
  responseStyle: 'concise' | 'detailed' | 'balanced';
}

// Utility types
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;