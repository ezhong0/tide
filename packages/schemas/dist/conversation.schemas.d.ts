/**
 * Conversation validation schemas (Module 00)
 * Runtime validation for conversational AI types
 */
import { z } from 'zod';
/**
 * Message role in conversation
 */
export declare const MessageRoleSchema: z.ZodEnum<["user", "assistant", "system"]>;
/**
 * Input method for message
 */
export declare const InputMethodSchema: z.ZodEnum<["typed", "voice_to_text", "button", "suggestion"]>;
/**
 * Feedback type for messages
 */
export declare const FeedbackTypeSchema: z.ZodEnum<["helpful", "not_helpful"]>;
/**
 * Conversation status
 */
export declare const ConversationStatusSchema: z.ZodEnum<["active", "idle", "completed"]>;
/**
 * Action types available in the system
 */
export declare const ActionTypeSchema: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
/**
 * Intent types for natural language understanding
 */
export declare const IntentTypeSchema: z.ZodEnum<["schedule_meeting", "draft_email", "search_emails", "check_calendar", "set_reminder", "create_task", "find_time", "reply_email", "forward_email", "cancel_meeting", "reschedule_meeting", "summarize_emails", "unknown"]>;
/**
 * Risk level for actions
 */
export declare const RiskLevelSchema: z.ZodEnum<["low", "medium", "high"]>;
/**
 * Suggestion types
 */
export declare const SuggestionTypeSchema: z.ZodEnum<["quick_reply", "action", "question", "completion"]>;
/**
 * Person referenced in conversation
 */
export declare const PersonSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    userId?: string | undefined;
    role?: string | undefined;
    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
}, {
    email: string;
    name: string;
    userId?: string | undefined;
    role?: string | undefined;
    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
}>;
/**
 * Date reference in conversation
 */
export declare const DateRefSchema: z.ZodObject<{
    timestamp: z.ZodEffects<z.ZodNumber, number, number>;
    description: z.ZodString;
    relative: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    description: string;
    relative?: string | undefined;
}, {
    timestamp: number;
    description: string;
    relative?: string | undefined;
}>;
/**
 * Meeting in context
 */
export declare const MeetingSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    startTime: z.ZodEffects<z.ZodNumber, number, number>;
    endTime: z.ZodEffects<z.ZodNumber, number, number>;
    attendees: z.ZodArray<z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }, {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }>, "many">;
    location: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    attendees: {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }[];
    location?: string | undefined;
}, {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    attendees: {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }[];
    location?: string | undefined;
}>;
/**
 * Task in conversation
 */
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["pending", "in_progress", "completed"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "pending" | "in_progress";
    description: string;
    id: string;
    priority?: "low" | "high" | "normal" | "urgent" | undefined;
}, {
    status: "completed" | "pending" | "in_progress";
    description: string;
    id: string;
    priority?: "low" | "high" | "normal" | "urgent" | undefined;
}>;
/**
 * Entity extracted from message
 */
export declare const EntitySchema: z.ZodObject<{
    type: z.ZodString;
    value: z.ZodString;
    position: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: string;
    position: [number, number];
    confidence: number;
}, {
    value: string;
    type: string;
    position: [number, number];
    confidence: number;
}>;
/**
 * Ambiguity detected in message
 */
export declare const AmbiguitySchema: z.ZodObject<{
    type: z.ZodString;
    question: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    question: string;
    type: string;
    options?: string[] | undefined;
}, {
    question: string;
    type: string;
    options?: string[] | undefined;
}>;
/**
 * Action to be performed
 */
export declare const ActionSchema: z.ZodObject<{
    type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
    description: z.ZodString;
    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    requiresConfirmation: z.ZodBoolean;
    riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    params: Record<string, unknown>;
    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
    description: string;
    requiresConfirmation: boolean;
    riskLevel?: "low" | "medium" | "high" | undefined;
}, {
    params: Record<string, unknown>;
    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
    description: string;
    requiresConfirmation: boolean;
    riskLevel?: "low" | "medium" | "high" | undefined;
}>;
/**
 * Risk assessment for action
 */
export declare const RiskSchema: z.ZodObject<{
    level: z.ZodEnum<["low", "medium", "high"]>;
    description: z.ZodString;
    mitigation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    level: "low" | "medium" | "high";
    mitigation?: string | undefined;
}, {
    description: string;
    level: "low" | "medium" | "high";
    mitigation?: string | undefined;
}>;
/**
 * Alternative action suggestion
 */
export declare const AlternativeSchema: z.ZodObject<{
    description: z.ZodString;
    action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
    description: string;
    params?: Record<string, unknown> | undefined;
}, {
    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
    description: string;
    params?: Record<string, unknown> | undefined;
}>;
/**
 * Action details for preview
 */
export declare const ActionDetailsSchema: z.ZodObject<{
    action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
    targetResource: z.ZodOptional<z.ZodString>;
    changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
    changes: Record<string, unknown>;
    targetResource?: string | undefined;
    affectedItems?: string[] | undefined;
}, {
    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
    changes: Record<string, unknown>;
    targetResource?: string | undefined;
    affectedItems?: string[] | undefined;
}>;
/**
 * Action preview before execution
 */
