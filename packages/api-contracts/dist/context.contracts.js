/**
 * Context API Contracts
 *
 * Zod schemas for context and preferences endpoints
 */
import { z } from 'zod';
// ============================================================================
// Request Schemas
// ============================================================================
export const GetUserContextRequestSchema = z.object({
    includePreferences: z.boolean().default(true),
    includeVipContacts: z.boolean().default(true),
});
export const UpdateUserPreferencesRequestSchema = z.object({
    defaultTone: z.enum(['professional', 'casual', 'friendly', 'formal']).optional(),
    emailSignature: z.string().max(1000).optional(),
    signOffPhrase: z.string().max(100).optional(),
    autoAcceptMeetings: z.boolean().optional(),
    autoAcceptMeetingsFrom: z.enum(['none', 'vip', 'all']).optional(),
    autoRespondSimple: z.boolean().optional(),
    autoRespondConfidence: z.enum(['high', 'medium', 'low']).optional(),
    notificationPreferences: z
        .object({
        interruptions: z
            .object({
            vip_emails: z.boolean(),
            meeting_reminders: z.boolean(),
            urgent_deadlines: z.boolean(),
            tracked_responses: z.boolean(),
        })
            .optional(),
        batch_interval: z.number().int().min(5).max(1440).optional(), // 5 minutes to 24 hours
        quiet_hours: z
            .object({
            enabled: z.boolean(),
            start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
            end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
        })
            .optional(),
    })
        .optional(),
    vipContacts: z
        .array(z.object({
        email: z.string().email(),
        name: z.string(),
        relationship: z.enum(['boss', 'client', 'colleague']),
    }))
        .max(50)
        .optional(),
    followUpDefaults: z
        .object({
        default_delay_hours: z.number().int().min(1).max(168).optional(), // 1 hour to 7 days
        auto_follow_up_enabled: z.boolean().optional(),
        follow_up_conditions: z
            .object({
            no_response_to_important: z.boolean(),
            meeting_not_accepted: z.boolean(),
        })
            .optional(),
    })
        .optional(),
});
export const GetContactPreferencesRequestSchema = z.object({
    email: z.string().email(),
});
export const UpdateContactPreferencesRequestSchema = z.object({
    email: z.string().email(),
    contactName: z.string().optional(),
    preferredTone: z.enum(['professional', 'casual', 'friendly', 'formal']),
    relationshipType: z.enum(['colleague', 'client', 'friend', 'boss', 'vendor']).optional(),
    customInstructions: z.string().max(2000).optional(),
});
export const GetMeetingPatternsRequestSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});
export const SemanticSearchRequestSchema = z.object({
    query: z.string().min(1).max(500),
    limit: z.number().int().min(1).max(50).default(10),
    dateAfter: z.string().datetime().optional(),
    dateBefore: z.string().datetime().optional(),
    fromContact: z.string().email().optional(),
});
// ============================================================================
// Response Schemas
// ============================================================================
export const UserContextSchema = z.object({
    user: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        name: z.string(),
        emailProvider: z.enum(['gmail', 'outlook']),
        calendarProvider: z.enum(['google', 'outlook']),
        timezone: z.string(),
    }),
    preferences: z
        .object({
        defaultTone: z.string(),
        emailSignature: z.string(),
        signOffPhrase: z.string(),
        autoAcceptMeetings: z.boolean(),
        autoRespondSimple: z.boolean(),
        notificationPreferences: z.record(z.unknown()),
        vipContacts: z.array(z.object({
            email: z.string(),
            name: z.string(),
            relationship: z.string(),
        })),
        followUpDefaults: z.record(z.unknown()),
    })
        .optional(),
});
export const GetUserContextResponseSchema = UserContextSchema;
export const UpdateUserPreferencesResponseSchema = z.object({
    success: z.boolean(),
    preferences: z.record(z.unknown()),
    updatedAt: z.string().datetime(),
});
export const ContactPreferencesSchema = z.object({
    id: z.string().uuid(),
    contactEmail: z.string().email(),
    contactName: z.string().optional(),
    preferredTone: z.string(),
    relationshipType: z.string().optional(),
    customInstructions: z.string().optional(),
    interactionCount: z.number().int().nonnegative(),
    lastInteraction: z.string().datetime(),
    patterns: z
        .object({
        averageResponseTimeHours: z.number().optional(),
        preferredMeetingTimes: z.array(z.string()).optional(),
        commonTopics: z.array(z.string()).optional(),
        typicalEmailLength: z.enum(['short', 'medium', 'long']).optional(),
    })
        .optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
export const GetContactPreferencesResponseSchema = ContactPreferencesSchema;
export const UpdateContactPreferencesResponseSchema = z.object({
    success: z.boolean(),
    preferences: ContactPreferencesSchema,
});
export const MeetingPatternsSchema = z.object({
    totalMeetings: z.number().int().nonnegative(),
    averageDurationMinutes: z.number().nonnegative(),
    mostCommonAttendees: z.array(z.object({
        email: z.string(),
        name: z.string().optional(),
        count: z.number().int().positive(),
    })),
    preferredTimeSlots: z.array(z.object({
        dayOfWeek: z.number().int().min(0).max(6), // 0=Sunday
        startHour: z.number().int().min(0).max(23),
        endHour: z.number().int().min(0).max(23),
        frequency: z.number().int().positive(),
    })),
    meetingsByType: z.record(z.number().int().nonnegative()),
});
export const GetMeetingPatternsResponseSchema = MeetingPatternsSchema;
export const SemanticSearchResultSchema = z.object({
    emailId: z.string().uuid(),
    score: z.number().min(0).max(1),
    snippet: z.string(),
    metadata: z.object({
        from: z.string(),
        subject: z.string(),
        date: z.string().datetime(),
        labels: z.array(z.string()).optional(),
    }),
});
export const SemanticSearchResponseSchema = z.object({
    results: z.array(SemanticSearchResultSchema),
    total: z.number().int().nonnegative(),
    query: z.string(),
});
// ============================================================================
// Contract Definitions
// ============================================================================
export const ContextContracts = {
    getUserContext: {
        method: 'GET',
        path: '/api/context/user',
        request: GetUserContextRequestSchema,
        response: GetUserContextResponseSchema,
    },
    updateUserPreferences: {
        method: 'PUT',
        path: '/api/context/preferences',
        request: UpdateUserPreferencesRequestSchema,
        response: UpdateUserPreferencesResponseSchema,
    },
    getContactPreferences: {
        method: 'GET',
        path: '/api/context/contact/:email',
        request: GetContactPreferencesRequestSchema,
        response: GetContactPreferencesResponseSchema,
    },
    updateContactPreferences: {
        method: 'PUT',
        path: '/api/context/contact/:email',
        request: UpdateContactPreferencesRequestSchema,
        response: UpdateContactPreferencesResponseSchema,
    },
    getMeetingPatterns: {
        method: 'GET',
        path: '/api/context/patterns/meetings',
        request: GetMeetingPatternsRequestSchema,
        response: GetMeetingPatternsResponseSchema,
    },
    semanticSearch: {
        method: 'POST',
        path: '/api/search/semantic',
        request: SemanticSearchRequestSchema,
        response: SemanticSearchResponseSchema,
    },
};
//# sourceMappingURL=context.contracts.js.map