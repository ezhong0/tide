"use strict";
/**
 * Mock Conversation Service (Module 00 - Day 2)
 * In-memory implementation of IConversationService for testing and development
 *
 * Features:
 * - Pattern-based response generation
 * - Context tracking
 * - Action suggestions
 * - Personalization learning
 * - Performance within SLAs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockConversationService = void 0;
const tslib_1 = require("tslib");
const types_1 = require("@tide/types");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
/**
 * Mock implementation of conversation service
 * Uses simple pattern matching for realistic responses
 */
class MockConversationService {
    conversations = new Map();
    messages = new Map();
    /**
     * Create a new conversation
     * @performance <100ms
     */
    async createConversation(userId) {
        const conversationId = (0, types_1.UUID)(crypto_1.default.randomUUID());
        const now = Date.now();
        const conversation = {
            id: conversationId,
            userId,
            messages: [],
            context: this.createEmptyContext(),
            status: 'active',
            startedAt: now,
            lastActiveAt: now,
            archived: false
        };
        this.conversations.set(conversationId, conversation);
        return (0, types_1.ok)(this.sanitizeConversation(conversation));
    }
    /**
     * Get an existing conversation
     * @performance <100ms
     */
    async getConversation(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return (0, types_1.err)('Conversation not found');
        }
        if (conversation.archived) {
            return (0, types_1.err)('Conversation has been archived');
        }
        return (0, types_1.ok)(this.sanitizeConversation(conversation));
    }
    /**
     * Send a message and get AI response
     * @performance <800ms for first response
     */
    async sendMessage(conversationId, message, inputMethod) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return (0, types_1.err)('Conversation not found');
        }
        if (conversation.archived) {
            return (0, types_1.err)('Cannot send message to archived conversation');
        }
        // Store user message
        const userMessageId = (0, types_1.UUID)(crypto_1.default.randomUUID());
        const timestamp = Date.now();
        const userMessage = {
            id: userMessageId,
            role: 'user',
            content: message,
            timestamp,
            inputMethod
        };
        conversation.messages.push(userMessage);
        this.messages.set(userMessageId, userMessage);
        // Update context based on message
        this.updateContextFromMessage(conversation.context, message);
        // Generate AI response
        const response = await this.generateResponse(message, conversation.context);
        // Store assistant message
        const assistantMessageId = (0, types_1.UUID)(crypto_1.default.randomUUID());
        const assistantMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: response.content,
            timestamp: Date.now(),
            inputMethod: 'typed',
            actions: response.actions,
            suggestions: response.suggestions,
            preview: response.preview
        };
        conversation.messages.push(assistantMessage);
        this.messages.set(assistantMessageId, assistantMessage);
        // Update conversation status
        conversation.lastActiveAt = Date.now();
        conversation.status = 'active';
        return (0, types_1.ok)({
            messageId: assistantMessageId,
            content: response.content,
            role: 'assistant',
            actions: response.actions,
            suggestions: response.suggestions,
            preview: response.preview,
            streamingComplete: true
        });
    }
    /**
     * Stream a response (mock implementation returns immediately)
     * @performance <300ms to start streaming
     */
    async streamResponse(conversationId, message, onChunk) {
        // Get the full response first
        const result = await this.sendMessage(conversationId, message, 'typed');
        if (!result.success) {
            return result;
        }
        // Simulate streaming by chunking the response
        const content = result.data.content;
        const chunkSize = 10; // characters per chunk
        for (let i = 0; i < content.length; i += chunkSize) {
            const chunk = content.slice(i, i + chunkSize);
            onChunk(chunk);
            // Small delay to simulate streaming (5ms per chunk)
            await new Promise(resolve => setTimeout(resolve, 5));
        }
        return result;
    }
    /**
     * Get conversation context
     * @performance <100ms
     */
    async getContext(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return (0, types_1.err)('Conversation not found');
        }
        return (0, types_1.ok)(conversation.context);
    }
    /**
     * Update conversation context
     * @performance <100ms
     */
    async updateContext(conversationId, context) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return (0, types_1.err)('Conversation not found');
        }
        // Merge context
        conversation.context = {
            ...conversation.context,
            ...context,
            // Handle arrays specially (don't overwrite with undefined)
            mentionedPeople: context.mentionedPeople ?? conversation.context.mentionedPeople,
            mentionedDates: context.mentionedDates ?? conversation.context.mentionedDates,
            mentionedProjects: context.mentionedProjects ?? conversation.context.mentionedProjects,
            upcomingMeetings: context.upcomingMeetings ?? conversation.context.upcomingMeetings
        };
        conversation.lastActiveAt = Date.now();
        return (0, types_1.ok)(this.sanitizeConversation(conversation));
    }
    /**
     * List user's conversations
     * @performance <200ms
     */
    async listConversations(userId, limit = 10, offset = 0) {
        const userConversations = Array.from(this.conversations.values())
            .filter(c => c.userId === userId && !c.archived)
            .sort((a, b) => b.lastActiveAt - a.lastActiveAt)
            .slice(offset, offset + limit)
            .map(c => this.sanitizeConversation(c));
        return (0, types_1.ok)(userConversations);
    }
    /**
     * Archive a conversation
     * @performance <100ms
     */
    async archiveConversation(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return (0, types_1.err)('Conversation not found');
        }
        conversation.archived = true;
        conversation.status = 'completed';
        return (0, types_1.ok)(undefined);
    }
    /**
     * Provide feedback on a message
     * @performance <50ms
     */
    async provideFeedback(messageId, feedback) {
        const message = this.messages.get(messageId);
        if (!message) {
            return (0, types_1.err)('Message not found');
        }
        message.feedback = feedback;
        return (0, types_1.ok)(undefined);
    }
    // ============================================================================
    // Private Helper Methods
    // ============================================================================
    createEmptyContext() {
        return {
            mentionedPeople: [],
            mentionedDates: [],
            mentionedProjects: [],
            upcomingMeetings: [],
            unreadEmails: 0
        };
    }
    sanitizeConversation(conversation) {
        // Remove internal fields
        const { archived, ...publicConversation } = conversation;
        return publicConversation;
    }
    updateContextFromMessage(context, message) {
        const lowerMessage = message.toLowerCase();
        // Detect topic
        if (lowerMessage.includes('email') || lowerMessage.includes('send')) {
            context.topic = 'email';
        }
        else if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
            context.topic = 'calendar';
        }
        else if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
            context.topic = 'tasks';
        }
        // Detect time references
        if (lowerMessage.includes('tomorrow')) {
            const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
            context.mentionedDates.push({
                timestamp: tomorrow,
                description: 'tomorrow',
                relative: 'tomorrow'
            });
        }
        if (lowerMessage.includes('next week')) {
            const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
            context.mentionedDates.push({
                timestamp: nextWeek,
                description: 'next week',
                relative: 'next week'
            });
        }
    }
    async generateResponse(message, context) {
        const lowerMessage = message.toLowerCase();
        // Pattern matching for different intents
        if (lowerMessage.includes('email') && lowerMessage.includes('send')) {
            return this.generateEmailResponse(message, context);
        }
        if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
            return this.generateMeetingResponse(message, context);
        }
        if (lowerMessage.includes('calendar') || lowerMessage.includes('today')) {
            return this.generateCalendarResponse(context);
        }
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return this.generateGreetingResponse();
        }
        // Default response
        return {
            content: "I understand you want help with that. Could you provide more details?",
            suggestions: [
                {
                    id: 'sug-1',
                    text: 'Check my calendar',
                    type: 'action'
                },
                {
                    id: 'sug-2',
                    text: 'Send an email',
                    type: 'action'
                },
                {
                    id: 'sug-3',
                    text: 'Schedule a meeting',
                    type: 'action'
                }
            ]
        };
    }
    generateEmailResponse(message, context) {
        const action = {
            type: 'send_email',
            description: 'Send email based on your request',
            params: {
                to: ['example@example.com'],
                subject: 'Email subject',
                body: 'Email body'
            },
            requiresConfirmation: true,
            riskLevel: 'medium'
        };
        return {
            content: "I can help you send that email. Let me draft it for you to review.",
            actions: [action],
            suggestions: [
                {
                    id: 'sug-1',
                    text: 'Review draft',
                    type: 'action',
                    action
                },
                {
                    id: 'sug-2',
                    text: 'Change recipient',
                    type: 'action'
                }
            ]
        };
    }
    generateMeetingResponse(message, context) {
        const action = {
            type: 'schedule_meeting',
            description: 'Schedule meeting based on your request',
            params: {
                title: 'Team Meeting',
                attendees: ['team@example.com'],
                duration: 30
            },
            requiresConfirmation: true,
            riskLevel: 'low'
        };
        return {
            content: "I'll help you schedule that meeting. Let me find a good time.",
            actions: [action],
            suggestions: [
                {
                    id: 'sug-1',
                    text: 'Find time this week',
                    type: 'action'
                },
                {
                    id: 'sug-2',
                    text: 'Suggest alternative times',
                    type: 'action'
                }
            ]
        };
    }
    generateCalendarResponse(context) {
        const meetingCount = context.upcomingMeetings.length;
        if (meetingCount === 0) {
            return {
                content: "You have no meetings scheduled for today. Your calendar is clear!",
                suggestions: [
                    {
                        id: 'sug-1',
                        text: 'Schedule a meeting',
                        type: 'action'
                    },
                    {
                        id: 'sug-2',
                        text: 'Check tomorrow',
                        type: 'question'
                    }
                ]
            };
        }
        return {
            content: `You have ${meetingCount} meeting${meetingCount > 1 ? 's' : ''} scheduled today.`,
            suggestions: [
                {
                    id: 'sug-1',
                    text: 'Show details',
                    type: 'action'
                },
                {
                    id: 'sug-2',
                    text: 'Find free time',
                    type: 'action'
                }
            ]
        };
    }
    generateGreetingResponse() {
        return {
            content: "Hello! I'm your AI assistant. I can help you with emails, calendar, tasks, and more. What would you like to do?",
            suggestions: [
                {
                    id: 'sug-1',
                    text: 'Check my calendar',
                    type: 'quick_reply'
                },
                {
                    id: 'sug-2',
                    text: 'Read my emails',
                    type: 'quick_reply'
                },
                {
                    id: 'sug-3',
                    text: 'Schedule a meeting',
                    type: 'quick_reply'
                }
            ]
        };
    }
}
exports.MockConversationService = MockConversationService;
//# sourceMappingURL=MockConversationService.js.map