export declare const ActionPreviewSchema: z.ZodObject<{
    summary: z.ZodString;
    details: z.ZodObject<{
        action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        targetResource: z.ZodOptional<z.ZodString>;
        changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        changes: Record<string, unknown>;
        targetResource?: string | undefined;
        affectedItems?: string[] | undefined;
    }, {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        changes: Record<string, unknown>;
        targetResource?: string | undefined;
        affectedItems?: string[] | undefined;
    }>;
    risks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        level: z.ZodEnum<["low", "medium", "high"]>;
        description: z.ZodString;
        mitigation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        level: "low" | "medium" | "high";
        mitigation?: string | undefined;
    }, {
        description: string;
        level: "low" | "medium" | "high";
        mitigation?: string | undefined;
    }>, "many">>;
    alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        params?: Record<string, unknown> | undefined;
    }, {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        params?: Record<string, unknown> | undefined;
    }>, "many">>;
    editable: z.ZodBoolean;
    editableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    details: {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        changes: Record<string, unknown>;
        targetResource?: string | undefined;
        affectedItems?: string[] | undefined;
    };
    editable: boolean;
    risks?: {
        description: string;
        level: "low" | "medium" | "high";
        mitigation?: string | undefined;
    }[] | undefined;
    alternatives?: {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        params?: Record<string, unknown> | undefined;
    }[] | undefined;
    editableFields?: string[] | undefined;
}, {
    summary: string;
    details: {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        changes: Record<string, unknown>;
        targetResource?: string | undefined;
        affectedItems?: string[] | undefined;
    };
    editable: boolean;
    risks?: {
        description: string;
        level: "low" | "medium" | "high";
        mitigation?: string | undefined;
    }[] | undefined;
    alternatives?: {
        action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        params?: Record<string, unknown> | undefined;
    }[] | undefined;
    editableFields?: string[] | undefined;
}>;
/**
 * Result of action execution
 */
export declare const ActionResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    action: z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>;
    result: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    undoable: z.ZodBoolean;
    undoWindow: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    };
    success: boolean;
    undoable: boolean;
    result?: unknown;
    error?: string | undefined;
    undoWindow?: number | undefined;
}, {
    action: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    };
    success: boolean;
    undoable: boolean;
    result?: unknown;
    error?: string | undefined;
    undoWindow?: number | undefined;
}>;
/**
 * Suggestion for user
 */
export declare const SuggestionSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    type: z.ZodEnum<["quick_reply", "action", "question", "completion"]>;
    action: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>>;
    confidence: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "quick_reply" | "action" | "question" | "completion";
    id: string;
    text: string;
    action?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    } | undefined;
    confidence?: number | undefined;
}, {
    type: "quick_reply" | "action" | "question" | "completion";
    id: string;
    text: string;
    action?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    } | undefined;
    confidence?: number | undefined;
}>;
/**
 * Classified intent from message
 */
export declare const IntentSchema: z.ZodObject<{
    type: z.ZodEnum<["schedule_meeting", "draft_email", "search_emails", "check_calendar", "set_reminder", "create_task", "find_time", "reply_email", "forward_email", "cancel_meeting", "reschedule_meeting", "summarize_emails", "unknown"]>;
    confidence: z.ZodNumber;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "create_task" | "set_reminder" | "reply_email" | "forward_email" | "check_calendar" | "find_time" | "summarize_emails" | "unknown";
    confidence: number;
    params?: Record<string, unknown> | undefined;
}, {
    type: "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "create_task" | "set_reminder" | "reply_email" | "forward_email" | "check_calendar" | "find_time" | "summarize_emails" | "unknown";
    confidence: number;
    params?: Record<string, unknown> | undefined;
}>;
/**
 * Natural language understanding result
 */
export declare const UnderstandingSchema: z.ZodObject<{
    intents: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["schedule_meeting", "draft_email", "search_emails", "check_calendar", "set_reminder", "create_task", "find_time", "reply_email", "forward_email", "cancel_meeting", "reschedule_meeting", "summarize_emails", "unknown"]>;
        confidence: z.ZodNumber;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "create_task" | "set_reminder" | "reply_email" | "forward_email" | "check_calendar" | "find_time" | "summarize_emails" | "unknown";
        confidence: number;
        params?: Record<string, unknown> | undefined;
    }, {
        type: "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "create_task" | "set_reminder" | "reply_email" | "forward_email" | "check_calendar" | "find_time" | "summarize_emails" | "unknown";
        confidence: number;
        params?: Record<string, unknown> | undefined;
    }>, "many">;
    entities: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        value: z.ZodString;
        position: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
        position: [number, number];
        confidence: number;
    }, {
        value: string;
        type: string;
        position: [number, number];
        confidence: number;
    }>, "many">;
    ambiguities: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        question: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        type: string;
        options?: string[] | undefined;
    }, {
        question: string;
        type: string;
        options?: string[] | undefined;
    }>, "many">>;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    intents: {
        type: "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "create_task" | "set_reminder" | "reply_email" | "forward_email" | "check_calendar" | "find_time" | "summarize_emails" | "unknown";
        confidence: number;
        params?: Record<string, unknown> | undefined;
    }[];
    entities: {
        value: string;
        type: string;
        position: [number, number];
        confidence: number;
    }[];
    ambiguities?: {
        question: string;
        type: string;
        options?: string[] | undefined;
    }[] | undefined;
}, {
    confidence: number;
    intents: {
        type: "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "create_task" | "set_reminder" | "reply_email" | "forward_email" | "check_calendar" | "find_time" | "summarize_emails" | "unknown";
        confidence: number;
        params?: Record<string, unknown> | undefined;
    }[];
    entities: {
        value: string;
        type: string;
        position: [number, number];
        confidence: number;
    }[];
    ambiguities?: {
        question: string;
        type: string;
        options?: string[] | undefined;
    }[] | undefined;
}>;
/**
 * Conversation context
 */
