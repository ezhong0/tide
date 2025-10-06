/**
 * Base types with branded types for compile-time type safety.
 * These types ensure that values are not accidentally mixed up.
 */
export type UUID = string & {
    readonly __brand: unique symbol;
};
export type Timestamp = number & {
    readonly __brand: unique symbol;
};
export type Email = string & {
    readonly __brand: unique symbol;
};
export type PhoneNumber = string & {
    readonly __brand: unique symbol;
};
export type ThreadId = string & {
    readonly __brand: unique symbol;
};
export type EmailId = string & {
    readonly __brand: unique symbol;
};
export type EventId = string & {
    readonly __brand: unique symbol;
};
export type UserId = string & {
    readonly __brand: unique symbol;
};
export type AgentId = string & {
    readonly __brand: unique symbol;
};
export type SessionId = string & {
    readonly __brand: unique symbol;
};
export declare const UUID: (id: string) => UUID;
export declare const Timestamp: (ts: number) => Timestamp;
export declare const Email: (email: string) => Email;
export declare const PhoneNumber: (phone: string) => PhoneNumber;
export declare const ThreadId: (id: string) => ThreadId;
export declare const EmailId: (id: string) => EmailId;
export declare const EventId: (id: string) => EventId;
export declare const UserId: (id: string) => UserId;
export declare const AgentId: (id: string) => AgentId;
export declare const SessionId: (id: string) => SessionId;
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export declare const Ok: <T>(data: T) => Result<T>;
export declare const Err: <E = Error>(error: E) => Result<never, E>;
export declare const ok: <T>(data: T) => Result<T>;
export declare const err: <E = Error>(error: E) => Result<never, E>;
export declare const isOk: <T, E>(result: Result<T, E>) => result is {
    success: true;
    data: T;
};
export declare const isErr: <T, E>(result: Result<T, E>) => result is {
    success: false;
    error: E;
};
export declare const unwrap: <T, E>(result: Result<T, E>) => T;
export declare const unwrapErr: <T, E>(result: Result<T, E>) => E;
export declare const map: <T, E, U>(result: Result<T, E>, fn: (value: T) => U) => Result<U, E>;
export declare const mapErr: <T, E, F>(result: Result<T, E>, fn: (error: E) => F) => Result<T, F>;
export declare const flatMap: <T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>) => Result<U, E>;
export declare const match: <T, E, U>(result: Result<T, E>, handlers: {
    ok: (value: T) => U;
    err: (error: E) => U;
}) => U;
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
export interface Command {
    commandId: UUID;
    commandType: string;
    userId: UserId;
    timestamp: Timestamp;
    data: unknown;
}
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
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
}
export interface TimeSlot {
    start: Timestamp;
    end: Timestamp;
    available: boolean;
}
export interface TimeRange {
    start: Timestamp;
    end: Timestamp;
}
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
export declare const isUUID: (value: unknown) => value is UUID;
export declare const isEmail: (value: unknown) => value is Email;
export declare const isTimestamp: (value: unknown) => value is Timestamp;
export declare const isResult: <T>(value: unknown) => value is Result<T>;
export interface PerformanceMetric {
    operation: string;
    duration: number;
    timestamp: Timestamp;
    success: boolean;
    metadata?: Record<string, unknown>;
}
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
export type Json = string | number | boolean | null | {
    [key: string]: Json;
} | Json[];
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
//# sourceMappingURL=base.types.d.ts.map