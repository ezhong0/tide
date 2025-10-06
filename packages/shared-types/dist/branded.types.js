/**
 * Branded types for type safety
 *
 * Branded types prevent accidental mixing of similar primitive types
 * (e.g., passing a CommandId where a UserId is expected)
 */
// Helper functions to create branded types safely
export const createUserId = (id) => id;
export const createCommandId = (id) => id;
export const createEmailId = (id) => id;
export const createThreadId = (id) => id;
export const createCalendarEventId = (id) => id;
export const createDraftId = (id) => id;
export const createFollowUpId = (id) => id;
export const createContactPreferencesId = (id) => id;
export const createFeedbackId = (id) => id;
export const createAuditLogId = (id) => id;
//# sourceMappingURL=branded.types.js.map