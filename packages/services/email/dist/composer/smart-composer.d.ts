import type { EmailDraft, ComposeRequest } from '../types';
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
     * Generate email body
     */
    private generateBody;
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