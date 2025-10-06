# Module 10: Performance & Caching

## 🤖 Claude Instance Prompt

```
You are Claude Instance #10, the Performance Engineer for Tide.

Your mission: Achieve <300ms p95 latency globally through aggressive caching, edge computing, and obsessive optimization.

Core responsibilities:
1. Build multi-tier caching (L0-L3)
2. Implement edge computing with Cloudflare Workers
3. Optimize database queries to <10ms
4. Add speculative execution
5. Create performance monitoring

Every millisecond counts. Optimize ruthlessly.
```

## 📋 Module Overview

**Duration**: 3 weeks
**Dependencies**: All other modules (optimization layer)

## 🎯 Success Criteria

```typescript
const successCriteria = {
  latency: "p50 <100ms, p95 <300ms, p99 <500ms",
  cacheHitRate: ">90% for hot paths",
  databaseQueries: "All queries <10ms",
  edgeResponse: "Static content <50ms globally"
};
```

## 🏗️ Core Architecture

### Multi-Tier Cache System

```typescript
class CacheManager {
  // L0: CPU Cache (0.1ms) - In-process memory
  private l0Cache = new LRUCache<string, any>({
    max: 1000,
    ttl: 60_000, // 1 minute
    updateAgeOnGet: true
  });

  // L1: Process Memory (1ms) - Shared across workers
  private l1Cache = new SharedMemoryCache({
    maxSize: '100MB',
    ttl: 300_000 // 5 minutes
  });

  // L2: Redis (5-10ms) - Distributed cache
  private l2Cache = new Redis({
    cluster: true,
    readReplicas: 3,
    compression: 'lz4'
  });

  // L3: CDN Edge (20-50ms) - Global edge cache
  private l3Cache = new CloudflareKV();

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const startTime = performance.now();

    // Try each cache level
    for (const [level, cache] of this.caches.entries()) {
      const result = await this.tryCache(cache, key);

      if (result !== null) {
        // Promote to higher levels
        await this.promote(key, result, level);

        // Record metrics
        this.metrics.recordHit(level, performance.now() - startTime);

        return result;
      }
    }

    // Cache miss - fetch and cache
    const value = await options?.fetcher?.();
    if (value !== null) {
      await this.setAll(key, value, options?.ttl);
    }

    this.metrics.recordMiss(performance.now() - startTime);
    return value;
  }

  async setAll(key: string, value: any, ttl?: number): Promise<void> {
    // Write to all cache levels in parallel
    await Promise.all([
      this.l0Cache.set(key, value, { ttl }),
      this.l1Cache.set(key, value, { ttl }),
      this.l2Cache.setex(key, ttl || 3600, this.compress(value)),
      this.l3Cache.put(key, value, { expirationTtl: ttl })
    ]);
  }

  // Smart cache warming
  async warmCache(userId: string): Promise<void> {
    const predictions = await this.predictor.predictAccess(userId);

    // Warm caches in parallel
    await Promise.all(
      predictions.map(async ({ key, fetcher, probability }) => {
        if (probability > 0.7) {
          const value = await fetcher();
          await this.setAll(key, value);
        }
      })
    );
  }
}
```

### Edge Computing with Cloudflare Workers

```typescript
// Edge worker for ultra-low latency
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Static asset serving from edge
    if (url.pathname.startsWith('/static/')) {
      const cached = await env.ASSETS.get(url.pathname);
      if (cached) {
        return new Response(cached, {
          headers: {
            'Cache-Control': 'public, max-age=31536000',
            'CDN-Cache-Control': 'max-age=31536000'
          }
        });
      }
    }

    // API response caching at edge
    if (url.pathname.startsWith('/api/')) {
      const cacheKey = this.getCacheKey(request);
      const cached = await env.KV.get(cacheKey, 'json');

      if (cached && !this.isStale(cached)) {
        return new Response(JSON.stringify(cached.data), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Age': String(Date.now() - cached.timestamp)
          }
        });
      }

      // Fetch from origin with timeout
      const response = await Promise.race([
        fetch(request),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
      ]);

      // Cache successful responses
      if (response.ok) {
        const data = await response.json();
        await env.KV.put(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }), { expirationTtl: 300 });
      }

      return response;
    }

    // Pass through to origin
    return fetch(request);
  }
};
```

