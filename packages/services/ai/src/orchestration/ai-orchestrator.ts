/**
 * AI Orchestrator
 * Main orchestration layer that coordinates all AI operations
 */

import { createLogger } from '@tide/logger';
import { v4 as uuidv4 } from 'uuid';
import type {
  AIRequest,
  AIResponse,
  Intent,
  AgentTask,
} from '@tide/contracts';
import { MultiModelRouter } from '../models/multi-model-router';
import { ModelClientFactory } from '../models/clients';
import { SwarmCoordinator } from '../agents/swarm-coordinator';
import { IntentDetector } from '../intelligence/intent-detector';
import { ReasoningEngine } from '../reasoning/reasoning-engine';
import { LearningSystem } from '../learning/learning-system';
import type { AgentExecutionContext } from '../types';

const logger = createLogger({ component: 'AIOrchestrator' });

export class AIOrchestrator {
  private router: MultiModelRouter;
  private swarm: SwarmCoordinator;
  private intentDetector: IntentDetector;
  private reasoningEngine: ReasoningEngine;
  private learningSystem: LearningSystem;

  constructor() {
    this.router = new MultiModelRouter();
    this.swarm = new SwarmCoordinator();
    this.intentDetector = new IntentDetector();
    this.reasoningEngine = new ReasoningEngine();
    this.learningSystem = new LearningSystem();
  }

  /**
   * Process an AI request end-to-end
   */
  async process(request: AIRequest): Promise<AIResponse> {
    const requestId = uuidv4();
    const startTime = Date.now();

    logger.info('Processing AI request', {
      requestId,
      userId: request.userId,
    });

    try {
      // 1. Select optimal model(s)
      const modelSelection = await this.router.route(request);
      logger.debug('Model selected', { modelSelection });

      // 2. Get model client
      const modelId = this.router.getModelId(modelSelection.primary);
      const modelClient = ModelClientFactory.getClient(modelId);

      // 3. Detect intents
      const intents = await this.intentDetector.detect(request, modelClient);
      logger.debug('Intents detected', { intents });

      // 4. Select and activate agents
      const agents = this.swarm.selectAgents(intents);
      logger.debug('Agents selected', { count: agents.length });

      // 5. Execute reasoning chain (Week 2)
      const reasoningChain = await this.reasoningEngine.process(
        request,
        intents,
        agents,
        modelClient
      );
      logger.debug('Reasoning completed', {
        steps: reasoningChain.steps.length,
        confidence: reasoningChain.confidence,
      });

      // 6. Build agent tasks
      const tasks = this.buildAgentTasks(intents, request);

      // 7. Execute agents
      const executionContext: AgentExecutionContext = {
        requestId,
        userId: request.userId,
        timestamp: Date.now(),
        modelClient,
      };

      const agentResults = await this.swarm.executeParallel(tasks, executionContext);
      logger.debug('Agents executed', { results: agentResults.length });

      // 8. Aggregate results and generate response
      const response = await this.generateResponse(
        request,
        intents,
        agentResults,
        modelClient,
        modelSelection
      );

      // 9. Learn from interaction (Week 3)
      await this.learningSystem.observe(request, response);
      logger.debug('Learning observation recorded');

      const executionTime = Date.now() - startTime;
      logger.info('AI request completed', {
        requestId,
        executionTime,
        intents: intents.map(i => i.category),
      });

      const finalResponse = {
        ...response,
        requestId,
        executionTime,
        timestamp: Date.now(),
      } as any;

      return finalResponse;
    } catch (error) {
      logger.error('AI request failed', { error, requestId });
      throw error;
    }
  }

  /**
   * Build agent tasks from intents
   */
  private buildAgentTasks(intents: Intent[], request: AIRequest): AgentTask[] {
    return intents.map(intent => ({
      agentType: this.mapIntentToAgentType(intent.category),
      input: request.content,
      context: request.context,
      critical: intent.confidence > 0.9,
    }));
  }

