/**
 * Calendar domain events for event sourcing
 */

import {
  DomainEvent, UUID, Timestamp, EventId, UserId, Email, TimeSlot
} from '../base.types';
import {
  CalendarProvider, EventType, EventStatus, ResponseStatus,
  Participant, EventLocation, Reminder, ConferenceData,
  RecurrenceRule
} from '../domain/calendar.types';

// Base calendar event
export abstract class CalendarDomainEvent implements DomainEvent {
  abstract readonly eventType: string;
  readonly eventVersion = 1;
  readonly eventId: UUID;
  readonly timestamp: Timestamp;
  readonly metadata: DomainEvent['metadata'];

  constructor(
    public readonly aggregateId: UUID,
    public readonly userId: UserId,
    public readonly data: unknown,
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    this.eventId = UUID(crypto.randomUUID());
    this.timestamp = Timestamp(Date.now());
    this.metadata = {
      correlationId: metadata?.correlationId || UUID(crypto.randomUUID()),
      causationId: metadata?.causationId || UUID(crypto.randomUUID()),
      userId: this.userId,
      source: metadata?.source || 'calendar-service',
      ...metadata
    };
  }
}

// Event creation events
export class CalendarEventCreated extends CalendarDomainEvent {
  readonly eventType = 'CalendarEventCreated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      title: string;
      startTime: Timestamp;
      endTime: Timestamp;
      timezone: string;
      type: EventType;
      location?: EventLocation;
      description?: string;
      provider: CalendarProvider;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CalendarEventUpdated extends CalendarDomainEvent {
  readonly eventType = 'CalendarEventUpdated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      changes: Partial<{
        title: string;
        startTime: Timestamp;
        endTime: Timestamp;
        location: EventLocation;
        description: string;
        status: EventStatus;
      }>;
      version: number;
      updatedBy: UserId;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CalendarEventCancelled extends CalendarDomainEvent {
  readonly eventType = 'CalendarEventCancelled';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      reason?: string;
      notifyAttendees: boolean;
      cancelledAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CalendarEventDeleted extends CalendarDomainEvent {
  readonly eventType = 'CalendarEventDeleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      permanent: boolean;
      deletedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Participant events
export class ParticipantAdded extends CalendarDomainEvent {
  readonly eventType = 'ParticipantAdded';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      participant: Participant;
      addedBy: UserId;
      notificationSent: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ParticipantRemoved extends CalendarDomainEvent {
  readonly eventType = 'ParticipantRemoved';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      participantEmail: Email;
      removedBy: UserId;
      reason?: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ParticipantResponseChanged extends CalendarDomainEvent {
  readonly eventType = 'ParticipantResponseChanged';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      participantEmail: Email;
      previousStatus: ResponseStatus;
      newStatus: ResponseStatus;
      comment?: string;
      respondedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Meeting/Conference events
export class ConferenceAdded extends CalendarDomainEvent {
  readonly eventType = 'ConferenceAdded';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      conferenceData: ConferenceData;
      addedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ConferenceRemoved extends CalendarDomainEvent {
  readonly eventType = 'ConferenceRemoved';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      removedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Reminder events
export class ReminderAdded extends CalendarDomainEvent {
  readonly eventType = 'ReminderAdded';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      reminder: Reminder;
      addedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ReminderTriggered extends CalendarDomainEvent {
  readonly eventType = 'ReminderTriggered';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      reminder: Reminder;
      triggeredAt: Timestamp;
      delivered: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Recurrence events
export class RecurrenceRuleSet extends CalendarDomainEvent {
  readonly eventType = 'RecurrenceRuleSet';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      recurrence: RecurrenceRule;
      instancesGenerated: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class RecurrenceInstanceModified extends CalendarDomainEvent {
  readonly eventType = 'RecurrenceInstanceModified';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      parentEventId: EventId;
      instanceEventId: EventId;
      instanceDate: Timestamp;
      modifications: Record<string, unknown>;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class RecurrenceInstanceSkipped extends CalendarDomainEvent {
  readonly eventType = 'RecurrenceInstanceSkipped';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      parentEventId: EventId;
      skippedDate: Timestamp;
      reason?: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Availability events
export class AvailabilityChecked extends CalendarDomainEvent {
  readonly eventType = 'AvailabilityChecked';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      checkId: UUID;
      timeRange: {
        start: Timestamp;
        end: Timestamp;
      };
      duration: number;
      slotsFound: number;
      checkedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class MeetingTimesFound extends CalendarDomainEvent {
  readonly eventType = 'MeetingTimesFound';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      searchId: UUID;
      requiredAttendees: Email[];
      optionalAttendees?: Email[];
      duration: number;
      optionsFound: TimeSlot[];
      searchedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Time blocking events
export class FocusTimeBlocked extends CalendarDomainEvent {
  readonly eventType = 'FocusTimeBlocked';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      startTime: Timestamp;
      endTime: Timestamp;
      purpose: string;
      autoDeclineEnabled: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class OutOfOfficeSet extends CalendarDomainEvent {
  readonly eventType = 'OutOfOfficeSet';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      eventId: EventId;
      startDate: Timestamp;
      endDate: Timestamp;
      message?: string;
      autoReplyEnabled: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Calendar health events
export class CalendarHealthAnalyzed extends CalendarDomainEvent {
  readonly eventType = 'CalendarHealthAnalyzed';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      analysisId: UUID;
      period: {
        start: Timestamp;
        end: Timestamp;
      };
      overallScore: number;
      meetingLoad: 'light' | 'moderate' | 'heavy' | 'overloaded';
      recommendations: string[];
      analyzedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Sync events
export class CalendarSyncStarted extends CalendarDomainEvent {
  readonly eventType = 'CalendarSyncStarted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      provider: CalendarProvider;
      syncType: 'full' | 'incremental';
      startedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CalendarSyncCompleted extends CalendarDomainEvent {
  readonly eventType = 'CalendarSyncCompleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      provider: CalendarProvider;
      eventsSynced: number;
      eventsAdded: number;
      eventsUpdated: number;
      eventsDeleted: number;
      completedAt: Timestamp;
      duration: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CalendarSyncFailed extends CalendarDomainEvent {
  readonly eventType = 'CalendarSyncFailed';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      provider: CalendarProvider;
      error: string;
      failedAt: Timestamp;
      retryScheduled: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Conflict detection events
export class ConflictDetected extends CalendarDomainEvent {
  readonly eventType = 'ConflictDetected';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      newEventId: EventId;
      conflictingEventIds: EventId[];
      conflictType: 'time' | 'location' | 'resource';
      resolution?: 'declined' | 'rescheduled' | 'accepted-anyway';
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}