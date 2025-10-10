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
 * Parse float from env with validation
 */
function envFloat(key: string, defaultValue: number, min?: number, max?: number): number {
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
function envInt(key: string, defaultValue: number, min?: number, max?: number): number {
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
function envEnum<T extends string>(
  key: string,
  defaultValue: T,
  allowedValues: readonly T[]
): T {
  const value = process.env[key] as T;
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
export const thresholds: ThresholdsConfig = {
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
export function validateThresholds(): void {
  const errors: string[] = [];
  
  // Email validations
  if (thresholds.email.importanceMedium >= thresholds.email.importanceHigh) {
    errors.push('IMPORTANCE_MEDIUM_THRESHOLD must be less than IMPORTANCE_HIGH_THRESHOLD');
  }
  if (thresholds.email.urgencyHigh >= thresholds.email.urgencyCritical) {
    errors.push('URGENCY_HIGH_THRESHOLD must be less than URGENCY_CRITICAL_THRESHOLD');
  }
  
  // Workflow validations
  if (thresholds.workflow.priorityMedium >= thresholds.workflow.priorityHigh) {
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
export function getThresholdsSummary(): Record<string, any> {
  return {
    email: thresholds.email,
    ai: thresholds.ai,
    performance: thresholds.performance,
    calendar: thresholds.calendar,
    workflow: thresholds.workflow,
  };
}

