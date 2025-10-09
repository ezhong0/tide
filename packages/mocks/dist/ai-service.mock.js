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
        const fullIntent = {
            category: intent.type === 'email' ? 'email_triage' :
                intent.type === 'calendar' ? 'calendar_schedule' :
                    intent.type === 'task' ? 'task_create' : 'question_answer',
            action: `Handle ${intent.type} request`,
            confidence: intent.confidence,
            entities: intent.entities.map(e => ({
                type: 'action_item',
                value: e.value,
                confidence: e.confidence,
                span: [0, 0],
                normalized: e.value
            }))
        };
        return {
            requestId: `mock-${Date.now()}`,
            content: `I understand you want help with ${intent.type}. I'm processing your request...`,
            intents: [fullIntent],
            suggestedActions: this.generateActions(intent),
            confidence: intent.confidence,
            reasoning: {
                steps: [{
                        step: 1,
                        description: 'Analyze user intent',
                        input: { type: intent.type },
                        output: { confidence: intent.confidence },
                        reasoning: `Detected intent: ${intent.type} with ${intent.confidence * 100}% confidence`,
                        confidence: intent.confidence,
                        model: 'gpt-5-mini',
                        verified: true
                    }],
                finalConclusion: `User wants help with ${intent.type}`,
                confidence: intent.confidence,
                verified: true
            },
            executionTime: this.responseDelay,
            model: {
                primary: 'gpt-5-mini',
                reasoning: 'Mock model for testing'
            },
            tokensUsed: 150,
            cost: 0.0001,
            timestamp: Date.now()
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
                    type: 'email_send',
                    title: 'Draft Email Response',
                    description: 'Draft a response',
                    preview: 'I can help you draft a professional response',
                    confidence: 0.9,
                    payload: { template: 'professional_reply' },
                    requiresConfirmation: true
                });
                break;
            case 'calendar':
                actions.push({
                    id: 'schedule_meeting',
                    type: 'calendar_create',
                    title: 'Schedule Meeting',
                    description: 'Schedule a meeting',
                    preview: 'Let me find available times',
                    confidence: 0.85,
                    payload: { duration: 30 },
                    requiresConfirmation: true
                });
                break;
            case 'task':
                actions.push({
                    id: 'create_workflow',
                    type: 'workflow_start',
                    title: 'Create Workflow',
                    description: 'Create a workflow',
                    preview: 'I can automate this process',
                    confidence: 0.8,
                    payload: { workflowType: 'automated_task' },
                    requiresConfirmation: true
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
