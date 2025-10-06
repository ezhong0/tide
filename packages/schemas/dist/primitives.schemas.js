"use strict";
/**
 * Reusable primitive Zod schemas
 * These are the building blocks for all validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeRangeSchema = exports.PaginationSchema = exports.StatusSchema = exports.PrioritySchema = exports.CalendarProviderSchema = exports.EmailProviderSchema = exports.DurationMinutesSchema = exports.TimeStringSchema = exports.DateTimeStringSchema = exports.TimestampSchema = exports.URLSchema = exports.PhoneNumberSchema = exports.UUIDSchema = exports.EmailSchema = void 0;
exports.ResultSchema = ResultSchema;
exports.safeParse = safeParse;
const zod_1 = require("zod");
// Basic string validations
exports.EmailSchema = zod_1.z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim();
exports.UUIDSchema = zod_1.z
    .string()
    .uuid('Invalid UUID format');
exports.PhoneNumberSchema = zod_1.z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long');
exports.URLSchema = zod_1.z
    .string()
    .url('Invalid URL format');
// Date/Time validations
exports.TimestampSchema = zod_1.z
    .number()
    .int('Timestamp must be an integer')
    .positive('Timestamp must be positive')
    .refine(val => val < 253402300800000, 'Timestamp too far in future'); // Year 10000
exports.DateTimeStringSchema = zod_1.z
    .string()
    .datetime('Invalid datetime format');
exports.TimeStringSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)');
exports.DurationMinutesSchema = zod_1.z
    .number()
    .int('Duration must be in whole minutes')
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours');
// Common enums
exports.EmailProviderSchema = zod_1.z.enum(['gmail', 'outlook', 'icloud', 'custom']);
exports.CalendarProviderSchema = zod_1.z.enum(['google', 'outlook', 'apple', 'caldav']);
exports.PrioritySchema = zod_1.z.enum(['low', 'normal', 'high', 'urgent']);
exports.StatusSchema = zod_1.z.enum(['pending', 'in-progress', 'completed', 'failed']);
// Pagination
exports.PaginationSchema = zod_1.z.object({
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
    orderBy: zod_1.z.string().optional(),
    orderDirection: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Time range
exports.TimeRangeSchema = zod_1.z.object({
    start: exports.TimestampSchema,
    end: exports.TimestampSchema
}).refine(data => data.end > data.start, 'End time must be after start time');
// Result wrapper for error handling
function ResultSchema(dataSchema) {
    return zod_1.z.discriminatedUnion('success', [
        zod_1.z.object({
            success: zod_1.z.literal(true),
            data: dataSchema
        }),
        zod_1.z.object({
            success: zod_1.z.literal(false),
            error: zod_1.z.object({
                message: zod_1.z.string(),
                code: zod_1.z.string().optional(),
                details: zod_1.z.unknown().optional()
            })
        })
    ]);
}
// Safe parsing helper
function safeParse(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        error: result.error
    };
}
//# sourceMappingURL=primitives.schemas.js.map