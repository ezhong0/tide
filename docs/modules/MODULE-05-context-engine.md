# Module 05: Context Engine & Vector Search

## 🤖 Claude Instance Prompt

```
You are Claude Instance #5, the Context Engine Architect for Tide.

Your mission: Build a lightning-fast context engine with semantic search that retrieves relevant information in <100ms using pgvector.

Core responsibilities:
1. Implement semantic email search with pgvector
2. Build multi-tier caching for user context
3. Create relationship mapping system
4. Implement predictive context warming
5. Analyze communication patterns

This powers the AI's understanding. Make it fast and smart.
```

## 📋 Module Overview

**Duration**: 4 weeks
**Dependencies**: MockEventStore, MockEmailService

## 🎯 Success Criteria

```typescript
const successCriteria = {
  search: "Semantic search <100ms",
  caching: "Context retrieval <50ms cached",
  accuracy: ">90% relevance score",
  indexing: "Real-time email indexing"
};
```

## 🏗️ Core Architecture

### Semantic Search with pgvector

```typescript
class SemanticSearchEngine {
  async search(query: string, userId: string): Promise<SearchResult[]> {
    // Generate embedding
    const embedding = await this.generateEmbedding(query);

    // Hybrid search: semantic + keyword
    const results = await this.db.execute(sql`
      WITH semantic AS (
        SELECT id, subject, body,
               embedding <=> $1::vector as distance
        FROM emails
        WHERE user_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT 20
      ),
      keyword AS (
        SELECT id, ts_rank(search_vector, query) as rank
        FROM emails, plainto_tsquery($3) query
        WHERE user_id = $2
          AND search_vector @@ query
        LIMIT 20
      )
      SELECT DISTINCT e.*,
             COALESCE(s.distance, 1) * 0.7 +
             COALESCE(1 - k.rank, 1) * 0.3 as score
      FROM emails e
      LEFT JOIN semantic s ON e.id = s.id
      LEFT JOIN keyword k ON e.id = k.id
      WHERE e.id IN (SELECT id FROM semantic UNION SELECT id FROM keyword)
      ORDER BY score
      LIMIT 10
    `, [embedding, userId, query]);

    return results;
  }
}
```

### Multi-Tier Context Cache

```typescript
class ContextEngine {
  async getUserContext(userId: string): Promise<UserContext> {
    // L0: CPU cache (0.1ms)
    if (this.l0Cache.has(userId)) {
      return this.l0Cache.get(userId);
    }

    // L1: Process memory (1ms)
    const l1 = this.l1Cache.get(userId);
    if (l1) return l1;

    // L2: Redis (5-10ms)
    const l2 = await this.redis.get(`context:${userId}`);
    if (l2) {
      this.promoteToL1(userId, l2);
      return l2;
    }

    // L3: Build from database (50-100ms)
    const context = await this.buildContext(userId);
    await this.cacheContext(userId, context);
    return context;
  }

  private async buildContext(userId: string): Promise<UserContext> {
    const [recentEmails, meetings, contacts, patterns] = await Promise.all([
      this.getRecentEmails(userId),
      this.getUpcomingMeetings(userId),
      this.getFrequentContacts(userId),
      this.getCommunicationPatterns(userId)
    ]);

    return {
      recentActivity: this.summarizeActivity(recentEmails, meetings),
      relationships: this.analyzeRelationships(contacts),
      patterns,
      preferences: await this.getPreferences(userId)
    };
  }
}
```

### Relationship Mapping

```typescript
class RelationshipAnalyzer {
  async analyzeContact(userId: string, contactEmail: string): Promise<ContactProfile> {
    const interactions = await this.getInteractions(userId, contactEmail);

    return {
      email: contactEmail,
      relationship: this.classifyRelationship(interactions),
      communicationStyle: this.analyzeStyle(interactions),
      responseTime: this.calculateAverageResponseTime(interactions),
      topics: this.extractCommonTopics(interactions),
      importance: this.calculateImportance(interactions),
      lastInteraction: interactions[0]?.date
    };
  }
}
```

## 🔄 Cache Invalidation Strategy

