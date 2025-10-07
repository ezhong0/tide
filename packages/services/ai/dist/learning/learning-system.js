/**
 * Learning System
 * Continuous improvement engine that learns from user interactions
 */
import { createLogger } from '@tide/logger';
import { PatternDatabase } from './pattern-database';
import { UserPreferenceModel } from './user-preference-model';
import { FeedbackProcessor } from './feedback-processor';
import { v4 as uuidv4 } from 'uuid';
const logger = createLogger({ component: 'LearningSystem' });
export class LearningSystem {
    constructor() {
        this.patterns = new PatternDatabase();
        this.preferences = new UserPreferenceModel();
        this.feedback = new FeedbackProcessor();
    }
    /**
     * Observe an interaction to extract learnings
     */
    async observe(request, response) {
        logger.debug('Observing interaction', { userId: request.userId });
        try {
            // Extract patterns from the interaction
            const extractedPatterns = await this.extractPatterns(request, response);
            // Store patterns
            for (const pattern of extractedPatterns) {
                await this.patterns.store(pattern);
            }
            // Update user model
            await this.updateUserModel(request.userId, extractedPatterns);
            logger.info('Interaction observed', {
                userId: request.userId,
                patternsFound: extractedPatterns.length,
            });
        }
        catch (error) {
            logger.error('Failed to observe interaction', { error });
        }
    }
    /**
     * Extract patterns from interaction
     */
    async extractPatterns(request, response) {
        const patterns = [];
        const content = request.content.toLowerCase();
        // Temporal patterns
        const hour = new Date(request.timestamp).getHours();
        const dayOfWeek = new Date(request.timestamp).getDay();
        if (this.isWorkingHours(hour, dayOfWeek)) {
            patterns.push({
                id: uuidv4(),
                userId: request.userId,
                type: 'temporal',
                trigger: {
                    type: 'time',
                    conditions: { hour, dayOfWeek },
                    timeOfDay: hour,
                    dayOfWeek,
                },
                action: {
                    type: 'check_messages',
                    params: { source: 'temporal_pattern' },
                },
                confidence: 0.7,
                frequency: 1,
                lastOccurred: request.timestamp,
                metadata: { firstObserved: request.timestamp },
            });
        }
        // Sequence patterns
        if (request.context.previousMessages && request.context.previousMessages.length > 0) {
            const previousMessage = request.context.previousMessages[request.context.previousMessages.length - 1];
            patterns.push({
                id: uuidv4(),
                userId: request.userId,
                type: 'sequence',
                trigger: {
                    type: 'sequence',
                    conditions: { previousAction: previousMessage.content },
                },
                action: {
                    type: 'follow_up',
                    params: { currentAction: content },
                },
                confidence: 0.65,
                frequency: 1,
                lastOccurred: request.timestamp,
                metadata: { sequence: [previousMessage.content, content] },
            });
        }
        // Contextual patterns
        if (content.includes('meeting') || content.includes('schedule')) {
            patterns.push({
                id: uuidv4(),
                userId: request.userId,
                type: 'contextual',
                trigger: {
                    type: 'keyword',
                    conditions: { keywords: ['meeting', 'schedule'] },
                    contextKeys: ['calendar'],
                },
                action: {
                    type: 'calendar_action',
                    params: { preferredAction: 'schedule' },
                },
                confidence: 0.8,
                frequency: 1,
                lastOccurred: request.timestamp,
                metadata: {},
            });
        }
        // Preference patterns
        if (request.preferences) {
            patterns.push({
                id: uuidv4(),
                userId: request.userId,
                type: 'preference',
                trigger: {
                    type: 'user_preference',
                    conditions: { privacyLevel: request.preferences.privacyLevel },
                },
                action: {
                    type: 'apply_preferences',
                    params: { preferences: request.preferences },
                },
                confidence: 0.9,
                frequency: 1,
                lastOccurred: request.timestamp,
                metadata: { preferences: request.preferences },
            });
        }
        return patterns;
    }
    /**
     * Update user model based on patterns
     */
    async updateUserModel(userId, patterns) {
        // Update communication style if patterns suggest it
        const hasEmailPatterns = patterns.some(p => p.type === 'contextual' &&
            (p.trigger.contextKeys?.includes('email') || false));
        if (hasEmailPatterns) {
            await this.preferences.updateCommunicationStyle(userId, {
                // These would be extracted from actual usage
                formality: 0.75,
            });
        }
        // Update scheduling preferences
        const hasSchedulingPatterns = patterns.some(p => p.type === 'contextual' &&
            (p.trigger.contextKeys?.includes('calendar') || false));
        if (hasSchedulingPatterns) {
            await this.preferences.updateSchedulingPreferences(userId, {
                preferredMeetingTimes: this.extractPreferredMeetingTimes(patterns),
            });
        }
    }
    /**
     * Learn from specific user data
     */
    async learn(userId) {
        logger.info('Running learning for user', { userId });
        // Get all user patterns
        const userPatterns = await this.patterns.getUserPatterns(userId);
        // Get user model
        const userModel = await this.preferences.getUserModel(userId);
        // Get feedback insights
        const feedbackInsights = await this.feedback.getInsights(userId);
        // Analyze and update model
        const writingStyle = await this.learnWritingStyle(userPatterns);
        const schedulingPrefs = await this.learnSchedulingPreferences(userPatterns);
        // Update user model
        await this.preferences.updateCommunicationStyle(userId, writingStyle);
        await this.preferences.updateSchedulingPreferences(userId, schedulingPrefs);
        logger.info('Learning complete', {
            userId,
            patternsAnalyzed: userPatterns.length,
            feedbackCount: feedbackInsights.positiveCount + feedbackInsights.negativeCount,
        });
        return {
            patternsAnalyzed: userPatterns.length,
            writingStyle,
            schedulingPrefs,
            feedbackInsights,
        };
    }
    /**
     * Learn writing style from patterns
     */
    async learnWritingStyle(patterns) {
        // Analyze patterns to determine writing style
        // This is a simplified version
        return {
            formality: 0.7,
            brevity: 0.6,
        };
    }
    /**
     * Learn scheduling preferences from patterns
     */
    async learnSchedulingPreferences(patterns) {
        const timeSlots = this.extractPreferredMeetingTimes(patterns);
        return {
            preferredMeetingTimes: timeSlots,
        };
    }
    /**
     * Extract preferred meeting times from patterns
     */
    extractPreferredMeetingTimes(patterns) {
        const temporalPatterns = patterns.filter(p => p.type === 'temporal');
        const timeSlots = temporalPatterns.map(p => ({
            dayOfWeek: p.trigger.dayOfWeek || 0,
            startHour: p.trigger.timeOfDay || 9,
            endHour: (p.trigger.timeOfDay || 9) + 1,
        }));
        return timeSlots;
    }
    /**
     * Check if time is during working hours
     */
    isWorkingHours(hour, dayOfWeek) {
        return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17;
    }
    /**
     * Get pattern database (for external access)
     */
    getPatternDatabase() {
        return this.patterns;
    }
    /**
     * Get preference model (for external access)
     */
    getPreferenceModel() {
        return this.preferences;
    }
    /**
     * Get feedback processor (for external access)
     */
    getFeedbackProcessor() {
        return this.feedback;
    }
}
//# sourceMappingURL=learning-system.js.map