"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingPreparation = void 0;
const logger_1 = require("@tide/logger");
/**
 * Meeting Preparation system that generates comprehensive briefs for meetings
 */
class MeetingPreparation {
    constructor(userId) {
        this.userId = userId;
    }
    /**
     * Prepare comprehensive brief for a meeting
     */
    async prepareMeeting(meeting) {
        logger_1.logger.info({
            userId: this.userId,
            meetingId: meeting.id,
            title: meeting.title,
            attendeeCount: meeting.attendees?.length || 0,
        }, 'Preparing meeting brief');
        try {
            // Gather all context in parallel
            const [participants, previousMeetings, relatedEmails, companyInfo] = await Promise.all([
                this.gatherParticipantInfo(meeting.attendees || []),
                this.findPreviousMeetings(meeting),
                this.findRelatedEmails(meeting),
                this.gatherCompanyInfo(meeting.attendees || []),
            ]);
            // Generate meeting summary and objectives
            const summary = this.generateSummary(meeting);
            const objectives = this.deriveObjectives(meeting, previousMeetings);
            // Create suggested agenda
            const agenda = this.createAgenda(meeting, previousMeetings);
            // Generate talking points
            const talkingPoints = this.generateTalkingPoints(meeting, previousMeetings);
            // Generate strategic questions
            const suggestedQuestions = this.generateQuestions(meeting, participants);
            // Anticipate objections
            const possibleObjections = this.anticipateObjections(meeting);
            // Define success metrics
            const successMetrics = this.defineSuccess(meeting);
            // Estimate preparation time
            const preparationTime = this.estimatePreparationTime(meeting, agenda);
            const brief = {
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
            logger_1.logger.info({
                userId: this.userId,
                meetingId: meeting.id,
                agendaItems: agenda.length,
                participantCount: participants.length,
            }, 'Meeting brief prepared');
            return brief;
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, meetingId: meeting.id, error }, 'Failed to prepare meeting');
            throw error;
        }
    }
    /**
     * Gather information about meeting participants
     */
    async gatherParticipantInfo(attendees) {
        return Promise.all(attendees.map(async (attendee) => {
            // In production, would query databases for this info
            const profile = {
                name: attendee.name || attendee.email,
                title: 'Unknown',
                company: 'Unknown',
            };
            const interactions = {
                emailCount: Math.floor(Math.random() * 50), // Mock data
                meetingCount: Math.floor(Math.random() * 20),
                lastContact: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            };
            const importance = Math.random();
            const relationshipStrength = Math.random();
            const communicationStyle = ['formal', 'casual', 'direct', 'collaborative'][Math.floor(Math.random() * 4)];
            const topics = ['project', 'budget', 'timeline', 'strategy'];
            return {
                attendee,
                profile,
                interactions,
                importance,
                relationshipStrength,
                communicationStyle,
                topics,
            };
        }));
    }
    /**
     * Find previous meetings with same participants
     */
    async findPreviousMeetings(meeting) {
        // In production, would query calendar history
        return [
            {
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                summary: 'Previous discussion about project timeline',
                outcomes: ['Agreed on Q2 delivery', 'Identified resource gaps', 'Scheduled follow-up'],
            },
        ];
    }
    /**
     * Find related emails
     */
    async findRelatedEmails(meeting) {
        // In production, would query email database
        return [
            {
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                subject: 'Re: Meeting agenda items',
                summary: 'Discussed adding budget review to agenda',
            },
        ];
    }
    /**
     * Gather company information
     */
    async gatherCompanyInfo(attendees) {
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
    generateSummary(meeting) {
        const duration = (meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60);
        const attendeeCount = meeting.attendees?.length || 0;
        return `${duration}-minute ${meeting.title} with ${attendeeCount} ${attendeeCount === 1 ? 'participant' : 'participants'}.`;
    }
    /**
     * Derive meeting objectives
     */
    deriveObjectives(meeting, previousMeetings) {
        const title = meeting.title.toLowerCase();
        const objectives = [];
        // Derive from title
        if (title.includes('kickoff')) {
            objectives.push('Align on project scope and timeline');
            objectives.push('Establish team roles and responsibilities');
            objectives.push('Set communication cadence');
        }
        else if (title.includes('review')) {
            objectives.push('Review progress against objectives');
            objectives.push('Identify blockers and mitigation strategies');
            objectives.push('Adjust timeline if needed');
        }
        else if (title.includes('planning')) {
            objectives.push('Define goals for next quarter');
            objectives.push('Allocate resources');
            objectives.push('Create action plan');
        }
        else {
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
    createAgenda(meeting, previousMeetings) {
        const duration = (meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60);
        const agenda = [];
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
        agenda.push({ item: 'Discuss Current Status', duration: timePerItem }, { item: 'Address Key Challenges', duration: timePerItem }, { item: 'Plan Next Steps', duration: timePerItem });
        // Closing
        agenda.push({ item: 'Recap and Action Items', duration: 10 });
        return agenda;
    }
    /**
     * Generate talking points
     */
    generateTalkingPoints(meeting, previousMeetings) {
        const points = [];
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
    generateQuestions(meeting, participants) {
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
    anticipateObjections(meeting) {
        return [
            {
                objection: 'The timeline seems too aggressive',
                response: 'We have built in 2 weeks of buffer and can adjust scope based on priorities',
            },
            {
                objection: 'We may not have enough resources',
                response: 'We can discuss resource allocation and identify where we need additional support',
            },
            {
                objection: 'This overlaps with other initiatives',
                response: "Let's review dependencies and ensure we're coordinating effectively across teams",
            },
        ];
    }
    /**
     * Define success metrics for the meeting
     */
    defineSuccess(meeting) {
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
    estimatePreparationTime(meeting, agenda) {
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
    async generateMeetingSummary(meeting, notes) {
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
exports.MeetingPreparation = MeetingPreparation;
//# sourceMappingURL=meeting-preparation.js.map