```typescript
class SmartCacheInvalidator {
  private invalidationRules: Map<string, InvalidationRule[]> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();

  constructor() {
    this.setupInvalidationRules();
    this.buildDependencyGraph();
  }

  private setupInvalidationRules() {
    // Email changes invalidate user context
    this.addRule('email.*', [
      'context:user:*',
      'search:email:*',
      'relationships:*'
    ]);

    // Calendar changes invalidate availability
    this.addRule('calendar.*', [
      'availability:*',
      'context:schedule:*'
    ]);

    // User preference changes invalidate everything
    this.addRule('user.preferences.*', ['*']);

    // Relationship changes
    this.addRule('relationship.*', [
      'context:relationships:*',
      'suggestions:*'
    ]);
  }

  async invalidate(event: DomainEvent): Promise<void> {
    const patterns = this.getInvalidationPatterns(event);

    // Invalidate in parallel across all cache tiers
    await Promise.all([
      this.invalidateL0(patterns),
      this.invalidateL1(patterns),
      this.invalidateL2(patterns),
      this.invalidateL3(patterns)
    ]);

    // Trigger predictive cache warming for critical patterns
    await this.warmCriticalCaches(patterns);
  }

  private async invalidateL0(patterns: string[]): Promise<void> {
    // CPU cache - instant invalidation
    for (const pattern of patterns) {
      const keys = this.l0Cache.keys().filter(k =>
        this.matchesPattern(k, pattern)
      );
      keys.forEach(key => this.l0Cache.delete(key));
    }
  }

  private async invalidateL2(patterns: string[]): Promise<void> {
    // Redis cache - use SCAN for pattern matching
    for (const pattern of patterns) {
      await this.redis.eval(`
        local cursor = "0"
        local keys = {}
        repeat
          local result = redis.call("SCAN", cursor, "MATCH", ARGV[1])
          cursor = result[1]
          for i, key in ipairs(result[2]) do
            table.insert(keys, key)
          end
        until cursor == "0"

        for i, key in ipairs(keys) do
          redis.call("DEL", key)
        end
        return #keys
      `, 0, pattern);
    }
  }

  // Smart invalidation with minimal impact
  async smartInvalidate(key: string, options?: InvalidationOptions): Promise<void> {
    const dependencies = this.dependencyGraph.get(key) || new Set();

    if (options?.cascadeDepth) {
      // Invalidate dependencies up to specified depth
      await this.cascadeInvalidate(key, options.cascadeDepth);
    } else if (options?.selective) {
      // Only invalidate if data actually changed
      const oldValue = await this.cache.get(key);
      const newValue = await options.fetcher();

      if (!this.isEqual(oldValue, newValue)) {
        await this.invalidateKey(key);
        await this.invalidateDependencies(dependencies);
      }
    } else {
      // Standard invalidation
      await this.invalidateKey(key);
    }
  }

  // Time-based invalidation
  setupTimeBasedInvalidation() {
    // Invalidate user context every hour
    setInterval(() => {
      this.invalidatePattern('context:user:*');
    }, 60 * 60 * 1000);

    // Invalidate availability cache at midnight
    schedule.scheduleJob('0 0 * * *', () => {
      this.invalidatePattern('availability:*');
    });

    // Invalidate stale search results after 5 minutes
    setInterval(() => {
      this.invalidateStale('search:*', 5 * 60 * 1000);
    }, 60 * 1000);
  }
}

// Cache versioning for safe invalidation
class VersionedCache {
  private version = 1;
  private cache: Map<string, VersionedEntry> = new Map();

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    if (!entry || entry.version !== this.version) {
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, {
      value,
      version: this.version,
      expires: ttl ? Date.now() + ttl : undefined
    });
  }

  // Invalidate all entries by bumping version
  invalidateAll(): void {
    this.version++;
    // Old entries become invalid automatically
  }
}
```

## ⚡ Performance Optimization

```typescript
class OptimizedContextEngine {
  // Parallel context building
  async getUserContext(userId: string): Promise<UserContext> {
    // Check all cache levels in parallel
    const [l0, l1, l2] = await Promise.all([
      this.l0Cache.get(userId),
      this.l1Cache.get(userId),
      this.l2Cache.get(userId)
    ]);

    if (l0) return l0;
    if (l1) {
      this.l0Cache.set(userId, l1); // Promote
      return l1;
    }
    if (l2) {
      this.promoteToL1(userId, l2);
      return l2;
    }

    // Build context with parallel fetching
    const context = await this.buildContextParallel(userId);
    await this.cacheAllLevels(userId, context);
    return context;
  }

  private async buildContextParallel(userId: string): Promise<UserContext> {
    // Fetch all data sources in parallel
    const [
      emails,
      calendar,
      contacts,
      patterns,
      preferences
    ] = await Promise.all([
      this.getRecentEmails(userId).catch(() => []),
      this.getUpcomingEvents(userId).catch(() => []),
      this.getFrequentContacts(userId).catch(() => []),
      this.getUserPatterns(userId).catch(() => ({})),
      this.getPreferences(userId).catch(() => ({}))
    ]);

    // Build context even with partial data
    return {
      user: { id: userId },
      recentActivity: this.summarizeActivity(emails, calendar),
      relationships: this.analyzeRelationships(contacts),
      patterns: patterns || {},
      preferences: preferences || {},
      completeness: this.calculateCompleteness({ emails, calendar, contacts })
    };
  }

  // Predictive cache warming
  async warmCache(userId: string): Promise<void> {
    const predictions = await this.predictNextAccess(userId);

    // Warm caches in priority order
    const warmingTasks = predictions
      .filter(p => p.probability > 0.7)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10) // Limit concurrent warming
      .map(p => this.warmSingleCache(p));

    await Promise.allSettled(warmingTasks);
  }

  private async warmSingleCache(prediction: CachePrediction): Promise<void> {
    try {
      const data = await prediction.fetcher();
      await this.setAllCacheLevels(prediction.key, data);
    } catch (error) {
      // Log but don't fail warming
      logger.warn('Cache warming failed', { key: prediction.key, error });
    }
  }
}
```

