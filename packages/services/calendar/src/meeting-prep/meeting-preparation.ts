import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import type { CalendarEvent, Attendee } from '../types/index.js';

const supabase = createSupabase();

export interface ParticipantInfo {
  attendee: Attendee;
  profile?: {
    name: string;
    title?: string;
    company?: string;
    photo?: string;
  };
  interactions: {
    emailCount: number;
    meetingCount: number;
    lastContact?: Date;
  };
  importance: number; // 0-1 score
  relationshipStrength: number; // 0-1 score
  communicationStyle?: 'formal' | 'casual' | 'direct' | 'collaborative';
  topics: string[];
}

export interface TalkingPoint {
  topic: string;
  points: string[] | { concern: string; response: string; data?: any }[];
  timing: 'opening' | 'throughout' | 'as_needed' | 'closing';
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface MeetingBrief {
  meeting: CalendarEvent;
  summary: string;
  objectives: string[];
  agenda: {
    item: string;
    duration: number;
    owner?: string;
  }[];
  talkingPoints: TalkingPoint[];
  participants: ParticipantInfo[];
  backgroundInfo: {
    previousMeetings?: {
      date: Date;
      summary: string;
      outcomes: string[];
    }[];
    relatedEmails?: {
      date: Date;
      subject: string;
      summary: string;
    }[];
    companyInfo?: {
      name: string;
      size?: string;
      industry?: string;
      recentNews?: string[];
    };
  };
  suggestedQuestions: string[];
  possibleObjections: {
    objection: string;
    response: string;
  }[];
  successMetrics: string[];
  preparationTime: number; // minutes needed to prepare
}

/**
 * Meeting Preparation system that generates comprehensive briefs for meetings
 */
export class MeetingPreparation {
  private aiServiceUrl: string;

  constructor(private userId: UserId) {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3003';
  }

  /**
   * Call AI service to generate enhanced meeting brief
   */
  private async generateAIBrief(
    meeting: CalendarEvent,
    context: {
      previousMeetings: any[];
      relatedEmails: any[];
      companyInfo: any;
    }
  ): Promise<Partial<MeetingBrief>> {
    try {
      // Add timeout to prevent hanging requests (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(`${this.aiServiceUrl}/api/v1/agents/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentType: 'calendar.prep',
            input: {
              meeting: {
                title: meeting.title,
                description: meeting.description,
                start: meeting.start,
                end: meeting.end,
                attendees: meeting.attendees,
              },
              context: {
                previousMeetings: context.previousMeetings,
                relatedEmails: context.relatedEmails,
                companyInfo: context.companyInfo,
              },
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          logger.warn({ status: response.status }, 'AI service call failed, using fallback');
          return {};
        }

        const result = await response.json() as { output?: Partial<MeetingBrief> };
        return result.output || {};
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      logger.error({ error }, 'Failed to call AI service, using fallback');
      return {};
    }
  }

  /**
   * Save meeting brief to database
   */
  private async saveBriefToDatabase(
    eventId: string,
    brief: MeetingBrief
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          meeting_brief: brief as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .eq('user_id', this.userId);

      if (error) {
        logger.error({ error, eventId }, 'Failed to save meeting brief to database');
      } else {
        logger.info({ eventId }, 'Meeting brief saved to database');
      }
    } catch (error) {
      logger.error({ error, eventId }, 'Error saving meeting brief');
    }
  }

