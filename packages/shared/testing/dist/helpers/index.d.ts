/**
 * Test Helper Functions
 */
/**
 * Wait for a condition to be true
 */
export declare function waitFor(condition: () => boolean | Promise<boolean>, timeout?: number, interval?: number): Promise<void>;
/**
 * Wait for a specific amount of time
 */
export declare function wait(ms: number): Promise<void>;
/**
 * Create a deferred promise that can be resolved/rejected externally
 */
export declare function createDeferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
};
/**
 * Capture console output during a test
 */
export declare function captureConsole(): {
    logs: string[];
    errors: string[];
    warnings: string[];
    restore: () => void;
};
//# sourceMappingURL=index.d.ts.map