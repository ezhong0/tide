# Railway Deployment Guide

**Project**: Tide Alpha
**Date**: 2025-10-07
**Status**: Ready for Deployment

---

## Prerequisites ✅

- [x] Railway CLI installed
- [x] Logged in as Edward Zhong (edwardrzhong@gmail.com)
- [x] Project linked to Railway
- [x] Environment: production

---

## Services to Deploy

### 1. AI Service
**Path**: `packages/services/ai`
**Port**: 4003
**Dependencies**: Anthropic API, OpenAI API

**Environment Variables**:
```bash
NODE_ENV=production
PORT=4003
ANTHROPIC_API_KEY=<from .env line 70>
OPENAI_API_KEY=<from .env>
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from .env>
LOG_LEVEL=info
```

**Deployment Command**:
```bash
cd packages/services/ai
railway up --detach
```

---

### 2. Email Service
**Path**: `packages/services/email`
**Port**: 4004
**Dependencies**: Gmail API, Exchange API

**Environment Variables**:
```bash
NODE_ENV=production
PORT=4004
GOOGLE_CLIENT_ID=<from .env>
GOOGLE_CLIENT_SECRET=<from .env>
AZURE_CLIENT_ID=<from .env>
AZURE_CLIENT_SECRET=<from .env>
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from .env>
AI_SERVICE_URL=<railway-ai-service-url>
LOG_LEVEL=info
```

**Deployment Command**:
```bash
cd packages/services/email
railway up --detach
```

---

### 3. Calendar Service
**Path**: `packages/services/calendar`
**Port**: 4005
**Dependencies**: Google Calendar API, Exchange Calendar API

**Environment Variables**:
```bash
NODE_ENV=production
PORT=4005
GOOGLE_CLIENT_ID=<from .env>
GOOGLE_CLIENT_SECRET=<from .env>
AZURE_CLIENT_ID=<from .env>
AZURE_CLIENT_SECRET=<from .env>
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from .env>
AI_SERVICE_URL=<railway-ai-service-url>
LOG_LEVEL=info
```

**Deployment Command**:
```bash
cd packages/services/calendar
railway up --detach
```

---

### 4. Workflow Service
**Path**: `packages/services/workflow`
**Port**: 4006
**Dependencies**: Kafka, Redis

**Environment Variables**:
```bash
NODE_ENV=production
PORT=4006
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from .env>
KAFKA_BROKERS=<railway-kafka-url>
REDIS_URL=<railway-redis-url>
AI_SERVICE_URL=<railway-ai-service-url>
LOG_LEVEL=info
```

**Deployment Command**:
```bash
cd packages/services/workflow
railway up --detach
```

---

### 5. Gateway Service
**Path**: `packages/services/gateway`
**Port**: 4000
**Dependencies**: All backend services

**Environment Variables**:
```bash
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from .env>
AI_SERVICE_URL=<railway-ai-service-url>
EMAIL_SERVICE_URL=<railway-email-service-url>
CALENDAR_SERVICE_URL=<railway-calendar-service-url>
WORKFLOW_SERVICE_URL=<railway-workflow-service-url>
JWT_ACCESS_SECRET=<from .env>
JWT_REFRESH_SECRET=<from .env>
LOG_LEVEL=info
```

**Deployment Command**:
```bash
cd packages/services/gateway
railway up --detach
```

---

## Deployment Steps

### Step 1: Deploy AI Service First
```bash
cd packages/services/ai
railway up --service tide-ai --detach
```

**Why first?** Other services depend on AI Service URL

### Step 2: Deploy Email & Calendar Services
```bash
cd packages/services/email
railway up --service tide-email --detach

cd packages/services/calendar
railway up --service tide-calendar --detach
```

### Step 3: Deploy Workflow Service
```bash
cd packages/services/workflow
railway up --service tide-workflow --detach
```

### Step 4: Deploy Gateway Service
```bash
cd packages/services/gateway
railway up --service tide-gateway --detach
```

