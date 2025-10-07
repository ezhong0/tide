/**
 * Calendar service main application
 */
declare class CalendarService {
    private app;
    private scheduler;
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
     * Get calendar provider instance
     */
    private getProvider;
    /**
     * Start the calendar service
     */
    start(): Promise<void>;
}
export { CalendarService };
//# sourceMappingURL=index.d.ts.map