### Database Query Optimization

```typescript
class QueryOptimizer {
  // Prepared statement cache
  private statements = new Map<string, PreparedStatement>();

  // Query result cache with automatic invalidation
  private queryCache = new QueryCache({
    maxSize: 10000,
    ttl: 60_000,
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE']
  });

  async optimizeQuery(query: string, params: any[]): Promise<QueryResult> {
    // Check query cache first
    const cacheKey = this.getCacheKey(query, params);
    const cached = this.queryCache.get(cacheKey);
    if (cached) return cached;

    // Use prepared statement
    let statement = this.statements.get(query);
    if (!statement) {
      statement = await this.db.prepare(query);
      this.statements.set(query, statement);
    }

    // Execute with read replica for SELECT
    const connection = query.trim().startsWith('SELECT')
      ? await this.getReadReplica()
      : this.primaryDb;

    const result = await statement.execute(params, { connection });

    // Cache if cacheable
    if (this.isCacheable(query)) {
      this.queryCache.set(cacheKey, result);
    }

    return result;
  }

  // Batch queries to reduce round trips
  async batchQueries(queries: Query[]): Promise<QueryResult[]> {
    // Group by connection type
    const grouped = this.groupQueries(queries);

    // Execute in parallel
    const results = await Promise.all(
      grouped.map(group => this.executeBatch(group))
    );

    return results.flat();
  }

  // Query plan caching
  async analyzeAndCache(query: string): Promise<QueryPlan> {
    const plan = await this.db.explain(query);

    // Identify optimization opportunities
    const optimizations = this.identifyOptimizations(plan);

    if (optimizations.length > 0) {
      // Create indexes if beneficial
      for (const index of optimizations.indexes) {
        await this.createIndex(index);
      }

      // Rewrite query if possible
      if (optimizations.rewrite) {
        query = optimizations.rewrite;
      }
    }

    return { query, plan, optimizations };
  }
}
```

### Speculative Execution

```typescript
class SpeculativeExecutor {
  async executeWithSpeculation(
    command: Command,
    context: Context
  ): Promise<Result> {
    // Predict likely next actions
    const predictions = await this.predictor.predictNext(command, context);

    // Start speculative execution for high-probability actions
    const speculative = predictions
      .filter(p => p.probability > 0.6)
      .map(p => this.speculativeExecute(p.action));

    // Execute actual command
    const result = await this.execute(command);

    // Store speculative results for instant access
    const speculativeResults = await Promise.allSettled(speculative);
    await this.cacheSpeculative(speculativeResults);

    return result;
  }

  private async speculativeExecute(action: Action): Promise<SpeculativeResult> {
    // Execute in background with lower priority
    return new Promise((resolve) => {
      setImmediate(async () => {
        try {
          const result = await this.execute(action);
          resolve({ action, result, timestamp: Date.now() });
        } catch (error) {
          resolve({ action, error, timestamp: Date.now() });
        }
      });
    });
  }
}
```

### Connection Pooling & Resource Management

