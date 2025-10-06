/**
 * Email domain events for event sourcing
 */
import { DomainEvent, UUID, Timestamp, EmailId, ThreadId, UserId } from '../base.types';
import { EmailContact, EmailBody, EmailPriority, EmailCategory, Attachment, ToneAnalysis } from '../domain/email.types';
export declare abstract class EmailEvent implements DomainEvent {
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
export declare class EmailDraftCreated extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        to: EmailContact[];
        cc?: EmailContact[];
        bcc?: EmailContact[];
        subject: string;
        body: EmailBody;
        threadId?: ThreadId;
        replyTo?: EmailId;
    };
    readonly eventType = "EmailDraftCreated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        to: EmailContact[];
        cc?: EmailContact[];
        bcc?: EmailContact[];
        subject: string;
        body: EmailBody;
        threadId?: ThreadId;
        replyTo?: EmailId;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailDraftUpdated extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        changes: Partial<{
            to: EmailContact[];
            cc: EmailContact[];
            bcc: EmailContact[];
            subject: string;
            body: EmailBody;
        }>;
        version: number;
    };
    readonly eventType = "EmailDraftUpdated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        changes: Partial<{
            to: EmailContact[];
            cc: EmailContact[];
            bcc: EmailContact[];
            subject: string;
            body: EmailBody;
        }>;
        version: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailDraftDeleted extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        reason?: string;
    };
    readonly eventType = "EmailDraftDeleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        reason?: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailSendRequested extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        scheduledFor?: Timestamp;
        priority: EmailPriority;
    };
    readonly eventType = "EmailSendRequested";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        scheduledFor?: Timestamp;
        priority: EmailPriority;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailSent extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        messageId: string;
        sentAt: Timestamp;
        provider: string;
    };
    readonly eventType = "EmailSent";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        messageId: string;
        sentAt: Timestamp;
        provider: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailSendFailed extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        error: string;
        errorCode?: string;
        retryable: boolean;
        attemptNumber: number;
    };
    readonly eventType = "EmailSendFailed";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        error: string;
        errorCode?: string;
        retryable: boolean;
        attemptNumber: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailBounced extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        bounceType: 'hard' | 'soft';
        bounceReason: string;
        bouncedAt: Timestamp;
    };
    readonly eventType = "EmailBounced";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        bounceType: 'hard' | 'soft';
        bounceReason: string;
        bouncedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailReceived extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        from: EmailContact;
        to: EmailContact[];
        subject: string;
        body: EmailBody;
        threadId: ThreadId;
        receivedAt: Timestamp;
        provider: string;
    };
    readonly eventType = "EmailReceived";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        from: EmailContact;
        to: EmailContact[];
        subject: string;
        body: EmailBody;
        threadId: ThreadId;
        receivedAt: Timestamp;
        provider: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailRead extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        readAt: Timestamp;
        device?: string;
    };
    readonly eventType = "EmailRead";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        readAt: Timestamp;
        device?: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailStarred extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        starredAt: Timestamp;
    };
    readonly eventType = "EmailStarred";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        starredAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailUnstarred extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        unstarredAt: Timestamp;
    };
    readonly eventType = "EmailUnstarred";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        unstarredAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailArchived extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        archivedAt: Timestamp;
        autoArchived: boolean;
    };
    readonly eventType = "EmailArchived";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        archivedAt: Timestamp;
        autoArchived: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailDeleted extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        deletedAt: Timestamp;
        permanent: boolean;
    };
    readonly eventType = "EmailDeleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        deletedAt: Timestamp;
        permanent: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailLabeled extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        labels: string[];
        addedLabels: string[];
        removedLabels: string[];
    };
    readonly eventType = "EmailLabeled";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        labels: string[];
        addedLabels: string[];
        removedLabels: string[];
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailAnalyzed extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        tone: ToneAnalysis;
        category: EmailCategory;
        importance: number;
        suggestedActions?: string[];
        analyzedAt: Timestamp;
    };
    readonly eventType = "EmailAnalyzed";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        tone: ToneAnalysis;
        category: EmailCategory;
        importance: number;
        suggestedActions?: string[];
        analyzedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AttachmentAdded extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        attachment: Attachment;
        addedAt: Timestamp;
    };
    readonly eventType = "AttachmentAdded";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        attachment: Attachment;
        addedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AttachmentRemoved extends EmailEvent {
    readonly data: {
        emailId: EmailId;
        attachmentId: UUID;
        removedAt: Timestamp;
    };
    readonly eventType = "AttachmentRemoved";
    constructor(aggregateId: UUID, userId: UserId, data: {
        emailId: EmailId;
        attachmentId: UUID;
        removedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ThreadCreated extends EmailEvent {
    readonly data: {
        threadId: ThreadId;
        subject: string;
        firstEmailId: EmailId;
        createdAt: Timestamp;
    };
    readonly eventType = "ThreadCreated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        threadId: ThreadId;
        subject: string;
        firstEmailId: EmailId;
        createdAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ThreadUpdated extends EmailEvent {
    readonly data: {
        threadId: ThreadId;
        newEmailId: EmailId;
        emailCount: number;
        lastMessageAt: Timestamp;
    };
    readonly eventType = "ThreadUpdated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        threadId: ThreadId;
        newEmailId: EmailId;
        emailCount: number;
        lastMessageAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailSyncStarted extends EmailEvent {
    readonly data: {
        provider: string;
        syncType: 'full' | 'incremental';
        startedAt: Timestamp;
    };
    readonly eventType = "EmailSyncStarted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        provider: string;
        syncType: 'full' | 'incremental';
        startedAt: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailSyncCompleted extends EmailEvent {
    readonly data: {
        provider: string;
        emailsSynced: number;
        completedAt: Timestamp;
        duration: number;
    };
    readonly eventType = "EmailSyncCompleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        provider: string;
        emailsSynced: number;
        completedAt: Timestamp;
        duration: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class EmailSyncFailed extends EmailEvent {
    readonly data: {
        provider: string;
        error: string;
        failedAt: Timestamp;
        retryScheduled: boolean;
    };
    readonly eventType = "EmailSyncFailed";
    constructor(aggregateId: UUID, userId: UserId, data: {
        provider: string;
        error: string;
        failedAt: Timestamp;
        retryScheduled: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
//# sourceMappingURL=email.events.d.ts.map