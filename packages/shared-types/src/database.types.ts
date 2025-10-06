/**
 * Database row types
 *
 * These types match the database schema and are used for type-safe
 * database operations across the application.
 */

import type {
  UserId,
  UserPreferencesId,
  CommandId,
  EmailId,
  ThreadId,
  CalendarEventId,
  DraftId,
  FollowUpId,
  ContactPreferencesId,
  FeedbackId,
  AuditLogId,
} from './branded.types.js';

// ============================================================================
// Enums
// ============================================================================

export type EmailProvider = 'gmail' | 'outlook';
export type CalendarProvider = 'google' | 'outlook';

export type CommandStatus =
  | 'pending'
  | 'processing'
  | 'pending_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type CommandIntent =
  | 'schedule_meeting'
  | 'draft_email'
  | 'send_email'
  | 'search_email'
  | 'get_meeting_context'
  | 'reschedule_meeting'
  | 'cancel_meeting'
  | 'set_follow_up'
  | 'get_daily_brief'
  | 'get_availability'
  | 'update_preferences';

export type DraftStatus = 'pending_review' | 'approved' | 'rejected' | 'edited' | 'sent';

export type DraftType = 'email' | 'meeting_request' | 'meeting_update';

export type FollowUpStatus = 'active' | 'completed' | 'cancelled' | 'snoozed';

export type FollowUpType = 'email_response' | 'meeting_acceptance' | 'custom';

export type FollowUpAction = 'notify_user' | 'draft_reminder' | 'auto_send';

export type EmailDirection = 'sent' | 'received';

export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

export type AttendeeResponseStatus = 'accepted' | 'declined' | 'tentative' | 'needsAction';

export type Tone = 'professional' | 'casual' | 'friendly' | 'formal';

export type RelationshipType = 'colleague' | 'client' | 'friend' | 'boss' | 'vendor';

export type FeedbackType = 'approve' | 'edit' | 'reject' | 'rating';

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'email.sent'
  | 'email.drafted'
  | 'email.deleted'
  | 'calendar.event_created'
  | 'calendar.event_updated'
  | 'calendar.event_deleted'
  | 'command.processed'
  | 'command.approved'
  | 'command.rejected'
  | 'draft.created'
  | 'draft.approved'
  | 'draft.rejected'
  | 'draft.sent';

export type EntityType = 'email' | 'calendar_event' | 'command' | 'draft' | 'user';

// ============================================================================
// Supporting Types
// ============================================================================

export interface EncryptedCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
}

