import { Histogram } from 'prom-client';
export declare const register: any;
export declare const commandsProcessed: any;
export declare const commandLatency: any;
export declare const activeUsers: any;
export declare const emailsSent: any;
export declare const meetingsScheduled: any;
export declare const apiRequestDuration: any;
export declare const apiRequestTotal: any;
export declare const gptApiCalls: any;
export declare const gptTokensUsed: any;
export declare const dbQueryDuration: any;
export declare const cacheHitRate: any;
export declare const websocketConnections: any;
/**
 * Helper function to time async operations
 */
export declare function timeAsync<T>(histogram: Histogram, labels: Record<string, string>, fn: () => Promise<T>): Promise<T>;
//# sourceMappingURL=metrics.d.ts.map