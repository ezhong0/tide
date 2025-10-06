import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums

export const emailProviderEnum = pgEnum('email_provider', ['gmail', 'outlook']);
export const calendarProviderEnum = pgEnum('calendar_provider', ['google', 'outlook']);
export const commandStatusEnum = pgEnum('command_status', [
  'pending',
  'processing',
  'pending_approval',
  'completed',
  'failed',
  'cancelled',
]);
export const draftStatusEnum = pgEnum('draft_status', [
  'pending_review',
  'approved',
  'rejected',
  'edited',
  'sent',
]);
export const followUpStatusEnum = pgEnum('follow_up_status', [
  'active',
  'completed',
  'cancelled',
  'snoozed',
]);

// Tables

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    emailProvider: emailProviderEnum('email_provider').notNull(),
    emailCredentials: jsonb('email_credentials').notNull(), // Encrypted OAuth tokens
    calendarProvider: calendarProviderEnum('calendar_provider').notNull(),
    calendarCredentials: jsonb('calendar_credentials').notNull(), // Encrypted OAuth tokens
    phoneNumber: text('phone_number'),
    timezone: text('timezone').notNull().default('America/Los_Angeles'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      emailIdx: index('idx_users_email').on(table.email),
    };
  }
);

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultTone: text('default_tone').notNull().default('professional'),
  emailSignature: text('email_signature').notNull(),
  signOffPhrase: text('sign_off_phrase').notNull().default('Best,'),
  autoAcceptMeetings: boolean('auto_accept_meetings').notNull().default(false),
  autoAcceptMeetingsFrom: text('auto_accept_meetings_from').notNull().default('none'),
  autoRespondSimple: boolean('auto_respond_simple').notNull().default(false),
  autoRespondConfidence: text('auto_respond_confidence').notNull().default('high'),
  notificationPreferences: jsonb('notification_preferences').notNull(),
  vipContacts: jsonb('vip_contacts').notNull().default([]),
  followUpDefaults: jsonb('follow_up_defaults').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const commands = pgTable(
  'commands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    transcript: text('transcript').notNull(),
    audioFileUrl: text('audio_file_url'),
    intent: text('intent').notNull(),
    intentData: jsonb('intent_data').notNull(),
    confidence: integer('confidence').notNull(), // 0-100
    status: commandStatusEnum('status').notNull().default('pending'),
    result: jsonb('result'),
    error: jsonb('error'),
    deviceType: text('device_type').notNull(),
    appVersion: text('app_version').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    processingStartedAt: timestamp('processing_started_at'),
    completedAt: timestamp('completed_at'),
  },
  (table) => {
    return {
      userTimestampIdx: index('idx_commands_user_timestamp').on(table.userId, table.timestamp),
      userStatusIdx: index('idx_commands_user_status').on(table.userId, table.status),
    };
  }
);

export const emails = pgTable(
  'emails',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    threadId: text('thread_id').notNull(),
    direction: text('direction').notNull(), // 'sent' | 'received'
    from: text('from').notNull(),
    to: jsonb('to').notNull(), // string[]
    cc: jsonb('cc'),
    bcc: jsonb('bcc'),
    subject: text('subject').notNull(),
    body: text('body'), // Null if archived
    snippet: text('snippet').notNull(),
    attachments: jsonb('attachments'),
    labels: jsonb('labels'),
    isRead: boolean('is_read').notNull().default(false),
    isStarred: boolean('is_starred').notNull().default(false),
    isImportant: boolean('is_important').notNull().default(false),
    indexed: boolean('indexed').notNull().default(false),
    embeddingId: text('embedding_id'),
    priority: text('priority'),
    category: text('category'),
    archived: boolean('archived').notNull().default(false),
    date: timestamp('date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      userDateIdx: index('idx_emails_user_date').on(table.userId, table.date),
      threadIdx: index('idx_emails_thread').on(table.threadId),
      externalIdx: index('idx_emails_external').on(table.externalId),
      unreadIdx: index('idx_emails_unread').on(table.userId, table.isRead),
    };
  }
);

export const calendarEvents = pgTable(
  'calendar_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    location: text('location'),
    start: timestamp('start').notNull(),
    end: timestamp('end').notNull(),
    isAllDay: boolean('is_all_day').notNull().default(false),
    timezone: text('timezone').notNull(),
    attendees: jsonb('attendees').notNull(),
    organizer: jsonb('organizer').notNull(),
    status: text('status').notNull(), // 'confirmed' | 'tentative' | 'cancelled'
    responseStatus: text('response_status').notNull(),
    meetingUrl: text('meeting_url'),
    conferenceData: jsonb('conference_data'),
    recurrence: jsonb('recurrence'),
    aiSuggestions: jsonb('ai_suggestions'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      userStartIdx: index('idx_calendar_user_start').on(table.userId, table.start),
      userDateRangeIdx: index('idx_calendar_user_date_range').on(
        table.userId,
        table.start,
        table.end
      ),
    };
  }
);

export const drafts = pgTable('drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  commandId: uuid('command_id')
    .notNull()
    .references(() => commands.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'email' | 'meeting_request' | 'meeting_update'
  emailDraft: jsonb('email_draft'),
  meetingDraft: jsonb('meeting_draft'),
  status: draftStatusEnum('status').notNull().default('pending_review'),
  userEdits: jsonb('user_edits'),
  sentAt: timestamp('sent_at'),
  sentMessageId: text('sent_message_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const followUps = pgTable(
  'follow_ups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emailThreadId: text('email_thread_id'),
    meetingId: uuid('meeting_id').references(() => calendarEvents.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'email_response' | 'meeting_acceptance' | 'custom'
    followUpAt: timestamp('follow_up_at').notNull(),
    status: followUpStatusEnum('status').notNull().default('active'),
    followUpAction: text('follow_up_action').notNull(),
    followUpMessage: text('follow_up_message'),
    conditions: jsonb('conditions'),
    executedAt: timestamp('executed_at'),
    result: jsonb('result'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => {
    return {
      userFollowUpAtIdx: index('idx_followups_user_follow_up_at').on(
        table.userId,
        table.followUpAt
      ),
      statusIdx: index('idx_followups_status').on(table.status),
    };
  }
);

export const contactPreferences = pgTable(
  'contact_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contactEmail: text('contact_email').notNull(),
    contactName: text('contact_name'),
    preferredTone: text('preferred_tone').notNull(),
    relationshipType: text('relationship_type'),
    customInstructions: text('custom_instructions'),
    interactionCount: integer('interaction_count').notNull().default(0),
    lastInteraction: timestamp('last_interaction').notNull().defaultNow(),
    patterns: jsonb('patterns'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      userContactIdx: index('idx_contact_prefs_user_contact').on(
        table.userId,
        table.contactEmail
      ),
    };
  }
);

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  commandId: uuid('command_id')
    .notNull()
    .references(() => commands.id, { onDelete: 'cascade' }),
  feedbackType: text('feedback_type').notNull(), // 'approve' | 'edit' | 'reject' | 'rating'
  changes: jsonb('changes'),
  rating: integer('rating'),
  comment: text('comment'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    metadata: jsonb('metadata'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    deviceType: text('device_type'),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => {
    return {
      userTimestampIdx: index('idx_audit_user_timestamp').on(table.userId, table.timestamp),
      entityIdx: index('idx_audit_entity').on(table.entityType, table.entityId),
    };
  }
);
