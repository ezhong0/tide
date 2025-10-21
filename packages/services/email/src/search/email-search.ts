import { logger } from '@tide/logger';
import { SupabaseConnectionManager } from '@tide/database';
import type { UserId } from '@tide/types';

/**
 * Search query options
 */
export interface SearchOptions {
  query: string;
  userId: UserId;
  filters?: {
    from?: string[];
    to?: string[];
    hasAttachment?: boolean;
    isRead?: boolean;
    isFlagged?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    labels?: string[];
    priority?: number;
  };
  limit?: number;
  offset?: number;
  sort?: 'relevance' | 'date' | 'sender';
  order?: 'asc' | 'desc';
}

/**
 * Search result
 */
export interface SearchResult {
  id: string;
  subject: string;
  from: string;
  to: string[];
  snippet: string; // Highlighted excerpt
  receivedAt: Date;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachment: boolean;
  labels: string[];
  priority: number;
  relevanceScore: number; // 0-1
  matchedFields: string[]; // Which fields matched (subject, body, etc)
}

/**
 * Search response
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number; // milliseconds
  page: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  suggestions?: string[]; // Spelling suggestions
}

/**
 * Email Full-Text Search
 * Uses PostgreSQL full-text search with ts_vector
 */
export class EmailSearch {
  private db = SupabaseConnectionManager.getInstance(true);

  /**
   * Search emails with full-text search
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();

    logger.info({
      userId: options.userId,
      query: options.query,
      filters: options.filters
    }, 'Email search started');

    const limit = options.limit || 20;
    const offset = options.offset || 0;

    try {
      // Build search query with PostgreSQL full-text search
      let query = this.db
        .from('emails')
        .select('id, subject, from_email, to_emails, body_text, sent_at, is_unread, is_starred, attachments, labels, intelligence, snippet', { count: 'exact' })
        .eq('user_id', options.userId);

      // Full-text search on subject and body
      if (options.query && options.query.trim().length > 0) {
        const searchQuery = this.prepareSearchQuery(options.query);

        // Use PostgreSQL full-text search
        // This requires a ts_vector column in the database
        query = query.textSearch('search_vector', searchQuery, {
          type: 'websearch', // Allows natural language queries
          config: 'english'
        });
      }

      // Apply filters
      if (options.filters) {
        if (options.filters.from && options.filters.from.length > 0) {
          query = query.in('from_email', options.filters.from);
        }

        if (options.filters.hasAttachment !== undefined) {
          // Check if attachments array has items
          if (options.filters.hasAttachment) {
            query = query.not('attachments', 'eq', '[]');
          } else {
            query = query.eq('attachments', '[]');
          }
        }

        if (options.filters.isRead !== undefined) {
          // Note: inverted logic - database stores is_unread
          query = query.eq('is_unread', !options.filters.isRead);
        }

        if (options.filters.isFlagged !== undefined) {
          query = query.eq('is_starred', options.filters.isFlagged);
        }

        if (options.filters.dateFrom) {
          query = query.gte('sent_at', options.filters.dateFrom.toISOString());
        }

        if (options.filters.dateTo) {
          query = query.lte('sent_at', options.filters.dateTo.toISOString());
        }

        if (options.filters.labels && options.filters.labels.length > 0) {
          query = query.contains('labels', options.filters.labels);
        }

        if (options.filters.priority !== undefined) {
          // Priority is now in intelligence JSONB
          query = query.gte('intelligence->>priority', options.filters.priority.toString());
        }
      }

      // Sorting
      const sortBy = options.sort || 'relevance';
      if (sortBy === 'date') {
        query = query.order('sent_at', { ascending: options.order === 'asc' });
      } else if (sortBy === 'sender') {
        query = query.order('from_email', { ascending: options.order === 'asc' });
      }
      // For relevance, PostgreSQL automatically sorts by ts_rank

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error({ error, userId: options.userId }, 'Search query failed');
        throw error;
      }

      // Format results
      const results: SearchResult[] = (data || []).map((email: any, index) => {
        const intelligence = email.intelligence || {};
        return {
          id: email.id,
          subject: email.subject || '(No subject)',
          from: email.from_email,
          to: email.to_emails || [],
          snippet: email.snippet || this.generateSnippet(email.body_text, options.query),
          receivedAt: new Date(email.sent_at),
          isRead: !email.is_unread, // Inverted logic
          isFlagged: email.is_starred,
          hasAttachment: email.attachments && email.attachments.length > 0,
          labels: email.labels || [],
          priority: intelligence.priority || 5,
          relevanceScore: this.calculateRelevance(email, options.query, index),
          matchedFields: this.detectMatchedFields(email, options.query),
        };
      });

      const took = Date.now() - startTime;

      logger.info({
        userId: options.userId,
        resultCount: results.length,
        total: count,
        took
      }, 'Search complete');

      return {
        results,
        total: count || 0,
        query: options.query,
        took,
        page: {
          limit,
          offset,
          hasMore: (count || 0) > offset + results.length,
        },
        suggestions: this.generateSuggestions(options.query, results.length),
      };
    } catch (error) {
      logger.error({ error, userId: options.userId }, 'Email search failed');
      throw new Error('Search failed');
    }
  }

  /**
   * Prepare search query for PostgreSQL full-text search
   */
  private prepareSearchQuery(query: string): string {
    // Clean and prepare query
    const cleaned = query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars except hyphen
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove short words
      .join(' & '); // AND operator for PostgreSQL

    return cleaned || query; // Fallback to original if empty
  }

