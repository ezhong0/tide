/**
 * Retry Utilities with Exponential Backoff
 * 
 * Provides retry mechanisms for transient failures with
 * configurable backoff strategies.
 */

// Logger would be provided by consuming package
const logger = {
  debug: (...args: any[]) => console.debug('[Retry]', ...args),
  warn: (...args: any[]) => console.warn('[Retry]', ...args),
  error: (...args: any[]) => console.error('[Retry]', ...args),
};

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

export class RetryExhaustedError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryExhaustedError';
  }
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
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableErrors,
    isRetryable,
    name = 'Operation',
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.debug(`Attempting ${name}`, { attempt, maxAttempts });
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const shouldRetry = isErrorRetryable(lastError, retryableErrors, isRetryable);

      if (!shouldRetry) {
        logger.warn(`${name} failed with non-retryable error`, {
          attempt,
          error: lastError.message,
        });
        throw lastError;
      }

      // Don't sleep on last attempt
      if (attempt >= maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs
      );

      logger.warn(`${name} failed, retrying`, {
        attempt,
        maxAttempts,
        delayMs: delay,
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  // All retries exhausted
  throw new RetryExhaustedError(
    `${name} failed after ${maxAttempts} attempts: ${lastError!.message}`,
    maxAttempts,
    lastError!
  );
}

/**
 * Check if an error is retryable
 */
function isErrorRetryable(
  error: Error,
  retryablePatterns?: RegExp[],
  customCheck?: (error: Error) => boolean
): boolean {
  // Use custom check if provided
  if (customCheck) {
    return customCheck(error);
  }

  // If no patterns provided, retry all errors
  if (!retryablePatterns || retryablePatterns.length === 0) {
    return true;
  }

  // Check if error matches any retryable pattern
  const errorMessage = error.message.toLowerCase();
  return retryablePatterns.some((pattern) => pattern.test(errorMessage));
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
export function wrapWithRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

/**
 * Common retry patterns for typical failure scenarios
 */
export const retryPatterns = {
  /** Network-related errors */
  network: [
    /network/i,
    /timeout/i,
    /econnrefused/i,
    /enotfound/i,
    /socket hang up/i,
  ],
  
  /** Rate limit errors */
  rateLimit: [
    /rate limit/i,
    /too many requests/i,
    /quota exceeded/i,
    /429/,
  ],
  
  /** Temporary service errors */
  serviceUnavailable: [
    /service unavailable/i,
    /503/,
    /502/,
    /504/,
    /gateway/i,
  ],
  
  /** Database errors */
  database: [
    /deadlock/i,
    /connection refused/i,
    /connection timeout/i,
    /lock/i,
  ],
};

/**
 * Preset retry configurations for common scenarios
 */
export const retryPresets = {
  /** Conservative retry for production APIs */
  conservative: {
    maxAttempts: 2,
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
  },
  
  /** Moderate retry for internal services */
  moderate: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
  
  /** Aggressive retry for critical operations */
  aggressive: {
    maxAttempts: 5,
    initialDelayMs: 500,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
  
  /** Quick retry for fast operations */
  quick: {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
  },
} as const;

/**
 * Retry with jitter to avoid thundering herd
 * 
 * Adds random jitter to delay to prevent all clients retrying simultaneously
 * 
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Function result
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableErrors,
    isRetryable,
    name = 'Operation',
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const shouldRetry = isErrorRetryable(lastError, retryableErrors, isRetryable);

      if (!shouldRetry || attempt >= maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs
      );
      
      // Add random jitter (±25%)
      const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);
      const delay = Math.max(0, baseDelay + jitter);

      logger.warn(`${name} failed, retrying with jitter`, {
        attempt,
        maxAttempts,
        delayMs: Math.round(delay),
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  throw new RetryExhaustedError(
    `${name} failed after ${maxAttempts} attempts: ${lastError!.message}`,
    maxAttempts,
    lastError!
  );
}

