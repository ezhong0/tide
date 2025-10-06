/**
 * Conversation validation schemas (Module 00)
 * Runtime validation for conversational AI types
 */

import { z } from 'zod';

import {
  UUIDSchema,
  TimestampSchema,
  EmailSchema
} from './primitives.schemas';

// ============================================================================
// Core Conversation Schemas
// ============================================================================

/**
 * Message role in conversation
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);

/**
 * Input method for message
 */
export const InputMethodSchema = z.enum([
  'typed',
  'voice_to_text',
  'button',
  'suggestion'
]);

/**
 * Feedback type for messages
 */
export const FeedbackTypeSchema = z.enum(['helpful', 'not_helpful']);

/**
 * Conversation status
 */
export const ConversationStatusSchema = z.enum([
  'active',
  'idle',
  'completed'
]);

// ============================================================================
// Action & Intent Schemas
// ============================================================================

/**
 * Action types available in the system
 */
export const ActionTypeSchema = z.enum([
  'send_email',
  'schedule_meeting',
  'reschedule_meeting',
  'cancel_meeting',
  'draft_email',
  'search_emails',
  'summarize_thread',
  'create_task',
  'set_reminder',
  'reply_email',
  'forward_email'
]);

/**
 * Intent types for natural language understanding
 */
export const IntentTypeSchema = z.enum([
  'schedule_meeting',
  'draft_email',
  'search_emails',
  'check_calendar',
  'set_reminder',
  'create_task',
  'find_time',
  'reply_email',
  'forward_email',
  'cancel_meeting',
  'reschedule_meeting',
  'summarize_emails',
  'unknown'
]);

/**
 * Risk level for actions
 */
export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);

/**
 * Suggestion types
 */
export const SuggestionTypeSchema = z.enum([
  'quick_reply',
  'action',
  'question',
  'completion'
]);

// ============================================================================
// Entity & Context Schemas
// ============================================================================

/**
 * Person referenced in conversation
 */
export const PersonSchema = z.object({
  userId: UUIDSchema.optional(),
  email: EmailSchema,
  name: z.string().min(1).max(100),
  role: z.string().max(50).optional(),
  relationship: z.enum(['manager', 'direct_report', 'peer', 'client', 'vendor']).optional()
});

/**
 * Date reference in conversation
 */
export const DateRefSchema = z.object({
  timestamp: TimestampSchema,
  description: z.string().min(1).max(200),
  relative: z.string().max(50).optional() // "tomorrow", "next week"
});

/**
 * Meeting in context
 */
export const MeetingSchema = z.object({
  id: UUIDSchema,
  title: z.string().min(1).max(200),
  startTime: TimestampSchema,
  endTime: TimestampSchema,
  attendees: z.array(PersonSchema),
  location: z.string().max(200).optional()
});

/**
 * Task in conversation
 */
export const TaskSchema = z.object({
  id: UUIDSchema,
  description: z.string().min(1).max(500),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional()
});

/**
 * Entity extracted from message
 */
export const EntitySchema = z.object({
  type: z.string().min(1).max(50),
  value: z.string().min(1).max(500),
  position: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
  confidence: z.number().min(0).max(1)
});

/**
 * Ambiguity detected in message
 */
export const AmbiguitySchema = z.object({
  type: z.string().min(1).max(50),
  question: z.string().min(1).max(500),
  options: z.array(z.string().max(200)).optional()
});

// ============================================================================
// Action Schemas
// ============================================================================

/**
 * Action to be performed
 */
export const ActionSchema = z.object({
  type: ActionTypeSchema,
  description: z.string().min(1).max(500),
  params: z.record(z.unknown()),
  requiresConfirmation: z.boolean(),
  riskLevel: RiskLevelSchema.optional()
});

/**
 * Risk assessment for action
 */
export const RiskSchema = z.object({
  level: RiskLevelSchema,
  description: z.string().min(1).max(500),
  mitigation: z.string().max(500).optional()
});

/**
 * Alternative action suggestion
 */
export const AlternativeSchema = z.object({
  description: z.string().min(1).max(300),
  action: ActionTypeSchema,
  params: z.record(z.unknown()).optional()
});

/**
 * Action details for preview
 */
export const ActionDetailsSchema = z.object({
  action: ActionTypeSchema,
  targetResource: z.string().max(200).optional(),
  changes: z.record(z.unknown()),
  affectedItems: z.array(z.string().max(200)).optional()
});

/**
 * Action preview before execution
 */
export const ActionPreviewSchema = z.object({
  summary: z.string().min(1).max(500),
  details: ActionDetailsSchema,
  risks: z.array(RiskSchema).optional(),
  alternatives: z.array(AlternativeSchema).optional(),
  editable: z.boolean(),
  editableFields: z.array(z.string().max(50)).optional()
});

/**
 * Result of action execution
 */
export const ActionResultSchema = z.object({
  success: z.boolean(),
  action: ActionSchema,
  result: z.unknown().optional(),
  error: z.string().max(500).optional(),
  undoable: z.boolean(),
  undoWindow: z.number().int().positive().optional()
});

// ============================================================================
// Suggestion Schemas
// ============================================================================

/**
 * Suggestion for user
 */
export const SuggestionSchema = z.object({
  id: z.string().min(1).max(50),
  text: z.string().min(1).max(200),
  type: SuggestionTypeSchema,
  action: ActionSchema.optional(),
  confidence: z.number().min(0).max(1).optional()
});

