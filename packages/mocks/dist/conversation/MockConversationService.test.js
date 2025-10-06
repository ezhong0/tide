"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
const globals_1 = require("@jest/globals");
const MockConversationService_1 = require("./MockConversationService");
const types_1 = require("@tide/types");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
(0, globals_1.describe)('MockConversationService', () => {
    let service;
    let userId;
    (0, globals_1.beforeEach)(() => {
        service = new MockConversationService_1.MockConversationService();
        userId = (0, types_1.UUID)(crypto_1.default.randomUUID());
    });
    // ============================================================================
    // createConversation
    // ============================================================================
    (0, globals_1.describe)('createConversation', () => {
        (0, globals_1.it)('should create a new conversation', async () => {
            const result = await service.createConversation(userId);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, globals_1.expect)(result.data.userId).toBe(userId);
                (0, globals_1.expect)(result.data.messages).toEqual([]);
                (0, globals_1.expect)(result.data.status).toBe('active');
                (0, globals_1.expect)(result.data.context).toBeDefined();
            }
        });
        (0, globals_1.it)('should create conversation with empty context', async () => {
            const result = await service.createConversation(userId);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                const context = result.data.context;
                (0, globals_1.expect)(context.mentionedPeople).toEqual([]);
                (0, globals_1.expect)(context.mentionedDates).toEqual([]);
                (0, globals_1.expect)(context.mentionedProjects).toEqual([]);
                (0, globals_1.expect)(context.upcomingMeetings).toEqual([]);
                (0, globals_1.expect)(context.unreadEmails).toBe(0);
            }
        });
        (0, globals_1.it)('should create conversation within 100ms', async () => {
            const start = Date.now();
            await service.createConversation(userId);
            const duration = Date.now() - start;
            (0, globals_1.expect)(duration).toBeLessThan(100);
        });
        (0, globals_1.it)('should create multiple conversations for same user', async () => {
            const result1 = await service.createConversation(userId);
            const result2 = await service.createConversation(userId);
            (0, globals_1.expect)(result1.success).toBe(true);
            (0, globals_1.expect)(result2.success).toBe(true);
            if (result1.ok && result2.success) {
                (0, globals_1.expect)(result1.data.id).not.toBe(result2.data.id);
            }
        });
    });
    // ============================================================================
    // getConversation
    // ============================================================================
    (0, globals_1.describe)('getConversation', () => {
        (0, globals_1.it)('should get existing conversation', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const getResult = await service.getConversation(createResult.data.id);
                (0, globals_1.expect)(getResult.success).toBe(true);
                if (getResult.success) {
                    (0, globals_1.expect)(getResult.data.id).toBe(createResult.data.id);
                    (0, globals_1.expect)(getResult.data.userId).toBe(userId);
                }
            }
        });
        (0, globals_1.it)('should return error for non-existent conversation', async () => {
            const fakeId = (0, types_1.UUID)(crypto_1.default.randomUUID());
            const result = await service.getConversation(fakeId);
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error).toContain('not found');
            }
        });
        (0, globals_1.it)('should return error for archived conversation', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                await service.archiveConversation(createResult.data.id);
                const getResult = await service.getConversation(createResult.data.id);
                (0, globals_1.expect)(getResult.success).toBe(false);
                if (!getResult.success) {
                    (0, globals_1.expect)(getResult.error).toContain('archived');
                }
            }
        });
        (0, globals_1.it)('should retrieve conversation within 100ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const start = Date.now();
                await service.getConversation(createResult.data.id);
                const duration = Date.now() - start;
                (0, globals_1.expect)(duration).toBeLessThan(100);
            }
        });
    });
    // ============================================================================
    // sendMessage
    // ============================================================================
    (0, globals_1.describe)('sendMessage', () => {
        (0, globals_1.it)('should send message and get response', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.sendMessage(createResult.data.id, 'Hello', 'typed');
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.content).toBeDefined();
                    (0, globals_1.expect)(result.data.role).toBe('assistant');
                    (0, globals_1.expect)(result.data.streamingComplete).toBe(true);
                }
            }
        });
        (0, globals_1.it)('should recognize greeting', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.sendMessage(createResult.data.id, 'Hello', 'typed');
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.content.toLowerCase()).toContain('hello');
                    (0, globals_1.expect)(result.data.suggestions).toBeDefined();
                    (0, globals_1.expect)(result.data.suggestions.length).toBeGreaterThan(0);
                }
            }
        });
        (0, globals_1.it)('should recognize email intent', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.sendMessage(createResult.data.id, 'Send an email to John', 'typed');
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.content.toLowerCase()).toContain('email');
                    (0, globals_1.expect)(result.data.actions).toBeDefined();
                    (0, globals_1.expect)(result.data.actions.length).toBeGreaterThan(0);
                    (0, globals_1.expect)(result.data.actions[0].type).toBe('send_email');
                }
            }
        });
        (0, globals_1.it)('should recognize meeting intent', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.sendMessage(createResult.data.id, 'Schedule a meeting tomorrow', 'typed');
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.content.toLowerCase()).toContain('meeting');
                    (0, globals_1.expect)(result.data.actions).toBeDefined();
                    (0, globals_1.expect)(result.data.actions.length).toBeGreaterThan(0);
                    (0, globals_1.expect)(result.data.actions[0].type).toBe('schedule_meeting');
                }
            }
        });
        (0, globals_1.it)('should recognize calendar check intent', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.sendMessage(createResult.data.id, 'What is on my calendar today?', 'typed');
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.content.toLowerCase()).toContain('calendar');
                }
            }
        });
        (0, globals_1.it)('should update context with time references', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                await service.sendMessage(createResult.data.id, 'Schedule a meeting tomorrow', 'typed');
                const contextResult = await service.getContext(createResult.data.id);
                (0, globals_1.expect)(contextResult.success).toBe(true);
                if (contextResult.success) {
                    (0, globals_1.expect)(contextResult.data.mentionedDates.length).toBeGreaterThan(0);
                    (0, globals_1.expect)(contextResult.data.mentionedDates[0].relative).toBe('tomorrow');
                }
            }
        });
        (0, globals_1.it)('should respond within 800ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const start = Date.now();
                await service.sendMessage(createResult.data.id, 'Hello', 'typed');
                const duration = Date.now() - start;
                (0, globals_1.expect)(duration).toBeLessThan(800);
            }
        });
        (0, globals_1.it)('should return error for non-existent conversation', async () => {
            const fakeId = (0, types_1.UUID)(crypto_1.default.randomUUID());
            const result = await service.sendMessage(fakeId, 'Hello', 'typed');
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error).toContain('not found');
            }
        });
        (0, globals_1.it)('should return error for archived conversation', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                await service.archiveConversation(createResult.data.id);
                const result = await service.sendMessage(createResult.data.id, 'Hello', 'typed');
                (0, globals_1.expect)(result.success).toBe(false);
                if (!result.success) {
                    (0, globals_1.expect)(result.error).toContain('archived');
                }
            }
        });
        (0, globals_1.it)('should store messages in conversation', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                await service.sendMessage(createResult.data.id, 'First message', 'typed');
                await service.sendMessage(createResult.data.id, 'Second message', 'typed');
                const getResult = await service.getConversation(createResult.data.id);
                (0, globals_1.expect)(getResult.success).toBe(true);
                if (getResult.success) {
                    // Should have 4 messages: 2 user + 2 assistant
                    (0, globals_1.expect)(getResult.data.messages.length).toBe(4);
                }
            }
        });
    });
    // ============================================================================
    // streamResponse
    // ============================================================================
    (0, globals_1.describe)('streamResponse', () => {
        (0, globals_1.it)('should stream response in chunks', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const chunks = [];
                const result = await service.streamResponse(createResult.data.id, 'Hello', (chunk) => chunks.push(chunk));
                (0, globals_1.expect)(result.success).toBe(true);
                (0, globals_1.expect)(chunks.length).toBeGreaterThan(0);
                // Verify chunks combine to full response
                const fullContent = chunks.join('');
                if (result.success) {
                    (0, globals_1.expect)(fullContent).toBe(result.data.content);
                }
            }
        });
        (0, globals_1.it)('should start streaming within 300ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                let firstChunkTime = 0;
                const start = Date.now();
                await service.streamResponse(createResult.data.id, 'Hello', () => {
                    if (firstChunkTime === 0) {
                        firstChunkTime = Date.now();
                    }
                });
                const duration = firstChunkTime - start;
                (0, globals_1.expect)(duration).toBeLessThan(300);
            }
        });
    });
    // ============================================================================
    // getContext
    // ============================================================================
    (0, globals_1.describe)('getContext', () => {
        (0, globals_1.it)('should get conversation context', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.getContext(createResult.data.id);
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data).toBeDefined();
                    (0, globals_1.expect)(result.data.mentionedPeople).toBeDefined();
                }
            }
        });
        (0, globals_1.it)('should return error for non-existent conversation', async () => {
            const fakeId = (0, types_1.UUID)(crypto_1.default.randomUUID());
            const result = await service.getContext(fakeId);
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error).toContain('not found');
            }
        });
        (0, globals_1.it)('should retrieve context within 100ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const start = Date.now();
                await service.getContext(createResult.data.id);
                const duration = Date.now() - start;
                (0, globals_1.expect)(duration).toBeLessThan(100);
            }
        });
    });
    // ============================================================================
    // updateContext
    // ============================================================================
    (0, globals_1.describe)('updateContext', () => {
        (0, globals_1.it)('should update conversation context', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.updateContext(createResult.data.id, {
                    topic: 'email',
                    unreadEmails: 5
                });
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.context.topic).toBe('email');
                    (0, globals_1.expect)(result.data.context.unreadEmails).toBe(5);
                }
            }
        });
        (0, globals_1.it)('should merge context without overwriting arrays', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                // First update with mentioned people
                await service.updateContext(createResult.data.id, {
                    mentionedPeople: [{
                            email: 'john@example.com',
                            name: 'John'
                        }]
                });
                // Second update with topic (should preserve mentionedPeople)
                const result = await service.updateContext(createResult.data.id, {
                    topic: 'calendar'
                });
                (0, globals_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, globals_1.expect)(result.data.context.topic).toBe('calendar');
                    (0, globals_1.expect)(result.data.context.mentionedPeople.length).toBe(1);
                }
            }
        });
        (0, globals_1.it)('should update within 100ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const start = Date.now();
                await service.updateContext(createResult.data.id, { topic: 'email' });
                const duration = Date.now() - start;
                (0, globals_1.expect)(duration).toBeLessThan(100);
            }
        });
        (0, globals_1.it)('should return error for non-existent conversation', async () => {
            const fakeId = (0, types_1.UUID)(crypto_1.default.randomUUID());
            const result = await service.updateContext(fakeId, { topic: 'email' });
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error).toContain('not found');
            }
        });
    });
    // ============================================================================
    // listConversations
    // ============================================================================
    (0, globals_1.describe)('listConversations', () => {
        (0, globals_1.it)('should list user conversations', async () => {
            await service.createConversation(userId);
            await service.createConversation(userId);
            const result = await service.listConversations(userId);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, globals_1.expect)(result.data.length).toBe(2);
                (0, globals_1.expect)(result.data[0].userId).toBe(userId);
            }
        });
        (0, globals_1.it)('should not list archived conversations', async () => {
            const createResult1 = await service.createConversation(userId);
            await service.createConversation(userId);
            if (createResult1.success) {
                await service.archiveConversation(createResult1.data.id);
            }
            const result = await service.listConversations(userId);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, globals_1.expect)(result.data.length).toBe(1);
            }
        });
        (0, globals_1.it)('should sort by lastActiveAt descending', async () => {
            const result1 = await service.createConversation(userId);
            await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
            const result2 = await service.createConversation(userId);
            const listResult = await service.listConversations(userId);
            (0, globals_1.expect)(listResult.success).toBe(true);
            if (listResult.ok && result1.ok && result2.success) {
                (0, globals_1.expect)(listResult.value[0].id).toBe(result2.data.id);
                (0, globals_1.expect)(listResult.value[1].id).toBe(result1.data.id);
            }
        });
        (0, globals_1.it)('should support pagination with limit', async () => {
            await service.createConversation(userId);
            await service.createConversation(userId);
            await service.createConversation(userId);
            const result = await service.listConversations(userId, 2);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, globals_1.expect)(result.data.length).toBe(2);
            }
        });
        (0, globals_1.it)('should support pagination with offset', async () => {
            await service.createConversation(userId);
            await service.createConversation(userId);
            await service.createConversation(userId);
            const result = await service.listConversations(userId, 2, 1);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, globals_1.expect)(result.data.length).toBe(2);
            }
        });
        (0, globals_1.it)('should list within 200ms', async () => {
            await service.createConversation(userId);
            await service.createConversation(userId);
            const start = Date.now();
            await service.listConversations(userId);
            const duration = Date.now() - start;
            (0, globals_1.expect)(duration).toBeLessThan(200);
        });
        (0, globals_1.it)('should return empty array for user with no conversations', async () => {
            const result = await service.listConversations(userId);
            (0, globals_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, globals_1.expect)(result.data).toEqual([]);
            }
        });
    });
    // ============================================================================
    // archiveConversation
    // ============================================================================
    (0, globals_1.describe)('archiveConversation', () => {
        (0, globals_1.it)('should archive conversation', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const result = await service.archiveConversation(createResult.data.id);
                (0, globals_1.expect)(result.success).toBe(true);
                // Verify conversation is archived
                const getResult = await service.getConversation(createResult.data.id);
                (0, globals_1.expect)(getResult.success).toBe(false);
            }
        });
        (0, globals_1.it)('should return error for non-existent conversation', async () => {
            const fakeId = (0, types_1.UUID)(crypto_1.default.randomUUID());
            const result = await service.archiveConversation(fakeId);
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error).toContain('not found');
            }
        });
        (0, globals_1.it)('should archive within 100ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const start = Date.now();
                await service.archiveConversation(createResult.data.id);
                const duration = Date.now() - start;
                (0, globals_1.expect)(duration).toBeLessThan(100);
            }
        });
    });
    // ============================================================================
    // provideFeedback
    // ============================================================================
    (0, globals_1.describe)('provideFeedback', () => {
        (0, globals_1.it)('should provide feedback on message', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const messageResult = await service.sendMessage(createResult.data.id, 'Hello', 'typed');
                (0, globals_1.expect)(messageResult.success).toBe(true);
                if (messageResult.success) {
                    const result = await service.provideFeedback(messageResult.data.messageId, 'helpful');
                    (0, globals_1.expect)(result.success).toBe(true);
                }
            }
        });
        (0, globals_1.it)('should return error for non-existent message', async () => {
            const fakeId = (0, types_1.UUID)(crypto_1.default.randomUUID());
            const result = await service.provideFeedback(fakeId, 'helpful');
            (0, globals_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, globals_1.expect)(result.error).toContain('not found');
            }
        });
        (0, globals_1.it)('should provide feedback within 50ms', async () => {
            const createResult = await service.createConversation(userId);
            (0, globals_1.expect)(createResult.success).toBe(true);
            if (createResult.success) {
                const messageResult = await service.sendMessage(createResult.data.id, 'Hello', 'typed');
                if (messageResult.success) {
                    const start = Date.now();
                    await service.provideFeedback(messageResult.data.messageId, 'helpful');
                    const duration = Date.now() - start;
                    (0, globals_1.expect)(duration).toBeLessThan(50);
                }
            }
        });
    });
});
//# sourceMappingURL=MockConversationService.test.js.map