  /**
   * Prepare comprehensive brief for a meeting
   */
  async prepareMeeting(meeting: CalendarEvent): Promise<MeetingBrief> {
    logger.info(
      {
        userId: this.userId,
        meetingId: meeting.id,
        title: meeting.title,
        attendeeCount: meeting.attendees?.length || 0,
      },
      'Preparing meeting brief'
    );

    try {
      // Gather all context in parallel
      const [participants, previousMeetings, relatedEmails, companyInfo] =
        await Promise.all([
          this.gatherParticipantInfo(meeting.attendees || []),
          this.findPreviousMeetings(meeting),
          this.findRelatedEmails(meeting),
          this.gatherCompanyInfo(meeting.attendees || []),
        ]);

      // Try to get AI-generated insights
      const aiEnhanced = await this.generateAIBrief(meeting, {
        previousMeetings,
        relatedEmails,
        companyInfo,
      });

      // Generate meeting summary and objectives (use AI or fallback)
      const summary = aiEnhanced.summary || this.generateSummary(meeting);
      const objectives =
        aiEnhanced.objectives || this.deriveObjectives(meeting, previousMeetings);

      // Create suggested agenda (use AI or fallback)
      const agenda = aiEnhanced.agenda || this.createAgenda(meeting, previousMeetings);

      // Generate talking points (use AI or fallback)
      const talkingPoints =
        aiEnhanced.talkingPoints || this.generateTalkingPoints(meeting, previousMeetings);

      // Generate strategic questions (use AI or fallback)
      const suggestedQuestions =
        aiEnhanced.suggestedQuestions || this.generateQuestions(meeting, participants);

      // Anticipate objections (use AI or fallback)
      const possibleObjections =
        aiEnhanced.possibleObjections || this.anticipateObjections(meeting);

      // Define success metrics (use AI or fallback)
      const successMetrics = aiEnhanced.successMetrics || this.defineSuccess(meeting);

      // Estimate preparation time
      const preparationTime = this.estimatePreparationTime(meeting, agenda);

      const brief: MeetingBrief = {
        meeting,
        summary,
        objectives,
        agenda,
        talkingPoints,
        participants,
        backgroundInfo: {
          previousMeetings,
          relatedEmails,
          companyInfo,
        },
        suggestedQuestions,
        possibleObjections,
        successMetrics,
        preparationTime,
      };

      // Save brief to database
      await this.saveBriefToDatabase(meeting.id, brief);

      logger.info(
        {
          userId: this.userId,
          meetingId: meeting.id,
          agendaItems: agenda.length,
          participantCount: participants.length,
          aiEnhanced: !!aiEnhanced.summary,
        },
        'Meeting brief prepared'
      );

      return brief;
    } catch (error) {
      logger.error(
        { userId: this.userId, meetingId: meeting.id, error },
        'Failed to prepare meeting'
      );
      throw error;
    }
  }

  /**
   * Gather information about meeting participants
   */
  private async gatherParticipantInfo(attendees: Attendee[]): Promise<ParticipantInfo[]> {
    return Promise.all(
      attendees.map(async (attendee) => {
        // In production, would query databases for this info
        const profile = {
          name: attendee.name || attendee.email,
          title: 'Unknown',
          company: 'Unknown',
        };

        // Only use mock data in development
        const interactions = process.env.NODE_ENV === 'development'
          ? {
              emailCount: Math.floor(Math.random() * 50), // Mock data
              meetingCount: Math.floor(Math.random() * 20),
              lastContact: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            }
          : {
              emailCount: 0,
              meetingCount: 0,
              lastContact: undefined,
            };

        const importance = process.env.NODE_ENV === 'development' ? Math.random() : 0.5;
        const relationshipStrength = process.env.NODE_ENV === 'development' ? Math.random() : 0.5;
        const communicationStyle: 'formal' | 'casual' | 'direct' | 'collaborative' =
          process.env.NODE_ENV === 'development'
            ? (['formal', 'casual', 'direct', 'collaborative'][
                Math.floor(Math.random() * 4)
              ] as any)
            : 'professional' as any;

        const topics = process.env.NODE_ENV === 'development'
          ? ['project', 'budget', 'timeline', 'strategy']
          : [];

        return {
          attendee,
          profile,
          interactions,
          importance,
          relationshipStrength,
          communicationStyle,
          topics,
        };
      })
    );
  }

