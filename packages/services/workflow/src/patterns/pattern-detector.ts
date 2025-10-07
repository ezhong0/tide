import { logger } from '@tide/logger';
import { UserId } from '@tide/types';
import {
  DetectedPattern,
  UserBehavior,
  TemporalPattern,
  SequentialPattern,
  PatternType,
} from '../types/pattern.types.js';
import { PatternRepository } from '../persistence/pattern-repository.js';

/**
 * Pattern Detector
 *
 * Detects behavioral patterns from user actions
 * Supports temporal, sequential, conditional, and collaborative patterns
 */
export class PatternDetector {
  constructor(
    private repository: PatternRepository,
    private analyzer: BehaviorAnalyzer
  ) {}

  /**
   * Detect patterns for a user
   */
  async detectPatterns(userId: UserId, days: number = 30): Promise<DetectedPattern[]> {
    // Collect user behaviors
    const behaviors = await this.repository.getBehaviors(userId, days);

    if (behaviors.length < 3) {
      logger.info({ userId }, 'Not enough behaviors to detect patterns');
      return [];
    }

    // Detect different pattern types in parallel
    const [temporal, sequential] = await Promise.all([
      this.detectTemporalPatterns(behaviors, userId),
      this.detectSequentialPatterns(behaviors, userId),
    ]);

    // Combine all patterns
    const allPatterns = [...temporal, ...sequential];

    // Filter by confidence and frequency
    const validPatterns = allPatterns
      .filter(p => p.confidence > 0.7 && p.frequency >= 3)
      .sort((a, b) => b.value - a.value);

    // Save detected patterns
    for (const pattern of validPatterns) {
      await this.repository.savePattern(pattern);
    }

    logger.info(
      { userId, patternCount: validPatterns.length },
      'Patterns detected'
    );

    return validPatterns;
  }

  /**
   * Detect temporal patterns (time-based)
   */
  private async detectTemporalPatterns(
    behaviors: UserBehavior[],
    userId: UserId
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    // Group behaviors by time patterns
    const timeGroups = this.groupByTime(behaviors);

    // Find daily patterns
    const dailyPatterns = this.findDailyPatterns(timeGroups);
    for (const pattern of dailyPatterns) {
      patterns.push({
        id: this.generateId() as any,
        userId,
        type: 'temporal',
        subtype: 'daily',
        patternData: pattern,
        confidence: pattern.consistency,
        frequency: pattern.count,
        value: this.calculateValue(pattern),
        description: pattern.description,
        suggestion: `Automate ${pattern.description} at ${pattern.time}`,
        status: 'detected',
        discoveredAt: new Date(),
        lastObservedAt: new Date(),
      });
    }

    // Find weekly patterns
    const weeklyPatterns = this.findWeeklyPatterns(timeGroups);
    for (const pattern of weeklyPatterns) {
      patterns.push({
        id: this.generateId() as any,
        userId,
        type: 'temporal',
        subtype: 'weekly',
        patternData: pattern,
        confidence: pattern.consistency,
        frequency: pattern.count,
        value: this.calculateValue(pattern),
        description: pattern.description,
        suggestion: `Automate ${pattern.description} every ${this.getDayName(pattern.day)}`,
        status: 'detected',
        discoveredAt: new Date(),
        lastObservedAt: new Date(),
      });
    }

    return patterns;
  }

  /**
   * Detect sequential patterns (action sequences)
   */
  private async detectSequentialPatterns(
    behaviors: UserBehavior[],
    userId: UserId
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    // Find action sequences
    const sequences = await this.findSequences(behaviors);

    for (const seq of sequences) {
      if (seq.count >= 3) {
        const signature = this.getSequenceSignature(seq.actions);

        // Record sequence in database for tracking
        await this.repository.recordSequence(userId, seq.actions, signature);

        patterns.push({
          id: this.generateId() as any,
          userId,
          type: 'sequential',
          subtype: 'workflow',
          patternData: seq,
          confidence: seq.consistency || 0.8,
          frequency: seq.count,
          value: seq.timeSaved || 0,
          description: seq.description,
          suggestion: `Create workflow: ${seq.description}`,
          status: 'detected',
          discoveredAt: new Date(),
          lastObservedAt: new Date(),
        });
      }
    }

    return patterns;
  }

