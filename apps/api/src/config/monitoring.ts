import * as Sentry from '@sentry/node';
import { FastifyInstance } from 'fastify';

import { env } from './env.js';

/**
 * Initialize Sentry error tracking
 */
export function initializeSentry(): void {
  if (!env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,

    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],

    beforeSend(event, hint) {
      // Scrub sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
      }

      // Remove sensitive context
      if (event.contexts) {
        delete event.contexts.Authorization;
      }

      return event;
    },
  });

  console.log('✅ Sentry initialized');
}

/**
 * Register Sentry with Fastify
 */
export function registerSentryWithFastify(app: FastifyInstance): void {
  // Setup request handler
  app.addHook('onRequest', (request, reply, done) => {
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      headers: {
        'user-agent': request.headers['user-agent'],
      },
    });
    done();
  });

  // Setup error handler
  app.setErrorHandler((error, request, reply) => {
    Sentry.captureException(error, {
      contexts: {
        fastify: {
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
          },
        },
      },
    });

    // Let Fastify handle the response
    reply.send(error);
  });
}

/**
 * Capture custom error with context
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      service: 'tide-api',
    },
  });
}

/**
 * Capture custom message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}
