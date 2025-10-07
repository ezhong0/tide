import type { SmartComposer } from '../composer/smart-composer.js';
import type { Email, EmailDraft, TriageResult, IEmailProvider } from '../types/index.js';
export interface EmailActionResult {
    type: 'send' | 'draft' | 'delegate' | 'archive' | 'queue_for_review';
    email?: EmailDraft;
    confidence: number;
    reasoning: string;
    calendarAction?: {
        type: 'tentative_block' | 'create_event';
        slots?: {
            start: Date;
            end: Date;
        }[];
    };
}
/**
 * Email automation system that handles emails autonomously based on triage results
 */
export declare class EmailAutomation {
    private composer;
    private emailProvider;
    constructor(composer: SmartComposer, emailProvider: IEmailProvider);
    /**
     * Handle email based on triage result
     */
    handle(email: Email, triage: TriageResult): Promise<EmailActionResult>;
    /**
     * Auto-archive low-priority emails
     */
    private autoArchive;
    /**
     * Auto-decline meeting requests
     */
    private autoDecline;
    /**
     * Auto-delegate to team members
     */
    private autoDelegate;
    /**
     * Auto-acknowledge FYI emails
     */
    private autoAcknowledge;
    /**
     * Auto-schedule meetings
     */
    private autoSchedule;
    /**
     * Create smart draft for review
     */
    private createSmartDraft;
    /**
     * Escalate to user for immediate attention
     */
    private escalateToUser;
    /**
     * Extract meeting details from email
     */
    private extractMeetingDetails;
    /**
     * Generate default meeting time slots
     */
    private generateDefaultSlots;
}
//# sourceMappingURL=email-automation.d.ts.map