  /**
   * Group behaviors by time
   */
  private groupByTime(behaviors: UserBehavior[]): Map<string, UserBehavior[]> {
    const groups = new Map<string, UserBehavior[]>();

    for (const behavior of behaviors) {
      const hour = behavior.timestamp.getHours();
      const dayOfWeek = behavior.timestamp.getDay();
      const key = `${dayOfWeek}-${hour}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(behavior);
    }

    return groups;
  }

  /**
   * Find daily patterns (same time every day)
   */
  private findDailyPatterns(timeGroups: Map<string, UserBehavior[]>): any[] {
    const patterns: any[] = [];
    const actionCounts = new Map<string, Map<string, number>>();

    // Count actions per hour across all days
    for (const [key, behaviors] of timeGroups.entries()) {
      const hour = key.split('-')[1];

      for (const behavior of behaviors) {
        if (!actionCounts.has(hour)) {
          actionCounts.set(hour, new Map());
        }

        const hourMap = actionCounts.get(hour)!;
        const count = hourMap.get(behavior.action) || 0;
        hourMap.set(behavior.action, count + 1);
      }
    }

    // Find patterns with high frequency
    for (const [hour, actions] of actionCounts.entries()) {
      for (const [action, count] of actions.entries()) {
        if (count >= 5) {
          // Seen at least 5 times
          patterns.push({
            time: `${hour}:00`,
            action,
            count,
            consistency: Math.min(count / 30, 1.0), // Assume 30 days of data
            description: `${action} at ${hour}:00`,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Find weekly patterns (same day/time each week)
   */
  private findWeeklyPatterns(timeGroups: Map<string, UserBehavior[]>): any[] {
    const patterns: any[] = [];
    const actionCounts = new Map<string, Map<string, number>>();

    // Count actions per day/hour combination
    for (const [key, behaviors] of timeGroups.entries()) {
      for (const behavior of behaviors) {
        if (!actionCounts.has(key)) {
          actionCounts.set(key, new Map());
        }

        const keyMap = actionCounts.get(key)!;
        const count = keyMap.get(behavior.action) || 0;
        keyMap.set(behavior.action, count + 1);
      }
    }

    // Find patterns with high frequency
    for (const [key, actions] of actionCounts.entries()) {
      const [day, hour] = key.split('-');

      for (const [action, count] of actions.entries()) {
        if (count >= 3) {
          // Seen at least 3 times
          patterns.push({
            day: parseInt(day),
            time: `${hour}:00`,
            action,
            count,
            consistency: Math.min(count / 4, 1.0), // Assume 4 weeks of data
            description: `${action} every ${this.getDayName(parseInt(day))} at ${hour}:00`,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Find action sequences
   */
  private async findSequences(behaviors: UserBehavior[]): Promise<any[]> {
    const sequences: any[] = [];
    const sequenceMap = new Map<string, any>();

    // Use sliding window to find patterns
    const windowSize = 5;

    for (let i = 0; i < behaviors.length - windowSize; i++) {
      const window = behaviors.slice(i, i + windowSize);

      // Get sequence signature
      const actions = window.map(b => b.action);
      const signature = this.getSequenceSignature(actions);

      if (sequenceMap.has(signature)) {
        const existing = sequenceMap.get(signature)!;
        existing.count++;
      } else {
        sequenceMap.set(signature, {
          actions,
          count: 1,
          description: this.describeSequence(actions),
          timeSaved: windowSize * 5, // Estimate 5 minutes per action
        });
      }
    }

    // Convert map to array
    for (const seq of sequenceMap.values()) {
      sequences.push(seq);
    }

    return sequences;
  }

  /**
   * Get sequence signature (hash)
   */
  private getSequenceSignature(actions: string[]): string {
    return actions.join('->');
  }

  /**
   * Describe sequence in natural language
   */
  private describeSequence(actions: string[]): string {
    if (actions.length === 0) return 'Empty sequence';
    if (actions.length === 1) return actions[0];

    return actions.join(' → ');
  }

  /**
   * Calculate pattern value (time saved in minutes)
   */
  private calculateValue(pattern: any): number {
    // Estimate time saved per occurrence
    const minutesPerOccurrence = 10; // Estimate
    return pattern.count * minutesPerOccurrence;
  }

  /**
   * Get day name
   */
  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
  }

  /**
   * Generate ID
   */
  private generateId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Behavior Analyzer
 *
 * Analyzes user behaviors to extract insights
 */
export class BehaviorAnalyzer {
  /**
   * Analyze user behaviors
   */
  async analyze(behaviors: UserBehavior[]): Promise<BehaviorAnalysis> {
    const actions = behaviors.map(b => b.action);

    return {
      totalBehaviors: behaviors.length,
      uniqueActions: new Set(actions).size,
      mostCommonAction: this.findMostCommon(actions),
      timeDistribution: this.analyzeTimeDistribution(behaviors),
      actionFrequency: this.calculateActionFrequency(behaviors),
    };
  }

  /**
   * Find most common action
   */
  private findMostCommon(actions: string[]): string {
    const counts = new Map<string, number>();

    for (const action of actions) {
      counts.set(action, (counts.get(action) || 0) + 1);
    }

    let maxCount = 0;
    let mostCommon = '';

    for (const [action, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = action;
      }
    }

    return mostCommon;
  }

  /**
   * Analyze time distribution
   */
  private analyzeTimeDistribution(behaviors: UserBehavior[]): TimeDistribution {
    const hourCounts = new Map<number, number>();

    for (const behavior of behaviors) {
      const hour = behavior.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    return {
      peakHour: this.findPeakHour(hourCounts),
      distribution: Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count })),
    };
  }

  /**
   * Find peak hour
   */
  private findPeakHour(hourCounts: Map<number, number>): number {
    let maxCount = 0;
    let peakHour = 0;

    for (const [hour, count] of hourCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    }

    return peakHour;
  }

  /**
   * Calculate action frequency
   */
  private calculateActionFrequency(behaviors: UserBehavior[]): Map<string, number> {
    const frequency = new Map<string, number>();

    for (const behavior of behaviors) {
      frequency.set(behavior.action, (frequency.get(behavior.action) || 0) + 1);
    }

    return frequency;
  }
}

// Types
export interface BehaviorAnalysis {
  totalBehaviors: number;
  uniqueActions: number;
  mostCommonAction: string;
  timeDistribution: TimeDistribution;
  actionFrequency: Map<string, number>;
}

export interface TimeDistribution {
  peakHour: number;
  distribution: Array<{ hour: number; count: number }>;
}
