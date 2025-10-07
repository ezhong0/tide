"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartComposer = void 0;
const logger_1 = require("@tide/logger");
/**
 * Smart email composer that generates multiple draft options
 */
class SmartComposer {
    /**
     * Compose email drafts with different approaches
     */
    async compose(request) {
        logger_1.logger.info({
            userId: request.userId,
            recipient: request.recipient,
            subject: request.subject,
        }, 'Composing email drafts');
        try {
            // Get user's writing style
            const style = await this.getUserStyle(request.userId);
            // Generate three different drafts in parallel
            const [detailedDraft, conciseDraft, friendlyDraft] = await Promise.all([
                this.generateDraft('detailed', request, style),
                this.generateDraft('concise', request, style),
                this.generateDraft('friendly', request, style),
            ]);
            const drafts = [detailedDraft, conciseDraft, friendlyDraft];
            logger_1.logger.info({ userId: request.userId, draftCount: drafts.length }, 'Email drafts generated');
            return drafts;
        }
        catch (error) {
            logger_1.logger.error({ userId: request.userId, error }, 'Failed to compose email');
            throw error;
        }
    }
    /**
     * Generate a single draft with specific approach
     */
    async generateDraft(approach, request, style) {
        // Build context from thread
        const context = this.buildContext(request);
        // Generate subject if not provided
        const subject = request.subject || this.generateSubject(request, approach);
        // Generate body
        const body = this.generateBody(approach, request, style, context);
        // Analyze tone
        const tone = this.analyzeTone(body, approach);
        return {
            approach,
            subject,
            body,
            tone,
            length: body.length,
            confidence: this.calculateDraftConfidence(approach, request),
        };
    }
    /**
     * Generate email subject
     */
    generateSubject(request, approach) {
        // If replying to thread, use Re: prefix
        if (request.thread && request.thread.length > 0) {
            const originalSubject = request.thread[0].subject;
            if (!originalSubject.toLowerCase().startsWith('re:')) {
                return `Re: ${originalSubject}`;
            }
            return originalSubject;
        }
        // Generate based on context
        if (request.context) {
            const contextLower = request.context.toLowerCase();
            if (contextLower.includes('meeting')) {
                return 'Meeting Request';
            }
            if (contextLower.includes('follow up')) {
                return 'Following Up';
            }
            if (contextLower.includes('question')) {
                return 'Quick Question';
            }
        }
        return 'Hello';
    }
    /**
     * Generate email body
     */
    generateBody(approach, request, style, context) {
        const parts = [];
        // Greeting
        const greeting = this.generateGreeting(approach, style, request.recipient);
        parts.push(greeting);
        parts.push('');
        // Main content
        const mainContent = this.generateMainContent(approach, request, context);
        parts.push(mainContent);
        parts.push('');
        // Closing
        const closing = this.generateClosing(approach, style);
        parts.push(closing);
        return parts.join('\n');
    }
    /**
     * Generate greeting based on approach
     */
    generateGreeting(approach, style, recipient) {
        const name = this.extractName(recipient);
        switch (approach) {
            case 'formal':
                return `Dear ${name},`;
            case 'friendly':
                return `Hi ${name}!`;
            case 'concise':
                return `Hi ${name},`;
            case 'detailed':
                return `Hello ${name},`;
            default:
                // Use preferred greeting from style
                if (style.preferredGreetings && style.preferredGreetings.length > 0) {
                    return style.preferredGreetings[0].replace('{name}', name);
                }
                return `Hi ${name},`;
        }
    }
    /**
     * Generate main email content
     */
    generateMainContent(approach, request, context) {
        const contextSummary = request.context || context || '';
        switch (approach) {
            case 'detailed':
                return this.generateDetailedContent(request, contextSummary);
            case 'concise':
                return this.generateConciseContent(request, contextSummary);
            case 'friendly':
                return this.generateFriendlyContent(request, contextSummary);
            case 'formal':
                return this.generateFormalContent(request, contextSummary);
            default:
                return this.generateConciseContent(request, contextSummary);
        }
    }
    /**
     * Generate detailed content
     */
    generateDetailedContent(request, context) {
        const parts = [];
        // Opening context
        if (request.thread && request.thread.length > 0) {
            parts.push('Thank you for your email. I wanted to provide a comprehensive response to your inquiry.');
            parts.push('');
        }
        // Main points
        if (context) {
            parts.push(context);
            parts.push('');
        }
        else {
            parts.push('I wanted to reach out regarding our recent discussions. After careful consideration, I believe we should move forward with the following approach:');
            parts.push('');
            parts.push('1. Review the current status and identify key priorities');
            parts.push('2. Schedule a follow-up meeting to discuss next steps');
            parts.push('3. Ensure all stakeholders are aligned on the timeline');
            parts.push('');
        }
        // Call to action
        parts.push('Please let me know if you have any questions or if you would like to discuss this further. I am happy to schedule a call at your convenience.');
        return parts.join('\n');
    }
    /**
     * Generate concise content
     */
    generateConciseContent(request, context) {
        if (context) {
            return `${context}\n\nLet me know if you have any questions.`;
        }
        if (request.thread && request.thread.length > 0) {
            return 'Thanks for reaching out. I will review this and get back to you shortly.';
        }
        return 'I wanted to follow up on our previous discussion. Can we schedule some time to connect?';
    }
    /**
     * Generate friendly content
     */
    generateFriendlyContent(request, context) {
        const parts = [];
        if (request.thread && request.thread.length > 0) {
            parts.push('Thanks so much for your email! I really appreciate you reaching out.');
            parts.push('');
        }
        else {
            parts.push('Hope you are doing well!');
            parts.push('');
        }
        if (context) {
            parts.push(context);
        }
        else {
            parts.push('I wanted to touch base and see if we could find some time to connect. Would love to hear your thoughts on this!');
        }
        parts.push('');
        parts.push('Looking forward to hearing from you!');
        return parts.join('\n');
    }
    /**
     * Generate formal content
     */
    generateFormalContent(request, context) {
        const parts = [];
        parts.push('I am writing to follow up on our previous correspondence regarding this matter.');
        parts.push('');
        if (context) {
            parts.push(context);
        }
        else {
            parts.push('I would appreciate the opportunity to discuss this further at your earliest convenience.');
        }
        parts.push('');
        parts.push('Thank you for your time and consideration.');
        return parts.join('\n');
    }
    /**
     * Generate closing
     */
    generateClosing(approach, style) {
        switch (approach) {
            case 'formal':
                return 'Sincerely,\n[Your Name]';
            case 'friendly':
                return 'Best,\n[Your Name]';
            case 'concise':
                return 'Thanks,\n[Your Name]';
            case 'detailed':
                return 'Best regards,\n[Your Name]';
            default:
                // Use preferred closing from style
                if (style.preferredClosings && style.preferredClosings.length > 0) {
                    return `${style.preferredClosings[0]}\n[Your Name]`;
                }
                return 'Best,\n[Your Name]';
        }
    }
    /**
     * Build context from email thread
     */
    buildContext(request) {
        if (!request.thread || request.thread.length === 0) {
            return '';
        }
        // Summarize thread context
        const latestEmail = request.thread[0];
        const summary = `Regarding: ${latestEmail.subject}`;
        return summary;
    }
    /**
     * Analyze tone of generated draft
     */
    analyzeTone(body, approach) {
        const lowerBody = body.toLowerCase();
        if (lowerBody.includes('sincerely') ||
            lowerBody.includes('respectfully')) {
            return 'Formal';
        }
        if (lowerBody.includes('hope you') ||
            lowerBody.includes('looking forward')) {
            return 'Friendly';
        }
        if (lowerBody.length < 200) {
            return 'Concise';
        }
        return 'Professional';
    }
    /**
     * Calculate confidence in draft quality
     */
    calculateDraftConfidence(approach, request) {
        let confidence = 0.7; // Base confidence
        // More context increases confidence
        if (request.thread && request.thread.length > 0) {
            confidence += 0.1;
        }
        if (request.context) {
            confidence += 0.1;
        }
        // Specific approaches have different confidence levels
        if (approach === 'concise') {
            confidence += 0.05; // Concise is easier to get right
        }
        return Math.min(confidence, 0.95);
    }
    /**
     * Extract name from email address
     */
    extractName(email) {
        // Try to extract name before @
        const localPart = email.split('@')[0];
        // Split by dots or underscores
        const parts = localPart.split(/[._]/);
        // Capitalize first part
        if (parts.length > 0) {
            return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }
        return 'there';
    }
    /**
     * Get user's writing style (would analyze sent emails)
     */
    async getUserStyle(userId) {
        // In a real implementation, this would analyze the user's sent emails
        // For now, return a default style
        return {
            preferredGreetings: ['Hi {name},', 'Hello {name},'],
            preferredClosings: ['Best,', 'Thanks,', 'Best regards,'],
            averageSentenceLength: 15,
            formalityLevel: 0.6,
            commonPhrases: [],
            toneProfile: {
                professional: 0.7,
                casual: 0.2,
                formal: 0.1,
            },
        };
    }
}
exports.SmartComposer = SmartComposer;
//# sourceMappingURL=smart-composer.js.map