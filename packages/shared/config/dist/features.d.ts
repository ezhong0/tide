/**
 * Feature flags for the platform
 */
export declare const features: {
    readonly ai: boolean;
    readonly emailSync: boolean;
    readonly calendarSync: boolean;
    readonly workflowEngine: boolean;
};
/**
 * Check if a feature is enabled
 */
export declare function isFeatureEnabled(feature: keyof typeof features): boolean;
/**
 * Require a feature to be enabled or throw error
 */
export declare function requireFeature(feature: keyof typeof features): void;
