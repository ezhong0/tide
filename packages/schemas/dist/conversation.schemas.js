"use strict";
/**
 * Conversation validation schemas (Module 00)
 * Runtime validation for conversational AI types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionResponseSchema = exports.PreviewResponseSchema = exports.ContextResponseSchema = exports.ConversationResponseSchema = exports.MessageResponseSchema = exports.CardSchema = exports.UpdateContextRequestSchema = exports.GetContextRequestSchema = exports.ExecuteActionRequestSchema = exports.GeneratePreviewRequestSchema = exports.ProcessIntentRequestSchema = exports.SendMessageRequestSchema = exports.CreateConversationRequestSchema = exports.ConversationSchema = exports.MessageSchema = exports.ConversationContextSchema = exports.UnderstandingSchema = exports.IntentSchema = exports.SuggestionSchema = exports.ActionResultSchema = exports.ActionPreviewSchema = exports.ActionDetailsSchema = exports.AlternativeSchema = exports.RiskSchema = exports.ActionSchema = exports.AmbiguitySchema = exports.EntitySchema = exports.TaskSchema = exports.MeetingSchema = exports.DateRefSchema = exports.PersonSchema = exports.SuggestionTypeSchema = exports.RiskLevelSchema = exports.IntentTypeSchema = exports.ActionTypeSchema = exports.ConversationStatusSchema = exports.FeedbackTypeSchema = exports.InputMethodSchema = exports.MessageRoleSchema = void 0;
const zod_1 = require("zod");
const primitives_schemas_1 = require("./primitives.schemas");
// ============================================================================
// Core Conversation Schemas
// ============================================================================
/**
 * Message role in conversation
 */
exports.MessageRoleSchema = zod_1.z.enum(['user', 'assistant', 'system']);
/**
 * Input method for message
 */
exports.InputMethodSchema = zod_1.z.enum([
    'typed',
    'voice_to_text',
    'button',
    'suggestion'
]);
/**
 * Feedback type for messages
 */
exports.FeedbackTypeSchema = zod_1.z.enum(['helpful', 'not_helpful']);
/**
 * Conversation status
 */
