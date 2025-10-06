/**
 * Context domain types for user context management and learning
 */
import { UUID, Timestamp, UserId, Email, PhoneNumber } from '../base.types';
export type ContextType = 'personal' | 'professional' | 'preferences' | 'behavioral';
export type RelationshipType = 'colleague' | 'manager' | 'report' | 'client' | 'vendor' | 'personal' | 'family';
export type CommunicationChannel = 'email' | 'phone' | 'sms' | 'slack' | 'teams' | 'in-person';
export interface UserContext {
    userId: UserId;
    profile: UserProfile;
    relationships: Relationship[];
    preferences: ContextPreferences;
    workContext: WorkContext;
    behavior: BehaviorProfile;
    learningProfile: LearningProfile;
    lastUpdated: Timestamp;
}
export interface UserProfile {
    userId: UserId;
    name: string;
    email: Email;
    phone?: PhoneNumber;
    timezone: string;
    language: string;
    location?: Location;
    avatar?: string;
    bio?: string;
    title?: string;
    department?: string;
    company?: string;
}
export interface Location {
    city?: string;
    state?: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface Relationship {
    relationshipId: UUID;
    userId: UserId;
    contact: Contact;
    type: RelationshipType;
    strength: number;
    lastInteraction: Timestamp;
    interactionFrequency: InteractionFrequency;
    communicationPreferences: CommunicationPreference[];
    notes?: string;
    tags?: string[];
}
export interface Contact {
    contactId: UUID;
    name: string;
    email?: Email;
    phone?: PhoneNumber;
    title?: string;
    company?: string;
    linkedIn?: string;
    twitter?: string;
    avatar?: string;
    timezone?: string;
    preferredName?: string;
}
export interface InteractionFrequency {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}
export interface CommunicationPreference {
    channel: CommunicationChannel;
    priority: number;
    bestTimes?: TimeWindow[];
    responseTime?: number;
}
export interface TimeWindow {
    day?: 'weekday' | 'weekend' | DayOfWeek;
    startTime: string;
    endTime: string;
}
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export interface ContextPreferences {
    userId: UserId;
    emailStyle: EmailStyle;
    meetingPreferences: MeetingPreferences;
    responseTimeExpectations: ResponseExpectations;
    workingHours: WorkingHours;
    focusTime: FocusTimePreferences;
    breakPreferences: BreakPreferences;
    aiAssistanceLevel: 'minimal' | 'balanced' | 'proactive';
    automationPreferences: AutomationPreferences;
    privacyLevel: 'strict' | 'balanced' | 'relaxed';
}
export interface EmailStyle {
    formality: 'casual' | 'professional' | 'formal';
    length: 'brief' | 'moderate' | 'detailed';
    signature: string;
    autoCC?: Email[];
    templates?: UUID[];
}
export interface MeetingPreferences {
    defaultDuration: number;
    bufferTime: number;
    preferredTimes: TimeWindow[];
    avoidTimes: TimeWindow[];
    preferredTypes: ('in-person' | 'video' | 'phone')[];
    maxDailyMeetings?: number;
    maxConsecutiveHours?: number;
}
export interface ResponseExpectations {
    email: number;
    slack: number;
    urgent: number;
    nonUrgent: number;
}
export interface WorkingHours {
    regular: DaySchedule[];
    exceptions?: DateException[];
    timezone: string;
    flexibleHours: boolean;
}
export interface DaySchedule {
    day: DayOfWeek;
    isWorkingDay: boolean;
    startTime?: string;
    endTime?: string;
    lunchBreak?: TimeWindow;
}
export interface DateException {
    date: Timestamp;
    isWorkingDay: boolean;
    reason?: string;
}
export interface FocusTimePreferences {
    enabled: boolean;
    dailyMinimum: number;
    preferredTimes: TimeWindow[];
    autoDeclineMeetings: boolean;
    silenceNotifications: boolean;
}
export interface BreakPreferences {
    frequency: number;
    duration: number;
    types: ('stretch' | 'walk' | 'meditation' | 'snack')[];
    reminders: boolean;
}
export interface AutomationPreferences {
    autoScheduleMeetings: boolean;
    autoDraftResponses: boolean;
    autoOrganizeEmail: boolean;
    autoSummarize: boolean;
    requireApproval: boolean;
    excludedDomains?: string[];
}
export interface WorkContext {
    userId: UserId;
    projects: Project[];
    teams: Team[];
    goals: Goal[];
    currentPriorities: Priority[];
    workload: WorkloadAnalysis;
}
export interface Project {
    projectId: UUID;
    name: string;
    description?: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: Timestamp;
    team?: UUID[];
    milestones?: Milestone[];
    tags?: string[];
}
export interface Milestone {
    milestoneId: UUID;
    name: string;
    dueDate: Timestamp;
    status: 'pending' | 'in-progress' | 'completed' | 'delayed';
    completionPercentage: number;
}
export interface Team {
    teamId: UUID;
    name: string;
    members: TeamMember[];
    slackChannel?: string;
    teamsChannel?: string;
    emailList?: Email;
}
export interface TeamMember {
    userId: UserId;
    name: string;
    role: string;
    email: Email;
    isManager: boolean;
}
export interface Goal {
    goalId: UUID;
    title: string;
    description?: string;
    type: 'quarterly' | 'annual' | 'project' | 'personal';
    targetDate: Timestamp;
    progress: number;
    keyResults?: KeyResult[];
    status: 'not-started' | 'in-progress' | 'at-risk' | 'completed';
}
export interface KeyResult {
    krId: UUID;
    description: string;
    target: number;
    current: number;
    unit: string;
}
export interface Priority {
    priorityId: UUID;
    title: string;
    description?: string;
    dueDate?: Timestamp;
    importance: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    relatedProject?: UUID;
    estimatedHours?: number;
}
export interface WorkloadAnalysis {
    currentUtilization: number;
    averageHoursPerWeek: number;
    upcomingDeadlines: number;
    overdueItems: number;
    stressLevel: 'low' | 'moderate' | 'high' | 'critical';
    recommendations?: string[];
}
export interface BehaviorProfile {
    userId: UserId;
    patterns: BehaviorPattern[];
    routines: Routine[];
    productivity: ProductivityMetrics;
    communication: CommunicationMetrics;
}
export interface BehaviorPattern {
    patternId: UUID;
    type: string;
    description: string;
    frequency: number;
    confidence: number;
    firstObserved: Timestamp;
    lastObserved: Timestamp;
    examples: string[];
}
export interface Routine {
    routineId: UUID;
    name: string;
    type: 'daily' | 'weekly' | 'monthly';
    activities: Activity[];
    consistency: number;
}
export interface Activity {
    type: string;
    typicalTime: string;
    duration: number;
    frequency: number;
}
export interface ProductivityMetrics {
    peakHours: number[];
    averageFocusTime: number;
    taskCompletionRate: number;
    multitaskingIndex: number;
    distractionSources: DistractionSource[];
}
export interface DistractionSource {
    source: string;
    frequency: number;
    averageDuration: number;
    impact: 'low' | 'medium' | 'high';
}
export interface CommunicationMetrics {
    averageResponseTime: Record<CommunicationChannel, number>;
    messageVolume: Record<CommunicationChannel, number>;
    initiationRate: number;
    preferredChannels: CommunicationChannel[];
    communicationStyle: 'brief' | 'detailed' | 'balanced';
}
export interface LearningProfile {
    userId: UserId;
    adaptationRate: number;
    correctPredictions: number;
    incorrectPredictions: number;
    feedbackIncorporated: number;
    preferencesLearned: LearnedPreference[];
    improvementAreas: ImprovementArea[];
}
export interface LearnedPreference {
    preferenceId: UUID;
    category: string;
    pattern: string;
    confidence: number;
    evidence: Evidence[];
    appliedCount: number;
}
export interface Evidence {
    type: 'observation' | 'feedback' | 'correction';
    description: string;
    timestamp: Timestamp;
    weight: number;
}
export interface ImprovementArea {
    area: string;
    currentPerformance: number;
    targetPerformance: number;
    suggestedActions: string[];
    priority: 'low' | 'medium' | 'high';
}
export interface ContextUpdate {
    updateId: UUID;
    userId: UserId;
    updateType: ContextType;
    changes: Record<string, unknown>;
    source: 'user' | 'system' | 'learned';
    timestamp: Timestamp;
    confidence?: number;
}
//# sourceMappingURL=context.types.d.ts.map