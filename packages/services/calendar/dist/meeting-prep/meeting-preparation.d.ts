import type { UserId } from '@tide/types';
import type { CalendarEvent, Attendee } from '../types/index.js';
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
    importance: number;
    relationshipStrength: number;
    communicationStyle?: 'formal' | 'casual' | 'direct' | 'collaborative';
    topics: string[];
}
export interface TalkingPoint {
    topic: string;
    points: string[] | {
        concern: string;
        response: string;
        data?: any;
    }[];
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
    preparationTime: number;
}
/**
 * Meeting Preparation system that generates comprehensive briefs for meetings
 */
export declare class MeetingPreparation {
    private userId;
    constructor(userId: UserId);
    /**
     * Prepare comprehensive brief for a meeting
     */
    prepareMeeting(meeting: CalendarEvent): Promise<MeetingBrief>;
    /**
     * Gather information about meeting participants
     */
    private gatherParticipantInfo;
    /**
     * Find previous meetings with same participants
     */
    private findPreviousMeetings;
    /**
     * Find related emails
     */
    private findRelatedEmails;
    /**
     * Gather company information
     */
    private gatherCompanyInfo;
    /**
     * Generate meeting summary
     */
    private generateSummary;
    /**
     * Derive meeting objectives
     */
    private deriveObjectives;
    /**
     * Create suggested agenda
     */
    private createAgenda;
    /**
     * Generate talking points
     */
    private generateTalkingPoints;
    /**
     * Generate strategic questions
     */
    private generateQuestions;
    /**
     * Anticipate potential objections
     */
    private anticipateObjections;
    /**
     * Define success metrics for the meeting
     */
    private defineSuccess;
    /**
     * Estimate preparation time needed
     */
    private estimatePreparationTime;
    /**
     * Generate post-meeting summary
     */
    generateMeetingSummary(meeting: CalendarEvent, notes?: string): Promise<{
        summary: string;
        keyDecisions: string[];
        actionItems: {
            item: string;
            owner: string;
            deadline: Date;
        }[];
        followUpNeeded: boolean;
        nextMeeting?: Date;
    }>;
}
//# sourceMappingURL=meeting-preparation.d.ts.map