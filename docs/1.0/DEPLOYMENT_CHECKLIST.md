# 🚢 Production Deployment Checklist

**Timeline**: Week 10 (1 week)
**Priority**: 🔴 P0 - Must Complete Before Launch
**Goal**: Production-ready, monitored, secure deployment

---

## 🎯 Pre-Deployment Requirements

### Code Quality ✅
- [ ] All tests passing (60%+ coverage)
- [ ] Zero critical bugs
- [ ] Zero force unwraps in production code
- [ ] Zero fatalError calls
- [ ] SwiftLint passes with 0 warnings
- [ ] TypeScript builds with 0 errors
- [ ] All TODO comments resolved or documented

### Security ✅
- [ ] JWT authentication on all services
- [ ] Rate limiting configured
- [ ] Tokens stored in Keychain
- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] Row-level security (RLS) enabled
- [ ] CORS properly configured
- [ ] HTTPS only

### Features ✅
- [ ] All MVP features complete
- [ ] Email CRUD working
- [ ] Calendar CRUD working
- [ ] Tasks CRUD working
- [ ] Chat working
- [ ] Auth flow complete
- [ ] Navigation working
- [ ] Settings working

---

## 🔐 Security Audit

### Day 1: Security Review

#### 1. Authentication & Authorization

**iOS Security Checks**:
```swift
// ✅ Verify Keychain usage
class AuthManager {
    // Tokens MUST be in Keychain
    private func saveTokens(_ tokens: AuthTokens) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "access_token",
            kSecValueData as String: tokens.accessToken.data(using: .utf8)!,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        SecItemAdd(query as CFDictionary, nil)
    }
}

// ❌ Never in UserDefaults
// UserDefaults.standard.set(accessToken, forKey: "token") // WRONG!
```

**Backend Security Checks**:
```typescript
// ✅ JWT validation on all routes
app.use('/api/*', authenticateJWT);

// ✅ Verify userId in all queries
app.get('/api/emails', async (req: AuthenticatedRequest, res) => {
  const emails = await db
    .from('emails')
    .select()
    .eq('user_id', req.userId); // MUST filter by userId
});

// ❌ Never trust userId from request body
// const userId = req.body.userId; // WRONG! Use req.userId from JWT
```

**Checklist**:
- [ ] All tokens in Keychain (not UserDefaults)
- [ ] All API routes have JWT middleware
- [ ] All queries filter by authenticated userId
- [ ] No userId accepted from request body
- [ ] OAuth state parameter validated
- [ ] Refresh tokens rotated on use

---

#### 2. Data Protection

**Supabase RLS Policies**:
```sql
-- ✅ Verify RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
-- Should return 0 rows

-- ✅ Verify policies exist
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) = 0;
-- Should return 0 rows

-- Example policy
CREATE POLICY "Users can only see their own emails"
  ON emails
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Sensitive Data Handling**:
```typescript
// ✅ Never log sensitive data
logger.info('User logged in', {
  userId: user.id,
  // email: user.email, // DON'T log email
  // accessToken: token, // DON'T log tokens
});

// ✅ Sanitize error messages
catch (error) {
  logger.error('Database error', { error });
  res.status(500).json({
    error: 'An error occurred', // Generic message
    // NOT: error.message // Might leak schema
  });
}
```

**Checklist**:
- [ ] RLS enabled on all 22 tables
- [ ] Each table has SELECT/INSERT/UPDATE/DELETE policies
- [ ] No sensitive data in logs
- [ ] Error messages sanitized
- [ ] No stack traces to client

---

#### 3. Input Validation

**Backend Validation**:
```typescript
import { z } from 'zod';

// ✅ Validate all inputs
const EmailSendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(50000),
  cc: z.array(z.string().email()).optional(),
});