exports.ConversationStatusSchema = zod_1.z.enum([
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
exports.ActionTypeSchema = zod_1.z.enum([
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
exports.IntentTypeSchema = zod_1.z.enum([
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
exports.RiskLevelSchema = zod_1.z.enum(['low', 'medium', 'high']);
/**
 * Suggestion types
 */
exports.SuggestionTypeSchema = zod_1.z.enum([
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
exports.PersonSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema.optional(),
    email: primitives_schemas_1.EmailSchema,
    name: zod_1.z.string().min(1).max(100),
    role: zod_1.z.string().max(50).optional(),
    relationship: zod_1.z.enum(['manager', 'direct_report', 'peer', 'client', 'vendor']).optional()
});
/**
 * Date reference in conversation
 */
exports.DateRefSchema = zod_1.z.object({
    timestamp: primitives_schemas_1.TimestampSchema,
    description: zod_1.z.string().min(1).max(200),
    relative: zod_1.z.string().max(50).optional() // "tomorrow", "next week"
});
/**
 * Meeting in context
 */
exports.MeetingSchema = zod_1.z.object({
    id: primitives_schemas_1.UUIDSchema,
    title: zod_1.z.string().min(1).max(200),
    startTime: primitives_schemas_1.TimestampSchema,
    endTime: primitives_schemas_1.TimestampSchema,
    attendees: zod_1.z.array(exports.PersonSchema),
    location: zod_1.z.string().max(200).optional()
});
/**
 * Task in conversation
 */
exports.TaskSchema = zod_1.z.object({
    id: primitives_schemas_1.UUIDSchema,
    description: zod_1.z.string().min(1).max(500),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).optional()
});
/**
 * Entity extracted from message
 */
exports.EntitySchema = zod_1.z.object({
    type: zod_1.z.string().min(1).max(50),
    value: zod_1.z.string().min(1).max(500),
    position: zod_1.z.tuple([zod_1.z.number().int().min(0), zod_1.z.number().int().min(0)]),
    confidence: zod_1.z.number().min(0).max(1)
});
/**
 * Ambiguity detected in message
 */
exports.AmbiguitySchema = zod_1.z.object({
    type: zod_1.z.string().min(1).max(50),
    question: zod_1.z.string().min(1).max(500),
    options: zod_1.z.array(zod_1.z.string().max(200)).optional()
});
// ============================================================================
// Action Schemas
// ============================================================================
/**
 * Action to be performed
 */
exports.ActionSchema = zod_1.z.object({
    type: exports.ActionTypeSchema,
    description: zod_1.z.string().min(1).max(500),
    params: zod_1.z.record(zod_1.z.unknown()),
    requiresConfirmation: zod_1.z.boolean(),
    riskLevel: exports.RiskLevelSchema.optional()
});
/**
 * Risk assessment for action
 */
exports.RiskSchema = zod_1.z.object({
    level: exports.RiskLevelSchema,
    description: zod_1.z.string().min(1).max(500),
    mitigation: zod_1.z.string().max(500).optional()
});
/**
 * Alternative action suggestion
 */
exports.AlternativeSchema = zod_1.z.object({
    description: zod_1.z.string().min(1).max(300),
    action: exports.ActionTypeSchema,
    params: zod_1.z.record(zod_1.z.unknown()).optional()
});
/**
 * Action details for preview
 */
exports.ActionDetailsSchema = zod_1.z.object({
    action: exports.ActionTypeSchema,
    targetResource: zod_1.z.string().max(200).optional(),
    changes: zod_1.z.record(zod_1.z.unknown()),
    affectedItems: zod_1.z.array(zod_1.z.string().max(200)).optional()
});
/**
 * Action preview before execution
 */
exports.ActionPreviewSchema = zod_1.z.object({
    summary: zod_1.z.string().min(1).max(500),
    details: exports.ActionDetailsSchema,
    risks: zod_1.z.array(exports.RiskSchema).optional(),
    alternatives: zod_1.z.array(exports.AlternativeSchema).optional(),
    editable: zod_1.z.boolean(),
    editableFields: zod_1.z.array(zod_1.z.string().max(50)).optional()
});
/**
 * Result of action execution
 */
exports.ActionResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: exports.ActionSchema,
    result: zod_1.z.unknown().optional(),
    error: zod_1.z.string().max(500).optional(),
    undoable: zod_1.z.boolean(),
    undoWindow: zod_1.z.number().int().positive().optional()
});
// ============================================================================
// Suggestion Schemas
// ============================================================================
/**
 * Suggestion for user
 */
exports.SuggestionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1).max(50),
    text: zod_1.z.string().min(1).max(200),
    type: exports.SuggestionTypeSchema,
    action: exports.ActionSchema.optional(),
    confidence: zod_1.z.number().min(0).max(1).optional()
});
// ============================================================================
// Intent & Understanding Schemas
// ============================================================================
/**
 * Classified intent from message
 */
exports.IntentSchema = zod_1.z.object({
    type: exports.IntentTypeSchema,
    confidence: zod_1.z.number().min(0).max(1),
    params: zod_1.z.record(zod_1.z.unknown()).optional()
});
/**
 * Natural language understanding result
 */
exports.UnderstandingSchema = zod_1.z.object({
    intents: zod_1.z.array(exports.IntentSchema).min(1),
    entities: zod_1.z.array(exports.EntitySchema),
    ambiguities: zod_1.z.array(exports.AmbiguitySchema).optional(),
    confidence: zod_1.z.number().min(0).max(1)
});
// ============================================================================
// Context Schemas
// ============================================================================
/**
 * Conversation context
 */
exports.ConversationContextSchema = zod_1.z.object({
    topic: zod_1.z.string().max(200).optional(),
    currentTask: exports.TaskSchema.optional(),
    pendingActions: zod_1.z.array(exports.ActionSchema).optional(),
    mentionedPeople: zod_1.z.array(exports.PersonSchema),
    mentionedDates: zod_1.z.array(exports.DateRefSchema),
    mentionedProjects: zod_1.z.array(zod_1.z.string().max(100)),
    upcomingMeetings: zod_1.z.array(exports.MeetingSchema),
    unreadEmails: zod_1.z.number().int().min(0),
    currentLocation: zod_1.z.string().max(100).optional()
});
// ============================================================================
// Message Schemas
// ============================================================================
/**
 * Message in conversation
 */
