/**
 * Email Tools for GPT-5 Function Calling
 */

import type { TideTool } from './types.js';
import { createLogger } from '@tide/logger';
import { serviceUrls, timeouts, retryConfig } from '@tide/config';
import { withTimeout, retryWithBackoff, retryPatterns } from '../utils/helpers.js';

const logger = createLogger({ component: 'EmailTools' });

/**
 * Search emails by query, sender, date range, or other criteria
 */
export const searchEmailsTool: TideTool = {
  type: 'function',
  name: 'search_emails',
  description: 'Search user emails by query, sender, date range, or other criteria. Returns matching emails with sender, subject, preview, and metadata.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query to match against subject and body',
      },
      from: {
        type: 'string',
        description: 'Filter by sender email address',
      },
      dateFrom: {
        type: 'string',
        description: 'Start date for filtering (ISO 8601 format)',
      },
      dateTo: {
        type: 'string',
        description: 'End date for filtering (ISO 8601 format)',
      },
      isUnread: {
        type: 'boolean',
        description: 'Filter for unread emails only',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 20, max: 100)',
        minimum: 1,
        maximum: 100,
      },
    },
    required: [],
  },
  handler: async (params, context) => {
    const { query, from, dateFrom, dateTo, isUnread, limit = 20 } = params;

    logger.info('Searching emails', {
      query,
      from,
      userId: context.userId,
    });

    // Call the email service with timeout and retry logic
    return await retryWithBackoff(
      async () => {
        const response = await withTimeout(
          fetch(`${serviceUrls.email}/api/emails/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': context.jwtToken ? `Bearer ${context.jwtToken}` : `Bearer ${context.userId}`,
            },
            body: JSON.stringify({
              userId: context.userId,
              query,
              from,
              dateFrom,
              dateTo,
              isUnread,
              limit,
            }),
          }),
          timeouts.externalApi,
          'searchEmails'
        );

        if (!response.ok) {
          throw new Error(`Email search failed: ${response.statusText}`);
        }

        return await response.json();
      },
      {
        ...retryConfig,
        retryableErrors: [...retryPatterns.network, ...retryPatterns.serviceUnavailable],
        name: 'searchEmails',
      }
    );
  },
};

/**
 * Compose a draft email with AI assistance
 */
export const composeEmailTool: TideTool = {
  type: 'function',
  name: 'compose_email',
  description: 'Compose a draft email with AI assistance. The system will match the user\'s writing style and tone. Returns a draft that can be reviewed before sending.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient email address',
      },
      subject: {
        type: 'string',
        description: 'Email subject line',
      },
      context: {
        type: 'string',
        description: 'What the email should communicate (e.g., "Thank them for the meeting and confirm next steps")',
      },
      tone: {
        type: 'string',
        description: 'Desired tone of the email',
        enum: ['professional', 'casual', 'formal', 'friendly'],
      },
      length: {
        type: 'string',
        description: 'Desired length of the email',
        enum: ['brief', 'balanced', 'detailed'],
      },
      replyToEmailId: {
        type: 'string',
        description: 'If replying to an email, the ID of that email for context',
      },
    },
    required: ['to', 'context'],
  },
  handler: async (params, context) => {
    const { to, subject, context: emailContext, tone = 'professional', length = 'balanced', replyToEmailId } = params;

    logger.info('Composing email', {
      to,
      tone,
      length,
      userId: context.userId,
    });

    return await retryWithBackoff(
      async () => {
        const response = await withTimeout(
          fetch(`${serviceUrls.email}/api/emails/compose`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': context.jwtToken ? `Bearer ${context.jwtToken}` : `Bearer ${context.userId}`,
            },
            body: JSON.stringify({
              userId: context.userId,
              to,
              subject,
              context: emailContext,
              tone,
              length,
              replyToEmailId,
            }),
          }),
          timeouts.externalApi,
          'composeEmail'
        );

        if (!response.ok) {
          throw new Error(`Email composition failed: ${response.statusText}`);
        }

        const result = await response.json() as { body: string; subject?: string };

        return {
          draft: result.body,
          subject: result.subject || subject,
          previewText: result.body.substring(0, 200),
          wordCount: result.body.split(/\s+/).length,
        };
      },
      {
        ...retryConfig,
        retryableErrors: [...retryPatterns.network, ...retryPatterns.serviceUnavailable],
        name: 'composeEmail',
      }
    );
  },
};

/**
 * Send an email
 */
export const sendEmailTool: TideTool = {
  type: 'function',
  name: 'send_email',
  description: 'Send an email to one or more recipients. Use this after getting user confirmation for the draft. IMPORTANT: Always ask for user confirmation before sending emails.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Primary recipient email address',
      },
      subject: {
        type: 'string',
        description: 'Email subject line',
      },
      body: {
        type: 'string',
        description: 'Email body content (plain text or HTML)',
      },
      cc: {
        type: 'array',
        description: 'CC recipients',
        items: {
          type: 'string',
          description: 'Email address',
        },
      },
      bcc: {
        type: 'array',
        description: 'BCC recipients',
        items: {
          type: 'string',
          description: 'Email address',
        },
      },
    },
    required: ['to', 'subject', 'body'],
  },
  handler: async (params, context) => {
    const { to, subject, body, cc, bcc } = params;

    logger.info('Sending email', {
      to,
      subject,
      userId: context.userId,
    });

    return await retryWithBackoff(
      async () => {
        const response = await withTimeout(
          fetch(`${serviceUrls.email}/api/emails/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': context.jwtToken ? `Bearer ${context.jwtToken}` : `Bearer ${context.userId}`,
            },
            body: JSON.stringify({
              userId: context.userId,
              to,
              subject,
              body,
              cc,
              bcc,
            }),
          }),
          timeouts.externalApi,
          'sendEmail'
        );

        if (!response.ok) {
          throw new Error(`Email send failed: ${response.statusText}`);
        }

        const result = await response.json() as { messageId: string };

        return {
          sent: true,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
        };
      },
      {
        ...retryConfig,
        maxAttempts: 2, // Don't retry sending emails too many times
        retryableErrors: retryPatterns.network, // Only retry network errors, not 4xx/5xx
        name: 'sendEmail',
      }
    );
  },
};

