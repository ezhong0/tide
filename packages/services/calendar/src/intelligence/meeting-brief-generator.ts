import { logger } from '@tide/logger';
import { createSupabase, getDefaultEventIntelligence } from '@tide/database';
import { serviceUrls } from '@tide/config';
import type { UserId, Event as DBEvent, EventIntelligence, ContactIntelligence } from '@tide/types';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface AttendeeInsight {
  email: string;
  name?: string;
  relationshipStrength: number;
  lastInteraction?: Date;
  vipStatus: boolean;
  topics: string[];
  sentiment: string;
  recentInteractions: number;
}

export interface RelevantEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: Date;
  relevanceScore: number;
}

export interface PreviousMeeting {
  id: string;
  title: string;
  date: Date;
  attendees: string[];
  keyPoints: string[];
  actionItems: ActionItem[];
  decisionsMAde: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
}

export interface RelatedTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
}

export interface MeetingBrief {
  id?: string;
  eventId: string;
  userId: UserId;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  attendeeInsights: AttendeeInsight[];
  relevantEmails: RelevantEmail[];
  previousMeetings: PreviousMeeting[];
  relatedTasks: RelatedTask[];
  keyDiscussionPoints: string[];
  backgroundContext: string;
  preparationChecklist: string[];
  suggestedTimeAllocation: TimeAllocation[];
  confidence: number;
  generatedAt: Date;
}

export interface TimeAllocation {
  topic: string;
  minutes: number;
  reasoning: string;
}

/**
 * Meeting Brief Generator
 * Auto-generates comprehensive pre-meeting briefs with context and preparation guidance
 */
export class MeetingBriefGenerator {
  private db = createSupabase(true);
  private aiServiceURL = serviceUrls.ai;
  private emailServiceURL = serviceUrls.email;
  private workflowServiceURL = serviceUrls.workflow;

