import { logger } from '@tide/logger';
import { createSupabase, getDefaultContactIntelligence, updateContactIntelligence } from '@tide/database';
import type { UserId, ContactIntelligence } from '@tide/types';
import { vipDetector, type VIPScore } from './vip-detector.js';

export interface RelationshipData {
  id?: string;
  userId: UserId;
  contactEmail: string;
  contactName?: string;
  relationshipStrength: number; // 0-1
  interactionFrequency: 'daily' | 'weekly' | 'monthly' | 'occasional' | 'rare';
  lastInteractionAt?: Date;
  totalEmailsSent: number;
  totalEmailsReceived: number;
  averageResponseTimeMinutes?: number;
  topics: string[];
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  vipStatus: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailInteraction {
  emailId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  sentAt: Date;
  threadId?: string;
  sentiment?: string;
}

/**
 * Relationship Intelligence Tracker
 * Tracks email interactions and builds relationship intelligence
 */
export class RelationshipTracker {
  private db = createSupabase(true);
  private aiServiceURL = process.env.AI_SERVICE_URL || 'http://localhost:3001';

  /**
   * Track email interaction and update relationship intelligence
   */
  async trackInteraction(
    userId: UserId,
    interaction: EmailInteraction
  ): Promise<RelationshipData> {
    logger.info({
      userId,
      contactEmail: interaction.from,
      emailId: interaction.emailId
    }, 'Tracking email interaction');

    const contactEmail = this.extractPrimaryContact(interaction, userId);

    // Get or create relationship record
    let relationship = await this.getRelationship(userId, contactEmail);

    if (!relationship) {
      relationship = await this.createRelationship(userId, contactEmail, interaction);
    }

    // Update interaction metrics
    relationship = await this.updateInteractionMetrics(relationship, interaction, userId);

    // Analyze sentiment
    const sentiment = await this.analyzeSentiment(interaction);
    if (sentiment) {
      relationship.sentiment = sentiment;
    }

    // Extract topics
    const topics = await this.extractTopics(interaction);
    relationship.topics = this.mergeTopics(relationship.topics, topics);

    // Calculate relationship strength
    relationship.relationshipStrength = this.calculateRelationshipStrength(relationship);

    // Determine interaction frequency
    relationship.interactionFrequency = this.determineFrequency(relationship);

    // Automatic VIP detection (if not already manually marked)
    if (!relationship.vipStatus) {
      const vipScore = await vipDetector.detectVIP(relationship);
      if (vipScore.isVIP) {
        relationship.vipStatus = true;
        relationship.metadata = {
          ...relationship.metadata,
          vipDetectedAt: new Date().toISOString(),
          vipScore: vipScore.score,
          vipReasons: vipScore.reasons,
        };
        logger.info({
          contactEmail,
          vipScore: vipScore.score,
          reasons: vipScore.reasons
        }, 'Contact automatically marked as VIP');
      }
    }

    // Save updated relationship
    await this.saveRelationship(relationship);

    logger.info({
      contactEmail,
      strength: relationship.relationshipStrength,
      frequency: relationship.interactionFrequency,
      vipStatus: relationship.vipStatus
    }, 'Relationship updated');

    return relationship;
  }

  /**
   * Get relationship data for contact
   */
  async getRelationship(
    userId: UserId,
    contactEmail: string
  ): Promise<RelationshipData | null> {
    const { data } = await this.db
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('email', contactEmail)
      .single();

    if (!data) return null;

    const intelligence = data.intelligence as ContactIntelligence;

    return {
      id: data.id,
      userId: data.user_id,
      contactEmail: data.email,
      contactName: data.name,
      relationshipStrength: intelligence.strength,
      interactionFrequency: intelligence.frequency,
      lastInteractionAt: intelligence.last_interaction_at ? new Date(intelligence.last_interaction_at) : undefined,
      totalEmailsSent: intelligence.stats.emails_sent,
      totalEmailsReceived: intelligence.stats.emails_received,
      averageResponseTimeMinutes: intelligence.stats.avg_response_time_minutes || undefined,
      topics: intelligence.topics || [],
      sentiment: intelligence.sentiment,
      vipStatus: intelligence.vip,
      notes: data.notes,
      metadata: data.metadata || {}
    };
  }

  /**
   * Create new relationship record
   */
  private async createRelationship(
    userId: UserId,
    contactEmail: string,
    interaction: EmailInteraction
  ): Promise<RelationshipData> {
    const contactName = this.extractContactName(interaction);

    const relationship: RelationshipData = {
      userId,
      contactEmail,
      contactName,
      relationshipStrength: 0.3, // Starting strength
      interactionFrequency: 'rare',
      lastInteractionAt: interaction.sentAt,
      totalEmailsSent: 0,
      totalEmailsReceived: 1,
      topics: [],
      sentiment: 'neutral',
      vipStatus: false,
      metadata: {}
    };

    return relationship;
  }

