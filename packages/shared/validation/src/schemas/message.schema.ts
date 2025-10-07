import { z } from 'zod';

/**
 * Message role schema
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);

/**
 * AI Intent schema
 */
export const EntitySchema = z.object({
  type: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

export const AIIntentSchema = z.object({
  type: z.string(),
  confidence: z.number().min(0).max(1),
  entities: z.array(EntitySchema).default([]),
});

/**
 * Suggested action schema
 */
export const SuggestedActionSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  preview: z.string(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.any()).optional(),
});

/**
 * Message schema
 */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  role: MessageRoleSchema,
  intent: AIIntentSchema.optional(),
  actions: z.array(SuggestedActionSchema).optional(),
  timestamp: z.number().int().positive(),
  metadata: z.record(z.any()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Conversation schema
 */
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().max(200).optional(),
  messages: z.array(MessageSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

/**
 * Create message schema
 */
export const CreateMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  metadata: z.record(z.any()).optional(),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;

/**
 * Create conversation schema
 */
export const CreateConversationSchema = z.object({
  title: z.string().max(200).optional(),
  initialMessage: z.string().min(1).max(10000).optional(),
});

export type CreateConversation = z.infer<typeof CreateConversationSchema>;

/**
 * AI Response schema
 */
export const AIResponseSchema = z.object({
  content: z.string(),
  confidence: z.number().min(0).max(1),
  suggestedActions: z.array(SuggestedActionSchema).default([]),
  reasoning: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;