  /**
   * Find previous meetings with same participants
   */
  private async findPreviousMeetings(
    meeting: CalendarEvent
  ): Promise<{ date: Date; summary: string; outcomes: string[] }[]> {
    try {
      // Get current meeting attendees
      const currentAttendees = meeting.attendees?.map((a) => a.email) || [];

      if (currentAttendees.length === 0) {
        return [];
      }

      // Query past meetings with same attendees (in the last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: pastEvents, error } = await supabase
        .from('calendar_events')
        .select('title, start_time, description, attendees, meeting_brief')
        .eq('user_id', this.userId)
        .lt('end_time', new Date().toISOString())
        .gte('start_time', ninetyDaysAgo.toISOString())
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) {
        logger.error({ error, userId: this.userId }, 'Failed to fetch previous meetings');
        return [];
      }

      // Filter to meetings with overlapping attendees
      const relevantMeetings =
        pastEvents?.filter((event: any) => {
          const eventAttendees = (event.attendees as Array<{ email: string }>)?.map((a) => a.email) || [];
          const overlap = currentAttendees.filter((email) => eventAttendees.includes(email));
          return overlap.length >= Math.min(2, currentAttendees.length * 0.5);
        }) || [];

      return relevantMeetings.slice(0, 5).map((event: any) => ({
        date: new Date(event.start_time),
        summary: event.title,
        outcomes: event.meeting_brief
          ? [(event.meeting_brief as { summary?: string }).summary || 'No summary available']
          : [],
      }));
    } catch (error) {
      logger.error({ error, userId: this.userId }, 'Error finding previous meetings');
      return [];
    }
  }

  /**
   * Find related emails
   */
  private async findRelatedEmails(
    meeting: CalendarEvent
  ): Promise<{ date: Date; subject: string; summary: string }[]> {
    try {
      // Extract attendee emails
      const attendeeEmails = meeting.attendees?.map((a) => a.email) || [];

      if (attendeeEmails.length === 0) {
        return [];
      }

      // Query emails from/to attendees or with matching subject keywords
      // Escape special SQL ILIKE characters to prevent injection
      const escapeSqlLike = (str: string): string => {
        return str.replace(/[%_]/g, '\\$&');
      };

      const safeTitle = escapeSqlLike(meeting.title.substring(0, 20));

      const { data: emails, error } = await supabase
        .from('email_messages')
        .select('subject, received_at, ai_summary, from_address')
        .eq('user_id', this.userId)
        .or(
          `from_address.in.(${attendeeEmails.join(',')}),subject.ilike.%${safeTitle}%`
        )
        .order('received_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.error({ error, userId: this.userId }, 'Failed to fetch related emails');
        return [];
      }

      return (
        emails?.map((email: any) => ({
          date: new Date(email.received_at),
          subject: email.subject || 'No subject',
          summary: email.ai_summary || 'No summary available',
        })) || []
      );
    } catch (error) {
      logger.error({ error, userId: this.userId }, 'Error finding related emails');
      return [];
    }
  }

  /**
   * Gather company information
   */
  private async gatherCompanyInfo(attendees: Attendee[]): Promise<{
    name: string;
    size?: string;
    industry?: string;
    recentNews?: string[];
  }> {
    // In production, would query company database or external APIs
    return {
      name: 'Example Corp',
      size: '500-1000 employees',
      industry: 'Technology',
      recentNews: [
        'Announced Series B funding',
        'Launched new product line',
        'Expanded to EMEA region',
      ],
    };
  }

  /**
   * Generate meeting summary
   */
  private generateSummary(meeting: CalendarEvent): string {
    const duration = (meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60);
    const attendeeCount = meeting.attendees?.length || 0;

    return `${duration}-minute ${meeting.title} with ${attendeeCount} ${attendeeCount === 1 ? 'participant' : 'participants'}.`;
  }

  /**
   * Derive meeting objectives
   */
  private deriveObjectives(
    meeting: CalendarEvent,
    previousMeetings: any[]
  ): string[] {
    const title = meeting.title.toLowerCase();
    const objectives: string[] = [];

    // Derive from title
    if (title.includes('kickoff')) {
      objectives.push('Align on project scope and timeline');
      objectives.push('Establish team roles and responsibilities');
      objectives.push('Set communication cadence');
    } else if (title.includes('review')) {
      objectives.push('Review progress against objectives');
      objectives.push('Identify blockers and mitigation strategies');
      objectives.push('Adjust timeline if needed');
    } else if (title.includes('planning')) {
      objectives.push('Define goals for next quarter');
      objectives.push('Allocate resources');
      objectives.push('Create action plan');
    } else {
      objectives.push('Discuss key topics');
      objectives.push('Make necessary decisions');
      objectives.push('Define next steps');
    }

    // Add follow-up objectives if there were previous meetings
    if (previousMeetings.length > 0) {
      objectives.push('Review action items from previous meeting');
    }

    return objectives;
  }

  /**
   * Create suggested agenda
   */
  private createAgenda(
    meeting: CalendarEvent,
    previousMeetings: any[]
  ): { item: string; duration: number; owner?: string }[] {
    const duration = (meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60);
    const agenda: { item: string; duration: number; owner?: string }[] = [];

    // Opening
    agenda.push({ item: 'Welcome and Introductions', duration: 5 });

    // Review previous action items if applicable
    if (previousMeetings.length > 0) {
      agenda.push({ item: 'Review Previous Action Items', duration: 10 });
    }

    // Main discussion items (allocate remaining time)
    const remainingTime = duration - (agenda.reduce((sum, item) => sum + item.duration, 0) + 10);
    const mainItemCount = 3;
    const timePerItem = Math.floor(remainingTime / mainItemCount);

    agenda.push(
      { item: 'Discuss Current Status', duration: timePerItem },
      { item: 'Address Key Challenges', duration: timePerItem },
      { item: 'Plan Next Steps', duration: timePerItem }
    );

    // Closing
    agenda.push({ item: 'Recap and Action Items', duration: 10 });

    return agenda;
  }

  /**
   * Generate talking points
   */
  private generateTalkingPoints(
    meeting: CalendarEvent,
    previousMeetings: any[]
  ): TalkingPoint[] {
    const points: TalkingPoint[] = [];

    // Opening points
    points.push({
      topic: 'Meeting Objectives',
      points: [
        'Review what we want to accomplish today',
        'Confirm everyone is aligned on goals',
      ],
      timing: 'opening',
      importance: 'high',
    });

    // Main discussion points
    points.push({
      topic: 'Project Progress',
      points: ['Highlight recent wins', 'Discuss current status', 'Address any concerns'],
      timing: 'throughout',
      importance: 'critical',
    });

    // Potential concerns
    points.push({
      topic: 'Risk Management',
      points: [
        {
          concern: 'Timeline may be aggressive',
          response: 'We have buffer built in and can adjust scope if needed',
          data: { bufferWeeks: 2 },
        },
      ],
      timing: 'as_needed',
      importance: 'high',
    });

    // Closing points
    points.push({
      topic: 'Next Steps',
      points: ['Summarize action items', 'Assign owners', 'Schedule follow-up if needed'],
      timing: 'closing',
      importance: 'critical',
    });

    return points;
  }

  /**
   * Generate strategic questions
   */
  private generateQuestions(
    meeting: CalendarEvent,
    participants: ParticipantInfo[]
  ): string[] {
    return [
      'What are the biggest priorities from your perspective?',
      'Are there any concerns we should address upfront?',
      'What does success look like for this initiative?',
      'What support do you need from the team?',
      'How should we handle unexpected challenges?',
    ];
  }

  /**
   * Anticipate potential objections
   */
  private anticipateObjections(meeting: CalendarEvent): {
    objection: string;
    response: string;
  }[] {
    return [
      {
        objection: 'The timeline seems too aggressive',
        response:
          'We have built in 2 weeks of buffer and can adjust scope based on priorities',
      },
      {
        objection: 'We may not have enough resources',
        response:
          'We can discuss resource allocation and identify where we need additional support',
      },
      {
        objection: 'This overlaps with other initiatives',
        response:
          "Let's review dependencies and ensure we're coordinating effectively across teams",
      },
    ];
  }

  /**
   * Define success metrics for the meeting
   */
  private defineSuccess(meeting: CalendarEvent): string[] {
    return [
      'All participants aligned on objectives',
      'Key decisions made and documented',
      'Clear action items with owners and deadlines',
      'Next steps defined',
      'Any blockers identified and mitigation plan in place',
    ];
  }

  /**
   * Estimate preparation time needed
   */
  private estimatePreparationTime(
    meeting: CalendarEvent,
    agenda: { item: string; duration: number }[]
  ): number {
    const attendeeCount = meeting.attendees?.length || 0;
    const agendaItems = agenda.length;

    // Base time: 15 minutes
    let time = 15;

    // Add 5 minutes per attendee over 3
    if (attendeeCount > 3) {
      time += (attendeeCount - 3) * 5;
    }

    // Add 3 minutes per agenda item over 3
    if (agendaItems > 3) {
      time += (agendaItems - 3) * 3;
    }

    return Math.min(time, 60); // Cap at 60 minutes
  }

  /**
   * Generate post-meeting summary
   */
  async generateMeetingSummary(
    meeting: CalendarEvent,
    notes?: string
  ): Promise<{
    summary: string;
    keyDecisions: string[];
    actionItems: { item: string; owner: string; deadline: Date }[];
    followUpNeeded: boolean;
    nextMeeting?: Date;
  }> {
    // In production, would use AI to analyze meeting notes/transcript
    return {
      summary: `${meeting.title} meeting completed with ${meeting.attendees?.length || 0} participants.`,
      keyDecisions: [
        'Approved project timeline',
        'Agreed on budget allocation',
        'Selected vendor for implementation',
      ],
      actionItems: [
        {
          item: 'Finalize contract with vendor',
          owner: 'John Doe',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          item: 'Schedule kickoff meeting',
          owner: 'Jane Smith',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ],
      followUpNeeded: true,
      nextMeeting: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
  }
}
