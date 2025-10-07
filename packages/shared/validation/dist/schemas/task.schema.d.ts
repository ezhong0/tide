import { z } from 'zod';
/**
 * Task priority schema
 */
export declare const TaskPrioritySchema: z.ZodEnum<["low", "normal", "high", "urgent"]>;
/**
 * Task status schema
 */
export declare const TaskStatusSchema: z.ZodEnum<["pending", "in_progress", "blocked", "completed", "cancelled"]>;
/**
 * Task schema
 */
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["low", "normal", "high", "urgent"]>;
    status: z.ZodEnum<["pending", "in_progress", "blocked", "completed", "cancelled"]>;
    assignee: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodString;
    dueDate: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    completedAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    estimatedMinutes: z.ZodOptional<z.ZodNumber>;
    actualMinutes: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    workflowId: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subtasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        name: string;
        url: string;
    }, {
        type: string;
        id: string;
        name: string;
        url: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "in_progress" | "blocked" | "completed";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    priority: "low" | "normal" | "high" | "urgent";
    createdBy: string;
    description?: string | undefined;
    attachments?: {
        type: string;
        id: string;
        name: string;
        url: string;
    }[] | undefined;
    assignee?: string | undefined;
    dueDate?: string | Date | undefined;
    completedAt?: string | Date | undefined;
    estimatedMinutes?: number | undefined;
    actualMinutes?: number | undefined;
    tags?: string[] | undefined;
    workflowId?: string | undefined;
    dependencies?: string[] | undefined;
    subtasks?: string[] | undefined;
}, {
    status: "cancelled" | "pending" | "in_progress" | "blocked" | "completed";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    priority: "low" | "normal" | "high" | "urgent";
    createdBy: string;
    description?: string | undefined;
    attachments?: {
        type: string;
        id: string;
        name: string;
        url: string;
    }[] | undefined;
    assignee?: string | undefined;
    dueDate?: string | Date | undefined;
    completedAt?: string | Date | undefined;
    estimatedMinutes?: number | undefined;
    actualMinutes?: number | undefined;
    tags?: string[] | undefined;
    workflowId?: string | undefined;
    dependencies?: string[] | undefined;
    subtasks?: string[] | undefined;
}>;
export type Task = z.infer<typeof TaskSchema>;
/**
 * Create task schema
 */
export declare const CreateTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    assignee: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    estimatedMinutes: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    workflowId: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "low" | "normal" | "high" | "urgent";
    description?: string | undefined;
    assignee?: string | undefined;
    dueDate?: string | Date | undefined;
    estimatedMinutes?: number | undefined;
    tags?: string[] | undefined;
    workflowId?: string | undefined;
    dependencies?: string[] | undefined;
}, {
    title: string;
    description?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    assignee?: string | undefined;
    dueDate?: string | Date | undefined;
    estimatedMinutes?: number | undefined;
    tags?: string[] | undefined;
    workflowId?: string | undefined;
    dependencies?: string[] | undefined;
}>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
/**
 * Update task schema
 */
export declare const UpdateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "in_progress", "blocked", "completed", "cancelled"]>>;
    assignee: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    estimatedMinutes: z.ZodOptional<z.ZodNumber>;
    actualMinutes: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "cancelled" | "pending" | "in_progress" | "blocked" | "completed" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    assignee?: string | undefined;
    dueDate?: string | Date | undefined;
    estimatedMinutes?: number | undefined;
    actualMinutes?: number | undefined;
    tags?: string[] | undefined;
}, {
    status?: "cancelled" | "pending" | "in_progress" | "blocked" | "completed" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    assignee?: string | undefined;
    dueDate?: string | Date | undefined;
    estimatedMinutes?: number | undefined;
    actualMinutes?: number | undefined;
    tags?: string[] | undefined;
}>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
/**
 * Workflow status schema
 */
export declare const WorkflowStatusSchema: z.ZodEnum<["pending", "running", "paused", "completed", "failed", "cancelled"]>;
/**
 * Workflow step schema
 */
export declare const WorkflowStepSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    status: z.ZodEnum<["pending", "running", "completed", "failed", "skipped"]>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    result: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    type: string;
    status: "pending" | "completed" | "running" | "failed" | "skipped";
    id: string;
    name: string;
    error?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    config?: Record<string, any> | undefined;
    result?: any;
}, {
    type: string;
    status: "pending" | "completed" | "running" | "failed" | "skipped";
    id: string;
    name: string;
    error?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    config?: Record<string, any> | undefined;
    result?: any;
}>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
/**
 * Workflow schema
 */
