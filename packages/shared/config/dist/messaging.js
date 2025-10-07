"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTypes = exports.kafkaTopics = void 0;
/**
 * Kafka topic names
 */
exports.kafkaTopics = {
    userEvents: 'user.events',
    messageEvents: 'message.events',
    emailEvents: 'email.events',
    calendarEvents: 'calendar.events',
    taskEvents: 'task.events',
    workflowEvents: 'workflow.events',
    aiEvents: 'ai.events',
    systemEvents: 'system.events',
    deadLetterQueue: 'dlq.events',
};
/**
 * Event type categories
 */
exports.eventTypes = {
    // User events
    USER_REGISTERED: 'user.registered',
    USER_AUTHENTICATED: 'user.authenticated',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    // Message events
    MESSAGE_RECEIVED: 'message.received',
    MESSAGE_PROCESSED: 'message.processed',
    MESSAGE_INTENT_DETECTED: 'message.intent.detected',
    MESSAGE_RESPONSE_GENERATED: 'message.response.generated',
    // Email events
    EMAIL_RECEIVED: 'email.received',
    EMAIL_SENT: 'email.sent',
    EMAIL_TRIAGED: 'email.triaged',
    EMAIL_DRAFT_GENERATED: 'email.draft.generated',
    // Calendar events
    CALENDAR_EVENT_CREATED: 'calendar.event.created',
    CALENDAR_EVENT_UPDATED: 'calendar.event.updated',
    CALENDAR_OPTIMIZED: 'calendar.optimized',
    // Workflow events
    WORKFLOW_STARTED: 'workflow.started',
    WORKFLOW_STEP_COMPLETED: 'workflow.step.completed',
    WORKFLOW_COMPLETED: 'workflow.completed',
    WORKFLOW_FAILED: 'workflow.failed',
    // AI events
    AI_REQUEST_STARTED: 'ai.request.started',
    AI_REQUEST_COMPLETED: 'ai.request.completed',
    AI_TOKENS_USED: 'ai.tokens.used',
};
