/**
 * Intent Detection System
 * Analyzes user requests to detect intents and entities
 */
import type { AIRequest, Intent } from '@tide/contracts';
import type { ModelClient } from '../types/index.js';
export declare class IntentDetector {
    /**
     * Detect intents from user request
     */
    detect(request: AIRequest, modelClient: ModelClient): Promise<Intent[]>;
    /**
     * Rule-based intent detection (fast)
     */
    private detectWithRules;
    /**
     * Model-based intent detection (accurate)
     */
    private detectWithModel;
    /**
     * Extract email entities
     */
    private extractEmailEntities;
    /**
     * Extract date/time entities
     */
    private extractDateTimeEntities;
    /**
     * Extract task entities
     */
    private extractTaskEntities;
    /**
     * Merge and deduplicate intents
     */
    private mergeIntents;
}
//# sourceMappingURL=intent-detector.d.ts.map