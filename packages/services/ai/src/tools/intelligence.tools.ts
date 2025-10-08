/**
 * Intelligence Tools - Wrapping Advanced Agents
 * These tools provide sophisticated AI capabilities by wrapping existing agents
 */

import { createLogger } from '@tide/logger';
import type { TideTool, ToolContext } from './types.js';
import type { AgentTask, AgentExecutionContext } from '../types/index.js';
import { ModelClientFactory } from '../models/clients/index.js';

const logger = createLogger({ component: 'IntelligenceTools' });

/**
 * Prepare comprehensive meeting brief
 * Wraps MeetingPrepAgent for sophisticated meeting intelligence
 */
export const prepareMeetingTool: TideTool = {
  type: 'function',
  name: 'prepare_meeting',
  description: 'Generate comprehensive meeting brief with attendee insights, talking points, and agenda. Use this to prepare for upcoming meetings.',
  parameters: {
    type: 'object',
    properties: {
      eventId: {
        type: 'string',
        description: 'Calendar event ID for the meeting',
      },
      includeAttendeeInsights: {
        type: 'boolean',
        description: 'Include analysis of attendee relationships and communication patterns',
      },
      includePreparationTasks: {
        type: 'boolean',
        description: 'Generate list of preparation tasks to complete before meeting',
      },
    },
    required: ['eventId'],
  },
  handler: async (params, context) => {
    logger.info('Preparing meeting brief', {
      userId: context.userId,
      eventId: params.eventId,
    });

    try {
      // Dynamically import to avoid circular dependencies
      const { MeetingPrepAgent } = await import('../agents/calendar/meeting-prep-agent.js');
      const agent = new MeetingPrepAgent();

      const task: AgentTask = {
        agentType: 'calendar.prep',
        input: `Event ID: ${params.eventId}`,
        context: params,
        critical: true,
      };

      const execContext: AgentExecutionContext = {
        requestId: context.requestId,
        userId: context.userId,
        timestamp: context.timestamp,
        modelClient: ModelClientFactory.getClient('gpt-5'),
      };

      const result = await agent.execute(task, execContext);

      if (!result.output) {
        throw new Error('Meeting prep agent returned no output');
      }

      return {
        success: true,
        brief: result.output,
        confidence: result.confidence,
      };
    } catch (error) {
      logger.error('Meeting prep failed', { error, eventId: params.eventId });
      throw error;
    }
  },
};

/**
 * Analyze professional relationship
 * Wraps RelationshipAgent for relationship intelligence
 */
export const analyzeRelationshipTool: TideTool = {
  type: 'function',
  name: 'analyze_relationship',
  description: 'Analyze professional relationship with a contact, including interaction patterns, sentiment, and recommendations',
  parameters: {
    type: 'object',
    properties: {
      contactEmail: {
        type: 'string',
        description: 'Email address of the contact to analyze',
      },
      includeHistory: {
        type: 'boolean',
        description: 'Include interaction history analysis',
      },
    },
    required: ['contactEmail'],
  },
  handler: async (params, context) => {
    logger.info('Analyzing relationship', {
      userId: context.userId,
      contactEmail: params.contactEmail,
    });

    try {
      const { RelationshipAgent } = await import('../agents/email/relationship-agent.js');
      const agent = new RelationshipAgent();

      const task: AgentTask = {
        agentType: 'email.relationship',
        input: `Analyze relationship with: ${params.contactEmail}`,
        context: params,
        critical: false,
      };

      const execContext: AgentExecutionContext = {
        requestId: context.requestId,
        userId: context.userId,
        timestamp: context.timestamp,
        modelClient: ModelClientFactory.getClient('gpt-5-nano'),
      };

      const result = await agent.execute(task, execContext);

      return {
        success: true,
        relationship: result.output,
        confidence: result.confidence,
      };
    } catch (error) {
      logger.error('Relationship analysis failed', { error, contactEmail: params.contactEmail });
      throw error;
    }
  },
};

/**
 * Get decision recommendation
 * Wraps RecommendationEngineAgent for decision support
 */
