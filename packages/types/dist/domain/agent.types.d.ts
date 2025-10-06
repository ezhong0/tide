/**
 * Agent domain types for multi-agent reasoning system with ReAct pattern
 */
import { UUID, Timestamp, UserId, AgentId, SessionId } from '../base.types';
export type AgentRole = 'planner' | 'executor' | 'reviewer' | 'specialist';
export type AgentSpecialty = 'email' | 'calendar' | 'research' | 'analysis' | 'general';
export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'observing' | 'reflecting';
export type ReasoningPattern = 'react' | 'chain-of-thought' | 'tree-of-thought' | 'reflexion';
export type CapabilityLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';
export interface Agent {
    agentId: AgentId;
    name: string;
    role: AgentRole;
    specialty: AgentSpecialty;
    status: AgentStatus;
    capabilities: AgentCapability[];
    memory: AgentMemory;
    performance: AgentPerformance;
    configuration: AgentConfiguration;
}
export interface AgentCapability {
    name: string;
    level: CapabilityLevel;
    tools: string[];
    constraints?: string[];
}
export interface AgentMemory {
    shortTerm: ShortTermMemory;
    longTerm: LongTermMemory;
    episodic: EpisodicMemory;
}
export interface ShortTermMemory {
    capacity: number;
    items: MemoryItem[];
    retentionTime: number;
}
export interface LongTermMemory {
    patterns: Pattern[];
    facts: Fact[];
    skills: Skill[];
}
export interface EpisodicMemory {
    experiences: Experience[];
    maxExperiences: number;
    compressionEnabled: boolean;
}
export interface MemoryItem {
    id: UUID;
    content: string;
    timestamp: Timestamp;
    relevance: number;
    accessCount: number;
}
export interface Pattern {
    id: UUID;
    trigger: string;
    action: string;
    confidence: number;
    occurrences: number;
    lastSeen: Timestamp;
}
export interface Fact {
    id: UUID;
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
    source: string;
}
export interface Skill {
    name: string;
    proficiency: number;
    lastUsed: Timestamp;
    successRate: number;
}
export interface Experience {
    id: UUID;
    request: UserRequest;
    response: AgentResponse;
    outcome: 'success' | 'failure' | 'partial';
    learning: string;
    timestamp: Timestamp;
}
export interface AgentConfiguration {
    reasoningPattern: ReasoningPattern;
    maxReasoningSteps: number;
    temperature: number;
    topP: number;
    maxTokens: number;
    timeoutMs: number;
    retryAttempts: number;
    learningEnabled: boolean;
    confidenceThreshold: number;
}
export interface AgentPerformance {
    successRate: number;
    averageResponseTime: number;
    taskCompletionRate: number;
    errorRate: number;
    learningProgress: number;
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
}
export interface UserRequest {
    requestId: UUID;
    userId: UserId;
    sessionId: SessionId;
    text: string;
    intent?: Intent;
    context: RequestContext;
    complexity: 'simple' | 'moderate' | 'complex';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    timestamp: Timestamp;
}
export interface Intent {
    primary: string;
    secondary?: string[];
    confidence: number;
    entities: Entity[];
    parameters: Record<string, unknown>;
}
export interface Entity {
    type: string;
    value: string;
    position: [number, number];
    confidence: number;
}
export interface RequestContext {
    conversationHistory: ConversationTurn[];
    userPreferences: UserPreferences;
    currentState: SystemState;
    availableTools: string[];
    constraints?: RequestConstraints;
}
export interface ConversationTurn {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
}
export interface UserPreferences {
    responseStyle: 'concise' | 'detailed' | 'balanced';
    language: string;
    timezone: string;
    workingHours?: {
        start: string;
        end: string;
    };
}
export interface SystemState {
    activeServices: string[];
    lastAction?: string;
    pendingTasks?: Task[];
    resources: ResourceUsage;
}
export interface ResourceUsage {
    cpu: number;
    memory: number;
    apiCalls: number;
    remainingQuota: number;
}
export interface RequestConstraints {
    maxExecutionTime?: number;
    requiredConfidence?: number;
    allowedActions?: string[];
    blockedActions?: string[];
}
export interface AgentResponse {
    responseId: UUID;
    requestId: UUID;
    agentId: AgentId;
    response: string;
    confidence: number;
    reasoning: ReasoningStep[];
    actions: Action[];
    suggestions?: Suggestion[];
    metadata: ResponseMetadata;
    timestamp: Timestamp;
}
export interface ReasoningStep {
    step: number;
    type: 'thought' | 'action' | 'observation' | 'reflection';
    content: string;
    confidence: number;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
}
export interface Thought {
    content: string;
    reasoning: string;
    alternatives?: string[];
    confidence: number;
}
export interface Action {
    id: UUID;
    type: string;
    tool?: string;
    parameters: Record<string, unknown>;
    result?: ActionResult;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    startTime?: Timestamp;
    endTime?: Timestamp;
}
export interface ActionResult {
    success: boolean;
    data?: unknown;
    error?: string;
    sideEffects?: string[];
}
export interface Observation {
    source: string;
    content: string;
    interpretation: string;
    relevance: number;
    timestamp: Timestamp;
}
export interface Reflection {
    whatWorked: string[];
    whatDidntWork: string[];
    improvements: string[];
    confidence: number;
}
export interface Suggestion {
    type: 'action' | 'information' | 'clarification';
    content: string;
    confidence: number;
    reasoning?: string;
}
export interface ResponseMetadata {
    processingTime: number;
    tokensUsed: number;
    toolsUsed: string[];
    cacheHits: number;
    reasoningDepth: number;
}
export interface ExecutionPlan {
    planId: UUID;
    requestId: UUID;
    steps: ExecutionStep[];
    dependencies: Dependency[];
    estimatedTime: number;
    confidence: number;
    parallelizable: boolean;
}
export interface ExecutionStep {
    stepId: UUID;
    agentId: AgentId;
    task: Task;
    dependencies: UUID[];
    estimatedTime: number;
    priority: number;
}
export interface Task {
    taskId: UUID;
    type: string;
    description: string;
    input: unknown;
    expectedOutput: string;
    constraints?: TaskConstraints;
    status: 'pending' | 'assigned' | 'executing' | 'completed' | 'failed';
}
export interface TaskConstraints {
    timeout?: number;
    maxRetries?: number;
    requiredConfidence?: number;
}
export interface Dependency {
    from: UUID;
    to: UUID;
    type: 'requires' | 'blocks' | 'informs';
    optional: boolean;
}
export interface UserFeedback {
    feedbackId: UUID;
    responseId: UUID;
    rating: number;
    helpful: boolean;
    correct: boolean;
    comments?: string;
    improvements?: string[];
    timestamp: Timestamp;
}
export interface LearningEvent {
    eventId: UUID;
    agentId: AgentId;
    type: 'success' | 'failure' | 'correction' | 'reinforcement';
    before: unknown;
    after: unknown;
    improvement: number;
    timestamp: Timestamp;
}
export interface AgentMessage {
    messageId: UUID;
    fromAgent: AgentId;
    toAgent: AgentId;
    type: 'request' | 'response' | 'inform' | 'query';
    content: unknown;
    priority: 'low' | 'normal' | 'high';
    requiresResponse: boolean;
    timestamp: Timestamp;
}
export interface AgentCollaboration {
    collaborationId: UUID;
    agents: AgentId[];
    objective: string;
    status: 'planning' | 'executing' | 'completed' | 'failed';
    plan: ExecutionPlan;
    messages: AgentMessage[];
    result?: CollaborationResult;
}
export interface CollaborationResult {
    success: boolean;
    output: unknown;
    contributions: AgentContribution[];
    totalTime: number;
    confidence: number;
}
export interface AgentContribution {
    agentId: AgentId;
    role: string;
    tasks: Task[];
    successRate: number;
    timeSpent: number;
}
//# sourceMappingURL=agent.types.d.ts.map