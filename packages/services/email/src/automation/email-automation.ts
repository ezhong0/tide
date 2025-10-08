import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';
import type { SmartComposer } from '../composer/smart-composer.js';
import type {
  Email,
  EmailDraft,
  TriageResult,
  EmailAction,
  IEmailProvider,
  ComposeRequest,
} from '../types/index.js';

export interface EmailActionResult {
  type: 'send' | 'draft' | 'delegate' | 'archive' | 'queue_for_review';
  email?: EmailDraft;
  confidence: number;
  reasoning: string;
  calendarAction?: {
    type: 'tentative_block' | 'create_event';
    slots?: { start: Date; end: Date }[];
  };
}

/**
 * Email automation system that handles emails autonomously based on triage results
 */
export class EmailAutomation {
  constructor(
    private composer: SmartComposer,
    private emailProvider: IEmailProvider
  ) {}

  /**
   * Handle email based on triage result
   */
  async handle(email: Email, triage: TriageResult): Promise<EmailActionResult> {
    logger.info(
      {
        emailId: email.id,
        userId: email.userId,
        strategy: triage.strategy.type,
        canAutoHandle: triage.canAutoHandle,
      },
      'Handling email automatically'
    );

    try {
      switch (triage.strategy.type) {
        case 'archive':
          return await this.autoArchive(email, triage);

        case 'auto_decline':
          return await this.autoDecline(email, triage);

        case 'auto_delegate':
          return await this.autoDelegate(email, triage);

        case 'auto_acknowledge':
          return await this.autoAcknowledge(email, triage);

        case 'auto_schedule':
          return await this.autoSchedule(email, triage);

        case 'smart_draft':
          return await this.createSmartDraft(email, triage);

        case 'escalate':
          return await this.escalateToUser(email, triage);

        default:
          logger.warn(
            { emailId: email.id, strategy: triage.strategy.type },
            'Unknown email handling strategy encountered'
          );

          // In development, throw error for unknown strategies to catch bugs early
          if (process.env.NODE_ENV === 'development') {
            throw new Error(`Unknown email strategy: ${triage.strategy.type}`);
          }

          return {
            type: 'queue_for_review',
            confidence: 0.5,
            reasoning: `Unknown strategy '${triage.strategy.type}' - queuing for manual review`,
          };
      }
    } catch (error) {
      logger.error({ emailId: email.id, error }, 'Failed to handle email automatically');
      throw error;
    }
  }

  /**
   * Auto-archive low-priority emails
   */
  private async autoArchive(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // Archive email by removing INBOX label
    await this.emailProvider.modifyLabels(email.id, [], ['INBOX', 'UNREAD']);

    logger.info(
      { emailId: email.id, category: triage.category },
      'Email auto-archived'
    );

    return {
      type: 'archive',
      confidence: 0.95,
      reasoning: `Auto-archived ${triage.category} email with low importance (${triage.importance.toFixed(2)})`,
    };
  }

  /**
   * Auto-decline meeting requests
   */
  private async autoDecline(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // Generate polite decline
    const drafts = await this.composer.compose({
      userId: email.userId,
      recipient: email.from,
      subject: `Re: ${email.subject}`,
      context: 'Politely decline this meeting request due to schedule conflicts',
      thread: [email],
    });

    const declineDraft = drafts[0] || {
      subject: `Re: ${email.subject}`,
      body: 'Thank you for the invitation. Unfortunately, I will not be able to attend.',
      approach: 'formal',
      tone: 'professional',
      length: 50,
      confidence: 0.5,
    };

    return {
      type: 'send',
      email: declineDraft,
      confidence: drafts.length > 0 ? 0.85 : 0.5,
      reasoning: 'Auto-declining meeting request due to low importance or scheduling conflicts',
    };
  }

  /**
   * Auto-delegate to team members
   */
  private async autoDelegate(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // In a real implementation, this would identify the right person to delegate to
    // For now, create a draft for the user to review

    const drafts = await this.composer.compose({
      userId: email.userId,
      recipient: 'team@example.com', // Would be determined by delegation logic
      subject: `Fwd: ${email.subject}`,
      context: `Forwarding this email for appropriate handling. Original from ${email.from}`,
      thread: [email],
    });

    return {
      type: 'draft',
      email: drafts[0],
      confidence: 0.7,
      reasoning: 'Created delegation draft - requires approval before sending',
    };
  }