export interface NotificationPreferences {
  interruptions: {
    vip_emails: boolean;
    meeting_reminders: boolean;
    urgent_deadlines: boolean;
    tracked_responses: boolean;
  };
  batch_interval: number; // minutes
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface VIPContact {
  email: string;
  name: string;
  relationship: 'boss' | 'client' | 'colleague';
}

export interface FollowUpDefaults {
  default_delay_hours: number;
  auto_follow_up_enabled: boolean;
  follow_up_conditions: {
    no_response_to_important: boolean;
    meeting_not_accepted: boolean;
  };
}

export interface Attendee {
  email: string;
  name?: string;
  response_status: AttendeeResponseStatus;
  optional: boolean;
}

export interface Organizer {
  email: string;
  name?: string;
  self: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface ConferenceData {
  type: 'zoom' | 'meet' | 'teams' | 'other';
  url: string;
  id?: string;
  pin?: string;
}

export interface Recurrence {
  rule: string; // RRULE format
  exceptions?: Date[];
}

export interface AISuggestions {
  suggested_prep?: string[];
  related_emails?: string[];
  suggested_action_items?: string[];
  meeting_summary?: string;
}

export interface EmailDraftContent {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  tone: Tone;
  reply_to_thread_id?: string;
}

export interface MeetingDraftContent {
  title: string;
  participants: string[];
  proposed_times: Date[];
  duration: number; // minutes
  location?: string;
  description?: string;
  conference_type?: 'zoom' | 'meet' | 'teams';
}

export interface EditRecord {
  original_content: string;
  edited_content: string;
  edit_type: 'tone_change' | 'content_change' | 'recipient_change' | 'subject_change';
  timestamp: Date;
}

export interface EditChange {
  field: string;
  original_value: unknown;
  new_value: unknown;
  reason?: string;
}

export interface ContactPatterns {
  average_response_time_hours?: number;
  preferred_meeting_times?: string[]; // e.g., ["morning", "afternoon"]
  common_topics?: string[];
  typical_email_length?: 'short' | 'medium' | 'long';
}

// ============================================================================
// Database Row Types
// ============================================================================

export interface UserRow {
  id: UserId;
  email: string;
  name: string;
  emailProvider: EmailProvider;
  emailCredentials: EncryptedCredentials;
  calendarProvider: CalendarProvider;
  calendarCredentials: EncryptedCredentials;
  phoneNumber?: string;
  timezone: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferencesRow {
  id: UserPreferencesId;
  userId: UserId;
  defaultTone: Tone;
  emailSignature: string;
  signOffPhrase: string;
  autoAcceptMeetings: boolean;
  autoAcceptMeetingsFrom: string; // 'none' | 'vip' | 'all'
  autoRespondSimple: boolean;
  autoRespondConfidence: string; // 'high' | 'medium' | 'low'
  notificationPreferences: NotificationPreferences;
  vipContacts: VIPContact[];
  followUpDefaults: FollowUpDefaults;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommandRow {
  id: CommandId;
  userId: UserId;
  transcript: string;
  audioFileUrl?: string;
  intent: CommandIntent;
  intentData: Record<string, unknown>;
  confidence: number; // 0-100
  status: CommandStatus;
  result?: Record<string, unknown>;
  error?: Record<string, unknown>;
  deviceType: string; // 'ios' | 'android' | 'web'
  appVersion: string;
  timestamp: Date;
  processingStartedAt?: Date;
  completedAt?: Date;
}

export interface EmailRow {
  id: EmailId;
  userId: UserId;
  externalId: string;
  threadId: ThreadId;
  direction: EmailDirection;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body?: string; // Null if archived
  snippet: string;
  attachments?: Attachment[];
  labels?: string[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  indexed: boolean;
  embeddingId?: string;
  priority?: string;
  category?: string;
  archived: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEventRow {
  id: CalendarEventId;
  userId: UserId;
  externalId: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  timezone: string;
  attendees: Attendee[];
  organizer: Organizer;
  status: EventStatus;
  responseStatus: AttendeeResponseStatus;
  meetingUrl?: string;
  conferenceData?: ConferenceData;
  recurrence?: Recurrence;
  aiSuggestions?: AISuggestions;
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftRow {
  id: DraftId;
  userId: UserId;
  commandId: CommandId;
  type: DraftType;
  emailDraft?: EmailDraftContent;
  meetingDraft?: MeetingDraftContent;
  status: DraftStatus;
  userEdits?: EditRecord;
  sentAt?: Date;
  sentMessageId?: string;
  createdAt: Date;
}

export interface FollowUpRow {
  id: FollowUpId;
  userId: UserId;
  emailThreadId?: ThreadId;
  meetingId?: CalendarEventId;
  type: FollowUpType;
  followUpAt: Date;
  status: FollowUpStatus;
  followUpAction: FollowUpAction;
  followUpMessage?: string;
  conditions?: Record<string, unknown>;
  executedAt?: Date;
  result?: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

export interface ContactPreferencesRow {
  id: ContactPreferencesId;
  userId: UserId;
  contactEmail: string;
  contactName?: string;
  preferredTone: Tone;
  relationshipType?: RelationshipType;
  customInstructions?: string;
  interactionCount: number;
  lastInteraction: Date;
  patterns?: ContactPatterns;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackRow {
  id: FeedbackId;
  userId: UserId;
  commandId: CommandId;
  feedbackType: FeedbackType;
  changes?: EditChange[];
  rating?: number; // 1-5
  comment?: string;
  timestamp: Date;
}

export interface AuditLogRow {
  id: AuditLogId;
  userId: UserId;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  timestamp: Date;
}

// ============================================================================
// Insert Types (for database inserts, optional fields)
// ============================================================================

export type UserInsert = Omit<UserRow, 'id' | 'createdAt' | 'lastActiveAt'> & {
  id?: UserId;
  createdAt?: Date;
  lastActiveAt?: Date;
};

export type UserPreferencesInsert = Omit<UserPreferencesRow, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: UserPreferencesId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommandInsert = Omit<
  CommandRow,
  'id' | 'timestamp' | 'processingStartedAt' | 'completedAt'
> & {
  id?: CommandId;
  timestamp?: Date;
  processingStartedAt?: Date;
  completedAt?: Date;
};

export type EmailInsert = Omit<EmailRow, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: EmailId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CalendarEventInsert = Omit<CalendarEventRow, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: CalendarEventId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type DraftInsert = Omit<DraftRow, 'id' | 'createdAt'> & {
  id?: DraftId;
  createdAt?: Date;
};

export type FollowUpInsert = Omit<FollowUpRow, 'id' | 'createdAt' | 'completedAt'> & {
  id?: FollowUpId;
  createdAt?: Date;
  completedAt?: Date;
};

export type ContactPreferencesInsert = Omit<
  ContactPreferencesRow,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: ContactPreferencesId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FeedbackInsert = Omit<FeedbackRow, 'id' | 'timestamp'> & {
  id?: FeedbackId;
  timestamp?: Date;
};

export type AuditLogInsert = Omit<AuditLogRow, 'id' | 'timestamp'> & {
  id?: AuditLogId;
  timestamp?: Date;
};
