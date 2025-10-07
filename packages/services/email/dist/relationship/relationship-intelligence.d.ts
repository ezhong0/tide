import type { UserId } from '@tide/types';
import type { Email } from '../types/index.js';
export interface Contact {
    email: string;
    name?: string;
    company?: string;
    title?: string;
}
export interface RelationshipMetrics {
    frequency: number;
    recency: Date;
    depth: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    importance: number;
    responseTime: number;
    initiationRatio: number;
}
export interface CommunicationPatterns {
    preferredChannel: 'email' | 'meeting' | 'both';
    bestTimeToContact: {
        hour: number;
        dayOfWeek: number;
    }[];
    topicsDiscussed: string[];
    decisionMaker: boolean;
    influence: number;
}
export interface RelationshipInsight {
    type: 'maintenance_needed' | 'opportunity' | 'warning' | 'strength';
    message: string;
    priority: 'high' | 'medium' | 'low';
    suggestedAction?: string;
}
export interface RelationshipAnalysis {
    contact: Contact;
    metrics: RelationshipMetrics;
    patterns: CommunicationPatterns;
    insights: RelationshipInsight[];
    lastInteraction?: Email;
    nextScheduled?: Date;
    relationshipStrength: number;
    maintenanceNeeded: {
        urgent: boolean;
        soon: boolean;
        scheduled: boolean;
        reason?: string;
        date?: Date;
    };
}
export interface MaintenancePlan {
    immediate: {
        contact: Contact;
        reason: string;
        suggestion: string;
    }[];
    thisWeek: {
        contact: Contact;
        reason: string;
        suggestion: string;
    }[];
    thisMonth: {
        contact: Contact;
        nextTouch: Date;
        suggestion: string;
    }[];
    monitoring: Contact[];
}
/**
 * Relationship Intelligence system that tracks and analyzes professional relationships
 */
export declare class RelationshipIntelligence {
    private userId;
    constructor(userId: UserId);
    /**
     * Analyze relationship with a contact
     */
    analyzeRelationship(contact: Contact, interactions: Email[]): Promise<RelationshipAnalysis>;
    /**
     * Calculate relationship metrics
     */
    private calculateMetrics;
    /**
     * Identify communication patterns
     */
    private identifyPatterns;
    /**
     * Generate insights about the relationship
     */
    private generateInsights;
    /**
     * Calculate overall relationship strength
     */
    private calculateStrength;
    /**
     * Assess maintenance needs for relationship
     */
    private assessMaintenanceNeeds;
    /**
     * Create maintenance plan for all relationships
     */
    createMaintenancePlan(contacts: Contact[], allEmails: Email[]): Promise<MaintenancePlan>;
    /**
     * Analyze sentiment across interactions
     */
    private analyzeSentiment;
    /**
     * Calculate importance of interactions
     */
    private calculateImportance;
    /**
     * Calculate average response time
     */
    private calculateAverageResponseTime;
    /**
     * Extract topics from interactions (enhanced with better detection)
     */
    private extractTopics;
    /**
     * Identify if contact is a decision maker (enhanced algorithm)
     */
    private identifyDecisionMaker;
    /**
     * Calculate influence with multiple factors
     */
    private calculateInfluence;
    /**
     * Identify VIP contacts based on comprehensive criteria
     */
    identifyVIPs(contacts: Contact[], allEmails: Email[]): Promise<Contact[]>;
    /**
     * Get contact recommendations for relationship building
     */
    getRelationshipRecommendations(contacts: Contact[], allEmails: Email[]): Promise<{
        reach_out_now: Contact[];
        nurture: Contact[];
        monitor: Contact[];
        reasons: Map<string, string>;
    }>;
}
//# sourceMappingURL=relationship-intelligence.d.ts.map