  /**
   * Auto-acknowledge FYI emails
   */
  private async autoAcknowledge(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // Generate brief acknowledgment
    const drafts = await this.composer.compose({
      userId: email.userId,
      recipient: email.from,
      subject: `Re: ${email.subject}`,
      context: 'Send a brief acknowledgment that you received this',
      thread: [email],
    });

    // Use concise version (index 1)
    const acknowledgment = drafts.find((d) => d.approach === 'concise') || drafts[0] || {
      subject: `Re: ${email.subject}`,
      body: 'Thank you, noted.',
      approach: 'concise' as DraftApproach,
      tone: 'professional',
      length: 15,
      confidence: 0.5,
    };

    return {
      type: 'send',
      email: acknowledgment,
      confidence: drafts.length > 0 ? 0.9 : 0.5,
      reasoning: 'Auto-acknowledging FYI email to confirm receipt',
    };
  }

  /**
   * Auto-schedule meetings
   */
  private async autoSchedule(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // Extract meeting details from email
    const meetingDetails = this.extractMeetingDetails(email);

    // Find available time slots (simplified - would integrate with calendar service)
    const slots = this.generateDefaultSlots(3); // Generate 3 suggested times

    // Generate response with time options
    const drafts = await this.composer.compose({
      userId: email.userId,
      recipient: email.from,
      subject: `Re: ${email.subject}`,
      context: `Propose these meeting times:\n${slots.map((s, i) => `${i + 1}. ${s.start.toLocaleString()}`).join('\n')}`,
      thread: [email],
    });

    return {
      type: 'send',
      email: drafts[0],
      confidence: 0.8,
      reasoning: 'Auto-responding with available meeting times',
      calendarAction: {
        type: 'tentative_block',
        slots,
      },
    };
  }

  /**
   * Create smart draft for review
   */
  private async createSmartDraft(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // Determine context based on category
    let context = '';

    switch (triage.category) {
      case 'request':
        context = 'Respond to this request professionally';
        break;
      case 'meeting':
        context = 'Respond regarding the meeting mentioned';
        break;
      case 'important':
        context = 'Provide a thoughtful response to this important email';
        break;
      default:
        context = 'Provide an appropriate response';
    }

    // Generate multiple draft options
    const drafts = await this.composer.compose({
      userId: email.userId,
      recipient: email.from,
      subject: `Re: ${email.subject}`,
      context,
      thread: [email],
    });

    return {
      type: 'draft',
      email: drafts[0], // Return best draft, but all are available
      confidence: triage.confidence,
      reasoning: `Created draft for ${triage.category} email - requires review before sending`,
    };
  }

  /**
   * Escalate to user for immediate attention
   */
  private async escalateToUser(
    email: Email,
    triage: TriageResult
  ): Promise<EmailActionResult> {
    // Mark as important and notify user
    await this.emailProvider.modifyLabels(email.id, ['IMPORTANT'], []);

    // Generate draft to help user respond quickly
    const drafts = await this.composer.compose({
      userId: email.userId,
      recipient: email.from,
      subject: `Re: ${email.subject}`,
      context: 'Important email - provide a professional response',
      thread: [email],
    });

    return {
      type: 'queue_for_review',
      email: drafts[0],
      confidence: 1.0,
      reasoning: `Escalated due to ${triage.strategy.reasoning}`,
    };
  }

  /**
   * Extract meeting details from email
   */
  private extractMeetingDetails(email: Email): {
    duration?: number;
    preferredTimes?: string[];
    attendees?: string[];
  } {
    const text = (email.subject + ' ' + email.body).toLowerCase();

    // Extract duration
    let duration = 60; // Default 60 minutes
    const durationMatch = text.match(/(\d+)\s*(min|minute|hour|hr)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      const rawDuration = unit.startsWith('h') ? value * 60 : value;
      // Validate duration: 15 minutes to 8 hours (480 minutes)
      duration = Math.min(Math.max(rawDuration, 15), 480);
    }

    // Extract attendees from CC and To fields
    const attendees = [...email.to];
    if (email.cc) {
      attendees.push(...email.cc);
    }

    return {
      duration,
      attendees: attendees.filter((e) => e !== email.userId),
    };
  }

  /**
   * Generate default meeting time slots
   */
  private generateDefaultSlots(count: number): { start: Date; end: Date }[] {
    const slots: { start: Date; end: Date }[] = [];
    const now = new Date();

    // Start from tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM

    // Generate slots at 10 AM, 2 PM, and 3 PM over next few days
    const preferredHours = [10, 14, 15];
    let dayOffset = 0;
    let hourIndex = 0;

    while (slots.length < count) {
      const slot = new Date(tomorrow);
      slot.setDate(slot.getDate() + dayOffset);
      slot.setHours(preferredHours[hourIndex], 0, 0, 0);

      // Skip weekends
      const dayOfWeek = slot.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const end = new Date(slot);
        end.setMinutes(end.getMinutes() + 60); // 1 hour meetings

        slots.push({ start: slot, end });
      }

      hourIndex++;
      if (hourIndex >= preferredHours.length) {
        hourIndex = 0;
        dayOffset++;
      }
    }

    return slots;
  }
}
