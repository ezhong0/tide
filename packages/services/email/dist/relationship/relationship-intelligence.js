"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipIntelligence = void 0;
const logger_1 = require("@tide/logger");
/**
 * Relationship Intelligence system that tracks and analyzes professional relationships
 */
class RelationshipIntelligence {
    constructor(userId) {
        this.userId = userId;
    }
    /**
     * Analyze relationship with a contact
     */
    async analyzeRelationship(contact, interactions) {
        logger_1.logger.info({
            userId: this.userId,
            contact: contact.email,
            interactionCount: interactions.length,
        }, 'Analyzing relationship');
        try {
            // Calculate metrics in parallel
            const [metrics, patterns] = await Promise.all([
                this.calculateMetrics(interactions),
                this.identifyPatterns(interactions),
            ]);
            // Generate insights
            const insights = this.generateInsights(metrics, patterns);
            // Calculate relationship strength
            const relationshipStrength = this.calculateStrength(metrics, patterns);
            // Determine maintenance needs
            const maintenanceNeeded = this.assessMaintenanceNeeds(metrics, patterns);
            return {
                contact,
                metrics,
                patterns,
                insights,
                lastInteraction: interactions[0],
                relationshipStrength,
                maintenanceNeeded,
            };
        }
        catch (error) {
            logger_1.logger.error({ userId: this.userId, contact, error }, 'Failed to analyze relationship');
            throw error;
        }
    }
    /**
     * Calculate relationship metrics
     */
    async calculateMetrics(interactions) {
        if (interactions.length === 0) {
            return {
                frequency: 0,
                recency: new Date(0),
                depth: 0,
                sentiment: 'neutral',
                importance: 0,
                responseTime: 0,
                initiationRatio: 0,
            };
        }
        // Calculate frequency (emails per week)
        const oldestInteraction = interactions[interactions.length - 1].timestamp;
        const newestInteraction = interactions[0].timestamp;
        const weeksSpan = (newestInteraction.getTime() - oldestInteraction.getTime()) /
            (1000 * 60 * 60 * 24 * 7);
        const frequency = weeksSpan > 0 ? interactions.length / weeksSpan : 0;
        // Calculate depth (average email length)
        const avgLength = interactions.reduce((sum, email) => sum + email.body.length, 0) /
            interactions.length;
        const depth = Math.min(avgLength / 1000, 1); // Normalize to 0-1
        // Analyze sentiment
        const sentiment = this.analyzeSentiment(interactions);
        // Calculate importance
        const importance = this.calculateImportance(interactions);
        // Calculate average response time
        const responseTime = this.calculateAverageResponseTime(interactions);
        // Calculate initiation ratio
        const initiatedCount = interactions.filter((email) => email.to.includes(email.userId.toString())).length;
        const initiationRatio = initiatedCount / interactions.length;
        return {
            frequency,
            recency: newestInteraction,
            depth,
            sentiment,
            importance,
            responseTime,
            initiationRatio,
        };
    }
    /**
     * Identify communication patterns
     */
    async identifyPatterns(interactions) {
        // Identify preferred channel
        const preferredChannel = 'email'; // Simplified
        // Find best times to contact
        const hourCounts = new Map();
        const dayCounts = new Map();
        for (const email of interactions) {
            const hour = email.timestamp.getHours();
            const day = email.timestamp.getDay();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        }
        // Get top 3 hours and days
        const sortedHours = Array.from(hourCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        const sortedDays = Array.from(dayCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        const bestTimeToContact = sortedHours.flatMap(([hour]) => sortedDays.map(([day]) => ({ hour, dayOfWeek: day })));
        // Extract topics (simplified - would use NLP in production)
        const topicsDiscussed = await this.extractTopics(interactions);
        // Determine if decision maker (simplified heuristic)
        const decisionMaker = interactions.length > 10;
        // Calculate influence
        const influence = Math.min(interactions.length / 50, 1);
        return {
            preferredChannel,
            bestTimeToContact,
            topicsDiscussed,
            decisionMaker,
            influence,
        };
    }
    /**
     * Generate insights about the relationship
     */
    generateInsights(metrics, patterns) {
        const insights = [];
        // Check for stale relationships
        const daysSinceLastContact = (Date.now() - metrics.recency.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastContact > 30 && metrics.importance > 0.5) {
            insights.push({
                type: 'maintenance_needed',
                message: `Haven't contacted ${daysSinceLastContact.toFixed(0)} days - relationship may need attention`,
                priority: 'high',
                suggestedAction: 'Send a check-in email or schedule a catch-up call',
            });
        }
        // Check for one-sided communication
        if (metrics.initiationRatio > 0.8) {
            insights.push({
                type: 'warning',
                message: 'You initiate most conversations - may indicate low engagement',
                priority: 'medium',
                suggestedAction: 'Consider if this relationship is mutually beneficial',
            });
        }
        // Identify opportunities
        if (metrics.frequency > 2 && patterns.decisionMaker) {
            insights.push({
                type: 'opportunity',
                message: 'High-value relationship with decision-making authority',
                priority: 'high',
                suggestedAction: 'Maintain regular touchpoints and explore collaboration opportunities',
            });
        }
        // Positive sentiment tracking
        if (metrics.sentiment === 'positive' && metrics.frequency > 1) {
            insights.push({
                type: 'strength',
                message: 'Strong, positive relationship with regular communication',
                priority: 'low',
                suggestedAction: 'Continue current engagement patterns',
            });
        }
        return insights;
    }
    /**
     * Calculate overall relationship strength
     */
    calculateStrength(metrics, patterns) {
        const weights = {
            frequency: 0.25,
            recency: 0.2,
            depth: 0.15,
            sentiment: 0.15,
            importance: 0.15,
            influence: 0.1,
        };
        // Normalize recency (0-1, where 1 = contacted today)
        const daysSinceContact = (Date.now() - metrics.recency.getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 1 - daysSinceContact / 90); // 90 days = 0 score
        // Normalize frequency (cap at 5 emails/week)
        const frequencyScore = Math.min(metrics.frequency / 5, 1);
        // Sentiment score
        const sentimentScore = metrics.sentiment === 'positive' ? 1 : metrics.sentiment === 'neutral' ? 0.5 : 0;
        const strength = frequencyScore * weights.frequency +
            recencyScore * weights.recency +
            metrics.depth * weights.depth +
            sentimentScore * weights.sentiment +
            metrics.importance * weights.importance +
            patterns.influence * weights.influence;
        return Math.max(0, Math.min(1, strength));
    }
    /**
     * Assess maintenance needs for relationship
     */
    assessMaintenanceNeeds(metrics, patterns) {
        const daysSinceContact = (Date.now() - metrics.recency.getTime()) / (1000 * 60 * 60 * 24);
        // Urgent if important contact and >60 days
        if (daysSinceContact > 60 && metrics.importance > 0.7) {
            return {
                urgent: true,
                soon: false,
                scheduled: false,
                reason: 'Important relationship needs immediate attention',
            };
        }
        // Soon if >30 days
        if (daysSinceContact > 30 && metrics.importance > 0.5) {
            return {
                urgent: false,
                soon: true,
                scheduled: false,
                reason: 'Regular touchpoint due',
            };
        }
        // Scheduled maintenance for active relationships
        if (metrics.frequency > 1) {
            const nextTouch = new Date(metrics.recency);
            nextTouch.setDate(nextTouch.getDate() + 14); // Every 2 weeks
            return {
                urgent: false,
                soon: false,
                scheduled: true,
                date: nextTouch,
            };
        }
        return {
            urgent: false,
            soon: false,
            scheduled: false,
        };
    }
    /**
     * Create maintenance plan for all relationships
     */
    async createMaintenancePlan(contacts, allEmails) {
        logger_1.logger.info({ userId: this.userId, contactCount: contacts.length }, 'Creating maintenance plan');
        const plan = {
            immediate: [],
            thisWeek: [],
            thisMonth: [],
            monitoring: [],
        };
        for (const contact of contacts) {
            // Get interactions for this contact
            const interactions = allEmails.filter((email) => email.from === contact.email || email.to.includes(contact.email));
            if (interactions.length === 0) {
                continue;
            }
            const analysis = await this.analyzeRelationship(contact, interactions);
            if (analysis.maintenanceNeeded.urgent) {
                plan.immediate.push({
                    contact,
                    reason: analysis.maintenanceNeeded.reason || 'Needs attention',
                    suggestion: analysis.insights[0]?.suggestedAction || 'Reach out soon',
                });
            }
            else if (analysis.maintenanceNeeded.soon) {
                plan.thisWeek.push({
                    contact,
                    reason: analysis.maintenanceNeeded.reason || 'Regular check-in due',
                    suggestion: analysis.insights[0]?.suggestedAction || 'Send a quick email',
                });
            }
            else if (analysis.maintenanceNeeded.scheduled) {
                plan.thisMonth.push({
                    contact,
                    nextTouch: analysis.maintenanceNeeded.date,
                    suggestion: 'Scheduled touchpoint',
                });
            }
            else if (analysis.relationshipStrength > 0.5) {
                plan.monitoring.push(contact);
            }
        }
        logger_1.logger.info({
            userId: this.userId,
            immediate: plan.immediate.length,
            thisWeek: plan.thisWeek.length,
            thisMonth: plan.thisMonth.length,
            monitoring: plan.monitoring.length,
        }, 'Maintenance plan created');
        return plan;
    }
    /**
     * Analyze sentiment across interactions
     */
    analyzeSentiment(interactions) {
        let positiveCount = 0;
        let negativeCount = 0;
        const positiveWords = [
            'thanks',
            'thank you',
            'great',
            'excellent',
            'wonderful',
            'appreciate',
            'perfect',
            'awesome',
        ];
        const negativeWords = [
            'unfortunately',
            'issue',
            'problem',
            'concern',
            'disappointed',
            'frustrated',
            'urgent',
        ];
        for (const email of interactions) {
            const text = (email.subject + ' ' + email.body).toLowerCase();
            if (positiveWords.some((word) => text.includes(word))) {
                positiveCount++;
            }
            if (negativeWords.some((word) => text.includes(word))) {
                negativeCount++;
            }
        }
        if (positiveCount > negativeCount * 1.5) {
            return 'positive';
        }
        if (negativeCount > positiveCount * 1.5) {
            return 'negative';
        }
        return 'neutral';
    }
    /**
     * Calculate importance of interactions
     */
    calculateImportance(interactions) {
        // Simplified importance calculation
        const factors = {
            volume: Math.min(interactions.length / 50, 1) * 0.3,
            hasAttachments: interactions.some((e) => e.hasAttachments) ? 0.2 : 0,
            threadLength: Math.min((interactions[0]?.threadLength || 1) / 10, 1) * 0.2,
            recent: interactions[0]
                ? 1 - Math.min((Date.now() - interactions[0].timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30), 1) * 0.3
                : 0,
        };
        return Object.values(factors).reduce((sum, val) => sum + val, 0);
    }
    /**
     * Calculate average response time
     */
    calculateAverageResponseTime(interactions) {
        const responseTimes = [];
        for (let i = 0; i < interactions.length - 1; i++) {
            const current = interactions[i];
            const previous = interactions[i + 1];
            // If this is a response to previous email
            if (current.inReplyTo === previous.messageId) {
                const responseTime = (current.timestamp.getTime() - previous.timestamp.getTime()) /
                    (1000 * 60 * 60); // hours
                responseTimes.push(responseTime);
            }
        }
        if (responseTimes.length === 0) {
            return 0;
        }
        return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }
    /**
     * Extract topics from interactions (simplified)
     */
    async extractTopics(interactions) {
        const topicCounts = new Map();
        const commonTopics = [
            'meeting',
            'project',
            'proposal',
            'budget',
            'timeline',
            'deliverable',
            'feedback',
            'review',
            'contract',
            'partnership',
        ];
        for (const email of interactions) {
            const text = (email.subject + ' ' + email.body).toLowerCase();
            for (const topic of commonTopics) {
                if (text.includes(topic)) {
                    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
                }
            }
        }
        // Return top 5 topics
        return Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic]) => topic);
    }
}
exports.RelationshipIntelligence = RelationshipIntelligence;
//# sourceMappingURL=relationship-intelligence.js.map