export declare const ConversationContextSchema: z.ZodObject<{
    topic: z.ZodOptional<z.ZodString>;
    currentTask: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["pending", "in_progress", "completed"]>;
        priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "pending" | "in_progress";
        description: string;
        id: string;
        priority?: "low" | "high" | "normal" | "urgent" | undefined;
    }, {
        status: "completed" | "pending" | "in_progress";
        description: string;
        id: string;
        priority?: "low" | "high" | "normal" | "urgent" | undefined;
    }>>;
    pendingActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>, "many">>;
    mentionedPeople: z.ZodArray<z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }, {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }>, "many">;
    mentionedDates: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodEffects<z.ZodNumber, number, number>;
        description: z.ZodString;
        relative: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        description: string;
        relative?: string | undefined;
    }, {
        timestamp: number;
        description: string;
        relative?: string | undefined;
    }>, "many">;
    mentionedProjects: z.ZodArray<z.ZodString, "many">;
    upcomingMeetings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        startTime: z.ZodEffects<z.ZodNumber, number, number>;
        endTime: z.ZodEffects<z.ZodNumber, number, number>;
        attendees: z.ZodArray<z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
            email: z.ZodString;
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }>, "many">;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        startTime: number;
        endTime: number;
        attendees: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        location?: string | undefined;
    }, {
        id: string;
        title: string;
        startTime: number;
        endTime: number;
        attendees: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        location?: string | undefined;
    }>, "many">;
    unreadEmails: z.ZodNumber;
    currentLocation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mentionedPeople: {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }[];
    mentionedDates: {
        timestamp: number;
        description: string;
        relative?: string | undefined;
    }[];
    mentionedProjects: string[];
    upcomingMeetings: {
        id: string;
        title: string;
        startTime: number;
        endTime: number;
        attendees: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        location?: string | undefined;
    }[];
    unreadEmails: number;
    topic?: string | undefined;
    currentTask?: {
        status: "completed" | "pending" | "in_progress";
        description: string;
        id: string;
        priority?: "low" | "high" | "normal" | "urgent" | undefined;
    } | undefined;
    pendingActions?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    currentLocation?: string | undefined;
}, {
    mentionedPeople: {
        email: string;
        name: string;
        userId?: string | undefined;
        role?: string | undefined;
        relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
    }[];
    mentionedDates: {
        timestamp: number;
        description: string;
        relative?: string | undefined;
    }[];
    mentionedProjects: string[];
    upcomingMeetings: {
        id: string;
        title: string;
        startTime: number;
        endTime: number;
        attendees: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        location?: string | undefined;
    }[];
    unreadEmails: number;
    topic?: string | undefined;
    currentTask?: {
        status: "completed" | "pending" | "in_progress";
        description: string;
        id: string;
        priority?: "low" | "high" | "normal" | "urgent" | undefined;
    } | undefined;
    pendingActions?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    currentLocation?: string | undefined;
}>;
/**
 * Message in conversation
 */
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<["user", "assistant", "system"]>;
    content: z.ZodString;
    timestamp: z.ZodEffects<z.ZodNumber, number, number>;
    inputMethod: z.ZodEnum<["typed", "voice_to_text", "button", "suggestion"]>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>, "many">>;
    suggestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        type: z.ZodEnum<["quick_reply", "action", "question", "completion"]>;
        action: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>>;
        confidence: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }, {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }>, "many">>;
    preview: z.ZodOptional<z.ZodObject<{
        summary: z.ZodString;
        details: z.ZodObject<{
            action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            targetResource: z.ZodOptional<z.ZodString>;
            changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        }, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        }>;
        risks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            level: z.ZodEnum<["low", "medium", "high"]>;
            description: z.ZodString;
            mitigation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }, {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }>, "many">>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }>, "many">>;
        editable: z.ZodBoolean;
        editableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    }, {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    }>>;
    feedback: z.ZodOptional<z.ZodEnum<["helpful", "not_helpful"]>>;
    edited: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    role: "user" | "assistant" | "system";
    timestamp: number;
    id: string;
    content: string;
    inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
    actions?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    suggestions?: {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }[] | undefined;
    preview?: {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    } | undefined;
    feedback?: "helpful" | "not_helpful" | undefined;
    edited?: boolean | undefined;
}, {
    role: "user" | "assistant" | "system";
    timestamp: number;
    id: string;
    content: string;
    inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
    actions?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    suggestions?: {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }[] | undefined;
    preview?: {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    } | undefined;
    feedback?: "helpful" | "not_helpful" | undefined;
    edited?: boolean | undefined;
}>;
/**
 * Conversation
 */
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
        timestamp: z.ZodEffects<z.ZodNumber, number, number>;
        inputMethod: z.ZodEnum<["typed", "voice_to_text", "button", "suggestion"]>;
        actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>, "many">>;
        suggestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            type: z.ZodEnum<["quick_reply", "action", "question", "completion"]>;
            action: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                description: z.ZodString;
                params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                requiresConfirmation: z.ZodBoolean;
                riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
            }, "strip", z.ZodTypeAny, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }>>;
            confidence: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "quick_reply" | "action" | "question" | "completion";
            id: string;
            text: string;
            action?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            } | undefined;
            confidence?: number | undefined;
        }, {
            type: "quick_reply" | "action" | "question" | "completion";
            id: string;
            text: string;
            action?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            } | undefined;
            confidence?: number | undefined;
        }>, "many">>;
        preview: z.ZodOptional<z.ZodObject<{
            summary: z.ZodString;
            details: z.ZodObject<{
                action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                targetResource: z.ZodOptional<z.ZodString>;
                changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            }, {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            }>;
            risks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                level: z.ZodEnum<["low", "medium", "high"]>;
                description: z.ZodString;
                mitigation: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }, {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }>, "many">>;
            alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
                description: z.ZodString;
                action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }, {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }>, "many">>;
            editable: z.ZodBoolean;
            editableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary: string;
            details: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            };
            editable: boolean;
            risks?: {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }[] | undefined;
            alternatives?: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }[] | undefined;
            editableFields?: string[] | undefined;
        }, {
            summary: string;
            details: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            };
            editable: boolean;
            risks?: {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }[] | undefined;
            alternatives?: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }[] | undefined;
            editableFields?: string[] | undefined;
        }>>;
        feedback: z.ZodOptional<z.ZodEnum<["helpful", "not_helpful"]>>;
        edited: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant" | "system";
        timestamp: number;
        id: string;
        content: string;
        inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
        actions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        suggestions?: {
            type: "quick_reply" | "action" | "question" | "completion";
            id: string;
            text: string;
            action?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            } | undefined;
            confidence?: number | undefined;
        }[] | undefined;
        preview?: {
            summary: string;
            details: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            };
            editable: boolean;
            risks?: {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }[] | undefined;
            alternatives?: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }[] | undefined;
            editableFields?: string[] | undefined;
        } | undefined;
        feedback?: "helpful" | "not_helpful" | undefined;
        edited?: boolean | undefined;
    }, {
        role: "user" | "assistant" | "system";
        timestamp: number;
        id: string;
        content: string;
        inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
        actions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        suggestions?: {
            type: "quick_reply" | "action" | "question" | "completion";
            id: string;
            text: string;
            action?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            } | undefined;
            confidence?: number | undefined;
        }[] | undefined;
        preview?: {
            summary: string;
            details: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            };
            editable: boolean;
            risks?: {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }[] | undefined;
            alternatives?: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }[] | undefined;
            editableFields?: string[] | undefined;
        } | undefined;
        feedback?: "helpful" | "not_helpful" | undefined;
        edited?: boolean | undefined;
    }>, "many">;
    context: z.ZodObject<{
        topic: z.ZodOptional<z.ZodString>;
        currentTask: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            status: z.ZodEnum<["pending", "in_progress", "completed"]>;
            priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
        }, "strip", z.ZodTypeAny, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }>>;
        pendingActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>, "many">>;
        mentionedPeople: z.ZodArray<z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
            email: z.ZodString;
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }>, "many">;
        mentionedDates: z.ZodArray<z.ZodObject<{
            timestamp: z.ZodEffects<z.ZodNumber, number, number>;
            description: z.ZodString;
            relative: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }>, "many">;
        mentionedProjects: z.ZodArray<z.ZodString, "many">;
        upcomingMeetings: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            startTime: z.ZodEffects<z.ZodNumber, number, number>;
            endTime: z.ZodEffects<z.ZodNumber, number, number>;
            attendees: z.ZodArray<z.ZodObject<{
                userId: z.ZodOptional<z.ZodString>;
                email: z.ZodString;
                name: z.ZodString;
                role: z.ZodOptional<z.ZodString>;
                relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }>, "many">;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }>, "many">;
        unreadEmails: z.ZodNumber;
        currentLocation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    }, {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    }>;
    status: z.ZodEnum<["active", "idle", "completed"]>;
    startedAt: z.ZodEffects<z.ZodNumber, number, number>;
    lastActiveAt: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    status: "active" | "idle" | "completed";
    id: string;
    messages: {
        role: "user" | "assistant" | "system";
        timestamp: number;
        id: string;
        content: string;
        inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
        actions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        suggestions?: {
            type: "quick_reply" | "action" | "question" | "completion";
            id: string;
            text: string;
            action?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            } | undefined;
            confidence?: number | undefined;
        }[] | undefined;
        preview?: {
            summary: string;
            details: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            };
            editable: boolean;
            risks?: {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }[] | undefined;
            alternatives?: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }[] | undefined;
            editableFields?: string[] | undefined;
        } | undefined;
        feedback?: "helpful" | "not_helpful" | undefined;
        edited?: boolean | undefined;
    }[];
    context: {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    };
    startedAt: number;
    lastActiveAt: number;
}, {
    userId: string;
    status: "active" | "idle" | "completed";
    id: string;
    messages: {
        role: "user" | "assistant" | "system";
        timestamp: number;
        id: string;
        content: string;
        inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
        actions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        suggestions?: {
            type: "quick_reply" | "action" | "question" | "completion";
            id: string;
            text: string;
            action?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            } | undefined;
            confidence?: number | undefined;
        }[] | undefined;
        preview?: {
            summary: string;
            details: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                changes: Record<string, unknown>;
                targetResource?: string | undefined;
                affectedItems?: string[] | undefined;
            };
            editable: boolean;
            risks?: {
                description: string;
                level: "low" | "medium" | "high";
                mitigation?: string | undefined;
            }[] | undefined;
            alternatives?: {
                action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                params?: Record<string, unknown> | undefined;
            }[] | undefined;
            editableFields?: string[] | undefined;
        } | undefined;
        feedback?: "helpful" | "not_helpful" | undefined;
        edited?: boolean | undefined;
    }[];
    context: {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    };
    startedAt: number;
    lastActiveAt: number;
}>;
/**
 * Create conversation request
 */