  /**
   * Generate snippet with highlighted matches
   */
  private generateSnippet(body: string, query: string): string {
    if (!body || !query) return '';

    const maxLength = 200;
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Find first occurrence of any query term
    let firstMatch = -1;
    for (const term of queryTerms) {
      const index = body.toLowerCase().indexOf(term);
      if (index !== -1 && (firstMatch === -1 || index < firstMatch)) {
        firstMatch = index;
      }
    }

    if (firstMatch === -1) {
      // No match found, return beginning
      return body.substring(0, maxLength) + (body.length > maxLength ? '...' : '');
    }

    // Extract context around match
    const start = Math.max(0, firstMatch - 50);
    const end = Math.min(body.length, firstMatch + maxLength - 50);

    let snippet = body.substring(start, end);

    // Add ellipsis
    if (start > 0) snippet = '...' + snippet;
    if (end < body.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Calculate relevance score (0-1)
   */
  private calculateRelevance(email: any, query: string, position: number): number {
    if (!query) return 1.0;

    let score = 1.0 - (position * 0.01); // Decay by position

    const queryTerms = query.toLowerCase().split(/\s+/);
    const subject = (email.subject || '').toLowerCase();
    const body = (email.body_text || '').toLowerCase();

    // Boost if query appears in subject
    for (const term of queryTerms) {
      if (subject.includes(term)) {
        score += 0.3;
      }
    }

    // Boost recent emails
    const daysSinceReceived = (Date.now() - new Date(email.sent_at).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - daysSinceReceived / 90); // 90-day decay
    score += recencyBoost * 0.2;

    // Boost flagged/important emails
    if (email.is_starred) score += 0.1;
    const intelligence = email.intelligence || {};
    if (intelligence.priority && intelligence.priority > 7) score += 0.1;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Detect which fields matched the query
   */
  private detectMatchedFields(email: any, query: string): string[] {
    if (!query) return [];

    const matches: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);

    const subject = (email.subject || '').toLowerCase();
    const body = (email.body_text || '').toLowerCase();
    const from = (email.from_email || '').toLowerCase();

    for (const term of queryTerms) {
      if (subject.includes(term) && !matches.includes('subject')) {
        matches.push('subject');
      }
      if (body.includes(term) && !matches.includes('body')) {
        matches.push('body');
      }
      if (from.includes(term) && !matches.includes('from')) {
        matches.push('from');
      }
    }

    return matches;
  }

  /**
   * Generate search suggestions (did you mean?)
   */
  private generateSuggestions(query: string, resultCount: number): string[] | undefined {
    // If we have results, no need for suggestions
    if (resultCount > 0) return undefined;

    // Basic typo corrections (in production, use a proper spell-check library)
    const commonCorrections: Record<string, string> = {
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definately': 'definitely',
    };

    const words = query.toLowerCase().split(/\s+/);
    const suggestions: string[] = [];

    for (const word of words) {
      if (commonCorrections[word]) {
        const corrected = query.replace(new RegExp(word, 'gi'), commonCorrections[word]);
        suggestions.push(corrected);
      }
    }

    return suggestions.length > 0 ? suggestions : undefined;
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(userId: UserId, partialQuery: string, limit: number = 5): Promise<string[]> {
    // Search recent emails for common subjects/senders
    const { data } = await this.db
      .from('emails')
      .select('subject, from_email')
      .eq('user_id', userId)
      .ilike('subject', `%${partialQuery}%`)
      .order('sent_at', { ascending: false })
      .limit(limit * 2); // Get more to deduplicate

    if (!data) return [];

    const suggestions = new Set<string>();

    for (const email of data) {
      if (email.subject && email.subject.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.add(email.subject);
      }

      if (email.from_email && email.from_email.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.add(email.from_email);
      }

      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions);
  }

  /**
   * Get popular search queries for user
   */
  async getPopularSearches(userId: UserId, limit: number = 10): Promise<string[]> {
    // In production, this would track search history
    // For now, return common search patterns
    return [
      'unread',
      'flagged',
      'today',
      'this week',
      'important',
      'meeting',
      'invoice',
      'receipt',
    ].slice(0, limit);
  }
}

/**
 * Export singleton instance
 */
export const emailSearch = new EmailSearch();
