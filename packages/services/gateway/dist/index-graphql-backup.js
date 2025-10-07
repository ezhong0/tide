import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { env } from '@tide/config';
import { logger } from '@tide/logger';
import { createAuthContext } from './middleware/auth.js';
const app = express();
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
// Build subgraphs list from environment variables
const subgraphs = [];
if (process.env.AI_SERVICE_URL) {
    subgraphs.push({ name: 'ai', url: `${process.env.AI_SERVICE_URL}/graphql` });
}
if (process.env.EMAIL_SERVICE_URL) {
    subgraphs.push({ name: 'email', url: `${process.env.EMAIL_SERVICE_URL}/graphql` });
}
if (process.env.CALENDAR_SERVICE_URL) {
    subgraphs.push({ name: 'calendar', url: `${process.env.CALENDAR_SERVICE_URL}/graphql` });
}
if (process.env.WORKFLOW_SERVICE_URL) {
    subgraphs.push({ name: 'workflow', url: `${process.env.WORKFLOW_SERVICE_URL}/graphql` });
}
// Initialize Apollo Gateway (if subgraphs available)
const gateway = subgraphs.length > 0 ? new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs,
    }),
    // Service health checks
    serviceHealthCheck: true,
}) : null;
logger.info({ subgraphs: subgraphs.map(s => s.name) }, 'Gateway configured with subgraphs');
// Create Apollo Server (only if gateway exists)
const server = gateway ? new ApolloServer({
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
}) : null;
// Start server
async function startServer() {
    if (server) {
        await server.start();
        // Apply GraphQL middleware
        app.use('/graphql', expressMiddleware(server, {
            context: async ({ req }) => {
                // Verify JWT and create auth context
                // Set required=false to allow introspection queries without auth
                try {
                    const authContext = createAuthContext(req.headers.authorization, false // Optional auth - allows introspection
                    );
                    return {
                        ...authContext,
                        // Services can check isAuthenticated to enforce auth
                        requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
                    };
                }
                catch (error) {
                    // Log auth errors but still allow request (services can reject)
                    logger.warn({ error, path: req.path }, 'Authentication failed');
                    return {
                        userId: '',
                        email: '',
                        isAuthenticated: false,
                        requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
                    };
                }
            },
        }));
    }
    else {
        logger.warn('No subgraphs configured - GraphQL endpoint disabled');
        // Return helpful message for GraphQL endpoint
        app.use('/graphql', (req, res) => {
            res.status(503).json({
                error: 'GraphQL gateway not configured',
                message: 'No subgraph services are available. Configure AI_SERVICE_URL, EMAIL_SERVICE_URL, etc.',
            });
        });
    }
    const PORT = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT) : 4000;
    app.listen(PORT, () => {
        logger.info({
            port: PORT,
            service: 'gateway',
            graphqlPath: server ? '/graphql' : 'disabled',
            graphqlEnabled: !!server,
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
    if (server) {
        await server.stop();
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    if (server) {
        await server.stop();
    }
    process.exit(0);
});
export default app;
//# sourceMappingURL=index-graphql-backup.js.map