  /**
   * Map intent category to agent type
   */
  private mapIntentToAgentType(category: Intent['category']): AgentTask['agentType'] {
    const mapping: Record<Intent['category'], AgentTask['agentType']> = {
      email_triage: 'email.triager',
      email_compose: 'email.composer',
      email_reply: 'email.composer',
      calendar_schedule: 'calendar.scheduler',
      calendar_optimize: 'calendar.optimizer',
      task_create: 'task.orchestrator',
      task_prioritize: 'task.prioritizer',
      workflow_execute: 'task.orchestrator',
      question_answer: 'intel.context',
      decision_support: 'decision.analyzer',
      learning: 'intel.pattern',
    };

    return mapping[category] || 'intel.context';
  }

  /**
   * Generate final response
   */
  private async generateResponse(
    request: AIRequest,
    intents: Intent[],
    agentResults: any[],
    modelClient: any,
    modelSelection: any
  ): Promise<AIResponse> {
    // Build response prompt from agent results
    const agentOutputs = agentResults
      .filter(r => !r.error)
      .map(r => `Agent ${r.agentType}: ${JSON.stringify(r.output)}`)
      .join('\n');

    const prompt = `Based on the following agent analysis, generate a helpful response to the user.

User request: ${request.content}

Agent analysis:
${agentOutputs}

Generate a clear, actionable response.`;

    const completion = await modelClient.complete(prompt, {
      temperature: 0.7,
      maxTokens: 500,
    });

    // Build suggested actions from agent outputs
    const suggestedActions = this.buildSuggestedActions(agentResults);

    // Calculate total tokens and cost
    const totalTokens = agentResults.reduce((sum, r) => sum + (r.tokensUsed || 0), 0) +
      completion.tokensUsed;

    return {
      requestId: '',
      content: completion.content,
      intents,
      suggestedActions,
      confidence: this.calculateOverallConfidence(agentResults),
      model: modelSelection,
      tokensUsed: totalTokens,
      cost: this.calculateCost(totalTokens, modelSelection.primary),
      executionTime: 0,
      timestamp: 0,
    } as any;
  }

  /**
   * Build suggested actions from agent results
   */
  private buildSuggestedActions(agentResults: any[]): any[] {
    const actions: any[] = [];

    for (const result of agentResults) {
      if (result.error) continue;

      // Extract actions from agent outputs
      if (result.agentType === 'email.composer' && result.output?.draft) {
        actions.push({
          id: uuidv4(),
          type: 'email_send',
          title: 'Send draft email',
          description: 'Send the composed email',
          preview: result.output.draft.substring(0, 100),
          confidence: result.confidence,
          payload: result.output,
          requiresConfirmation: true,
        });
      }

      if (result.agentType === 'calendar.optimizer' && result.output?.suggestions) {
        result.output.suggestions.forEach((suggestion: any) => {
          actions.push({
            id: uuidv4(),
            type: 'calendar_create',
            title: suggestion.description,
            description: suggestion.impact,
            preview: '',
            confidence: result.confidence,
            payload: suggestion,
            requiresConfirmation: true,
          });
        });
      }
    }

    return actions;
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(agentResults: any[]): number {
    if (agentResults.length === 0) return 0.5;

    const validResults = agentResults.filter(r => !r.error);
    if (validResults.length === 0) return 0.3;

    const avgConfidence = validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length;
    return avgConfidence;
  }

  /**
   * Calculate cost based on tokens and model (GPT-5 only)
   */
  private calculateCost(tokens: number, model: string): number {
    const costPer1M: Record<string, number> = {
      'gpt-5': 0.00125,        // $1.25/1M input, $10/1M output (averaged)
      'gpt-5-mini': 0.00025,   // $0.25/1M input, $2.00/1M output (averaged)
      'gpt-5-nano': 0.00005,   // $0.05/1M input, $0.40/1M output (averaged)
    };

    const cost = costPer1M[model] || 0.00025; // Default to gpt-5-mini cost
    return (tokens / 1000000) * cost;
  }
}
