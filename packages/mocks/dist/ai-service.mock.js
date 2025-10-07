"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAIService = void 0;
class MockAIService {
    constructor() {
        this.responseDelay = 100; // Simulate AI processing time
    }
    async detectIntent(content) {
        await this.delay();
        // Simple pattern matching for demo
        if (content.toLowerCase().includes('email')) {
            return { type: 'email', confidence: 0.92, entities: [] };
        }
        if (content.toLowerCase().includes('meeting') || content.toLowerCase().includes('schedule')) {
            return { type: 'calendar', confidence: 0.89, entities: [] };
        }
        if (content.toLowerCase().includes('task') || content.toLowerCase().includes('workflow')) {
            return { type: 'task', confidence: 0.85, entities: [] };
        }
        return { type: 'general', confidence: 0.75, entities: [] };
    }
    async generateResponse(intent, context) {
        await this.delay();
        return {
            content: `I understand you want help with ${intent.type}. I'm processing your request...`,
            confidence: intent.confidence,
            suggestedActions: this.generateActions(intent),
            reasoning: `Detected intent: ${intent.type} with ${intent.confidence * 100}% confidence`
        };
    }
    async triageEmail(email) {
        await this.delay();
        // Simple mock triage logic
        const hasUrgent = email.subject?.toLowerCase().includes('urgent') ||
            email.body?.toLowerCase().includes('asap');
        return {
            priority: hasUrgent ? 'high' : 'normal',
            category: 'general',
            summary: `Email from ${email.from.name}: ${email.subject.substring(0, 50)}...`
        };
    }
    async draftEmail(context) {
        await this.delay();
        // Return 3 draft options as per spec
        return [
            `Dear ${context.to},\n\nThank you for reaching out regarding ${context.subject}. I appreciate you taking the time to connect...\n\n[Detailed 450-word response]`,
            `Hi ${context.to},\n\nThanks for your message about ${context.subject}. Here are the key points...\n\n[Balanced 200-word response]`,
            `${context.to},\n\nRe: ${context.subject} - Let's discuss Tuesday.\n\n[Brief 75-word response]`
        ];
    }
    async optimizeCalendar(events) {
        await this.delay();
        // Return events with optimization suggestions
        return events.map(event => ({
            ...event,
            suggestions: ['Move to avoid back-to-back meetings', 'Add 15min prep time']
        }));
    }
    generateActions(intent) {
        const actions = [];
        switch (intent.type) {
            case 'email':
                actions.push({
                    id: 'draft_email',
                    type: 'email.draft',
                    description: 'Draft a response',
                    preview: 'I can help you draft a professional response',
                    confidence: 0.9
                });
                break;
            case 'calendar':
                actions.push({
                    id: 'schedule_meeting',
                    type: 'calendar.schedule',
                    description: 'Schedule a meeting',
                    preview: 'Let me find available times',
                    confidence: 0.85
                });
                break;
            case 'task':
                actions.push({
                    id: 'create_workflow',
                    type: 'workflow.create',
                    description: 'Create a workflow',
                    preview: 'I can automate this process',
                    confidence: 0.8
                });
                break;
        }
        return actions;
    }
    delay() {
        return new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }
}
exports.MockAIService = MockAIService;
