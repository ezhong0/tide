/**
 * Command and voice input validation schemas
 * Critical for the AI assistant's primary interface
 */
import { z } from 'zod';
export declare const VoiceCommandSchema: z.ZodObject<{
    userId: z.ZodString;
    transcript: z.ZodString;
    audioData: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
    confidence: z.ZodOptional<z.ZodNumber>;
    language: z.ZodDefault<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    transcript: string;
    language: string;
    audioData?: Buffer<ArrayBufferLike> | undefined;
    confidence?: number | undefined;
    sessionId?: string | undefined;
    timestamp?: number | undefined;
}, {
    userId: string;
    transcript: string;
    audioData?: Buffer<ArrayBufferLike> | undefined;
    confidence?: number | undefined;
    language?: string | undefined;
    sessionId?: string | undefined;
    timestamp?: number | undefined;
}>;
export declare const CommandIntentSchema: z.ZodEnum<["schedule_meeting", "draft_email", "search_emails", "check_calendar", "set_reminder", "create_task", "find_time", "reply_email", "forward_email", "cancel_meeting", "reschedule_meeting", "unknown"]>;
export declare const IntentClassificationSchema: z.ZodObject<{
    primary: z.ZodEnum<["schedule_meeting", "draft_email", "search_emails", "check_calendar", "set_reminder", "create_task", "find_time", "reply_email", "forward_email", "cancel_meeting", "reschedule_meeting", "unknown"]>;
    confidence: z.ZodNumber;
    entities: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        value: z.ZodString;
        position: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
        confidence: number;
        position: [number, number];
    }, {
        value: string;
        type: string;
        confidence: number;
        position: [number, number];
    }>, "many">;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    primary: "unknown" | "schedule_meeting" | "draft_email" | "search_emails" | "check_calendar" | "set_reminder" | "create_task" | "find_time" | "reply_email" | "forward_email" | "cancel_meeting" | "reschedule_meeting";
    entities: {
        value: string;
        type: string;
        confidence: number;
        position: [number, number];
    }[];
    parameters: Record<string, unknown>;
}, {
    confidence: number;
    primary: "unknown" | "schedule_meeting" | "draft_email" | "search_emails" | "check_calendar" | "set_reminder" | "create_task" | "find_time" | "reply_email" | "forward_email" | "cancel_meeting" | "reschedule_meeting";
    entities: {
        value: string;
        type: string;
        confidence: number;
        position: [number, number];
    }[];
    parameters: Record<string, unknown>;
}>;
export declare const ScheduleMeetingCommandSchema: z.ZodEffects<z.ZodObject<{
    participant: z.ZodString;
    timeframe: z.ZodEnum<["today", "tomorrow", "this_week", "next_week", "custom"]>;
    customDate: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    duration: z.ZodDefault<z.ZodNumber>;
    meetingType: z.ZodOptional<z.ZodEnum<["lunch", "coffee", "discussion", "review", "standup", "one-on-one"]>>;
    location: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isVirtual: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    participant: string;
    timeframe: "custom" | "today" | "tomorrow" | "this_week" | "next_week";
    isVirtual: boolean;
    description?: string | undefined;
    location?: string | undefined;
    customDate?: number | undefined;
    meetingType?: "lunch" | "coffee" | "discussion" | "review" | "standup" | "one-on-one" | undefined;
}, {
    participant: string;
    timeframe: "custom" | "today" | "tomorrow" | "this_week" | "next_week";
    description?: string | undefined;
    location?: string | undefined;
    duration?: number | undefined;
    customDate?: number | undefined;
    meetingType?: "lunch" | "coffee" | "discussion" | "review" | "standup" | "one-on-one" | undefined;
    isVirtual?: boolean | undefined;
}>, {
    duration: number;
    participant: string;
    timeframe: "custom" | "today" | "tomorrow" | "this_week" | "next_week";
    isVirtual: boolean;
    description?: string | undefined;
    location?: string | undefined;
    customDate?: number | undefined;
    meetingType?: "lunch" | "coffee" | "discussion" | "review" | "standup" | "one-on-one" | undefined;
}, {
    participant: string;
    timeframe: "custom" | "today" | "tomorrow" | "this_week" | "next_week";
    description?: string | undefined;
    location?: string | undefined;
    duration?: number | undefined;
    customDate?: number | undefined;
    meetingType?: "lunch" | "coffee" | "discussion" | "review" | "standup" | "one-on-one" | undefined;
    isVirtual?: boolean | undefined;
}>;
export declare const DraftEmailCommandSchema: z.ZodObject<{
    to: z.ZodArray<z.ZodString, "many">;
    subject: z.ZodOptional<z.ZodString>;
    context: z.ZodString;
    tone: z.ZodDefault<z.ZodEnum<["formal", "casual", "friendly", "professional"]>>;
    urgency: z.ZodDefault<z.ZodEnum<["low", "normal", "high"]>>;
    attachContext: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    to: string[];
    context: string;
    tone: "formal" | "casual" | "friendly" | "professional";
    urgency: "low" | "normal" | "high";
    attachContext: boolean;
    subject?: string | undefined;
}, {
    to: string[];
    context: string;
    subject?: string | undefined;
    tone?: "formal" | "casual" | "friendly" | "professional" | undefined;
    urgency?: "low" | "normal" | "high" | undefined;
    attachContext?: boolean | undefined;
}>;
export declare const SearchCommandSchema: z.ZodObject<{
    query: z.ZodString;
    scope: z.ZodDefault<z.ZodEnum<["emails", "calendar", "contacts", "all"]>>;
    dateRange: z.ZodDefault<z.ZodEnum<["today", "this_week", "this_month", "all_time", "custom"]>>;
    customDateRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodEffects<z.ZodNumber, number, number>;
        end: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    scope: "emails" | "calendar" | "contacts" | "all";
    dateRange: "custom" | "today" | "this_week" | "this_month" | "all_time";
    customDateRange?: {
        start: number;
        end: number;
    } | undefined;
}, {
    query: string;
    limit?: number | undefined;
    scope?: "emails" | "calendar" | "contacts" | "all" | undefined;
    dateRange?: "custom" | "today" | "this_week" | "this_month" | "all_time" | undefined;
    customDateRange?: {
        start: number;
        end: number;
    } | undefined;
}>;
export declare const CommandResultSchema: z.ZodDiscriminatedUnion<"status", [z.ZodObject<{
    status: z.ZodLiteral<"success">;
    commandId: z.ZodString;
    result: z.ZodUnknown;
    executionTime: z.ZodNumber;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "success";
    confidence: number;
    commandId: string;
    executionTime: number;
    result?: unknown;
}, {
    status: "success";
    confidence: number;
    commandId: string;
    executionTime: number;
    result?: unknown;
}>, z.ZodObject<{
    status: z.ZodLiteral<"pending_approval">;
    commandId: z.ZodString;
    draft: z.ZodUnknown;
    requiresConfirmation: z.ZodArray<z.ZodString, "many">;
    alternatives: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "pending_approval";
    commandId: string;
    requiresConfirmation: string[];
    draft?: unknown;
    alternatives?: unknown[] | undefined;
}, {
    status: "pending_approval";
    commandId: string;
    requiresConfirmation: string[];
    draft?: unknown;
    alternatives?: unknown[] | undefined;
}>, z.ZodObject<{
    status: z.ZodLiteral<"failed">;
    commandId: z.ZodString;
    error: z.ZodString;
    recoverable: z.ZodBoolean;
    suggestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "failed";
    error: string;
    commandId: string;
    recoverable: boolean;
    suggestions?: string[] | undefined;
}, {
    status: "failed";
    error: string;
    commandId: string;
    recoverable: boolean;
    suggestions?: string[] | undefined;
}>]>;
export declare const CommandFeedbackSchema: z.ZodObject<{
    commandId: z.ZodString;
    userId: z.ZodString;
    rating: z.ZodNumber;
    helpful: z.ZodBoolean;
    correct: z.ZodBoolean;
    feedback: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    timestamp: number;
    commandId: string;
    rating: number;
    helpful: boolean;
    correct: boolean;
    feedback?: string | undefined;
}, {
    userId: string;
    timestamp: number;
    commandId: string;
    rating: number;
    helpful: boolean;
    correct: boolean;
    feedback?: string | undefined;
}>;
export declare const CommandApprovalSchema: z.ZodObject<{
    commandId: z.ZodString;
    userId: z.ZodString;
    approved: z.ZodBoolean;
    modifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    commandId: string;
    approved: boolean;
    reason?: string | undefined;
    modifications?: Record<string, unknown> | undefined;
}, {
    userId: string;
    commandId: string;
    approved: boolean;
    reason?: string | undefined;
    modifications?: Record<string, unknown> | undefined;
}>;
export declare const BatchCommandSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        transcript: z.ZodString;
        audioData: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
        confidence: z.ZodOptional<z.ZodNumber>;
        language: z.ZodDefault<z.ZodString>;
        sessionId: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        transcript: string;
        language: string;
        audioData?: Buffer<ArrayBufferLike> | undefined;
        confidence?: number | undefined;
        sessionId?: string | undefined;
        timestamp?: number | undefined;
    }, {
        userId: string;
        transcript: string;
        audioData?: Buffer<ArrayBufferLike> | undefined;
        confidence?: number | undefined;
        language?: string | undefined;
        sessionId?: string | undefined;
        timestamp?: number | undefined;
    }>, "many">;
    processInParallel: z.ZodDefault<z.ZodBoolean>;
    stopOnError: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    commands: {
        userId: string;
        transcript: string;
        language: string;
        audioData?: Buffer<ArrayBufferLike> | undefined;
        confidence?: number | undefined;
        sessionId?: string | undefined;
        timestamp?: number | undefined;
    }[];
    processInParallel: boolean;
    stopOnError: boolean;
}, {
    commands: {
        userId: string;
        transcript: string;
        audioData?: Buffer<ArrayBufferLike> | undefined;
        confidence?: number | undefined;
        language?: string | undefined;
        sessionId?: string | undefined;
        timestamp?: number | undefined;
    }[];
    processInParallel?: boolean | undefined;
    stopOnError?: boolean | undefined;
}>;
//# sourceMappingURL=command.schemas.d.ts.map