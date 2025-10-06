/**
 * Email Service Contract
 * Handles all email operations including sending, receiving, searching, and monitoring
 *
 * Performance Requirements:
 * - Send email: <500ms
 * - Search emails: <100ms cached, <500ms uncached
 * - Monitor thread: <50ms setup
 */

import { Result, Email, EmailId, ThreadId, UserId } from '@tide/types';
import {
  EmailDomain, EmailQuery, SendEmailParams, DraftEmailParams,
  DraftContext, DraftSuggestion, EmailResponse, EmailAction,
  EmailTemplate, EmailAnalytics, EmailSyncStatus
} from '@tide/types';

export interface IEmailService {
  /**
   * Send an email through the user's configured provider
   * @param params Email parameters including recipients, subject, and body
   * @returns EmailId if successful, error if failed
   * @performance <500ms including provider API call
   */
  sendEmail(params: SendEmailParams): Promise<Result<EmailId>>;

  /**
   * Schedule an email to be sent at a specific time
   * @param params Email parameters
   * @param scheduledFor Timestamp when email should be sent
   * @returns EmailId of the scheduled email
   */
  scheduleEmail(params: SendEmailParams, scheduledFor: number): Promise<Result<EmailId>>;

  /**
   * Create an email draft
   * @param params Draft email parameters
   * @returns EmailId of the created draft
   * @performance <100ms
   */
  createDraft(params: DraftEmailParams): Promise<Result<EmailId>>;

  /**
   * Update an existing email draft
   * @param emailId ID of the draft to update
   * @param updates Partial draft parameters to update
   * @returns Updated email domain object
   */
  updateDraft(emailId: EmailId, updates: Partial<DraftEmailParams>): Promise<Result<EmailDomain>>;

  /**
   * Search emails with semantic understanding
   * @param query Natural language or structured query
   * @returns Array of matching emails
   * @performance <100ms cached, <500ms uncached
   */
  searchEmails(query: EmailQuery): Promise<Result<EmailDomain[]>>;

  /**
   * Get a specific email by ID
   * @param emailId Email identifier
   * @returns Email domain object
   * @performance <50ms cached, <200ms uncached
   */
  getEmail(emailId: EmailId): Promise<Result<EmailDomain>>;

  /**
   * Get all emails in a thread
   * @param threadId Thread identifier
   * @returns Array of emails in chronological order
   * @performance <100ms cached, <300ms uncached
   */
  getThread(threadId: ThreadId): Promise<Result<EmailDomain[]>>;

  /**
   * Monitor a thread for new responses
   * @param threadId Thread to monitor
   * @param callback Function called when response detected
   * @returns Unsubscribe function
   * @performance <50ms setup, real-time notifications
   */
  monitorThread(
    threadId: ThreadId,
    callback: (response: EmailResponse) => void
  ): Promise<Result<() => void>>;

  /**
   * Get AI-powered draft suggestions based on context
   * @param context Draft context including recipient and purpose
   * @returns Array of draft suggestions with different tones
   * @performance <1000ms for AI generation
   */
  getDraftSuggestions(context: DraftContext): Promise<Result<DraftSuggestion[]>>;

  /**
   * Mark email as read
   * @param emailId Email to mark as read
   * @returns Success status
   * @performance <100ms
   */
  markAsRead(emailId: EmailId): Promise<Result<void>>;

  /**
   * Mark email as unread
   * @param emailId Email to mark as unread
   * @returns Success status
   * @performance <100ms
   */
  markAsUnread(emailId: EmailId): Promise<Result<void>>;

  /**
   * Star/flag an email for importance
   * @param emailId Email to star
   * @returns Success status
   * @performance <100ms
   */
  starEmail(emailId: EmailId): Promise<Result<void>>;

  /**
   * Remove star/flag from an email
   * @param emailId Email to unstar
   * @returns Success status
   * @performance <100ms
   */
  unstarEmail(emailId: EmailId): Promise<Result<void>>;

  /**
   * Archive an email
   * @param emailId Email to archive
   * @returns Success status
   * @performance <100ms
   */
  archiveEmail(emailId: EmailId): Promise<Result<void>>;

  /**
   * Delete an email
   * @param emailId Email to delete
   * @param permanent Whether to permanently delete or move to trash
   * @returns Success status
   * @performance <100ms
   */
  deleteEmail(emailId: EmailId, permanent?: boolean): Promise<Result<void>>;

  /**
   * Apply labels to an email
   * @param emailId Email to label
   * @param labels Array of label names to apply
   * @returns Success status
   * @performance <100ms
   */
  labelEmail(emailId: EmailId, labels: string[]): Promise<Result<void>>;

  /**
   * Get suggested actions for an email using AI
   * @param emailId Email to analyze
   * @returns Array of suggested actions with confidence scores
   * @performance <500ms
   */
  getSuggestedActions(emailId: EmailId): Promise<Result<EmailAction[]>>;

  /**
   * Create an email template
   * @param template Template definition
   * @returns Template ID
   * @performance <100ms
   */
  createTemplate(template: Omit<EmailTemplate, 'templateId' | 'createdAt'>): Promise<Result<string>>;

  /**
   * Get all templates for a user
   * @param userId User identifier
   * @returns Array of email templates
   * @performance <100ms cached
   */
  getTemplates(userId: UserId): Promise<Result<EmailTemplate[]>>;

  /**
   * Get email analytics for a time period
   * @param userId User identifier
   * @param startDate Start of analysis period
   * @param endDate End of analysis period
   * @returns Email analytics data
   * @performance <500ms
   */
  getAnalytics(
    userId: UserId,
    startDate: number,
    endDate: number
  ): Promise<Result<EmailAnalytics>>;

  /**
   * Sync emails with provider
   * @param userId User to sync emails for
   * @param fullSync Whether to perform full sync or incremental
   * @returns Sync status
   * @performance Async operation, returns immediately
   */
  syncEmails(userId: UserId, fullSync?: boolean): Promise<Result<EmailSyncStatus>>;

  /**
   * Get current sync status
   * @param userId User identifier
   * @returns Current sync status
   * @performance <50ms
   */
  getSyncStatus(userId: UserId): Promise<Result<EmailSyncStatus>>;

  /**
   * Reply to an email
   * @param emailId Email to reply to
   * @param replyParams Reply content
   * @returns EmailId of the reply
   * @performance <500ms
   */
  replyToEmail(emailId: EmailId, replyParams: DraftEmailParams): Promise<Result<EmailId>>;

  /**
   * Forward an email
   * @param emailId Email to forward
   * @param forwardParams Forward parameters
   * @returns EmailId of the forwarded email
   * @performance <500ms
   */
  forwardEmail(emailId: EmailId, forwardParams: DraftEmailParams): Promise<Result<EmailId>>;

  /**
   * Batch operations for performance
   * @param operations Array of operations to perform
   * @returns Array of results
   * @performance Optimized for bulk operations
   */
  batchOperations(operations: EmailOperation[]): Promise<Result<OperationResult[]>>;
}

// Supporting types for batch operations
export interface EmailOperation {
  type: 'markAsRead' | 'markAsUnread' | 'star' | 'unstar' | 'archive' | 'delete' | 'label';
  emailIds: EmailId[];
  params?: unknown;
}

export interface OperationResult {
  operation: EmailOperation;
  success: boolean;
  error?: string;
  affectedCount: number;
}