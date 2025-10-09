export interface BaseRequest {
    userId: string;
    requestId: string;
    timestamp: number;
    context?: RequestContext;
}
export interface BaseResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ErrorDetail;
    metadata: ResponseMetadata;
}
export interface RequestContext {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
}
export interface ResponseMetadata {
    requestId: string;
    timestamp: number;
    duration: number;
}
export interface ErrorDetail {
    code: string;
    message: string;
    details?: any;
}
export interface User {
    id: string;
    email: string;
    profile: UserProfile;
    preferences: UserPreferences;
    subscription: Subscription;
}
export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    timezone?: string;
}
export interface UserPreferences {
    language?: string;
    notifications?: NotificationPreferences;
}
export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
}
export interface Subscription {
    plan: 'free' | 'professional' | 'team' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
}
export interface AIIntent {
    type: string;
    confidence: number;
    entities: Entity[];
}
export interface Entity {
    type: string;
    value: string;
    confidence: number;
}
export interface Email {
    id: string;
    from: Contact;
    to: Contact[];
    subject: string;
    body: string;
    priority?: 'low' | 'normal' | 'high';
    labels?: string[];
    timestamp: number;
    aiSummary?: string;
}
export interface Contact {
    name: string;
    email: string;
}
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    attendees: Contact[];
    location?: string;
    meetingType?: 'internal' | 'external' | 'one-on-one' | 'board';
    hasPrep?: boolean;
    meetingPrep?: MeetingPrep;
}
export interface MeetingPrep {
    summary: string;
    attendeeInsights?: string[];
    talkingPoints?: string[];
    relatedDocs?: string[];
}
export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'normal' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    assignee?: string;
    dueDate?: Date;
    workflow?: string;
}
export interface Workflow {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    currentStep: number;
    totalSteps: number;
    completedSteps: number;
    progress: number;
}
import type { SuggestedAction } from './ai.contract';
export * from './ai.contract';
export interface Message {
    id: string;
    userId: string;
    conversationId: string;
    content: string;
    role: 'user' | 'assistant';
    intent?: AIIntent;
    actions?: SuggestedAction[];
    timestamp: number;
}
export interface Conversation {
    id: string;
    userId: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
