/**
 * Reasoning Verifier
 * Verifies reasoning steps for logical consistency and hallucination
 */
import type { VerificationResult } from '@tide/contracts';
import type { ModelClient } from '../types/index.js';
export interface StepResult {
    step: number;
    description: string;
    output: any;
    claims: string[];
    model: string;
    confidence?: number;
}
export declare class ReasoningVerifier {
    /**
     * Verify a reasoning step result
     */
    verify(result: StepResult, modelClient: ModelClient): Promise<VerificationResult>;
    /**
     * Check logical consistency
     */
    private checkLogicalConsistency;
    /**
     * Check factual accuracy
     */
    private checkFactualAccuracy;
    /**
     * Check completeness
     */
    private checkCompleteness;
    /**
     * Detect hallucination
     */
    private detectHallucination;
    /**
     * Check for contradictions in output
     */
    private hasContradictions;
    /**
     * Map check name to issue type
     */
    private getIssueType;
}
//# sourceMappingURL=reasoning-verifier.d.ts.map