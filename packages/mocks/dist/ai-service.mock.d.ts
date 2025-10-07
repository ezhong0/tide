import { AIIntent, AIResponse, Email } from '@tide/contracts';
export declare class MockAIService {
    private responseDelay;
    detectIntent(content: string): Promise<AIIntent>;
    generateResponse(intent: AIIntent, context: any): Promise<AIResponse>;
    triageEmail(email: Email): Promise<{
        priority: string;
        category: string;
        summary: string;
    }>;
    draftEmail(context: {
        to: string;
        subject: string;
        context: string;
    }): Promise<string[]>;
    optimizeCalendar(events: any[]): Promise<any[]>;
    private generateActions;
    private delay;
}
