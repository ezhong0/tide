/**
 * Circuit Breaker Pattern
 *
 * Protects services from cascading failures by monitoring error rates
 * and temporarily blocking requests when errors exceed threshold.
 */
export declare enum CircuitState {
    CLOSED = "CLOSED",// Normal operation
    OPEN = "OPEN",// Blocking requests
    HALF_OPEN = "HALF_OPEN"
}
export declare class CircuitBreakerError extends Error {
    readonly state: CircuitState;
    constructor(message: string, state: CircuitState);
}
export interface CircuitBreakerOptions {
    /** Error threshold percentage (0-100) before opening circuit */
    errorThresholdPercentage: number;
    /** Time in ms to wait before attempting reset */
    resetTimeout: number;
    /** Request timeout in ms */
    timeout: number;
    /** Minimum number of requests before calculating error rate */
    volumeThreshold?: number;
    /** Name for logging purposes */
    name?: string;
}
interface CircuitBreakerStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastFailureTime?: number;
}
/**
 * Circuit Breaker implementation
 *
 * Monitors request success/failure rates and opens circuit when
 * error threshold is exceeded, preventing requests to failing services.
 *
 * States:
 * - CLOSED: Normal operation, all requests allowed
 * - OPEN: Too many failures, requests blocked
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 *
 * @example
 * const breaker = new CircuitBreaker({
 *   errorThresholdPercentage: 50,
 *   resetTimeout: 30000,
 *   timeout: 5000,
 *   name: 'EmailService',
 * });
 *
 * const result = await breaker.execute(async () => {
 *   return await fetch('/api/emails');
 * });
 */
export declare class CircuitBreaker {
    private options;
    private state;
    private stats;
    private nextAttemptTime?;
    private readonly volumeThreshold;
    private readonly name;
    constructor(options: CircuitBreakerOptions);
    /**
     * Execute a function with circuit breaker protection
     *
     * @param fn - Async function to execute
     * @returns Function result
     * @throws CircuitBreakerError if circuit is open
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Record a successful request
     */
    private recordSuccess;
    /**
     * Record a failed request
     */
    private recordFailure;
    /**
     * Check if circuit should be opened based on error rate
     */
    private shouldOpenCircuit;
    /**
     * Open the circuit
     */
    private openCircuit;
    /**
     * Check if we should attempt to reset the circuit
     */
    private shouldAttemptReset;
    /**
     * Reset statistics
     */
    private resetStats;
    /**
     * Get current circuit state
     */
    getState(): CircuitState;
    /**
     * Get current statistics
     */
    getStats(): Readonly<CircuitBreakerStats>;
    /**
     * Manually reset the circuit breaker
     */
    reset(): void;
}
/**
 * Create a circuit breaker wrapper for a function
 *
 * @param fn - Function to wrap
 * @param options - Circuit breaker options
 * @returns Wrapped function with circuit breaker protection
 *
 * @example
 * const fetchEmails = withCircuitBreaker(
 *   async () => await emailService.fetch(),
 *   { errorThresholdPercentage: 50, resetTimeout: 30000, timeout: 5000 }
 * );
 */
export declare function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(fn: T, options: CircuitBreakerOptions): T;
export {};
//# sourceMappingURL=circuit-breaker.d.ts.map