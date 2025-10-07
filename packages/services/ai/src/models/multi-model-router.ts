/**
 * Multi-Model Router
 * Intelligently routes requests to optimal AI models based on requirements
 */

import { createLogger } from '@tide/logger';
import type {
  AIRequest,
  ModelSelection,
  RequestFactors,
  ModelFamily,
} from '@tide/contracts';
import { MODEL_CONFIGS, DEFAULT_MODELS } from '../config/models.js';

const logger = createLogger({ component: 'MultiModelRouter' });

export class MultiModelRouter {
  /**
   * Analyze request and select optimal model(s)
   */
  async route(request: AIRequest): Promise<ModelSelection> {
    const factors = this.analyzeRequest(request);
    logger.debug('Request factors analyzed', { factors });

    // Critical decisions: use ensemble
    if (factors.criticality > 0.9) {
      return this.selectEnsemble(factors);
    }

    // Privacy-sensitive: prefer local models (future implementation)
    if (factors.sensitivity > 0.8) {
      return this.selectPrivate(factors);
    }

    // Time-sensitive: fastest model
    if (factors.urgency > 0.8) {
      return this.selectFastest(factors);
    }

    // Complex reasoning: use mini (not full gpt-5)
    if (factors.requiresReasoning || factors.complexity > 0.8) {
      return this.selectAdvanced(factors);
    }

    // Default: optimal cost/quality balance
    return this.selectBalanced(factors);
  }

  /**
   * Analyze request to determine routing factors
   */
  private analyzeRequest(request: AIRequest): RequestFactors {
    const content = request.content.toLowerCase();

    // Detect criticality
    const criticalKeywords = ['approve', 'budget', 'contract', 'legal', 'fire', 'hire'];
    const criticality = criticalKeywords.some(kw => content.includes(kw)) ? 0.95 : 0.3;

    // Detect sensitivity
    const sensitiveKeywords = ['salary', 'confidential', 'private', 'personal', 'password'];
    const sensitivity = sensitiveKeywords.some(kw => content.includes(kw)) ? 0.9 : 0.3;

    // Detect urgency
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'now', 'emergency'];
    const urgency = urgentKeywords.some(kw => content.includes(kw)) ? 0.9 : 0.5;

    // Detect complexity
    const complexity = this.estimateComplexity(content);

    // Detect reasoning requirement
    const reasoningKeywords = ['why', 'how', 'explain', 'analyze', 'compare'];
    const requiresReasoning = reasoningKeywords.some(kw => content.includes(kw));

    // Estimate tokens
    const expectedTokens = Math.ceil(content.split(' ').length * 1.3) + 500; // rough estimate

    return {
      criticality,
      sensitivity,
      urgency,
      complexity,
      requiresReasoning,
      expectedTokens,
    };
  }

  /**
   * Estimate request complexity
   */
  private estimateComplexity(content: string): number {
    const wordCount = content.split(' ').length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordsPerSentence = wordCount / Math.max(sentences, 1);

    // Longer content and complex sentences = higher complexity
    let complexity = 0;

    if (wordCount > 100) complexity += 0.3;
    if (wordCount > 300) complexity += 0.3;
    if (avgWordsPerSentence > 20) complexity += 0.2;
    if (content.includes('workflow') || content.includes('process')) complexity += 0.2;

    return Math.min(complexity, 1);
  }

  /**
   * Select ensemble of models for critical tasks
   */
  private selectEnsemble(factors: RequestFactors): ModelSelection {
    return {
      primary: 'gpt-5-mini' as ModelFamily,
      validators: ['gpt-5-nano' as ModelFamily], // Use nano as validator for speed
      aggregation: 'weighted_vote',
      reasoning: 'Critical decision requires multi-model validation',
    };
  }

  /**
   * Select privacy-focused model
   */
  private selectPrivate(factors: RequestFactors): ModelSelection {
    // Use GPT-5 nano for privacy-sensitive content (local-first in future)
    return {
      primary: 'gpt-5-nano' as ModelFamily,
      aggregation: 'single',
      reasoning: 'Privacy-sensitive content using fast GPT-5 nano',
    };
  }

  /**
   * Select fastest model
   */
  private selectFastest(factors: RequestFactors): ModelSelection {
    return {
      primary: 'gpt-5-nano' as ModelFamily,
      aggregation: 'single',
      reasoning: 'Urgent request requires fastest response',
    };
  }

  /**
   * Select advanced reasoning model
   */
  private selectAdvanced(factors: RequestFactors): ModelSelection {
    return {
      primary: 'gpt-5-mini' as ModelFamily,
      aggregation: 'single',
      reasoning: 'Complex reasoning task uses GPT-5 mini (cost optimized)',
    };
  }

  /**
   * Select balanced model (default for most requests)
   */
  private selectBalanced(factors: RequestFactors): ModelSelection {
    // Use nano by default unless request is moderately complex
    const useNano = factors.complexity < 0.5 && factors.expectedTokens < 1000;

    return {
      primary: useNano ? 'gpt-5-nano' as ModelFamily : 'gpt-5-mini' as ModelFamily,
      aggregation: 'single',
      reasoning: useNano
        ? 'Simple request using fast GPT-5 nano'
        : 'Standard request using GPT-5 mini',
    };
  }

  /**
   * Get actual model ID from ModelFamily
   *
   * NOTE: GPT-5 models were released August 7, 2025
   * API model names: gpt-5, gpt-5-mini, gpt-5-nano
   */
  getModelId(family: ModelFamily): string {
    switch (family) {
      // case 'gpt-5':
      //   return 'gpt-5'; // NOT USED - too expensive for Alpha
      case 'gpt-5-mini':
        return 'gpt-5-mini'; // GPT-5 mini (released Aug 2025)
      case 'gpt-5-nano':
        return 'gpt-5-nano'; // GPT-5 nano (released Aug 2025)
      case 'claude-3.5-opus':
        return 'claude-3-opus-20240229';
      case 'claude-3.5-sonnet':
        return 'claude-3-sonnet-20240229';
      case 'gemini-pro':
        return 'gemini-pro';
      default:
        return 'gpt-5-nano'; // Default to fastest, cheapest model
    }
  }
}