app.post('/api/emails/send', async (req, res) => {
  try {
    const validated = EmailSendSchema.parse(req.body);
    // Use validated data
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

**Checklist**:
- [ ] All POST/PUT endpoints validate input
- [ ] Email addresses validated
- [ ] String lengths limited
- [ ] Arrays have max length
- [ ] SQL injection prevented (using parameterized queries)
- [ ] XSS prevented (HTML sanitized)

---

#### 4. Rate Limiting

**Configuration**:
```typescript
// packages/services/shared/middleware/rate-limit.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.userId || req.ip,
});

// Stricter limit for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

// Apply limits
app.use('/api/*', apiLimiter);
app.use('/api/auth/*', authLimiter);
```

**Checklist**:
- [ ] Rate limiting on all API routes
- [ ] Auth endpoints have stricter limits
- [ ] Redis-backed storage (not in-memory)
- [ ] Per-user limits (not just IP)
- [ ] Appropriate error messages

---

## ⚡ Performance Optimization

### Day 2: Performance Review

#### 1. iOS App Performance

**App Launch**:
```swift
// Target: < 1 second launch time

// ✅ Optimize
@main
struct TideApp: App {
    init() {
        // Move heavy initialization to background
        Task.detached(priority: .background) {
            await PreloadManager.shared.preloadData()
        }

        // Only critical setup here
        configureLogging()
    }
}

// ❌ Don't do in init
// - Network requests
// - Heavy processing
// - Large data loads
```

**List Scrolling**:
```swift
// Target: 60fps scrolling

// ✅ Use LazyVStack for long lists
LazyVStack {
    ForEach(emails) { email in
        EmailRow(email: email)
    }
}

// ✅ Paginate data
if viewModel.hasMore && emails.last?.id == email.id {
    ProgressView()
        .onAppear {
            Task { await viewModel.loadMore() }
        }
}
```

**Checklist**:
- [ ] App launches in < 1s
- [ ] All lists scroll at 60fps
- [ ] Images load async
- [ ] Pagination implemented
- [ ] No memory leaks (Instruments check)
- [ ] No frame drops (Instruments check)

---

#### 2. Backend Performance

**Database Optimization**:
```sql
-- ✅ Add indexes to frequently queried columns
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX idx_emails_sender ON emails((sender->>'email'));

-- ✅ Add composite indexes for common queries
CREATE INDEX idx_emails_user_unread ON emails(user_id, is_read)
  WHERE is_read = false;

-- ✅ Verify query performance
EXPLAIN ANALYZE
SELECT * FROM emails
WHERE user_id = 'xxx'
  AND is_read = false
ORDER BY received_at DESC
LIMIT 20;
-- Should use index scan, not seq scan
```

**Caching Strategy**:
```typescript
// packages/libraries/cache/src/redis-cache.ts

import { Redis } from 'ioredis';

export class RedisCache {
  private redis: Redis;

  constructor(url: string) {
    this.redis = new Redis(url);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

// Cache frequently accessed data
const cache = new RedisCache(process.env.REDIS_URL);

app.get('/api/emails', async (req: AuthenticatedRequest, res) => {
  const cacheKey = `emails:${req.userId}`;

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Fetch from DB
  const emails = await db.from('emails')
    .select()
    .eq('user_id', req.userId)
    .order('received_at', { ascending: false })
    .limit(20);

  // Cache for 1 minute
  await cache.set(cacheKey, emails, 60);

  res.json(emails);
});
```

**What to Cache**:
```
✅ Cache (with TTL):
- User profile (5 min)
- Email list (1 min)
- Calendar events (5 min)
- GPT-5 responses (10 min)

❌ Don't cache:
- Auth tokens
- Real-time data
- User-specific mutations
```

**Checklist**:
- [ ] Database indexes on all foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Query plans reviewed (no seq scans)
- [ ] Redis caching implemented
- [ ] Cache invalidation strategy
- [ ] API response time P95 < 500ms

---

## 📊 Monitoring & Alerts

### Day 3: Monitoring Setup

#### 1. Error Tracking (Sentry)

**Backend Setup**:
```typescript
// packages/services/shared/monitoring/sentry.ts

import * as Sentry from '@sentry/node';

export function initializeSentry(serviceName: string) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    serverName: serviceName,
    tracesSampleRate: 0.1, // Sample 10% of transactions
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
  });
}

// Error handler middleware
export function sentryErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  Sentry.captureException(err, {
    tags: {
      service: 'ai-service',
      userId: (req as AuthenticatedRequest).userId,
    },
    extra: {
      path: req.path,
      method: req.method,
    },
  });

  next(err);
}
```

**iOS Setup**:
```swift
// TideApp.swift

import Sentry

@main
struct TideApp: App {
    init() {
        SentrySDK.start { options in
            options.dsn = Config.sentryDSN
            options.environment = Config.environment
            options.tracesSampleRate = 0.1
            options.enableAutoSessionTracking = true
        }
    }
}

// Capture errors
do {
    try await apiClient.get("/api/emails")
} catch {
    SentrySDK.capture(error: error)
    self.error = error
}
```

**Checklist**:
- [ ] Sentry configured in all 9 backend services
- [ ] Sentry configured in iOS app
- [ ] Error context included (userId, service, path)
- [ ] PII not logged (emails, tokens)
- [ ] Alerts configured for error spikes

---

#### 2. Application Metrics

**Backend Metrics**:
```typescript
// packages/services/shared/monitoring/metrics.ts

import { Request, Response, NextFunction } from 'express';

interface Metrics {
  requestCount: number;
  errorCount: number;
  responseTime: number[];
}

const metrics = new Map<string, Metrics>();

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = `${req.method} ${req.path}`;

    if (!metrics.has(route)) {
      metrics.set(route, {
        requestCount: 0,
        errorCount: 0,
        responseTime: [],
      });
    }

    const metric = metrics.get(route)!;
    metric.requestCount++;
    metric.responseTime.push(duration);

    if (res.statusCode >= 400) {
      metric.errorCount++;
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request', {
        route,
        duration,
        statusCode: res.statusCode,
      });
    }
  });

  next();
}

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  const summary = Array.from(metrics.entries()).map(([route, metric]) => ({
    route,
    requests: metric.requestCount,
    errors: metric.errorCount,
    errorRate: metric.errorCount / metric.requestCount,
    avgResponseTime: metric.responseTime.reduce((a, b) => a + b, 0) / metric.responseTime.length,
    p95ResponseTime: calculateP95(metric.responseTime),
  }));

  res.json(summary);
});
```

**What to Monitor**:
```
Backend:
- Request count per endpoint
- Error rate per endpoint
- Response time (avg, P95, P99)
- Database query time
- Cache hit rate
- Active connections

iOS:
- App launch time
- Screen load time
- API request time
- Memory usage
- Crash rate
```

**Checklist**:
- [ ] Metrics middleware on all services
- [ ] /metrics endpoint exposed
- [ ] Prometheus/Datadog configured
- [ ] Dashboards created
- [ ] Slow query logging

---

#### 3. Uptime Monitoring

**Health Checks**:
```typescript
// All services have /health endpoint

app.get('/health', async (req, res) => {
  const checks = {
    service: 'healthy',
    database: 'unknown',
    redis: 'unknown',
    dependencies: {},
  };

  try {
    // Check database
    await db.raw('SELECT 1');
    checks.database = 'healthy';
  } catch (error) {
    checks.database = 'unhealthy';
    checks.service = 'degraded';
  }

  try {
    // Check Redis
    await redis.ping();
    checks.redis = 'healthy';
  } catch (error) {
    checks.redis = 'unhealthy';
    checks.service = 'degraded';
  }

  // Check critical dependencies
  const criticalServices = ['ai', 'email', 'calendar'];
  for (const service of criticalServices) {
    try {
      const url = process.env[`${service.toUpperCase()}_SERVICE_URL`];
      const response = await fetch(`${url}/health`, { timeout: 5000 });
      checks.dependencies[service] = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      checks.dependencies[service] = 'unreachable';
    }
  }

  const statusCode = checks.service === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

**Railway Health Checks**:
```toml
# railway.toml (in each service)

[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

**External Monitoring**:
- Use UptimeRobot or Better Uptime
- Monitor: https://gateway.railway.app/health
- Check every 5 minutes
- Alert on: Down, degraded, > 2s response

**Checklist**:
- [ ] /health endpoint on all services
- [ ] Health checks verify DB + Redis
- [ ] Railway health checks configured
- [ ] External uptime monitoring
- [ ] Alerts to Slack/email
- [ ] Incident response plan

---

## 🚀 Railway Deployment

### Day 4: Production Deployment

#### 1. Database Migrations

**Run migrations on production database**:
```bash
# ✅ Backup first!
supabase db dump --db-url $PROD_DATABASE_URL > backup-$(date +%Y%m%d).sql

# Apply migrations
cd supabase
supabase db push --db-url $PROD_DATABASE_URL

# Verify
supabase db diff --db-url $PROD_DATABASE_URL
# Should show no differences
```

**Migrations to apply**:
```
1. 20251007_calendar_intelligence_tables.sql
2. 20251007_decisions_tables.sql
3. 20251007_email_intelligence_tables.sql
4. 20251007_intelligence_tables.sql
5. 20251008_email_fulltext_search.sql
```

**Checklist**:
- [ ] Production database backed up
- [ ] All migrations applied
- [ ] RLS policies active
- [ ] Indexes created
- [ ] No errors in migration

---

#### 2. Service Deployment

**Deploy Order** (to avoid dependency failures):
```bash
# 1. Gateway (entry point)
cd packages/services/gateway
railway up --service gateway --environment production

# 2. Core services (no dependencies)
railway up --service ai --environment production
railway up --service email --environment production
railway up --service calendar --environment production
railway up --service workflow --environment production

# 3. Intelligence services (depend on core)
railway up --service intelligence --environment production
railway up --service actions --environment production
railway up --service decisions --environment production

# 4. BFF (depends on everything)
railway up --service mobile-bff --environment production
```

**Environment Variables** (set in Railway UI):
```bash
# Shared
NODE_ENV=production
LOG_LEVEL=info
SENTRY_DSN=https://...

# Database
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# Service URLs (Railway auto-sets these)
AI_SERVICE_URL=https://ai-production.railway.app
EMAIL_SERVICE_URL=https://email-production.railway.app
CALENDAR_SERVICE_URL=https://calendar-production.railway.app
...
```

**Verification**:
```bash
# Check all services are healthy
for service in gateway ai email calendar workflow intelligence actions decisions mobile-bff; do
  echo "Checking $service..."
  curl https://$service-production.railway.app/health
done
```

**Checklist**:
- [ ] All 9 services deployed
- [ ] All environment variables set
- [ ] All services healthy
- [ ] Inter-service communication works
- [ ] No deployment errors

---

#### 3. Domain & SSL

**Custom Domain** (if using):
```bash
# In Railway UI:
# Settings → Domains → Add Domain
# gateway.tide.app → gateway service

# DNS settings (Cloudflare):
CNAME gateway gateway-production.railway.app
CNAME api gateway-production.railway.app
```

**SSL** (automatic with Railway):
- Railway provides automatic SSL
- Certs renew automatically
- HTTPS enforced

**Checklist**:
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] HTTPS enforced
- [ ] HTTP redirects to HTTPS

---

## 🧪 Production Testing

### Day 5: Final Validation

#### Pre-Launch Testing

**Manual QA Checklist**:
```
Authentication:
- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] Token refresh works
- [ ] Invalid token handled

Email:
- [ ] Can load inbox
- [ ] Can read email
- [ ] Can reply to email
- [ ] Can compose new email
- [ ] Can send email
- [ ] Can delete email
- [ ] Can archive email
- [ ] Search works

Calendar:
- [ ] Can view month
- [ ] Can view week
- [ ] Can view day
- [ ] Can create event
- [ ] Can edit event
- [ ] Can delete event
- [ ] Conflicts detected

Tasks:
- [ ] Can view tasks
- [ ] Can create task
- [ ] Can edit task
- [ ] Can complete task
- [ ] Can delete task

Chat:
- [ ] Can send message
- [ ] Receives AI response
- [ ] GPT-5 tool calling works
- [ ] Can view history
- [ ] Can start new conversation

Settings:
- [ ] Can view profile
- [ ] Can connect Gmail
- [ ] Can disconnect Gmail
- [ ] Can logout
```

**Performance Testing**:
```bash
# Load testing with Artillery
artillery quick --count 10 --num 50 https://gateway-production.railway.app/api/chat/send

# Should handle:
- 10 concurrent users
- 50 requests per user
- P95 < 500ms
- 0% error rate
```

**Checklist**:
- [ ] All manual tests pass
- [ ] Load test passes
- [ ] No memory leaks
- [ ] No crashes
- [ ] Error tracking working

---

## 📱 iOS App Release

### TestFlight Beta

**Build Configuration**:
```swift
// TideApp/Config/Config.swift

struct Config {
    #if DEBUG
    static let apiBaseURL = "http://localhost:3000"
    static let environment = "development"
    #else
    static let apiBaseURL = "https://gateway-production.railway.app"
    static let environment = "production"
    #endif

    static let sentryDSN = "https://..."
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
}
```

**Archive & Upload**:
```bash
# 1. Update version number
# Info.plist: CFBundleShortVersionString = 1.0.0
# Info.plist: CFBundleVersion = 1

# 2. Archive
xcodebuild archive \
  -workspace TideApp.xcworkspace \
  -scheme TideApp \
  -archivePath ./build/TideApp.xcarchive \
  -configuration Release

# 3. Export IPA
xcodebuild -exportArchive \
  -archivePath ./build/TideApp.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist

# 4. Upload to TestFlight
xcrun altool --upload-app \
  -f ./build/TideApp.ipa \
  -t ios \
  -u $APPLE_ID \
  -p $APP_SPECIFIC_PASSWORD
```

**Checklist**:
- [ ] Build version incremented
- [ ] Release configuration
- [ ] Archive successful
- [ ] IPA uploaded
- [ ] TestFlight build available
- [ ] 10 internal testers invited

---

## 🎉 Launch Readiness

### Go/No-Go Criteria

**MUST HAVE (Blocking)**:
- [ ] All tests passing (60%+ coverage)
- [ ] All critical bugs fixed
- [ ] All MVP features complete
- [ ] All services deployed and healthy
- [ ] Security audit passed
- [ ] Database migrations applied
- [ ] Monitoring active
- [ ] Error tracking active
- [ ] 10 internal testers validated

**SHOULD HAVE (Non-blocking)**:
- [ ] Performance optimized (P95 < 500ms)
- [ ] All documentation updated
- [ ] TestFlight beta tested
- [ ] Custom domain configured
- [ ] Marketing site ready

**NICE TO HAVE (Defer if needed)**:
- [ ] Advanced analytics
- [ ] Push notifications
- [ ] Offline mode fully tested
- [ ] All edge cases handled

---

## 📞 Incident Response Plan

### On-Call Rotation
- Week 1-2: Primary on-call
- Backup: (team member)

### Severity Levels
- **P0 (Critical)**: Service down, data loss - Fix immediately
- **P1 (High)**: Major feature broken - Fix within 4 hours
- **P2 (Medium)**: Minor issue - Fix within 1 day
- **P3 (Low)**: Enhancement - Next sprint

### Response Procedures

**Service Down**:
```
1. Check Railway dashboard
2. Check /health endpoints
3. Check Sentry for errors
4. Check logs: railway logs --service $SERVICE
5. If DB issue: check Supabase
6. If API issue: check GPT-5 status
7. Rollback if needed: railway rollback --service $SERVICE
8. Post-mortem after resolution
```

**Data Issue**:
```
1. Stop writes immediately
2. Restore from backup
3. Investigate root cause
4. Fix and verify
5. Resume service
6. Notify affected users
```

---

## ✅ Final Checklist

### Code
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Clean git history
- [ ] Main branch protected

### Infrastructure
- [ ] All services deployed
- [ ] All health checks green
- [ ] Database migrated
- [ ] Monitoring active

### Security
- [ ] Security audit complete
- [ ] No secrets in code
- [ ] RLS policies active
- [ ] Rate limiting configured

### Operations
- [ ] Incident response plan
- [ ] On-call rotation
- [ ] Runbooks created
- [ ] Team trained

### Launch
- [ ] Internal testing complete
- [ ] TestFlight beta ready
- [ ] Go/no-go decision made
- [ ] Launch announcement prepared

---

**🚀 Ready to ship!**

---

## 📅 Week 10 Schedule

**Day 1**: Security audit
**Day 2**: Performance optimization
**Day 3**: Monitoring setup
**Day 4**: Railway deployment
**Day 5**: Final testing & launch

---

**"Shipping is a feature. Let's ship."** 🌊
