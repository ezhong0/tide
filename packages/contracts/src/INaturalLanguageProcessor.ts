/**
 * Natural Language Processing Contract (Module 00)
 * Understands user intent from natural conversation
 *
 * Performance Requirements:
 * - Intent classification: <200ms
 * - Entity extraction: <100ms
 * - Full understanding: <300ms
 */

import {
  Result,
  IUnderstanding,
  IConversationContext,
  IIntent,
  IEntity,
  IAmbiguity
} from '@tide/types';

export interface INaturalLanguageProcessor {
  /**
   * Process a message and understand intent
   * @param message User's message
   * @param context Conversation context for better understanding
   * @returns Understanding with intents, entities, and ambiguities
   * @performance <300ms
   */
  processMessage(
    message: string,
    context: IConversationContext
  ): Promise<Result<IUnderstanding>>;

  /**
   * Classify intent from message
   * @param message User's message
   * @returns Primary intent and confidence
   * @performance <200ms
   */
  classifyIntent(message: string): Promise<Result<IIntent>>;

  /**
   * Extract entities from message
   * @param message User's message
   * @param context Conversation context
   * @returns Extracted entities
   * @performance <100ms
   */
  extractEntities(
    message: string,
    context: IConversationContext
  ): Promise<Result<IEntity[]>>;

  /**
   * Detect ambiguities in message
   * @param message User's message
   * @param understanding Current understanding
   * @returns List of ambiguities requiring clarification
   * @performance <100ms
   */
  detectAmbiguities(
    message: string,
    understanding: IUnderstanding
  ): Promise<Result<IAmbiguity[]>>;

  /**
   * Resolve references (pronouns, "that meeting", etc.)
   * @param text Text with references
   * @param context Conversation context
   * @returns Resolved references
   * @performance <50ms per reference
   */
  resolveReferences(
    text: string,
    context: IConversationContext
  ): Promise<Result<Record<string, unknown>>>;
}
