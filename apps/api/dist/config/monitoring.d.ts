import * as Sentry from '@sentry/node';
import { FastifyInstance } from 'fastify';
/**
 * Initialize Sentry error tracking
 */
export declare function initializeSentry(): void;
/**
 * Register Sentry with Fastify
 */
export declare function registerSentryWithFastify(app: FastifyInstance): void;
/**
 * Capture custom error with context
 */
export declare function captureError(error: Error, context?: Record<string, unknown>): void;
/**
 * Capture custom message
 */
export declare function captureMessage(message: string, level?: Sentry.SeverityLevel): void;
//# sourceMappingURL=monitoring.d.ts.map