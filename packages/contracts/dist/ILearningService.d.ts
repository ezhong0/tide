/**
 * Learning Service Contract
 * Learns from user behavior and improves over time
 *
 * Performance Requirements:
 * - Record observation: <50ms
 * - Pattern detection: <200ms
 * - Prediction: <100ms
 */
import { Result, UUID, UserId, Timestamp } from '@tide/types';
import { Pattern, Experience, LearnedPreference } from '@tide/types';
export interface ILearningService {
    /**
     * Record a user behavior observation
     * @param userId User identifier
     * @param observation Behavior observation
     * @returns Observation ID
     * @performance <50ms
     */
    recordObservation(userId: UserId, observation: BehaviorObservation): Promise<Result<string>>;
    /**
     * Batch record observations
     * @param userId User identifier
     * @param observations Array of observations
     * @returns Array of observation IDs
     * @performance <100ms for 10 observations
     */
    recordObservationBatch(userId: UserId, observations: BehaviorObservation[]): Promise<Result<string[]>>;
    /**
     * Detect patterns from observations
     * @param userId User identifier
     * @param minConfidence Minimum confidence threshold
     * @returns Detected patterns
     * @performance <200ms
     */
    detectPatterns(userId: UserId, minConfidence?: number): Promise<Result<Pattern[]>>;
    /**
     * Get learned patterns
     * @param userId User identifier
     * @param category Optional category filter
     * @returns Array of patterns
     * @performance <50ms
     */
    getPatterns(userId: UserId, category?: string): Promise<Result<Pattern[]>>;
    /**
     * Update pattern confidence based on feedback
     * @param patternId Pattern identifier
     * @param feedback Positive or negative
     * @returns Updated pattern
     * @performance <30ms
     */
    updatePatternConfidence(patternId: UUID, feedback: 'positive' | 'negative'): Promise<Result<Pattern>>;
    /**
     * Predict next action based on context
     * @param userId User identifier
     * @param context Current context
     * @returns Predicted actions with confidence
     * @performance <100ms
     */
    predictNextAction(userId: UserId, context: PredictionContext): Promise<Result<Prediction[]>>;
    /**
     * Predict user preferences
     * @param userId User identifier
     * @param category Preference category
     * @returns Predicted preferences
     * @performance <100ms
     */
    predictPreferences(userId: UserId, category: string): Promise<Result<PreferencePrediction[]>>;
    /**
     * Learn from user feedback
     * @param userId User identifier
     * @param feedback Feedback on system action
     * @returns Learning result
     * @performance <100ms
     */
    learnFromFeedback(userId: UserId, feedback: UserFeedback): Promise<Result<LearningResult>>;
    /**
     * Store an experience for episodic learning
     * @param userId User identifier
     * @param experience Experience to store
     * @returns Experience ID
     * @performance <50ms
     */
    storeExperience(userId: UserId, experience: Experience): Promise<Result<string>>;
    /**
     * Retrieve similar experiences
     * @param userId User identifier
     * @param query Query context
     * @param limit Maximum results
     * @returns Similar experiences
     * @performance <100ms
     */
    findSimilarExperiences(userId: UserId, query: string, limit?: number): Promise<Result<Experience[]>>;
    /**
     * Get learned preferences
     * @param userId User identifier
     * @returns Array of learned preferences
     * @performance <50ms
     */
    getLearnedPreferences(userId: UserId): Promise<Result<LearnedPreference[]>>;
    /**
     * Apply learned preference
     * @param preferenceId Preference to apply
     * @returns Application result
     * @performance <50ms
     */
    applyPreference(preferenceId: UUID): Promise<Result<PreferenceApplication>>;
    /**
     * Get learning statistics
     * @param userId User identifier
     * @returns Learning statistics
     * @performance <100ms
     */
    getStatistics(userId: UserId): Promise<Result<LearningStatistics>>;
    /**
     * Get improvement suggestions
     * @param userId User identifier
     * @returns Improvement suggestions
     * @performance <200ms
     */
    getImprovementSuggestions(userId: UserId): Promise<Result<ImprovementSuggestion[]>>;
    /**
     * Train model with examples
     * @param userId User identifier
     * @param examples Training examples
     * @returns Training result
     * @performance Async operation
     */
    train(userId: UserId, examples: TrainingExample[]): Promise<Result<TrainingResult>>;
    /**
     * Evaluate model performance
     * @param userId User identifier
     * @param testSet Test examples
     * @returns Evaluation metrics
     * @performance <500ms
     */
    evaluate(userId: UserId, testSet: TrainingExample[]): Promise<Result<EvaluationMetrics>>;
    /**
     * Reset learning for category
     * @param userId User identifier
     * @param category Category to reset
     * @returns Success status
     * @performance <100ms
     */
    resetCategory(userId: UserId, category: string): Promise<Result<void>>;
    /**
     * Export learning data
     * @param userId User identifier
     * @returns Exported learning data
     * @performance <500ms
     */
    exportLearning(userId: UserId): Promise<Result<LearningExport>>;
    /**
     * Import learning data
     * @param userId User identifier
     * @param data Learning data to import
     * @returns Import result
     * @performance <1000ms
     */
    importLearning(userId: UserId, data: LearningExport): Promise<Result<ImportResult>>;
    /**
     * Get personalization profile
     * @param userId User identifier
     * @returns Personalization profile
     * @performance <100ms
     */
    getPersonalizationProfile(userId: UserId): Promise<Result<PersonalizationProfile>>;
    /**
     * Optimize learning model
     * @param userId User identifier
     * @returns Optimization result
     * @performance Async operation
     */
    optimizeModel(userId: UserId): Promise<Result<OptimizationResult>>;
    /**
     * Get anomaly detections
     * @param userId User identifier
     * @param timeRange Time range to check
     * @returns Detected anomalies
     * @performance <200ms
     */
    detectAnomalies(userId: UserId, timeRange: TimeRange): Promise<Result<Anomaly[]>>;
    /**
     * Subscribe to learning events
     * @param userId User identifier
     * @param event Event type
     * @param handler Event handler
     * @returns Unsubscribe function
     * @performance Real-time
     */
    subscribe(userId: UserId, event: LearningEvent, handler: LearningEventHandler): Result<() => void>;
}
export interface BehaviorObservation {
    type: string;
    action: string;
    context: Record<string, unknown>;
    timestamp: Timestamp;
    outcome?: 'success' | 'failure' | 'neutral';
}
export interface PredictionContext {
    currentTime: Timestamp;
    location?: string;
    recentActions: string[];
    activeApplication?: string;
    deviceType?: string;
    metadata?: Record<string, unknown>;
}
export interface Prediction {
    action: string;
    confidence: number;
    reasoning: string;
    alternatives?: string[];
}
export interface PreferencePrediction {
    preference: string;
    value: unknown;
    confidence: number;
    evidence: string[];
}
export interface UserFeedback {
    targetId: string;
    targetType: 'action' | 'suggestion' | 'prediction';
    rating: 'positive' | 'negative' | 'neutral';
    correct: boolean;
    helpful: boolean;
    comment?: string;
}
export interface LearningResult {
    patternsUpdated: number;
    preferencesLearned: number;
    confidenceChange: number;
    newInsights: string[];
}
export interface PreferenceApplication {
    applied: boolean;
    changes: Record<string, unknown>;
    impact: string[];
}
export interface LearningStatistics {
    totalObservations: number;
    patternsDetected: number;
    averageConfidence: number;
    accuracyRate: number;
    learningRate: number;
    topPatterns: Pattern[];
    recentImprovements: Improvement[];
}
export interface Improvement {
    area: string;
    beforeScore: number;
    afterScore: number;
    change: number;
    timestamp: Timestamp;
}
export interface ImprovementSuggestion {
    area: string;
    currentPerformance: number;
    potential: number;
    suggestion: string;
    estimatedImpact: string;
    requiredData: string[];
}
export interface TrainingExample {
    input: Record<string, unknown>;
    expectedOutput: unknown;
    weight?: number;
}
export interface TrainingResult {
    examplesTrained: number;
    modelAccuracy: number;
    lossReduction: number;
    trainingTime: number;
}
export interface EvaluationMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix?: number[][];
    errors: EvaluationError[];
}
export interface EvaluationError {
    example: TrainingExample;
    predicted: unknown;
    error: string;
}
export interface LearningExport {
    userId: UserId;
    version: string;
    exportedAt: Timestamp;
    patterns: Pattern[];
    experiences: Experience[];
    preferences: LearnedPreference[];
    statistics: LearningStatistics;
}
export interface ImportResult {
    patternsImported: number;
    experiencesImported: number;
    preferencesImported: number;
    conflicts: string[];
}
export interface PersonalizationProfile {
    userId: UserId;
    learningStyle: 'visual' | 'textual' | 'interactive';
    adaptationRate: number;
    preferredComplexity: 'simple' | 'moderate' | 'detailed';
    topCategories: string[];
    behaviorProfile: BehaviorProfile;
}
export interface BehaviorProfile {
    consistency: number;
    predictability: number;
    routines: Routine[];
    preferences: Record<string, unknown>;
}
export interface Routine {
    name: string;
    schedule: string;
    confidence: number;
    actions: string[];
}
export interface OptimizationResult {
    modelSizeBefore: number;
    modelSizeAfter: number;
    accuracyBefore: number;
    accuracyAfter: number;
    optimizationTime: number;
}
export interface Anomaly {
    type: 'behavior' | 'pattern' | 'preference';
    description: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: Timestamp;
    context: Record<string, unknown>;
}
export interface TimeRange {
    start: Timestamp;
    end: Timestamp;
}
export type LearningEvent = 'pattern-detected' | 'preference-learned' | 'anomaly-detected' | 'improvement-found';
export type LearningEventHandler = (event: {
    type: LearningEvent;
    data: unknown;
    timestamp: Timestamp;
}) => void;
//# sourceMappingURL=ILearningService.d.ts.map