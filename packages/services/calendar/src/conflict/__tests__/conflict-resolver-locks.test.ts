import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConflictResolver } from '../conflict-resolver';
import { CalendarConflict, CalendarEvent } from '../../types';
import * as database from '@tide/database';

// Mock the database module
vi.mock('@tide/database', () => ({
  createLock: vi.fn(() => ({
    acquireWithRetry: vi.fn().mockResolvedValue(true),
    release: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('ConflictResolver - Distributed Locking', () => {
  let resolver: ConflictResolver;
  const userId = 'test-user-123';

  beforeEach(() => {
    resolver = new ConflictResolver(userId);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should acquire locks before resolving conflicts', async () => {
    const event1: CalendarEvent = {
      id: 'event-1',
      userId,
      providerId: 'google',
      providerEventId: 'g-event-1',
      title: 'Meeting 1',
      start: new Date('2025-10-08T10:00:00Z'),
      end: new Date('2025-10-08T11:00:00Z'),
      allDay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event2: CalendarEvent = {
      id: 'event-2',
      userId,
      providerId: 'google',
      providerEventId: 'g-event-2',
      title: 'Meeting 2',
      start: new Date('2025-10-08T10:30:00Z'),
      end: new Date('2025-10-08T11:30:00Z'),
      allDay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conflict: CalendarConflict = {
      timeSlot: {
        start: new Date('2025-10-08T10:30:00Z'),
        end: new Date('2025-10-08T11:00:00Z'),
      },
      events: [event1, event2],
      severity: 'low',
      type: 'overlap',
    };

    // Auto-resolve should attempt to acquire locks
    await resolver.autoResolve([conflict]);

    // Verify createLock was called for each event
    expect(database.createLock).toHaveBeenCalledWith(
      'calendar:event:lock:event-1',
      30000
    );
    expect(database.createLock).toHaveBeenCalledWith(
      'calendar:event:lock:event-2',
      30000
    );
  });

  it('should skip conflict if locks cannot be acquired', async () => {
    // Mock lock acquisition failure
    const mockLock = {
      acquireWithRetry: vi.fn().mockResolvedValue(false),
      release: vi.fn(),
    };
    vi.mocked(database.createLock).mockReturnValue(mockLock as any);

    const event1: CalendarEvent = {
      id: 'event-1',
      userId,
      providerId: 'google',
      providerEventId: 'g-event-1',
      title: 'Meeting 1',
      start: new Date('2025-10-08T10:00:00Z'),
      end: new Date('2025-10-08T11:00:00Z'),
      allDay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event2: CalendarEvent = {
      id: 'event-2',
      userId,
      providerId: 'google',
      providerEventId: 'g-event-2',
      title: 'Meeting 2',
      start: new Date('2025-10-08T10:30:00Z'),
      end: new Date('2025-10-08T11:30:00Z'),
      allDay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conflict: CalendarConflict = {
      timeSlot: {
        start: new Date('2025-10-08T10:30:00Z'),
        end: new Date('2025-10-08T11:00:00Z'),
      },
      events: [event1, event2],
      severity: 'medium',
      type: 'overlap',
    };

    const result = await resolver.autoResolve([conflict]);

    // Conflict should be moved to needsReview since lock couldn't be acquired
    expect(result.needsReview).toHaveLength(1);
    expect(result.resolved).toHaveLength(0);
  });

  it('should release locks even if resolution fails', async () => {
    const releaseMock = vi.fn();
    const mockLock = {
      acquireWithRetry: vi.fn().mockResolvedValue(true),
      release: releaseMock,
    };
    vi.mocked(database.createLock).mockReturnValue(mockLock as any);

    const event1: CalendarEvent = {
      id: 'event-1',
      userId,
      providerId: 'google',
      providerEventId: 'g-event-1',
      title: 'Meeting 1',
      start: new Date('2025-10-08T10:00:00Z'),
      end: new Date('2025-10-08T11:00:00Z'),
      allDay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event2: CalendarEvent = {
      id: 'event-2',
      userId,
      providerId: 'google',
      providerEventId: 'g-event-2',
      title: 'Meeting 2',
      start: new Date('2025-10-08T10:30:00Z'),
      end: new Date('2025-10-08T11:30:00Z'),
      allDay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conflict: CalendarConflict = {
      timeSlot: {
        start: new Date('2025-10-08T10:30:00Z'),
        end: new Date('2025-10-08T11:00:00Z'),
      },
      events: [event1, event2],
      severity: 'low',
      type: 'overlap',
    };

    await resolver.autoResolve([conflict]);

    // Locks should be released
    expect(releaseMock).toHaveBeenCalled();
  });
});