export declare const CreateConversationRequestSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
/**
 * Send message request
 */
export declare const SendMessageRequestSchema: z.ZodObject<{
    conversationId: z.ZodString;
    message: z.ZodString;
    inputMethod: z.ZodEnum<["typed", "voice_to_text", "button", "suggestion"]>;
}, "strip", z.ZodTypeAny, {
    message: string;
    inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
    conversationId: string;
}, {
    message: string;
    inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
    conversationId: string;
}>;
/**
 * Process intent request
 */
export declare const ProcessIntentRequestSchema: z.ZodObject<{
    message: z.ZodString;
    context: z.ZodObject<{
        topic: z.ZodOptional<z.ZodString>;
        currentTask: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            status: z.ZodEnum<["pending", "in_progress", "completed"]>;
            priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
        }, "strip", z.ZodTypeAny, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }>>;
        pendingActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>, "many">>;
        mentionedPeople: z.ZodArray<z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
            email: z.ZodString;
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }>, "many">;
        mentionedDates: z.ZodArray<z.ZodObject<{
            timestamp: z.ZodEffects<z.ZodNumber, number, number>;
            description: z.ZodString;
            relative: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }>, "many">;
        mentionedProjects: z.ZodArray<z.ZodString, "many">;
        upcomingMeetings: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            startTime: z.ZodEffects<z.ZodNumber, number, number>;
            endTime: z.ZodEffects<z.ZodNumber, number, number>;
            attendees: z.ZodArray<z.ZodObject<{
                userId: z.ZodOptional<z.ZodString>;
                email: z.ZodString;
                name: z.ZodString;
                role: z.ZodOptional<z.ZodString>;
                relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }>, "many">;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }>, "many">;
        unreadEmails: z.ZodNumber;
        currentLocation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    }, {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    message: string;
    context: {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    };
}, {
    message: string;
    context: {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    };
}>;
/**
 * Generate action preview request
 */
