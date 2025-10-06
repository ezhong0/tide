/**
 * Mock Personalization Engine (Module 00 - Day 3)
 * In-memory learning and preference management
 */

import { IPersonalizationEngine } from '@tide/contracts';
import {
  Result,
  ok,
  err,
  IInteraction,
  IUserPreferences,
  ILearnedPattern,
  ISuggestion,
  UserId,
  IConversationContext,
  Timestamp
} from '@tide/types';
import crypto from 'crypto';

export class MockPersonalizationEngine implements IPersonalizationEngine {
  private preferences: Map<UserId, IUserPreferences> = new Map();
  private patterns: Map<UserId, ILearnedPattern[]> = new Map();
  private interactions: Map<UserId, IInteraction[]> = new Map();

  /**
   * Learn from an interaction
   * @performance <50ms
   */
  async observeInteraction(interaction: IInteraction): Promise<Result<void>> {
    const userInteractions = this.interactions.get(interaction.userId) ?? [];
    userInteractions.push(interaction);
    this.interactions.set(interaction.userId, userInteractions);

    // Learn patterns from successful interactions
    if (interaction.outcome === 'success') {
      await this.learnFromInteraction(interaction);
    }

    return ok(undefined);
  }

  /**
   * Get user preferences
   * @performance <50ms
   */
  async getUserPreferences(userId: UserId): Promise<Result<IUserPreferences>> {
    const prefs = this.preferences.get(userId);

    if (!prefs) {
      // Return default preferences
      const defaultPrefs: IUserPreferences = {
        communicationStyle: 'concise',
        workingHours: {
          timezone: 'America/New_York',
          schedule: [
            { day: 'MO', isWorkingDay: true, start: '09:00', end: '17:00' },
            { day: 'TU', isWorkingDay: true, start: '09:00', end: '17:00' },
            { day: 'WE', isWorkingDay: true, start: '09:00', end: '17:00' },
            { day: 'TH', isWorkingDay: true, start: '09:00', end: '17:00' },
            { day: 'FR', isWorkingDay: true, start: '09:00', end: '17:00' },
            { day: 'SA', isWorkingDay: false },
            { day: 'SU', isWorkingDay: false }
          ]
        },
        notificationSettings: {
          enabled: true,
          channels: ['email', 'push'],
          priorities: ['high', 'urgent']
        }
      };

      this.preferences.set(userId, defaultPrefs);
      return ok(defaultPrefs);
    }

    return ok(prefs);
  }

  /**
   * Update user preferences
   * @performance <100ms
   */
  async updatePreferences(
    userId: UserId,
    preferences: Partial<IUserPreferences>
  ): Promise<Result<void>> {
    const currentPrefs = await this.getUserPreferences(userId);

    if (!currentPrefs.success) {
      return currentPrefs as Result<void>;
    }

    const updatedPrefs: IUserPreferences = {
      ...currentPrefs.data,
      ...preferences
    };

    this.preferences.set(userId, updatedPrefs);

    return ok(undefined);
  }

  /**
   * Get learned patterns for user
   * @performance <100ms
   */
  async getLearnedPatterns(
    userId: UserId,
    minConfidence = 0.5
  ): Promise<Result<ILearnedPattern[]>> {
    const userPatterns = this.patterns.get(userId) ?? [];

    const filtered = userPatterns.filter(p => p.confidence >= minConfidence);

    // Sort by confidence and usage
    filtered.sort((a, b) => {
      const scoreA = a.confidence * Math.log(a.usageCount + 1);
      const scoreB = b.confidence * Math.log(b.usageCount + 1);
      return scoreB - scoreA;
    });

    return ok(filtered);
  }

  /**
   * Personalize a response based on user preferences
   * @performance <100ms
   */
  async personalizeResponse(
    baseResponse: string,
    userId: UserId
  ): Promise<Result<string>> {
    const prefsResult = await this.getUserPreferences(userId);

    if (!prefsResult.success) {
      return ok(baseResponse); // Return base response if no preferences
    }

    const prefs = prefsResult.data;
    let personalized = baseResponse;

    // Apply communication style
    switch (prefs.communicationStyle) {
      case 'concise':
        // Make response more concise
        personalized = this.makeConcise(baseResponse);
        break;

      case 'detailed':
        // Keep detailed
        break;

      case 'bullet_points':
        // Convert to bullet points if long enough
        if (baseResponse.length > 50) {
          personalized = this.convertToBulletPoints(baseResponse);
        }
        break;
    }

    return ok(personalized);
  }

