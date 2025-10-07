/**
 * Kafka topic names
 */
export declare const kafkaTopics: {
    readonly userEvents: "user.events";
    readonly messageEvents: "message.events";
    readonly emailEvents: "email.events";
    readonly calendarEvents: "calendar.events";
    readonly taskEvents: "task.events";
    readonly workflowEvents: "workflow.events";
    readonly aiEvents: "ai.events";
    readonly systemEvents: "system.events";
    readonly deadLetterQueue: "dlq.events";
};
export type KafkaTopic = typeof kafkaTopics[keyof typeof kafkaTopics];
/**
 * Event type categories
 */
export declare const eventTypes: {
    readonly USER_REGISTERED: "user.registered";
    readonly USER_AUTHENTICATED: "user.authenticated";
    readonly USER_UPDATED: "user.updated";
    readonly USER_DELETED: "user.deleted";
    readonly MESSAGE_RECEIVED: "message.received";
    readonly MESSAGE_PROCESSED: "message.processed";
    readonly MESSAGE_INTENT_DETECTED: "message.intent.detected";
    readonly MESSAGE_RESPONSE_GENERATED: "message.response.generated";
    readonly EMAIL_RECEIVED: "email.received";
    readonly EMAIL_SENT: "email.sent";
    readonly EMAIL_TRIAGED: "email.triaged";
    readonly EMAIL_DRAFT_GENERATED: "email.draft.generated";
    readonly CALENDAR_EVENT_CREATED: "calendar.event.created";
    readonly CALENDAR_EVENT_UPDATED: "calendar.event.updated";
    readonly CALENDAR_OPTIMIZED: "calendar.optimized";
    readonly WORKFLOW_STARTED: "workflow.started";
    readonly WORKFLOW_STEP_COMPLETED: "workflow.step.completed";
    readonly WORKFLOW_COMPLETED: "workflow.completed";
    readonly WORKFLOW_FAILED: "workflow.failed";
    readonly AI_REQUEST_STARTED: "ai.request.started";
    readonly AI_REQUEST_COMPLETED: "ai.request.completed";
    readonly AI_TOKENS_USED: "ai.tokens.used";
};
