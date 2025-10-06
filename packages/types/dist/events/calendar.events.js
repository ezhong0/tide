"use strict";
/**
 * Calendar domain events for event sourcing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictDetected = exports.CalendarSyncFailed = exports.CalendarSyncCompleted = exports.CalendarSyncStarted = exports.CalendarHealthAnalyzed = exports.OutOfOfficeSet = exports.FocusTimeBlocked = exports.MeetingTimesFound = exports.AvailabilityChecked = exports.RecurrenceInstanceSkipped = exports.RecurrenceInstanceModified = exports.RecurrenceRuleSet = exports.ReminderTriggered = exports.ReminderAdded = exports.ConferenceRemoved = exports.ConferenceAdded = exports.ParticipantResponseChanged = exports.ParticipantRemoved = exports.ParticipantAdded = exports.CalendarEventDeleted = exports.CalendarEventCancelled = exports.CalendarEventUpdated = exports.CalendarEventCreated = exports.CalendarDomainEvent = void 0;
const base_types_1 = require("../base.types");
// Base calendar event
class CalendarDomainEvent {
    aggregateId;
    userId;
    data;
    eventVersion = 1;
    eventId;
    timestamp;
    metadata;
    constructor(aggregateId, userId, data, metadata) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.data = data;
        this.eventId = (0, base_types_1.UUID)(crypto.randomUUID());
        this.timestamp = (0, base_types_1.Timestamp)(Date.now());
        this.metadata = {
            correlationId: metadata?.correlationId || (0, base_types_1.UUID)(crypto.randomUUID()),
            causationId: metadata?.causationId || (0, base_types_1.UUID)(crypto.randomUUID()),
            userId: this.userId,
            source: metadata?.source || 'calendar-service',
            ...metadata
        };
    }
}
exports.CalendarDomainEvent = CalendarDomainEvent;
// Event creation events
class CalendarEventCreated extends CalendarDomainEvent {
    data;
    eventType = 'CalendarEventCreated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarEventCreated = CalendarEventCreated;
class CalendarEventUpdated extends CalendarDomainEvent {
    data;
    eventType = 'CalendarEventUpdated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarEventUpdated = CalendarEventUpdated;
class CalendarEventCancelled extends CalendarDomainEvent {
    data;
    eventType = 'CalendarEventCancelled';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarEventCancelled = CalendarEventCancelled;
class CalendarEventDeleted extends CalendarDomainEvent {
    data;
    eventType = 'CalendarEventDeleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarEventDeleted = CalendarEventDeleted;
// Participant events
class ParticipantAdded extends CalendarDomainEvent {
    data;
    eventType = 'ParticipantAdded';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ParticipantAdded = ParticipantAdded;
class ParticipantRemoved extends CalendarDomainEvent {
    data;
    eventType = 'ParticipantRemoved';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ParticipantRemoved = ParticipantRemoved;
class ParticipantResponseChanged extends CalendarDomainEvent {
    data;
    eventType = 'ParticipantResponseChanged';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ParticipantResponseChanged = ParticipantResponseChanged;
// Meeting/Conference events
class ConferenceAdded extends CalendarDomainEvent {
    data;
    eventType = 'ConferenceAdded';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ConferenceAdded = ConferenceAdded;
class ConferenceRemoved extends CalendarDomainEvent {
    data;
    eventType = 'ConferenceRemoved';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ConferenceRemoved = ConferenceRemoved;
// Reminder events
class ReminderAdded extends CalendarDomainEvent {
    data;
    eventType = 'ReminderAdded';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ReminderAdded = ReminderAdded;
class ReminderTriggered extends CalendarDomainEvent {
    data;
    eventType = 'ReminderTriggered';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ReminderTriggered = ReminderTriggered;
// Recurrence events
class RecurrenceRuleSet extends CalendarDomainEvent {
    data;
    eventType = 'RecurrenceRuleSet';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.RecurrenceRuleSet = RecurrenceRuleSet;
class RecurrenceInstanceModified extends CalendarDomainEvent {
    data;
    eventType = 'RecurrenceInstanceModified';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.RecurrenceInstanceModified = RecurrenceInstanceModified;
class RecurrenceInstanceSkipped extends CalendarDomainEvent {
    data;
    eventType = 'RecurrenceInstanceSkipped';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.RecurrenceInstanceSkipped = RecurrenceInstanceSkipped;
// Availability events
class AvailabilityChecked extends CalendarDomainEvent {
    data;
    eventType = 'AvailabilityChecked';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AvailabilityChecked = AvailabilityChecked;
class MeetingTimesFound extends CalendarDomainEvent {
    data;
    eventType = 'MeetingTimesFound';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.MeetingTimesFound = MeetingTimesFound;
// Time blocking events
class FocusTimeBlocked extends CalendarDomainEvent {
    data;
    eventType = 'FocusTimeBlocked';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.FocusTimeBlocked = FocusTimeBlocked;
class OutOfOfficeSet extends CalendarDomainEvent {
    data;
    eventType = 'OutOfOfficeSet';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.OutOfOfficeSet = OutOfOfficeSet;
// Calendar health events
class CalendarHealthAnalyzed extends CalendarDomainEvent {
    data;
    eventType = 'CalendarHealthAnalyzed';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarHealthAnalyzed = CalendarHealthAnalyzed;
// Sync events
class CalendarSyncStarted extends CalendarDomainEvent {
    data;
    eventType = 'CalendarSyncStarted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarSyncStarted = CalendarSyncStarted;
class CalendarSyncCompleted extends CalendarDomainEvent {
    data;
    eventType = 'CalendarSyncCompleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarSyncCompleted = CalendarSyncCompleted;
class CalendarSyncFailed extends CalendarDomainEvent {
    data;
    eventType = 'CalendarSyncFailed';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CalendarSyncFailed = CalendarSyncFailed;
// Conflict detection events
class ConflictDetected extends CalendarDomainEvent {
    data;
    eventType = 'ConflictDetected';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ConflictDetected = ConflictDetected;
//# sourceMappingURL=calendar.events.js.map