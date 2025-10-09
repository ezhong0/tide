import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';
/**
 * Mock Express Request
 */
export declare function mockRequest(overrides?: Partial<Request>): Request;
/**
 * Mock Express Response
 */
export declare function mockResponse(): Response;
/**
 * Mock Express Next Function
 */
export declare function mockNext(): NextFunction;
/**
 * Mock Logger
 */
export declare function mockLogger(): Logger;
/**
 * Mock Database Client
 */
export declare function mockDatabaseClient(): {
    from: import("vitest").Mock<any, any>;
    select: import("vitest").Mock<any, any>;
    insert: import("vitest").Mock<any, any>;
    update: import("vitest").Mock<any, any>;
    delete: import("vitest").Mock<any, any>;
    eq: import("vitest").Mock<any, any>;
    single: import("vitest").Mock<any, any>;
    execute: import("vitest").Mock<any, any>;
};
//# sourceMappingURL=index.d.ts.map