  /**
   * Update interaction metrics
   */
  private async updateInteractionMetrics(
    relationship: RelationshipData,
    interaction: EmailInteraction,
    userId: UserId
  ): Promise<RelationshipData> {
    // Determine if sent or received
    const isSent = interaction.from.includes(userId as string) ||
                   interaction.to.some(email => !email.includes(userId as string));

    if (isSent) {
      relationship.totalEmailsSent++;
    } else {
      relationship.totalEmailsReceived++;
    }

    // Update last interaction
    relationship.lastInteractionAt = interaction.sentAt;

    // Calculate average response time if in thread
    if (interaction.threadId) {
      const responseTime = await this.calculateResponseTime(
        userId,
        interaction.threadId,
        interaction.sentAt
      );
      if (responseTime !== null) {
        if (relationship.averageResponseTimeMinutes) {
          relationship.averageResponseTimeMinutes =
            (relationship.averageResponseTimeMinutes + responseTime) / 2;
        } else {
          relationship.averageResponseTimeMinutes = responseTime;
        }
      }
    }

    return relationship;
  }

  /**
   * Calculate response time for threaded email
   */
  private async calculateResponseTime(
    userId: UserId,
    threadId: string,
    currentEmailTime: Date
  ): Promise<number | null> {
    try {
      // Query previous email in thread
      const { data: previousEmails } = await this.db
        .from('emails')
        .select('sent_at, from_email')
        .eq('provider_thread_id', threadId)
        .lt('sent_at', currentEmailTime.toISOString())
        .order('sent_at', { ascending: false })
        .limit(1);

      if (!previousEmails || previousEmails.length === 0) {
        return null;
      }

      const previousEmail = previousEmails[0];
      const previousTime = new Date(previousEmail.sent_at);
      const responseTimeMs = currentEmailTime.getTime() - previousTime.getTime();
      const responseTimeMinutes = responseTimeMs / (1000 * 60);

      return responseTimeMinutes;
    } catch (error) {
      logger.warn({ error, threadId }, 'Failed to calculate response time');
      return null;
    }
  }

