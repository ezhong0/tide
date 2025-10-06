# Context Engine Module - Complete Implementation Guide

## Timeline: Week 3-6 (Days 15-42)

## Team: Backend Engineer #5

## Dependencies: Phase 0 complete, Email/Calendar modules providing data

---

## Module Overview

**Responsibility**: Provide intelligence about users, contacts, and patterns

**Core Functionality**:

- User context retrieval (preferences, history, patterns)
- Contact relationship analysis (using GPT-4)
- Meeting pattern detection (from historical data)
- Communication style learning
- Vector database integration (Pinecone/Weaviate)
- Semantic email search

**Module Boundaries**:

- ✅ YOU DO: Analyze data, learn patterns, provide context, semantic search
- ❌ YOU DON'T: Send emails (Email Module), Create events (Calendar Module), Make decisions (AI Module)

**Key Insight**: This is the "memory" of the system. You make other modules smarter by providing context about users and their relationships.

---

## Architecture: Multi-Level Caching + GPT Analysis

```
Request for User Context
         ↓
    L1: In-Memory Cache (1 min TTL)
         ↓ (cache miss)
    L2: Redis Cache (10 min TTL)
         ↓ (cache miss)
    L3: Database Query
         ↓
    Store in L1 + L2
         ↓
    Return to caller
```

```
Contact Analysis Request
         ↓
    Check if recent analysis exists (< 7 days)
         ↓ (no)
    Fetch email history from DB
         ↓
    Analyze with GPT-4
         ↓
    Store in contact_preferences table
         ↓
    Cache in Redis (1 day TTL)
         ↓
    Return analysis
```

---

## Week 3: User Context & Contact Analysis (Days 15-21)

### Day 15-17: User Context Service

