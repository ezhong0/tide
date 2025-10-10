/**
 * Retry Utilities with Exponential Backoff
 *
 * Provides retry mechanisms for transient failures with
 * configurable backoff strategies.
 */
export interface RetryOptions {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Initial delay in ms before first retry */
    initialDelayMs: number;
    /** Maximum delay in ms between retries */
    maxDelayMs: number;
    /** Multiplier for exponential backoff (e.g., 2 = double each time) */
    backoffMultiplier: number;
    /** Optional: Only retry for specific error patterns */
    retryableErrors?: RegExp[];
    /** Optional: Custom function to determine if error is retryable */
    isRetryable?: (error: Error) => boolean;
    /** Optional: Name for logging purposes */
    name?: string;
}
export declare class RetryExhaustedError extends Error {
    readonly attempts: number;
    readonly lastError: Error;
    constructor(message: string, attempts: number, lastError: Error);
}
/**
 * Execute a function with retry logic and exponential backoff
 *
 * Retries failed operations with increasing delays between attempts.
 * Delay follows exponential backoff: initialDelay * (multiplier ^ attempt)
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Function result
 * @throws RetryExhaustedError if all retries exhausted
 *
 * @example
 * const data = await retryWithBackoff(
 *   async () => await fetch('/api/data'),
 *   {
 *     maxAttempts: 3,
 *     initialDelayMs: 1000,
 *     maxDelayMs: 10000,
 *     backoffMultiplier: 2,
 *     retryableErrors: [/network/i, /timeout/i],
 *   }
 * );
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T>;
/**
 * Wrap a function with retry logic
 *
 * @param fn - Function to wrap
 * @param options - Retry options
 * @returns Wrapped function with retry logic
 *
 * @example
 * const fetchWithRetry = wrapWithRetry(
 *   async (id: string) => await api.fetch(id),
 *   { maxAttempts: 3, initialDelayMs: 1000, maxDelayMs: 10000, backoffMultiplier: 2 }
 * );
 *
 * const data = await fetchWithRetry('123');
 */
export declare function wrapWithRetry<T extends (...args: any[]) => Promise<any>>(fn: T, options: RetryOptions): T;
/**
 * Common retry patterns for typical failure scenarios
 */
export declare const retryPatterns: {
    /** Network-related errors */
    network: RegExp[];
    /** Rate limit errors */
    rateLimit: RegExp[];
    /** Temporary service errors */
    serviceUnavailable: RegExp[];
    /** Database errors */
    database: RegExp[];
};
/**
 * Preset retry configurations for common scenarios
 */
export declare const retryPresets: {
    /** Conservative retry for production APIs */
    readonly conservative: {
        readonly maxAttempts: 2;
        readonly initialDelayMs: 1000;
        readonly maxDelayMs: 5000;
        readonly backoffMultiplier: 2;
    };
    /** Moderate retry for internal services */
    readonly moderate: {
        readonly maxAttempts: 3;
        readonly initialDelayMs: 1000;
        readonly maxDelayMs: 10000;
        readonly backoffMultiplier: 2;
    };
    /** Aggressive retry for critical operations */
    readonly aggressive: {
        readonly maxAttempts: 5;
        readonly initialDelayMs: 500;
        readonly maxDelayMs: 30000;
        readonly backoffMultiplier: 2;
    };
    /** Quick retry for fast operations */
    readonly quick: {
        readonly maxAttempts: 3;
        readonly initialDelayMs: 100;
        readonly maxDelayMs: 1000;
        readonly backoffMultiplier: 2;
    };
};
/**
 * Retry with jitter to avoid thundering herd
 *
 * Adds random jitter to delay to prevent all clients retrying simultaneously
 *
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Function result
 */
export declare function retryWithJitter<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T>;
//# sourceMappingURL=retry.d.ts.map