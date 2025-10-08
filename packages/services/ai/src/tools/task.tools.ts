/**
 * Task & Workflow Tools for GPT-5 Function Calling
 */

import type { TideTool } from './types.js';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'TaskTools' });

/**
 * Create a new task
 */
export const createTaskTool: TideTool = {
  type: 'function',
  name: 'create_task',
  description: 'Create a new task with optional sub-tasks, priority, and due date. Returns the created task with its ID.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Task title or description',
      },
      description: {
        type: 'string',
        description: 'Detailed description of the task',
      },
      priority: {
        type: 'string',
        description: 'Task priority level',
        enum: ['low', 'medium', 'high', 'urgent'],
      },
      dueDate: {
        type: 'string',
        description: 'Task due date (ISO 8601 format)',
      },
      estimatedHours: {
        type: 'number',
        description: 'Estimated hours to complete the task',
        minimum: 0.25,
        maximum: 1000,
      },
      subtasks: {
        type: 'array',
        description: 'List of subtask titles',
        items: {
          type: 'string',
          description: 'Subtask title',
        },
      },
      tags: {
        type: 'array',
        description: 'Tags or categories for the task',
        items: {
          type: 'string',
          description: 'Tag name',
        },
      },
    },
    required: ['title'],
  },
  handler: async (params, context) => {
    const {
      title,
      description,
      priority = 'medium',
      dueDate,
      estimatedHours,
      subtasks,
      tags,
    } = params;

    logger.info('Creating task', {
      title,
      priority,
      userId: context.userId,
    });

    const response = await fetch(`${process.env.WORKFLOW_SERVICE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.userId}`,
      },
      body: JSON.stringify({
        userId: context.userId,
        title,
        description,
        priority,
        dueDate,
        estimatedHours,
        subtasks,
        tags,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * Get user tasks with optional filters
 */
export const getTasksTool: TideTool = {
  type: 'function',
  name: 'get_tasks',
  description: 'Retrieve user tasks, optionally filtered by status, priority, or due date. Returns list of tasks with details.',
  parameters: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: 'Filter by task status',
        enum: ['pending', 'in_progress', 'completed', 'blocked'],
      },
      priority: {
        type: 'string',
        description: 'Filter by priority level',
        enum: ['low', 'medium', 'high', 'urgent'],
      },
      dueBefore: {
        type: 'string',
        description: 'Show only tasks due before this date (ISO 8601)',
      },
      dueAfter: {
        type: 'string',
        description: 'Show only tasks due after this date (ISO 8601)',
      },
      tags: {
        type: 'array',
        description: 'Filter by tags',
        items: {
          type: 'string',
          description: 'Tag name',
        },
      },
      limit: {
        type: 'number',
        description: 'Maximum number of tasks to return (default: 50)',
        minimum: 1,
        maximum: 200,
      },
    },
    required: [],
  },
  handler: async (params, context) => {
    const { status, priority, dueBefore, dueAfter, tags, limit = 50 } = params;

    logger.info('Getting tasks', {
      status,
      priority,
      userId: context.userId,
    });

    const queryParams = new URLSearchParams({
      userId: context.userId,
      limit: limit.toString(),
    });

    if (status) queryParams.append('status', status);
    if (priority) queryParams.append('priority', priority);
    if (dueBefore) queryParams.append('dueBefore', dueBefore);
    if (dueAfter) queryParams.append('dueAfter', dueAfter);
    if (tags) tags.forEach((tag: string) => queryParams.append('tags', tag));

    const response = await fetch(
      `${process.env.WORKFLOW_SERVICE_URL}/api/tasks?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${context.userId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get tasks: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * Prioritize tasks using AI
 */
export const prioritizeTasksTool: TideTool = {
  type: 'function',
  name: 'prioritize_tasks',
  description: 'Use AI to prioritize a list of tasks based on deadlines, dependencies, and importance. Returns tasks ranked by priority with reasoning.',
  parameters: {
    type: 'object',
    properties: {
      taskIds: {
        type: 'array',
        description: 'Array of task IDs to prioritize. If empty, prioritizes all user tasks.',
        items: {
          type: 'string',
          description: 'Task ID',
        },
      },
      criteria: {
        type: 'object',
        description: 'Weighting criteria for prioritization',
        properties: {
          weightDeadline: {
            type: 'number',
            description: 'Weight for deadline urgency (0-1)',
            minimum: 0,
            maximum: 1,
          },
          weightImpact: {
            type: 'number',
            description: 'Weight for business impact (0-1)',
            minimum: 0,
            maximum: 1,
          },
          weightEffort: {
            type: 'number',
            description: 'Weight for effort required (0-1, lower effort = higher priority)',
            minimum: 0,
            maximum: 1,
          },
        },
      },
      considerDependencies: {
        type: 'boolean',
        description: 'Whether to consider task dependencies in prioritization (default: true)',
      },
    },
    required: [],
  },
  handler: async (params, context) => {
    const {
      taskIds,
      criteria = {
        weightDeadline: 0.4,
        weightImpact: 0.4,
        weightEffort: 0.2,
      },
      considerDependencies = true,
    } = params;

    logger.info('Prioritizing tasks', {
      count: taskIds?.length || 'all',
      userId: context.userId,
    });

    const response = await fetch(`${process.env.WORKFLOW_SERVICE_URL}/api/tasks/prioritize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.userId}`,
      },
      body: JSON.stringify({
        userId: context.userId,
        taskIds,
        criteria,
        considerDependencies,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to prioritize tasks: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * Update task status
 */
export const updateTaskStatusTool: TideTool = {
  type: 'function',
  name: 'update_task_status',
  description: 'Update the status of a task (e.g., mark as complete, in progress, or blocked). Returns the updated task.',
  parameters: {
    type: 'object',
    properties: {
      taskId: {
        type: 'string',
        description: 'ID of the task to update',
      },
      status: {
        type: 'string',
        description: 'New status for the task',
        enum: ['pending', 'in_progress', 'completed', 'blocked'],
      },
      completionNotes: {
        type: 'string',
        description: 'Optional notes about completion or blockers',
      },
    },
    required: ['taskId', 'status'],
  },
  handler: async (params, context) => {
    const { taskId, status, completionNotes } = params;

    logger.info('Updating task status', {
      taskId,
      status,
      userId: context.userId,
    });

    const response = await fetch(`${process.env.WORKFLOW_SERVICE_URL}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.userId}`,
      },
      body: JSON.stringify({
        userId: context.userId,
        status,
        completionNotes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task status: ${response.statusText}`);
    }

    return await response.json();
  },
};

/**
 * All task tools
 */
export const taskTools: TideTool[] = [
  createTaskTool,
  getTasksTool,
  prioritizeTasksTool,
  updateTaskStatusTool,
];