export const recommendDecisionTool: TideTool = {
  type: 'function',
  name: 'recommend_decision',
  description: 'Generate recommendations for a decision with confidence scores, reasoning, and tradeoff analysis',
  parameters: {
    type: 'object',
    properties: {
      decisionType: {
        type: 'string',
        description: 'Type of decision (e.g., "budget_approval", "hire_decision", "vendor_selection")',
      },
      context: {
        type: 'object',
        description: 'Decision context including options, constraints, and criteria',
      },
      priorityCriteria: {
        type: 'array',
        items: { type: 'string' },
        description: 'Priority criteria for evaluation (e.g., ["cost", "timeline", "quality"])',
      },
    },
    required: ['decisionType', 'context'],
  },
  handler: async (params, context) => {
    logger.info('Generating decision recommendation', {
      userId: context.userId,
      decisionType: params.decisionType,
    });

    try {
      const { RecommendationEngineAgent } = await import('../agents/decision/recommendation-engine-agent.js');
      const agent = new RecommendationEngineAgent();

      const task: AgentTask = {
        agentType: 'decision.recommender',
        input: `Decision type: ${params.decisionType}`,
        context: params,
        critical: true,
      };

      const execContext: AgentExecutionContext = {
        requestId: context.requestId,
        userId: context.userId,
        timestamp: context.timestamp,
        modelClient: ModelClientFactory.getClient('gpt-5-mini'),
      };

      const result = await agent.execute(task, execContext);

      return {
        success: true,
        recommendations: result.output.recommendations || [],
        alternatives: result.output.alternativeApproaches || [],
        tradeoffs: result.output.tradeoffs || '',
        confidence: result.confidence,
      };
    } catch (error) {
      logger.error('Decision recommendation failed', { error, decisionType: params.decisionType });
      throw error;
    }
  },
};

/**
 * Compose email with multi-draft options
 * Wraps EmailComposerAgent for sophisticated composition
 */
export const composeEmailAdvancedTool: TideTool = {
  type: 'function',
  name: 'compose_email_advanced',
  description: 'Compose email with multiple draft options (brief, balanced, detailed) and tone matching',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient email address',
      },
      subject: {
        type: 'string',
        description: 'Email subject',
      },
      purpose: {
        type: 'string',
        description: 'Purpose of the email (e.g., "request", "response", "update", "introduction")',
      },
      context: {
        type: 'string',
        description: 'Additional context or key points to include',
      },
      tone: {
        type: 'string',
        enum: ['professional', 'friendly', 'formal', 'casual'],
        description: 'Desired tone of the email',
      },
      draftOptions: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['brief', 'balanced', 'detailed'],
        },
        description: 'Which draft lengths to generate (default: all three)',
      },
    },
    required: ['to', 'subject', 'purpose'],
  },
  handler: async (params, context) => {
    logger.info('Composing advanced email', {
      userId: context.userId,
      to: params.to,
      subject: params.subject,
    });

    try {
      const { EmailComposerAgent } = await import('../agents/email/composer-agent.js');
      const agent = new EmailComposerAgent();

      const task: AgentTask = {
        agentType: 'email.composer',
        input: `To: ${params.to}\nSubject: ${params.subject}\nPurpose: ${params.purpose}\nContext: ${params.context || ''}`,
        context: {
          ...params,
          userEmail: context.userEmail,
        },
        critical: false,
      };

      const execContext: AgentExecutionContext = {
        requestId: context.requestId,
        userId: context.userId,
        timestamp: context.timestamp,
        modelClient: ModelClientFactory.getClient('gpt-5-mini'),
      };

      const result = await agent.execute(task, execContext);

      return {
        success: true,
        drafts: result.output.drafts || [],
        recommendedDraft: result.output.recommendedDraft || 'balanced',
        confidence: result.confidence,
      };
    } catch (error) {
      logger.error('Advanced email composition failed', { error, to: params.to });
      throw error;
    }
  },
};

/**
 * All intelligence tools
 */
export const intelligenceTools: TideTool[] = [
  prepareMeetingTool,
  analyzeRelationshipTool,
  recommendDecisionTool,
  composeEmailAdvancedTool,
];