export declare const WorkflowSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["pending", "running", "paused", "completed", "failed", "cancelled"]>;
    currentStep: z.ZodNumber;
    totalSteps: z.ZodNumber;
    completedSteps: z.ZodNumber;
    progress: z.ZodNumber;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        status: z.ZodEnum<["pending", "running", "completed", "failed", "skipped"]>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        result: z.ZodOptional<z.ZodAny>;
        error: z.ZodOptional<z.ZodString>;
        startedAt: z.ZodOptional<z.ZodDate>;
        completedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        status: "pending" | "completed" | "running" | "failed" | "skipped";
        id: string;
        name: string;
        error?: string | undefined;
        startedAt?: Date | undefined;
        completedAt?: Date | undefined;
        config?: Record<string, any> | undefined;
        result?: any;
    }, {
        type: string;
        status: "pending" | "completed" | "running" | "failed" | "skipped";
        id: string;
        name: string;
        error?: string | undefined;
        startedAt?: Date | undefined;
        completedAt?: Date | undefined;
        config?: Record<string, any> | undefined;
        result?: any;
    }>, "many">;
    trigger: z.ZodObject<{
        type: z.ZodEnum<["manual", "scheduled", "event", "pattern"]>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    }, {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    }>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["once", "daily", "weekly", "monthly"]>;
        time: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "completed" | "running" | "paused" | "failed";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    createdBy: string;
    currentStep: number;
    totalSteps: number;
    completedSteps: number;
    progress: number;
    steps: {
        type: string;
        status: "pending" | "completed" | "running" | "failed" | "skipped";
        id: string;
        name: string;
        error?: string | undefined;
        startedAt?: Date | undefined;
        completedAt?: Date | undefined;
        config?: Record<string, any> | undefined;
        result?: any;
    }[];
    trigger: {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    };
    metadata?: Record<string, any> | undefined;
    startedAt?: Date | undefined;
    description?: string | undefined;
    completedAt?: Date | undefined;
    schedule?: {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    } | undefined;
}, {
    status: "cancelled" | "pending" | "completed" | "running" | "paused" | "failed";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    createdBy: string;
    currentStep: number;
    totalSteps: number;
    completedSteps: number;
    progress: number;
    steps: {
        type: string;
        status: "pending" | "completed" | "running" | "failed" | "skipped";
        id: string;
        name: string;
        error?: string | undefined;
        startedAt?: Date | undefined;
        completedAt?: Date | undefined;
        config?: Record<string, any> | undefined;
        result?: any;
    }[];
    trigger: {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    };
    metadata?: Record<string, any> | undefined;
    startedAt?: Date | undefined;
    description?: string | undefined;
    completedAt?: Date | undefined;
    schedule?: {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    } | undefined;
}>;
export type Workflow = z.infer<typeof WorkflowSchema>;
/**
 * Create workflow schema
 */
export declare const CreateWorkflowSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        config?: Record<string, any> | undefined;
    }, {
        type: string;
        name: string;
        config?: Record<string, any> | undefined;
    }>, "many">;
    trigger: z.ZodObject<{
        type: z.ZodEnum<["manual", "scheduled", "event", "pattern"]>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    }, {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    }>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["once", "daily", "weekly", "monthly"]>;
        time: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    }, {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    steps: {
        type: string;
        name: string;
        config?: Record<string, any> | undefined;
    }[];
    trigger: {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    };
    description?: string | undefined;
    schedule?: {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    } | undefined;
}, {
    name: string;
    steps: {
        type: string;
        name: string;
        config?: Record<string, any> | undefined;
    }[];
    trigger: {
        type: "manual" | "scheduled" | "event" | "pattern";
        config?: Record<string, any> | undefined;
    };
    description?: string | undefined;
    schedule?: {
        frequency: "daily" | "weekly" | "monthly" | "once";
        timezone?: string | undefined;
        time?: string | undefined;
    } | undefined;
}>;
export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;
/**
 * Workflow pattern detection schema
 */
export declare const WorkflowPatternSchema: z.ZodObject<{
    patternDetected: z.ZodBoolean;
    pattern: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        frequency: z.ZodEnum<["daily", "weekly", "monthly", "occasional"]>;
        steps: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
        occurrences: z.ZodNumber;
        lastOccurrence: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        name: string;
        frequency: "daily" | "weekly" | "monthly" | "occasional";
        steps: string[];
        occurrences: number;
        lastOccurrence: Date;
    }, {
        confidence: number;
        name: string;
        frequency: "daily" | "weekly" | "monthly" | "occasional";
        steps: string[];
        occurrences: number;
        lastOccurrence: Date;
    }>>;
    suggestAutomation: z.ZodBoolean;
    estimatedTimeSavings: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    patternDetected: boolean;
    suggestAutomation: boolean;
    pattern?: {
        confidence: number;
        name: string;
        frequency: "daily" | "weekly" | "monthly" | "occasional";
        steps: string[];
        occurrences: number;
        lastOccurrence: Date;
    } | undefined;
    estimatedTimeSavings?: number | undefined;
}, {
    patternDetected: boolean;
    suggestAutomation: boolean;
    pattern?: {
        confidence: number;
        name: string;
        frequency: "daily" | "weekly" | "monthly" | "occasional";
        steps: string[];
        occurrences: number;
        lastOccurrence: Date;
    } | undefined;
    estimatedTimeSavings?: number | undefined;
}>;
export type WorkflowPattern = z.infer<typeof WorkflowPatternSchema>;
