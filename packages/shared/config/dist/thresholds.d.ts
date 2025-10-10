/**
 * Configurable Thresholds for Business Logic
 *
 * All magic numbers and business thresholds centralized here.
 * Tune these via environment variables without code changes.
 */
export interface ThresholdsConfig {
    /** Email triage thresholds */
    email: {
        /** Confidence threshold for auto-handling emails (0-1) */
        triageAutoHandleConfidence: number;
        /** Importance score threshold for "high" priority (0-1) */
        importanceHigh: number;
        /** Importance score threshold for "medium" priority (0-1) */
        importanceMedium: number;
        /** Urgency score threshold for "critical" (0-1) */
        urgencyCritical: number;
        /** Urgency score threshold for "high" (0-1) */
        urgencyHigh: number;
        /** Maximum attachment size to load into memory (bytes) */
        maxAttachmentInMemorySize: number;
    };
    /** AI orchestration thresholds */
    ai: {
        /** Maximum tool execution iterations */
        maxIterations: number;
        /** Temperature for LLM responses (0-2) */
        temperature: number;
        /** Minimum confidence for AI responses (0-1) */
        confidenceMinimum: number;
        /** Reasoning effort level */
        reasoningEffort: 'minimal' | 'low' | 'medium' | 'high';
        /** Response verbosity */
        verbosity: 'low' | 'medium' | 'high';
    };
    /** Performance monitoring thresholds */
    performance: {
        /** Threshold for slow request warning (ms) */
        slowRequestMs: number;
        /** Threshold for slow query warning (ms) */
        slowQueryMs: number;
        /** Maximum payload size for responses (bytes) */
        maxPayloadBytes: number;
        /** Compression threshold (bytes) */
        compressionThresholdBytes: number;
    };
    /** Calendar optimization thresholds */
    calendar: {
        /** Minimum meeting duration (minutes) */
        minMeetingDuration: number;
        /** Maximum meetings per day before warning */
        maxMeetingsPerDay: number;
        /** Minimum buffer between meetings (minutes) */
        minBufferBetweenMeetings: number;
        /** Focus time block minimum duration (minutes) */
        focusTimeMinDuration: number;
    };
    /** Workflow thresholds */
    workflow: {
        /** Maximum task decomposition depth */
        maxDecompositionDepth: number;
        /** Priority score threshold for "high" (0-10) */
        priorityHigh: number;
        /** Priority score threshold for "medium" (0-10) */
        priorityMedium: number;
        /** Task complexity threshold for auto-decomposition (0-10) */
        autoDecomposeComplexity: number;
    };
}
/**
 * Thresholds configuration with environment variable overrides
 */
export declare const thresholds: ThresholdsConfig;
/**
 * Validate thresholds configuration
 * Throws error if configuration is invalid
 */
export declare function validateThresholds(): void;
/**
 * Get all threshold values for logging/debugging
 */
export declare function getThresholdsSummary(): Record<string, any>;
