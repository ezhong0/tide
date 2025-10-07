"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const gateway_1 = require("@apollo/gateway");
const config_1 = require("@tide/config");
const logger_1 = require("@tide/logger");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable for GraphQL Playground
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json());
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
const gateway = new gateway_1.ApolloGateway({
    supergraphSdl: new gateway_1.IntrospectAndCompose({
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
const server = new server_1.ApolloServer({
    gateway,
    // Enable introspection and playground in development
    introspection: config_1.env.NODE_ENV === 'development',
    plugins: [
        {
            async requestDidStart() {
                return {
                    async didEncounterErrors(requestContext) {
                        logger_1.logger.error({
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
    app.use('/graphql', (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            // Extract user from JWT if present
            const token = req.headers.authorization?.replace('Bearer ', '');
            return {
                token,
                // Add more context as needed (user, permissions, etc.)
            };
        },
    }));
    const PORT = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT) : 4000;
    app.listen(PORT, () => {
        logger_1.logger.info({
            port: PORT,
            service: 'gateway',
            graphqlPath: '/graphql',
        }, 'API Gateway started');
    });
}
startServer().catch((error) => {
    logger_1.logger.error({ error }, 'Failed to start API Gateway');
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await server.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await server.stop();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map