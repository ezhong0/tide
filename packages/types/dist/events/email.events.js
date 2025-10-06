"use strict";
/**
 * Email domain events for event sourcing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSyncFailed = exports.EmailSyncCompleted = exports.EmailSyncStarted = exports.ThreadUpdated = exports.ThreadCreated = exports.AttachmentRemoved = exports.AttachmentAdded = exports.EmailAnalyzed = exports.EmailLabeled = exports.EmailDeleted = exports.EmailArchived = exports.EmailUnstarred = exports.EmailStarred = exports.EmailRead = exports.EmailReceived = exports.EmailBounced = exports.EmailSendFailed = exports.EmailSent = exports.EmailSendRequested = exports.EmailDraftDeleted = exports.EmailDraftUpdated = exports.EmailDraftCreated = exports.EmailEvent = void 0;
const base_types_1 = require("../base.types");
// Base email event
class EmailEvent {
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
            correlationId: metadata?.correlationId ?? (0, base_types_1.UUID)(crypto.randomUUID()),
            causationId: metadata?.causationId ?? (0, base_types_1.UUID)(crypto.randomUUID()),
            userId: this.userId,
            source: metadata?.source ?? 'email-service',
            ...metadata
        };
    }
}
exports.EmailEvent = EmailEvent;
// Email draft events
class EmailDraftCreated extends EmailEvent {
    data;
    eventType = 'EmailDraftCreated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailDraftCreated = EmailDraftCreated;
class EmailDraftUpdated extends EmailEvent {
    data;
    eventType = 'EmailDraftUpdated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailDraftUpdated = EmailDraftUpdated;
class EmailDraftDeleted extends EmailEvent {
    data;
    eventType = 'EmailDraftDeleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailDraftDeleted = EmailDraftDeleted;
// Email sending events
class EmailSendRequested extends EmailEvent {
    data;
    eventType = 'EmailSendRequested';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailSendRequested = EmailSendRequested;
class EmailSent extends EmailEvent {
    data;
    eventType = 'EmailSent';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailSent = EmailSent;
class EmailSendFailed extends EmailEvent {
    data;
    eventType = 'EmailSendFailed';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailSendFailed = EmailSendFailed;
class EmailBounced extends EmailEvent {
    data;
    eventType = 'EmailBounced';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailBounced = EmailBounced;
// Email receiving events
class EmailReceived extends EmailEvent {
    data;
    eventType = 'EmailReceived';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailReceived = EmailReceived;
// Email interaction events
class EmailRead extends EmailEvent {
    data;
    eventType = 'EmailRead';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailRead = EmailRead;
class EmailStarred extends EmailEvent {
    data;
    eventType = 'EmailStarred';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailStarred = EmailStarred;
class EmailUnstarred extends EmailEvent {
    data;
    eventType = 'EmailUnstarred';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailUnstarred = EmailUnstarred;
class EmailArchived extends EmailEvent {
    data;
    eventType = 'EmailArchived';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailArchived = EmailArchived;
class EmailDeleted extends EmailEvent {
    data;
    eventType = 'EmailDeleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailDeleted = EmailDeleted;
class EmailLabeled extends EmailEvent {
    data;
    eventType = 'EmailLabeled';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailLabeled = EmailLabeled;
// Email analysis events
class EmailAnalyzed extends EmailEvent {
    data;
    eventType = 'EmailAnalyzed';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailAnalyzed = EmailAnalyzed;
// Email attachment events
class AttachmentAdded extends EmailEvent {
    data;
    eventType = 'AttachmentAdded';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AttachmentAdded = AttachmentAdded;
class AttachmentRemoved extends EmailEvent {
    data;
    eventType = 'AttachmentRemoved';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AttachmentRemoved = AttachmentRemoved;
// Thread events
class ThreadCreated extends EmailEvent {
    data;
    eventType = 'ThreadCreated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ThreadCreated = ThreadCreated;
class ThreadUpdated extends EmailEvent {
    data;
    eventType = 'ThreadUpdated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ThreadUpdated = ThreadUpdated;
// Sync events
class EmailSyncStarted extends EmailEvent {
    data;
    eventType = 'EmailSyncStarted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailSyncStarted = EmailSyncStarted;
class EmailSyncCompleted extends EmailEvent {
    data;
    eventType = 'EmailSyncCompleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailSyncCompleted = EmailSyncCompleted;
class EmailSyncFailed extends EmailEvent {
    data;
    eventType = 'EmailSyncFailed';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.EmailSyncFailed = EmailSyncFailed;
//# sourceMappingURL=email.events.js.map