/**
 * Conversational AI Types (Module 00)
 * Text-first conversational interface with deep productivity integration
 */
import type { UUID, Timestamp, Email } from '../base.types';
import type { UserId } from '../base.types';
export type ConversationId = UUID;
export type MessageId = UUID;
export type SessionId = UUID;
export type ConversationStatus = 'active' | 'idle' | 'completed';
export type MessageRole = 'user' | 'assistant' | 'system';
export type InputMethod = 'typed' | 'voice_to_text' | 'button' | 'suggestion';
export type FeedbackType = 'helpful' | 'not_helpful';
export interface IConversation {
    id: ConversationId;
    userId: UserId;
    messages: IMessage[];
    context: IConversationContext;
    status: ConversationStatus;
    startedAt: Timestamp;
    lastActiveAt: Timestamp;
}
export interface IMessage {
    id: MessageId;
    role: MessageRole;
    content: string;
    timestamp: Timestamp;
    inputMethod: InputMethod;
    actions?: IAction[];
    suggestions?: ISuggestion[];
    preview?: IActionPreview;
    feedback?: FeedbackType;
    edited?: boolean;
}
export interface IConversationContext {
    topic?: string;
    currentTask?: ITask;
    pendingActions?: IAction[];
    mentionedPeople: IPerson[];
    mentionedDates: IDateRef[];
    mentionedProjects: string[];
    upcomingMeetings: IMeeting[];
    unreadEmails: number;
    currentLocation?: string;
}
export interface IPerson {
    userId?: UserId;
    email: Email;
    name: string;
    role?: string;
    relationship?: 'manager' | 'direct_report' | 'peer' | 'client' | 'vendor';
}
export interface IDateRef {
    timestamp: Timestamp;
    description: string;
    relative?: string;
}
export interface IMeeting {
    id: UUID;
    title: string;
    startTime: Timestamp;
    endTime: Timestamp;
    attendees: IPerson[];
    location?: string;
}
export interface ITask {
    id: UUID;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}
