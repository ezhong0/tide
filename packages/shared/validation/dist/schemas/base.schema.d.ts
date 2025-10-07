import { z } from 'zod';
/**
 * Base request schema
 */
export declare const BaseRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    requestId: z.ZodString;
    timestamp: z.ZodNumber;
    context: z.ZodOptional<z.ZodObject<{
        userAgent: z.ZodOptional<z.ZodString>;
        ipAddress: z.ZodOptional<z.ZodString>;
        sessionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        sessionId?: string | undefined;
    }, {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        sessionId?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    requestId: string;
    timestamp: number;
    context?: {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        sessionId?: string | undefined;
    } | undefined;
}, {
    userId: string;
    requestId: string;
    timestamp: number;
    context?: {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        sessionId?: string | undefined;
    } | undefined;
}>;
export type BaseRequest = z.infer<typeof BaseRequestSchema>;
/**
 * Base response schema
 */
export declare const ResponseMetadataSchema: z.ZodObject<{
    requestId: z.ZodString;
    timestamp: z.ZodNumber;
    duration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    requestId: string;
    timestamp: number;
    duration: number;
}, {
    requestId: string;
    timestamp: number;
    duration: number;
}>;
export declare const ErrorDetailSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    details?: any;
}, {
    code: string;
    message: string;
    details?: any;
}>;
export declare const BaseResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: any;
    }, {
        code: string;
        message: string;
        details?: any;
    }>>;
    metadata: z.ZodObject<{
        requestId: z.ZodString;
        timestamp: z.ZodNumber;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        requestId: string;
        timestamp: number;
        duration: number;
    }, {
        requestId: string;
        timestamp: number;
        duration: number;
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    metadata: {
        requestId: string;
        timestamp: number;
        duration: number;
    };
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
}, {
    success: boolean;
    metadata: {
        requestId: string;
        timestamp: number;
        duration: number;
    };
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
}>;
export type BaseResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: z.infer<typeof ErrorDetailSchema>;
    metadata: z.infer<typeof ResponseMetadataSchema>;
};
/**
 * Pagination schema
 */
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    offset?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type Pagination = z.infer<typeof PaginationSchema>;
export declare const PaginatedResponseSchema: <T extends z.ZodType>(dataSchema: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: T["_output"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}, {
    data: T["_input"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Common field validators
 */
export declare const EmailAddressSchema: z.ZodString;
export declare const UUIDSchema: z.ZodString;
export declare const URLSchema: z.ZodString;
export declare const DateTimeSchema: z.ZodUnion<[z.ZodString, z.ZodDate]>;
export declare const PhoneSchema: z.ZodString;
