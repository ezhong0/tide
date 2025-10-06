/**
 * Reusable primitive Zod schemas
 * These are the building blocks for all validation
 */
import { z } from 'zod';
export declare const EmailSchema: z.ZodString;
export declare const UUIDSchema: z.ZodString;
export declare const PhoneNumberSchema: z.ZodString;
export declare const URLSchema: z.ZodString;
export declare const TimestampSchema: z.ZodEffects<z.ZodNumber, number, number>;
export declare const DateTimeStringSchema: z.ZodString;
export declare const TimeStringSchema: z.ZodString;
export declare const DurationMinutesSchema: z.ZodNumber;
export declare const EmailProviderSchema: z.ZodEnum<["gmail", "outlook", "icloud", "custom"]>;
export declare const CalendarProviderSchema: z.ZodEnum<["google", "outlook", "apple", "caldav"]>;
export declare const PrioritySchema: z.ZodEnum<["low", "normal", "high", "urgent"]>;
export declare const StatusSchema: z.ZodEnum<["pending", "in-progress", "completed", "failed"]>;
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    orderBy: z.ZodOptional<z.ZodString>;
    orderDirection: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    orderDirection: "asc" | "desc";
    orderBy?: string | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    orderBy?: string | undefined;
    orderDirection?: "asc" | "desc" | undefined;
}>;
export declare const TimeRangeSchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodEffects<z.ZodNumber, number, number>;
    end: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    start: number;
    end: number;
}, {
    start: number;
    end: number;
}>, {
    start: number;
    end: number;
}, {
    start: number;
    end: number;
}>;
export declare function ResultSchema<T extends z.ZodType>(dataSchema: T): ReturnType<typeof z.discriminatedUnion>;
export declare function safeParse<T>(schema: z.ZodType<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    error: z.ZodError;
};
//# sourceMappingURL=primitives.schemas.d.ts.map