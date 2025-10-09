/**
 * Test Helper Functions
 */
/**
 * Wait for a condition to be true
 */
export async function waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}
/**
 * Wait for a specific amount of time
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Create a deferred promise that can be resolved/rejected externally
 */
export function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve, reject: reject };
}
/**
 * Capture console output during a test
 */
export function captureConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const logs = [];
    const errors = [];
    const warnings = [];
    console.log = (...args) => logs.push(args.join(' '));
    console.error = (...args) => errors.push(args.join(' '));
    console.warn = (...args) => warnings.push(args.join(' '));
    return {
        logs,
        errors,
        warnings,
        restore: () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        },
    };
}
//# sourceMappingURL=index.js.map