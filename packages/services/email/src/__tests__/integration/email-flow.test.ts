import { describe, it, expect, beforeAll } from 'vitest';
import { EmailTriage } from '../../triage/email-triage.js';
import { SmartComposer } from '../../composer/smart-composer.js';
import { EmailAutomation } from '../../automation/email-automation.js';
import { RelationshipIntelligence } from '../../relationship/relationship-intelligence.js';
import type { Email, TriagePriority } from '../../types/index.js';
import { createUserId, createEmailId } from '@tide/types';

/**
 * Email Service Integration Tests
 *
 * Tests critical email flows:
 * - Email triage and prioritization
 * - Smart composition
 * - Email automation
 * - Relationship intelligence
 */

describe('Email Service - Critical Flows', () => {
  let triage: EmailTriage;
  let composer: SmartComposer;
  let automation: EmailAutomation;
  let relationshipIntel: RelationshipIntelligence;

  const mockUserId = createUserId('test_user_1');

  beforeAll(() => {
    triage = new EmailTriage();
    composer = new SmartComposer();
    automation = new EmailAutomation(composer, {} as any);
    relationshipIntel = new RelationshipIntelligence();
  });

  describe('Email Triage', () => {
    it('should triage urgent email correctly', async () => {
      const urgentEmail: Email = {
        id: createEmailId('urgent_1'),
        userId: mockUserId,
        messageId: 'msg_urgent_1',
        provider: 'gmail',
        subject: 'URGENT: Production outage',
        from: { email: 'ceo@company.com', name: 'CEO' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'We have a critical production issue that needs immediate attention.',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const result = await triage.triageEmail(urgentEmail, mockUserId);

      expect(result.priority).toBe('urgent' as TriagePriority);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.strategy.type).toBe('escalate');
      expect(result.tags).toContain('urgent');
    });

    it('should triage routine email correctly', async () => {
      const routineEmail: Email = {
        id: createEmailId('routine_1'),
        userId: mockUserId,
        messageId: 'msg_routine_1',
        provider: 'gmail',
        subject: 'Weekly newsletter',
        from: { email: 'newsletter@company.com', name: 'Newsletter' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'Here is your weekly digest of updates.',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const result = await triage.triageEmail(routineEmail, mockUserId);

      expect(result.priority).toBe('low' as TriagePriority);
      expect(result.score).toBeLessThan(0.4);
      expect(result.strategy.type).toBe('archive');
    });

    it('should detect meeting requests', async () => {
      const meetingEmail: Email = {
        id: createEmailId('meeting_1'),
        userId: mockUserId,
        messageId: 'msg_meeting_1',
        provider: 'gmail',
        subject: 'Meeting request: Q1 Planning',
        from: { email: 'manager@company.com', name: 'Manager' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'Can we schedule a meeting next Tuesday at 2pm to discuss Q1 planning?',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const result = await triage.triageEmail(meetingEmail, mockUserId);

      expect(result.tags).toContain('meeting');
      expect(result.actionableInsights.actions).toContainEqual(
        expect.objectContaining({ type: 'schedule_meeting' })
      );
    });

    it('should complete triage in <200ms', async () => {
      const email: Email = {
        id: createEmailId('perf_1'),
        userId: mockUserId,
        messageId: 'msg_perf_1',
        provider: 'gmail',
        subject: 'Test email',
        from: { email: 'test@example.com', name: 'Test' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'This is a test email for performance testing.',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const startTime = Date.now();
      await triage.triageEmail(email, mockUserId);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Smart Composition', () => {
    it('should generate professional reply', async () => {
      const originalEmail: Email = {
        id: createEmailId('compose_1'),
        userId: mockUserId,
        messageId: 'msg_compose_1',
        provider: 'gmail',
        subject: 'Question about project timeline',
        from: { email: 'client@company.com', name: 'Client' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'When can we expect the project to be completed?',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const context = {
        intent: 'request_info',
        tone: 'professional' as const,
        userInstructions: 'Tell them we will complete by end of month',
      };

      const draft = await composer.composeDraft(originalEmail, context, mockUserId);

      expect(draft.subject).toContain('Re: Question about project timeline');
      expect(draft.body).toBeTruthy();
      expect(draft.body.length).toBeGreaterThan(50);
      expect(draft.metadata.confidence).toBeGreaterThan(0.6);
      expect(draft.to).toEqual([{ email: 'client@company.com', name: 'Client' }]);
    });

    it('should handle decline meeting request', async () => {
      const meetingEmail: Email = {
        id: createEmailId('decline_1'),
        userId: mockUserId,
        messageId: 'msg_decline_1',
        provider: 'gmail',
        subject: 'Meeting invitation',
        from: { email: 'colleague@company.com', name: 'Colleague' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'Can we meet tomorrow at 3pm?',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const context = {
        intent: 'decline_meeting',
        tone: 'polite' as const,
        userInstructions: 'Decline politely, already booked',
      };

      const draft = await composer.composeDraft(meetingEmail, context, mockUserId);

      expect(draft.body).toContain('unfortunately');
      expect(draft.metadata.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Email Automation', () => {
    it('should auto-archive low priority emails', async () => {
      const email: Email = {
        id: createEmailId('auto_1'),
        userId: mockUserId,
        messageId: 'msg_auto_1',
        provider: 'gmail',
        subject: 'Newsletter',
        from: { email: 'news@example.com', name: 'Newsletter' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'Your weekly newsletter',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const triageResult = await triage.triageEmail(email, mockUserId);
      const actionResult = await automation.handle(email, triageResult);

      expect(actionResult.type).toBe('archive');
      expect(actionResult.confidence).toBeGreaterThan(0.8);
    });

    it('should escalate urgent emails to user', async () => {
      const urgentEmail: Email = {
        id: createEmailId('escalate_1'),
        userId: mockUserId,
        messageId: 'msg_escalate_1',
        provider: 'gmail',
        subject: 'URGENT: Server down',
        from: { email: 'ops@company.com', name: 'Operations' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'Production servers are not responding',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const triageResult = await triage.triageEmail(urgentEmail, mockUserId);
      const actionResult = await automation.handle(urgentEmail, triageResult);

      expect(actionResult.type).toBe('escalate');
      expect(actionResult.requiresUserInput).toBe(true);
    });
  });

  describe('Relationship Intelligence', () => {
    it('should analyze relationship metrics', async () => {
      const interactions: Email[] = [
        {
          id: createEmailId('rel_1'),
          userId: mockUserId,
          messageId: 'msg_rel_1',
          provider: 'gmail',
          subject: 'Project update',
          from: { email: 'partner@company.com', name: 'Partner' },
          to: [{ email: 'user@tide.test', name: 'User' }],
          body: 'Here is the latest update on our project.',
          receivedAt: new Date(Date.now() - 86400000), // 1 day ago
          status: 'read',
          isRead: true,
        },
        {
          id: createEmailId('rel_2'),
          userId: mockUserId,
          messageId: 'msg_rel_2',
          provider: 'gmail',
          subject: 'Follow up',
          from: { email: 'partner@company.com', name: 'Partner' },
          to: [{ email: 'user@tide.test', name: 'User' }],
          body: 'Following up on our discussion.',
          receivedAt: new Date(Date.now() - 172800000), // 2 days ago
          status: 'read',
          isRead: true,
        },
      ];

      const contact = {
        email: 'partner@company.com',
        name: 'Partner',
      };

      const analysis = await relationshipIntel.analyzeRelationship(
        contact,
        interactions
      );

      expect(analysis.contact.email).toBe('partner@company.com');
      expect(analysis.metrics.frequency).toBeGreaterThan(0);
      expect(analysis.metrics.recency).toBeGreaterThan(0);
      expect(analysis.relationshipStrength).toBeGreaterThan(0);
      expect(analysis.insights).toBeTruthy();
    });

    it('should generate relationship maintenance plan', async () => {
      const interactions: Email[] = [
        {
          id: createEmailId('maint_1'),
          userId: mockUserId,
          messageId: 'msg_maint_1',
          provider: 'gmail',
          subject: 'Check in',
          from: { email: 'client@company.com', name: 'Client' },
          to: [{ email: 'user@tide.test', name: 'User' }],
          body: 'Just checking in on the project.',
          receivedAt: new Date(Date.now() - 604800000 * 4), // 4 weeks ago
          status: 'read',
          isRead: true,
        },
      ];

      const contact = {
        email: 'client@company.com',
        name: 'Client',
      };

      const analysis = await relationshipIntel.analyzeRelationship(
        contact,
        interactions
      );
      const plan = await relationshipIntel.generateMaintenancePlan(analysis);

      expect(plan.frequency).toBeTruthy();
      expect(plan.nextContact).toBeInstanceOf(Date);
      expect(plan.suggestedTopics).toBeTruthy();
      expect(plan.suggestedTopics.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Success Criteria', () => {
    it('should process email pipeline end-to-end', async () => {
      const email: Email = {
        id: createEmailId('e2e_1'),
        userId: mockUserId,
        messageId: 'msg_e2e_1',
        provider: 'gmail',
        subject: 'End-to-end test',
        from: { email: 'test@example.com', name: 'Test' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'This is an end-to-end test email.',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      // Complete pipeline: triage -> automation
      const triageResult = await triage.triageEmail(email, mockUserId);
      expect(triageResult).toBeTruthy();

      const actionResult = await automation.handle(email, triageResult);
      expect(actionResult).toBeTruthy();
      expect(['archive', 'queue_for_review', 'escalate']).toContain(
        actionResult.type
      );
    });

    it('should meet performance targets', async () => {
      const email: Email = {
        id: createEmailId('perf_2'),
        userId: mockUserId,
        messageId: 'msg_perf_2',
        provider: 'gmail',
        subject: 'Performance test',
        from: { email: 'test@example.com', name: 'Test' },
        to: [{ email: 'user@tide.test', name: 'User' }],
        body: 'Performance test email body.',
        receivedAt: new Date(),
        status: 'unread',
        isRead: false,
      };

      const startTime = Date.now();

      await triage.triageEmail(email, mockUserId);

      const duration = Date.now() - startTime;

      // Email triage should complete in <200ms
      expect(duration).toBeLessThan(200);
    });
  });
});
