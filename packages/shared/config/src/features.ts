import { env } from './env';

/**
 * Feature flags for the platform
 */
export const features = {
  ai: env.ENABLE_AI_FEATURES,
  emailSync: env.ENABLE_EMAIL_SYNC,
  calendarSync: env.ENABLE_CALENDAR_SYNC,
  workflowEngine: env.ENABLE_WORKFLOW_ENGINE,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature];
}

/**
 * Require a feature to be enabled or throw error
 */
export function requireFeature(feature: keyof typeof features): void {
  if (!isFeatureEnabled(feature)) {
    throw new Error(`Feature "${feature}" is not enabled`);
  }
}