  /**
   * Analyze email sentiment
   */
  private async analyzeSentiment(
    interaction: EmailInteraction
  ): Promise<RelationshipData['sentiment'] | null> {
    try {
      const response = await fetch(`${this.aiServiceURL}/analyze/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${interaction.subject}\n\n${interaction.body}`
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = (await response.json()) as { sentiment?: string };
      return this.mapSentiment(result.sentiment || 'neutral');
    } catch (error) {
      logger.warn({ error }, 'Sentiment analysis failed');
      return null;
    }
  }

  /**
   * Map AI sentiment to our categories
   */
  private mapSentiment(aiSentiment: string): RelationshipData['sentiment'] {
    const sentimentMap: Record<string, RelationshipData['sentiment']> = {
      very_positive: 'very_positive',
      positive: 'positive',
      neutral: 'neutral',
      negative: 'negative',
      very_negative: 'very_negative'
    };
    return sentimentMap[aiSentiment.toLowerCase()] || 'neutral';
  }

  /**
   * Extract topics from email
   */
  private async extractTopics(interaction: EmailInteraction): Promise<string[]> {
    try {
      const response = await fetch(`${this.aiServiceURL}/analyze/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${interaction.subject}\n\n${interaction.body}`
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = (await response.json()) as { topics?: string[] };
      return result.topics || [];
    } catch (error) {
      logger.warn({ error }, 'Topic extraction failed');
      return this.extractTopicsRuleBased(interaction);
    }
  }

  /**
   * Rule-based topic extraction (fallback)
   */
  private extractTopicsRuleBased(interaction: EmailInteraction): string[] {
    const text = `${interaction.subject} ${interaction.body}`.toLowerCase();
    const topics: string[] = [];

    const topicKeywords: Record<string, string[]> = {
      'business': ['business', 'partnership', 'proposal', 'contract'],
      'project': ['project', 'milestone', 'deadline', 'deliverable'],
      'meeting': ['meeting', 'call', 'schedule', 'calendar'],
      'finance': ['budget', 'payment', 'invoice', 'financial'],
      'technical': ['code', 'bug', 'feature', 'development'],
      'personal': ['personal', 'family', 'vacation', 'weekend']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Merge new topics with existing, keeping top 10
   */
  private mergeTopics(existing: string[], newTopics: string[]): string[] {
    const merged = [...new Set([...existing, ...newTopics])];
    return merged.slice(0, 10); // Keep top 10 topics
  }

  /**
   * Calculate relationship strength (0-1)
   */
  private calculateRelationshipStrength(relationship: RelationshipData): number {
    let strength = 0;

    // Base strength from interaction count
    const totalInteractions = relationship.totalEmailsSent + relationship.totalEmailsReceived;
    strength += Math.min(totalInteractions / 100, 0.3); // Max 0.3 from volume

    // Strength from balance (not too one-sided)
    if (totalInteractions > 0) {
      const balance = Math.min(
        relationship.totalEmailsSent,
        relationship.totalEmailsReceived
      ) / Math.max(relationship.totalEmailsSent, relationship.totalEmailsReceived);
      strength += balance * 0.2; // Max 0.2 from balance
    }

    // Strength from response time (faster = stronger)
    if (relationship.averageResponseTimeMinutes) {
      const responseScore = Math.max(0, 1 - relationship.averageResponseTimeMinutes / (24 * 60));
      strength += responseScore * 0.15; // Max 0.15 from responsiveness
    }

    // Strength from sentiment
    const sentimentScores: Record<string, number> = {
      very_positive: 0.2,
      positive: 0.15,
      neutral: 0.1,
      negative: 0.05,
      very_negative: 0
    };
    strength += sentimentScores[relationship.sentiment] || 0.1;

    // Strength from recency
    if (relationship.lastInteractionAt) {
      const daysSinceLastInteraction =
        (Date.now() - relationship.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - daysSinceLastInteraction / 90); // 90 days decay
      strength += recencyScore * 0.15; // Max 0.15 from recency
    }

    // VIP boost
    if (relationship.vipStatus) {
      strength += 0.1;
    }

    return Math.min(Math.max(strength, 0), 1); // Clamp 0-1
  }

  /**
   * Determine interaction frequency
   */
  private determineFrequency(
    relationship: RelationshipData
  ): RelationshipData['interactionFrequency'] {
    if (!relationship.lastInteractionAt) return 'rare';

    const totalInteractions = relationship.totalEmailsSent + relationship.totalEmailsReceived;
    const daysSinceStart =
      (Date.now() - relationship.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceStart === 0) return 'rare';

    const interactionsPerDay = totalInteractions / daysSinceStart;

    if (interactionsPerDay >= 0.8) return 'daily';
    if (interactionsPerDay >= 0.2) return 'weekly';
    if (interactionsPerDay >= 0.07) return 'monthly';
    if (interactionsPerDay >= 0.02) return 'occasional';
    return 'rare';
  }

  /**
   * Save relationship to database
   */
  private async saveRelationship(relationship: RelationshipData): Promise<void> {
    // Build intelligence JSONB from relationship data
    const intelligence: ContactIntelligence = {
      strength: relationship.relationshipStrength,
      frequency: relationship.interactionFrequency,
      vip: relationship.vipStatus,
      sentiment: relationship.sentiment,
      topics: relationship.topics,
      stats: {
        emails_sent: relationship.totalEmailsSent,
        emails_received: relationship.totalEmailsReceived,
        avg_response_time_minutes: relationship.averageResponseTimeMinutes || null,
      },
      last_interaction_at: relationship.lastInteractionAt?.toISOString() || null,
    };

    await this.db
      .from('contacts')
      .upsert({
        user_id: relationship.userId,
        email: relationship.contactEmail,
        name: relationship.contactName,
        intelligence,
        notes: relationship.notes,
        metadata: relationship.metadata,
      }, {
        onConflict: 'user_id,email',
      });
  }

  /**
   * Mark contact as VIP
   */
  async markAsVIP(userId: UserId, contactEmail: string): Promise<void> {
    // Get current contact to preserve intelligence data
    const { data: contact } = await this.db
      .from('contacts')
      .select('intelligence')
      .eq('user_id', userId)
      .eq('email', contactEmail)
      .single();

    if (contact) {
      const intelligence = contact.intelligence as ContactIntelligence;
      intelligence.vip = true;

      await this.db
        .from('contacts')
        .update({ intelligence })
        .eq('user_id', userId)
        .eq('email', contactEmail);

      logger.info({ userId, contactEmail }, 'Contact marked as VIP');
    }
  }

  /**
   * Get all VIP contacts
   */
  async getVIPContacts(userId: UserId): Promise<RelationshipData[]> {
    const { data } = await this.db
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('intelligence->>vip', 'true');

    return data?.map(d => this.mapDBToRelationship(d)) || [];
  }

  /**
   * Get top relationships by strength
   */
  async getTopRelationships(userId: UserId, limit: number = 10): Promise<RelationshipData[]> {
    const { data } = await this.db
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('(intelligence->>strength)::float', { ascending: false })
      .limit(limit);

    return data?.map(d => this.mapDBToRelationship(d)) || [];
  }

  /**
   * Get VIP score for a contact
   */
  async getVIPScore(userId: UserId, contactEmail: string): Promise<VIPScore | null> {
    const relationship = await this.getRelationship(userId, contactEmail);
    if (!relationship) return null;

    return await vipDetector.detectVIP(relationship);
  }

  /**
   * Get VIP recommendations (contacts that should be VIPs but aren't)
   */
  async getVIPRecommendations(userId: UserId, limit: number = 10): Promise<Array<RelationshipData & { vipScore: VIPScore }>> {
    // Get all non-VIP contacts
    const { data } = await this.db
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('intelligence->>vip', 'false')
      .order('(intelligence->>strength)::float', { ascending: false })
      .limit(50); // Check top 50 non-VIPs

    if (!data) return [];

    const relationships = data.map(d => this.mapDBToRelationship(d));

    // Detect VIP scores for all
    const vipScores = await vipDetector.detectBulkVIPs(relationships);

    // Filter to those with VIP potential
    const recommendations = relationships
      .map(rel => ({
        ...rel,
        vipScore: vipScores.get(rel.contactEmail)!
      }))
      .filter(r => r.vipScore.score >= 70) // VIP threshold
      .sort((a, b) => b.vipScore.score - a.vipScore.score)
      .slice(0, limit);

    logger.info({
      userId,
      count: recommendations.length
    }, 'VIP recommendations generated');

    return recommendations;
  }

  /**
   * Bulk update VIP status for user's contacts
   * Scans all contacts and automatically detects VIPs
   */
  async bulkUpdateVIPStatus(userId: UserId): Promise<{
    scanned: number;
    newVIPs: number;
    updated: string[];
  }> {
    logger.info({ userId }, 'Starting bulk VIP detection');

    // Get all non-VIP contacts
    const { data } = await this.db
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('intelligence->>vip', 'false');

    if (!data || data.length === 0) {
      return { scanned: 0, newVIPs: 0, updated: [] };
    }

    const relationships = data.map(d => this.mapDBToRelationship(d));

    // Detect VIPs
    const vipScores = await vipDetector.detectBulkVIPs(relationships);

    // Update VIP status for contacts that qualify
    const newVIPs: string[] = [];

    for (const relationship of relationships) {
      const score = vipScores.get(relationship.contactEmail);

      if (score && score.isVIP) {
        // Get current contact intelligence to preserve other fields
        const { data: contact } = await this.db
          .from('contacts')
          .select('intelligence, metadata')
          .eq('user_id', userId)
          .eq('email', relationship.contactEmail)
          .single();

        if (contact) {
          const intelligence = contact.intelligence as ContactIntelligence;
          intelligence.vip = true;

          await this.db
            .from('contacts')
            .update({
              intelligence,
              metadata: {
                ...contact.metadata,
                vipDetectedAt: new Date().toISOString(),
                vipScore: score.score,
                vipReasons: score.reasons,
              }
            })
            .eq('user_id', userId)
            .eq('email', relationship.contactEmail);

          newVIPs.push(relationship.contactEmail);
        }
      }
    }

    logger.info({
      userId,
      scanned: relationships.length,
      newVIPs: newVIPs.length
    }, 'Bulk VIP detection complete');

    return {
      scanned: relationships.length,
      newVIPs: newVIPs.length,
      updated: newVIPs,
    };
  }

  /**
   * Extract primary contact from interaction
   */
  private extractPrimaryContact(interaction: EmailInteraction, userId: UserId): string {
    // If user is sender, primary contact is first recipient
    if (interaction.from.includes(userId as string)) {
      return interaction.to[0];
    }
    // If user is recipient, primary contact is sender
    return interaction.from;
  }

  /**
   * Extract contact name from interaction
   */
  private extractContactName(interaction: EmailInteraction): string | undefined {
    // Try to extract name from "Name <email>" format
    const match = interaction.from.match(/^([^<]+)<([^>]+)>$/);
    if (match) {
      return match[1].trim();
    }
    return undefined;
  }

  /**
   * Map database record to RelationshipData
   */
  private mapDBToRelationship(data: any): RelationshipData {
    const intelligence = data.intelligence as ContactIntelligence;

    return {
      id: data.id,
      userId: data.user_id,
      contactEmail: data.email,
      contactName: data.name,
      relationshipStrength: intelligence.strength,
      interactionFrequency: intelligence.frequency,
      lastInteractionAt: intelligence.last_interaction_at ? new Date(intelligence.last_interaction_at) : undefined,
      totalEmailsSent: intelligence.stats.emails_sent,
      totalEmailsReceived: intelligence.stats.emails_received,
      averageResponseTimeMinutes: intelligence.stats.avg_response_time_minutes || undefined,
      topics: intelligence.topics || [],
      sentiment: intelligence.sentiment,
      vipStatus: intelligence.vip,
      notes: data.notes,
      metadata: data.metadata || {}
    };
  }
}
