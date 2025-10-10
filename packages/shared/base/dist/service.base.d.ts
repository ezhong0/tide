/**
 * Base Service Class
 * Provides common functionality for all microservices
 *
 * Features:
 * - Standardized initialization
 * - Graceful shutdown handling
 * - Health check endpoint
 * - Structured logging
 * - Resource lifecycle management
 */
import type { Express } from 'express';
import type { Logger } from 'pino';
export interface ServiceConfig {
    name: string;
    version: string;
    port: number;
    shutdownTimeout?: number;
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    service: string;
    version: string;
    timestamp: string;
    uptime: number;
    checks?: Record<string, {
        status: string;
        details?: unknown;
    }>;
}
/**
 * Abstract base class for all services
 * Ensures consistent patterns across the platform
 */
export declare abstract class ServiceBase {
    protected readonly logger: Logger;
    protected readonly config: ServiceConfig;
    protected readonly resources: Set<Resource>;
    private server?;
    private isShuttingDown;
    constructor(config: ServiceConfig);
    /**
     * Initialize service - implement in subclass
     */
    protected abstract initialize(): Promise<void>;
    /**
     * Setup Express routes - implement in subclass
     */
    protected abstract setupRoutes(app: Express): void;
    /**
     * Perform health checks - override in subclass
     */
    protected healthCheck(): Promise<Partial<HealthStatus>>;
    /**
     * Register a resource for lifecycle management
     */
    protected registerResource(resource: Resource): void;
    /**
     * Start the service
     */
    start(app: Express): Promise<void>;
    /**
     * Stop the service gracefully
     */
    stop(): Promise<void>;
    /**
     * Setup signal handlers for graceful shutdown
     */
    private setupShutdownHandlers;
}
/**
 * Resource interface for lifecycle management
 * Implement this for database connections, caches, etc.
 */
export interface Resource {
    name: string;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=service.base.d.ts.map