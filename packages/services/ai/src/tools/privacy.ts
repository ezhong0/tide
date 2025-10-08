/**
 * Privacy Sanitization Layer
 * Ensures sensitive data is not sent to external AI APIs (GPT-5)
 */

import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'PrivacySanitizer' });

/**
 * Email object with full content
 */
export interface FullEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  attachments?: any[];
  labels?: string[];
  isRead?: boolean;
  isStarred?: boolean;
  priority?: string;
}

/**
 * Sanitized email for external API
 */
export interface SanitizedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string; // First 200 characters only
  date: string;
  hasAttachments: boolean;
  labels?: string[];
  isRead?: boolean;
  isStarred?: boolean;
  priority?: string;
  // Full body EXCLUDED
  // Attachments EXCLUDED
}

/**
 * Calendar event with full details
 */
export interface FullCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees?: Array<{ email: string; name?: string; status?: string }>;
  location?: string;
  meetingLink?: string;
  organizer?: { email: string; name?: string };
  recurrence?: any;
}

/**
 * Sanitized calendar event
 */
export interface SanitizedCalendarEvent {
  id: string;
  title: string;
  summary: string; // First 100 chars of description
  start: string;
  end: string;
  attendeeCount: number;
  hasLocation: boolean;
  hasMeetingLink: boolean;
  isOrganizer: boolean;
  // Full description EXCLUDED
  // Attendee details EXCLUDED (names/emails)
  // Meeting link EXCLUDED
}

/**
 * Task with full details
 */
export interface FullTask {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  subtasks?: any[];
  notes?: string;
}

/**
 * Sanitized task
 */
export interface SanitizedTask {
  id: string;
  title: string;
  summary: string; // First 100 chars of description
  priority: string;
  status: string;
  dueDate?: string;
  subtaskCount: number;
  // Full description EXCLUDED
  // Notes EXCLUDED
}

/**
 * Privacy sanitizer for emails
 */
export class EmailSanitizer {
  /**
   * Sanitize a single email
   */
  static sanitize(email: FullEmail): SanitizedEmail {
    return {
      id: email.id,
      from: email.from,
      to: email.to,
      subject: email.subject,
      snippet: this.extractSnippet(email.body, 200),
      date: email.date,
      hasAttachments: (email.attachments?.length || 0) > 0,
      labels: email.labels,
      isRead: email.isRead,
      isStarred: email.isStarred,
      priority: email.priority,
    };
  }

  /**
   * Sanitize array of emails
   */
  static sanitizeMany(emails: FullEmail[]): SanitizedEmail[] {
    return emails.map(email => this.sanitize(email));
  }

