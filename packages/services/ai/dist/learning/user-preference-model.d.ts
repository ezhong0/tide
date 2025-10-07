/**
 * User Preference Model
 * Tracks and learns user preferences over time
 */
import type { UserLearningModel, CommunicationStyle, SchedulingPreferences, DecisionPattern, RelationshipInsight } from '@tide/contracts';
export declare class UserPreferenceModel {
    private models;
    /**
     * Get or create user model
     */
    getUserModel(userId: string): Promise<UserLearningModel>;
    /**
     * Update communication style
     */
    updateCommunicationStyle(userId: string, style: Partial<CommunicationStyle>): Promise<void>;
    /**
     * Update scheduling preferences
     */
    updateSchedulingPreferences(userId: string, prefs: Partial<SchedulingPreferences>): Promise<void>;
    /**
     * Add decision pattern
     */
    addDecisionPattern(userId: string, pattern: DecisionPattern): Promise<void>;
    /**
     * Update relationship insight
     */
    updateRelationship(userId: string, insight: RelationshipInsight): Promise<void>;
    /**
     * Get communication style
     */
    getCommunicationStyle(userId: string): Promise<CommunicationStyle>;
    /**
     * Get scheduling preferences
     */
    getSchedulingPreferences(userId: string): Promise<SchedulingPreferences>;
    /**
     * Get decision patterns
     */
    getDecisionPatterns(userId: string, category?: string): Promise<DecisionPattern[]>;
    /**
     * Get relationship insights
     */
    getRelationships(userId: string): Promise<RelationshipInsight[]>;
    /**
     * Get top important contacts
     */
    getTopContacts(userId: string, limit?: number): Promise<RelationshipInsight[]>;
    /**
     * Create default user model
     */
    private createDefaultModel;
    /**
     * Export model (for persistence)
     */
    exportModel(userId: string): Promise<UserLearningModel | null>;
    /**
     * Import model (from persistence)
     */
    importModel(model: UserLearningModel): Promise<void>;
}
//# sourceMappingURL=user-preference-model.d.ts.map