export declare const GeneratePreviewRequestSchema: z.ZodObject<{
    action: z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    action: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    };
    userId: string;
}, {
    action: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    };
    userId: string;
}>;
/**
 * Execute action request
 */
export declare const ExecuteActionRequestSchema: z.ZodObject<{
    action: z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>;
    userId: z.ZodString;
    modifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    action: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    };
    userId: string;
    modifications?: Record<string, unknown> | undefined;
}, {
    action: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    };
    userId: string;
    modifications?: Record<string, unknown> | undefined;
}>;
/**
 * Get context request
 */
export declare const GetContextRequestSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
}, {
    conversationId: string;
}>;
/**
 * Update context request
 */
export declare const UpdateContextRequestSchema: z.ZodObject<{
    conversationId: z.ZodString;
    context: z.ZodObject<{
        topic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        currentTask: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            status: z.ZodEnum<["pending", "in_progress", "completed"]>;
            priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
        }, "strip", z.ZodTypeAny, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }>>>;
        pendingActions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>, "many">>>;
        mentionedPeople: z.ZodOptional<z.ZodArray<z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
            email: z.ZodString;
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }>, "many">>;
        mentionedDates: z.ZodOptional<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodEffects<z.ZodNumber, number, number>;
            description: z.ZodString;
            relative: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }>, "many">>;
        mentionedProjects: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        upcomingMeetings: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            startTime: z.ZodEffects<z.ZodNumber, number, number>;
            endTime: z.ZodEffects<z.ZodNumber, number, number>;
            attendees: z.ZodArray<z.ZodObject<{
                userId: z.ZodOptional<z.ZodString>;
                email: z.ZodString;
                name: z.ZodString;
                role: z.ZodOptional<z.ZodString>;
                relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }>, "many">;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }>, "many">>;
        unreadEmails: z.ZodOptional<z.ZodNumber>;
        currentLocation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        mentionedPeople?: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[] | undefined;
        mentionedDates?: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[] | undefined;
        mentionedProjects?: string[] | undefined;
        upcomingMeetings?: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[] | undefined;
        unreadEmails?: number | undefined;
        currentLocation?: string | undefined;
    }, {
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        mentionedPeople?: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[] | undefined;
        mentionedDates?: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[] | undefined;
        mentionedProjects?: string[] | undefined;
        upcomingMeetings?: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[] | undefined;
        unreadEmails?: number | undefined;
        currentLocation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    context: {
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        mentionedPeople?: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[] | undefined;
        mentionedDates?: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[] | undefined;
        mentionedProjects?: string[] | undefined;
        upcomingMeetings?: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[] | undefined;
        unreadEmails?: number | undefined;
        currentLocation?: string | undefined;
    };
    conversationId: string;
}, {
    context: {
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        mentionedPeople?: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[] | undefined;
        mentionedDates?: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[] | undefined;
        mentionedProjects?: string[] | undefined;
        upcomingMeetings?: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[] | undefined;
        unreadEmails?: number | undefined;
        currentLocation?: string | undefined;
    };
    conversationId: string;
}>;
/**
 * Card for rich responses
 */
