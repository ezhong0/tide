/**
 * Timeout Utilities
 *
 * Provides timeout wrappers for async operations to prevent hanging requests.
 */
// Logger would be provided by consuming package
const logger = {
    warn: (...args) => console.warn('[Timeout]', ...args),
};
export class TimeoutError extends Error {
    constructor(message, operation) {
        super(message);
        this.operation = operation;
        this.name = 'TimeoutError';
    }
}
/**
 * Execute a promise with a timeout
 *
 * @param promise - The promise to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Optional operation name for error messages
 * @returns The promise result
 * @throws TimeoutError if the operation times out
 *
 * @example
 * const data = await withTimeout(
 *   fetch('https://api.example.com/data'),
 *   5000,
 *   'fetchData'
 * );
 */
export async function withTimeout(promise, timeoutMs, operation) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            const message = operation
                ? `Operation timeout: ${operation} (${timeoutMs}ms)`
                : `Operation timeout after ${timeoutMs}ms`;
            logger.warn('Timeout occurred', {
                operation,
                timeoutMs,
            });
            reject(new TimeoutError(message, operation));
        }, timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    }
    finally {
        clearTimeout(timeoutHandle);
    }
}
/**
 * Create a timeout wrapper for fetch requests
 *
 * @param timeoutMs - Timeout in milliseconds
 * @returns A fetch function with built-in timeout
 *
 * @example
 * const fetchWithTimeout = createFetchWithTimeout(5000);
 * const response = await fetchWithTimeout('https://api.example.com');
 */
export function createFetchWithTimeout(timeoutMs) {
    return async (url, init) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                ...init,
                signal: controller.signal,
            });
            clearTimeout(timeout);
            return response;
        }
        catch (error) {
            clearTimeout(timeout);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new TimeoutError(`Request timeout after ${timeoutMs}ms`, url.toString());
            }
            throw error;
        }
    };
}
/**
 * Wrap an async function with timeout protection
 *
 * @param fn - The async function to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Optional operation name
 * @returns Wrapped function with timeout
 *
 * @example
 * const fetchData = wrapWithTimeout(
 *   async () => await api.getData(),
 *   5000,
 *   'fetchData'
 * );
 * const data = await fetchData();
 */
export function wrapWithTimeout(fn, timeoutMs, operation) {
    return (async (...args) => {
        return withTimeout(fn(...args), timeoutMs, operation);
    });
}
/**
 * Execute multiple promises with individual timeouts
 *
 * @param promises - Array of promises to execute
 * @param timeoutMs - Timeout in milliseconds for each promise
 * @returns Array of results (fulfilled or rejected)
 *
 * @example
 * const results = await Promise.allSettled(
 *   multipleWithTimeout([
 *     fetch('/api/1'),
 *     fetch('/api/2'),
 *   ], 5000)
 * );
 */
export function multipleWithTimeout(promises, timeoutMs) {
    return promises.map((promise, index) => withTimeout(promise, timeoutMs, `Operation ${index}`));
}
//# sourceMappingURL=timeout.js.map