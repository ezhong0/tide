/**
 * User Preference Model
 * Tracks and learns user preferences over time
 */

import { createLogger } from '@tide/logger';
import type {
  UserLearningModel,
  CommunicationStyle,
  SchedulingPreferences,
  DecisionPattern,
  RelationshipInsight,
} from '@tide/contracts';

const logger = createLogger({ component: 'UserPreferenceModel' });

export class UserPreferenceModel {
  private models = new Map<string, UserLearningModel>();

  /**
   * Get or create user model
   */
  async getUserModel(userId: string): Promise<UserLearningModel> {
    let model = this.models.get(userId);

    if (!model) {
      model = this.createDefaultModel(userId);
      this.models.set(userId, model);
    }

    return model;
  }

  /**
   * Update communication style
   */
  async updateCommunicationStyle(
    userId: string,
    style: Partial<CommunicationStyle>
  ): Promise<void> {
    const model = await this.getUserModel(userId);

    model.writingStyle = {
      ...model.writingStyle,
      ...style,
    };

    model.lastUpdated = Date.now();

    logger.debug('Communication style updated', { userId });
  }

  /**
   * Update scheduling preferences
   */
  async updateSchedulingPreferences(
    userId: string,
    prefs: Partial<SchedulingPreferences>
  ): Promise<void> {
    const model = await this.getUserModel(userId);

    model.schedulingPreferences = {
      ...model.schedulingPreferences,
      ...prefs,
    };

    model.lastUpdated = Date.now();

    logger.debug('Scheduling preferences updated', { userId });
  }

  /**
   * Add decision pattern
   */
  async addDecisionPattern(userId: string, pattern: DecisionPattern): Promise<void> {
    const model = await this.getUserModel(userId);

    // Check if pattern already exists
    const existing = model.decisionPatterns.find(p => p.category === pattern.category);

    if (existing) {
      // Merge historical choices
      existing.historicalChoices.push(...pattern.historicalChoices);
      existing.confidence = (existing.confidence + pattern.confidence) / 2;
    } else {
      model.decisionPatterns.push(pattern);
    }

    model.lastUpdated = Date.now();

    logger.debug('Decision pattern added', { userId, category: pattern.category });
  }

  /**
   * Update relationship insight
   */
  async updateRelationship(userId: string, insight: RelationshipInsight): Promise<void> {
    const model = await this.getUserModel(userId);

    const existing = model.relationships.find(r => r.contact === insight.contact);

    if (existing) {
      // Update existing relationship
      existing.importance = (existing.importance + insight.importance) / 2;
      existing.frequency = insight.frequency;
      existing.lastInteraction = insight.lastInteraction;
      existing.commonTopics = Array.from(
        new Set([...existing.commonTopics, ...insight.commonTopics])
      );
      existing.sentimentTrend = (existing.sentimentTrend + insight.sentimentTrend) / 2;
    } else {
      model.relationships.push(insight);
    }

    model.lastUpdated = Date.now();

    logger.debug('Relationship updated', { userId, contact: insight.contact });
  }

  /**
   * Get communication style
   */
  async getCommunicationStyle(userId: string): Promise<CommunicationStyle> {
    const model = await this.getUserModel(userId);
    return model.writingStyle;
  }

  /**
   * Get scheduling preferences
   */
  async getSchedulingPreferences(userId: string): Promise<SchedulingPreferences> {
    const model = await this.getUserModel(userId);
    return model.schedulingPreferences;
  }

  /**
   * Get decision patterns
   */
  async getDecisionPatterns(userId: string, category?: string): Promise<DecisionPattern[]> {
    const model = await this.getUserModel(userId);

    if (category) {
      return model.decisionPatterns.filter(p => p.category === category);
    }

    return model.decisionPatterns;
  }

  /**
   * Get relationship insights
   */
  async getRelationships(userId: string): Promise<RelationshipInsight[]> {
    const model = await this.getUserModel(userId);
    return model.relationships.sort((a, b) => b.importance - a.importance);
  }

  /**
   * Get top important contacts
   */
  async getTopContacts(userId: string, limit = 10): Promise<RelationshipInsight[]> {
    const relationships = await this.getRelationships(userId);
    return relationships.slice(0, limit);
  }

  /**
   * Create default user model
   */
  private createDefaultModel(userId: string): UserLearningModel {
    return {
      userId,
      writingStyle: {
        formality: 0.7,
        brevity: 0.6,
        technicality: 0.5,
        usesEmoji: false,
        preferredTone: 'professional',
      },
      schedulingPreferences: {
        preferredMeetingTimes: [],
        avoidedTimes: [],
        focusTimeBlocks: [],
        meetingLengthPreference: 30,
        bufferBetweenMeetings: 15,
        maxMeetingsPerDay: 8,
      },
      decisionPatterns: [],
      relationships: [],
      lastUpdated: Date.now(),
    };
  }

  /**
   * Export model (for persistence)
   */
  async exportModel(userId: string): Promise<UserLearningModel | null> {
    return this.models.get(userId) || null;
  }

  /**
   * Import model (from persistence)
   */
  async importModel(model: UserLearningModel): Promise<void> {
    this.models.set(model.userId, model);
    logger.info('User model imported', { userId: model.userId });
  }
}
