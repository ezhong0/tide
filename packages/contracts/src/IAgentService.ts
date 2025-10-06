/**
 * Agent Service Contract
 * Multi-agent reasoning system with ReAct pattern
 *
 * Performance Requirements:
 * - Simple requests: <300ms
 * - Complex requests: <1000ms
 * - Confidence threshold: >0.8 for autonomous action
 */

import { Result, UUID, UserId, AgentId, SessionId } from '@tide/types';
import {
  Agent, AgentResponse, UserRequest, UserFeedback,
  ReasoningStep, ExecutionPlan, Task, AgentCollaboration,
  AgentPerformance, LearningEvent, Pattern, Experience
} from '@tide/types';

export interface IAgentService {
  /**
   * Process a user request through multi-agent reasoning
   * Uses ReAct pattern: Reason → Act → Observe → Reflect
   * @param request User request with context
   * @returns Agent response with reasoning trace
   * @performance <300ms simple, <1000ms complex
   */
  process(request: UserRequest): Promise<Result<AgentResponse>>;

  /**
   * Get agent's confidence in its response
   * @returns Confidence score 0-1
   * @performance <10ms
   */
  getConfidence(): number;

  /**
   * Get detailed reasoning trace for debugging
   * @returns Array of reasoning steps
   * @performance <10ms
   */
  getReasoningTrace(): ReasoningStep[];

  /**
   * Learn from user feedback to improve future responses
   * @param feedback User feedback on response quality
   * @returns Success status
   * @performance <100ms
   */
  learn(feedback: UserFeedback): Promise<Result<void>>;

  /**
   * Create execution plan for complex multi-step request
   * @param request Complex user request
   * @returns Execution plan with task breakdown
   * @performance <200ms
   */
  planExecution(request: UserRequest): Promise<Result<ExecutionPlan>>;

  /**
   * Execute a specific task from execution plan
   * @param task Task to execute
   * @returns Task result
   * @performance Varies by task complexity
   */
  executeTask(task: Task): Promise<Result<unknown>>;

  /**
   * Coordinate multiple agents for complex tasks
   * @param objective Task objective
   * @param agents Array of agent IDs to coordinate
   * @returns Collaboration result
   * @performance <500ms setup
   */
  coordinateAgents(
    objective: string,
    agents: AgentId[]
  ): Promise<Result<AgentCollaboration>>;

  /**
   * Get specific agent by ID
   * @param agentId Agent identifier
   * @returns Agent details
   * @performance <50ms
   */
  getAgent(agentId: AgentId): Promise<Result<Agent>>;

  /**
   * List all available agents
   * @returns Array of agents
   * @performance <50ms
   */
  listAgents(): Promise<Result<Agent[]>>;

  /**
   * Create a new specialized agent
   * @param config Agent configuration
   * @returns Created agent ID
   * @performance <200ms
   */
  createAgent(config: AgentConfig): Promise<Result<AgentId>>;

  /**
   * Update agent configuration
   * @param agentId Agent to update
   * @param updates Configuration updates
   * @returns Success status
   * @performance <100ms
   */
  updateAgent(agentId: AgentId, updates: Partial<AgentConfig>): Promise<Result<void>>;

  /**
   * Terminate an agent
   * @param agentId Agent to terminate
   * @param reason Termination reason
   * @returns Success status
   * @performance <100ms
   */
  terminateAgent(agentId: AgentId, reason: string): Promise<Result<void>>;

  /**
   * Get agent performance metrics
   * @param agentId Agent identifier
   * @returns Performance metrics
   * @performance <50ms
   */
  getPerformance(agentId: AgentId): Promise<Result<AgentPerformance>>;

  /**
   * Query agent memory
   * @param agentId Agent identifier
   * @param query Memory query
   * @returns Matching memories
   * @performance <100ms
   */
  queryMemory(agentId: AgentId, query: string): Promise<Result<MemoryResult[]>>;