```typescript
// apps/api/src/services/context-engine/user-context.service.ts
import { db } from '../../db';
import { redis } from '../../utils/redis';
import { logger } from '../../utils/logger';

/**
 * In-memory cache for ultra-fast access
 * Simple Map with TTL tracking
 */
class InMemoryCache<T> {
  private cache = new Map<string, { data: T; expiresAt: number }>();

  set(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const userContextCache = new InMemoryCache<UserContext>();

export class UserContextService {
  /**
   * Get comprehensive user context with multi-level caching
   */
  async getUserContext(userId: string): Promise<UserContext> {
    // L1: In-memory cache (1 minute TTL)
    const l1Cached = userContextCache.get(userId);
    if (l1Cached) {
      logger.debug({ userId }, 'User context from L1 cache');
      return l1Cached;
    }

    // L2: Redis cache (10 minute TTL)
    const l2Cached = await redis.get(`user:context:${userId}`);
    if (l2Cached) {
      const parsed = JSON.parse(l2Cached) as UserContext;
      userContextCache.set(userId, parsed, 60); // Store in L1
      logger.debug({ userId }, 'User context from L2 cache');
      return parsed;
    }

    // L3: Build from database
    logger.debug({ userId }, 'Building user context from database');
    const context = await this.buildUserContext(userId);

    // Store in both caches
    await redis.setex(
      `user:context:${userId}`,
      600, // 10 minutes
      JSON.stringify(context)
    );
    userContextCache.set(userId, context, 60);

    return context;
  }

  /**
   * Build user context from database queries
   * Runs in parallel for performance
   */
  private async buildUserContext(userId: string): Promise<UserContext> {
    const [user, preferences, recentCommands, frequentContacts, vipContacts, stats] =
      await Promise.all([
        // User basic info
        db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            timezone: true,
          },
        }),

        // User preferences
        db.userPreferences.findUnique({
          where: { userId },
          select: {
            default_tone: true,
            email_signature: true,
            auto_accept_meetings: true,
            auto_respond_simple: true,
            vip_contacts: true,
          },
        }),

        // Recent command history (last 10)
        this.getRecentCommands(userId, 10),

        // Frequent email contacts (last 90 days, top 20)
        this.getFrequentContacts(userId, 20),

        // VIP contacts from preferences
        this.getVIPContacts(userId),

        // Usage statistics
        this.getUserStats(userId),
      ]);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
      preferences: {
        defaultTone: preferences?.default_tone || 'professional',
        emailSignature: preferences?.email_signature || '',
        autoAcceptMeetings: preferences?.auto_accept_meetings || false,
        autoRespondSimple: preferences?.auto_respond_simple || false,
      },
      recentActivity: recentCommands.map((cmd) => ({
        intent: cmd.intent,
        timestamp: cmd.timestamp,
        status: cmd.status,
      })),
      frequentContacts: frequentContacts.map((c) => ({
        email: c.email,
        name: c.name,
        interactionCount: c.count,
        lastInteraction: c.lastDate,
      })),
      vipContacts: vipContacts.map((c) => ({
        email: c.email,
        name: c.name,
        relationship: c.relationship,
      })),
      stats: {
        totalCommands: stats.totalCommands,
        commandsThisWeek: stats.commandsThisWeek,
        emailsSent: stats.emailsSent,
        meetingsScheduled: stats.meetingsScheduled,
      },
    };
  }

  /**
   * Get recent command history
   */
  private async getRecentCommands(
    userId: string,
    limit: number
  ): Promise<Array<{ intent: string; timestamp: Date; status: string }>> {
    return db.command.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        intent: true,
        timestamp: true,
        status: true,
      },
    });
  }

  /**
   * Get frequent email contacts from last 90 days
   * Uses raw SQL for performance
   */
  private async getFrequentContacts(
    userId: string,
    limit: number
  ): Promise<
    Array<{
      email: string;
      name: string | null;
      count: number;
      lastDate: Date;
    }>
  > {
    // Query emails to find most frequent contacts
    const result = await db.$queryRaw<
      Array<{
        email: string;
        count: bigint;
        last_date: Date;
      }>
    >`
      SELECT
        UNNEST(to) as email,
        COUNT(*) as count,
        MAX(date) as last_date
      FROM emails
      WHERE user_id = ${userId}
        AND direction = 'sent'
        AND date > NOW() - INTERVAL '90 days'
      GROUP BY email
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    // Enrich with names from contact_preferences if available
    const enriched = await Promise.all(
      result.map(async (r) => {
        const contact = await db.contactPreferences.findFirst({
          where: { user_id: userId, contact_email: r.email },
          select: { contact_name: true },
        });

        return {
          email: r.email,
          name: contact?.contact_name || this.extractNameFromEmail(r.email),
          count: Number(r.count),
          lastDate: r.last_date,
        };
      })
    );

    return enriched;
  }

  /**
   * Get VIP contacts from user preferences
   */
  private async getVIPContacts(userId: string): Promise<
    Array<{
      email: string;
      name: string;
      relationship: string;
    }>
  > {
    const prefs = await db.userPreferences.findUnique({
      where: { userId },
      select: { vip_contacts: true },
    });

    return (prefs?.vip_contacts as any[]) || [];
  }

  /**
   * Get user statistics
   */
  private async getUserStats(userId: string): Promise<{
    totalCommands: number;
    commandsThisWeek: number;
    emailsSent: number;
    meetingsScheduled: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalCommands, commandsThisWeek, emailsSent, meetingsScheduled] = await Promise.all([
      db.command.count({ where: { user_id: userId } }),
      db.command.count({
        where: {
          user_id: userId,
          timestamp: { gte: oneWeekAgo },
        },
      }),
      db.email.count({
        where: {
          user_id: userId,
          direction: 'sent',
        },
      }),
      db.calendarEvent.count({
        where: {
          user_id: userId,
          start: { gte: oneWeekAgo },
        },
      }),
    ]);

    return {
      totalCommands,
      commandsThisWeek,
      emailsSent,
      meetingsScheduled,
    };
  }

  /**
   * Invalidate cache when user data changes
   */
  async invalidateCache(userId: string): Promise<void> {
    userContextCache.delete(userId);
    await redis.del(`user:context:${userId}`);
    logger.info({ userId }, 'User context cache invalidated');
  }

  /**
   * Extract name from email address as fallback
   */
  private extractNameFromEmail(email: string): string {
    const [localPart] = email.split('@');
    return localPart
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// ========== TYPE DEFINITIONS ==========

export interface UserContext {
  user: {
    id: string;
    name: string;
    email: string;
    timezone: string;
  };
  preferences: {
    defaultTone: string;
    emailSignature: string;
    autoAcceptMeetings: boolean;
    autoRespondSimple: boolean;
  };
  recentActivity: Array<{
    intent: string;
    timestamp: Date;
    status: string;
  }>;
  frequentContacts: Array<{
    email: string;
    name: string;
    interactionCount: number;
    lastInteraction: Date;
  }>;
  vipContacts: Array<{
    email: string;
    name: string;
    relationship: string;
  }>;
  stats: {
    totalCommands: number;
    commandsThisWeek: number;
    emailsSent: number;
    meetingsScheduled: number;
  };
}
```

**Performance Tests**:

```typescript
// apps/api/src/services/context-engine/__tests__/user-context.test.ts
describe('UserContextService', () => {
  let service: UserContextService;

  beforeEach(() => {
    service = new UserContextService();
  });

  describe('performance', () => {
    it('should return from L1 cache in < 1ms', async () => {
      // Prime the cache
      await service.getUserContext('user-123');

      const start = Date.now();
      await service.getUserContext('user-123');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1);
    });

    it('should return from L2 cache in < 50ms', async () => {
      // Prime L2 cache
      await service.getUserContext('user-123');
      // Clear L1
      service['userContextCache'].clear();

      const start = Date.now();
      await service.getUserContext('user-123');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should build from database in < 500ms', async () => {
      const start = Date.now();
      await service.getUserContext('user-123');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
```

**Deliverables Day 15-17**:

- [ ] User context service with 3-level caching
- [ ] Recent commands retrieval
- [ ] Frequent contacts analysis
- [ ] VIP contacts retrieval
- [ ] User statistics
- [ ] Performance: < 1ms L1, < 50ms L2, < 500ms L3
- [ ] Unit tests passing

---

### Day 18-21: Contact Relationship Analyzer

This uses GPT-4 to analyze email history and determine relationship:

```typescript
// apps/api/src/services/context-engine/contact-analyzer.service.ts
import { openai, callOpenAI } from '../ai/openai-client';
import { db } from '../../db';
import { redis } from '../../utils/redis';
import { logger } from '../../utils/logger';

export class ContactAnalyzerService {
  /**
   * Analyze relationship with a contact
   * Uses caching to avoid expensive GPT calls
   */
  async analyzeContact(userId: string, contactEmail: string): Promise<ContactAnalysis> {
    // Check cache (1 day TTL)
    const cacheKey = `contact:analysis:${userId}:${contactEmail}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug({ userId, contactEmail }, 'Contact analysis from cache');
      return JSON.parse(cached);
    }

    // Check if we have stored analysis (< 7 days old)
    const stored = await db.contactPreferences.findFirst({
      where: { user_id: userId, contact_email: contactEmail },
    });

    if (stored && this.isRecentAnalysis(stored.updated_at)) {
      const analysis: ContactAnalysis = {
        email: contactEmail,
        name: stored.contact_name || this.extractNameFromEmail(contactEmail),
        preferredTone: stored.preferred_tone,
        relationshipType: stored.relationship_type,
        interactionCount: stored.interaction_count,
        averageResponseTime: stored.average_response_time,
        confidence: 'high',
      };

      await redis.setex(cacheKey, 86400, JSON.stringify(analysis));
      return analysis;
    }

    // Need fresh analysis - get email history
    logger.info({ userId, contactEmail }, 'Performing fresh contact analysis');
    return this.analyzeFromEmailHistory(userId, contactEmail);
  }

  /**
   * Analyze contact from email history using GPT-4
   */
  private async analyzeFromEmailHistory(
    userId: string,
    contactEmail: string
  ): Promise<ContactAnalysis> {
    // Get recent email history with this contact
    const emails = await db.email.findMany({
      where: {
        user_id: userId,
        OR: [{ from: contactEmail }, { to: { array_contains: contactEmail } }],
      },
      orderBy: { date: 'desc' },
      take: 50, // Last 50 emails
      select: {
        from: true,
        to: true,
        subject: true,
        snippet: true,
        date: true,
        body: true,
      },
    });

    if (emails.length === 0) {
      // No history - return defaults
      logger.warn({ userId, contactEmail }, 'No email history found');
      return {
        email: contactEmail,
        name: this.extractNameFromEmail(contactEmail),
        preferredTone: 'professional',
        relationshipType: 'colleague',
        interactionCount: 0,
        confidence: 'low',
      };
    }

    // Analyze with GPT-4
    const gptAnalysis = await this.analyzeWithGPT(emails, contactEmail);

    // Calculate average response time
    const avgResponseTime = this.calculateAverageResponseTime(emails, contactEmail);

    // Store analysis
    await db.contactPreferences.upsert({
      where: {
        user_id_contact_email: {
          user_id: userId,
          contact_email: contactEmail,
        },
      },
      create: {
        user_id: userId,
        contact_email: contactEmail,
        contact_name: gptAnalysis.name,
        preferred_tone: gptAnalysis.preferredTone,
        relationship_type: gptAnalysis.relationshipType,
        custom_instructions: gptAnalysis.notes,
        interaction_count: emails.length,
        average_response_time: avgResponseTime,
        last_interaction: emails[0].date,
      },
      update: {
        contact_name: gptAnalysis.name,
        preferred_tone: gptAnalysis.preferredTone,
        relationship_type: gptAnalysis.relationshipType,
        custom_instructions: gptAnalysis.notes,
        interaction_count: emails.length,
        average_response_time: avgResponseTime,
        last_interaction: emails[0].date,
        updated_at: new Date(),
      },
    });

    const result: ContactAnalysis = {
      email: contactEmail,
      name: gptAnalysis.name,
      preferredTone: gptAnalysis.preferredTone,
      relationshipType: gptAnalysis.relationshipType,
      interactionCount: emails.length,
      averageResponseTime: avgResponseTime,
      confidence: emails.length > 10 ? 'high' : 'medium',
    };

    // Cache for 1 day
    await redis.setex(`contact:analysis:${userId}:${contactEmail}`, 86400, JSON.stringify(result));

    logger.info(
      {
        userId,
        contactEmail,
        relationship: result.relationshipType,
        tone: result.preferredTone,
      },
      'Contact analysis complete'
    );

    return result;
  }

  /**
   * Use GPT-4 to analyze relationship from emails
   */
  private async analyzeWithGPT(
    emails: EmailSample[],
    contactEmail: string
  ): Promise<{
    name: string;
    relationshipType: string;
    preferredTone: string;
    notes?: string;
  }> {
    // Sample recent emails for analysis
    const samples = emails.slice(0, 10).map((e) => ({
      from: e.from,
      to: e.to.join(', '),
      subject: e.subject,
      snippet: e.snippet,
      date: e.date.toISOString(),
    }));

    const prompt = `Analyze the professional relationship between the user and ${contactEmail} based on these email exchanges.

Email history (most recent first):
${samples
  .map(
    (e, i) => `
${i + 1}. ${e.date}
   From: ${e.from}
   To: ${e.to}
   Subject: ${e.subject}
   Preview: ${e.snippet}
`
  )
  .join('\n')}

Analyze and determine:
1. Contact's full name (from email content/signatures)
2. Relationship type: boss | colleague | client | friend | vendor | other
3. Preferred communication tone: professional | casual | friendly | formal
4. Any notable patterns or preferences

Respond in JSON format:
{
  "name": "Full Name",
  "relationshipType": "colleague",
  "preferredTone": "professional",
  "notes": "Brief observations about communication style"
}`;

    const response = await callOpenAI(
      'system', // userId not relevant here
      'analyze_contact',
      () =>
        openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert at analyzing professional relationships from email communication patterns. Be concise and accurate.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3, // Lower for consistent analysis
        })
    );

    const analysis = JSON.parse(response.choices[0].message.content!);

    return {
      name: analysis.name || this.extractNameFromEmail(contactEmail),
      relationshipType: analysis.relationshipType || 'colleague',
      preferredTone: analysis.preferredTone || 'professional',
      notes: analysis.notes,
    };
  }

  /**
   * Calculate average response time (in minutes)
   */
  private calculateAverageResponseTime(emails: EmailSample[], contactEmail: string): number | null {
    const responseTimes: number[] = [];

    // Find pairs of (user email → contact response)
    for (let i = 0; i < emails.length - 1; i++) {
      const current = emails[i];
      const next = emails[i + 1];

      // User sent, contact responded
      if (current.from !== contactEmail && next.from === contactEmail) {
        const timeDiff = next.date.getTime() - current.date.getTime();
        responseTimes.push(timeDiff);
      }
    }

    if (responseTimes.length === 0) return null;

    const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    return Math.round(avgMs / 1000 / 60); // Convert to minutes
  }

  private isRecentAnalysis(updatedAt: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return updatedAt > sevenDaysAgo;
  }

  private extractNameFromEmail(email: string): string {
    const [localPart] = email.split('@');
    return localPart
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// ========== TYPE DEFINITIONS ==========

export interface ContactAnalysis {
  email: string;
  name: string;
  preferredTone: 'professional' | 'casual' | 'friendly' | 'formal';
  relationshipType: 'colleague' | 'client' | 'friend' | 'boss' | 'vendor' | 'other';
  interactionCount: number;
  averageResponseTime?: number | null;
  confidence: 'high' | 'medium' | 'low';
}

interface EmailSample {
  from: string;
  to: string[];
  subject: string;
  snippet: string;
  date: Date;
  body?: string;
}
```

**Deliverables Day 18-21**:

- [ ] Contact analyzer using GPT-4
- [ ] Relationship detection working
- [ ] Tone preference detection
- [ ] Response time calculation
- [ ] Caching (1 day TTL)
- [ ] Storage in contact_preferences table
- [ ] Unit tests with mocked GPT

---

(Due to length constraints, I'm providing comprehensive structure. The guide would continue with Meeting Pattern Analyzer, Vector DB integration, and Semantic Search. Should I continue with complete implementation details for all remaining sections, or is this level of detail sufficient for the pattern?)
