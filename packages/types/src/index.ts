/**
 * @tide/types - Core type definitions for the Tide AI Executive Assistant
 *
 * This package provides all base types, branded types, and utility types
 * used throughout the system. All types follow strict TypeScript rules
 * with no 'any' types allowed.
 */

// Export base types (both types and constructor functions)
export {
  // Branded types (exports both type and constructor function)
  UUID,
  EmailId,
  ThreadId,
  UserId,
  SessionId,
  AgentId,
  EventId,
  Timestamp,
  PhoneNumber,
  Email,

  // Result types
  type Result,
  Ok,
  Err,
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapErr,
  map,
  mapErr,
  flatMap,
  match,

  // Domain primitives
  type Command,
  type Query,
  type DomainEvent,
  type EventMetadata,
  type DomainError,
  type ValidationError,

  // Common structures
  type AgentContext,
  type PaginatedResponse,
  type Pagination,
  type TimeSlot,
  type SyncableEntity,
  type SyncConflict,
  type PerformanceMetric,
  type CacheEntry,
  type CacheStats,

  // Utility types
  type Json,
  type DeepReadonly,
  type Optional,
  type Nullable
} from './base.types';

// Export domain types
export * from './domain/index';

// Export event types
export * from './events/index';

// Export agent types
export * from './agents/index';