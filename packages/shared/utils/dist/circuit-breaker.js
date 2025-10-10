/**
 * Circuit Breaker Pattern
 *
 * Protects services from cascading failures by monitoring error rates
 * and temporarily blocking requests when errors exceed threshold.
 */
// Logger would be provided by consuming package
const logger = {
    info: (...args) => console.log('[CircuitBreaker]', ...args),
    warn: (...args) => console.warn('[CircuitBreaker]', ...args),
    error: (...args) => console.error('[CircuitBreaker]', ...args),
};
export var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
export class CircuitBreakerError extends Error {
    constructor(message, state) {
        super(message);
        this.state = state;
        this.name = 'CircuitBreakerError';
    }
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
export class CircuitBreaker {
    constructor(options) {
        this.options = options;
        this.state = CircuitState.CLOSED;
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
        };
        this.volumeThreshold = options.volumeThreshold || 10;
        this.name = options.name || 'CircuitBreaker';
    }
    /**
     * Execute a function with circuit breaker protection
     *
     * @param fn - Async function to execute
     * @returns Function result
     * @throws CircuitBreakerError if circuit is open
     */
    async execute(fn) {
        // Check if circuit is open
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
            }
            else {
                const timeUntilReset = this.nextAttemptTime - Date.now();
                throw new CircuitBreakerError(`Circuit breaker ${this.name} is OPEN. Retry in ${timeUntilReset}ms`, CircuitState.OPEN);
            }
        }
        try {
            // Execute with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Timeout after ${this.options.timeout}ms`));
                }, this.options.timeout);
            });
            const result = await Promise.race([fn(), timeoutPromise]);
            this.recordSuccess();
            return result;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    /**
     * Record a successful request
     */
    recordSuccess() {
        this.stats.totalRequests++;
        this.stats.successfulRequests++;
        // If in HALF_OPEN and request succeeded, close the circuit
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.CLOSED;
            this.resetStats();
            logger.info(`Circuit breaker ${this.name} closed (service recovered)`);
        }
    }
    /**
     * Record a failed request
     */
    recordFailure() {
        this.stats.totalRequests++;
        this.stats.failedRequests++;
        this.stats.lastFailureTime = Date.now();
        // If in HALF_OPEN and request failed, open the circuit again
        if (this.state === CircuitState.HALF_OPEN) {
            this.openCircuit();
            return;
        }
        // Check if we should open the circuit
        if (this.shouldOpenCircuit()) {
            this.openCircuit();
        }
    }
    /**
     * Check if circuit should be opened based on error rate
     */
    shouldOpenCircuit() {
        if (this.stats.totalRequests < this.volumeThreshold) {
            return false; // Not enough data yet
        }
        const errorPercentage = (this.stats.failedRequests / this.stats.totalRequests) * 100;
        return errorPercentage >= this.options.errorThresholdPercentage;
    }
    /**
     * Open the circuit
     */
    openCircuit() {
        this.state = CircuitState.OPEN;
        this.nextAttemptTime = Date.now() + this.options.resetTimeout;
        logger.warn(`Circuit breaker ${this.name} opened`, {
            stats: this.stats,
            errorRate: `${((this.stats.failedRequests / this.stats.totalRequests) * 100).toFixed(2)}%`,
            resetIn: `${this.options.resetTimeout}ms`,
        });
    }
    /**
     * Check if we should attempt to reset the circuit
     */
    shouldAttemptReset() {
        return !!this.nextAttemptTime && Date.now() >= this.nextAttemptTime;
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
        };
    }
    /**
     * Get current circuit state
     */
    getState() {
        return this.state;
    }
    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Manually reset the circuit breaker
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.resetStats();
        this.nextAttemptTime = undefined;
        logger.info(`Circuit breaker ${this.name} manually reset`);
    }
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
export function withCircuitBreaker(fn, options) {
    const breaker = new CircuitBreaker(options);
    return (async (...args) => {
        return breaker.execute(() => fn(...args));
    });
}
//# sourceMappingURL=circuit-breaker.js.map