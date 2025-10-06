/**
 * Context Service Contract
 * Manages user context, relationships, and learning
 *
 * Performance Requirements:
 * - Get context: <50ms cached, <200ms uncached
 * - Update context: <100ms
 * - Relationship lookup: <50ms
 */

import { Result, UUID, UserId, Email } from '@tide/types';
import {
  UserContext, UserProfile, Relationship, Contact,
  ContextPreferences, WorkContext, BehaviorProfile,
  LearningProfile, Project, Team, Goal,
  Priority, LearnedPreference, ImprovementArea
} from '@tide/types';

export interface IContextService {
  /**
   * Get complete user context
   * @param userId User identifier
   * @returns Complete user context including profile, relationships, preferences
   * @performance <50ms cached, <200ms uncached
   */
  getUserContext(userId: UserId): Promise<Result<UserContext>>;

  /**
   * Update user context
   * @param userId User identifier
   * @param updates Partial context updates
   * @returns Updated context
   * @performance <100ms
   */
  updateUserContext(
    userId: UserId,
    updates: Partial<UserContext>
  ): Promise<Result<UserContext>>;

  /**
   * Get user profile
   * @param userId User identifier
   * @returns User profile information
   * @performance <30ms cached
   */
  getUserProfile(userId: UserId): Promise<Result<UserProfile>>;

  /**
   * Update user profile
   * @param userId User identifier
   * @param updates Profile updates
   * @returns Updated profile
   * @performance <100ms
   */
  updateUserProfile(
    userId: UserId,
    updates: Partial<UserProfile>
  ): Promise<Result<UserProfile>>;

  /**
   * Get all relationships for a user
   * @param userId User identifier
   * @returns Array of relationships
   * @performance <100ms
   */
  getRelationships(userId: UserId): Promise<Result<Relationship[]>>;

  /**
   * Get specific relationship by contact
   * @param userId User identifier
   * @param contactEmail Contact's email
   * @returns Relationship details
   * @performance <50ms
   */
  getRelationship(userId: UserId, contactEmail: Email): Promise<Result<Relationship>>;

  /**
   * Add or update a relationship
   * @param userId User identifier
   * @param relationship Relationship to add/update
   * @returns Relationship ID
   * @performance <100ms
   */
  upsertRelationship(
    userId: UserId,
    relationship: Omit<Relationship, 'relationshipId'>
  ): Promise<Result<UUID>>;

  /**
   * Update relationship strength based on interaction
   * @param userId User identifier
   * @param contactEmail Contact's email
   * @param interactionType Type of interaction
   * @returns Updated relationship
   * @performance <50ms
   */
  recordInteraction(
    userId: UserId,
    contactEmail: Email,
    interactionType: InteractionType
  ): Promise<Result<Relationship>>;

  /**
   * Get context-aware preferences
   * @param userId User identifier
   * @returns User preferences
   * @performance <30ms cached
   */
  getPreferences(userId: UserId): Promise<Result<ContextPreferences>>;

  /**
   * Update preferences
   * @param userId User identifier
   * @param preferences Updated preferences
   * @returns Success status
   * @performance <100ms
   */
  updatePreferences(
    userId: UserId,
    preferences: Partial<ContextPreferences>
  ): Promise<Result<void>>;

  /**
   * Get work context including projects and teams
   * @param userId User identifier
   * @returns Work context
   * @performance <100ms cached
   */
  getWorkContext(userId: UserId): Promise<Result<WorkContext>>;

  /**
   * Add a project to work context
   * @param userId User identifier
   * @param project Project details
   * @returns Project ID
   * @performance <100ms
   */
  addProject(
    userId: UserId,
    project: Omit<Project, 'projectId'>
  ): Promise<Result<UUID>>;

  /**
   * Update project status or details
   * @param projectId Project identifier
   * @param updates Project updates
   * @returns Updated project
   * @performance <100ms
   */
  updateProject(
    projectId: UUID,
    updates: Partial<Project>
  ): Promise<Result<Project>>;

  /**
   * Add or update a team
   * @param userId User identifier
   * @param team Team details
   * @returns Team ID
   * @performance <100ms
   */
  upsertTeam(
    userId: UserId,
    team: Omit<Team, 'teamId'>
  ): Promise<Result<UUID>>;

  /**
   * Add or update a goal
   * @param userId User identifier
   * @param goal Goal details
   * @returns Goal ID
   * @performance <100ms
   */
  upsertGoal(
    userId: UserId,
    goal: Omit<Goal, 'goalId'>
  ): Promise<Result<UUID>>;

