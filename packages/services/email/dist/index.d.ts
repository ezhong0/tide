import express from 'express';
import { ServiceBase, type HealthStatus } from '@tide/base';
/**
 * Email Service
 * Intelligent email management with AI triage, smart composition, and search
 * Extends ServiceBase for graceful shutdown and resource management
 */
declare class EmailService extends ServiceBase {
    private triageEngine;
    private composer;
    private providers;
    private db;
    constructor();
    protected initialize(): Promise<void>;
    protected setupRoutes(app: express.Application): void;
    protected healthCheck(): Promise<Partial<HealthStatus>>;
    /**
     * Get email provider instance
     */
    private getProvider;
}
export { EmailService };
//# sourceMappingURL=index.d.ts.map