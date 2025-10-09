/**
 * AI Service Contracts
 * Type definitions for AI orchestration, multi-model routing, and agent swarm
 */
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'local';
export type ModelFamily = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'claude-3.5-opus' | 'claude-3.5-sonnet' | 'claude-3.5-haiku' | 'gemini-ultra' | 'gemini-pro' | 'gemini-flash' | 'llama-3.2-3b' | 'mistral-7b';
export interface ModelConfig {
    provider: ModelProvider;
    model: ModelFamily;
    cost: number;
    latency: number;
    accuracy: number;
    capabilities: string[];
    contextWindow: number;
    maxTokens: number;
}
export interface ModelSelection {
    primary: ModelFamily;
    validators?: ModelFamily[];
    aggregation?: 'single' | 'weighted_vote' | 'unanimous';
    reasoning: string;
}
export interface RequestFactors {
    criticality: number;
    sensitivity: number;
    urgency: number;
    complexity: number;
    expectedTokens: number;
    requiresReasoning: boolean;
}
export type AgentType = 'email.triager' | 'email.composer' | 'email.analyzer' | 'email.relationship' | 'calendar.scheduler' | 'calendar.prep' | 'calendar.optimizer' | 'task.orchestrator' | 'task.prioritizer' | 'task.automator' | 'intel.pattern' | 'intel.context' | 'intel.predictor' | 'decision.analyzer' | 'decision.recommender' | 'meta.coordinator' | 'meta.quality' | 'meta.explainer';
export interface AgentConfig {
    type: AgentType;
    name: string;
    description: string;
    capabilities: string[];
    defaultModel: ModelFamily;
    priority: number;
    enabled: boolean;
}
export interface AgentTask {
    agentType: AgentType;
    input: any;
    context: AIContext;
    dependencies?: string[];
    critical: boolean;
}
export interface AgentResult {
    agentType: AgentType;
    output: any;
    confidence: number;
    executionTime: number;
    tokensUsed: number;
    model: ModelFamily;
    reasoning?: string;
    error?: string;
}
export type IntentCategory = 'email_triage' | 'email_compose' | 'email_reply' | 'calendar_schedule' | 'calendar_optimize' | 'task_create' | 'task_prioritize' | 'workflow_execute' | 'question_answer' | 'decision_support' | 'learning';
export interface Intent {
    category: IntentCategory;
    action: string;
    confidence: number;
    entities: EntityExtraction[];
    subIntents?: Intent[];
}
export interface EntityExtraction {
    type: EntityType;
    value: string;
    confidence: number;
    span: [number, number];
    normalized?: string;
}
export type EntityType = 'person' | 'email' | 'date' | 'time' | 'duration' | 'location' | 'priority' | 'sentiment' | 'action_item' | 'commitment';
export interface AIRequest {
    userId: string;
    conversationId?: string;
    messageId?: string;
    content: string;
    context: AIContext;
    preferences?: UserAIPreferences;
    timestamp: number;
}
export interface AIContext {
    previousMessages?: ContextMessage[];
    userProfile?: UserContextProfile;
    recentEmails?: EmailContext[];
    upcomingEvents?: CalendarContext[];
    activeTasks?: TaskContext[];
    currentTime: number;
    timezone: string;
    userEmail?: string;
}
export interface ContextMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    intent?: Intent;
}
export interface UserContextProfile {
    id: string;
    name: string;
    email: string;
    role?: string;
    organization?: string;
    workingHours?: {
        start: number;
        end: number;
    };
    communicationStyle?: CommunicationStyle;
}
export interface CommunicationStyle {
    formality: number;
    brevity: number;
    technicality: number;
    usesEmoji: boolean;
    preferredTone: 'professional' | 'casual' | 'friendly' | 'direct';
}
export interface EmailContext {
    id: string;
    from: string;
    subject: string;
    priority: 'low' | 'normal' | 'high';
    timestamp: number;
    triaged: boolean;
}
export interface CalendarContext {
    id: string;
    title: string;
    start: number;
    end: number;
    attendees: number;
    type: 'meeting' | 'focus' | 'break';
}
export interface TaskContext {
    id: string;
    title: string;
    priority: 'low' | 'normal' | 'high';
    dueDate?: number;
    status: 'pending' | 'in_progress' | 'completed';
}
export interface UserAIPreferences {
    preferredModels?: ModelFamily[];
    privacyLevel: 'low' | 'medium' | 'high';
    costSensitivity: 'low' | 'medium' | 'high';
    speedPriority: 'low' | 'medium' | 'high';
    explainReasoning: boolean;
}
export interface AIResponse {
    requestId: string;
    content: string;
    intents: Intent[];
    suggestedActions: SuggestedAction[];
    confidence: number;
    reasoning?: ReasoningChain;
    executionTime: number;
    model: ModelSelection;
    tokensUsed: number;
    cost: number;
    timestamp: number;
    metadata?: Record<string, any>;
}
export interface SuggestedAction {
    id: string;
    type: 'email_send' | 'calendar_create' | 'task_create' | 'workflow_start';
    title: string;
    description: string;
    preview: string;
    confidence: number;
    payload: any;
    requiresConfirmation: boolean;
}
export interface ReasoningChain {
    steps: ReasoningStep[];
    finalConclusion: string;
    confidence: number;
    verified: boolean;
}
export interface ReasoningStep {
    step: number;
    description: string;
    input: any;
    output: any;
    reasoning: string;
    confidence: number;
    model: ModelFamily;
    verified: boolean;
    alternatives?: AlternativeReasoning[];
}
export interface AlternativeReasoning {
    description: string;
    confidence: number;
    chosen: boolean;
    reason: string;
}
export interface VerificationResult {
    valid: boolean;
    confidence: number;
    issues: VerificationIssue[];
    checks: VerificationCheck[];
}
export interface VerificationIssue {
    type: 'hallucination' | 'inconsistency' | 'incomplete' | 'unsafe';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
}
export interface VerificationCheck {
    name: string;
    passed: boolean;
    confidence: number;
    details?: string;
}
export interface Pattern {
    id: string;
    userId: string;
    type: 'temporal' | 'sequence' | 'contextual' | 'preference';
    trigger: PatternTrigger;
    action: PatternAction;
    confidence: number;
    frequency: number;
    lastOccurred: number;
    metadata: Record<string, any>;
}
export interface PatternTrigger {
    type: string;
    conditions: Record<string, any>;
    timeOfDay?: number;
    dayOfWeek?: number;
    contextKeys?: string[];
}
export interface PatternAction {
    type: string;
    params: Record<string, any>;
    expectedOutcome?: string;
}
export interface UserLearningModel {
    userId: string;
    writingStyle: CommunicationStyle;
    schedulingPreferences: SchedulingPreferences;
    decisionPatterns: DecisionPattern[];
    relationships: RelationshipInsight[];
    lastUpdated: number;
}
export interface SchedulingPreferences {
    preferredMeetingTimes: TimeSlot[];
    avoidedTimes: TimeSlot[];
    focusTimeBlocks: TimeSlot[];
    meetingLengthPreference: number;
    bufferBetweenMeetings: number;
    maxMeetingsPerDay: number;
}
export interface TimeSlot {
    dayOfWeek: number;
    startHour: number;
    endHour: number;
}
export interface DecisionPattern {
    category: string;
    commonFactors: string[];
    historicalChoices: HistoricalChoice[];
    confidence: number;
}
export interface HistoricalChoice {
    context: Record<string, any>;
    choice: string;
    outcome: 'positive' | 'negative' | 'neutral';
    timestamp: number;
}
export interface RelationshipInsight {
    contact: string;
    importance: number;
    frequency: number;
    lastInteraction: number;
    commonTopics: string[];
    sentimentTrend: number;
}
export interface Prediction {
    id: string;
    userId: string;
    action: string;
    confidence: number;
    timing: 'now' | '5_minutes' | '15_minutes' | '1_hour' | 'next_day';
    reason: string;
    data?: any;
    createdAt: number;
}
export interface AIMetrics {
    requestId: string;
    userId: string;
    intentAccuracy: number;
    responseTime: number;
    tokensUsed: number;
    cost: number;
    model: ModelFamily;
    cacheHit: boolean;
    hallucinationDetected: boolean;
    userSatisfaction?: number;
    timestamp: number;
}
export interface ModelMetrics {
    model: ModelFamily;
    totalRequests: number;
    averageLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    totalCost: number;
    averageAccuracy: number;
}