  /**
   * Update goal progress
   * @param goalId Goal identifier
   * @param progress Progress percentage (0-100)
   * @returns Updated goal
   * @performance <50ms
   */
  updateGoalProgress(goalId: UUID, progress: number): Promise<Result<Goal>>;

  /**
   * Add or update a priority
   * @param userId User identifier
   * @param priority Priority details
   * @returns Priority ID
   * @performance <100ms
   */
  upsertPriority(
    userId: UserId,
    priority: Omit<Priority, 'priorityId'>
  ): Promise<Result<UUID>>;

  /**
   * Get behavior profile with patterns and routines
   * @param userId User identifier
   * @returns Behavior profile
   * @performance <100ms
   */
  getBehaviorProfile(userId: UserId): Promise<Result<BehaviorProfile>>;

  /**
   * Learn from user behavior
   * @param userId User identifier
   * @param observation Behavior observation
   * @returns Learning result
   * @performance <200ms
   */
  learnBehavior(
    userId: UserId,
    observation: BehaviorObservation
  ): Promise<Result<LearningResult>>;

  /**
   * Get learning profile with preferences and improvements
   * @param userId User identifier
   * @returns Learning profile
   * @performance <50ms
   */
  getLearningProfile(userId: UserId): Promise<Result<LearningProfile>>;

  /**
   * Record learned preference
   * @param userId User identifier
   * @param preference Learned preference
   * @returns Success status
   * @performance <100ms
   */
  recordLearnedPreference(
    userId: UserId,
    preference: Omit<LearnedPreference, 'preferenceId'>
  ): Promise<Result<void>>;

  /**
   * Get improvement suggestions
   * @param userId User identifier
   * @returns Array of improvement areas
   * @performance <200ms
   */
  getImprovementSuggestions(userId: UserId): Promise<Result<ImprovementArea[]>>;

  /**
   * Search contacts by name or company
   * @param userId User identifier
   * @param query Search query
   * @returns Matching contacts
   * @performance <100ms
   */
  searchContacts(userId: UserId, query: string): Promise<Result<Contact[]>>;

  /**
   * Get context for a specific time
   * @param userId User identifier
   * @param timestamp Point in time
   * @returns Context at that time
   * @performance <200ms
   */
  getContextAtTime(userId: UserId, timestamp: number): Promise<Result<UserContext>>;

  /**
   * Get relationship recommendations
   * @param userId User identifier
   * @returns Recommended actions for relationships
   * @performance <300ms
   */
  getRelationshipRecommendations(
    userId: UserId
  ): Promise<Result<RelationshipRecommendation[]>>;

  /**
   * Analyze workload and stress
   * @param userId User identifier
   * @returns Workload analysis
   * @performance <200ms
   */
  analyzeWorkload(userId: UserId): Promise<Result<WorkloadAnalysis>>;

  /**
   * Export user context
   * @param userId User identifier
   * @returns Exported context data
   * @performance <500ms
   */
  exportContext(userId: UserId): Promise<Result<ContextExport>>;

  /**
   * Import user context
   * @param contextData Context data to import
   * @returns Success status
   * @performance <1000ms
   */
  importContext(contextData: ContextExport): Promise<Result<void>>;
}

// Supporting types
export type InteractionType = 'email_sent' | 'email_received' | 'meeting' | 'call' | 'message';

export interface BehaviorObservation {
  type: string;
  action: string;
  context: Record<string, unknown>;
  timestamp: number;
}

export interface LearningResult {
  patternsIdentified: number;
  confidenceImprovement: number;
  newPreferences: LearnedPreference[];
}

export interface RelationshipRecommendation {
  contactEmail: Email;
  action: 'reach_out' | 'schedule_meeting' | 'follow_up' | 'strengthen';
  reason: string;
  priority: 'low' | 'medium' | 'high';
  suggestedMessage?: string;
}

export interface WorkloadAnalysis {
  currentUtilization: number;
  stressLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  upcomingDeadlines: Priority[];
  suggestedDelegations: Task[];
}

export interface Task {
  description: string;
  estimatedHours: number;
  delegateTo?: string;
}

export interface ContextExport {
  userId: UserId;
  version: string;
  exportedAt: number;
  profile: UserProfile;
  relationships: Relationship[];
  preferences: ContextPreferences;
  workContext: WorkContext;
  behaviorProfile: BehaviorProfile;
  learningProfile: LearningProfile;
}