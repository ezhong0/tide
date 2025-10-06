"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
const globals_1 = require("@jest/globals");
const conversation_schemas_1 = require("./conversation.schemas");
(0, globals_1.describe)('Conversation Schemas', () => {
    // ============================================================================
    // Core Schemas
    // ============================================================================
    (0, globals_1.describe)('MessageSchema', () => {
        (0, globals_1.it)('should validate correct message', () => {
            const validMessage = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                role: 'user',
                content: 'Hello, can you help me with my calendar?',
                timestamp: Date.now(),
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.MessageSchema.safeParse(validMessage);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject empty content', () => {
            const invalidMessage = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                role: 'user',
                content: '',
                timestamp: Date.now(),
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.MessageSchema.safeParse(invalidMessage);
            (0, globals_1.expect)(result.success).toBe(false);
        });
        (0, globals_1.it)('should reject content over 10000 chars', () => {
            const invalidMessage = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                role: 'user',
                content: 'a'.repeat(10001),
                timestamp: Date.now(),
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.MessageSchema.safeParse(invalidMessage);
            (0, globals_1.expect)(result.success).toBe(false);
        });
        (0, globals_1.it)('should accept valid roles', () => {
            const roles = ['user', 'assistant', 'system'];
            roles.forEach(role => {
                const message = {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    role,
                    content: 'Test',
                    timestamp: Date.now(),
                    inputMethod: 'typed'
                };
                const result = conversation_schemas_1.MessageSchema.safeParse(message);
                (0, globals_1.expect)(result.success).toBe(true);
            });
        });
        (0, globals_1.it)('should accept valid input methods', () => {
            const methods = ['typed', 'voice_to_text', 'button', 'suggestion'];
            methods.forEach(inputMethod => {
                const message = {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    role: 'user',
                    content: 'Test',
                    timestamp: Date.now(),
                    inputMethod
                };
                const result = conversation_schemas_1.MessageSchema.safeParse(message);
                (0, globals_1.expect)(result.success).toBe(true);
            });
        });
        (0, globals_1.it)('should accept optional fields', () => {
            const message = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                role: 'assistant',
                content: 'I can help with that',
                timestamp: Date.now(),
                inputMethod: 'typed',
                feedback: 'helpful',
                edited: true,
                actions: [],
                suggestions: []
            };
            const result = conversation_schemas_1.MessageSchema.safeParse(message);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
    (0, globals_1.describe)('ConversationContextSchema', () => {
        (0, globals_1.it)('should validate empty context', () => {
            const context = {
                mentionedPeople: [],
                mentionedDates: [],
                mentionedProjects: [],
                upcomingMeetings: [],
                unreadEmails: 0
            };
            const result = conversation_schemas_1.ConversationContextSchema.safeParse(context);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should validate context with data', () => {
            const context = {
                topic: 'calendar',
                mentionedPeople: [{
                        email: 'john@example.com',
                        name: 'John Doe'
                    }],
                mentionedDates: [{
                        timestamp: Date.now(),
                        description: 'tomorrow',
                        relative: 'tomorrow'
                    }],
                mentionedProjects: ['Q4 Planning'],
                upcomingMeetings: [{
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        title: 'Team Standup',
                        startTime: Date.now(),
                        endTime: Date.now() + 3600000,
                        attendees: [{
                                email: 'team@example.com',
                                name: 'Team'
                            }]
                    }],
                unreadEmails: 5,
                currentLocation: 'office'
            };
            const result = conversation_schemas_1.ConversationContextSchema.safeParse(context);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject negative unread emails', () => {
            const context = {
                mentionedPeople: [],
                mentionedDates: [],
                mentionedProjects: [],
                upcomingMeetings: [],
                unreadEmails: -1
            };
            const result = conversation_schemas_1.ConversationContextSchema.safeParse(context);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('ConversationSchema', () => {
        (0, globals_1.it)('should validate complete conversation', () => {
            const conversation = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                userId: '456e4567-e89b-12d3-a456-426614174000',
                messages: [{
                        id: '789e4567-e89b-12d3-a456-426614174000',
                        role: 'user',
                        content: 'Hello',
                        timestamp: Date.now(),
                        inputMethod: 'typed'
                    }],
                context: {
                    mentionedPeople: [],
                    mentionedDates: [],
                    mentionedProjects: [],
                    upcomingMeetings: [],
                    unreadEmails: 0
                },
                status: 'active',
                startedAt: Date.now(),
                lastActiveAt: Date.now()
            };
            const result = conversation_schemas_1.ConversationSchema.safeParse(conversation);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should validate status values', () => {
            const statuses = ['active', 'idle', 'completed'];
            statuses.forEach(status => {
                const conversation = {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    userId: '456e4567-e89b-12d3-a456-426614174000',
                    messages: [],
                    context: {
                        mentionedPeople: [],
                        mentionedDates: [],
                        mentionedProjects: [],
                        upcomingMeetings: [],
                        unreadEmails: 0
                    },
                    status,
                    startedAt: Date.now(),
                    lastActiveAt: Date.now()
                };
                const result = conversation_schemas_1.ConversationSchema.safeParse(conversation);
                (0, globals_1.expect)(result.success).toBe(true);
            });
        });
    });
    // ============================================================================
    // Action Schemas
    // ============================================================================
    (0, globals_1.describe)('ActionSchema', () => {
        (0, globals_1.it)('should validate action', () => {
            const action = {
                type: 'send_email',
                description: 'Send email to John',
                params: {
                    to: ['john@example.com'],
                    subject: 'Hello',
                    body: 'Test'
                },
                requiresConfirmation: true,
                riskLevel: 'low'
            };
            const result = conversation_schemas_1.ActionSchema.safeParse(action);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should accept valid action types', () => {
            const types = [
                'send_email', 'schedule_meeting', 'reschedule_meeting',
                'cancel_meeting', 'draft_email', 'search_emails',
                'summarize_thread', 'create_task', 'set_reminder',
                'reply_email', 'forward_email'
            ];
            types.forEach(type => {
                const action = {
                    type,
                    description: 'Test action',
                    params: {},
                    requiresConfirmation: false
                };
                const result = conversation_schemas_1.ActionSchema.safeParse(action);
                (0, globals_1.expect)(result.success).toBe(true);
            });
        });
    });
    (0, globals_1.describe)('ActionPreviewSchema', () => {
        (0, globals_1.it)('should validate action preview', () => {
            const preview = {
                summary: 'Send email to John about meeting',
                details: {
                    action: 'send_email',
                    changes: {
                        to: ['john@example.com'],
                        subject: 'Meeting'
                    }
                },
                editable: true,
                editableFields: ['subject', 'body']
            };
            const result = conversation_schemas_1.ActionPreviewSchema.safeParse(preview);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should accept risks and alternatives', () => {
            const preview = {
                summary: 'Schedule meeting',
                details: {
                    action: 'schedule_meeting',
                    changes: { time: '2pm' }
                },
                risks: [{
                        level: 'medium',
                        description: 'Conflicts with another meeting'
                    }],
                alternatives: [{
                        description: 'Schedule for 3pm instead',
                        action: 'schedule_meeting'
                    }],
                editable: true
            };
            const result = conversation_schemas_1.ActionPreviewSchema.safeParse(preview);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
    // ============================================================================
    // Intent & Understanding Schemas
    // ============================================================================
    (0, globals_1.describe)('IntentSchema', () => {
        (0, globals_1.it)('should validate intent', () => {
            const intent = {
                type: 'schedule_meeting',
                confidence: 0.95
            };
            const result = conversation_schemas_1.IntentSchema.safeParse(intent);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject confidence outside 0-1 range', () => {
            const invalidIntent = {
                type: 'schedule_meeting',
                confidence: 1.5
            };
            const result = conversation_schemas_1.IntentSchema.safeParse(invalidIntent);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('EntitySchema', () => {
        (0, globals_1.it)('should validate entity', () => {
            const entity = {
                type: 'email',
                value: 'john@example.com',
                position: [5, 20],
                confidence: 0.98
            };
            const result = conversation_schemas_1.EntitySchema.safeParse(entity);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
    (0, globals_1.describe)('UnderstandingSchema', () => {
        (0, globals_1.it)('should validate understanding result', () => {
            const understanding = {
                intents: [{
                        type: 'schedule_meeting',
                        confidence: 0.9
                    }],
                entities: [{
                        type: 'person',
                        value: 'John',
                        position: [0, 4],
                        confidence: 0.95
                    }],
                confidence: 0.92
            };
            const result = conversation_schemas_1.UnderstandingSchema.safeParse(understanding);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should require at least one intent', () => {
            const invalid = {
                intents: [],
                entities: [],
                confidence: 0.5
            };
            const result = conversation_schemas_1.UnderstandingSchema.safeParse(invalid);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    // ============================================================================
    // Request Schemas
    // ============================================================================
    (0, globals_1.describe)('CreateConversationRequestSchema', () => {
        (0, globals_1.it)('should validate create request', () => {
            const request = {
                userId: '123e4567-e89b-12d3-a456-426614174000'
            };
            const result = conversation_schemas_1.CreateConversationRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject invalid UUID', () => {
            const request = {
                userId: 'not-a-uuid'
            };
            const result = conversation_schemas_1.CreateConversationRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('SendMessageRequestSchema', () => {
        (0, globals_1.it)('should validate send message request', () => {
            const request = {
                conversationId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'What is on my calendar today?',
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.SendMessageRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject empty message', () => {
            const request = {
                conversationId: '123e4567-e89b-12d3-a456-426614174000',
                message: '',
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.SendMessageRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error.issues[0].message).toContain('cannot be empty');
            }
        });
        (0, globals_1.it)('should reject message over 10000 chars', () => {
            const request = {
                conversationId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'a'.repeat(10001),
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.SendMessageRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error.issues[0].message).toContain('too long');
            }
        });
    });
    (0, globals_1.describe)('ProcessIntentRequestSchema', () => {
        (0, globals_1.it)('should validate intent processing request', () => {
            const request = {
                message: 'Schedule a meeting with John tomorrow at 2pm',
                context: {
                    mentionedPeople: [],
                    mentionedDates: [],
                    mentionedProjects: [],
                    upcomingMeetings: [],
                    unreadEmails: 0
                }
            };
            const result = conversation_schemas_1.ProcessIntentRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
    // ============================================================================
    // Response Schemas
    // ============================================================================
    (0, globals_1.describe)('MessageResponseSchema', () => {
        (0, globals_1.it)('should validate message response', () => {
            const response = {
                messageId: '123e4567-e89b-12d3-a456-426614174000',
                content: 'I can help you with that',
                role: 'assistant'
            };
            const result = conversation_schemas_1.MessageResponseSchema.safeParse(response);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should accept optional fields', () => {
            const response = {
                messageId: '123e4567-e89b-12d3-a456-426614174000',
                content: 'I can help you with that',
                role: 'assistant',
                actions: [{
                        type: 'send_email',
                        description: 'Send test email',
                        params: {},
                        requiresConfirmation: true
                    }],
                suggestions: [{
                        id: '1',
                        text: 'Check my calendar',
                        type: 'action'
                    }],
                streamingComplete: true
            };
            const result = conversation_schemas_1.MessageResponseSchema.safeParse(response);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
    // ============================================================================
    // Suggestion Schema
    // ============================================================================
    (0, globals_1.describe)('SuggestionSchema', () => {
        (0, globals_1.it)('should validate suggestion', () => {
            const suggestion = {
                id: 'suggest-1',
                text: 'Check my calendar',
                type: 'action'
            };
            const result = conversation_schemas_1.SuggestionSchema.safeParse(suggestion);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should accept valid suggestion types', () => {
            const types = ['quick_reply', 'action', 'question', 'completion'];
            types.forEach(type => {
                const suggestion = {
                    id: '1',
                    text: 'Test',
                    type
                };
                const result = conversation_schemas_1.SuggestionSchema.safeParse(suggestion);
                (0, globals_1.expect)(result.success).toBe(true);
            });
        });
    });
    // ============================================================================
    // Type Inference
    // ============================================================================
    (0, globals_1.describe)('Type Inference', () => {
        (0, globals_1.it)('should infer types correctly', () => {
            const request = {
                conversationId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'Test',
                inputMethod: 'typed'
            };
            const result = conversation_schemas_1.SendMessageRequestSchema.safeParse(request);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=conversation.schemas.test.js.map