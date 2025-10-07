/**
 * Cache TTL defaults (in seconds)
 */
export declare const cacheTTL: {
    readonly session: number;
    readonly user: number;
    readonly conversation: number;
    readonly emailTriage: number;
    readonly aiResponse: number;
    readonly oauthToken: number;
};
/**
 * Cache key prefixes
 */
export declare const cacheKeys: {
    readonly user: (id: string) => string;
    readonly session: (id: string) => string;
    readonly conversation: (id: string) => string;
    readonly oauthToken: (userId: string, provider: string) => string;
    readonly rateLimitAuth: (ip: string) => string;
    readonly rateLimitApi: (userId: string) => string;
};
