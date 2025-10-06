/**
 * Commands API Contracts
 *
 * Zod schemas for all command processing endpoints
 */
import { z } from 'zod';
export declare const ProcessCommandRequestSchema: z.ZodObject<{
    transcript: z.ZodString;
    audioFileUrl: z.ZodOptional<z.ZodString>;
    deviceType: z.ZodEnum<["ios", "android", "web"]>;
    appVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    transcript: string;
    deviceType: "ios" | "android" | "web";
    appVersion: string;
    audioFileUrl?: string | undefined;
}, {
    transcript: string;
    deviceType: "ios" | "android" | "web";
    appVersion: string;
    audioFileUrl?: string | undefined;
}>;
export declare const GetCommandRequestSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const GetCommandsRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed" | undefined;
}, {
    status?: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const ApproveCommandRequestSchema: z.ZodObject<{
    commandId: z.ZodString;
    edits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        originalValue: z.ZodUnknown;
        newValue: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        field: string;
        originalValue?: unknown;
        newValue?: unknown;
    }, {
        field: string;
        originalValue?: unknown;
        newValue?: unknown;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    edits?: {
        field: string;
        originalValue?: unknown;
        newValue?: unknown;
    }[] | undefined;
}, {
    commandId: string;
    edits?: {
        field: string;
        originalValue?: unknown;
        newValue?: unknown;
    }[] | undefined;
}>;
export declare const RejectCommandRequestSchema: z.ZodObject<{
    commandId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    reason?: string | undefined;
}, {
    commandId: string;
    reason?: string | undefined;
}>;
export declare const CancelCommandRequestSchema: z.ZodObject<{
    commandId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
}, {
    commandId: string;
}>;
export declare const ProvideCommandFeedbackRequestSchema: z.ZodObject<{
    commandId: z.ZodString;
    feedbackType: z.ZodEnum<["approve", "edit", "reject", "rating"]>;
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    changes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        originalValue: z.ZodUnknown;
        newValue: z.ZodUnknown;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        reason?: string | undefined;
        originalValue?: unknown;
        newValue?: unknown;
    }, {
        field: string;
        reason?: string | undefined;
        originalValue?: unknown;
        newValue?: unknown;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    feedbackType: "approve" | "edit" | "reject" | "rating";
    comment?: string | undefined;
    rating?: number | undefined;
    changes?: {
        field: string;
        reason?: string | undefined;
        originalValue?: unknown;
        newValue?: unknown;
    }[] | undefined;
}, {
    commandId: string;
    feedbackType: "approve" | "edit" | "reject" | "rating";
    comment?: string | undefined;
    rating?: number | undefined;
    changes?: {
        field: string;
        reason?: string | undefined;
        originalValue?: unknown;
        newValue?: unknown;
    }[] | undefined;
}>;
export declare const DraftContentSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"email">;
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    body: z.ZodString;
    tone: z.ZodString;
    replyToThreadId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "email";
    to: string[];
    subject: string;
    body: string;
    tone: string;
    cc?: string[] | undefined;
    replyToThreadId?: string | undefined;
}, {
    type: "email";
    to: string[];
    subject: string;
    body: string;
    tone: string;
    cc?: string[] | undefined;
    replyToThreadId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"meeting_request">;
    title: z.ZodString;
    participants: z.ZodArray<z.ZodString, "many">;
    proposedTimes: z.ZodArray<z.ZodString, "many">;
    duration: z.ZodNumber;
    location: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    conferenceType: z.ZodOptional<z.ZodEnum<["zoom", "meet", "teams"]>>;
}, "strip", z.ZodTypeAny, {
    type: "meeting_request";
    title: string;
    participants: string[];
    proposedTimes: string[];
    duration: number;
    description?: string | undefined;
    location?: string | undefined;
    conferenceType?: "zoom" | "meet" | "teams" | undefined;
}, {
    type: "meeting_request";
    title: string;
    participants: string[];
    proposedTimes: string[];
    duration: number;
    description?: string | undefined;
    location?: string | undefined;
    conferenceType?: "zoom" | "meet" | "teams" | undefined;
}>]>;
export declare const CommandSchema: z.ZodObject<{
    id: z.ZodString;
    transcript: z.ZodString;
    intent: z.ZodString;
    intentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    confidence: z.ZodNumber;
    status: z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error: z.ZodOptional<z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    }, {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    }>>;
    timestamp: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
    id: string;
    transcript: string;
    intent: string;
    intentData: Record<string, unknown>;
    confidence: number;
    timestamp: string;
    result?: Record<string, unknown> | undefined;
    error?: {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    } | undefined;
    completedAt?: string | undefined;
}, {
    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
    id: string;
    transcript: string;
    intent: string;
    intentData: Record<string, unknown>;
    confidence: number;
    timestamp: string;
    result?: Record<string, unknown> | undefined;
    error?: {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    } | undefined;
    completedAt?: string | undefined;
}>;
export declare const ProcessCommandResponseSchema: z.ZodObject<{
    commandId: z.ZodString;
    status: z.ZodEnum<["pending_approval", "processing", "completed", "failed"]>;
    intent: z.ZodString;
    confidence: z.ZodNumber;
    draft: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"email">;
        to: z.ZodArray<z.ZodString, "many">;
        cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        subject: z.ZodString;
        body: z.ZodString;
        tone: z.ZodString;
        replyToThreadId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "email";
        to: string[];
        subject: string;
        body: string;
        tone: string;
        cc?: string[] | undefined;
        replyToThreadId?: string | undefined;
    }, {
        type: "email";
        to: string[];
        subject: string;
        body: string;
        tone: string;
        cc?: string[] | undefined;
        replyToThreadId?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"meeting_request">;
        title: z.ZodString;
        participants: z.ZodArray<z.ZodString, "many">;
        proposedTimes: z.ZodArray<z.ZodString, "many">;
        duration: z.ZodNumber;
        location: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        conferenceType: z.ZodOptional<z.ZodEnum<["zoom", "meet", "teams"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "meeting_request";
        title: string;
        participants: string[];
        proposedTimes: string[];
        duration: number;
        description?: string | undefined;
        location?: string | undefined;
        conferenceType?: "zoom" | "meet" | "teams" | undefined;
    }, {
        type: "meeting_request";
        title: string;
        participants: string[];
        proposedTimes: string[];
        duration: number;
        description?: string | undefined;
        location?: string | undefined;
        conferenceType?: "zoom" | "meet" | "teams" | undefined;
    }>]>>;
    message: z.ZodOptional<z.ZodString>;
    requiresApproval: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "processing" | "pending_approval" | "completed" | "failed";
    commandId: string;
    intent: string;
    confidence: number;
    requiresApproval: boolean;
    message?: string | undefined;
    draft?: {
        type: "email";
        to: string[];
        subject: string;
        body: string;
        tone: string;
        cc?: string[] | undefined;
        replyToThreadId?: string | undefined;
    } | {
        type: "meeting_request";
        title: string;
        participants: string[];
        proposedTimes: string[];
        duration: number;
        description?: string | undefined;
        location?: string | undefined;
        conferenceType?: "zoom" | "meet" | "teams" | undefined;
    } | undefined;
}, {
    status: "processing" | "pending_approval" | "completed" | "failed";
    commandId: string;
    intent: string;
    confidence: number;
    requiresApproval: boolean;
    message?: string | undefined;
    draft?: {
        type: "email";
        to: string[];
        subject: string;
        body: string;
        tone: string;
        cc?: string[] | undefined;
        replyToThreadId?: string | undefined;
    } | {
        type: "meeting_request";
        title: string;
        participants: string[];
        proposedTimes: string[];
        duration: number;
        description?: string | undefined;
        location?: string | undefined;
        conferenceType?: "zoom" | "meet" | "teams" | undefined;
    } | undefined;
}>;
export declare const GetCommandResponseSchema: z.ZodObject<{
    id: z.ZodString;
    transcript: z.ZodString;
    intent: z.ZodString;
    intentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    confidence: z.ZodNumber;
    status: z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error: z.ZodOptional<z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    }, {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    }>>;
    timestamp: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
    id: string;
    transcript: string;
    intent: string;
    intentData: Record<string, unknown>;
    confidence: number;
    timestamp: string;
    result?: Record<string, unknown> | undefined;
    error?: {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    } | undefined;
    completedAt?: string | undefined;
}, {
    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
    id: string;
    transcript: string;
    intent: string;
    intentData: Record<string, unknown>;
    confidence: number;
    timestamp: string;
    result?: Record<string, unknown> | undefined;
    error?: {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    } | undefined;
    completedAt?: string | undefined;
}>;
export declare const GetCommandsResponseSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        transcript: z.ZodString;
        intent: z.ZodString;
        intentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        confidence: z.ZodNumber;
        status: z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
        result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        error: z.ZodOptional<z.ZodObject<{
            message: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            code?: string | undefined;
            details?: Record<string, unknown> | undefined;
        }, {
            message: string;
            code?: string | undefined;
            details?: Record<string, unknown> | undefined;
        }>>;
        timestamp: z.ZodString;
        completedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
        id: string;
        transcript: string;
        intent: string;
        intentData: Record<string, unknown>;
        confidence: number;
        timestamp: string;
        result?: Record<string, unknown> | undefined;
        error?: {
            message: string;
            code?: string | undefined;
            details?: Record<string, unknown> | undefined;
        } | undefined;
        completedAt?: string | undefined;
    }, {
        status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
        id: string;
        transcript: string;
        intent: string;
        intentData: Record<string, unknown>;
        confidence: number;
        timestamp: string;
        result?: Record<string, unknown> | undefined;
        error?: {
            message: string;
            code?: string | undefined;
            details?: Record<string, unknown> | undefined;
        } | undefined;
        completedAt?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    total: number;
    hasMore: boolean;
    commands: {
        status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
        id: string;
        transcript: string;
        intent: string;
        intentData: Record<string, unknown>;
        confidence: number;
        timestamp: string;
        result?: Record<string, unknown> | undefined;
        error?: {
            message: string;
            code?: string | undefined;
            details?: Record<string, unknown> | undefined;
        } | undefined;
        completedAt?: string | undefined;
    }[];
}, {
    limit: number;
    page: number;
    total: number;
    hasMore: boolean;
    commands: {
        status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
        id: string;
        transcript: string;
        intent: string;
        intentData: Record<string, unknown>;
        confidence: number;
        timestamp: string;
        result?: Record<string, unknown> | undefined;
        error?: {
            message: string;
            code?: string | undefined;
            details?: Record<string, unknown> | undefined;
        } | undefined;
        completedAt?: string | undefined;
    }[];
}>;
export declare const ApproveCommandResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    commandId: z.ZodString;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    commandId: string;
    result?: Record<string, unknown> | undefined;
}, {
    message: string;
    success: boolean;
    commandId: string;
    result?: Record<string, unknown> | undefined;
}>;
export declare const RejectCommandResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    commandId: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    commandId: string;
}, {
    message: string;
    success: boolean;
    commandId: string;
}>;
export declare const CancelCommandResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    commandId: z.ZodString;
    cancelledAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    commandId: string;
    cancelledAt: string;
}, {
    success: boolean;
    commandId: string;
    cancelledAt: string;
}>;
export declare const ProvideCommandFeedbackResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    feedbackId: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    feedbackId: string;
}, {
    message: string;
    success: boolean;
    feedbackId: string;
}>;
export type ProcessCommandRequest = z.infer<typeof ProcessCommandRequestSchema>;
export type ProcessCommandResponse = z.infer<typeof ProcessCommandResponseSchema>;
export type GetCommandRequest = z.infer<typeof GetCommandRequestSchema>;
export type GetCommandResponse = z.infer<typeof GetCommandResponseSchema>;
export type GetCommandsRequest = z.infer<typeof GetCommandsRequestSchema>;
export type GetCommandsResponse = z.infer<typeof GetCommandsResponseSchema>;
export type ApproveCommandRequest = z.infer<typeof ApproveCommandRequestSchema>;
export type ApproveCommandResponse = z.infer<typeof ApproveCommandResponseSchema>;
export type RejectCommandRequest = z.infer<typeof RejectCommandRequestSchema>;
export type RejectCommandResponse = z.infer<typeof RejectCommandResponseSchema>;
export type CancelCommandRequest = z.infer<typeof CancelCommandRequestSchema>;
export type CancelCommandResponse = z.infer<typeof CancelCommandResponseSchema>;
export type ProvideCommandFeedbackRequest = z.infer<typeof ProvideCommandFeedbackRequestSchema>;
export type ProvideCommandFeedbackResponse = z.infer<typeof ProvideCommandFeedbackResponseSchema>;
export declare const CommandContracts: {
    readonly processCommand: {
        readonly method: "POST";
        readonly path: "/api/commands";
        readonly request: z.ZodObject<{
            transcript: z.ZodString;
            audioFileUrl: z.ZodOptional<z.ZodString>;
            deviceType: z.ZodEnum<["ios", "android", "web"]>;
            appVersion: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            transcript: string;
            deviceType: "ios" | "android" | "web";
            appVersion: string;
            audioFileUrl?: string | undefined;
        }, {
            transcript: string;
            deviceType: "ios" | "android" | "web";
            appVersion: string;
            audioFileUrl?: string | undefined;
        }>;
        readonly response: z.ZodObject<{
            commandId: z.ZodString;
            status: z.ZodEnum<["pending_approval", "processing", "completed", "failed"]>;
            intent: z.ZodString;
            confidence: z.ZodNumber;
            draft: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
                type: z.ZodLiteral<"email">;
                to: z.ZodArray<z.ZodString, "many">;
                cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                subject: z.ZodString;
                body: z.ZodString;
                tone: z.ZodString;
                replyToThreadId: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "email";
                to: string[];
                subject: string;
                body: string;
                tone: string;
                cc?: string[] | undefined;
                replyToThreadId?: string | undefined;
            }, {
                type: "email";
                to: string[];
                subject: string;
                body: string;
                tone: string;
                cc?: string[] | undefined;
                replyToThreadId?: string | undefined;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"meeting_request">;
                title: z.ZodString;
                participants: z.ZodArray<z.ZodString, "many">;
                proposedTimes: z.ZodArray<z.ZodString, "many">;
                duration: z.ZodNumber;
                location: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                conferenceType: z.ZodOptional<z.ZodEnum<["zoom", "meet", "teams"]>>;
            }, "strip", z.ZodTypeAny, {
                type: "meeting_request";
                title: string;
                participants: string[];
                proposedTimes: string[];
                duration: number;
                description?: string | undefined;
                location?: string | undefined;
                conferenceType?: "zoom" | "meet" | "teams" | undefined;
            }, {
                type: "meeting_request";
                title: string;
                participants: string[];
                proposedTimes: string[];
                duration: number;
                description?: string | undefined;
                location?: string | undefined;
                conferenceType?: "zoom" | "meet" | "teams" | undefined;
            }>]>>;
            message: z.ZodOptional<z.ZodString>;
            requiresApproval: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            status: "processing" | "pending_approval" | "completed" | "failed";
            commandId: string;
            intent: string;
            confidence: number;
            requiresApproval: boolean;
            message?: string | undefined;
            draft?: {
                type: "email";
                to: string[];
                subject: string;
                body: string;
                tone: string;
                cc?: string[] | undefined;
                replyToThreadId?: string | undefined;
            } | {
                type: "meeting_request";
                title: string;
                participants: string[];
                proposedTimes: string[];
                duration: number;
                description?: string | undefined;
                location?: string | undefined;
                conferenceType?: "zoom" | "meet" | "teams" | undefined;
            } | undefined;
        }, {
            status: "processing" | "pending_approval" | "completed" | "failed";
            commandId: string;
            intent: string;
            confidence: number;
            requiresApproval: boolean;
            message?: string | undefined;
            draft?: {
                type: "email";
                to: string[];
                subject: string;
                body: string;
                tone: string;
                cc?: string[] | undefined;
                replyToThreadId?: string | undefined;
            } | {
                type: "meeting_request";
                title: string;
                participants: string[];
                proposedTimes: string[];
                duration: number;
                description?: string | undefined;
                location?: string | undefined;
                conferenceType?: "zoom" | "meet" | "teams" | undefined;
            } | undefined;
        }>;
    };
    readonly getCommand: {
        readonly method: "GET";
        readonly path: "/api/commands/:id";
        readonly request: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        readonly response: z.ZodObject<{
            id: z.ZodString;
            transcript: z.ZodString;
            intent: z.ZodString;
            intentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            confidence: z.ZodNumber;
            status: z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
            result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            error: z.ZodOptional<z.ZodObject<{
                message: z.ZodString;
                code: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                message: string;
                code?: string | undefined;
                details?: Record<string, unknown> | undefined;
            }, {
                message: string;
                code?: string | undefined;
                details?: Record<string, unknown> | undefined;
            }>>;
            timestamp: z.ZodString;
            completedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
            id: string;
            transcript: string;
            intent: string;
            intentData: Record<string, unknown>;
            confidence: number;
            timestamp: string;
            result?: Record<string, unknown> | undefined;
            error?: {
                message: string;
                code?: string | undefined;
                details?: Record<string, unknown> | undefined;
            } | undefined;
            completedAt?: string | undefined;
        }, {
            status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
            id: string;
            transcript: string;
            intent: string;
            intentData: Record<string, unknown>;
            confidence: number;
            timestamp: string;
            result?: Record<string, unknown> | undefined;
            error?: {
                message: string;
                code?: string | undefined;
                details?: Record<string, unknown> | undefined;
            } | undefined;
            completedAt?: string | undefined;
        }>;
    };
    readonly getCommands: {
        readonly method: "GET";
        readonly path: "/api/commands";
        readonly request: z.ZodObject<{
            status: z.ZodOptional<z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>>;
            limit: z.ZodDefault<z.ZodNumber>;
            page: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            page: number;
            status?: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed" | undefined;
        }, {
            status?: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed" | undefined;
            limit?: number | undefined;
            page?: number | undefined;
        }>;
        readonly response: z.ZodObject<{
            commands: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                transcript: z.ZodString;
                intent: z.ZodString;
                intentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                confidence: z.ZodNumber;
                status: z.ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
                result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                error: z.ZodOptional<z.ZodObject<{
                    message: z.ZodString;
                    code: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                }, "strip", z.ZodTypeAny, {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                }, {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                }>>;
                timestamp: z.ZodString;
                completedAt: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                id: string;
                transcript: string;
                intent: string;
                intentData: Record<string, unknown>;
                confidence: number;
                timestamp: string;
                result?: Record<string, unknown> | undefined;
                error?: {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                } | undefined;
                completedAt?: string | undefined;
            }, {
                status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                id: string;
                transcript: string;
                intent: string;
                intentData: Record<string, unknown>;
                confidence: number;
                timestamp: string;
                result?: Record<string, unknown> | undefined;
                error?: {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                } | undefined;
                completedAt?: string | undefined;
            }>, "many">;
            total: z.ZodNumber;
            page: z.ZodNumber;
            limit: z.ZodNumber;
            hasMore: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            page: number;
            total: number;
            hasMore: boolean;
            commands: {
                status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                id: string;
                transcript: string;
                intent: string;
                intentData: Record<string, unknown>;
                confidence: number;
                timestamp: string;
                result?: Record<string, unknown> | undefined;
                error?: {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                } | undefined;
                completedAt?: string | undefined;
            }[];
        }, {
            limit: number;
            page: number;
            total: number;
            hasMore: boolean;
            commands: {
                status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                id: string;
                transcript: string;
                intent: string;
                intentData: Record<string, unknown>;
                confidence: number;
                timestamp: string;
                result?: Record<string, unknown> | undefined;
                error?: {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                } | undefined;
                completedAt?: string | undefined;
            }[];
        }>;
    };
    readonly approveCommand: {
        readonly method: "POST";
        readonly path: "/api/commands/:id/approve";
        readonly request: z.ZodObject<{
            commandId: z.ZodString;
            edits: z.ZodOptional<z.ZodArray<z.ZodObject<{
                field: z.ZodString;
                originalValue: z.ZodUnknown;
                newValue: z.ZodUnknown;
            }, "strip", z.ZodTypeAny, {
                field: string;
                originalValue?: unknown;
                newValue?: unknown;
            }, {
                field: string;
                originalValue?: unknown;
                newValue?: unknown;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            commandId: string;
            edits?: {
                field: string;
                originalValue?: unknown;
                newValue?: unknown;
            }[] | undefined;
        }, {
            commandId: string;
            edits?: {
                field: string;
                originalValue?: unknown;
                newValue?: unknown;
            }[] | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            commandId: z.ZodString;
            result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            success: boolean;
            commandId: string;
            result?: Record<string, unknown> | undefined;
        }, {
            message: string;
            success: boolean;
            commandId: string;
            result?: Record<string, unknown> | undefined;
        }>;
    };
    readonly rejectCommand: {
        readonly method: "POST";
        readonly path: "/api/commands/:id/reject";
        readonly request: z.ZodObject<{
            commandId: z.ZodString;
            reason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            commandId: string;
            reason?: string | undefined;
        }, {
            commandId: string;
            reason?: string | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            commandId: z.ZodString;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            success: boolean;
            commandId: string;
        }, {
            message: string;
            success: boolean;
            commandId: string;
        }>;
    };
    readonly cancelCommand: {
        readonly method: "POST";
        readonly path: "/api/commands/:id/cancel";
        readonly request: z.ZodObject<{
            commandId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            commandId: string;
        }, {
            commandId: string;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            commandId: z.ZodString;
            cancelledAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            success: boolean;
            commandId: string;
            cancelledAt: string;
        }, {
            success: boolean;
            commandId: string;
            cancelledAt: string;
        }>;
    };
    readonly provideFeedback: {
        readonly method: "POST";
        readonly path: "/api/commands/:id/feedback";
        readonly request: z.ZodObject<{
            commandId: z.ZodString;
            feedbackType: z.ZodEnum<["approve", "edit", "reject", "rating"]>;
            rating: z.ZodOptional<z.ZodNumber>;
            comment: z.ZodOptional<z.ZodString>;
            changes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                field: z.ZodString;
                originalValue: z.ZodUnknown;
                newValue: z.ZodUnknown;
                reason: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                field: string;
                reason?: string | undefined;
                originalValue?: unknown;
                newValue?: unknown;
            }, {
                field: string;
                reason?: string | undefined;
                originalValue?: unknown;
                newValue?: unknown;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            commandId: string;
            feedbackType: "approve" | "edit" | "reject" | "rating";
            comment?: string | undefined;
            rating?: number | undefined;
            changes?: {
                field: string;
                reason?: string | undefined;
                originalValue?: unknown;
                newValue?: unknown;
            }[] | undefined;
        }, {
            commandId: string;
            feedbackType: "approve" | "edit" | "reject" | "rating";
            comment?: string | undefined;
            rating?: number | undefined;
            changes?: {
                field: string;
                reason?: string | undefined;
                originalValue?: unknown;
                newValue?: unknown;
            }[] | undefined;
        }>;
        readonly response: z.ZodObject<{
            success: z.ZodBoolean;
            feedbackId: z.ZodString;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            success: boolean;
            feedbackId: string;
        }, {
            message: string;
            success: boolean;
            feedbackId: string;
        }>;
    };
};
//# sourceMappingURL=commands.contracts.d.ts.map