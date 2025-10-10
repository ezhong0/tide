/**
 * Database types for optimized Tide schema
 * Auto-generated from optimized_schema.sql
 */

// =====================================================
// CORE TYPES
// =====================================================

export type Provider = 'google' | 'microsoft';
export type Theme = 'light' | 'dark' | 'auto';

export interface UserSettings {
  theme: Theme;
  language: string;
  timezone: string;
  autonomy_level: 'conservative' | 'balanced' | 'aggressive';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  settings: UserSettings;
  primary_provider: Provider;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export interface OAuthToken {
  id: string;
  user_id: string;
  provider: Provider;
  service: 'email' | 'calendar' | 'both';
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  scopes: string[];
  provider_user_id: string | null;
  provider_email: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// EMAIL TYPES
// =====================================================

export interface EmailIntelligence {
  category: 'urgent' | 'important' | 'newsletter' | 'promotional' | 'social' | 'spam' | 'other' | null;
  priority: number; // 1-10
  urgency: 'critical' | 'high' | 'medium' | 'low';
  requires_response: boolean;
  ai_summary: string | null;
  suggested_actions: Array<{
    action: string;
    confidence: number;
  }>;
  autonomous_actions_taken: Array<{
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
  }>;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  url?: string;
}

export interface Email {
  id: string;
  user_id: string;
  provider: Provider;
  provider_message_id: string;
  provider_thread_id: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  snippet: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  is_unread: boolean;
  is_starred: boolean;
  labels: string[];
  attachments: EmailAttachment[];
  intelligence: EmailIntelligence;
  search_vector?: unknown; // tsvector
  sent_at: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContactIntelligence {
  strength: number; // 0-1
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional' | 'rare';
  vip: boolean;
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  topics: string[];
  stats: {
    emails_sent: number;
    emails_received: number;
    avg_response_time_minutes: number | null;
  };
  last_interaction_at: string | null;
}

export interface Contact {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  intelligence: ContactIntelligence;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// =====================================================
// CALENDAR TYPES
// =====================================================

export interface EventAttendee {
  email: string;
  name?: string;
  response_status?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  optional?: boolean;
}

export interface EventIntelligence {
  brief: {
    summary: string;
    key_discussion_points: string[];
    preparation_checklist: string[];
    attendee_insights: Array<{
      email: string;
      relationship_strength: number;
      recent_interactions: string[];
    }>;
  } | null;
  preparation: string[];
  conflicts: Array<{
    type: string;
    description: string;
    suggested_resolution: string;
  }>;
  optimization_suggestions: Array<{
    type: string;
    description: string;
    impact_score: number;
  }>;
  previous_meetings: Array<{
    date: string;
    notes: string;
    action_items: string[];
  }>;
  related_emails: string[]; // email IDs
  notes: string | null;
}

export interface Event {
  id: string;
  user_id: string;
  provider: Provider;
  provider_event_id: string;
  provider_calendar_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  is_all_day: boolean;
  recurrence_rule: string | null;
  status: 'confirmed' | 'tentative' | 'cancelled';
  attendees: EventAttendee[];
  intelligence: EventIntelligence;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// TASK & WORKFLOW TYPES
// =====================================================

export interface TaskStructure {
  subtasks: Array<{
    id: string;
    title: string;
    description?: string;
    order_index: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completed_at?: string;
  }>;
  dependencies: Array<{
    task_id: string;
    type: 'blocks' | 'related' | 'parent';
  }>;
  blockers: Array<{
    reason: string;
    created_at: string;
  }>;
}

export interface TaskIntelligence {
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex' | null;
  estimated_duration_minutes: number | null;
  ai_suggestions: Array<{
    type: string;
    suggestion: string;
    confidence: number;
  }>;
  related_emails: string[];
  related_events: string[];
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_score: number;
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  tags: string[];
  project: string | null;
  structure: TaskStructure;
  intelligence: TaskIntelligence;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkflowDefinition {
  trigger: {
    type: 'manual' | 'scheduled' | 'email_received' | 'calendar_event' | 'pattern_detected';
    config: Record<string, unknown>;
  };
  actions: Array<{
    type: string;
    config: Record<string, unknown>;
    order_index: number;
  }>;
  version: number;
}

export interface WorkflowStats {
  execution_count: number;
  success_count: number;
  failure_count: number;
  last_executed_at: string | null;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  definition: WorkflowDefinition;
  is_active: boolean;
  stats: WorkflowStats;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  context: Record<string, unknown>;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

// =====================================================
// CONVERSATION TYPES
// =====================================================

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  summary: string | null;
  message_count: number;
  last_message_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MessageMetadata {
  model: string | null;
  tokens_used: number | null;
  attachments: Array<{
    type: string;
    url?: string;
    data?: unknown;
  }>;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: MessageMetadata;
  created_at: string;
}

// =====================================================
// INTELLIGENCE TYPES
// =====================================================

export type IntelligenceType =
  | 'email_pattern'
  | 'temporal_pattern'
  | 'sequence_pattern'
  | 'automation_suggestion'
  | 'behavioral_pattern'
  | 'optimization_opportunity'
  | 'other';

export interface UserIntelligence {
  id: string;
  user_id: string;
  type: IntelligenceType;
  subtype: string | null;
  data: Record<string, unknown>; // Flexible JSONB
  confidence: number;
  usage_count: number;
  status: 'detected' | 'suggested' | 'accepted' | 'rejected' | 'active';
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailySnapshotData {
  priority_items: Array<{
    type: 'email' | 'task' | 'event';
    id: string;
    priority: number;
    reason: string;
  }>;
  pending_decisions: Array<{
    id: string;
    title: string;
    urgency: string;
    deadline?: string;
  }>;
  meeting_previews: Array<{
    id: string;
    title: string;
    start_time: string;
    brief_summary: string;
  }>;
  predictions: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
  stats: {
    emails_processed: number;
    tasks_completed: number;
    meetings_today: number;
    focus_time_hours: number;
  };
}

export interface DailySnapshot {
  id: string;
  user_id: string;
  snapshot_date: string; // DATE
  data: DailySnapshotData;
  generated_at: string;
  created_at: string;
}

export type ActionSuggestionType =
  | 'email_response'
  | 'schedule_meeting'
  | 'delegate_task'
  | 'decline_meeting'
  | 'archive_email'
  | 'send_reminder'
  | 'update_task'
  | 'reschedule_meeting'
  | 'other';

export interface ActionSuggestion {
  id: string;
  user_id: string;
  type: ActionSuggestionType;
  title: string;
  preview: string;
  context: Record<string, unknown>;
  confidence: number;
  requires_approval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  execution_result: Record<string, unknown> | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// DECISION TYPES
// =====================================================

export type DecisionType =
  | 'approval'
  | 'choice'
  | 'prioritization'
  | 'scheduling'
  | 'budget'
  | 'strategic'
  | 'operational'
  | 'other';

export interface Decision {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: DecisionType;
  context: Record<string, unknown>;
  options: Array<{
    id: string;
    title: string;
    description?: string;
    pros: string[];
    cons: string[];
  }>;
  ai_recommendation: {
    option_id: string;
    reasoning: string;
    confidence: number;
  } | null;
  user_decision: {
    option_id: string;
    reasoning?: string;
    decided_at: string;
  } | null;
  status: 'pending' | 'approved' | 'declined' | 'deferred';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface EventLog {
  id: string;
  user_id: string | null;
  event_type: string;
  event_name: string;
  properties: Record<string, unknown>;
  session_id: string | null;
  platform: string | null;
  app_version: string | null;
  created_at: string;
}

// =====================================================
// VIEW TYPES (backward compatibility)
// =====================================================

export interface EmailThread {
  user_id: string;
  provider: Provider;
  provider_thread_id: string;
  subject: string;
  message_count: number;
  last_message_at: string;
  is_unread: boolean;
  is_starred: boolean;
  labels: string[];
  metadata: {
    participants: string[];
    first_message_at: string;
    snippet: string;
  };
}

// =====================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_seen_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      oauth_tokens: {
        Row: OAuthToken;
        Insert: Omit<OAuthToken, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<OAuthToken, 'id' | 'user_id' | 'created_at'>>;
      };
      emails: {
        Row: Email;
        Insert: Omit<Email, 'id' | 'created_at' | 'updated_at' | 'search_vector'>;
        Update: Partial<Omit<Email, 'id' | 'user_id' | 'provider_message_id' | 'created_at' | 'search_vector'>>;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Contact, 'id' | 'user_id' | 'email' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'user_id' | 'provider_event_id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
      };
      workflows: {
        Row: Workflow;
        Insert: Omit<Workflow, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Omit<Workflow, 'id' | 'user_id' | 'created_at'>>;
      };
      workflow_executions: {
        Row: WorkflowExecution;
        Insert: Omit<WorkflowExecution, 'id' | 'started_at' | 'completed_at'>;
        Update: Partial<Omit<WorkflowExecution, 'id' | 'workflow_id' | 'user_id' | 'started_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'message_count' | 'last_message_at' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'user_id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: never; // Messages are immutable
      };
      user_intelligence: {
        Row: UserIntelligence;
        Insert: Omit<UserIntelligence, 'id' | 'created_at' | 'updated_at' | 'last_used_at' | 'usage_count'>;
        Update: Partial<Omit<UserIntelligence, 'id' | 'user_id' | 'created_at'>>;
      };
      daily_snapshots: {
        Row: DailySnapshot;
        Insert: Omit<DailySnapshot, 'id' | 'generated_at' | 'created_at'>;
        Update: Partial<Omit<DailySnapshot, 'id' | 'user_id' | 'snapshot_date' | 'created_at'>>;
      };
      action_suggestions: {
        Row: ActionSuggestion;
        Insert: Omit<ActionSuggestion, 'id' | 'created_at' | 'updated_at' | 'executed_at' | 'execution_result'>;
        Update: Partial<Omit<ActionSuggestion, 'id' | 'user_id' | 'created_at'>>;
      };
      decisions: {
        Row: Decision;
        Insert: Omit<Decision, 'id' | 'created_at' | 'updated_at' | 'decided_at'>;
        Update: Partial<Omit<Decision, 'id' | 'user_id' | 'created_at'>>;
      };
      events_log: {
        Row: EventLog;
        Insert: Omit<EventLog, 'id' | 'created_at'>;
        Update: never; // Event log is append-only
      };
    };
    Views: {
      email_threads: {
        Row: EmailThread;
      };
    };
    Functions: {
      update_user_last_seen: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}

// =====================================================
// HELPER TYPES
// =====================================================

export type Tables = keyof Database['public']['Tables'];
export type TableRow<T extends Tables> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends Tables> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends Tables> = Database['public']['Tables'][T]['Update'];
