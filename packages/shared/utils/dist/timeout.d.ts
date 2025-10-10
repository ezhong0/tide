/**
 * Timeout Utilities
 *
 * Provides timeout wrappers for async operations to prevent hanging requests.
 */
export declare class TimeoutError extends Error {
    readonly operation?: string | undefined;
    constructor(message: string, operation?: string | undefined);
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
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation?: string): Promise<T>;
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
export declare function createFetchWithTimeout(timeoutMs: number): (url: string | URL | Request, init?: RequestInit) => Promise<Response>;
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
export declare function wrapWithTimeout<T extends (...args: any[]) => Promise<any>>(fn: T, timeoutMs: number, operation?: string): T;
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
export declare function multipleWithTimeout<T>(promises: Promise<T>[], timeoutMs: number): Promise<T>[];
//# sourceMappingURL=timeout.d.ts.map