export declare const CardSchema: z.ZodObject<{
    type: z.ZodEnum<["meeting", "email", "task", "summary", "action"]>;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        action: z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>;
        style: z.ZodOptional<z.ZodEnum<["primary", "secondary", "destructive"]>>;
    }, "strip", z.ZodTypeAny, {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        label: string;
        style?: "primary" | "secondary" | "destructive" | undefined;
    }, {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        label: string;
        style?: "primary" | "secondary" | "destructive" | undefined;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "action" | "email" | "summary" | "meeting" | "task";
    title: string;
    content?: string | undefined;
    actions?: {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        label: string;
        style?: "primary" | "secondary" | "destructive" | undefined;
    }[] | undefined;
    subtitle?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    type: "action" | "email" | "summary" | "meeting" | "task";
    title: string;
    content?: string | undefined;
    actions?: {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        label: string;
        style?: "primary" | "secondary" | "destructive" | undefined;
    }[] | undefined;
    subtitle?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
/**
 * Message response
 */
export declare const MessageResponseSchema: z.ZodObject<{
    messageId: z.ZodString;
    content: z.ZodString;
    role: z.ZodEnum<["user", "assistant", "system"]>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
        description: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        requiresConfirmation: z.ZodBoolean;
        riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }, {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }>, "many">>;
    suggestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        type: z.ZodEnum<["quick_reply", "action", "question", "completion"]>;
        action: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>>;
        confidence: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }, {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }>, "many">>;
    preview: z.ZodOptional<z.ZodObject<{
        summary: z.ZodString;
        details: z.ZodObject<{
            action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            targetResource: z.ZodOptional<z.ZodString>;
            changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        }, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        }>;
        risks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            level: z.ZodEnum<["low", "medium", "high"]>;
            description: z.ZodString;
            mitigation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }, {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }>, "many">>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }>, "many">>;
        editable: z.ZodBoolean;
        editableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    }, {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    }>>;
    cards: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["meeting", "email", "task", "summary", "action"]>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            action: z.ZodObject<{
                type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                description: z.ZodString;
                params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                requiresConfirmation: z.ZodBoolean;
                riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
            }, "strip", z.ZodTypeAny, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }>;
            style: z.ZodOptional<z.ZodEnum<["primary", "secondary", "destructive"]>>;
        }, "strip", z.ZodTypeAny, {
            action: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            };
            label: string;
            style?: "primary" | "secondary" | "destructive" | undefined;
        }, {
            action: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            };
            label: string;
            style?: "primary" | "secondary" | "destructive" | undefined;
        }>, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: "action" | "email" | "summary" | "meeting" | "task";
        title: string;
        content?: string | undefined;
        actions?: {
            action: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            };
            label: string;
            style?: "primary" | "secondary" | "destructive" | undefined;
        }[] | undefined;
        subtitle?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        type: "action" | "email" | "summary" | "meeting" | "task";
        title: string;
        content?: string | undefined;
        actions?: {
            action: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            };
            label: string;
            style?: "primary" | "secondary" | "destructive" | undefined;
        }[] | undefined;
        subtitle?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">>;
    streamingComplete: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    role: "user" | "assistant" | "system";
    content: string;
    messageId: string;
    actions?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    suggestions?: {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }[] | undefined;
    preview?: {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    } | undefined;
    cards?: {
        type: "action" | "email" | "summary" | "meeting" | "task";
        title: string;
        content?: string | undefined;
        actions?: {
            action: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            };
            label: string;
            style?: "primary" | "secondary" | "destructive" | undefined;
        }[] | undefined;
        subtitle?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[] | undefined;
    streamingComplete?: boolean | undefined;
}, {
    role: "user" | "assistant" | "system";
    content: string;
    messageId: string;
    actions?: {
        params: Record<string, unknown>;
        type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
        description: string;
        requiresConfirmation: boolean;
        riskLevel?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    suggestions?: {
        type: "quick_reply" | "action" | "question" | "completion";
        id: string;
        text: string;
        action?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        } | undefined;
        confidence?: number | undefined;
    }[] | undefined;
    preview?: {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    } | undefined;
    cards?: {
        type: "action" | "email" | "summary" | "meeting" | "task";
        title: string;
        content?: string | undefined;
        actions?: {
            action: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            };
            label: string;
            style?: "primary" | "secondary" | "destructive" | undefined;
        }[] | undefined;
        subtitle?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[] | undefined;
    streamingComplete?: boolean | undefined;
}>;
/**
 * Conversation response
 */
