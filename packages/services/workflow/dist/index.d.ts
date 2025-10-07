import express from 'express';
import { WorkflowEngine } from './engine/index.js';
import { KafkaEventBus } from './events/kafka-event-bus.js';
/**
 * Workflow Service
 *
 * Status: Not started (planned for Weeks 9-12)
 * This service is scaffolded but not yet operational.
 */
declare const app: express.Application;
declare const workflowEngine: WorkflowEngine | null;
declare const eventBus: KafkaEventBus | null;
export { app, workflowEngine, eventBus };
//# sourceMappingURL=index.d.ts.map