exports.MessageSchema = zod_1.z.object({
    id: primitives_schemas_1.UUIDSchema,
    role: exports.MessageRoleSchema,
    content: zod_1.z.string().min(1).max(10000),
    timestamp: primitives_schemas_1.TimestampSchema,
    inputMethod: exports.InputMethodSchema,
    actions: zod_1.z.array(exports.ActionSchema).optional(),
    suggestions: zod_1.z.array(exports.SuggestionSchema).optional(),
    preview: exports.ActionPreviewSchema.optional(),
    feedback: exports.FeedbackTypeSchema.optional(),
    edited: zod_1.z.boolean().optional()
});
/**
 * Conversation
 */
exports.ConversationSchema = zod_1.z.object({
    id: primitives_schemas_1.UUIDSchema,
    userId: primitives_schemas_1.UUIDSchema,
    messages: zod_1.z.array(exports.MessageSchema),
    context: exports.ConversationContextSchema,
    status: exports.ConversationStatusSchema,
    startedAt: primitives_schemas_1.TimestampSchema,
    lastActiveAt: primitives_schemas_1.TimestampSchema
});
// ============================================================================
// Request/Response Schemas
// ============================================================================
/**
 * Create conversation request
 */
exports.CreateConversationRequestSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema
});
/**
 * Send message request
 */
exports.SendMessageRequestSchema = zod_1.z.object({
    conversationId: primitives_schemas_1.UUIDSchema,
    message: zod_1.z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
    inputMethod: exports.InputMethodSchema
});
/**
 * Process intent request
 */
exports.ProcessIntentRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(10000),
    context: exports.ConversationContextSchema
});
/**
 * Generate action preview request
 */
exports.GeneratePreviewRequestSchema = zod_1.z.object({
    action: exports.ActionSchema,
    userId: primitives_schemas_1.UUIDSchema
});
/**
 * Execute action request
 */
exports.ExecuteActionRequestSchema = zod_1.z.object({
    action: exports.ActionSchema,
    userId: primitives_schemas_1.UUIDSchema,
    modifications: zod_1.z.record(zod_1.z.unknown()).optional()
});
/**
 * Get context request
 */
exports.GetContextRequestSchema = zod_1.z.object({
    conversationId: primitives_schemas_1.UUIDSchema
});
/**
 * Update context request
 */
exports.UpdateContextRequestSchema = zod_1.z.object({
    conversationId: primitives_schemas_1.UUIDSchema,
    context: exports.ConversationContextSchema.partial()
});
// ============================================================================
// Response Schemas
// ============================================================================
/**
 * Card for rich responses
 */
exports.CardSchema = zod_1.z.object({
    type: zod_1.z.enum(['meeting', 'email', 'task', 'summary', 'action']),
    title: zod_1.z.string().min(1).max(200),
    subtitle: zod_1.z.string().max(200).optional(),
    content: zod_1.z.string().max(2000).optional(),
    actions: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string().min(1).max(100),
        action: exports.ActionSchema,
        style: zod_1.z.enum(['primary', 'secondary', 'destructive']).optional()
    })).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional()
});
/**
 * Message response
 */
exports.MessageResponseSchema = zod_1.z.object({
    messageId: primitives_schemas_1.UUIDSchema,
    content: zod_1.z.string().min(1).max(10000),
    role: exports.MessageRoleSchema,
    actions: zod_1.z.array(exports.ActionSchema).optional(),
    suggestions: zod_1.z.array(exports.SuggestionSchema).optional(),
    preview: exports.ActionPreviewSchema.optional(),
    cards: zod_1.z.array(exports.CardSchema).optional(),
    streamingComplete: zod_1.z.boolean().optional()
});
/**
 * Conversation response
 */
exports.ConversationResponseSchema = zod_1.z.object({
    conversation: exports.ConversationSchema
});
/**
 * Context response
 */
exports.ContextResponseSchema = zod_1.z.object({
    context: exports.ConversationContextSchema
});
/**
 * Action preview response
 */
exports.PreviewResponseSchema = zod_1.z.object({
    preview: exports.ActionPreviewSchema
});
/**
 * Action execution response
 */
exports.ExecutionResponseSchema = zod_1.z.object({
    result: exports.ActionResultSchema
});
//# sourceMappingURL=conversation.schemas.js.map