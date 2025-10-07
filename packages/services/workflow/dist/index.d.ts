import express from 'express';
import { WorkflowEngine } from './engine';
import { KafkaEventBus } from './events/kafka-event-bus';
/**
 * Workflow Service
 *
 * Main entry point for the workflow automation service
 */
declare const app: express.Application;
declare const workflowEngine: WorkflowEngine;
declare const eventBus: KafkaEventBus;
export { app, workflowEngine, eventBus };
//# sourceMappingURL=index.d.ts.map