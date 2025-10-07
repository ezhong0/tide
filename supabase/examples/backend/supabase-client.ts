/**
 * Tide Backend Supabase Client
 *
 * Used by AI, Email, and Calendar services to:
 * 1. Verify user authentication (JWT validation)
 * 2. Access OAuth tokens for Gmail/Calendar APIs
 * 3. Store/retrieve data with service_role permissions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

// MARK: - Types

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  primary_provider: 'google' | 'microsoft';
  timezone: string;
  language: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthTokens {
  id: string;
  user_id: string;
  provider: 'google' | 'microsoft';
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
  scopes: string[];
  provider_user_id?: string;
  provider_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  summary?: string;
  message_count: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  model?: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  provider: 'google' | 'microsoft';
  provider_event_id: string;
  provider_calendar_id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_all_day: boolean;
  status: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: any[];
  created_at: string;
  updated_at: string;
}

export interface EmailThread {
  id: string;
  user_id: string;
  provider: 'google' | 'microsoft';
  provider_thread_id: string;
  subject: string;
  snippet?: string;
  participants?: any[];
  message_count: number;
  is_unread: boolean;
  is_starred: boolean;
  labels: string[];
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

// MARK: - Supabase Client

/**
 * Service role client for backend operations
 * Has full access to database, bypasses RLS
 */
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  // MARK: - Authentication

  /**
   * Verify JWT token from client
   * Returns user ID if valid, throws if invalid
   */
  async verifyToken(token: string): Promise<string> {
    const { data, error } = await this.client.auth.getUser(token);

    if (error || !data.user) {
      throw new Error('Invalid or expired token');
    }

    return data.user.id;
  }

  /**
   * Get user from JWT token
   */
  async getUserFromToken(token: string) {
    const { data, error } = await this.client.auth.getUser(token);

    if (error || !data.user) {
      throw new Error('Invalid or expired token');
    }

    return data.user;
  }

  // MARK: - User Profile

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  // MARK: - OAuth Tokens

  /**
   * Get OAuth tokens for a provider
   * Used to access Gmail/Calendar APIs on behalf of user
   */
  async getOAuthTokens(userId: string, provider: 'google' | 'microsoft'): Promise<OAuthTokens> {
    const { data, error } = await this.client
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error) {
      throw new Error(`Failed to fetch OAuth tokens: ${error.message}`);
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    // Refresh if expired or expiring within 5 minutes
    if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
      return await this.refreshOAuthTokens(userId, provider);
    }

    return data;
  }

  /**
   * Refresh OAuth tokens
   */
  private async refreshOAuthTokens(userId: string, provider: 'google' | 'microsoft'): Promise<OAuthTokens> {
    // Get current tokens
    const { data: currentTokens, error: fetchError } = await this.client
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (fetchError || !currentTokens.refresh_token) {
      throw new Error('Cannot refresh token: No refresh token available');
    }

    // Refresh token based on provider
    let newTokens;
    if (provider === 'google') {
      newTokens = await this.refreshGoogleToken(currentTokens.refresh_token);
    } else {
      newTokens = await this.refreshMicrosoftToken(currentTokens.refresh_token);
    }

    // Update database
    const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

    const { data: updatedTokens, error: updateError } = await this.client
      .from('oauth_tokens')
      .update({
        access_token: newTokens.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', provider)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update OAuth tokens: ${updateError.message}`);
    }

    return updatedTokens;
  }

  /**
   * Refresh Google OAuth token
   */
  private async refreshGoogleToken(refreshToken: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Google token');
    }

    return await response.json();
  }

  /**
   * Refresh Microsoft OAuth token
   */
  private async refreshMicrosoftToken(refreshToken: string) {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.microsoft.clientId,
        client_secret: config.microsoft.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Microsoft token');
    }

    return await response.json();
  }

  // MARK: - Conversations & Messages

  /**
   * Create conversation
   */
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    const { data, error } = await this.client
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Create message
   */
  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: { tokens_used?: number; model?: string }
  ): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tokens_used: metadata?.tokens_used,
        model: metadata?.model
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return data;
  }

  /**
   * Get messages for conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data;
  }

  // MARK: - Calendar Events

  /**
   * Upsert calendar events (sync from provider)
   */
  async upsertCalendarEvents(events: Partial<CalendarEvent>[]): Promise<void> {
    const { error } = await this.client
      .from('calendar_events')
      .upsert(events, {
        onConflict: 'user_id,provider,provider_event_id'
      });

    if (error) {
      throw new Error(`Failed to upsert calendar events: ${error.message}`);
    }
  }

  // MARK: - Email Threads

  /**
   * Upsert email threads (sync from provider)
   */
  async upsertEmailThreads(threads: Partial<EmailThread>[]): Promise<void> {
    const { error } = await this.client
      .from('email_threads')
      .upsert(threads, {
        onConflict: 'user_id,provider,provider_thread_id'
      });

    if (error) {
      throw new Error(`Failed to upsert email threads: ${error.message}`);
    }
  }

  // MARK: - Analytics

  /**
   * Track analytics event
   */
  async trackEvent(
    userId: string | null,
    eventType: string,
    eventName: string,
    eventData?: any
  ): Promise<void> {
    const { error } = await this.client
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_name: eventName,
        event_data: eventData || {}
      });

    if (error) {
      console.error('Failed to track event:', error.message);
      // Don't throw - analytics failures shouldn't break app
    }
  }
}

// MARK: - Singleton Export

export const supabase = new SupabaseService();
