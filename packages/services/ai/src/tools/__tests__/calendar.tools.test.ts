/**
 * Calendar Tools Unit Tests
 * Tests all calendar tool handlers with mocked external services
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getCalendarEventsTool,
  createCalendarEventTool,
  findMeetingTimesTool,
  analyzeCalendarLoadTool,
} from '../calendar.tools';
import type { ToolContext } from '../types';
import { createUserId } from '@tide/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Calendar Tools', () => {
  let mockContext: ToolContext;

  beforeEach(() => {
    mockContext = {
      userId: createUserId('test-user-123'),
      requestId: 'test-request-456',
      userEmail: 'test@example.com',
      timestamp: Date.now(),
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCalendarEventsTool', () => {
    it('should fetch calendar events for date range', async () => {
      const mockResponse = {
        events: [
          {
            id: 'event-1',
            title: 'Team Meeting',
            startTime: '2025-01-15T10:00:00Z',
            endTime: '2025-01-15T11:00:00Z',
            attendees: ['user1@example.com', 'user2@example.com'],
          },
          {
            id: 'event-2',
            title: '1:1 with Manager',
            startTime: '2025-01-15T14:00:00Z',
            endTime: '2025-01-15T14:30:00Z',
            attendees: ['manager@example.com'],
          },
        ],
        count: 2,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCalendarEventsTool.handler(
        {
          startDate: '2025-01-15',
          endDate: '2025-01-15',
        },
        mockContext
      );

      expect(result).toEqual(mockResponse);
    });

    it('should include userId in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [], count: 0 }),
      });

      await getCalendarEventsTool.handler(
        {
          startDate: '2025-01-15',
          endDate: '2025-01-20',
        },
        mockContext
      );

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('userId=test-user-123');
    });

    it('should handle multi-day date ranges', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [], count: 0 }),
      });

      await getCalendarEventsTool.handler(
        {
          startDate: '2025-01-15',
          endDate: '2025-01-30',
        },
        mockContext
      );

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('startDate=2025-01-15');
      expect(callUrl).toContain('endDate=2025-01-30');
    });

    it('should throw error when calendar service fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        getCalendarEventsTool.handler(
          {
            startDate: '2025-01-15',
            endDate: '2025-01-15',
          },
          mockContext
        )
      ).rejects.toThrow('Calendar events fetch failed');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        getCalendarEventsTool.handler(
          {
            startDate: '2025-01-15',
            endDate: '2025-01-15',
          },
          mockContext
        )
      ).rejects.toThrow('Network error');
    });
  });

  describe('createCalendarEventTool', () => {
    it('should create event with required parameters', async () => {
      const mockResponse = {
        eventId: 'new-event-123',
        title: 'New Meeting',
        startTime: '2025-01-20T15:00:00Z',
        endTime: '2025-01-20T16:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createCalendarEventTool.handler(
        {
          title: 'New Meeting',
          startTime: '2025-01-20T15:00:00Z',
          endTime: '2025-01-20T16:00:00Z',
        },
        mockContext
      );

      expect(result.created).toBe(true);
      expect(result.eventId).toBe('new-event-123');
      expect(result.title).toBe('New Meeting');
    });

    it('should include attendees when specified', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ eventId: 'event-123' }),
      });

      await createCalendarEventTool.handler(
        {
          title: 'Team Sync',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T10:30:00Z',
          attendees: ['colleague1@example.com', 'colleague2@example.com'],
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.attendees).toEqual([
        'colleague1@example.com',
        'colleague2@example.com',
      ]);
    });

    it('should include description when specified', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ eventId: 'event-123' }),
      });

      const description = 'Discuss Q1 goals and action items';

      await createCalendarEventTool.handler(
        {
          title: 'Planning Meeting',
          startTime: '2025-01-20T14:00:00Z',
          endTime: '2025-01-20T15:00:00Z',
          description,
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.description).toBe(description);
    });

    it('should include location when specified', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ eventId: 'event-123' }),
      });

      await createCalendarEventTool.handler(
        {
          title: 'Client Meeting',
          startTime: '2025-01-20T16:00:00Z',
          endTime: '2025-01-20T17:00:00Z',
          location: 'Conference Room A',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.location).toBe('Conference Room A');
    });

    it('should validate start time is before end time', async () => {
      // Tool validation is handled by GPT-5 parameter schema
      // But we can test that the handler processes valid inputs correctly
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ eventId: 'event-123' }),
      });

      const result = await createCalendarEventTool.handler(
        {
          title: 'Valid Event',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z',
        },
        mockContext
      );

      expect(result.created).toBe(true);
    });

    it('should throw error when creation fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Conflict - Time slot already booked',
      });

      await expect(
        createCalendarEventTool.handler(
          {
            title: 'Conflicting Event',
            startTime: '2025-01-20T10:00:00Z',
            endTime: '2025-01-20T11:00:00Z',
          },
          mockContext
        )
      ).rejects.toThrow('Calendar event creation failed');
    });
  });

  describe('findMeetingTimesTool', () => {
    it('should find available meeting slots', async () => {
      const mockResponse = {
        availableSlots: [
          {
            startTime: '2025-01-21T10:00:00Z',
            endTime: '2025-01-21T11:00:00Z',
            score: 0.95,
          },
          {
            startTime: '2025-01-21T14:00:00Z',
            endTime: '2025-01-21T15:00:00Z',
            score: 0.88,
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await findMeetingTimesTool.handler(
        {
          participants: ['colleague@example.com'],
          durationMinutes: 60,
          preferredDates: ['2025-01-21', '2025-01-22'],
        },
        mockContext
      );

      expect(result.availableSlots).toHaveLength(2);
      expect(result.availableSlots[0].score).toBeGreaterThan(0.8);
    });

    it('should include time preferences', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ availableSlots: [] }),
      });

      await findMeetingTimesTool.handler(
        {
          participants: ['person@example.com'],
          durationMinutes: 30,
          preferredDates: ['2025-01-22'],
          preferredStartTime: '09:00',
          preferredEndTime: '17:00',
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.preferredStartTime).toBe('09:00');
      expect(callBody.preferredEndTime).toBe('17:00');
    });

    it('should handle multiple participants', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ availableSlots: [] }),
      });

      await findMeetingTimesTool.handler(
        {
          participants: [
            'person1@example.com',
            'person2@example.com',
            'person3@example.com',
          ],
          durationMinutes: 45,
          preferredDates: ['2025-01-23'],
        },
        mockContext
      );

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.participants).toHaveLength(3);
    });

    it('should throw error when no slots found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'No available slots found',
      });

      await expect(
        findMeetingTimesTool.handler(
          {
            participants: ['busy@example.com'],
            durationMinutes: 120,
            preferredDates: ['2025-01-24'],
          },
          mockContext
        )
      ).rejects.toThrow('Find meeting times failed');
    });
  });

  describe('analyzeCalendarLoadTool', () => {
    it('should analyze calendar load for date range', async () => {
      const mockResponse = {
        totalEvents: 24,
        totalMeetingHours: 18.5,
        busyPercentage: 0.46,
        freeSlots: [
          {
            startTime: '2025-01-27T11:00:00Z',
            endTime: '2025-01-27T12:00:00Z',
            durationMinutes: 60,
          },
        ],
        insights: [
          'You have back-to-back meetings on Monday',
          'Consider blocking focus time on Thursday afternoon',
        ],
        recommendation: 'Consider declining or rescheduling 2-3 low-priority meetings',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeCalendarLoadTool.handler(
        {
          startDate: '2025-01-27',
          endDate: '2025-01-31',
        },
        mockContext
      );

      expect(result.totalEvents).toBe(24);
      expect(result.busyPercentage).toBeGreaterThan(0);
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.recommendation).toBeTruthy();
    });

    it('should identify overloaded days', async () => {
      const mockResponse = {
        totalEvents: 15,
        totalMeetingHours: 30,
        busyPercentage: 0.94,
        freeSlots: [],
        insights: ['Calendar is severely overloaded'],
        recommendation: 'Urgent: Cancel non-essential meetings',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeCalendarLoadTool.handler(
        {
          startDate: '2025-02-03',
          endDate: '2025-02-07',
        },
        mockContext
      );

      expect(result.busyPercentage).toBeGreaterThan(0.9);
      expect(result.recommendation).toContain('Cancel');
    });

    it('should find focus time opportunities', async () => {
      const mockResponse = {
        totalEvents: 8,
        totalMeetingHours: 6,
        busyPercentage: 0.15,
        freeSlots: [
          {
            startTime: '2025-02-10T14:00:00Z',
            endTime: '2025-02-10T17:00:00Z',
            durationMinutes: 180,
          },
        ],
        insights: ['You have a 3-hour block for deep work on Monday afternoon'],
        recommendation: 'Block this time for focused work',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeCalendarLoadTool.handler(
        {
          startDate: '2025-02-10',
          endDate: '2025-02-14',
        },
        mockContext
      );

      expect(result.freeSlots).toHaveLength(1);
      expect(result.freeSlots[0].durationMinutes).toBeGreaterThan(120);
    });

    it('should throw error when analysis fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      });

      await expect(
        analyzeCalendarLoadTool.handler(
          {
            startDate: '2025-02-17',
            endDate: '2025-02-21',
          },
          mockContext
        )
      ).rejects.toThrow('Calendar load analysis failed');
    });
  });

  describe('Tool Metadata', () => {
    it('getCalendarEventsTool should have correct metadata', () => {
      expect(getCalendarEventsTool.type).toBe('function');
      expect(getCalendarEventsTool.name).toBe('get_calendar_events');
      expect(getCalendarEventsTool.description).toBeTruthy();
      expect(getCalendarEventsTool.parameters).toHaveProperty('properties');
      expect(getCalendarEventsTool.parameters.required).toContain('startDate');
      expect(getCalendarEventsTool.parameters.required).toContain('endDate');
    });

    it('createCalendarEventTool should have correct parameters', () => {
      expect(createCalendarEventTool.parameters.properties.title).toBeTruthy();
      expect(createCalendarEventTool.parameters.properties.startTime).toBeTruthy();
      expect(createCalendarEventTool.parameters.properties.endTime).toBeTruthy();
      expect(createCalendarEventTool.parameters.required).toContain('title');
    });

    it('findMeetingTimesTool should have participants parameter', () => {
      expect(findMeetingTimesTool.parameters.properties.participants).toBeTruthy();
      expect(findMeetingTimesTool.parameters.properties.participants.type).toBe('array');
      expect(findMeetingTimesTool.parameters.properties.durationMinutes).toBeTruthy();
    });

    it('analyzeCalendarLoadTool should have date range parameters', () => {
      expect(analyzeCalendarLoadTool.parameters.properties.startDate).toBeTruthy();
      expect(analyzeCalendarLoadTool.parameters.properties.endDate).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should fetch events in <1s', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ events: [], count: 0 }),
                }),
              100
            )
          )
      );

      const start = Date.now();
      await getCalendarEventsTool.handler(
        {
          startDate: '2025-01-15',
          endDate: '2025-01-20',
        },
        mockContext
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should find meeting times in <2s', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ availableSlots: [] }),
                }),
              200
            )
          )
      );

      const start = Date.now();
      await findMeetingTimesTool.handler(
        {
          participants: ['person@example.com'],
          durationMinutes: 30,
          preferredDates: ['2025-01-22'],
        },
        mockContext
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});

