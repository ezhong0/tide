/**
 * Email domain events for event sourcing
 */

import {
  DomainEvent, UUID, Timestamp, EmailId, ThreadId, UserId
} from '../base.types';
import {
  EmailContact, EmailBody, EmailPriority, EmailCategory, Attachment, ToneAnalysis
} from '../domain/email.types';

// Base email event
export abstract class EmailEvent implements DomainEvent {
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
      correlationId: metadata?.correlationId ?? UUID(crypto.randomUUID()),
      causationId: metadata?.causationId ?? UUID(crypto.randomUUID()),
      userId: this.userId,
      source: metadata?.source ?? 'email-service',
      ...metadata
    };
  }
}

// Email draft events
export class EmailDraftCreated extends EmailEvent {
  readonly eventType = 'EmailDraftCreated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      to: EmailContact[];
      cc?: EmailContact[];
      bcc?: EmailContact[];
      subject: string;
      body: EmailBody;
      threadId?: ThreadId;
      replyTo?: EmailId;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailDraftUpdated extends EmailEvent {
  readonly eventType = 'EmailDraftUpdated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      changes: Partial<{
        to: EmailContact[];
        cc: EmailContact[];
        bcc: EmailContact[];
        subject: string;
        body: EmailBody;
      }>;
      version: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailDraftDeleted extends EmailEvent {
  readonly eventType = 'EmailDraftDeleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      reason?: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Email sending events
export class EmailSendRequested extends EmailEvent {
  readonly eventType = 'EmailSendRequested';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      scheduledFor?: Timestamp;
      priority: EmailPriority;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailSent extends EmailEvent {
  readonly eventType = 'EmailSent';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      messageId: string;
      sentAt: Timestamp;
      provider: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailSendFailed extends EmailEvent {
  readonly eventType = 'EmailSendFailed';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      error: string;
      errorCode?: string;
      retryable: boolean;
      attemptNumber: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailBounced extends EmailEvent {
  readonly eventType = 'EmailBounced';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      bounceType: 'hard' | 'soft';
      bounceReason: string;
      bouncedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Email receiving events
export class EmailReceived extends EmailEvent {
  readonly eventType = 'EmailReceived';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      from: EmailContact;
      to: EmailContact[];
      subject: string;
      body: EmailBody;
      threadId: ThreadId;
      receivedAt: Timestamp;
      provider: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Email interaction events
export class EmailRead extends EmailEvent {
  readonly eventType = 'EmailRead';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      readAt: Timestamp;
      device?: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailStarred extends EmailEvent {
  readonly eventType = 'EmailStarred';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      starredAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailUnstarred extends EmailEvent {
  readonly eventType = 'EmailUnstarred';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      unstarredAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailArchived extends EmailEvent {
  readonly eventType = 'EmailArchived';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      archivedAt: Timestamp;
      autoArchived: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailDeleted extends EmailEvent {
  readonly eventType = 'EmailDeleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      deletedAt: Timestamp;
      permanent: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailLabeled extends EmailEvent {
  readonly eventType = 'EmailLabeled';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      labels: string[];
      addedLabels: string[];
      removedLabels: string[];
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Email analysis events
export class EmailAnalyzed extends EmailEvent {
  readonly eventType = 'EmailAnalyzed';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      tone: ToneAnalysis;
      category: EmailCategory;
      importance: number;
      suggestedActions?: string[];
      analyzedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Email attachment events
export class AttachmentAdded extends EmailEvent {
  readonly eventType = 'AttachmentAdded';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      attachment: Attachment;
      addedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class AttachmentRemoved extends EmailEvent {
  readonly eventType = 'AttachmentRemoved';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      emailId: EmailId;
      attachmentId: UUID;
      removedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Thread events
export class ThreadCreated extends EmailEvent {
  readonly eventType = 'ThreadCreated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      threadId: ThreadId;
      subject: string;
      firstEmailId: EmailId;
      createdAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ThreadUpdated extends EmailEvent {
  readonly eventType = 'ThreadUpdated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      threadId: ThreadId;
      newEmailId: EmailId;
      emailCount: number;
      lastMessageAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Sync events
export class EmailSyncStarted extends EmailEvent {
  readonly eventType = 'EmailSyncStarted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      provider: string;
      syncType: 'full' | 'incremental';
      startedAt: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailSyncCompleted extends EmailEvent {
  readonly eventType = 'EmailSyncCompleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      provider: string;
      emailsSynced: number;
      completedAt: Timestamp;
      duration: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class EmailSyncFailed extends EmailEvent {
  readonly eventType = 'EmailSyncFailed';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      provider: string;
      error: string;
      failedAt: Timestamp;
      retryScheduled: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}