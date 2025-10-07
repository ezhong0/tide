"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneSchema = exports.DateTimeSchema = exports.URLSchema = exports.UUIDSchema = exports.EmailAddressSchema = exports.PaginatedResponseSchema = exports.PaginationSchema = exports.BaseResponseSchema = exports.ErrorDetailSchema = exports.ResponseMetadataSchema = exports.BaseRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * Base request schema
 */
exports.BaseRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    requestId: zod_1.z.string().uuid(),
    timestamp: zod_1.z.number().int().positive(),
    context: zod_1.z.object({
        userAgent: zod_1.z.string().optional(),
        ipAddress: zod_1.z.string().ip().optional(),
        sessionId: zod_1.z.string().uuid().optional(),
    }).optional(),
});
/**
 * Base response schema
 */
exports.ResponseMetadataSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
    timestamp: zod_1.z.number().int().positive(),
    duration: zod_1.z.number().int().nonnegative(),
});
exports.ErrorDetailSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.any().optional(),
});
exports.BaseResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: exports.ErrorDetailSchema.optional(),
    metadata: exports.ResponseMetadataSchema,
});
/**
 * Pagination schema
 */
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().nonnegative().optional(),
});
const PaginatedResponseSchema = (dataSchema) => zod_1.z.object({
    data: zod_1.z.array(dataSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
});
exports.PaginatedResponseSchema = PaginatedResponseSchema;
/**
 * Common field validators
 */
exports.EmailAddressSchema = zod_1.z.string().email();
exports.UUIDSchema = zod_1.z.string().uuid();
exports.URLSchema = zod_1.z.string().url();
exports.DateTimeSchema = zod_1.z.union([zod_1.z.string().datetime(), zod_1.z.date()]);
exports.PhoneSchema = zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/); // E.164 format
