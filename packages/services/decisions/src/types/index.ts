import type { UserId } from '@tide/types';

export type DecisionType =
  | 'approval'
  | 'choice'
  | 'prioritization'
  | 'scheduling'
  | 'budget'
  | 'hire'
  | 'partnership'
  | 'strategic'
  | 'operational';

export type DecisionStatus = 'pending' | 'approved' | 'declined' | 'deferred' | 'discussed';

export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export interface Decision {
  id: string;
  userId: UserId;
  title: string;
  description: string;
  decisionType: DecisionType;
  context: DecisionContext;
  options: DecisionOption[];
  aiRecommendation?: AIRecommendation;
  userDecision?: UserDecision;
  status: DecisionStatus;
  urgency: Urgency;
  deadline?: Date;
  requesterName?: string;
  requesterEmail?: string;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecisionContext {
  background: string;
  stakeholders: string[];
  impact: 'low' | 'medium' | 'high';
  historicalContext?: string;
  relatedDecisions?: string[];
  financialImplications?: {
    amount: number;
    currency: string;
    description?: string;
  };
  timeConstraints?: {
    mustDecideBy?: Date;
    affectsDeadline?: Date;
  };
  risks?: string[];
  dependencies?: string[];
}

export interface DecisionOption {
  id: string;
  option: string;
  pros: string[];
  cons: string[];
  estimatedImpact: string;
  feasibility: number; // 0-1
  cost?: number;
  timeRequired?: number; // minutes
  risks?: string[];
}

export interface AIRecommendation {
  recommendedOption: string;
  reasoning: string;
  confidence: number;
  alternatives?: string[];
  risks?: string[];
  considerations?: string[];
  historicalSimilarDecisions?: SimilarDecision[];
}

export interface SimilarDecision {
  decisionId: string;
  title: string;
  userChose: string;
  outcome: 'positive' | 'neutral' | 'negative';
  similarity: number; // 0-1
}

export interface UserDecision {
  chosenOption: string;
  reasoning?: string;
  modifications?: Record<string, unknown>;
  followUpActions?: string[];
}

export interface DecisionInput {
  title: string;
  description: string;
  decisionType: DecisionType;
  context: Partial<DecisionContext>;
  options?: Partial<DecisionOption>[];
  urgency?: Urgency;
  deadline?: Date;
  requesterName?: string;
  requesterEmail?: string;
}

export interface DecisionAnalysis {
  decision: Decision;
  recommendation: AIRecommendation;
  context: DecisionContext;
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  identifiedRisks: Risk[];
  mitigationStrategies: string[];
}

export interface Risk {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  mitigation?: string;
}