export declare const ConversationResponseSchema: z.ZodObject<{
    conversation: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        messages: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<["user", "assistant", "system"]>;
            content: z.ZodString;
            timestamp: z.ZodEffects<z.ZodNumber, number, number>;
            inputMethod: z.ZodEnum<["typed", "voice_to_text", "button", "suggestion"]>;
            actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                description: z.ZodString;
                params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                requiresConfirmation: z.ZodBoolean;
                riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
            }, "strip", z.ZodTypeAny, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }>, "many">>;
            suggestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
                type: z.ZodEnum<["quick_reply", "action", "question", "completion"]>;
                action: z.ZodOptional<z.ZodObject<{
                    type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                    description: z.ZodString;
                    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                    requiresConfirmation: z.ZodBoolean;
                    riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
                }, "strip", z.ZodTypeAny, {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                }, {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                }>>;
                confidence: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }, {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }>, "many">>;
            preview: z.ZodOptional<z.ZodObject<{
                summary: z.ZodString;
                details: z.ZodObject<{
                    action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                    targetResource: z.ZodOptional<z.ZodString>;
                    changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                    affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                }, {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                }>;
                risks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    level: z.ZodEnum<["low", "medium", "high"]>;
                    description: z.ZodString;
                    mitigation: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }, {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }>, "many">>;
                alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    description: z.ZodString;
                    action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                }, "strip", z.ZodTypeAny, {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }, {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }>, "many">>;
                editable: z.ZodBoolean;
                editableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            }, {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            }>>;
            feedback: z.ZodOptional<z.ZodEnum<["helpful", "not_helpful"]>>;
            edited: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            role: "user" | "assistant" | "system";
            timestamp: number;
            id: string;
            content: string;
            inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
            actions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            suggestions?: {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }[] | undefined;
            preview?: {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            } | undefined;
            feedback?: "helpful" | "not_helpful" | undefined;
            edited?: boolean | undefined;
        }, {
            role: "user" | "assistant" | "system";
            timestamp: number;
            id: string;
            content: string;
            inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
            actions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            suggestions?: {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }[] | undefined;
            preview?: {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            } | undefined;
            feedback?: "helpful" | "not_helpful" | undefined;
            edited?: boolean | undefined;
        }>, "many">;
        context: z.ZodObject<{
            topic: z.ZodOptional<z.ZodString>;
            currentTask: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                status: z.ZodEnum<["pending", "in_progress", "completed"]>;
                priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
            }, "strip", z.ZodTypeAny, {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            }, {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            }>>;
            pendingActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
                description: z.ZodString;
                params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                requiresConfirmation: z.ZodBoolean;
                riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
            }, "strip", z.ZodTypeAny, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }, {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }>, "many">>;
            mentionedPeople: z.ZodArray<z.ZodObject<{
                userId: z.ZodOptional<z.ZodString>;
                email: z.ZodString;
                name: z.ZodString;
                role: z.ZodOptional<z.ZodString>;
                relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }>, "many">;
            mentionedDates: z.ZodArray<z.ZodObject<{
                timestamp: z.ZodEffects<z.ZodNumber, number, number>;
                description: z.ZodString;
                relative: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }, {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }>, "many">;
            mentionedProjects: z.ZodArray<z.ZodString, "many">;
            upcomingMeetings: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                startTime: z.ZodEffects<z.ZodNumber, number, number>;
                endTime: z.ZodEffects<z.ZodNumber, number, number>;
                attendees: z.ZodArray<z.ZodObject<{
                    userId: z.ZodOptional<z.ZodString>;
                    email: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodOptional<z.ZodString>;
                    relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }, {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }>, "many">;
                location: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }, {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }>, "many">;
            unreadEmails: z.ZodNumber;
            currentLocation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            mentionedPeople: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            mentionedDates: {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }[];
            mentionedProjects: string[];
            upcomingMeetings: {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }[];
            unreadEmails: number;
            topic?: string | undefined;
            currentTask?: {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            } | undefined;
            pendingActions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            currentLocation?: string | undefined;
        }, {
            mentionedPeople: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            mentionedDates: {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }[];
            mentionedProjects: string[];
            upcomingMeetings: {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }[];
            unreadEmails: number;
            topic?: string | undefined;
            currentTask?: {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            } | undefined;
            pendingActions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            currentLocation?: string | undefined;
        }>;
        status: z.ZodEnum<["active", "idle", "completed"]>;
        startedAt: z.ZodEffects<z.ZodNumber, number, number>;
        lastActiveAt: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        status: "active" | "idle" | "completed";
        id: string;
        messages: {
            role: "user" | "assistant" | "system";
            timestamp: number;
            id: string;
            content: string;
            inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
            actions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            suggestions?: {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }[] | undefined;
            preview?: {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            } | undefined;
            feedback?: "helpful" | "not_helpful" | undefined;
            edited?: boolean | undefined;
        }[];
        context: {
            mentionedPeople: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            mentionedDates: {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }[];
            mentionedProjects: string[];
            upcomingMeetings: {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }[];
            unreadEmails: number;
            topic?: string | undefined;
            currentTask?: {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            } | undefined;
            pendingActions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            currentLocation?: string | undefined;
        };
        startedAt: number;
        lastActiveAt: number;
    }, {
        userId: string;
        status: "active" | "idle" | "completed";
        id: string;
        messages: {
            role: "user" | "assistant" | "system";
            timestamp: number;
            id: string;
            content: string;
            inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
            actions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            suggestions?: {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }[] | undefined;
            preview?: {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            } | undefined;
            feedback?: "helpful" | "not_helpful" | undefined;
            edited?: boolean | undefined;
        }[];
        context: {
            mentionedPeople: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            mentionedDates: {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }[];
            mentionedProjects: string[];
            upcomingMeetings: {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }[];
            unreadEmails: number;
            topic?: string | undefined;
            currentTask?: {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            } | undefined;
            pendingActions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            currentLocation?: string | undefined;
        };
        startedAt: number;
        lastActiveAt: number;
    }>;
}, "strip", z.ZodTypeAny, {
    conversation: {
        userId: string;
        status: "active" | "idle" | "completed";
        id: string;
        messages: {
            role: "user" | "assistant" | "system";
            timestamp: number;
            id: string;
            content: string;
            inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
            actions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            suggestions?: {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }[] | undefined;
            preview?: {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            } | undefined;
            feedback?: "helpful" | "not_helpful" | undefined;
            edited?: boolean | undefined;
        }[];
        context: {
            mentionedPeople: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            mentionedDates: {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }[];
            mentionedProjects: string[];
            upcomingMeetings: {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }[];
            unreadEmails: number;
            topic?: string | undefined;
            currentTask?: {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            } | undefined;
            pendingActions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            currentLocation?: string | undefined;
        };
        startedAt: number;
        lastActiveAt: number;
    };
}, {
    conversation: {
        userId: string;
        status: "active" | "idle" | "completed";
        id: string;
        messages: {
            role: "user" | "assistant" | "system";
            timestamp: number;
            id: string;
            content: string;
            inputMethod: "typed" | "voice_to_text" | "button" | "suggestion";
            actions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            suggestions?: {
                type: "quick_reply" | "action" | "question" | "completion";
                id: string;
                text: string;
                action?: {
                    params: Record<string, unknown>;
                    type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    requiresConfirmation: boolean;
                    riskLevel?: "low" | "medium" | "high" | undefined;
                } | undefined;
                confidence?: number | undefined;
            }[] | undefined;
            preview?: {
                summary: string;
                details: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    changes: Record<string, unknown>;
                    targetResource?: string | undefined;
                    affectedItems?: string[] | undefined;
                };
                editable: boolean;
                risks?: {
                    description: string;
                    level: "low" | "medium" | "high";
                    mitigation?: string | undefined;
                }[] | undefined;
                alternatives?: {
                    action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                    description: string;
                    params?: Record<string, unknown> | undefined;
                }[] | undefined;
                editableFields?: string[] | undefined;
            } | undefined;
            feedback?: "helpful" | "not_helpful" | undefined;
            edited?: boolean | undefined;
        }[];
        context: {
            mentionedPeople: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            mentionedDates: {
                timestamp: number;
                description: string;
                relative?: string | undefined;
            }[];
            mentionedProjects: string[];
            upcomingMeetings: {
                id: string;
                title: string;
                startTime: number;
                endTime: number;
                attendees: {
                    email: string;
                    name: string;
                    userId?: string | undefined;
                    role?: string | undefined;
                    relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
                }[];
                location?: string | undefined;
            }[];
            unreadEmails: number;
            topic?: string | undefined;
            currentTask?: {
                status: "completed" | "pending" | "in_progress";
                description: string;
                id: string;
                priority?: "low" | "high" | "normal" | "urgent" | undefined;
            } | undefined;
            pendingActions?: {
                params: Record<string, unknown>;
                type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
                description: string;
                requiresConfirmation: boolean;
                riskLevel?: "low" | "medium" | "high" | undefined;
            }[] | undefined;
            currentLocation?: string | undefined;
        };
        startedAt: number;
        lastActiveAt: number;
    };
}>;
/**
 * Context response
 */