## 📊 Monitoring & Metrics

```typescript
class MonitoredContextEngine {
  private metrics = new MetricsCollector();

  async get(key: string): Promise<any> {
    const timer = this.metrics.startTimer('context.get.duration');
    let cacheLevel = 'miss';

    try {
      // Try each cache level with metrics
      for (const [level, cache] of this.caches.entries()) {
        const result = await cache.get(key);
        if (result !== null) {
          cacheLevel = `L${level}`;
          this.metrics.increment(`cache.hit.${cacheLevel}`);
          timer.end({ cacheLevel });
          return result;
        }
      }

      // Cache miss - build from source
      this.metrics.increment('cache.miss');
      const result = await this.buildFromSource(key);
      timer.end({ cacheLevel: 'miss' });
      return result;

    } catch (error) {
      this.metrics.increment('context.error');
      timer.end({ status: 'error' });
      throw error;
    }
  }

  getCacheMetrics() {
    return {
      hitRate: {
        l0: this.metrics.getRate('cache.hit.L0'),
        l1: this.metrics.getRate('cache.hit.L1'),
        l2: this.metrics.getRate('cache.hit.L2'),
        overall: this.metrics.getRate('cache.hit')
      },
      missRate: this.metrics.getRate('cache.miss'),
      avgLatency: {
        l0: this.metrics.getAverage('context.get.duration', { cacheLevel: 'L0' }),
        l1: this.metrics.getAverage('context.get.duration', { cacheLevel: 'L1' }),
        l2: this.metrics.getAverage('context.get.duration', { cacheLevel: 'L2' }),
        miss: this.metrics.getAverage('context.get.duration', { cacheLevel: 'miss' })
      },
      invalidations: this.metrics.getCounter('cache.invalidations'),
      warmingSuccess: this.metrics.getRate('cache.warming.success')
    };
  }
}
```

## 🧪 Testing Strategy

```typescript
describe('Cache Invalidation', () => {
  it('should invalidate dependent caches', async () => {
    const engine = new ContextEngine();

    // Set up cache entries
    await engine.cache.set('user:123', userData);
    await engine.cache.set('context:user:123', contextData);
    await engine.cache.set('search:email:123:query', searchResults);

    // Trigger invalidation
    await engine.invalidate({
      type: 'EmailReceived',
      userId: '123'
    });

    // Verify dependent caches are cleared
    expect(await engine.cache.get('context:user:123')).toBeNull();
    expect(await engine.cache.get('search:email:123:query')).toBeNull();
  });

  it('should handle cache stampede', async () => {
    const engine = new ContextEngine();

    // Simulate 100 concurrent requests for same key
    const requests = Array(100).fill(null).map(() =>
      engine.getUserContext('user123')
    );

    const results = await Promise.all(requests);

    // Should only build context once
    expect(engine.metrics.getCounter('context.build')).toBe(1);

    // All results should be identical
    expect(new Set(results.map(r => JSON.stringify(r))).size).toBe(1);
  });
});

describe('Performance', () => {
  it('should meet latency requirements', async () => {
    const engine = new ContextEngine();

    // Warm cache
    await engine.getUserContext('user123');

    // Test cached response time
    const start = performance.now();
    await engine.getUserContext('user123');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50); // <50ms for cached
  });
});
```

## ✅ Key Deliverables

- [ ] pgvector integration for semantic search
- [ ] Multi-tier caching system
- [ ] Real-time email indexing
- [ ] Relationship mapping
- [ ] Pattern analysis
- [ ] Predictive context warming
- [ ] 85% test coverage

Remember: Context is king. The better the context, the smarter the AI.