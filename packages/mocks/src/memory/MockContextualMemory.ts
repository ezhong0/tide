/**
 * Mock Contextual Memory (Module 00 - Day 3)
 * In-memory context and session storage
 */

import { IContextualMemory } from '@tide/contracts';
import {
  Result,
  ok,
  err,
  IConversationContext,
  ISessionMemory,
  IRelationshipMap,
  ILearnedPattern,
  ConversationId,
  SessionId,
  UserId,
  Timestamp
} from '@tide/types';

interface StoredContext {
  context: IConversationContext;
  timestamp: Timestamp;
}

interface StoredSession {
  memory: ISessionMemory;
  timestamp: Timestamp;
}

export class MockContextualMemory implements IContextualMemory {
  private contexts: Map<ConversationId, StoredContext> = new Map();
  private sessions: Map<SessionId, StoredSession> = new Map();
  private relationships: Map<UserId, IRelationshipMap> = new Map();
  private memories: Map<UserId, ILearnedPattern[]> = new Map();

  /**
   * Store conversation context
   * @performance <50ms
   */
  async storeContext(
    conversationId: ConversationId,
    context: IConversationContext
  ): Promise<Result<void>> {
    this.contexts.set(conversationId, {
      context,
      timestamp: Date.now() as Timestamp
    });

    return ok(undefined);
  }

  /**
   * Retrieve conversation context
   * @performance <100ms
   */
  async retrieveContext(
    conversationId: ConversationId
  ): Promise<Result<IConversationContext>> {
    const stored = this.contexts.get(conversationId);

    if (!stored) {
      return err(new Error('Context not found'));
    }

    return ok(stored.context);
  }

  /**
   * Store session memory
   * @performance <50ms
   */
  async storeSession(
    sessionId: SessionId,
    memory: ISessionMemory
  ): Promise<Result<void>> {
    this.sessions.set(sessionId, {
      memory,
      timestamp: Date.now() as Timestamp
    });

    return ok(undefined);
  }

  /**
   * Retrieve session memory
   * @performance <100ms
   */
  async retrieveSession(sessionId: SessionId): Promise<Result<ISessionMemory>> {
    const stored = this.sessions.get(sessionId);

    if (!stored) {
      return err(new Error('Session not found'));
    }

    return ok(stored.memory);
  }

  /**
   * Get relationship map for user
   * @performance <100ms
   */
  async getRelationshipMap(userId: UserId): Promise<Result<IRelationshipMap>> {
    let relationshipMap = this.relationships.get(userId);

    if (!relationshipMap) {
      // Return empty relationship map
      relationshipMap = {
        people: {},
        connections: []
      };
      this.relationships.set(userId, relationshipMap);
    }

    return ok(relationshipMap);
  }

  /**
   * Update relationship map
   * @performance <100ms
   */
  async updateRelationshipMap(
    userId: UserId,
    updates: Partial<IRelationshipMap>
  ): Promise<Result<IRelationshipMap>> {
    const currentMap = await this.getRelationshipMap(userId);

    if (!currentMap.success) {
      return currentMap;
    }

    const updatedMap: IRelationshipMap = {
      people: { ...currentMap.data.people, ...(updates.people ?? {}) },
      connections: updates.connections ?? currentMap.data.connections,
      organizationChart: updates.organizationChart ?? currentMap.data.organizationChart
    };

    this.relationships.set(userId, updatedMap);

    return ok(updatedMap);
  }

  /**
   * Search long-term memory
   * @performance <200ms
   */
  async searchMemory(
    userId: UserId,
    query: string,
    limit = 10
  ): Promise<Result<ILearnedPattern[]>> {
    const userMemories = this.memories.get(userId) ?? [];

    if (!query || query.trim() === '') {
      return ok(userMemories.slice(0, limit));
    }

    const lowerQuery = query.toLowerCase();

    // Simple keyword-based search
    const matches = userMemories.filter(memory => {
      return (
        memory.pattern.toLowerCase().includes(lowerQuery) ||
        memory.examples.some(ex => ex.description.toLowerCase().includes(lowerQuery))
      );
    });

    // Sort by relevance (confidence * recency)
    matches.sort((a, b) => {
      const scoreA = a.confidence * (1 / (Date.now() - a.lastUsed + 1));
      const scoreB = b.confidence * (1 / (Date.now() - b.lastUsed + 1));
      return scoreB - scoreA;
    });

    return ok(matches.slice(0, limit));
  }

