import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import type {
  Decision,
  DecisionContext,
  AIRecommendation,
  DecisionOption,
  SimilarDecision,
  RiskAssessment
} from '../types/index.js';

/**
 * Decision Analyzer
 * Analyzes decisions and provides AI-powered recommendations
 */
export class DecisionAnalyzer {
  private db = createSupabase(true);
  private aiServiceURL = process.env.AI_SERVICE_URL || 'http://localhost:3001';

  /**
   * Analyze a decision and generate recommendation
   */
  async analyzeDecision(decision: Decision): Promise<AIRecommendation> {
    logger.info({ decisionId: decision.id }, 'Analyzing decision');

    // Get historical similar decisions
    const similarDecisions = await this.findSimilarDecisions(decision);

    // Generate AI recommendation
    const recommendation = await this.generateRecommendation(
      decision,
      similarDecisions
    );

    logger.info(
      {
        decisionId: decision.id,
        recommendation: recommendation.recommendedOption,
        confidence: recommendation.confidence
      },
      'Decision analyzed'
    );

    return recommendation;
  }

  /**
   * Find similar historical decisions
   */
  private async findSimilarDecisions(decision: Decision): Promise<SimilarDecision[]> {
    const { data: history } = await this.db
      .from('decision_history')
      .select('*')
      .eq('user_id', decision.userId)
      .eq('decision_type', decision.decisionType)
      .order('decided_at', { ascending: false })
      .limit(5);

    if (!history) return [];

    return history.map(h => ({
      decisionId: h.decision_id,
      title: h.decision_type,
      userChose: h.user_chose,
      outcome: h.outcome || 'neutral',
      similarity: this.calculateSimilarity(decision, h)
    }));
  }

  /**
   * Calculate similarity between decisions
   */
  private calculateSimilarity(decision: Decision, historical: any): number {
    // Simple similarity based on decision type and context
    let score = 0.5; // Base score for same type

    // Check for similar financial implications
    if (decision.context.financialImplications && historical.context?.financialImplications) {
      const currentAmount = decision.context.financialImplications.amount;
      const histAmount = historical.context.financialImplications.amount;
      const diff = Math.abs(currentAmount - histAmount) / Math.max(currentAmount, histAmount);
      score += (1 - diff) * 0.3;
    }

    // Check for similar urgency
    if (decision.urgency === historical.urgency) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate AI recommendation
   */
  private async generateRecommendation(
    decision: Decision,
    similarDecisions: SimilarDecision[]
  ): Promise<AIRecommendation> {
    // Build prompt for AI service
    const prompt = this.buildAnalysisPrompt(decision, similarDecisions);

    try {
      const response = await fetch(`${this.aiServiceURL}/analyze/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, decision })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const aiResult = await response.json();

      return {
        recommendedOption: aiResult.recommended_option,
        reasoning: aiResult.reasoning,
        confidence: aiResult.confidence,
        alternatives: aiResult.alternatives,
        risks: aiResult.risks,
        considerations: aiResult.considerations,
        historicalSimilarDecisions: similarDecisions
      };
    } catch (error) {
      logger.warn({ error }, 'AI service unavailable, using rule-based recommendation');
      return this.generateRuleBasedRecommendation(decision, similarDecisions);
    }
  }

  /**
   * Build analysis prompt for AI
   */
  private buildAnalysisPrompt(decision: Decision, similarDecisions: SimilarDecision[]): string {
    return `Analyze this decision and provide a recommendation:

Title: ${decision.title}
Description: ${decision.description}
Type: ${decision.decisionType}
Urgency: ${decision.urgency}

Context:
${JSON.stringify(decision.context, null, 2)}

Options:
${decision.options.map((opt, i) => `${i + 1}. ${opt.option}
   Pros: ${opt.pros.join(', ')}
   Cons: ${opt.cons.join(', ')}
   Feasibility: ${opt.feasibility * 100}%`).join('\n\n')}

${similarDecisions.length > 0 ? `Historical Similar Decisions:
${similarDecisions.map(sd => `- ${sd.title}: User chose "${sd.userChose}", outcome was ${sd.outcome}`).join('\n')}` : ''}

Provide your recommendation in JSON format with:
- recommended_option: string
- reasoning: string
- confidence: number (0-1)
- alternatives: string[]
- risks: string[]
- considerations: string[]`;
  }

  /**
   * Generate rule-based recommendation (fallback)
   */
  private generateRuleBasedRecommendation(
    decision: Decision,
    similarDecisions: SimilarDecision[]
  ): AIRecommendation {
    // Simple scoring system
    const scores = decision.options.map(option => {
      let score = option.feasibility;

      // Prefer options with more pros
      score += option.pros.length * 0.1;

      // Penalize options with more cons
      score -= option.cons.length * 0.1;

      // Consider historical decisions
      const historicalMatch = similarDecisions.find(sd =>
        sd.userChose.toLowerCase().includes(option.option.toLowerCase())
      );
      if (historicalMatch && historicalMatch.outcome === 'positive') {
        score += 0.2;
      }

      return { option, score };
    });

    const best = scores.sort((a, b) => b.score - a.score)[0];

    return {
      recommendedOption: best.option.option,
      reasoning: `Based on feasibility (${Math.round(best.option.feasibility * 100)}%), pros/cons analysis, and historical patterns`,
      confidence: Math.min(best.score, 0.85),
      alternatives: scores.slice(1, 3).map(s => s.option.option),
      risks: decision.context.risks || [],
      considerations: [
        `${best.option.pros.length} advantages identified`,
        `${best.option.cons.length} disadvantages to consider`
      ],
      historicalSimilarDecisions: similarDecisions
    };
  }

  /**
   * Assess risks for a decision
   */
  async assessRisks(decision: Decision): Promise<RiskAssessment> {
    const risks = [
      ...(decision.context.risks || []).map(r => ({
        type: 'contextual',
        description: r,
        severity: 'medium' as const,
        probability: 'medium' as const
      })),
      ...decision.options.flatMap(opt =>
        (opt.risks || []).map(r => ({
          type: 'option-specific',
          description: r,
          severity: 'medium' as const,
          probability: 'medium' as const
        }))
      )
    ];

    // Assess financial risk
    if (decision.context.financialImplications) {
      const amount = decision.context.financialImplications.amount;
      if (amount > 10000) {
        risks.push({
          type: 'financial',
          description: `High financial commitment of ${decision.context.financialImplications.currency} ${amount}`,
          severity: 'high',
          probability: 'high'
        });
      }
    }

    const overallRisk = this.calculateOverallRisk(risks);

    return {
      overallRisk,
      identifiedRisks: risks,
      mitigationStrategies: this.generateMitigationStrategies(risks)
    };
  }

  private calculateOverallRisk(risks: any[]): 'low' | 'medium' | 'high' {
    const highRisks = risks.filter(r => r.severity === 'high').length;
    if (highRisks > 2) return 'high';
    if (highRisks > 0 || risks.length > 5) return 'medium';
    return 'low';
  }

  private generateMitigationStrategies(risks: any[]): string[] {
    return [
      'Review all identified risks with stakeholders',
      'Create contingency plans for high-severity risks',
      'Monitor implementation closely',
      'Schedule follow-up review in 30 days'
    ];
  }
}
