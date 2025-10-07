import express from 'express';
import { KafkaEventBus } from './events/kafka-event-bus.js';
/**
 * Workflow Service
 *
 * Status: Not started (planned for Weeks 9-12)
 * This service is scaffolded but not yet operational.
 *
 * Uses Supabase-first architecture (ADR-001)
 */
declare const app: express.Application;
declare const workflowEngine: null;
declare const eventBus: KafkaEventBus | null;
export { app, workflowEngine, eventBus };
//# sourceMappingURL=index.d.ts.map