  /**
   * Generate comprehensive meeting brief
   */
  async generateBrief(
    event: CalendarEvent,
    userId: UserId
  ): Promise<MeetingBrief> {
    logger.info({ eventId: event.id, userId }, 'Generating meeting brief');

    const startTime = Date.now();

    // Gather all data in parallel for speed with graceful degradation
    const results = await Promise.allSettled([
      this.getAttendeeInsights(event.attendees, userId),
      this.findRelevantEmails(event, userId),
      this.findPreviousMeetings(event.attendees, userId),
      this.findRelatedTasks(event, userId),
      this.generateBackgroundContext(event, userId)
    ]);

    const attendeeInsights = results[0].status === 'fulfilled' ? results[0].value : [];
    const relevantEmails = results[1].status === 'fulfilled' ? results[1].value : [];
    const previousMeetings = results[2].status === 'fulfilled' ? results[2].value : [];
    const relatedTasks = results[3].status === 'fulfilled' ? results[3].value : [];
    const backgroundContext = results[4].status === 'fulfilled' ? results[4].value : 'No additional context available.';

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const sources = ['attendee insights', 'relevant emails', 'previous meetings', 'related tasks', 'background context'];
        logger.warn({ error: result.reason, source: sources[index], eventId: event.id }, 'Failed to gather meeting data');
      }
    });

    // Generate discussion points and preparation
    const keyDiscussionPoints = await this.generateDiscussionPoints(
      event,
      relevantEmails,
      previousMeetings,
      relatedTasks
    );

    const preparationChecklist = await this.generatePreparationChecklist(
      event,
      attendeeInsights,
      relatedTasks
    );

    const suggestedTimeAllocation = await this.suggestTimeAllocation(
      event,
      keyDiscussionPoints
    );

    const duration = Date.now() - startTime;
    logger.info({ eventId: event.id, duration }, 'Meeting brief generated');

    const brief: MeetingBrief = {
      eventId: event.id,
      userId,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: event.attendees,
      attendeeInsights,
      relevantEmails,
      previousMeetings,
      relatedTasks,
      keyDiscussionPoints,
      backgroundContext,
      preparationChecklist,
      suggestedTimeAllocation,
      confidence: this.calculateConfidence(
        attendeeInsights,
        relevantEmails,
        previousMeetings,
        relatedTasks
      ),
      generatedAt: new Date()
    };

    // Save to database
    await this.saveBrief(brief);

    return brief;
  }

  /**
   * Get relationship insights for all attendees
   */
  private async getAttendeeInsights(
    attendees: string[],
    userId: UserId
  ): Promise<AttendeeInsight[]> {
    const insights: AttendeeInsight[] = [];

    for (const email of attendees) {
      if (email === userId) continue; // Skip self

      const { data } = await this.db
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('email', email)
        .single();

      if (data) {
        const intelligence = data.intelligence as ContactIntelligence;
        insights.push({
          email: data.email,
          name: data.name,
          relationshipStrength: intelligence.strength,
          lastInteraction: intelligence.last_interaction_at ? new Date(intelligence.last_interaction_at) : undefined,
          vipStatus: intelligence.vip,
          topics: intelligence.topics || [],
          sentiment: intelligence.sentiment,
          recentInteractions: intelligence.stats.emails_sent + intelligence.stats.emails_received
        });
      } else {
        // No relationship data - new contact
        insights.push({
          email,
          relationshipStrength: 0.3,
          vipStatus: false,
          topics: [],
          sentiment: 'neutral',
          recentInteractions: 0
        });
      }
    }

    return insights;
  }

  /**
   * Find relevant email threads
   */
  private async findRelevantEmails(
    event: CalendarEvent,
    userId: UserId
  ): Promise<RelevantEmail[]> {
    try {
      const response = await fetch(`${this.emailServiceURL}/emails/relevant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          attendees: event.attendees,
          keywords: this.extractKeywords(event.title + ' ' + (event.description || '')),
          lookback_days: 30
        })
      });

      if (!response.ok) {
        throw new Error('Email service unavailable');
      }

      const result = (await response.json()) as { emails?: any[] };
      return result.emails || [];
    } catch (error) {
      logger.warn({ error }, 'Failed to fetch relevant emails');
      return [];
    }
  }

  /**
   * Find previous meetings with same attendees
   */
  private async findPreviousMeetings(
    attendees: string[],
    userId: UserId
  ): Promise<PreviousMeeting[]> {
    // Query past events with notes or previous meeting data in intelligence
    const { data } = await this.db
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .lt('start_time', new Date().toISOString())
      .order('start_time', { ascending: false })
      .limit(20); // Get more to filter

    if (!data) return [];

    // Filter meetings with overlapping attendees and valid intelligence data
    const relevantMeetings = data
      .filter(event => {
        const eventAttendees = (event.attendees as any[]).map(a => a.email);
        const overlap = attendees.filter(a => eventAttendees.includes(a));
        return overlap.length >= Math.min(2, attendees.length / 2);
      })
      .slice(0, 5) // Take top 5
      .map(event => {
        const intelligence = event.intelligence as EventIntelligence;
        const eventAttendees = (event.attendees as any[]).map((a: any) => a.email);

        return {
          id: event.id,
          title: event.title,
          date: new Date(event.start_time),
          attendees: eventAttendees,
          keyPoints: intelligence.notes ? [intelligence.notes] : [],
          actionItems: [], // Would need to be tracked separately or in notes
          decisionsMAde: []
        };
      });

    return relevantMeetings;
  }

  /**
   * Find related tasks
   */
  private async findRelatedTasks(
    event: CalendarEvent,
    userId: UserId
  ): Promise<RelatedTask[]> {
    try {
      const response = await fetch(`${this.workflowServiceURL}/tasks/related`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          keywords: this.extractKeywords(event.title + ' ' + (event.description || '')),
          status: ['pending', 'in_progress']
        })
      });

      if (!response.ok) {
        throw new Error('Workflow service unavailable');
      }

      const result = (await response.json()) as { tasks?: any[] };
      return result.tasks || [];
    } catch (error) {
      logger.warn({ error }, 'Failed to fetch related tasks');
      return [];
    }
  }

  /**
   * Generate background context using AI
   */
  private async generateBackgroundContext(
    event: CalendarEvent,
    userId: UserId
  ): Promise<string> {
    const prompt = `Generate background context for this meeting:

Title: ${event.title}
Description: ${event.description || 'N/A'}
Duration: ${this.getDurationMinutes(event.startTime, event.endTime)} minutes
Attendees: ${event.attendees.length} people

Provide a brief 2-3 sentence background context for this meeting.`;

    try {
      const response = await fetch(`${this.aiServiceURL}/generate/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = (await response.json()) as { context?: string };
      return result.context || 'No additional context available.';
    } catch (error) {
      logger.warn({ error }, 'Failed to generate background context');
      return event.description || 'No additional context available.';
    }
  }

  /**
   * Generate key discussion points
   */
  private async generateDiscussionPoints(
    event: CalendarEvent,
    emails: RelevantEmail[],
    previousMeetings: PreviousMeeting[],
    tasks: RelatedTask[]
  ): Promise<string[]> {
    const points: string[] = [];

    // From previous meeting action items
    previousMeetings.forEach(meeting => {
      const pendingActions = meeting.actionItems.filter(a => a.status !== 'completed');
      if (pendingActions.length > 0) {
        points.push(`Follow up on ${pendingActions.length} pending action items from ${meeting.title}`);
      }
    });

    // From relevant emails
    if (emails.length > 0) {
      const topEmails = emails.slice(0, 3);
      topEmails.forEach(email => {
        points.push(`Discuss: ${email.subject}`);
      });
    }

    // From related tasks
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical');
    if (highPriorityTasks.length > 0) {
      points.push(`Review ${highPriorityTasks.length} high-priority tasks`);
    }

    // From event description
    if (event.description) {
      const keywords = this.extractKeywords(event.description);
      if (keywords.length > 0) {
        points.push(`Key topics: ${keywords.slice(0, 3).join(', ')}`);
      }
    }

    // Default if no points
    if (points.length === 0) {
      points.push('Review meeting agenda');
      points.push('Discuss next steps');
    }

    return points.slice(0, 5); // Max 5 points
  }

  /**
   * Generate preparation checklist
   */
  private async generatePreparationChecklist(
    event: CalendarEvent,
    attendeeInsights: AttendeeInsight[],
    tasks: RelatedTask[]
  ): Promise<string[]> {
    const checklist: string[] = [];

    // Review attendee backgrounds
    const vipAttendees = attendeeInsights.filter(a => a.vipStatus);
    if (vipAttendees.length > 0) {
      checklist.push(`Review background on ${vipAttendees.length} VIP attendee(s)`);
    }

    // Review related tasks
    if (tasks.length > 0) {
      checklist.push(`Review ${tasks.length} related tasks`);
    }

    // Standard prep items
    checklist.push('Prepare agenda outline');

    if (event.description && event.description.length > 50) {
      checklist.push('Review meeting description and objectives');
    }

    const duration = this.getDurationMinutes(event.startTime, event.endTime);
    if (duration >= 60) {
      checklist.push('Prepare presentation materials if needed');
    }

    checklist.push('Test video/audio connection 5 minutes before');

    return checklist;
  }

  /**
   * Suggest time allocation for meeting topics
   */
  private async suggestTimeAllocation(
    event: CalendarEvent,
    discussionPoints: string[]
  ): Promise<TimeAllocation[]> {
    const duration = this.getDurationMinutes(event.startTime, event.endTime);
    const allocations: TimeAllocation[] = [];

    // Reserve time for intro and wrap-up
    const introTime = 5;
    const wrapUpTime = 5;
    const availableTime = duration - introTime - wrapUpTime;

    allocations.push({
      topic: 'Introduction & Agenda Review',
      minutes: introTime,
      reasoning: 'Set context and align on objectives'
    });

    // Divide remaining time among discussion points
    const timePerPoint = Math.floor(availableTime / discussionPoints.length);

    discussionPoints.forEach((point, index) => {
      allocations.push({
        topic: point,
        minutes: timePerPoint,
        reasoning: `Key discussion item ${index + 1}`
      });
    });

    allocations.push({
      topic: 'Next Steps & Wrap-up',
      minutes: wrapUpTime,
      reasoning: 'Summarize action items and next meeting'
    });

    return allocations;
  }

  /**
   * Calculate brief confidence score
   */
  private calculateConfidence(
    attendeeInsights: AttendeeInsight[],
    emails: RelevantEmail[],
    previousMeetings: PreviousMeeting[],
    tasks: RelatedTask[]
  ): number {
    let confidence = 0.5; // Base

    // Boost for attendee insights
    if (attendeeInsights.length > 0) {
      const avgStrength = attendeeInsights.reduce((sum, a) => sum + a.relationshipStrength, 0) / attendeeInsights.length;
      confidence += avgStrength * 0.2;
    }

    // Boost for relevant context
    if (emails.length > 0) confidence += 0.15;
    if (previousMeetings.length > 0) confidence += 0.15;
    if (tasks.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Save brief to database - stores in events.intelligence.brief
   */
  private async saveBrief(brief: MeetingBrief): Promise<void> {
    // Get the current event to preserve other intelligence data
    const { data: event } = await this.db
      .from('events')
      .select('intelligence')
      .eq('id', brief.eventId)
      .eq('user_id', brief.userId)
      .single();

    // Build the brief data for intelligence field
    const briefData = {
      summary: brief.backgroundContext,
      key_discussion_points: brief.keyDiscussionPoints,
      preparation_checklist: brief.preparationChecklist,
      attendee_insights: brief.attendeeInsights.map(a => ({
        email: a.email,
        relationship_strength: a.relationshipStrength,
        recent_interactions: [a.sentiment] // Simplified
      }))
    };

    // Merge with existing intelligence or create new
    const existingIntelligence = event?.intelligence as EventIntelligence || getDefaultEventIntelligence();
    const updatedIntelligence: EventIntelligence = {
      ...existingIntelligence,
      brief: briefData,
      related_emails: brief.relevantEmails.map(e => e.id),
      previous_meetings: brief.previousMeetings.map(m => ({
        date: m.date.toISOString(),
        notes: m.keyPoints.join(', '),
        action_items: m.actionItems.map(a => a.description)
      }))
    };

    // Update the event with the new intelligence
    await this.db
      .from('events')
      .update({ intelligence: updatedIntelligence })
      .eq('id', brief.eventId)
      .eq('user_id', brief.userId);
  }

  /**
   * Get existing brief - retrieves from events.intelligence.brief
   */
  async getBrief(eventId: string, userId: UserId): Promise<MeetingBrief | null> {
    const { data } = await this.db
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();

    if (!data || !data.intelligence) return null;

    const intelligence = data.intelligence as EventIntelligence;
    const brief = intelligence.brief;

    if (!brief) return null;

    // Reconstruct the MeetingBrief from the intelligence data
    return {
      eventId: data.id,
      userId: data.user_id,
      title: data.title,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      attendees: (data.attendees as any[]).map(a => a.email),
      attendeeInsights: brief.attendee_insights.map((a: any) => ({
        email: a.email,
        relationshipStrength: a.relationship_strength,
        vipStatus: false,
        topics: [],
        sentiment: a.recent_interactions[0] || 'neutral',
        recentInteractions: 0
      })),
      relevantEmails: intelligence.related_emails.map(id => ({
        id,
        from: '',
        subject: '',
        snippet: '',
        receivedAt: new Date(),
        relevanceScore: 0
      })),
      previousMeetings: intelligence.previous_meetings.map((m: any) => ({
        id: '',
        title: '',
        date: new Date(m.date),
        attendees: [],
        keyPoints: [m.notes],
        actionItems: m.action_items.map((a: string) => ({
          id: '',
          description: a,
          status: 'pending' as const
        })),
        decisionsMAde: []
      })),
      relatedTasks: [],
      keyDiscussionPoints: brief.key_discussion_points,
      backgroundContext: brief.summary,
      preparationChecklist: brief.preparation_checklist,
      suggestedTimeAllocation: [],
      confidence: 0.8,
      generatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    return words
      .filter(w => w.length > 3 && !stopWords.includes(w))
      .slice(0, 10);
  }

  /**
   * Get meeting duration in minutes
   */
  private getDurationMinutes(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }
}
