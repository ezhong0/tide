"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIResponseSchema = exports.CreateConversationSchema = exports.CreateMessageSchema = exports.ConversationSchema = exports.MessageSchema = exports.SuggestedActionSchema = exports.AIIntentSchema = exports.EntitySchema = exports.MessageRoleSchema = void 0;
const zod_1 = require("zod");
/**
 * Message role schema
 */
exports.MessageRoleSchema = zod_1.z.enum(['user', 'assistant', 'system']);
/**
 * AI Intent schema
 */
exports.EntitySchema = zod_1.z.object({
    type: zod_1.z.string(),
    value: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
});
exports.AIIntentSchema = zod_1.z.object({
    type: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    entities: zod_1.z.array(exports.EntitySchema).default([]),
});
/**
 * Suggested action schema
 */
exports.SuggestedActionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    description: zod_1.z.string(),
    preview: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * Message schema
 */
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    conversationId: zod_1.z.string().uuid(),
    content: zod_1.z.string().min(1).max(10000),
    role: exports.MessageRoleSchema,
    intent: exports.AIIntentSchema.optional(),
    actions: zod_1.z.array(exports.SuggestedActionSchema).optional(),
    timestamp: zod_1.z.number().int().positive(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * Conversation schema
 */
exports.ConversationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    title: zod_1.z.string().max(200).optional(),
    messages: zod_1.z.array(exports.MessageSchema).default([]),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * Create message schema
 */
exports.CreateMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    content: zod_1.z.string().min(1).max(10000),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * Create conversation schema
 */
exports.CreateConversationSchema = zod_1.z.object({
    title: zod_1.z.string().max(200).optional(),
    initialMessage: zod_1.z.string().min(1).max(10000).optional(),
});
/**
 * AI Response schema
 */
exports.AIResponseSchema = zod_1.z.object({
    content: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    suggestedActions: zod_1.z.array(exports.SuggestedActionSchema).default([]),
    reasoning: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
