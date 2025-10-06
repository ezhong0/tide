/**
 * Event Store Contract
 * Event sourcing infrastructure for complete audit trail
 *
 * Performance Requirements:
 * - Append event: <50ms
 * - Read events: <100ms for 100 events
 * - Replay aggregate: <200ms
 */

import { Result, UUID, UserId, Timestamp, DomainEvent } from '@tide/types';

export interface IEventStore {
  /**
   * Append an event to the store
   * @param event Domain event to append
   * @returns Event position in stream
   * @performance <50ms including persistence
   */
  append(event: DomainEvent): Promise<Result<EventPosition>>;

  /**
   * Append multiple events atomically
   * @param events Array of domain events
   * @returns Array of event positions
   * @performance <100ms for 10 events
   */
  appendBatch(events: DomainEvent[]): Promise<Result<EventPosition[]>>;

  /**
   * Read events for an aggregate
   * @param aggregateId Aggregate identifier
   * @param fromVersion Starting version (inclusive)
   * @param toVersion Ending version (inclusive, optional)
   * @returns Array of events
   * @performance <100ms for 100 events
   */
  getEvents(
    aggregateId: UUID,
    fromVersion?: number,
    toVersion?: number
  ): Promise<Result<DomainEvent[]>>;

  /**
   * Read events by stream
   * @param streamName Name of event stream
   * @param fromPosition Starting position
   * @param count Number of events to read
   * @returns Array of events with positions
   * @performance <100ms for 100 events
   */
  readStream(
    streamName: string,
    fromPosition?: number,
    count?: number
  ): Promise<Result<EventWithPosition[]>>;

  /**
   * Read all events (for projections)
   * @param fromPosition Global position to start from
   * @param count Number of events to read
   * @returns Array of all events
   * @performance <200ms for 1000 events
   */
  readAll(
    fromPosition?: number,
    count?: number
  ): Promise<Result<EventWithPosition[]>>;

  /**
   * Get events by event type
   * @param eventType Type of events to retrieve
   * @param fromTimestamp Start timestamp
   * @param toTimestamp End timestamp
   * @returns Array of matching events
   * @performance <100ms with index
   */
  getEventsByType(
    eventType: string,
    fromTimestamp?: Timestamp,
    toTimestamp?: Timestamp
  ): Promise<Result<DomainEvent[]>>;

  /**
   * Get events by user
   * @param userId User identifier
   * @param fromTimestamp Start timestamp
   * @param toTimestamp End timestamp
   * @returns Array of user's events
   * @performance <100ms with index
   */
  getEventsByUser(
    userId: UserId,
    fromTimestamp?: Timestamp,
    toTimestamp?: Timestamp
  ): Promise<Result<DomainEvent[]>>;

  /**
   * Subscribe to event stream
   * @param streamName Stream to subscribe to
   * @param handler Function to handle events
   * @returns Subscription handle
   * @performance Real-time, <10ms overhead
   */
  subscribe(
    streamName: string,
    handler: EventHandler
  ): Promise<Result<Subscription>>;

  /**
   * Subscribe to all events
   * @param handler Function to handle events
   * @returns Subscription handle
   * @performance Real-time, <10ms overhead
   */
  subscribeToAll(handler: EventHandler): Promise<Result<Subscription>>;

  /**
   * Create a snapshot of aggregate state
   * @param aggregateId Aggregate to snapshot
   * @param version Version to snapshot at
   * @param state Aggregate state
   * @returns Success status
   * @performance <100ms
   */
  createSnapshot(
    aggregateId: UUID,
    version: number,
    state: unknown
  ): Promise<Result<void>>;

  /**
   * Get latest snapshot for aggregate
   * @param aggregateId Aggregate identifier
   * @returns Snapshot if exists
   * @performance <50ms
   */
  getSnapshot(aggregateId: UUID): Promise<Result<Snapshot | null>>;

  /**
   * Replay events to rebuild state
   * @param aggregateId Aggregate to replay
   * @param handler Function to apply events
   * @param fromVersion Starting version
   * @returns Final aggregate state
   * @performance <200ms for typical aggregate
   */
  replay<T>(
    aggregateId: UUID,
    handler: ReplayHandler<T>,
    fromVersion?: number
  ): Promise<Result<T>>;

  /**
   * Get current version of aggregate
   * @param aggregateId Aggregate identifier
   * @returns Current version number
   * @performance <30ms
   */
  getVersion(aggregateId: UUID): Promise<Result<number>>;

  /**
   * Check if aggregate exists
   * @param aggregateId Aggregate identifier
   * @returns Existence status
   * @performance <30ms
   */
  exists(aggregateId: UUID): Promise<Result<boolean>>;

  /**
   * Get metadata for events
   * @param eventIds Array of event IDs
   * @returns Array of event metadata
   * @performance <50ms
   */
  getMetadata(eventIds: UUID[]): Promise<Result<EventMetadata[]>>;

  /**
   * Archive old events
   * @param beforeTimestamp Archive events before this time
   * @returns Number of events archived
   * @performance Async operation
   */
  archiveEvents(beforeTimestamp: Timestamp): Promise<Result<number>>;

  /**
   * Get event statistics
   * @param fromTimestamp Start of period
   * @param toTimestamp End of period
   * @returns Event statistics
   * @performance <200ms
   */
  getStatistics(
    fromTimestamp?: Timestamp,
    toTimestamp?: Timestamp
  ): Promise<Result<EventStatistics>>;

  /**
   * Begin a transaction
   * @returns Transaction handle
   * @performance <10ms
   */
  beginTransaction(): Promise<Result<Transaction>>;

  /**
   * Commit a transaction
   * @param transaction Transaction to commit
   * @returns Success status
   * @performance <50ms
   */
  commitTransaction(transaction: Transaction): Promise<Result<void>>;

  /**
   * Rollback a transaction
   * @param transaction Transaction to rollback
   * @returns Success status
   * @performance <30ms
   */
  rollbackTransaction(transaction: Transaction): Promise<Result<void>>;

  /**
   * Optimize event store performance
   * @returns Optimization result
   * @performance Async operation
   */
  optimize(): Promise<Result<OptimizationResult>>;
}

// Supporting types
export interface EventPosition {
  stream: string;
  position: number;
  globalPosition: number;
}

export interface EventWithPosition {
  event: DomainEvent;
  position: EventPosition;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

export interface Subscription {
  id: string;
  unsubscribe: () => Promise<void>;
  pause: () => void;
  resume: () => void;
}

export interface Snapshot {
  aggregateId: UUID;
  version: number;
  state: unknown;
  createdAt: Timestamp;
}

export type ReplayHandler<T> = (state: T, event: DomainEvent) => T;

export interface EventMetadata {
  eventId: UUID;
  stream: string;
  position: number;
  timestamp: Timestamp;
  userId: UserId;
  correlationId: UUID;
}

export interface EventStatistics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByUser: Record<string, number>;
  eventsPerDay: number[];
  averageEventSize: number;
  storageUsed: number;
}

export interface Transaction {
  id: string;
  startedAt: Timestamp;
  events: DomainEvent[];
}

export interface OptimizationResult {
  eventsCompacted: number;
  storageReclaimed: number;
  indicesRebuilt: number;
  duration: number;
}