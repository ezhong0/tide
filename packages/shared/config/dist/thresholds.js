"use strict";
/**
 * Configurable Thresholds for Business Logic
 *
 * All magic numbers and business thresholds centralized here.
 * Tune these via environment variables without code changes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.thresholds = void 0;
exports.validateThresholds = validateThresholds;
exports.getThresholdsSummary = getThresholdsSummary;
/**
 * Parse float from env with validation
 */
function envFloat(key, defaultValue, min, max) {
    const value = process.env[key];
    const parsed = value ? parseFloat(value) : defaultValue;
    if (min !== undefined && parsed < min) {
        console.warn(`[Config] ${key} below minimum (${min}), using ${min}. Received: ${parsed}`);
        return min;
    }
    if (max !== undefined && parsed > max) {
        console.warn(`[Config] ${key} above maximum (${max}), using ${max}. Received: ${parsed}`);
        return max;
    }
    return parsed;
}
/**
 * Parse integer from env with validation
 */
function envInt(key, defaultValue, min, max) {
    const value = process.env[key];
    const parsed = value ? parseInt(value, 10) : defaultValue;
    if (min !== undefined && parsed < min) {
        console.warn(`[Config] ${key} below minimum (${min}), using ${min}. Received: ${parsed}`);
        return min;
    }
    if (max !== undefined && parsed > max) {
        console.warn(`[Config] ${key} above maximum (${max}), using ${max}. Received: ${parsed}`);
        return max;
    }
    return parsed;
}
/**
 * Parse enum from env with validation
 */
function envEnum(key, defaultValue, allowedValues) {
    const value = process.env[key];
    if (value && allowedValues.includes(value)) {
        return value;
    }
    if (value) {
        console.warn(`[Config] Invalid ${key} value: ${value}, using ${defaultValue}`);
    }
    return defaultValue;
}
/**
 * Thresholds configuration with environment variable overrides
 */
exports.thresholds = {
    email: {
        triageAutoHandleConfidence: envFloat('TRIAGE_CONFIDENCE_THRESHOLD', 0.85, 0, 1),
        importanceHigh: envFloat('IMPORTANCE_HIGH_THRESHOLD', 0.6, 0, 1),
        importanceMedium: envFloat('IMPORTANCE_MEDIUM_THRESHOLD', 0.3, 0, 1),
        urgencyCritical: envFloat('URGENCY_CRITICAL_THRESHOLD', 0.8, 0, 1),
        urgencyHigh: envFloat('URGENCY_HIGH_THRESHOLD', 0.5, 0, 1),
        maxAttachmentInMemorySize: envInt('MAX_ATTACHMENT_MEMORY_SIZE', 5 * 1024 * 1024, 0), // 5MB
    },
    ai: {
        maxIterations: envInt('AI_MAX_ITERATIONS', 10, 1, 50),
        temperature: envFloat('AI_TEMPERATURE', 0.7, 0, 2),
        confidenceMinimum: envFloat('AI_CONFIDENCE_MIN', 0.7, 0, 1),
        reasoningEffort: envEnum('AI_REASONING_EFFORT', 'medium', ['minimal', 'low', 'medium', 'high']),
        verbosity: envEnum('AI_VERBOSITY', 'medium', ['low', 'medium', 'high']),
    },
    performance: {
        slowRequestMs: envInt('SLOW_REQUEST_THRESHOLD', 1000, 0),
        slowQueryMs: envInt('SLOW_QUERY_THRESHOLD', 100, 0),
        maxPayloadBytes: envInt('MAX_PAYLOAD_SIZE', 10 * 1024 * 1024, 0), // 10MB
        compressionThresholdBytes: envInt('COMPRESSION_THRESHOLD', 1024, 0), // 1KB
    },
    calendar: {
        minMeetingDuration: envInt('MIN_MEETING_DURATION', 15, 5, 120),
        maxMeetingsPerDay: envInt('MAX_MEETINGS_PER_DAY', 8, 1, 20),
        minBufferBetweenMeetings: envInt('MIN_MEETING_BUFFER', 5, 0, 30),
        focusTimeMinDuration: envInt('FOCUS_TIME_MIN_DURATION', 60, 30, 240),
    },
    workflow: {
        maxDecompositionDepth: envInt('MAX_DECOMPOSITION_DEPTH', 3, 1, 10),
        priorityHigh: envInt('PRIORITY_HIGH_THRESHOLD', 7, 0, 10),
        priorityMedium: envInt('PRIORITY_MEDIUM_THRESHOLD', 4, 0, 10),
        autoDecomposeComplexity: envInt('AUTO_DECOMPOSE_COMPLEXITY', 7, 0, 10),
    },
};
/**
 * Validate thresholds configuration
 * Throws error if configuration is invalid
 */
function validateThresholds() {
    const errors = [];
    // Email validations
    if (exports.thresholds.email.importanceMedium >= exports.thresholds.email.importanceHigh) {
        errors.push('IMPORTANCE_MEDIUM_THRESHOLD must be less than IMPORTANCE_HIGH_THRESHOLD');
    }
    if (exports.thresholds.email.urgencyHigh >= exports.thresholds.email.urgencyCritical) {
        errors.push('URGENCY_HIGH_THRESHOLD must be less than URGENCY_CRITICAL_THRESHOLD');
    }
    // Workflow validations
    if (exports.thresholds.workflow.priorityMedium >= exports.thresholds.workflow.priorityHigh) {
        errors.push('PRIORITY_MEDIUM_THRESHOLD must be less than PRIORITY_HIGH_THRESHOLD');
    }
    if (errors.length > 0) {
        const errorMessage = `Thresholds configuration validation failed:\n${errors.join('\n')}`;
        console.error(`[Config] ${errorMessage}`);
        throw new Error(errorMessage);
    }
    console.log('[Config] Thresholds configuration validated successfully');
}
/**
 * Get all threshold values for logging/debugging
 */
function getThresholdsSummary() {
    return {
        email: exports.thresholds.email,
        ai: exports.thresholds.ai,
        performance: exports.thresholds.performance,
        calendar: exports.thresholds.calendar,
        workflow: exports.thresholds.workflow,
    };
}
