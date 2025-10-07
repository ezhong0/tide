/**
 * Reasoning Engine
 * Executes multi-step reasoning chains with verification
 */
import { createLogger } from '@tide/logger';
import { ChainBuilder } from './chain-builder.js';
import { ReasoningVerifier } from './reasoning-verifier.js';
const logger = createLogger({ component: 'ReasoningEngine' });
export class ReasoningEngine {
    constructor() {
        this.chainBuilder = new ChainBuilder();
        this.verifier = new ReasoningVerifier();
    }
    /**
     * Process request with multi-step reasoning
     */
    async process(request, intents, agents, modelClient) {
        logger.info('Starting reasoning process', {
            intentsCount: intents.length,
            agentsCount: agents.length,
        });
        // Build reasoning chain
        const chainPlan = await this.chainBuilder.build(request, agents, intents);
        logger.debug('Reasoning chain built', {
            steps: chainPlan.totalSteps,
            complexity: chainPlan.complexity
        });
        // Execute chain
        const steps = [];
        for (let i = 0; i < chainPlan.links.length; i++) {
            const link = chainPlan.links[i];
            logger.debug('Executing reasoning step', { step: link.step, description: link.description });
            // Execute step
            let result = await this.executeStep(link, modelClient, agents);
            let alternative = null;
            // Verify step if critical
            if (link.critical) {
                const verification = await this.verifier.verify(result, modelClient);
                if (!verification.valid) {
                    logger.warn('Reasoning step failed verification', {
                        step: link.step,
                        issues: verification.issues,
                    });
                    // Try alternative approach
                    alternative = await this.findAlternativeApproach(link, verification, modelClient);
                    if (alternative) {
                        result = await this.executeStep(link, modelClient, agents, alternative);
                    }
                }
                steps.push({
                    step: link.step,
                    description: link.description,
                    input: link.input,
                    output: result.output,
                    reasoning: this.extractReasoning(result.output),
                    confidence: result.confidence || 0.8,
                    model: result.model,
                    verified: verification.valid,
                    alternatives: alternative ? [alternative] : undefined,
                });
            }
            else {
                steps.push({
                    step: link.step,
                    description: link.description,
                    input: link.input,
                    output: result.output,
                    reasoning: this.extractReasoning(result.output),
                    confidence: result.confidence || 0.8,
                    model: result.model,
                    verified: true,
                });
            }
        }
        // Calculate overall confidence
        const avgConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;
        const allVerified = steps.every(s => s.verified);
        const finalConclusion = this.synthesizeConclusion(steps);
        return {
            steps,
            finalConclusion,
            confidence: avgConfidence,
            verified: allVerified,
        };
    }
    /**
     * Execute a single reasoning step
     */
    async executeStep(link, modelClient, agents, alternativeApproach) {
        const prompt = alternativeApproach
            ? alternativeApproach.description
            : `Execute this reasoning step: ${link.description}

Input: ${JSON.stringify(link.input)}
Expected output: ${link.expectedOutput}

Provide detailed reasoning and output in JSON format.`;
        try {
            const response = await modelClient.complete(prompt, {
                temperature: 0.6,
                maxTokens: 800,
            });
            let output = {};
            try {
                output = JSON.parse(response.content);
            }
            catch {
                output = { result: response.content };
            }
            return {
                step: link.step,
                description: link.description,
                output,
                claims: this.extractClaims(response.content),
                model: 'gpt-5-mini',
                confidence: 0.85,
            };
        }
        catch (error) {
            logger.error('Step execution failed', { error, step: link.step });
            return {
                step: link.step,
                description: link.description,
                output: { error: 'Execution failed' },
                claims: [],
                model: 'gpt-5-mini',
                confidence: 0.0,
            };
        }
    }
    /**
     * Find alternative reasoning approach
     */
    async findAlternativeApproach(link, verification, modelClient) {
        const prompt = `The following reasoning step failed verification. Suggest an alternative approach.

Original step: ${link.description}
Issues: ${verification.issues.map((i) => i.description).join(', ')}

Provide an alternative approach in JSON: { description: string, reasoning: string }`;
        try {
            const response = await modelClient.complete(prompt, {
                temperature: 0.7,
                maxTokens: 400,
            });
            const alternative = JSON.parse(response.content);
            return {
                description: alternative.description,
                confidence: 0.7,
                chosen: true,
                reason: 'Original approach failed verification',
            };
        }
        catch (error) {
            logger.warn('Failed to find alternative approach', { error });
            return null;
        }
    }
    /**
     * Extract reasoning from output
     */
    extractReasoning(output) {
        if (typeof output === 'string')
            return output;
        if (output.reasoning)
            return output.reasoning;
        if (output.explanation)
            return output.explanation;
        return JSON.stringify(output);
    }
    /**
     * Extract factual claims from content
     */
    extractClaims(content) {
        // Simple extraction - in production would use NLP
        const claims = [];
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());
        sentences.forEach(sentence => {
            // Look for declarative statements
            if (sentence.includes(' is ') ||
                sentence.includes(' are ') ||
                sentence.includes(' will ')) {
                claims.push(sentence.trim());
            }
        });
        return claims.slice(0, 5); // Top 5 claims
    }
    /**
     * Synthesize conclusion from all steps
     */
    synthesizeConclusion(steps) {
        const lastStep = steps[steps.length - 1];
        if (lastStep?.output?.conclusion) {
            return lastStep.output.conclusion;
        }
        return `Completed ${steps.length} reasoning steps with average confidence ${(steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length).toFixed(2)}`;
    }
}
//# sourceMappingURL=reasoning-engine.js.map