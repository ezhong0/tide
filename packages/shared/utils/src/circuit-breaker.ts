/**
 * Circuit Breaker Pattern
 * 
 * Protects services from cascading failures by monitoring error rates
 * and temporarily blocking requests when errors exceed threshold.
 */

// Logger would be provided by consuming package
const logger = {
  info: (...args: any[]) => console.log('[CircuitBreaker]', ...args),
  warn: (...args: any[]) => console.warn('[CircuitBreaker]', ...args),
  error: (...args: any[]) => console.error('[CircuitBreaker]', ...args),
};

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Blocking requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export class CircuitBreakerError extends Error {
  constructor(message: string, public readonly state: CircuitState) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
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
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private stats: CircuitBreakerStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
  };
  private nextAttemptTime?: number;
  private readonly volumeThreshold: number;
  private readonly name: string;

  constructor(private options: CircuitBreakerOptions) {
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
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
      } else {
        const timeUntilReset = this.nextAttemptTime! - Date.now();
        throw new CircuitBreakerError(
          `Circuit breaker ${this.name} is OPEN. Retry in ${timeUntilReset}ms`,
          CircuitState.OPEN
        );
      }
    }

    try {
      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout after ${this.options.timeout}ms`));
        }, this.options.timeout);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a successful request
   */
  private recordSuccess(): void {
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
  private recordFailure(): void {
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
  private shouldOpenCircuit(): boolean {
    if (this.stats.totalRequests < this.volumeThreshold) {
      return false; // Not enough data yet
    }

    const errorPercentage = (this.stats.failedRequests / this.stats.totalRequests) * 100;
    return errorPercentage >= this.options.errorThresholdPercentage;
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
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
  private shouldAttemptReset(): boolean {
    return !!this.nextAttemptTime && Date.now() >= this.nextAttemptTime;
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
    };
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get current statistics
   */
  getStats(): Readonly<CircuitBreakerStats> {
    return { ...this.stats };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
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
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CircuitBreakerOptions
): T {
  const breaker = new CircuitBreaker(options);
  
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return breaker.execute(() => fn(...args));
  }) as T;
}