  /**
   * Merge contexts from multiple conversations
   * @performance <200ms
   */
  async mergeContexts(
    conversationIds: ConversationId[]
  ): Promise<Result<IConversationContext>> {
    if (conversationIds.length === 0) {
      return err(new Error('No conversations provided'));
    }

    const mergedContext: IConversationContext = {
      mentionedPeople: [],
      mentionedDates: [],
      mentionedProjects: [],
      upcomingMeetings: [],
      unreadEmails: 0
    };

    // Collect and deduplicate data from all contexts
    const peopleMap = new Map<string, any>();
    const datesMap = new Map<number, any>();
    const projectsSet = new Set<string>();
    const meetingsMap = new Map<string, any>();

    for (const conversationId of conversationIds) {
      const result = await this.retrieveContext(conversationId);

      if (!result.success) {
        continue; // Skip missing contexts
      }

      const context = result.data;

      // Merge people (deduplicate by email)
      context.mentionedPeople.forEach(person => {
        peopleMap.set(person.email, person);
      });

      // Merge dates (deduplicate by timestamp)
      context.mentionedDates.forEach(date => {
        datesMap.set(date.timestamp, date);
      });

      // Merge projects
      context.mentionedProjects.forEach(project => {
        projectsSet.add(project);
      });

      // Merge meetings (deduplicate by id)
      context.upcomingMeetings.forEach(meeting => {
        meetingsMap.set(meeting.id, meeting);
      });

      // Sum unread emails
      mergedContext.unreadEmails += context.unreadEmails;

      // Use most recent topic
      if (context.topic && !mergedContext.topic) {
        mergedContext.topic = context.topic;
      }

      // Use most recent current task
      if (context.currentTask && !mergedContext.currentTask) {
        mergedContext.currentTask = context.currentTask;
      }

      // Merge pending actions
      if (context.pendingActions) {
        mergedContext.pendingActions = [
          ...(mergedContext.pendingActions ?? []),
          ...context.pendingActions
        ];
      }

      // Use most recent location
      if (context.currentLocation && !mergedContext.currentLocation) {
        mergedContext.currentLocation = context.currentLocation;
      }
    }

    // Convert maps/sets back to arrays
    mergedContext.mentionedPeople = Array.from(peopleMap.values());
    mergedContext.mentionedDates = Array.from(datesMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    mergedContext.mentionedProjects = Array.from(projectsSet);
    mergedContext.upcomingMeetings = Array.from(meetingsMap.values()).sort(
      (a, b) => a.startTime - b.startTime
    );

    return ok(mergedContext);
  }

  /**
   * Clear old context data
   * @performance <500ms
   */
  async clearOldContext(olderThan: number): Promise<Result<number>> {
    let cleared = 0;

    // Clear old contexts
    for (const [conversationId, stored] of this.contexts.entries()) {
      if (stored.timestamp < olderThan) {
        this.contexts.delete(conversationId);
        cleared++;
      }
    }

    // Clear old sessions
    for (const [sessionId, stored] of this.sessions.entries()) {
      if (stored.timestamp < olderThan) {
        this.sessions.delete(sessionId);
        cleared++;
      }
    }

    return ok(cleared);
  }

  // ============================================================================
  // Additional Helper Methods for Testing
  // ============================================================================

  /**
   * Add memory for testing purposes
   */
  async addMemory(userId: UserId, pattern: ILearnedPattern): Promise<void> {
    const userMemories = this.memories.get(userId) ?? [];
    userMemories.push(pattern);
    this.memories.set(userId, userMemories);
  }

  /**
   * Get all stored contexts (for testing)
   */
  getContextCount(): number {
    return this.contexts.size;
  }

  /**
   * Get all stored sessions (for testing)
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}
