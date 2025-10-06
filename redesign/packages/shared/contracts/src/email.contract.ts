import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  EmailSchema,
  EmailDraftSchema,
  EmailThreadSchema,
  TriageResultSchema,
  EmailAccountSchema,
  PaginationSchema,
  ErrorResponseSchema,
  EmailCategorySchema,
} from '@tide/types';

const c = initContract();

export const emailContract = c.router({
  // Get emails
  getEmails: {
    method: 'GET',
    path: '/emails',
    query: z.object({
      page: z.string().optional(),
      pageSize: z.string().optional(),
      category: z.string().optional(),
      priority: z.string().optional(),
      isRead: z.string().optional(),
      search: z.string().optional(),
    }),
    responses: {
      200: z.object({
        data: z.array(EmailSchema),
        pagination: PaginationSchema,
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get emails with filters',
  },

  // Get a specific email
  getEmail: {
    method: 'GET',
    path: '/emails/:emailId',
    pathParams: z.object({
      emailId: z.string(),
    }),
    responses: {
      200: EmailSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get a specific email',
  },

  // Update email metadata
  updateEmail: {
    method: 'PATCH',
    path: '/emails/:emailId',
    pathParams: z.object({
      emailId: z.string(),
    }),
    body: z.object({
      isRead: z.boolean().optional(),
      isFlagged: z.boolean().optional(),
      isStarred: z.boolean().optional(),
      category: EmailCategorySchema.optional(),
      labels: z.array(z.string()).optional(),
    }),
    responses: {
      200: EmailSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Update email metadata',
  },

  // Triage an email
  triageEmail: {
    method: 'POST',
    path: '/emails/:emailId/triage',
    pathParams: z.object({
      emailId: z.string(),
    }),
    body: z.object({}),
    responses: {
      200: TriageResultSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Triage an email with AI',
  },

  // Get email threads
  getThreads: {
    method: 'GET',
    path: '/emails/threads',
    query: z.object({
      page: z.string().optional(),
      pageSize: z.string().optional(),
      search: z.string().optional(),
    }),
    responses: {
      200: z.object({
        data: z.array(EmailThreadSchema),
        pagination: PaginationSchema,
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get email threads',
  },

  // Get a specific thread
  getThread: {
    method: 'GET',
    path: '/emails/threads/:threadId',
    pathParams: z.object({
      threadId: z.string(),
    }),
    responses: {
      200: EmailThreadSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get a specific email thread',
  },

  // Create draft
  createDraft: {
    method: 'POST',
    path: '/emails/drafts',
    body: z.object({
      to: z.array(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })),
      cc: z.array(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })).optional(),
      subject: z.string(),
      body: z.string(),
      replyToId: z.string().optional(),
    }),
    responses: {
      201: EmailDraftSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Create an email draft',
  },

  // Get drafts
  getDrafts: {
    method: 'GET',
    path: '/emails/drafts',
    query: z.object({
      page: z.string().optional(),
      pageSize: z.string().optional(),
    }),
    responses: {
      200: z.object({
        data: z.array(EmailDraftSchema),
        pagination: PaginationSchema,
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get email drafts',
  },

  // Update draft
  updateDraft: {
    method: 'PATCH',
    path: '/emails/drafts/:draftId',
    pathParams: z.object({
      draftId: z.string().uuid(),
    }),
    body: z.object({
      to: z.array(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })).optional(),
      cc: z.array(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })).optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
    }),
    responses: {
      200: EmailDraftSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Update an email draft',
  },

  // Send draft
  sendDraft: {
    method: 'POST',
    path: '/emails/drafts/:draftId/send',
    pathParams: z.object({
      draftId: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      200: EmailSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Send an email draft',
  },

  // Delete draft
  deleteDraft: {
    method: 'DELETE',
    path: '/emails/drafts/:draftId',
    pathParams: z.object({
      draftId: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Delete an email draft',
  },

  // Sync emails
  syncEmails: {
    method: 'POST',
    path: '/emails/sync',
    body: z.object({
      accountId: z.string().uuid().optional(),
    }),
    responses: {
      202: z.object({
        message: z.string(),
        jobId: z.string(),
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Trigger email sync',
  },

  // Get email accounts
  getAccounts: {
    method: 'GET',
    path: '/emails/accounts',
    responses: {
      200: z.object({
        data: z.array(EmailAccountSchema),
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get email accounts',
  },

  // Connect email account
  connectAccount: {
    method: 'POST',
    path: '/emails/accounts',
    body: z.object({
      provider: z.enum(['gmail', 'outlook', 'exchange']),
      authCode: z.string(),
    }),
    responses: {
      201: EmailAccountSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Connect an email account',
  },

  // Disconnect email account
  disconnectAccount: {
    method: 'DELETE',
    path: '/emails/accounts/:accountId',
    pathParams: z.object({
      accountId: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Disconnect an email account',
  },
});