---

## Post-Deployment Verification

### 1. Check Service Health
```bash
# Get service URLs from Railway dashboard
railway variables

# Check health endpoints
curl https://<ai-service-url>/health
curl https://<email-service-url>/health
curl https://<calendar-service-url>/health
curl https://<workflow-service-url>/health
curl https://<gateway-service-url>/health
```

### 2. Check Logs
```bash
railway logs --service tide-ai
railway logs --service tide-email
railway logs --service tide-calendar
railway logs --service tide-workflow
railway logs --service tide-gateway
```

### 3. Monitor Railway Dashboard
- Open Railway dashboard
- Verify all services showing "Healthy" status
- Check CPU/Memory usage
- Verify no deployment errors

---

## Environment Variable Configuration

### Via Railway CLI
```bash
# Set individual variables
railway variables set ANTHROPIC_API_KEY=<value> --service tide-ai
railway variables set OPENAI_API_KEY=<value> --service tide-ai

# Or use Railway dashboard for bulk updates
```

### Via Railway Dashboard
1. Go to project: `tide`
2. Select service (e.g., `tide-ai`)
3. Click "Variables" tab
4. Add/Update environment variables
5. Redeploy service

---

## Rollback Procedures

### If Deployment Fails
```bash
# Check recent deployments
railway deployments

# Rollback to previous version
railway rollback --service <service-name>
```

### If Service is Unhealthy
```bash
# Check logs
railway logs --service <service-name> --tail 100

# Restart service
railway restart --service <service-name>

# If issues persist, rollback
railway rollback --service <service-name>
```

---

## Monitoring & Alerts

### Key Metrics to Watch
- **Response Time**: <500ms P95
- **Error Rate**: <1%
- **CPU Usage**: <70%
- **Memory Usage**: <80%
- **Request Rate**: Monitor for spikes

### Railway Monitoring
- Built-in metrics in Railway dashboard
- CPU, Memory, Network usage graphs
- Deployment history and logs

### External Monitoring (Future)
- Sentry for error tracking
- DataDog/New Relic for APM
- PagerDuty for on-call alerts

---

## Troubleshooting

### Service Won't Deploy
1. Check build logs: `railway logs --deployment <id>`
2. Verify `package.json` has start script
3. Check nixpacks.toml configuration
4. Ensure all dependencies installed

### Service Crashes on Start
1. Check environment variables are set
2. Verify database connections
3. Check for missing API keys
4. Review startup logs

### Service Shows Unhealthy
1. Verify health endpoint responds
2. Check service dependencies (databases, APIs)
3. Review error logs
4. Restart service if needed

---

## Quick Deployment (All Services)

```bash
# From project root
./scripts/deploy-to-railway.sh all

# Or deploy individually
./scripts/deploy-to-railway.sh ai
./scripts/deploy-to-railway.sh email
./scripts/deploy-to-railway.sh calendar
./scripts/deploy-to-railway.sh workflow
./scripts/deploy-to-railway.sh gateway
```

---

## Success Criteria

- [ ] All 5 services deployed successfully
- [ ] All health checks passing (200 OK)
- [ ] No errors in logs (checked last 100 lines)
- [ ] Services can communicate with each other
- [ ] Mobile apps can connect to gateway
- [ ] OAuth flows working (test with one account)

---

## Next Steps After Deployment

1. **Integration Testing**
   - Run full test suite: `pnpm test:integration`
   - Test OAuth flows manually
   - Verify email/calendar features

2. **Mobile App Configuration**
   - Update API URLs in mobile apps
   - Test iOS app via TestFlight
   - Test Android app via Play Store

3. **Alpha User Onboarding**
   - Send invitation emails
   - Monitor user registrations
   - Collect initial feedback

---

**Prepared by**: Claude (AI Assistant)
**Last Updated**: 2025-10-07
**Status**: Ready for deployment

**Contact**: For deployment issues, check Railway dashboard or contact Edward Zhong
