/**
 * @tide/types - Core type definitions for the Tide AI Executive Assistant
 *
 * This package provides all base types, branded types, and utility types
 * used throughout the system. All types follow strict TypeScript rules
 * with no 'any' types allowed.
 */
export { type UUID, type EmailId, type ThreadId, type UserId, type SessionId, type AgentId, type EventId, type Timestamp, type PhoneNumber, type Result, Ok, Err, ok, err, isOk, isErr, unwrap, unwrapErr, map, mapErr, flatMap, match, type Email, type Command, type Query, type DomainEvent, type EventMetadata, type DomainError, type ValidationError, type AgentContext, type PaginatedResponse, type Pagination, type TimeSlot, type SyncableEntity, type SyncConflict, type PerformanceMetric, type CacheEntry, type CacheStats, type Json, type DeepReadonly, type Optional, type Nullable } from './base.types';
export * from './domain/index';
export * from './events/index';
export * from './agents/index';
//# sourceMappingURL=index.d.ts.map