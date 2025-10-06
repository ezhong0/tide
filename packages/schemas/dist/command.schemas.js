"use strict";
/**
 * Command and voice input validation schemas
 * Critical for the AI assistant's primary interface
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchCommandSchema = exports.CommandApprovalSchema = exports.CommandFeedbackSchema = exports.CommandResultSchema = exports.SearchCommandSchema = exports.DraftEmailCommandSchema = exports.ScheduleMeetingCommandSchema = exports.IntentClassificationSchema = exports.CommandIntentSchema = exports.VoiceCommandSchema = void 0;
const zod_1 = require("zod");
const primitives_schemas_1 = require("./primitives.schemas");
// Voice command input - the primary interface
exports.VoiceCommandSchema = zod_1.z.object({
    userId: primitives_schemas_1.UUIDSchema,
    transcript: zod_1.z.string()
        .min(1, 'Command cannot be empty')
        .max(1000, 'Command too long'),
    audioData: zod_1.z.instanceof(Buffer).optional(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    language: zod_1.z.string().length(2).default('en'),
    sessionId: primitives_schemas_1.UUIDSchema.optional(),
    timestamp: primitives_schemas_1.TimestampSchema.optional()
});
// Command intents
exports.CommandIntentSchema = zod_1.z.enum([
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
    'unknown'
]);
// Intent classification result
exports.IntentClassificationSchema = zod_1.z.object({
    primary: exports.CommandIntentSchema,
    confidence: zod_1.z.number().min(0).max(1),
    entities: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        value: zod_1.z.string(),
        position: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
        confidence: zod_1.z.number().min(0).max(1)
    })),
    parameters: zod_1.z.record(zod_1.z.unknown())
});
// Schedule meeting command
exports.ScheduleMeetingCommandSchema = zod_1.z.object({
    participant: primitives_schemas_1.EmailSchema,
    timeframe: zod_1.z.enum(['today', 'tomorrow', 'this_week', 'next_week', 'custom']),
    customDate: primitives_schemas_1.TimestampSchema.optional(),
    duration: zod_1.z.number().int().min(15).max(480).default(30),
    meetingType: zod_1.z.enum(['lunch', 'coffee', 'discussion', 'review', 'standup', 'one-on-one']).optional(),
    location: zod_1.z.string().max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    isVirtual: zod_1.z.boolean().default(false)
}).refine(data => data.timeframe !== 'custom' || data.customDate !== undefined, 'Custom date required when timeframe is custom');
// Draft email command
exports.DraftEmailCommandSchema = zod_1.z.object({
    to: zod_1.z.array(primitives_schemas_1.EmailSchema).min(1).max(20),
    subject: zod_1.z.string().max(200).optional(),
    context: zod_1.z.string().min(1).max(2000),
    tone: zod_1.z.enum(['formal', 'casual', 'friendly', 'professional']).default('professional'),
    urgency: zod_1.z.enum(['low', 'normal', 'high']).default('normal'),
    attachContext: zod_1.z.boolean().default(false)
});
// Search command
exports.SearchCommandSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(500),
    scope: zod_1.z.enum(['emails', 'calendar', 'contacts', 'all']).default('all'),
    dateRange: zod_1.z.enum(['today', 'this_week', 'this_month', 'all_time', 'custom']).default('all_time'),
    customDateRange: zod_1.z.object({
        start: primitives_schemas_1.TimestampSchema,
        end: primitives_schemas_1.TimestampSchema
    }).optional(),
    limit: zod_1.z.number().int().min(1).max(50).default(10)
});
// Command result
exports.CommandResultSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({
        status: zod_1.z.literal('success'),
        commandId: primitives_schemas_1.UUIDSchema,
        result: zod_1.z.unknown(),
        executionTime: zod_1.z.number(),
        confidence: zod_1.z.number().min(0).max(1)
    }),
    zod_1.z.object({
        status: zod_1.z.literal('pending_approval'),
        commandId: primitives_schemas_1.UUIDSchema,
        draft: zod_1.z.unknown(), // Would be specific draft type
        requiresConfirmation: zod_1.z.array(zod_1.z.string()),
        alternatives: zod_1.z.array(zod_1.z.unknown()).optional()
    }),
    zod_1.z.object({
        status: zod_1.z.literal('failed'),
        commandId: primitives_schemas_1.UUIDSchema,
        error: zod_1.z.string(),
        recoverable: zod_1.z.boolean(),
        suggestions: zod_1.z.array(zod_1.z.string()).optional()
    })
]);
// User feedback on command
exports.CommandFeedbackSchema = zod_1.z.object({
    commandId: primitives_schemas_1.UUIDSchema,
    userId: primitives_schemas_1.UUIDSchema,
    rating: zod_1.z.number().int().min(1).max(5),
    helpful: zod_1.z.boolean(),
    correct: zod_1.z.boolean(),
    feedback: zod_1.z.string().max(1000).optional(),
    timestamp: primitives_schemas_1.TimestampSchema
});
// Command approval/rejection
exports.CommandApprovalSchema = zod_1.z.object({
    commandId: primitives_schemas_1.UUIDSchema,
    userId: primitives_schemas_1.UUIDSchema,
    approved: zod_1.z.boolean(),
    modifications: zod_1.z.record(zod_1.z.unknown()).optional(),
    reason: zod_1.z.string().max(500).optional()
});
// Batch command processing
exports.BatchCommandSchema = zod_1.z.object({
    commands: zod_1.z.array(exports.VoiceCommandSchema).min(1).max(10),
    processInParallel: zod_1.z.boolean().default(false),
    stopOnError: zod_1.z.boolean().default(true)
});
//# sourceMappingURL=command.schemas.js.map