  /**
   * Get proactive suggestions based on patterns
   * @performance <200ms
   */
  async getProactiveSuggestions(
    userId: UserId,
    context: IConversationContext
  ): Promise<Result<ISuggestion[]>> {
    const suggestions: ISuggestion[] = [];
    const patternsResult = await this.getLearnedPatterns(userId, 0.7);

    if (!patternsResult.success) {
      return patternsResult as Result<ISuggestion[]>;
    }

    const patterns = patternsResult.data;

    // Generate suggestions based on patterns and context
    for (const pattern of patterns.slice(0, 3)) {
      // Top 3 patterns
      const suggestion = this.patternToSuggestion(pattern, context);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Add time-based suggestions
    const timeOfDay = new Date().getHours();
    if (timeOfDay >= 9 && timeOfDay < 12 && context.unreadEmails > 0) {
      suggestions.push({
        id: 'morning-email-check',
        text: 'Review unread emails',
        type: 'action',
        confidence: 0.8
      });
    }

    // Add context-based suggestions
    if (context.upcomingMeetings.length > 0) {
      const nextMeeting = context.upcomingMeetings[0];
      const timeUntil = nextMeeting.startTime - Date.now();
      const minutesUntil = Math.floor(timeUntil / 60000);

      if (minutesUntil > 0 && minutesUntil < 30) {
        suggestions.push({
          id: 'meeting-reminder',
          text: `You have "${nextMeeting.title}" in ${minutesUntil} minutes`,
          type: 'quick_reply',
          confidence: 0.95
        });
      }
    }

    return ok(suggestions);
  }

  /**
   * Check if action matches learned pattern
   * @performance <50ms
   */
  async matchesPattern(
    userId: UserId,
    actionType: string,
    params: Record<string, unknown>
  ): Promise<Result<number>> {
    const patternsResult = await this.getLearnedPatterns(userId, 0.5);

    if (!patternsResult.success) {
      return ok(0); // No patterns, no match
    }

    const patterns = patternsResult.data;

    // Find patterns matching this action type
    const matchingPatterns = patterns.filter(p =>
      p.pattern.includes(actionType)
    );

    if (matchingPatterns.length === 0) {
      return ok(0);
    }

    // Calculate match confidence based on params similarity
    let maxConfidence = 0;

    for (const pattern of matchingPatterns) {
      // Simple parameter matching
      let paramScore = 0;
      const exampleParams = pattern.examples[0]?.context;

      if (exampleParams) {
        const exampleKeys = Object.keys(JSON.parse(exampleParams));
        const currentKeys = Object.keys(params);

        const commonKeys = exampleKeys.filter(k => currentKeys.includes(k));
        paramScore = commonKeys.length / Math.max(exampleKeys.length, currentKeys.length);
      }

      const confidence = pattern.confidence * (0.8 + paramScore * 0.2);
      maxConfidence = Math.max(maxConfidence, confidence);
    }

    return ok(maxConfidence);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async learnFromInteraction(interaction: IInteraction): Promise<void> {
    const userPatterns = this.patterns.get(interaction.userId) ?? [];

    // Extract pattern from interaction
    const patternKey = this.extractPattern(interaction);

    // Find existing pattern or create new one
    let pattern = userPatterns.find(p => p.pattern === patternKey);

    if (pattern) {
      // Update existing pattern
      pattern.usageCount += 1;
      pattern.lastUsed = interaction.timestamp;
      pattern.confidence = Math.min(0.95, pattern.confidence + 0.05);

      // Add example if we don't have too many
      if (pattern.examples.length < 10) {
        pattern.examples.push({
          description: this.getInteractionDescription(interaction),
          timestamp: interaction.timestamp,
          context: JSON.stringify(interaction.data)
        });
      }
    } else {
      // Create new pattern
      pattern = {
        pattern: patternKey,
        confidence: 0.6,
        examples: [
          {
            description: this.getInteractionDescription(interaction),
            timestamp: interaction.timestamp,
            context: JSON.stringify(interaction.data)
          }
        ],
        firstSeen: interaction.timestamp,
        lastUsed: interaction.timestamp,
        usageCount: 1
      };

      userPatterns.push(pattern);
    }

    this.patterns.set(interaction.userId, userPatterns);
  }

  private extractPattern(interaction: IInteraction): string {
    // Extract pattern based on interaction type
    switch (interaction.type) {
      case 'message':
        return 'frequent_message';
      case 'action':
        return `action:${(interaction.data as { actionType?: string }).actionType ?? 'unknown'}`;
      case 'feedback':
        return 'provides_feedback';
      case 'preference_change':
        return 'updates_preferences';
      default:
        return 'unknown_pattern';
    }
  }

  private getInteractionDescription(interaction: IInteraction): string {
    switch (interaction.type) {
      case 'message':
        return 'Sent a message';
      case 'action':
        return `Performed action: ${(interaction.data as { actionType?: string }).actionType ?? 'unknown'}`;
      case 'feedback':
        return 'Provided feedback';
      case 'preference_change':
        return 'Updated preferences';
      default:
        return 'Interaction';
    }
  }

  private makeConcise(text: string): string {
    // Simple conciseness algorithm
    // Remove redundant phrases
    let concise = text
      .replace(/I would like to |I want to |I need to /g, '')
      .replace(/please |kindly /gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit sentences
    const sentences = concise.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 2) {
      concise = sentences.slice(0, 2).join('. ') + '.';
    }

    return concise;
  }

  private convertToBulletPoints(text: string): string {
    // Split by common delimiters and convert to bullets
    const parts = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (parts.length <= 1) {
      return text;
    }

    return parts.map(p => `• ${p}`).join('\n');
  }

  private patternToSuggestion(
    pattern: ILearnedPattern,
    context: IConversationContext
  ): ISuggestion | null {
    // Convert learned pattern to actionable suggestion
    if (pattern.pattern.startsWith('action:')) {
      const actionType = pattern.pattern.replace('action:', '');

      return {
        id: `pattern-${crypto.randomUUID()}`,
        text: `${actionType.replace(/_/g, ' ')}?`,
        type: 'action',
        confidence: pattern.confidence
      };
    }

    return null;
  }
}