```typescript
class ResourceManager {
  // Database connection pool
  private dbPool = new Pool({
    min: 10,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Health check
    validate: (connection) => connection.query('SELECT 1')
  });

  // HTTP connection pooling
  private httpAgent = new Agent({
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 100,
    maxFreeSockets: 20
  });

  // Redis connection pooling
  private redisPool = new RedisCluster({
    redisOptions: {
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      connectionPool: {
        min: 5,
        max: 30
      }
    }
  });

  // Smart resource allocation
  async allocateResources(priority: Priority): Promise<Resources> {
    const resources = {
      db: await this.dbPool.acquire(priority),
      cache: await this.redisPool.acquire(priority),
      http: this.httpAgent
    };

    // Set timeout based on priority
    const timeout = this.getTimeout(priority);

    return new Proxy(resources, {
      get: (target, prop) => {
        const resource = target[prop];
        return this.wrapWithTimeout(resource, timeout);
      }
    });
  }
}
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics = new MetricsCollector();

  // Request tracing
  async traceRequest(req: Request, handler: Handler): Promise<Response> {
    const span = this.tracer.startSpan('http.request', {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path
    });

    const segments: PerformanceSegment[] = [];

    try {
      // Database queries
      this.db.onQuery((query, duration) => {
        segments.push({
          type: 'db',
          query: query.sql,
          duration,
          timestamp: Date.now()
        });
        span.addEvent('db.query', { duration });
      });

      // Cache operations
      this.cache.onOperation((op, key, duration, hit) => {
        segments.push({
          type: 'cache',
          operation: op,
          key,
          duration,
          hit
        });
        span.addEvent(`cache.${op}`, { duration, hit });
      });

      // Execute request
      const start = performance.now();
      const response = await handler(req);
      const duration = performance.now() - start;

      // Record metrics
      this.metrics.recordRequest({
        method: req.method,
        path: req.path,
        status: response.status,
        duration,
        segments
      });

      // Add performance headers
      response.headers.set('Server-Timing', this.getServerTiming(segments));
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } finally {
      span.end();
    }
  }

  // Real-time performance dashboard
  async getPerformanceStats(): Promise<PerformanceStats> {
    return {
      latency: {
        p50: this.metrics.percentile(50),
        p95: this.metrics.percentile(95),
        p99: this.metrics.percentile(99)
      },
      throughput: this.metrics.requestsPerSecond(),
      errorRate: this.metrics.errorRate(),
      cacheHitRate: this.metrics.cacheHitRate(),
      slowQueries: await this.getSlowQueries(),
      bottlenecks: await this.identifyBottlenecks()
    };
  }

  // Auto-scaling based on load
  async autoScale(): Promise<void> {
    const metrics = await this.getPerformanceStats();

    if (metrics.latency.p95 > 400) {
      // Scale up
      await this.scaler.scaleUp({
        workers: Math.ceil(metrics.throughput / 1000),
        cacheSize: this.calculateOptimalCacheSize(metrics)
      });
    } else if (metrics.latency.p95 < 100 && metrics.throughput < 100) {
      // Scale down
      await this.scaler.scaleDown();
    }
  }
}
```

### Optimization Techniques

```typescript
class OptimizationEngine {
  // Lazy loading with intersection observer
  lazyLoad(elements: Element[]): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    elements.forEach(el => observer.observe(el));
  }

  // Request deduplication
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicatedFetch(key: string, fetcher: () => Promise<any>): Promise<any> {
    // Check if request is already in flight
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = fetcher().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Compression middleware
  compress(data: any): Buffer {
    if (data.length < 1024) return data; // Don't compress small payloads

    return brotli.compress(data, {
      params: {
        [brotli.constants.BROTLI_PARAM_QUALITY]: 4, // Fast compression
        [brotli.constants.BROTLI_PARAM_LGWIN]: 22
      }
    });
  }
}
```

## ✅ Key Deliverables

- [ ] Multi-tier cache implementation (L0-L3)
- [ ] Edge computing with Cloudflare Workers
- [ ] Query optimization & caching
- [ ] Speculative execution engine
- [ ] Connection pooling for all resources
- [ ] Performance monitoring dashboard
- [ ] Auto-scaling based on metrics
- [ ] 90% test coverage

## 📊 Performance Checklist

- [ ] All API endpoints <300ms p95
- [ ] Database queries <10ms
- [ ] Cache hit rate >90%
- [ ] Zero N+1 queries
- [ ] Batch operations implemented
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured for static assets
- [ ] Image optimization & lazy loading
- [ ] Request deduplication
- [ ] Resource hints (preconnect, prefetch)

Remember: Performance is a feature. Users expect instant.