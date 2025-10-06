/**
 * Email-specific validation schemas
 */

import { z } from 'zod';

import {
  emailAddressArraySchema,
  optionalEmailAddressArraySchema,
  attachmentsArraySchema,
  uuidSchema,
  datetimeSchema,
  paginationSchema,
  booleanFilterSchema,
} from './common.validators.js';

// ============================================================================
// Email Content Validators
// ============================================================================

export const emailSubjectSchema = z.string().min(1).max(300);

export const emailBodySchema = z.string().min(1).max(50000);

export const emailSnippetSchema = z.string().max(500);

export const emailLabelsSchema = z.array(z.string()).max(20).optional();

// ============================================================================
// Email Request Validators
// ============================================================================

export const sendEmailSchema = z.object({
  to: emailAddressArraySchema,
  cc: optionalEmailAddressArraySchema,
  bcc: optionalEmailAddressArraySchema,
  subject: emailSubjectSchema,
  body: emailBodySchema,
  replyToThreadId: z.string().optional(),
  attachments: attachmentsArraySchema.optional(),
});

export const updateEmailSchema = z.object({
  id: uuidSchema,
  isRead: booleanFilterSchema,
  isStarred: booleanFilterSchema,
  labels: emailLabelsSchema,
});

export const searchEmailsSchema = z
  .object({
    query: z.string().max(500).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    subject: z.string().max(300).optional(),
    dateAfter: datetimeSchema.optional(),
    dateBefore: datetimeSchema.optional(),
    hasAttachment: booleanFilterSchema,
    isUnread: booleanFilterSchema,
    isStarred: booleanFilterSchema,
    labels: z.array(z.string()).max(10).optional(),
    ...paginationSchema.shape,
  })
  .refine(
    (data) => {
      if (data.dateAfter && data.dateBefore) {
        return new Date(data.dateAfter) < new Date(data.dateBefore);
      }
      return true;
    },
    {
      message: 'dateAfter must be before dateBefore',
    }
  );

// ============================================================================
// Email Sync Validators
// ============================================================================

export const emailProviderSchema = z.enum(['gmail', 'outlook']);

export const syncEmailsSchema = z.object({
  provider: emailProviderSchema,
  fullSync: z.boolean().default(false),
  since: z.string().datetime().optional(),
});
