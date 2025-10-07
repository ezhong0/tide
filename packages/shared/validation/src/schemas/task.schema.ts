import { z } from 'zod';
import { DateTimeSchema } from './base.schema';

/**
 * Task priority schema
 */
export const TaskPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

/**
 * Task status schema
 */
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'blocked', 'completed', 'cancelled']);

/**
 * Task schema
 */
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: TaskPrioritySchema,
  status: TaskStatusSchema,
  assignee: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
  dueDate: DateTimeSchema.optional(),
  completedAt: DateTimeSchema.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  workflowId: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  subtasks: z.array(z.string().uuid()).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Create task schema
 */
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: TaskPrioritySchema.default('normal'),
  assignee: z.string().uuid().optional(),
  dueDate: DateTimeSchema.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  workflowId: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
});

export type CreateTask = z.infer<typeof CreateTaskSchema>;

/**
 * Update task schema
 */
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  priority: TaskPrioritySchema.optional(),
  status: TaskStatusSchema.optional(),
  assignee: z.string().uuid().optional(),
  dueDate: DateTimeSchema.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

/**
 * Workflow status schema
 */
export const WorkflowStatusSchema = z.enum(['pending', 'running', 'paused', 'completed', 'failed', 'cancelled']);

/**
 * Workflow step schema
 */
export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
  config: z.record(z.any()).optional(),
  result: z.any().optional(),
  error: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

/**
 * Workflow schema
 */
export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: WorkflowStatusSchema,
  currentStep: z.number().int().nonnegative(),
  totalSteps: z.number().int().positive(),
  completedSteps: z.number().int().nonnegative(),
  progress: z.number().min(0).max(1),
  steps: z.array(WorkflowStepSchema),
  trigger: z.object({
    type: z.enum(['manual', 'scheduled', 'event', 'pattern']),
    config: z.record(z.any()).optional(),
  }),
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
    time: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * Create workflow schema
 */
export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  steps: z.array(z.object({
    name: z.string(),
    type: z.string(),
    config: z.record(z.any()).optional(),
  })).min(1),
  trigger: z.object({
    type: z.enum(['manual', 'scheduled', 'event', 'pattern']),
    config: z.record(z.any()).optional(),
  }),
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
    time: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;

/**
 * Workflow pattern detection schema
 */
export const WorkflowPatternSchema = z.object({
  patternDetected: z.boolean(),
  pattern: z.object({
    name: z.string(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'occasional']),
    steps: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    occurrences: z.number().int().positive(),
    lastOccurrence: z.date(),
  }).optional(),
  suggestAutomation: z.boolean(),
  estimatedTimeSavings: z.number().int().nonnegative().optional(), // minutes per execution
});

export type WorkflowPattern = z.infer<typeof WorkflowPatternSchema>;
