/**
 * Common types used across the application
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================================================
// JWT Token Types
// ============================================================================

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WebSocketEventType =
  | 'command.status_updated'
  | 'draft.created'
  | 'draft.approved'
  | 'draft.rejected'
  | 'email.received'
  | 'email.sent'
  | 'calendar.event_created'
  | 'calendar.event_updated'
  | 'follow_up.due'
  | 'error';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  data: T;
  timestamp: Date;
}

export interface CommandStatusUpdate {
  commandId: string;
  status: string;
  message?: string;
  draft?: unknown;
}

export interface DraftNotification {
  draftId: string;
  type: string;
  content: unknown;
  status: string;
}

export interface EmailNotification {
  emailId: string;
  from: string;
  subject: string;
  snippet: string;
  isImportant: boolean;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchQuery {
  q?: string;
  from?: string;
  to?: string;
  subject?: string;
  dateAfter?: Date;
  dateBefore?: Date;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isStarred?: boolean;
  labels?: string[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  tags?: string[];
  search?: string;
}

// ============================================================================
// Time & Date Types
// ============================================================================

export type TimeOfDay = 'morning' | 'lunch' | 'afternoon' | 'evening';

export interface TimeSlot {
  start: Date;
  end: Date;
  score?: number;
  reason?: string;
}

export interface AvailabilitySlot extends TimeSlot {
  conflicts: CalendarConflict[];
  isPreferred: boolean;
}

export interface CalendarConflict {
  eventId: string;
  title: string;
  start: Date;
  end: Date;
  type: 'hard' | 'soft'; // hard = confirmed meeting, soft = tentative
}

// ============================================================================
// AI & Processing Types
// ============================================================================

export interface IntentClassification {
  intent: string;
  confidence: number; // 0-100
  entities: Record<string, unknown>;
  requiredFields: string[];
  missingFields: string[];
}

export interface VoiceTranscription {
  text: string;
  confidence: number;
  language: string;
  duration: number; // seconds
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface EmailEmbedding {
  id: string;
  emailId: string;
  vector: number[];
  model: string;
  createdAt: Date;
}

export interface SemanticSearchResult {
  emailId: string;
  score: number;
  snippet: string;
  metadata: {
    from: string;
    subject: string;
    date: Date;
  };
}

// ============================================================================
// User Context Types
// ============================================================================

export interface UserContext {
  userId: string;
  email: string;
  name: string;
  timezone: string;
  preferences: {
    defaultTone: string;
    emailSignature: string;
    autoRespondEnabled: boolean;
  };
  vipContacts: Array<{
    email: string;
    name: string;
  }>;
}

export interface EmailContext {
  recentEmails: Array<{
    from: string;
    subject: string;
    date: Date;
  }>;
  threadHistory: Array<{
    id: string;
    subject: string;
    messageCount: number;
  }>;
  suggestedActions: string[];
}

export interface MeetingContext {
  upcomingMeetings: Array<{
    id: string;
    title: string;
    start: Date;
    attendees: string[];
  }>;
  conflictingMeetings: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
  }>;
  preferredTimeSlots: TimeSlot[];
}

// ============================================================================
// OAuth Types
// ============================================================================

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
  tokenType?: string;
}

export interface OAuthProvider {
  name: 'google' | 'microsoft';
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    rabbitmq?: ServiceHealth;
  };
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface Metrics {
  http: {
    requests_total: number;
    requests_duration_seconds: number;
    requests_in_flight: number;
  };
  commands: {
    processed_total: number;
    failed_total: number;
    processing_duration_seconds: number;
  };
  emails: {
    sent_total: number;
    received_total: number;
    indexed_total: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];
