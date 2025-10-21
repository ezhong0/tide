import express from 'express';
import { ServiceBase, type HealthStatus } from '@tide/base';
declare class WorkflowService extends ServiceBase {
    private taskRepository;
    private workflowRepository;
    private patternRepository;
    private taskEngine;
    private patternDetector;
    private statePersistence;
    private dagExecutor;
    private eventBus;
    constructor();
    /**
     * Initialize service resources
     */
    protected initialize(): Promise<void>;
    /**
     * Setup Express routes
     */
    protected setupRoutes(app: express.Application): void;
    /**
     * Custom health checks
     */
    protected healthCheck(): Promise<Partial<HealthStatus>>;
}
export { WorkflowService };
//# sourceMappingURL=index.d.ts.map