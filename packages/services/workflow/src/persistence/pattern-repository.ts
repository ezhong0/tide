import { Pool } from 'pg';
import { logger } from '@tide/logger';
import { UserId } from '@tide/types';
import {
  DetectedPattern,
  PatternId,
  UserBehavior,
  AutomationSuggestion,
  PatternStatus,
  TemporalPattern,
  SequentialPattern,
} from '../types/pattern.types';

/**
 * Pattern Repository
 *
 * Handles persistence of user behaviors, detected patterns, and automation suggestions
 */
export class PatternRepository {
  constructor(private pool: Pool) {}

  /**
   * Record user behavior
   */
  async recordBehavior(behavior: UserBehavior): Promise<void> {
    const query = `
      INSERT INTO tide.user_behaviors (
        id, user_id, action, day_of_week, hour, time_of_day,
        location, device, email_id, calendar_event_id, task_id,
        workflow_id, metadata, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const timestamp = behavior.timestamp || new Date();
    const dayOfWeek = timestamp.getDay();
    const hour = timestamp.getHours();
    const timeOfDay = this.getTimeOfDay(hour);

    const values = [
      this.generateId(),
      behavior.userId,
      behavior.action,
      dayOfWeek,
      hour,
      timeOfDay,
      behavior.location || null,
      behavior.device || null,
      behavior.emailId || null,
      behavior.calendarEventId || null,
      behavior.taskId || null,
      behavior.workflowId || null,
      JSON.stringify(behavior.metadata || {}),
      timestamp,
    ];

    try {
      await this.pool.query(query, values);
      logger.debug({ action: behavior.action }, 'Behavior recorded');
    } catch (error) {
      logger.error({ error, behavior }, 'Failed to record behavior');
      throw error;
    }
  }

  /**
   * Get user behaviors within time range
   */
  async getBehaviors(userId: UserId, days: number = 30): Promise<UserBehavior[]> {
    const query = `
      SELECT * FROM tide.user_behaviors
      WHERE user_id = $1
        AND timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY timestamp DESC
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToBehavior(row));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get behaviors');
      throw error;
    }
  }

  /**
   * Save detected pattern
   */
  async savePattern(pattern: DetectedPattern): Promise<void> {
    const query = `
      INSERT INTO tide.detected_patterns (
        id, user_id, type, subtype, pattern_data, confidence, frequency,
        value_estimate, description, suggestion, metadata, status,
        discovered_at, last_observed_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        confidence = EXCLUDED.confidence,
        frequency = EXCLUDED.frequency,
        value_estimate = EXCLUDED.value_estimate,
        last_observed_at = EXCLUDED.last_observed_at,
        updated_at = EXCLUDED.updated_at
    `;

    const values = [
      pattern.id,
      pattern.userId,
      pattern.type,
      pattern.subtype || null,
      JSON.stringify(pattern.patternData),
      pattern.confidence,
      pattern.frequency,
      pattern.value || null,
      pattern.description,
      pattern.suggestion,
      JSON.stringify(pattern.metadata || {}),
      pattern.status || 'detected',
      pattern.discoveredAt || new Date(),
      pattern.lastObservedAt || new Date(),
      new Date(),
    ];

    try {
      await this.pool.query(query, values);
      logger.info({ patternId: pattern.id, type: pattern.type }, 'Pattern saved');
    } catch (error) {
      logger.error({ error, patternId: pattern.id }, 'Failed to save pattern');
      throw error;
    }
  }

  /**
   * Get patterns for user
   */
  async getPatternsByUser(userId: UserId, status?: PatternStatus): Promise<DetectedPattern[]> {
    let query = `
      SELECT * FROM tide.detected_patterns
      WHERE user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY confidence DESC, frequency DESC`;

    try {
      const result = await this.pool.query(query, params);
      return result.rows.map(row => this.mapRowToPattern(row));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get patterns');
      throw error;
    }
  }

  /**
   * Update pattern status
   */
  async updatePatternStatus(patternId: PatternId, status: PatternStatus): Promise<void> {
    const query = `
      UPDATE tide.detected_patterns
      SET status = $2, updated_at = NOW()
      WHERE id = $1
    `;

    try {
      await this.pool.query(query, [patternId, status]);
      logger.info({ patternId, status }, 'Pattern status updated');
    } catch (error) {
      logger.error({ error, patternId }, 'Failed to update pattern status');
      throw error;
    }
  }

  /**
   * Save automation suggestion
   */
  async saveSuggestion(suggestion: AutomationSuggestion): Promise<void> {
    const query = `
      INSERT INTO tide.automation_suggestions (
        id, pattern_id, user_id, name, description, category,
        confidence, expected_value, workflow_definition, risk_level,
        status, suggested_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    const values = [
      suggestion.id,
      suggestion.patternId,
      suggestion.userId,
      suggestion.name,
      suggestion.description,
      suggestion.category,
      suggestion.confidence,
      JSON.stringify(suggestion.expectedValue),
      JSON.stringify(suggestion.workflowDefinition),
      suggestion.riskLevel,
      suggestion.status || 'suggested',
      new Date(),
      JSON.stringify(suggestion.metadata || {}),
    ];

    try {
      await this.pool.query(query, values);
      logger.info({ suggestionId: suggestion.id }, 'Automation suggestion saved');
    } catch (error) {
      logger.error({ error, suggestionId: suggestion.id }, 'Failed to save suggestion');
      throw error;
    }
  }

  /**
   * Get suggestions for user
   */
  async getSuggestionsByUser(userId: UserId, status?: string): Promise<AutomationSuggestion[]> {
    let query = `
      SELECT * FROM tide.automation_suggestions
      WHERE user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY suggested_at DESC`;

    try {
      const result = await this.pool.query(query, params);
      return result.rows.map(row => this.mapRowToSuggestion(row));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get suggestions');
      throw error;
    }
  }

  /**
   * Record pattern sequence
   */
  async recordSequence(userId: UserId, actions: string[], signature: string): Promise<void> {
    const query = `
      INSERT INTO tide.pattern_sequences (
        id, user_id, actions, signature, count, first_seen_at, last_seen_at
      ) VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
      ON CONFLICT (user_id, signature) DO UPDATE SET
        count = pattern_sequences.count + 1,
        last_seen_at = NOW()
    `;

    const values = [
      this.generateId(),
      userId,
      actions,
      signature,
    ];

    try {
      await this.pool.query(query, values);
      logger.debug({ signature }, 'Sequence recorded');
    } catch (error) {
      logger.error({ error, signature }, 'Failed to record sequence');
      throw error;
    }
  }

  /**
   * Get frequent sequences
   */
  async getFrequentSequences(userId: UserId, minCount: number = 3): Promise<any[]> {
    const query = `
      SELECT * FROM tide.pattern_sequences
      WHERE user_id = $1 AND count >= $2
      ORDER BY count DESC, consistency DESC
      LIMIT 100
    `;

    try {
      const result = await this.pool.query(query, [userId, minCount]);
      return result.rows.map(row => ({
        actions: row.actions,
        signature: row.signature,
        count: row.count,
        avgDuration: row.avg_duration_ms,
        consistency: row.consistency ? parseFloat(row.consistency) : undefined,
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get frequent sequences');
      throw error;
    }
  }

  /**
   * Map database row to UserBehavior
   */
  private mapRowToBehavior(row: any): UserBehavior {
    return {
      userId: row.user_id as UserId,
      action: row.action,
      timestamp: new Date(row.timestamp),
      location: row.location,
      device: row.device,
      emailId: row.email_id,
      calendarEventId: row.calendar_event_id,
      taskId: row.task_id,
      workflowId: row.workflow_id,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }

  /**
   * Map database row to DetectedPattern
   */
  private mapRowToPattern(row: any): DetectedPattern {
    return {
      id: row.id as PatternId,
      userId: row.user_id as UserId,
      type: row.type,
      subtype: row.subtype,
      patternData: typeof row.pattern_data === 'string' ? JSON.parse(row.pattern_data) : row.pattern_data,
      confidence: parseFloat(row.confidence),
      frequency: row.frequency,
      value: row.value_estimate,
      description: row.description,
      suggestion: row.suggestion,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      status: row.status as PatternStatus,
      discoveredAt: new Date(row.discovered_at),
      lastObservedAt: new Date(row.last_observed_at),
    };
  }

  /**
   * Map database row to AutomationSuggestion
   */
  private mapRowToSuggestion(row: any): AutomationSuggestion {
    return {
      id: row.id,
      patternId: row.pattern_id as PatternId,
      userId: row.user_id as UserId,
      name: row.name,
      description: row.description,
      category: row.category,
      confidence: parseFloat(row.confidence),
      expectedValue: typeof row.expected_value === 'string' ? JSON.parse(row.expected_value) : row.expected_value,
      workflowDefinition: typeof row.workflow_definition === 'string' ? JSON.parse(row.workflow_definition) : row.workflow_definition,
      riskLevel: row.risk_level,
      status: row.status,
      suggestedAt: new Date(row.suggested_at),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }

  /**
   * Determine time of day from hour
   */
  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Generate UUID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
