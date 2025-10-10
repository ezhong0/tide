/**
 * Performance Monitoring Middleware
 * Tracks request duration and adds performance headers
 */
import { Request, Response, NextFunction } from 'express';
export interface PerformanceMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    endpoint: string;
    method: string;
    statusCode?: number;
    userId?: string;
}
/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
export declare function performanceMonitor(options?: {
    slowRequestThreshold?: number;
    includeHeaders?: boolean;
}): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Utility to measure async function execution time
 */
export declare function measureAsync<T>(fn: () => Promise<T>, label: string): Promise<{
    result: T;
    duration: number;
}>;
/**
 * Decorator for measuring method execution time
 */
export declare function Measure(label?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Track database query performance
 */
export declare class QueryPerformanceTracker {
    private queries;
    track(query: string, duration: number): void;
    getStats(): {
        query: string;
        count: number;
        averageDuration: number;
        maxDuration: number;
    }[];
    reset(): void;
}
export declare const queryTracker: QueryPerformanceTracker;
//# sourceMappingURL=performance.d.ts.map