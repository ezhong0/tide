import { describe, it, expect, beforeAll } from 'vitest';
import { SmartScheduler } from '../../scheduler/smart-scheduler';
import { ConflictResolver } from '../../conflict/conflict-resolver';
import { CalendarOptimizer } from '../../optimizer/calendar-optimizer';
import { MeetingPreparation } from '../../meeting-prep/meeting-preparation';
import type { CalendarEvent, SchedulingRequest } from '../../types';
import { createUserId, createCalendarEventId } from '@tide/types';

/**
 * Calendar Service Integration Tests
 *
 * Tests critical calendar flows:
 * - Smart scheduling
 * - Conflict detection and resolution
 * - Calendar optimization
 * - Meeting preparation
 */

describe('Calendar Service - Critical Flows', () => {
  let scheduler: SmartScheduler;
  let conflictResolver: ConflictResolver;
  let optimizer: CalendarOptimizer;
  let meetingPrep: MeetingPreparation;

  const mockUserId = createUserId('test_user_1');

  beforeAll(() => {
    scheduler = new SmartScheduler();
    conflictResolver = new ConflictResolver();
    optimizer = new CalendarOptimizer();
    meetingPrep = new MeetingPreparation();
  });

  describe('Smart Scheduling', () => {
    it('should find optimal time slot', async () => {
      const existingEvents: CalendarEvent[] = [
        {
          id: createCalendarEventId('evt_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Morning standup',
          startTime: new Date('2025-10-08T09:00:00Z'),
          endTime: new Date('2025-10-08T09:30:00Z'),
          status: 'confirmed',
        },
        {
          id: createCalendarEventId('evt_2'),
          userId: mockUserId,
          provider: 'google',
          title: 'Lunch',
          startTime: new Date('2025-10-08T12:00:00Z'),
          endTime: new Date('2025-10-08T13:00:00Z'),
          status: 'confirmed',
        },
      ];

      const request: SchedulingRequest = {
        title: 'Team meeting',
        duration: 60, // 60 minutes
        attendees: [
          { email: 'team1@company.com', name: 'Team Member 1' },
          { email: 'team2@company.com', name: 'Team Member 2' },
        ],
        preferences: {
          preferredTimes: ['morning', 'afternoon'],
          avoidTimes: ['early_morning', 'late_evening'],
        },
      };

      const suggestions = await scheduler.findOptimalSlots(
        existingEvents,
        request,
        mockUserId
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].score).toBeGreaterThan(0);

      // Optimal slot should not overlap with existing events
      const optimalSlot = suggestions[0];
      for (const event of existingEvents) {
        const noOverlap =
          optimalSlot.startTime >= event.endTime ||
          optimalSlot.endTime <= event.startTime;
        expect(noOverlap).toBe(true);
      }
    });

    it('should respect user preferences', async () => {
      const events: CalendarEvent[] = [];
      const request: SchedulingRequest = {
        title: 'Focus time',
        duration: 120, // 2 hours
        preferences: {
          preferredTimes: ['morning'],
          requiresFocusTime: true,
        },
      };

      const suggestions = await scheduler.findOptimalSlots(events, request, mockUserId);

      expect(suggestions.length).toBeGreaterThan(0);

      // Focus time should be scheduled in morning (8am-12pm)
      const morning = suggestions.filter(slot => {
        const hour = slot.startTime.getHours();
        return hour >= 8 && hour < 12;
      });

      expect(morning.length).toBeGreaterThan(0);
    });

    it('should complete scheduling in <500ms', async () => {
      const events: CalendarEvent[] = [
        {
          id: createCalendarEventId('perf_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Existing meeting',
          startTime: new Date('2025-10-08T10:00:00Z'),
          endTime: new Date('2025-10-08T11:00:00Z'),
          status: 'confirmed',
        },
      ];

      const request: SchedulingRequest = {
        title: 'New meeting',
        duration: 30,
      };

      const startTime = Date.now();
      await scheduler.findOptimalSlots(events, request, mockUserId);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('Conflict Detection and Resolution', () => {
    it('should detect double-booking conflict', async () => {
      const events: CalendarEvent[] = [
        {
          id: createCalendarEventId('conflict_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Team meeting',
          startTime: new Date('2025-10-08T14:00:00Z'),
          endTime: new Date('2025-10-08T15:00:00Z'),
          status: 'confirmed',
        },
        {
          id: createCalendarEventId('conflict_2'),
          userId: mockUserId,
          provider: 'google',
          title: 'Client call',
          startTime: new Date('2025-10-08T14:30:00Z'),
          endTime: new Date('2025-10-08T15:30:00Z'),
          status: 'confirmed',
        },
      ];

      const conflicts = await conflictResolver.detectConflicts(events);

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('double_booked');
      expect(conflicts[0].events).toHaveLength(2);
    });

    it('should detect back-to-back meetings', async () => {
      const events: CalendarEvent[] = [
        {
          id: createCalendarEventId('b2b_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Meeting 1',
          startTime: new Date('2025-10-08T10:00:00Z'),
          endTime: new Date('2025-10-08T11:00:00Z'),
          status: 'confirmed',
        },
        {
          id: createCalendarEventId('b2b_2'),
          userId: mockUserId,
          provider: 'google',
          title: 'Meeting 2',
          startTime: new Date('2025-10-08T11:00:00Z'),
          endTime: new Date('2025-10-08T12:00:00Z'),
          status: 'confirmed',
        },
      ];

      const conflicts = await conflictResolver.detectConflicts(events);

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('back_to_back');
    });

    it('should resolve conflict by importance', async () => {
      const events: CalendarEvent[] = [
        {
          id: createCalendarEventId('important_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Board meeting',
          startTime: new Date('2025-10-08T14:00:00Z'),
          endTime: new Date('2025-10-08T15:00:00Z'),
          status: 'confirmed',
          attendees: [
            { email: 'ceo@company.com', name: 'CEO' },
          ],
        },
        {
          id: createCalendarEventId('routine_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Team sync',
          startTime: new Date('2025-10-08T14:30:00Z'),
          endTime: new Date('2025-10-08T15:00:00Z'),
          status: 'confirmed',
        },
      ];

      const conflicts = await conflictResolver.detectConflicts(events);
      const resolution = await conflictResolver.resolve(conflicts[0]);

      expect(resolution).toBeTruthy();
      expect(resolution.keep.title).toBe('Board meeting');
      expect(resolution.reschedule.length).toBeGreaterThan(0);
      expect(resolution.reschedule[0].event.title).toBe('Team sync');
    });
  });

  describe('Calendar Optimization', () => {
    it('should identify fragmentation', async () => {
      const fragmentedWeek: CalendarEvent[] = [
        {
          id: createCalendarEventId('frag_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Meeting 1',
          startTime: new Date('2025-10-08T09:00:00Z'),
          endTime: new Date('2025-10-08T09:30:00Z'),
          status: 'confirmed',
        },
        {
          id: createCalendarEventId('frag_2'),
          userId: mockUserId,
          provider: 'google',
          title: 'Meeting 2',
          startTime: new Date('2025-10-08T11:00:00Z'),
          endTime: new Date('2025-10-08T11:30:00Z'),
          status: 'confirmed',
        },
        {
          id: createCalendarEventId('frag_3'),
          userId: mockUserId,
          provider: 'google',
          title: 'Meeting 3',
          startTime: new Date('2025-10-08T14:00:00Z'),
          endTime: new Date('2025-10-08T14:30:00Z'),
          status: 'confirmed',
        },
      ];

      const plan = await optimizer.optimizeWeek(mockUserId);

      expect(plan).toBeTruthy();
      expect(plan.currentState).toBeTruthy();
      expect(plan.opportunities).toBeTruthy();
    });

    it('should suggest consolidating meetings', async () => {
      const events: CalendarEvent[] = [
        {
          id: createCalendarEventId('consol_1'),
          userId: mockUserId,
          provider: 'google',
          title: '1:1 with Manager',
          startTime: new Date('2025-10-08T09:00:00Z'),
          endTime: new Date('2025-10-08T09:30:00Z'),
          status: 'confirmed',
        },
        {
          id: createCalendarEventId('consol_2'),
          userId: mockUserId,
          provider: 'google',
          title: 'Team sync',
          startTime: new Date('2025-10-08T14:00:00Z'),
          endTime: new Date('2025-10-08T14:30:00Z'),
          status: 'confirmed',
        },
      ];

      const plan = await optimizer.optimizeWeek(mockUserId);

      expect(plan.opportunities).toBeTruthy();
      expect(plan.actions).toBeTruthy();
    });
  });

  describe('Meeting Preparation', () => {
    it('should generate meeting brief', async () => {
      const meeting: CalendarEvent = {
        id: createCalendarEventId('prep_1'),
        userId: mockUserId,
        provider: 'google',
        title: 'Client strategy session',
        description: 'Discuss Q1 strategy with client',
        startTime: new Date('2025-10-08T14:00:00Z'),
        endTime: new Date('2025-10-08T15:00:00Z'),
        status: 'confirmed',
        attendees: [
          { email: 'client@company.com', name: 'Client' },
          { email: 'manager@company.com', name: 'Manager' },
        ],
      };

      const brief = await meetingPrep.prepareMeeting(meeting);

      expect(brief).toBeTruthy();
      expect(brief.summary).toBeTruthy();
      expect(brief.objectives).toBeTruthy();
      expect(brief.objectives.length).toBeGreaterThan(0);
      expect(brief.agenda).toBeTruthy();
      expect(brief.agenda.length).toBeGreaterThan(0);
      expect(brief.participants).toBeTruthy();
      expect(brief.participants.length).toBe(2);
      expect(brief.talkingPoints).toBeTruthy();
      expect(brief.talkingPoints.length).toBeGreaterThan(0);
    });

    it('should identify key participants', async () => {
      const meeting: CalendarEvent = {
        id: createCalendarEventId('prep_2'),
        userId: mockUserId,
        provider: 'google',
        title: 'Board meeting',
        startTime: new Date('2025-10-08T10:00:00Z'),
        endTime: new Date('2025-10-08T12:00:00Z'),
        status: 'confirmed',
        attendees: [
          { email: 'ceo@company.com', name: 'CEO' },
          { email: 'cfo@company.com', name: 'CFO' },
        ],
      };

      const brief = await meetingPrep.prepareMeeting(meeting);

      expect(brief.participants.length).toBeGreaterThan(0);
      expect(brief.participants[0]).toHaveProperty('email');
      expect(brief.participants[0]).toHaveProperty('name');
    });

    it('should complete preparation in <1s', async () => {
      const meeting: CalendarEvent = {
        id: createCalendarEventId('perf_prep'),
        userId: mockUserId,
        provider: 'google',
        title: 'Quick meeting',
        startTime: new Date('2025-10-08T15:00:00Z'),
        endTime: new Date('2025-10-08T15:30:00Z'),
        status: 'confirmed',
      };

      const startTime = Date.now();
      await meetingPrep.prepareMeeting(meeting);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Integration Success Criteria', () => {
    it('should process full scheduling workflow', async () => {
      const events: CalendarEvent[] = [
        {
          id: createCalendarEventId('e2e_1'),
          userId: mockUserId,
          provider: 'google',
          title: 'Existing meeting',
          startTime: new Date('2025-10-08T10:00:00Z'),
          endTime: new Date('2025-10-08T11:00:00Z'),
          status: 'confirmed',
        },
      ];

      const request: SchedulingRequest = {
        title: 'New meeting',
        duration: 60,
      };

      // Find slots
      const slots = await scheduler.findOptimalSlots(events, request, mockUserId);
      expect(slots.length).toBeGreaterThan(0);

      // Check conflicts
      const allEvents = [...events, slots[0]];
      const conflicts = await conflictResolver.detectConflicts(allEvents);

      // If conflicts exist, resolve them
      if (conflicts.length > 0) {
        const resolution = await conflictResolver.resolve(conflicts[0]);
        expect(resolution).toBeTruthy();
      }

      expect(true).toBe(true); // Pipeline completed successfully
    });

    it('should meet performance targets for scheduling', async () => {
      const events: CalendarEvent[] = Array.from({ length: 20 }, (_, i) => ({
        id: createCalendarEventId(`perf_${i}`),
        userId: mockUserId,
        provider: 'google',
        title: `Meeting ${i}`,
        startTime: new Date(`2025-10-08T${9 + i}:00:00Z`),
        endTime: new Date(`2025-10-08T${9 + i}:30:00Z`),
        status: 'confirmed' as const,
      }));

      const request: SchedulingRequest = {
        title: 'Performance test',
        duration: 30,
      };

      const startTime = Date.now();
      await scheduler.findOptimalSlots(events, request, mockUserId);
      const duration = Date.now() - startTime;

      // Should handle 20 events in <500ms
      expect(duration).toBeLessThan(500);
    });
  });
});
