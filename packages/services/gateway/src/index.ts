import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { env } from '@tide/config';
import { logger } from '@tide/logger';

const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for GraphQL Playground
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json());

// Health check endpoint (available before GraphQL)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

// Initialize Apollo Gateway
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      // Add your subgraph services here as they become available
      // Example:
      // { name: 'auth', url: env.AUTH_SERVICE_URL },
      // { name: 'ai', url: env.AI_SERVICE_URL },
      // { name: 'email', url: env.EMAIL_SERVICE_URL },
      // { name: 'calendar', url: env.CALENDAR_SERVICE_URL },
      // { name: 'workflow', url: env.WORKFLOW_SERVICE_URL },
    ],
  }),
  // Service health checks
  serviceHealthCheck: true,
});

// Create Apollo Server
const server = new ApolloServer({
  gateway,
  // Enable introspection and playground in development
  introspection: env.NODE_ENV === 'development',
  plugins: [
    {
      async requestDidStart() {
        return {
          async didEncounterErrors(requestContext) {
            logger.error({
              errors: requestContext.errors,
              query: requestContext.request.query,
              variables: requestContext.request.variables,
            }, 'GraphQL errors encountered');
          },
        };
      },
    },
  ],
});

// Start server
async function startServer() {
  await server.start();

  // Apply GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract user from JWT if present
        const token = req.headers.authorization?.replace('Bearer ', '');

        return {
          token,
          // Add more context as needed (user, permissions, etc.)
        };
      },
    })
  );

  const PORT = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT) : 4000;

  app.listen(PORT, () => {
    logger.info({
      port: PORT,
      service: 'gateway',
      graphqlPath: '/graphql',
    }, 'API Gateway started');
  });
}

startServer().catch((error) => {
  logger.error({ error }, 'Failed to start API Gateway');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

export default app;
