/**
 * Simple utility helpers for AI service
 * These are temporary until @tide/utils package is created
 */

/**
 * Wraps a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  name: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableErrors?: RegExp[];
  name?: string;
}

/**
 * Retry patterns for common errors
 */
export const retryPatterns = {
  network: [/network|ECONNRESET|ETIMEDOUT|ENOTFOUND/i],
  serviceUnavailable: [/502|503|504|Service Unavailable/i],
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 100,
    maxDelay = 5000,
    retryableErrors = [],
    name = 'operation',
  } = config;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable = retryableErrors.some(pattern =>
        pattern.test(lastError!.message)
      );

      if (attempt === maxAttempts || !isRetryable) {
        throw lastError;
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, maxDelay)));
      delay *= 2;
    }
  }

  throw lastError || new Error(`${name} failed after ${maxAttempts} attempts`);
}
