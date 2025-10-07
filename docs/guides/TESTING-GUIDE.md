# Tide - Testing & Execution Guide

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages
pnpm build

# 3. Type check
pnpm type-check

# 4. Start infrastructure (requires Docker)
docker compose up -d

# 5. Start services (in separate terminals)
pnpm --filter @tide/gateway dev
pnpm --filter @tide/auth-service dev
```

---

## Detailed Testing Procedures

### 1. Prerequisites

**Required Software**:
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker Desktop (or Docker Engine)
- PostgreSQL client (optional, for manual DB access)
- Redis CLI (optional, for manual cache access)
- jq (for JSON parsing in test scripts)
- curl (for API testing)

**Check Prerequisites**:
```bash
node --version    # Should be >= 20.0.0
pnpm --version    # Should be >= 8.0.0
docker --version  # Should be running
```

---

### 2. Build & Type Checking

#### Build All Packages
```bash
# Clean build
pnpm clean
pnpm install
pnpm build
```

**Expected Output**:
```
Scope: 6 of 7 workspace projects
packages/shared/types build$ tsc --build
packages/shared/types build: Done
packages/shared/contracts build$ tsc --build
packages/shared/contracts build: Done
packages/shared/utils build$ tsc --build
packages/shared/utils build: Done
packages/libraries/event-bus build$ tsc --build
packages/libraries/event-bus build: Done
services/gateway build$ tsc --build
services/gateway build: Done
services/auth build$ tsc --build
services/auth build: Done
```

#### Type Checking
```bash
pnpm type-check
```

**Expected**: No type errors

---

### 3. Infrastructure Setup

#### Start All Infrastructure Services
```bash
docker compose up -d
```

**Services Started**:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Zookeeper (port 2181)
- Kafka (port 29092)
- Kafka UI (port 8080)
- Prometheus (port 9090)
- Grafana (port 3001)

#### Verify Infrastructure Health
```bash
# PostgreSQL
psql postgresql://tide:tide_dev_password@localhost:5432/tide -c "SELECT 1"

# Redis
redis-cli -a tide_redis_password ping

# Kafka
nc -z localhost 29092 && echo "Kafka is up"
```

#### View Infrastructure UIs
- **Kafka UI**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

---

### 4. Database Verification

#### Connect to PostgreSQL
```bash
psql postgresql://tide:tide_dev_password@localhost:5432/tide
```

#### Verify Schema
```sql
-- List all schemas
\dn

-- Should see: tide, auth, events

-- List tables in tide schema
\dt tide.*

-- Should see: users, conversations, messages, messages_current, messages_next

-- Check partitions
SELECT schemaname, tablename, tableowner
FROM pg_tables
WHERE tablename LIKE 'messages%';
```

#### Test Database Queries
```sql
-- Test user table
SELECT COUNT(*) FROM tide.users;

-- Test extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm', 'btree_gin');

-- Test indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'tide';
```

---

### 5. Start Application Services

#### Terminal 1: Gateway
```bash
pnpm --filter @tide/gateway dev
```

**Expected Output**:
```json
{"timestamp":"2025-10-06T...","level":"info","service":"gateway","message":"Gateway started","port":4000}
```

#### Terminal 2: Auth Service
```bash
pnpm --filter @tide/auth-service dev
```

**Expected Output**:
```json
{"timestamp":"2025-10-06T...","level":"info","service":"auth-service","message":"Connected to event bus"}
{"timestamp":"2025-10-06T...","level":"info","service":"auth-service","message":"Auth service started","port":4001}
```

---

### 6. API Testing

#### Health Checks
```bash
# Gateway health
curl http://localhost:4000/health | jq '.'

# Expected:
{
  "status": "healthy",
  "timestamp": 1728239...
  "service": "gateway"
}

# Auth service health
curl http://localhost:4001/health | jq '.'

# Expected:
{
  "status": "healthy",
  "timestamp": 1728239...,
  "services": {
    "database": true
  }
}
```

#### User Registration
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tide.ai",
    "password": "SecurePass123!",
    "name": "Test User",
    "timezone": "America/Los_Angeles"
  }' | jq '.'
```

**Expected Response (201)**:
```json
{
  "user": {
    "id": "uuid...",
    "email": "test@tide.ai",
    "name": "Test User",
    "timezone": "America/Los_Angeles",
    "locale": "en-US",
    "settings": {},
    "createdAt": 1728239...,
    "updatedAt": 1728239...
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### User Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tide.ai",
    "password": "SecurePass123!"
  }' | jq '.'
```

**Expected Response (200)**: Same structure as registration

#### Token Refresh
```bash
# Save the refresh token from registration/login
REFRESH_TOKEN="eyJhbGc..."

curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }" | jq '.'
```

**Expected Response (200)**:
```json
{
  "accessToken": "new_token...",
  "refreshToken": "new_refresh_token..."
}
```

#### Test Validation (Should Fail)
```bash
# Weak password
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@tide.ai",
    "password": "weak",
    "name": "Weak User",
    "timezone": "America/Los_Angeles"
  }' | jq '.'

# Expected Response (400):
{
  "code": "VALIDATION_ERROR",
  "message": "Password must be at least 8 characters long, ...",
  "timestamp": 1728239...
}

# Duplicate email
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tide.ai",
    "password": "SecurePass123!",
    "name": "Duplicate User",
    "timezone": "America/Los_Angeles"
  }' | jq '.'

# Expected Response (409):
{
  "code": "VALIDATION_ERROR",
  "message": "User with this email already exists",
  "timestamp": 1728239...
}
```