  /**
   * Store experience in agent memory
   * @param agentId Agent identifier
   * @param experience Experience to store
   * @returns Success status
   * @performance <50ms
   */
  storeExperience(agentId: AgentId, experience: Experience): Promise<Result<void>>;

  /**
   * Get learned patterns
   * @param agentId Agent identifier
   * @returns Array of learned patterns
   * @performance <50ms
   */
  getPatterns(agentId: AgentId): Promise<Result<Pattern[]>>;

  /**
   * Validate agent response before execution
   * @param response Agent response to validate
   * @returns Validation result
   * @performance <50ms
   */
  validateResponse(response: AgentResponse): Promise<Result<ValidationResult>>;

  /**
   * Get agent suggestions for a partial request
   * @param partialRequest Incomplete user request
   * @returns Array of suggestions
   * @performance <200ms
   */
  getSuggestions(partialRequest: string): Promise<Result<Suggestion[]>>;

  /**
   * Start a new agent session
   * @param userId User starting session
   * @returns Session ID
   * @performance <50ms
   */
  startSession(userId: UserId): Promise<Result<SessionId>>;

  /**
   * End an agent session
   * @param sessionId Session to end
   * @returns Session summary
   * @performance <100ms
   */
  endSession(sessionId: SessionId): Promise<Result<SessionSummary>>;

  /**
   * Get session history
   * @param sessionId Session identifier
   * @returns Session history
   * @performance <100ms
   */
  getSessionHistory(sessionId: SessionId): Promise<Result<SessionHistory>>;

  /**
   * Train agent on specific examples
   * @param agentId Agent to train
   * @param examples Training examples
   * @returns Training result
   * @performance Async, returns immediately
   */
  train(agentId: AgentId, examples: TrainingExample[]): Promise<Result<TrainingResult>>;

  /**
   * Export agent configuration and knowledge
   * @param agentId Agent to export
   * @returns Exported agent data
   * @performance <200ms
   */
  exportAgent(agentId: AgentId): Promise<Result<AgentExport>>;

  /**
   * Import agent configuration and knowledge
   * @param agentData Agent data to import
   * @returns Imported agent ID
   * @performance <500ms
   */
  importAgent(agentData: AgentExport): Promise<Result<AgentId>>;
}

// Supporting types
export interface AgentConfig {
  name: string;
  role: 'planner' | 'executor' | 'reviewer' | 'specialist';
  specialty?: string;
  capabilities: string[];
  reasoningPattern: 'react' | 'chain-of-thought' | 'tree-of-thought';
  temperature?: number;
  confidenceThreshold?: number;
  maxReasoningSteps?: number;
  learningEnabled?: boolean;
}

export interface MemoryResult {
  content: unknown;
  relevance: number;
  timestamp: number;
  type: 'short-term' | 'long-term' | 'episodic';
}

export interface ValidationResult {
  valid: boolean;
  issues?: ValidationIssue[];
  suggestions?: string[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface Suggestion {
  text: string;
  confidence: number;
  type: 'completion' | 'correction' | 'alternative';
}

export interface SessionSummary {
  sessionId: SessionId;
  userId: UserId;
  duration: number;
  requestCount: number;
  successRate: number;
  topIntents: string[];
  keyInsights?: string[];
}

export interface SessionHistory {
  sessionId: SessionId;
  turns: Array<{
    request: UserRequest;
    response: AgentResponse;
    timestamp: number;
  }>;
}

export interface TrainingExample {
  input: string;
  expectedOutput: string;
  context?: Record<string, unknown>;
}

export interface TrainingResult {
  examplesTrained: number;
  improvementScore: number;
  newPatterns: Pattern[];
}

export interface AgentExport {
  agentId: AgentId;
  configuration: AgentConfig;
  patterns: Pattern[];
  experiences: Experience[];
  performance: AgentPerformance;
  version: string;
  exportedAt: number;
}