"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowPatternSchema = exports.CreateWorkflowSchema = exports.WorkflowSchema = exports.WorkflowStepSchema = exports.WorkflowStatusSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.TaskSchema = exports.TaskStatusSchema = exports.TaskPrioritySchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
/**
 * Task priority schema
 */
exports.TaskPrioritySchema = zod_1.z.enum(['low', 'normal', 'high', 'urgent']);
/**
 * Task status schema
 */
exports.TaskStatusSchema = zod_1.z.enum(['pending', 'in_progress', 'blocked', 'completed', 'cancelled']);
/**
 * Task schema
 */
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().optional(),
    priority: exports.TaskPrioritySchema,
    status: exports.TaskStatusSchema,
    assignee: zod_1.z.string().uuid().optional(),
    createdBy: zod_1.z.string().uuid(),
    dueDate: base_schema_1.DateTimeSchema.optional(),
    completedAt: base_schema_1.DateTimeSchema.optional(),
    estimatedMinutes: zod_1.z.number().int().positive().optional(),
    actualMinutes: zod_1.z.number().int().positive().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    workflowId: zod_1.z.string().uuid().optional(),
    dependencies: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    subtasks: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        url: zod_1.z.string().url(),
        type: zod_1.z.string(),
    })).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
/**
 * Create task schema
 */
exports.CreateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().optional(),
    priority: exports.TaskPrioritySchema.default('normal'),
    assignee: zod_1.z.string().uuid().optional(),
    dueDate: base_schema_1.DateTimeSchema.optional(),
    estimatedMinutes: zod_1.z.number().int().positive().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    workflowId: zod_1.z.string().uuid().optional(),
    dependencies: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
/**
 * Update task schema
 */
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500).optional(),
    description: zod_1.z.string().optional(),
    priority: exports.TaskPrioritySchema.optional(),
    status: exports.TaskStatusSchema.optional(),
    assignee: zod_1.z.string().uuid().optional(),
    dueDate: base_schema_1.DateTimeSchema.optional(),
    estimatedMinutes: zod_1.z.number().int().positive().optional(),
    actualMinutes: zod_1.z.number().int().positive().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Workflow status schema
 */
exports.WorkflowStatusSchema = zod_1.z.enum(['pending', 'running', 'paused', 'completed', 'failed', 'cancelled']);
/**
 * Workflow step schema
 */
exports.WorkflowStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    result: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    startedAt: zod_1.z.date().optional(),
    completedAt: zod_1.z.date().optional(),
});
/**
 * Workflow schema
 */
exports.WorkflowSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    status: exports.WorkflowStatusSchema,
    currentStep: zod_1.z.number().int().nonnegative(),
    totalSteps: zod_1.z.number().int().positive(),
    completedSteps: zod_1.z.number().int().nonnegative(),
    progress: zod_1.z.number().min(0).max(1),
    steps: zod_1.z.array(exports.WorkflowStepSchema),
    trigger: zod_1.z.object({
        type: zod_1.z.enum(['manual', 'scheduled', 'event', 'pattern']),
        config: zod_1.z.record(zod_1.z.any()).optional(),
    }),
    schedule: zod_1.z.object({
        frequency: zod_1.z.enum(['once', 'daily', 'weekly', 'monthly']),
        time: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional(),
    }).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    createdBy: zod_1.z.string().uuid(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    startedAt: zod_1.z.date().optional(),
    completedAt: zod_1.z.date().optional(),
});
/**
 * Create workflow schema
 */
exports.CreateWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    steps: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        type: zod_1.z.string(),
        config: zod_1.z.record(zod_1.z.any()).optional(),
    })).min(1),
    trigger: zod_1.z.object({
        type: zod_1.z.enum(['manual', 'scheduled', 'event', 'pattern']),
        config: zod_1.z.record(zod_1.z.any()).optional(),
    }),
    schedule: zod_1.z.object({
        frequency: zod_1.z.enum(['once', 'daily', 'weekly', 'monthly']),
        time: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional(),
    }).optional(),
});
/**
 * Workflow pattern detection schema
 */
exports.WorkflowPatternSchema = zod_1.z.object({
    patternDetected: zod_1.z.boolean(),
    pattern: zod_1.z.object({
        name: zod_1.z.string(),
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'occasional']),
        steps: zod_1.z.array(zod_1.z.string()),
        confidence: zod_1.z.number().min(0).max(1),
        occurrences: zod_1.z.number().int().positive(),
        lastOccurrence: zod_1.z.date(),
    }).optional(),
    suggestAutomation: zod_1.z.boolean(),
    estimatedTimeSavings: zod_1.z.number().int().nonnegative().optional(), // minutes per execution
});
