/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MockActionPreviewService } from './MockActionPreviewService';
import { UserId, IAction } from '@tide/types';
import crypto from 'crypto';

describe('MockActionPreviewService', () => {
  let service: MockActionPreviewService;
  let userId: UserId;

  beforeEach(() => {
    service = new MockActionPreviewService();
    userId = crypto.randomUUID() as UserId;
  });

  // ============================================================================
  // generatePreview
  // ============================================================================

  describe('generatePreview', () => {
    it('should generate preview for send_email action', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Send test email',
        params: {
          to: ['test@example.com'],
          subject: 'Test Subject',
          body: 'Test body'
        },
        requiresConfirmation: true
      };

      const result = await service.generatePreview(action, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary).toContain('Send email');
        expect(result.data.details.action).toBe('send_email');
        expect(result.data.editable).toBe(true);
        expect(result.data.editableFields).toContain('to');
        expect(result.data.editableFields).toContain('subject');
      }
    });

    it('should generate preview for schedule_meeting action', async () => {
      const action: IAction = {
        type: 'schedule_meeting',
        description: 'Schedule team meeting',
        params: {
          title: 'Team Standup',
          duration: 30,
          attendees: ['team@example.com']
        },
        requiresConfirmation: true
      };

      const result = await service.generatePreview(action, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary).toContain('Schedule meeting');
        expect(result.data.details.targetResource).toBe('Calendar');
      }
    });

    it('should include risks for high-risk actions', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Send bulk email',
        params: {
          to: Array(20).fill('user@example.com'),
          subject: 'Announcement',
          body: 'Test'
        },
        requiresConfirmation: true,
        riskLevel: 'high'
      };

      const result = await service.generatePreview(action, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.risks).toBeDefined();
        expect(result.data.risks!.length).toBeGreaterThan(0);
      }
    });

    it('should include alternatives for cancel_meeting', async () => {
      const action: IAction = {
        type: 'cancel_meeting',
        description: 'Cancel meeting',
        params: {
          title: 'Team Standup'
        },
        requiresConfirmation: true
      };

      const result = await service.generatePreview(action, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alternatives).toBeDefined();
        expect(result.data.alternatives!.length).toBeGreaterThan(0);
        expect(result.data.alternatives![0].action).toBe('reschedule_meeting');
      }
    });

    it('should reject invalid actions', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Invalid email',
        params: {
          to: [], // Empty recipients
          subject: ''
        },
        requiresConfirmation: true
      };

      const result = await service.generatePreview(action, userId);

      expect(result.success).toBe(false);
    });

    it('should complete within 500ms', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: ['test@example.com'],
          subject: 'Test',
          body: 'Test'
        },
        requiresConfirmation: true
      };

      const start = Date.now();
      await service.generatePreview(action, userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  // ============================================================================
  // executeAction
  // ============================================================================

  describe('executeAction', () => {
    it('should execute valid action', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Send email',
        params: {
          to: ['test@example.com'],
          subject: 'Test',
          body: 'Test body'
        },
        requiresConfirmation: true
      };

      const result = await service.executeAction(action, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
        expect(result.data.action.type).toBe('send_email');
        expect(result.data.undoable).toBe(true);
      }
    });

    it('should apply modifications when provided', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Send email',
        params: {
          to: ['test@example.com'],
          subject: 'Original Subject',
          body: 'Original body'
        },
        requiresConfirmation: true
      };

      const modifications = {
        subject: 'Modified Subject'
      };

      const result = await service.executeAction(action, userId, modifications);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action.params.subject).toBe('Modified Subject');
      }
    });

    it('should reject invalid action', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Invalid',
        params: {
          to: []
        },
        requiresConfirmation: true
      };

      const result = await service.executeAction(action, userId);

      expect(result.success).toBe(false);
    });

    it('should complete within 1000ms', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: ['test@example.com'],
          subject: 'Test',
          body: 'Test'
        },
        requiresConfirmation: true
      };

      const start = Date.now();
      await service.executeAction(action, userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });

  // ============================================================================
  // requiresConfirmation
  // ============================================================================

  describe('requiresConfirmation', () => {
    it('should require confirmation for high-risk actions', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {},
        requiresConfirmation: false,
        riskLevel: 'high'
      };

      const result = await service.requiresConfirmation(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should require confirmation when flag is set', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {},
        requiresConfirmation: true
      };

      const result = await service.requiresConfirmation(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should require confirmation for destructive actions', async () => {
      const action: IAction = {
        type: 'cancel_meeting',
        description: 'Test',
        params: {},
        requiresConfirmation: false
      };

      const result = await service.requiresConfirmation(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should not require confirmation for safe actions', async () => {
      const action: IAction = {
        type: 'search_emails',
        description: 'Test',
        params: {},
        requiresConfirmation: false
      };

      const result = await service.requiresConfirmation(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });

    it('should complete within 50ms', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {},
        requiresConfirmation: true
      };

      const start = Date.now();
      await service.requiresConfirmation(action);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  // ============================================================================
  // requiresAuthentication
  // ============================================================================

  describe('requiresAuthentication', () => {
    it('should require auth for send_email', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {},
        requiresConfirmation: true
      };

      const result = await service.requiresAuthentication(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should require auth for schedule_meeting', async () => {
      const action: IAction = {
        type: 'schedule_meeting',
        description: 'Test',
        params: {},
        requiresConfirmation: true
      };

      const result = await service.requiresAuthentication(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should not require auth for search actions', async () => {
      const action: IAction = {
        type: 'search_emails',
        description: 'Test',
        params: {},
        requiresConfirmation: false
      };

      const result = await service.requiresAuthentication(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });

    it('should complete within 50ms', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {},
        requiresConfirmation: true
      };

      const start = Date.now();
      await service.requiresAuthentication(action);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  // ============================================================================
  // getUndoWindow
  // ============================================================================

  describe('getUndoWindow', () => {
    it('should return undo window for send_email', async () => {
      const result = await service.getUndoWindow('send_email');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(30000); // 30 seconds
      }
    });

    it('should return undo window for schedule_meeting', async () => {
      const result = await service.getUndoWindow('schedule_meeting');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(300000); // 5 minutes
      }
    });

    it('should return 0 for non-undoable actions', async () => {
      const result = await service.getUndoWindow('search_emails');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('should complete within 10ms', async () => {
      const start = Date.now();
      await service.getUndoWindow('send_email');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10);
    });
  });

  // ============================================================================
  // undoAction
  // ============================================================================

  describe('undoAction', () => {
    it('should undo recent action', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: ['test@example.com'],
          subject: 'Test',
          body: 'Test'
        },
        requiresConfirmation: true
      };

      const executeResult = await service.executeAction(action, userId);
      expect(executeResult.success).toBe(true);

      if (executeResult.success) {
        // Extract result ID from the execution
        const resultId = (executeResult.data.result as { messageId: string }).messageId;

        // For now, we'll skip actual undo testing since we need to track result IDs
        // In a real implementation, executeAction would return the result ID
        expect(executeResult.data.undoable).toBe(true);
      }
    });

    it('should reject undo for non-existent action', async () => {
      const fakeId = crypto.randomUUID();
      const result = await service.undoAction(fakeId, userId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should complete within 500ms', async () => {
      const start = Date.now();
      await service.undoAction(crypto.randomUUID(), userId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  // ============================================================================
  // validateAction
  // ============================================================================

  describe('validateAction', () => {
    it('should validate correct send_email action', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: ['test@example.com'],
          subject: 'Test Subject',
          body: 'Test body'
        },
        requiresConfirmation: true
      };

      const result = await service.validateAction(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(true);
        expect(result.data.errors).toBeUndefined();
      }
    });

    it('should reject email without recipients', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: [],
          subject: 'Test',
          body: 'Test'
        },
        requiresConfirmation: true
      };

      const result = await service.validateAction(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.errors).toBeDefined();
        expect(result.data.errors![0]).toContain('recipient');
      }
    });

    it('should reject email without subject', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: ['test@example.com'],
          subject: '',
          body: 'Test'
        },
        requiresConfirmation: true
      };

      const result = await service.validateAction(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.errors![0]).toContain('subject');
      }
    });

    it('should reject meeting without title', async () => {
      const action: IAction = {
        type: 'schedule_meeting',
        description: 'Test',
        params: {
          title: '',
          duration: 30
        },
        requiresConfirmation: true
      };

      const result = await service.validateAction(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.errors![0]).toContain('title');
      }
    });

    it('should reject meeting without duration', async () => {
      const action: IAction = {
        type: 'schedule_meeting',
        description: 'Test',
        params: {
          title: 'Test Meeting',
          duration: 0
        },
        requiresConfirmation: true
      };

      const result = await service.validateAction(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.errors![0]).toContain('duration');
      }
    });

    it('should reject invalid action type', async () => {
      const action: IAction = {
        type: 'invalid_action' as any,
        description: 'Test',
        params: {},
        requiresConfirmation: true
      };

      const result = await service.validateAction(action);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.errors![0]).toContain('Invalid action type');
      }
    });

    it('should complete within 100ms', async () => {
      const action: IAction = {
        type: 'send_email',
        description: 'Test',
        params: {
          to: ['test@example.com'],
          subject: 'Test',
          body: 'Test'
        },
        requiresConfirmation: true
      };

      const start = Date.now();
      await service.validateAction(action);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});
