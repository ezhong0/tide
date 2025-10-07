/**
 * Email service main application
 */
declare class EmailService {
    private app;
    private triageEngine;
    private composer;
    private providers;
    constructor();
    /**
     * Setup Express middleware
     */
    private setupMiddleware;
    /**
     * Setup API routes
     */
    private setupRoutes;
    /**
     * Get email provider instance
     */
    private getProvider;
    /**
     * Start the email service
     */
    start(): Promise<void>;
}
export { EmailService };
//# sourceMappingURL=index.d.ts.map