  /**
   * Extract snippet from email body
   */
  private static extractSnippet(body: string, maxLength: number): string {
    if (!body) return '';

    // Remove HTML tags
    const plainText = body.replace(/<[^>]*>/g, '');

    // Remove excessive whitespace
    const normalized = plainText.replace(/\s+/g, ' ').trim();

    // Truncate to max length
    if (normalized.length <= maxLength) {
      return normalized;
    }

    // Find last complete word within limit
    const truncated = normalized.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  /**
   * Check if email contains sensitive keywords
   */
  static containsSensitiveContent(email: FullEmail): boolean {
    const sensitivePatterns = [
      /\b(password|ssn|social security|credit card|bank account)\b/i,
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
    ];

    const content = `${email.subject} ${email.body}`.toLowerCase();

    return sensitivePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Warn if sensitive content detected
   */
  static checkAndWarn(email: FullEmail): void {
    if (this.containsSensitiveContent(email)) {
      logger.warn('Sensitive content detected in email', {
        emailId: email.id,
        subject: email.subject,
      });
    }
  }
}

/**
 * Privacy sanitizer for calendar events
 */
export class CalendarSanitizer {
  /**
   * Sanitize a single calendar event
   */
  static sanitize(event: FullCalendarEvent, userEmail: string): SanitizedCalendarEvent {
    return {
      id: event.id,
      title: event.title,
      summary: this.extractSummary(event.description, 100),
      start: event.start,
      end: event.end,
      attendeeCount: event.attendees?.length || 0,
      hasLocation: !!event.location,
      hasMeetingLink: !!event.meetingLink,
      isOrganizer: event.organizer?.email === userEmail,
    };
  }

  /**
   * Sanitize array of events
   */
  static sanitizeMany(events: FullCalendarEvent[], userEmail: string): SanitizedCalendarEvent[] {
    return events.map(event => this.sanitize(event, userEmail));
  }

  /**
   * Extract summary from description
   */
  private static extractSummary(description: string | undefined, maxLength: number): string {
    if (!description) return '';

    const normalized = description.replace(/\s+/g, ' ').trim();

    if (normalized.length <= maxLength) {
      return normalized;
    }

    const truncated = normalized.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }
}

/**
 * Privacy sanitizer for tasks
 */
export class TaskSanitizer {
  /**
   * Sanitize a single task
   */
  static sanitize(task: FullTask): SanitizedTask {
    return {
      id: task.id,
      title: task.title,
      summary: this.extractSummary(task.description, 100),
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      subtaskCount: task.subtasks?.length || 0,
    };
  }

  /**
   * Sanitize array of tasks
   */
  static sanitizeMany(tasks: FullTask[]): SanitizedTask[] {
    return tasks.map(task => this.sanitize(task));
  }

  /**
   * Extract summary from description
   */
  private static extractSummary(description: string | undefined, maxLength: number): string {
    if (!description) return '';

    const normalized = description.replace(/\s+/g, ' ').trim();

    if (normalized.length <= maxLength) {
      return normalized;
    }

    const truncated = normalized.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }
}

/**
 * Privacy configuration
 */
export interface PrivacyConfig {
  /**
   * Maximum snippet length for emails
   */
  emailSnippetLength: number;

  /**
   * Maximum summary length for events/tasks
   */
  summaryLength: number;

  /**
   * Enable sensitive content detection
   */
  detectSensitiveContent: boolean;

  /**
   * Block sending if sensitive content detected
   */
  blockSensitiveContent: boolean;
}

/**
 * Default privacy configuration
 */
export const defaultPrivacyConfig: PrivacyConfig = {
  emailSnippetLength: 200,
  summaryLength: 100,
  detectSensitiveContent: true,
  blockSensitiveContent: false, // Warn only by default
};

/**
 * Main privacy sanitizer
 */
export class PrivacySanitizer {
  private config: PrivacyConfig;

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = { ...defaultPrivacyConfig, ...config };
  }

  /**
   * Sanitize any data before sending to external AI API
   */
  sanitize(data: any, dataType: 'email' | 'calendar' | 'task', userEmail?: string): any {
    if (dataType === 'email') {
      if (Array.isArray(data)) {
        return EmailSanitizer.sanitizeMany(data);
      }
      return EmailSanitizer.sanitize(data);
    }

    if (dataType === 'calendar') {
      if (!userEmail) {
        logger.warn('Calendar sanitization without userEmail - organizer detection disabled');
      }
      if (Array.isArray(data)) {
        return CalendarSanitizer.sanitizeMany(data, userEmail || '');
      }
      return CalendarSanitizer.sanitize(data, userEmail || '');
    }

    if (dataType === 'task') {
      if (Array.isArray(data)) {
        return TaskSanitizer.sanitizeMany(data);
      }
      return TaskSanitizer.sanitize(data);
    }

    logger.warn('Unknown data type for sanitization', { dataType });
    return data;
  }

  /**
   * Check if data is safe to send
   */
  isSafe(data: any, dataType: 'email' | 'calendar' | 'task'): boolean {
    if (!this.config.detectSensitiveContent) {
      return true;
    }

    if (dataType === 'email') {
      const emails = Array.isArray(data) ? data : [data];
      return !emails.some(email => EmailSanitizer.containsSensitiveContent(email));
    }

    // Calendar and tasks don't have sensitive content detection yet
    return true;
  }
}

/**
 * Global privacy sanitizer instance
 */
export const privacySanitizer = new PrivacySanitizer();
