import { z } from 'zod';

// ============================================================================
// Base Types
// ============================================================================

export const UserIdSchema = z.string().uuid().brand('UserId');
export type UserId = z.infer<typeof UserIdSchema>;

export const RequestIdSchema = z.string().uuid().brand('RequestId');
export type RequestId = z.infer<typeof RequestIdSchema>;

export const ConversationIdSchema = z.string().uuid().brand('ConversationId');
export type ConversationId = z.infer<typeof ConversationIdSchema>;

export const MessageIdSchema = z.string().uuid().brand('MessageId');
export type MessageId = z.infer<typeof MessageIdSchema>;

// ============================================================================
// Request Context
// ============================================================================

export const RequestContextSchema = z.object({
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  deviceId: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  version: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export type RequestContext = z.infer<typeof RequestContextSchema>;

// ============================================================================
// Base Request
// ============================================================================

export const BaseRequestSchema = z.object({
  userId: UserIdSchema,
  requestId: RequestIdSchema,
  timestamp: z.number(),
  context: RequestContextSchema.optional(),
});

export type BaseRequest = z.infer<typeof BaseRequestSchema>;

// ============================================================================
// Intent & Actions
// ============================================================================

export const IntentTypeSchema = z.enum([
  'email.read',
  'email.compose',
  'email.reply',
  'email.triage',
  'calendar.view',
  'calendar.schedule',
  'calendar.reschedule',
  'task.create',
  'task.update',
  'task.complete',
  'conversation.chat',
  'workflow.execute',
  'search.query',
  'analytics.view',
]);

export type IntentType = z.infer<typeof IntentTypeSchema>;

export const IntentSchema = z.object({
  type: IntentTypeSchema,
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.unknown()).optional(),
  entities: z.array(z.object({
    type: z.string(),
    value: z.unknown(),
    confidence: z.number(),
  })).optional(),
});

export type Intent = z.infer<typeof IntentSchema>;

export const ActionTypeSchema = z.enum([
  'send_email',
  'create_event',
  'update_task',
  'execute_workflow',
  'search_documents',
  'summarize_content',
]);

export type ActionType = z.infer<typeof ActionTypeSchema>;

export const ActionSchema = z.object({
  type: ActionTypeSchema,
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  parameters: z.record(z.unknown()),
  result: z.unknown().optional(),
  error: z.string().optional(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
});

export type Action = z.infer<typeof ActionSchema>;

// ============================================================================
// Message Types
// ============================================================================

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  id: MessageIdSchema,
  userId: UserIdSchema,
  conversationId: ConversationIdSchema,
  role: MessageRoleSchema,
  content: z.string(),
  intent: IntentSchema.optional(),
  actions: z.array(ActionSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.number(),
});

export type Message = z.infer<typeof MessageSchema>;

// ============================================================================
// Conversation Types
// ============================================================================

export const ConversationSchema = z.object({
  id: ConversationIdSchema,
  userId: UserIdSchema,
  title: z.string().optional(),
  summary: z.string().optional(),
  messageCount: z.number(),
  lastMessageAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// ============================================================================
// User Types
// ============================================================================

export const UserSchema = z.object({
  id: UserIdSchema,
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string(),
  locale: z.string(),
  settings: z.record(z.unknown()).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastActiveAt: z.number().optional(),
});

export type User = z.infer<typeof UserSchema>;

// ============================================================================
// Event Types
// ============================================================================

export const DomainEventTypeSchema = z.enum([
  'user.created',
  'user.updated',
  'conversation.started',
  'conversation.ended',
  'message.sent',
  'message.received',
  'intent.detected',
  'action.started',
  'action.completed',
  'action.failed',
]);

export type DomainEventType = z.infer<typeof DomainEventTypeSchema>;

export const DomainEventSchema = z.object({
  id: z.string().uuid(),
  type: DomainEventTypeSchema,
  aggregateId: z.string(),
  aggregateType: z.string(),
  payload: z.record(z.unknown()),
  metadata: z.object({
    userId: UserIdSchema.optional(),
    correlationId: z.string().uuid().optional(),
    causationId: z.string().uuid().optional(),
    timestamp: z.number(),
    version: z.number(),
  }),
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;

// ============================================================================
// AI Model Types
// ============================================================================

export const AIModelTierSchema = z.enum(['nano', 'mini', 'standard', 'premium']);
export type AIModelTier = z.infer<typeof AIModelTierSchema>;

export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(['openai', 'anthropic', 'google', 'meta', 'local']),
  tier: AIModelTierSchema,
  capabilities: z.array(z.string()),
  latency: z.number(),
  cost: z.object({
    input: z.number(),
    output: z.number(),
    cache: z.number().optional(),
  }),
  contextWindow: z.number(),
  maxTokens: z.number(),
});

export type AIModel = z.infer<typeof AIModelSchema>;

export const AIRequestSchema = z.object({
  requestId: RequestIdSchema,
  userId: UserIdSchema,
  model: z.string(),
  prompt: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().optional(),
  systemPrompt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

export const AIResponseSchema = z.object({
  requestId: RequestIdSchema,
  model: z.string(),
  content: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
    cachedTokens: z.number().optional(),
  }),
  finishReason: z.enum(['stop', 'length', 'content_filter', 'error']),
  latency: z.number(),
  cost: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// ============================================================================
// Error Types
// ============================================================================

export const ErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
  'RATE_LIMITED',
  'TIMEOUT',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  requestId: RequestIdSchema.optional(),
  timestamp: z.number(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============================================================================
// Pagination Types
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().optional(),
  hasMore: z.boolean().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  data: T[];
  pagination: z.infer<typeof PaginationSchema>;
};
