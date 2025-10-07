import type { EmailDraft, ComposeRequest } from '../types/index.js';
/**
 * Smart email composer that generates multiple draft options
 */
export declare class SmartComposer {
    /**
     * Compose email drafts with different approaches
     */
    compose(request: ComposeRequest): Promise<EmailDraft[]>;
    /**
     * Generate a single draft with specific approach
     */
    private generateDraft;
    /**
     * Generate email subject
     */
    private generateSubject;
    /**
     * Generate email body with AI enhancement
     */
    private generateBody;
    /**
     * Generate AI-enhanced email draft using AI Service
     * This integrates with the AI Service for intelligent composition
     */
    generateAIDraft(request: ComposeRequest): Promise<EmailDraft>;
    /**
     * Build enhanced context including thread history and user preferences
     */
    private buildEnhancedContext;
    /**
     * Build AI prompt for email composition
     */
    private buildAIPrompt;
    /**
     * Generate content using AI (integration point for AI Service)
     */
    private generateWithAI;
    /**
     * Enhanced template generation with better context awareness
     */
    private generateEnhancedTemplate;
    /**
     * Parse AI-generated response
     */
    private parseAIResponse;
    /**
     * Summarize email thread for context
     */
    private summarizeThread;
    /**
     * Generate greeting based on approach
     */
    private generateGreeting;
    /**
     * Generate main email content
     */
    private generateMainContent;
    /**
     * Generate detailed content
     */
    private generateDetailedContent;
    /**
     * Generate concise content
     */
    private generateConciseContent;
    /**
     * Generate friendly content
     */
    private generateFriendlyContent;
    /**
     * Generate formal content
     */
    private generateFormalContent;
    /**
     * Generate closing
     */
    private generateClosing;
    /**
     * Build context from email thread
     */
    private buildContext;
    /**
     * Analyze tone of generated draft
     */
    private analyzeTone;
    /**
     * Calculate confidence in draft quality
     */
    private calculateDraftConfidence;
    /**
     * Extract name from email address
     */
    private extractName;
    /**
     * Get user's writing style (would analyze sent emails)
     */
    private getUserStyle;
}
//# sourceMappingURL=smart-composer.d.ts.map