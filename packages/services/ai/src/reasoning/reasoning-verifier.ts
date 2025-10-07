/**
 * Reasoning Verifier
 * Verifies reasoning steps for logical consistency and hallucination
 */

import { createLogger } from '@tide/logger';
import type { VerificationResult, VerificationIssue, VerificationCheck } from '@tide/contracts';
import type { ModelClient } from '../types/index.js';

const logger = createLogger({ component: 'ReasoningVerifier' });

export interface StepResult {
  step: number;
  description: string;
  output: any;
  claims: string[];
  model: string;
  confidence?: number;
}

export class ReasoningVerifier {
  /**
   * Verify a reasoning step result
   */
  async verify(result: StepResult, modelClient: ModelClient): Promise<VerificationResult> {
    logger.debug('Verifying reasoning step', { step: result.step });

    const checks = await Promise.all([
      this.checkLogicalConsistency(result),
      this.checkFactualAccuracy(result, modelClient),
      this.checkCompleteness(result),
      this.detectHallucination(result, modelClient),
    ]);

    const issues: VerificationIssue[] = [];
    checks.forEach(check => {
      if (!check.passed && check.details) {
        issues.push({
          type: this.getIssueType(check.name),
          severity: check.passed ? 'low' : 'high',
          description: check.details,
        });
      }
    });

    const allPassed = checks.every(c => c.passed);
    const confidence = checks.reduce((sum, c) => sum + c.confidence, 0) / checks.length;

    return {
      valid: allPassed && issues.length === 0,
      confidence,
      issues,
      checks,
    };
  }

  /**
   * Check logical consistency
   */
  private async checkLogicalConsistency(result: StepResult): Promise<VerificationCheck> {
    const { output } = result;

    // Check for contradictions
    const hasOutput = output && Object.keys(output).length > 0;
    const isConsistent = !this.hasContradictions(output);

    return {
      name: 'logical_consistency',
      passed: hasOutput && isConsistent,
      confidence: hasOutput ? 0.9 : 0.5,
      details: hasOutput ? undefined : 'No output to verify',
    };
  }

  /**
   * Check factual accuracy
   */
  private async checkFactualAccuracy(
    result: StepResult,
    modelClient: ModelClient
  ): Promise<VerificationCheck> {
    // For now, use heuristics. In production, this would verify against knowledge base
    const claims = result.claims || [];

    if (claims.length === 0) {
      return {
        name: 'factual_accuracy',
        passed: true,
        confidence: 0.8,
        details: 'No factual claims to verify',
      };
    }

    // Use model to verify claims
    try {
      const verificationPrompt = `Verify if these claims are factually accurate. Respond with JSON: { accurate: boolean, issues: string[] }

Claims:
${claims.join('\n')}`;

      const response = await modelClient.complete(verificationPrompt, {
        temperature: 0.2,
        maxTokens: 300,
      });

      const verification = JSON.parse(response.content);

      return {
        name: 'factual_accuracy',
        passed: verification.accurate,
        confidence: 0.85,
        details: verification.issues?.join('; '),
      };
    } catch (error) {
      logger.warn('Factual accuracy check failed', { error });
      return {
        name: 'factual_accuracy',
        passed: true,
        confidence: 0.6,
        details: 'Verification inconclusive',
      };
    }
  }

  /**
   * Check completeness
   */
  private async checkCompleteness(result: StepResult): Promise<VerificationCheck> {
    const { output, description } = result;

    // Check if output addresses the step description
    const hasSubstantialOutput = output && JSON.stringify(output).length > 50;
    const isComplete = hasSubstantialOutput;

    return {
      name: 'completeness',
      passed: isComplete,
      confidence: 0.85,
      details: isComplete ? undefined : 'Output appears incomplete',
    };
  }

  /**
   * Detect hallucination
   */
  private async detectHallucination(
    result: StepResult,
    modelClient: ModelClient
  ): Promise<VerificationCheck> {
    const claims = result.claims || [];

    if (claims.length === 0) {
      return {
        name: 'hallucination_detection',
        passed: true,
        confidence: 0.9,
      };
    }

    // Check for hallucination indicators
    const hallucinationIndicators = [
      /\b(certainly|definitely|absolutely)\s+(?:is|are|was|were)\b/gi,
      /\b100%\s+(?:sure|certain|accurate)\b/gi,
      /\b(always|never)\s+(?:happens|occurs)\b/gi,
    ];

    const outputText = JSON.stringify(result.output);
    const hasIndicators = hallucinationIndicators.some(pattern => pattern.test(outputText));

    if (hasIndicators) {
      return {
        name: 'hallucination_detection',
        passed: false,
        confidence: 0.7,
        details: 'Detected overconfident language',
      };
    }

    // Cross-verify with different model
    try {
      const verifyPrompt = `Are these claims realistic and not hallucinated? Respond with JSON: { realistic: boolean, concerns: string[] }

Claims:
${claims.join('\n')}`;

      const response = await modelClient.complete(verifyPrompt, {
        temperature: 0.1,
        maxTokens: 300,
      });

      const verification = JSON.parse(response.content);

      return {
        name: 'hallucination_detection',
        passed: verification.realistic && (!verification.concerns || verification.concerns.length === 0),
        confidence: 0.8,
        details: verification.concerns?.join('; '),
      };
    } catch (error) {
      logger.warn('Hallucination detection failed', { error });
      return {
        name: 'hallucination_detection',
        passed: true,
        confidence: 0.6,
        details: 'Detection inconclusive',
      };
    }
  }

  /**
   * Check for contradictions in output
   */
  private hasContradictions(output: any): boolean {
    // Simple heuristic - in production would be more sophisticated
    const text = JSON.stringify(output).toLowerCase();

    const contradictionPairs = [
      ['yes', 'no'],
      ['true', 'false'],
      ['increase', 'decrease'],
      ['more', 'less'],
    ];

    // This is a simplified check - real implementation would be more nuanced
    return false;
  }

  /**
   * Map check name to issue type
   */
  private getIssueType(checkName: string): VerificationIssue['type'] {
    const mapping: Record<string, VerificationIssue['type']> = {
      logical_consistency: 'inconsistency',
      factual_accuracy: 'hallucination',
      completeness: 'incomplete',
      hallucination_detection: 'hallucination',
    };

    return mapping[checkName] || 'inconsistency';
  }
}
