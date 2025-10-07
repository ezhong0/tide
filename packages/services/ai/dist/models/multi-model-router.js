/**
 * Multi-Model Router
 * Intelligently routes requests to optimal AI models based on requirements
 */
import { createLogger } from '@tide/logger';
const logger = createLogger({ component: 'MultiModelRouter' });
export class MultiModelRouter {
    /**
     * Analyze request and select optimal model(s)
     */
    async route(request) {
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
        // Complex reasoning: advanced model
        if (factors.requiresReasoning || factors.complexity > 0.7) {
            return this.selectAdvanced(factors);
        }
        // Default: optimal cost/quality balance
        return this.selectBalanced(factors);
    }
    /**
     * Analyze request to determine routing factors
     */
    analyzeRequest(request) {
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
    estimateComplexity(content) {
        const wordCount = content.split(' ').length;
        const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
        const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
        // Longer content and complex sentences = higher complexity
        let complexity = 0;
        if (wordCount > 100)
            complexity += 0.3;
        if (wordCount > 300)
            complexity += 0.3;
        if (avgWordsPerSentence > 20)
            complexity += 0.2;
        if (content.includes('workflow') || content.includes('process'))
            complexity += 0.2;
        return Math.min(complexity, 1);
    }
    /**
     * Select ensemble of models for critical tasks
     */
    selectEnsemble(factors) {
        return {
            primary: 'gpt-5',
            validators: ['claude-3.5-opus'],
            aggregation: 'weighted_vote',
            reasoning: 'Critical decision requires multi-model validation',
        };
    }
    /**
     * Select privacy-focused model
     */
    selectPrivate(factors) {
        // For now, use Anthropic (future: local models)
        return {
            primary: 'claude-3.5-sonnet',
            aggregation: 'single',
            reasoning: 'Privacy-sensitive content routed to trusted provider',
        };
    }
    /**
     * Select fastest model
     */
    selectFastest(factors) {
        return {
            primary: 'gpt-5-nano',
            aggregation: 'single',
            reasoning: 'Urgent request requires fastest response',
        };
    }
    /**
     * Select advanced reasoning model
     */
    selectAdvanced(factors) {
        return {
            primary: 'claude-3.5-opus',
            aggregation: 'single',
            reasoning: 'Complex reasoning task requires advanced model',
        };
    }
    /**
     * Select balanced model
     */
    selectBalanced(factors) {
        return {
            primary: 'gpt-5-mini',
            aggregation: 'single',
            reasoning: 'Standard request using balanced cost/quality model',
        };
    }
    /**
     * Get actual model ID from ModelFamily
     */
    getModelId(family) {
        switch (family) {
            case 'gpt-5':
                return 'gpt-4';
            case 'gpt-5-mini':
                return 'gpt-4-turbo';
            case 'gpt-5-nano':
                return 'gpt-3.5-turbo';
            case 'claude-3.5-opus':
                return 'claude-3-opus-20240229';
            case 'claude-3.5-sonnet':
                return 'claude-3-sonnet-20240229';
            case 'gemini-pro':
                return 'gemini-pro';
            default:
                return 'gpt-4-turbo';
        }
    }
}
//# sourceMappingURL=multi-model-router.js.map