export declare const ContextResponseSchema: z.ZodObject<{
    context: z.ZodObject<{
        topic: z.ZodOptional<z.ZodString>;
        currentTask: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            status: z.ZodEnum<["pending", "in_progress", "completed"]>;
            priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
        }, "strip", z.ZodTypeAny, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }, {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        }>>;
        pendingActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>, "many">>;
        mentionedPeople: z.ZodArray<z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
            email: z.ZodString;
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }, {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }>, "many">;
        mentionedDates: z.ZodArray<z.ZodObject<{
            timestamp: z.ZodEffects<z.ZodNumber, number, number>;
            description: z.ZodString;
            relative: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }, {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }>, "many">;
        mentionedProjects: z.ZodArray<z.ZodString, "many">;
        upcomingMeetings: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            startTime: z.ZodEffects<z.ZodNumber, number, number>;
            endTime: z.ZodEffects<z.ZodNumber, number, number>;
            attendees: z.ZodArray<z.ZodObject<{
                userId: z.ZodOptional<z.ZodString>;
                email: z.ZodString;
                name: z.ZodString;
                role: z.ZodOptional<z.ZodString>;
                relationship: z.ZodOptional<z.ZodEnum<["manager", "direct_report", "peer", "client", "vendor"]>>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }, {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }>, "many">;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }, {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }>, "many">;
        unreadEmails: z.ZodNumber;
        currentLocation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    }, {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    context: {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    };
}, {
    context: {
        mentionedPeople: {
            email: string;
            name: string;
            userId?: string | undefined;
            role?: string | undefined;
            relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
        }[];
        mentionedDates: {
            timestamp: number;
            description: string;
            relative?: string | undefined;
        }[];
        mentionedProjects: string[];
        upcomingMeetings: {
            id: string;
            title: string;
            startTime: number;
            endTime: number;
            attendees: {
                email: string;
                name: string;
                userId?: string | undefined;
                role?: string | undefined;
                relationship?: "manager" | "direct_report" | "peer" | "client" | "vendor" | undefined;
            }[];
            location?: string | undefined;
        }[];
        unreadEmails: number;
        topic?: string | undefined;
        currentTask?: {
            status: "completed" | "pending" | "in_progress";
            description: string;
            id: string;
            priority?: "low" | "high" | "normal" | "urgent" | undefined;
        } | undefined;
        pendingActions?: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }[] | undefined;
        currentLocation?: string | undefined;
    };
}>;
/**
 * Action preview response
 */
export declare const PreviewResponseSchema: z.ZodObject<{
    preview: z.ZodObject<{
        summary: z.ZodString;
        details: z.ZodObject<{
            action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            targetResource: z.ZodOptional<z.ZodString>;
            changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            affectedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        }, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        }>;
        risks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            level: z.ZodEnum<["low", "medium", "high"]>;
            description: z.ZodString;
            mitigation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }, {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }>, "many">>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            action: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }, {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }>, "many">>;
        editable: z.ZodBoolean;
        editableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    }, {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    preview: {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    };
}, {
    preview: {
        summary: string;
        details: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            changes: Record<string, unknown>;
            targetResource?: string | undefined;
            affectedItems?: string[] | undefined;
        };
        editable: boolean;
        risks?: {
            description: string;
            level: "low" | "medium" | "high";
            mitigation?: string | undefined;
        }[] | undefined;
        alternatives?: {
            action: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            params?: Record<string, unknown> | undefined;
        }[] | undefined;
        editableFields?: string[] | undefined;
    };
}>;
/**
 * Action execution response
 */
export declare const ExecutionResponseSchema: z.ZodObject<{
    result: z.ZodObject<{
        success: z.ZodBoolean;
        action: z.ZodObject<{
            type: z.ZodEnum<["send_email", "schedule_meeting", "reschedule_meeting", "cancel_meeting", "draft_email", "search_emails", "summarize_thread", "create_task", "set_reminder", "reply_email", "forward_email"]>;
            description: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            requiresConfirmation: z.ZodBoolean;
            riskLevel: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }, {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        }>;
        result: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodString>;
        undoable: z.ZodBoolean;
        undoWindow: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        success: boolean;
        undoable: boolean;
        result?: unknown;
        error?: string | undefined;
        undoWindow?: number | undefined;
    }, {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        success: boolean;
        undoable: boolean;
        result?: unknown;
        error?: string | undefined;
        undoWindow?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    result: {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        success: boolean;
        undoable: boolean;
        result?: unknown;
        error?: string | undefined;
        undoWindow?: number | undefined;
    };
}, {
    result: {
        action: {
            params: Record<string, unknown>;
            type: "send_email" | "schedule_meeting" | "reschedule_meeting" | "cancel_meeting" | "draft_email" | "search_emails" | "summarize_thread" | "create_task" | "set_reminder" | "reply_email" | "forward_email";
            description: string;
            requiresConfirmation: boolean;
            riskLevel?: "low" | "medium" | "high" | undefined;
        };
        success: boolean;
        undoable: boolean;
        result?: unknown;
        error?: string | undefined;
        undoWindow?: number | undefined;
    };
}>;
export type CreateConversationRequest = z.infer<typeof CreateConversationRequestSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type ProcessIntentRequest = z.infer<typeof ProcessIntentRequestSchema>;
export type GeneratePreviewRequest = z.infer<typeof GeneratePreviewRequestSchema>;
export type ExecuteActionRequest = z.infer<typeof ExecuteActionRequestSchema>;
export type GetContextRequest = z.infer<typeof GetContextRequestSchema>;
export type UpdateContextRequest = z.infer<typeof UpdateContextRequestSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
export type ContextResponse = z.infer<typeof ContextResponseSchema>;
export type PreviewResponse = z.infer<typeof PreviewResponseSchema>;
export type ExecutionResponse = z.infer<typeof ExecutionResponseSchema>;
//# sourceMappingURL=conversation.schemas.d.ts.map