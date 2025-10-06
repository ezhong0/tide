#!/usr/bin/env node
/**
 * OpenAPI Spec Generator
 *
 * Generates OpenAPI 3.0 specification from API contracts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodSchema } from 'zod';

import {
  EmailContracts,
  CalendarContracts,
  CommandContracts,
  ContextContracts,
  AuthContracts,
} from '../packages/api-contracts/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// OpenAPI Base Spec
// ============================================================================

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact?: {
      name: string;
      email: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
  tags: Array<{
    name: string;
    description: string;
  }>;
}

const openAPISpec: OpenAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'Tide API',
    version: '1.0.0',
    description: 'AI-powered email and calendar assistant API',
    contact: {
      name: 'Tide Team',
      email: 'support@tide.app',
    },
    license: {
      name: 'UNLICENSED',
      url: 'https://tide.app/license',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api-staging.tide.app',
      description: 'Staging server',
    },
    {
      url: 'https://api.tide.app',
      description: 'Production server',
    },
  ],
  paths: {},
  components: {
    schemas: {},
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from OAuth flow',
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and OAuth endpoints',
    },
    {
      name: 'Email',
      description: 'Email management and operations',
    },
    {
      name: 'Calendar',
      description: 'Calendar event management',
    },
    {
      name: 'Commands',
      description: 'AI command processing',
    },
    {
      name: 'Context',
      description: 'User context and preferences',
    },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

interface Contract {
  method: string;
  path: string;
  request: ZodSchema;
  response: ZodSchema;
}

function addContractToSpec(contract: Contract, moduleName: string, operationId: string): void {
  const pathKey = contract.path;
  const method = contract.method.toLowerCase();

  if (!openAPISpec.paths[pathKey]) {
    openAPISpec.paths[pathKey] = {};
  }

  // Convert path parameters from :id to {id}
  const openApiPath = pathKey.replace(/:(\w+)/g, '{$1}');

  if (!openAPISpec.paths[openApiPath]) {
    openAPISpec.paths[openApiPath] = {};
  }

  // Extract path parameters
  const pathParams = [...pathKey.matchAll(/:(\w+)/g)].map((match) => match[1]);

  // Build parameters array
  const parameters: any[] = [];

  // Add path parameters
  pathParams.forEach((param) => {
    parameters.push({
      name: param,
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: `${param} identifier`,
    });
  });

  // Build request body
  let requestBody;
  if (method !== 'get' && method !== 'delete') {
    try {
      const requestSchema = zodToJsonSchema(contract.request, {
        target: 'openApi3',
        $refStrategy: 'none',
      });

      requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: requestSchema,
          },
        },
      };
    } catch (error) {
      console.warn(`Failed to generate request schema for ${operationId}:`, error);
    }
  }

  // Build response
  let responseSchema;
  try {
    responseSchema = zodToJsonSchema(contract.response, {
      target: 'openApi3',
      $refStrategy: 'none',
    });
  } catch (error) {
    console.warn(`Failed to generate response schema for ${operationId}:`, error);
    responseSchema = { type: 'object' };
  }

  // Add operation to spec
  openAPISpec.paths[openApiPath][method] = {
    tags: [moduleName],
    summary: generateSummary(operationId),
    operationId,
    parameters: parameters.length > 0 ? parameters : undefined,
    requestBody,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: responseSchema,
          },
        },
      },
      '400': {
        description: 'Bad request - Invalid input',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    statusCode: { type: 'number' },
                    code: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      '401': {
        description: 'Unauthorized - Missing or invalid authentication',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    statusCode: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
      '404': {
        description: 'Not found - Resource does not exist',
      },
      '500': {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    statusCode: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: moduleName !== 'Authentication' ? [{ bearerAuth: [] }] : undefined,
  };
}

function generateSummary(operationId: string): string {
  // Convert camelCase to Title Case with spaces
  return operationId
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// ============================================================================
// Generate Spec
// ============================================================================

console.log('🚀 Generating OpenAPI specification...\n');

// Add Authentication contracts
Object.entries(AuthContracts).forEach(([key, contract]) => {
  addContractToSpec(contract as Contract, 'Authentication', `auth.${key}`);
});

// Add Email contracts
Object.entries(EmailContracts).forEach(([key, contract]) => {
  addContractToSpec(contract as Contract, 'Email', `email.${key}`);
});

// Add Calendar contracts
Object.entries(CalendarContracts).forEach(([key, contract]) => {
  addContractToSpec(contract as Contract, 'Calendar', `calendar.${key}`);
});

// Add Command contracts
Object.entries(CommandContracts).forEach(([key, contract]) => {
  addContractToSpec(contract as Contract, 'Commands', `commands.${key}`);
});

// Add Context contracts
Object.entries(ContextContracts).forEach(([key, contract]) => {
  addContractToSpec(contract as Contract, 'Context', `context.${key}`);
});

// Write to file
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const outputPath = path.join(docsDir, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(openAPISpec, null, 2));

console.log('✅ OpenAPI spec generated successfully!');
console.log(`📄 Output: ${outputPath}`);
console.log(
  `📊 Total endpoints: ${Object.keys(openAPISpec.paths).reduce((count, path) => count + Object.keys(openAPISpec.paths[path] as object).length, 0)}`
);
console.log('\n🔍 View the spec at: http://localhost:3000/docs (when server is running)\n');