---

### 7. Event Bus Verification

#### Check Kafka Topics
Visit Kafka UI at http://localhost:8080

**Expected Topics**:
- user-events
- conversation-events
- message-events
- email-events
- calendar-events
- task-events
- workflow-events

#### Verify User Created Event
After registering a user, check the `user-events` topic in Kafka UI.

**Expected Message**:
```json
{
  "id": "uuid...",
  "type": "user.created",
  "aggregateId": "user-uuid...",
  "aggregateType": "user",
  "payload": {
    "user": { ... }
  },
  "metadata": {
    "userId": "user-uuid...",
    "timestamp": 1728239...,
    "version": 1
  }
}
```

---

### 8. Monitoring & Metrics

#### Prometheus Metrics
```bash
# Gateway metrics
curl http://localhost:4000/metrics

# Auth service metrics
curl http://localhost:4001/metrics
```

**Expected Metrics** (examples):
- `process_cpu_user_seconds_total`
- `process_resident_memory_bytes`
- `nodejs_eventloop_lag_seconds`
- `nodejs_active_handles_total`

#### Grafana Dashboards
1. Visit http://localhost:3001
2. Login: admin/admin
3. Navigate to Explore
4. Select Prometheus as data source
5. Query: `rate(process_cpu_user_seconds_total[5m])`

---

### 9. Load Testing

#### Simple Load Test with curl
```bash
# Register 10 users concurrently
for i in {1..10}; do
  curl -X POST http://localhost:4000/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"user${i}@tide.ai\",
      \"password\": \"SecurePass123!\",
      \"name\": \"User ${i}\",
      \"timezone\": \"America/Los_Angeles\"
    }" &
done
wait

# Check database
psql postgresql://tide:tide_dev_password@localhost:5432/tide -c "SELECT COUNT(*) FROM tide.users;"
```

#### Load Test with ab (Apache Bench)
```bash
# Install ab if needed: brew install httpd (macOS)

# Test gateway health endpoint
ab -n 1000 -c 10 http://localhost:4000/health
```

---

### 10. Cleanup

#### Stop Services
```bash
# Stop Node.js services (Ctrl+C in each terminal)

# Stop Docker infrastructure
docker compose down

# Remove volumes (WARNING: Deletes all data)
docker compose down -v
```

#### Clean Build Artifacts
```bash
pnpm clean
```

---

## Automated Test Scripts

### Run Integration Tests
```bash
./scripts/test-api.sh
```

**Tests Performed**:
1. Gateway health check
2. Auth service health check
3. User registration
4. User login
5. Login with wrong password (should fail)
6. Token refresh
7. Duplicate registration (should fail)
8. Weak password validation (should fail)

### Run Health Checks
```bash
./scripts/check-health.sh
```

---

## Troubleshooting

### Docker Not Running
```
Error: Cannot connect to the Docker daemon
```

**Solution**: Start Docker Desktop or run `sudo systemctl start docker` (Linux)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution**:
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```
Error: ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
```bash
# Check PostgreSQL is running
docker compose ps

# Restart if needed
docker compose restart postgres
```

### TypeScript Errors
```bash
# Rebuild from scratch
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

### Kafka Topics Not Created
```bash
# Restart Kafka
docker compose restart kafka

# Wait 30 seconds for startup
sleep 30

# Check topics at http://localhost:8080
```

---

## Performance Benchmarks

### Expected Performance (Development)

| Metric | Target | Acceptable |
|--------|--------|------------|
| Gateway health check | <10ms | <50ms |
| Auth health check | <20ms | <100ms |
| User registration | <200ms | <500ms |
| User login | <150ms | <400ms |
| Token refresh | <50ms | <150ms |
| Database query | <10ms | <50ms |
| Event publish | <20ms | <100ms |

---

## Security Checklist

- [ ] JWT secret is not default value
- [ ] Database password is not default value
- [ ] Redis password is configured
- [ ] CORS origins are properly configured
- [ ] Password validation is enforced
- [ ] Refresh tokens are hashed in database
- [ ] HTTPS is used in production
- [ ] Rate limiting is enabled (TODO)
- [ ] Input sanitization is active

---

## Next Steps

1. **Add Unit Tests**: Create tests for password validation, JWT service, etc.
2. **Add Integration Tests**: Automated API test suite with Jest/Vitest
3. **Add E2E Tests**: Full user flow testing with Playwright
4. **Add Load Tests**: k6 or Artillery for performance testing
5. **Set up CI/CD**: GitHub Actions for automated testing
6. **Add Monitoring**: Sentry for error tracking, Datadog for APM

---

## Reference Commands

```bash
# Development
pnpm dev                  # Start all services
pnpm build                # Build all packages
pnpm type-check           # Type check all packages
pnpm test                 # Run all tests
pnpm lint                 # Lint all packages

# Docker
docker compose up -d      # Start infrastructure
docker compose down       # Stop infrastructure
docker compose logs -f    # View logs
docker compose ps         # List services

# Database
psql postgresql://tide:tide_dev_password@localhost:5432/tide
\dt tide.*                # List tables
\d+ tide.users            # Describe users table

# Redis
redis-cli -a tide_redis_password
KEYS *                    # List all keys
GET key                   # Get value

# Kafka
# Use Kafka UI at http://localhost:8080
```

---

**Last Updated**: 2025-10-06
**Next Review**: After Week 3 Alpha Integration
