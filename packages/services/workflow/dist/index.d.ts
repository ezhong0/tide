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
import { SupabaseTaskRepository, SupabaseWorkflowRepository, SupabasePatternRepository } from './supabase-adapter.js';
import { TaskEngine } from './tasks/task-engine.js';
import { PatternDetector } from './patterns/pattern-detector.js';
declare const taskRepository: SupabaseTaskRepository;
declare const workflowRepository: SupabaseWorkflowRepository;
declare const patternRepository: SupabasePatternRepository;
declare const taskEngine: TaskEngine;
declare const patternDetector: PatternDetector;
declare const eventBus: KafkaEventBus | null;
export { app, eventBus, taskEngine, patternDetector, workflowRepository, taskRepository, patternRepository, };
//# sourceMappingURL=index.d.ts.map