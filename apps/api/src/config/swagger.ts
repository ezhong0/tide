import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env } from './env.js';

/**
 * Configure Swagger/OpenAPI documentation
 */
export async function registerSwagger(app: FastifyInstance): Promise<void> {
  // Register Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Tide API',
        description: 'AI Executive Assistant - Backend API for voice-first task automation',
        version: '0.1.0',
        contact: {
          name: 'Tide Team',
          email: 'support@tide.app',
        },
        license: {
          name: 'UNLICENSED',
        },
      },
      servers: [
        {
          url: env.API_URL,
          description: 'Current environment',
        },
        {
          url: 'http://localhost:3000',
          description: 'Local development',
        },
      ],
      tags: [
        {
          name: 'auth',
          description: 'Authentication endpoints',
        },
        {
          name: 'commands',
          description: 'Voice command processing',
        },
        {
          name: 'emails',
          description: 'Email management',
        },
        {
          name: 'calendar',
          description: 'Calendar management',
        },
        {
          name: 'drafts',
          description: 'Draft review and approval',
        },
        {
          name: 'follow-ups',
          description: 'Follow-up tracking',
        },
        {
          name: 'health',
          description: 'Health check and monitoring',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  // Register Swagger UI
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  app.log.info(`📚 API documentation available at ${env.API_URL}/docs`);
}