/**
 * Categorize and prioritize emails using AI
 */
export const categorizeEmailsTool: TideTool = {
  type: 'function',
  name: 'categorize_emails',
  description: 'Automatically categorize and prioritize a list of emails using AI. Returns categories, priorities, and urgency levels for each email.',
  parameters: {
    type: 'object',
    properties: {
      emailIds: {
        type: 'array',
        description: 'Array of email IDs to categorize',
        items: {
          type: 'string',
          description: 'Email ID',
        },
      },
    },
    required: ['emailIds'],
  },
  handler: async (params, context) => {
    const { emailIds } = params;

    logger.info('Categorizing emails', {
      count: emailIds.length,
      userId: context.userId,
    });

    return await retryWithBackoff(
      async () => {
        const response = await withTimeout(
          fetch(`${serviceUrls.email}/api/emails/categorize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': context.jwtToken ? `Bearer ${context.jwtToken}` : `Bearer ${context.userId}`,
            },
            body: JSON.stringify({
              userId: context.userId,
              emailIds,
            }),
          }),
          timeouts.externalApi,
          'categorizeEmails'
        );

        if (!response.ok) {
          throw new Error(`Email categorization failed: ${response.statusText}`);
        }

        return await response.json();
      },
      {
        ...retryConfig,
        retryableErrors: [...retryPatterns.network, ...retryPatterns.serviceUnavailable],
        name: 'categorizeEmails',
      }
    );
  },
};

/**
 * All email tools
 */
export const emailTools: TideTool[] = [
  searchEmailsTool,
  composeEmailTool,
  sendEmailTool,
  categorizeEmailsTool,
];
