/**
 * Calendar domain events for event sourcing
 */
import { DomainEvent, UUID, Timestamp, EventId, UserId, Email, TimeSlot } from '../base.types';
import { CalendarProvider, EventType, EventStatus, ResponseStatus, Participant, EventLocation, Reminder, ConferenceData, RecurrenceRule } from '../domain/calendar.types';
export declare abstract class CalendarDomainEvent implements DomainEvent {
    readonly aggregateId: UUID;
    readonly userId: UserId;
    readonly data: unknown;
    abstract readonly eventType: string;
    readonly eventVersion = 1;
    readonly eventId: UUID;
    readonly timestamp: Timestamp;
    readonly metadata: DomainEvent['metadata'];
    constructor(aggregateId: UUID, userId: UserId, data: unknown, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarEventCreated extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        title: string;
        startTime: Timestamp;
        endTime: Timestamp;
        timezone: string;
        type: EventType;
        location?: EventLocation;
        description?: string;
        provider: CalendarProvider;
    };
    readonly eventType = "CalendarEventCreated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        title: string;
        startTime: Timestamp;
        endTime: Timestamp;
        timezone: string;
        type: EventType;
        location?: EventLocation;
        description?: string;
        provider: CalendarProvider;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarEventUpdated extends CalendarDomainEvent {
    readonly data: {
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
    };
    readonly eventType = "CalendarEventUpdated";
    constructor(aggregateId: UUID, userId: UserId, data: {
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
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarEventCancelled extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        reason?: string;
        notifyAttendees: boolean;
        cancelledAt: Timestamp;
    };
    readonly eventType = "CalendarEventCancelled";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        reason?: string;
        notifyAttendees: boolean;
        cancelledAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarEventDeleted extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        permanent: boolean;
        deletedAt: Timestamp;
    };
    readonly eventType = "CalendarEventDeleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        permanent: boolean;
        deletedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ParticipantAdded extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        participant: Participant;
        addedBy: UserId;
        notificationSent: boolean;
    };
    readonly eventType = "ParticipantAdded";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        participant: Participant;
        addedBy: UserId;
        notificationSent: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ParticipantRemoved extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        participantEmail: Email;
        removedBy: UserId;
        reason?: string;
    };
    readonly eventType = "ParticipantRemoved";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        participantEmail: Email;
        removedBy: UserId;
        reason?: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ParticipantResponseChanged extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        participantEmail: Email;
        previousStatus: ResponseStatus;
        newStatus: ResponseStatus;
        comment?: string;
        respondedAt: Timestamp;
    };
    readonly eventType = "ParticipantResponseChanged";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        participantEmail: Email;
        previousStatus: ResponseStatus;
        newStatus: ResponseStatus;
        comment?: string;
        respondedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ConferenceAdded extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        conferenceData: ConferenceData;
        addedAt: Timestamp;
    };
    readonly eventType = "ConferenceAdded";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        conferenceData: ConferenceData;
        addedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ConferenceRemoved extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        removedAt: Timestamp;
    };
    readonly eventType = "ConferenceRemoved";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        removedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ReminderAdded extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        reminder: Reminder;
        addedAt: Timestamp;
    };
    readonly eventType = "ReminderAdded";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        reminder: Reminder;
        addedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ReminderTriggered extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        reminder: Reminder;
        triggeredAt: Timestamp;
        delivered: boolean;
    };
    readonly eventType = "ReminderTriggered";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        reminder: Reminder;
        triggeredAt: Timestamp;
        delivered: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class RecurrenceRuleSet extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        recurrence: RecurrenceRule;
        instancesGenerated: number;
    };
    readonly eventType = "RecurrenceRuleSet";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        recurrence: RecurrenceRule;
        instancesGenerated: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class RecurrenceInstanceModified extends CalendarDomainEvent {
    readonly data: {
        parentEventId: EventId;
        instanceEventId: EventId;
        instanceDate: Timestamp;
        modifications: Record<string, unknown>;
    };
    readonly eventType = "RecurrenceInstanceModified";
    constructor(aggregateId: UUID, userId: UserId, data: {
        parentEventId: EventId;
        instanceEventId: EventId;
        instanceDate: Timestamp;
        modifications: Record<string, unknown>;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class RecurrenceInstanceSkipped extends CalendarDomainEvent {
    readonly data: {
        parentEventId: EventId;
        skippedDate: Timestamp;
        reason?: string;
    };
    readonly eventType = "RecurrenceInstanceSkipped";
    constructor(aggregateId: UUID, userId: UserId, data: {
        parentEventId: EventId;
        skippedDate: Timestamp;
        reason?: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AvailabilityChecked extends CalendarDomainEvent {
    readonly data: {
        checkId: UUID;
        timeRange: {
            start: Timestamp;
            end: Timestamp;
        };
        duration: number;
        slotsFound: number;
        checkedAt: Timestamp;
    };
    readonly eventType = "AvailabilityChecked";
    constructor(aggregateId: UUID, userId: UserId, data: {
        checkId: UUID;
        timeRange: {
            start: Timestamp;
            end: Timestamp;
        };
        duration: number;
        slotsFound: number;
        checkedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class MeetingTimesFound extends CalendarDomainEvent {
    readonly data: {
        searchId: UUID;
        requiredAttendees: Email[];
        optionalAttendees?: Email[];
        duration: number;
        optionsFound: TimeSlot[];
        searchedAt: Timestamp;
    };
    readonly eventType = "MeetingTimesFound";
    constructor(aggregateId: UUID, userId: UserId, data: {
        searchId: UUID;
        requiredAttendees: Email[];
        optionalAttendees?: Email[];
        duration: number;
        optionsFound: TimeSlot[];
        searchedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class FocusTimeBlocked extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        startTime: Timestamp;
        endTime: Timestamp;
        purpose: string;
        autoDeclineEnabled: boolean;
    };
    readonly eventType = "FocusTimeBlocked";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        startTime: Timestamp;
        endTime: Timestamp;
        purpose: string;
        autoDeclineEnabled: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class OutOfOfficeSet extends CalendarDomainEvent {
    readonly data: {
        eventId: EventId;
        startDate: Timestamp;
        endDate: Timestamp;
        message?: string;
        autoReplyEnabled: boolean;
    };
    readonly eventType = "OutOfOfficeSet";
    constructor(aggregateId: UUID, userId: UserId, data: {
        eventId: EventId;
        startDate: Timestamp;
        endDate: Timestamp;
        message?: string;
        autoReplyEnabled: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarHealthAnalyzed extends CalendarDomainEvent {
    readonly data: {
        analysisId: UUID;
        period: {
            start: Timestamp;
            end: Timestamp;
        };
        overallScore: number;
        meetingLoad: 'light' | 'moderate' | 'heavy' | 'overloaded';
        recommendations: string[];
        analyzedAt: Timestamp;
    };
    readonly eventType = "CalendarHealthAnalyzed";
    constructor(aggregateId: UUID, userId: UserId, data: {
        analysisId: UUID;
        period: {
            start: Timestamp;
            end: Timestamp;
        };
        overallScore: number;
        meetingLoad: 'light' | 'moderate' | 'heavy' | 'overloaded';
        recommendations: string[];
        analyzedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarSyncStarted extends CalendarDomainEvent {
    readonly data: {
        provider: CalendarProvider;
        syncType: 'full' | 'incremental';
        startedAt: Timestamp;
    };
    readonly eventType = "CalendarSyncStarted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        provider: CalendarProvider;
        syncType: 'full' | 'incremental';
        startedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarSyncCompleted extends CalendarDomainEvent {
    readonly data: {
        provider: CalendarProvider;
        eventsSynced: number;
        eventsAdded: number;
        eventsUpdated: number;
        eventsDeleted: number;
        completedAt: Timestamp;
        duration: number;
    };
    readonly eventType = "CalendarSyncCompleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        provider: CalendarProvider;
        eventsSynced: number;
        eventsAdded: number;
        eventsUpdated: number;
        eventsDeleted: number;
        completedAt: Timestamp;
        duration: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CalendarSyncFailed extends CalendarDomainEvent {
    readonly data: {
        provider: CalendarProvider;
        error: string;
        failedAt: Timestamp;
        retryScheduled: boolean;
    };
    readonly eventType = "CalendarSyncFailed";
    constructor(aggregateId: UUID, userId: UserId, data: {
        provider: CalendarProvider;
        error: string;
        failedAt: Timestamp;
        retryScheduled: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ConflictDetected extends CalendarDomainEvent {
    readonly data: {
        newEventId: EventId;
        conflictingEventIds: EventId[];
        conflictType: 'time' | 'location' | 'resource';
        resolution?: 'declined' | 'rescheduled' | 'accepted-anyway';
    };
    readonly eventType = "ConflictDetected";
    constructor(aggregateId: UUID, userId: UserId, data: {
        newEventId: EventId;
        conflictingEventIds: EventId[];
        conflictType: 'time' | 'location' | 'resource';
        resolution?: 'declined' | 'rescheduled' | 'accepted-anyway';
    }, metadata?: Partial<DomainEvent['metadata']>);
}
//# sourceMappingURL=calendar.events.d.ts.map