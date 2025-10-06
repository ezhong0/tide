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

## ✅ Key Deliverables

- [ ] pgvector integration for semantic search
- [ ] Multi-tier caching system
- [ ] Real-time email indexing
- [ ] Relationship mapping
- [ ] Pattern analysis
- [ ] Predictive context warming
- [ ] 85% test coverage

Remember: Context is king. The better the context, the smarter the AI.