// ============================================================================
// Intent & Understanding Schemas
// ============================================================================

/**
 * Classified intent from message
 */
export const IntentSchema = z.object({
  type: IntentTypeSchema,
  confidence: z.number().min(0).max(1),
  params: z.record(z.unknown()).optional()
});

/**
 * Natural language understanding result
 */
export const UnderstandingSchema = z.object({
  intents: z.array(IntentSchema).min(1),
  entities: z.array(EntitySchema),
  ambiguities: z.array(AmbiguitySchema).optional(),
  confidence: z.number().min(0).max(1)
});

// ============================================================================
// Context Schemas
// ============================================================================

/**
 * Conversation context
 */
export const ConversationContextSchema = z.object({
  topic: z.string().max(200).optional(),
  currentTask: TaskSchema.optional(),
  pendingActions: z.array(ActionSchema).optional(),
  mentionedPeople: z.array(PersonSchema),
  mentionedDates: z.array(DateRefSchema),
  mentionedProjects: z.array(z.string().max(100)),
  upcomingMeetings: z.array(MeetingSchema),
  unreadEmails: z.number().int().min(0),
  currentLocation: z.string().max(100).optional()
});

// ============================================================================
// Message Schemas
// ============================================================================

/**
 * Message in conversation
 */
export const MessageSchema = z.object({
  id: UUIDSchema,
  role: MessageRoleSchema,
  content: z.string().min(1).max(10000),
  timestamp: TimestampSchema,
  inputMethod: InputMethodSchema,
  actions: z.array(ActionSchema).optional(),
  suggestions: z.array(SuggestionSchema).optional(),
  preview: ActionPreviewSchema.optional(),
  feedback: FeedbackTypeSchema.optional(),
  edited: z.boolean().optional()
});

/**
 * Conversation
 */
export const ConversationSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  messages: z.array(MessageSchema),
  context: ConversationContextSchema,
  status: ConversationStatusSchema,
  startedAt: TimestampSchema,
  lastActiveAt: TimestampSchema
});

// ============================================================================
// Request/Response Schemas
// ============================================================================

/**
 * Create conversation request
 */
export const CreateConversationRequestSchema = z.object({
  userId: UUIDSchema
});

/**
 * Send message request
 */
export const SendMessageRequestSchema = z.object({
  conversationId: UUIDSchema,
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
  inputMethod: InputMethodSchema
});

/**
 * Process intent request
 */
export const ProcessIntentRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  context: ConversationContextSchema
});

/**
 * Generate action preview request
 */
export const GeneratePreviewRequestSchema = z.object({
  action: ActionSchema,
  userId: UUIDSchema
});

/**
 * Execute action request
 */
export const ExecuteActionRequestSchema = z.object({
  action: ActionSchema,
  userId: UUIDSchema,
  modifications: z.record(z.unknown()).optional()
});

/**
 * Get context request
 */
export const GetContextRequestSchema = z.object({
  conversationId: UUIDSchema
});

/**
 * Update context request
 */
export const UpdateContextRequestSchema = z.object({
  conversationId: UUIDSchema,
  context: ConversationContextSchema.partial()
});

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Card for rich responses
 */
export const CardSchema = z.object({
  type: z.enum(['meeting', 'email', 'task', 'summary', 'action']),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  content: z.string().max(2000).optional(),
  actions: z.array(z.object({
    label: z.string().min(1).max(100),
    action: ActionSchema,
    style: z.enum(['primary', 'secondary', 'destructive']).optional()
  })).optional(),
  metadata: z.record(z.unknown()).optional()
});

/**
 * Message response
 */
export const MessageResponseSchema = z.object({
  messageId: UUIDSchema,
  content: z.string().min(1).max(10000),
  role: MessageRoleSchema,
  actions: z.array(ActionSchema).optional(),
  suggestions: z.array(SuggestionSchema).optional(),
  preview: ActionPreviewSchema.optional(),
  cards: z.array(CardSchema).optional(),
  streamingComplete: z.boolean().optional()
});

/**
 * Conversation response
 */
export const ConversationResponseSchema = z.object({
  conversation: ConversationSchema
});

/**
 * Context response
 */
export const ContextResponseSchema = z.object({
  context: ConversationContextSchema
});

/**
 * Action preview response
 */
export const PreviewResponseSchema = z.object({
  preview: ActionPreviewSchema
});

/**
 * Action execution response
 */
export const ExecutionResponseSchema = z.object({
  result: ActionResultSchema
});

// ============================================================================
// Type Inference Exports
// ============================================================================

export type CreateConversationRequest = z.infer<typeof CreateConversationRequestSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type ProcessIntentRequest = z.infer<typeof ProcessIntentRequestSchema>;
export type GeneratePreviewRequest = z.infer<typeof GeneratePreviewRequestSchema>;
export type ExecuteActionRequest = z.infer<typeof ExecuteActionRequestSchema>;
export type GetContextRequest = z.infer<typeof GetContextRequestSchema>;
export type UpdateContextRequest = z.infer<typeof UpdateContextRequestSchema>;

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
export type ContextResponse = z.infer<typeof ContextResponseSchema>;
export type PreviewResponse = z.infer<typeof PreviewResponseSchema>;
export type ExecutionResponse = z.infer<typeof ExecutionResponseSchema>;