export type ActionType = 'send_email' | 'schedule_meeting' | 'reschedule_meeting' | 'cancel_meeting' | 'draft_email' | 'search_emails' | 'summarize_thread' | 'create_task' | 'set_reminder' | 'reply_email' | 'forward_email';
export interface IAction {
    type: ActionType;
    description: string;
    params: Record<string, unknown>;
    requiresConfirmation: boolean;
    riskLevel?: 'low' | 'medium' | 'high';
}
export interface IActionPreview {
    summary: string;
    details: IActionDetails;
    risks?: IRisk[];
    alternatives?: IAlternative[];
    editable: boolean;
    editableFields?: string[];
}
export interface IActionDetails {
    action: ActionType;
    targetResource?: string;
    changes: Record<string, unknown>;
    affectedItems?: string[];
}
export interface IRisk {
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigation?: string;
}
export interface IAlternative {
    description: string;
    action: ActionType;
    params?: Record<string, unknown>;
}
export interface IActionResult {
    success: boolean;
    action: IAction;
    result?: unknown;
    error?: string;
    undoable: boolean;
    undoWindow?: number;
}
export interface ISuggestion {
    id: string;
    text: string;
    type: 'quick_reply' | 'action' | 'question' | 'completion';
    action?: IAction;
    confidence?: number;
}
export interface IQuickReply {
    text: string;
    action?: IAction;
}
export interface IShortcut {
    id: string;
    name: string;
    description: string;
    icon?: string;
    action: IAction;
}
export type IntentType = 'schedule_meeting' | 'draft_email' | 'search_emails' | 'check_calendar' | 'set_reminder' | 'create_task' | 'find_time' | 'reply_email' | 'forward_email' | 'cancel_meeting' | 'reschedule_meeting' | 'summarize_emails' | 'unknown';
export interface IIntent {
    type: IntentType;
    confidence: number;
    params?: Record<string, unknown>;
}
export interface IEntity {
    type: string;
    value: string;
    position: [number, number];
    confidence: number;
}
export interface IAmbiguity {
    type: string;
    question: string;
    options?: string[];
}
export interface IUnderstanding {
    intents: IIntent[];
    entities: IEntity[];
    ambiguities?: IAmbiguity[];
    confidence: number;
}
export interface IUserPreferences {
    communicationStyle?: 'concise' | 'detailed' | 'bullet_points';
    meetingPreferences?: IMeetingPreferences;
    emailPreferences?: IEmailPreferences;
    workingHours?: IWorkingHours;
    notificationSettings?: INotificationSettings;
}
export interface IMeetingPreferences {
    defaultDuration?: number;
    preferredTimes?: string[];
    avoidTimes?: string[];
    bufferBefore?: number;
    bufferAfter?: number;
    preferredDays?: string[];
    maxPerDay?: number;
}
export interface IEmailPreferences {
    defaultTone?: 'formal' | 'casual' | 'friendly' | 'professional';
    signature?: string;
    autoReplyDelay?: number;
    priorityRules?: IPriorityRule[];
}
export interface IPriorityRule {
    condition: string;
    priority: 'high' | 'urgent';
    action?: 'notify' | 'flag' | 'auto_reply';
}
export interface IWorkingHours {
    timezone: string;
    schedule: IWeeklySchedule[];
    exceptions?: IScheduleException[];
}
export interface IWeeklySchedule {
    day: 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
    isWorkingDay: boolean;
    start?: string;
    end?: string;
    breaks?: IBreak[];
}
export interface IBreak {
    start: string;
    end: string;
    description?: string;
}
export interface IScheduleException {
    date: Timestamp;
    isWorkingDay: boolean;
    reason?: string;
}
export interface INotificationSettings {
    enabled: boolean;
    quietHours?: {
        start: string;
        end: string;
    };
    channels: ('email' | 'push' | 'sms')[];
    priorities: ('high' | 'urgent')[];
}
export interface ILearnedPattern {
    pattern: string;
    confidence: number;
    examples: IExample[];
    firstSeen: Timestamp;
    lastUsed: Timestamp;
    usageCount: number;
}
export interface IExample {
    description: string;
    timestamp: Timestamp;
    context?: string;
}
export interface ISessionMemory {
    sessionId: SessionId;
    startTime: Timestamp;
    messages: IMessage[];
    context: IConversationContext;
    activeTopics: string[];
}
export interface IRelationshipMap {
    people: Record<string, IPerson>;
    connections: IConnection[];
    organizationChart?: IOrganizationChart;
}
export interface IConnection {
    from: UserId;
    to: UserId;
    relationship: string;
    strength: number;
}
export interface IOrganizationChart {
    reporting: Record<string, UserId>;
    teams: Record<string, UserId[]>;
}
export interface ITextInput {
    value: string;
    placeholder: string;
    autocomplete: boolean;
    suggestions: string[];
    mentionSupport: boolean;
    multiline: boolean;
    maxLength?: number;
    keyboardType: 'default' | 'email-address' | 'punctuation';
}
export interface IVoiceInput {
    isListening: boolean;
    allowEditBeforeSend: boolean;
    partialTranscript?: string;
    finalTranscript?: string;
}
export interface IQuickButton {
    id: string;
    label: string;
    icon?: string;
    action: () => void;
}
export interface ISwipeAction {
    direction: 'left' | 'right';
    label: string;
    icon?: string;
    color?: string;
    action: IAction;
}
export interface INotificationAction {
    label: string;
    action: IAction;
    requiresUnlock?: boolean;
}
export interface IWidget {
    type: 'quick_actions' | 'recent_conversations' | 'suggestions';
    size: 'small' | 'medium' | 'large';
    content: unknown;
}
export interface IResponse {
    messageId: MessageId;
    content: string;
    role: MessageRole;
    actions?: IAction[];
    suggestions?: ISuggestion[];
    preview?: IActionPreview;
    cards?: ICard[];
    streamingComplete?: boolean;
}
export interface ICard {
    type: 'meeting' | 'email' | 'task' | 'summary' | 'action';
    title: string;
    subtitle?: string;
    content?: string;
    actions?: ICardAction[];
    metadata?: Record<string, unknown>;
}
export interface ICardAction {
    label: string;
    action: IAction;
    style?: 'primary' | 'secondary' | 'destructive';
}
export interface IInteraction {
    userId: UserId;
    timestamp: Timestamp;
    type: 'message' | 'action' | 'feedback' | 'preference_change';
    data: unknown;
    outcome?: 'success' | 'failure' | 'abandoned';
}
export interface IConfirmation {
    required: boolean;
    level: 'simple' | 'detailed' | 'authenticated';
    timeout?: number;
}
export interface IResolution {
    resolvedValue: unknown;
    type: string;
    confidence: number;
    source: 'context' | 'memory' | 'inference';
}
//# sourceMappingURL=conversation.types.d.ts.map