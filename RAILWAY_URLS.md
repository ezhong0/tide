# Railway Production URLs

**Last Updated**: 2025-10-07
**Environment**: production
**Status**: ✅ All services deployed and healthy

---

## Service URLs

### Gateway (Main API)
- **URL**: https://gateway-production-caf0.up.railway.app
- **GraphQL**: https://gateway-production-caf0.up.railway.app/graphql
- **Health**: https://gateway-production-caf0.up.railway.app/health
- **Status**: ✅ Healthy

### AI Service
- **URL**: https://ai-production-5753.up.railway.app
- **Health**: https://ai-production-5753.up.railway.app/health
- **Status**: ✅ Healthy

### Email Service
- **URL**: https://email-production-264c.up.railway.app
- **Health**: https://email-production-264c.up.railway.app/health
- **Status**: ✅ Healthy

### Calendar Service
- **URL**: https://calendar-production-325a.up.railway.app
- **Health**: https://calendar-production-325a.up.railway.app/health
- **Status**: ✅ Healthy

### Workflow Service
- **URL**: https://workflow-production-a5d2.up.railway.app
- **Health**: https://workflow-production-a5d2.up.railway.app/health
- **Status**: ⚠️ Not ready (Week 9-12 feature)

---

## Quick Health Check

```bash
# Test all services
curl https://gateway-production-caf0.up.railway.app/health
curl https://ai-production-5753.up.railway.app/health
curl https://email-production-264c.up.railway.app/health
curl https://calendar-production-325a.up.railway.app/health
curl https://workflow-production-a5d2.up.railway.app/health
```

---

## Mobile App Configuration

Use the Gateway URL as your API base URL in mobile apps:

```typescript
// iOS/Android app config
const API_BASE_URL = 'https://gateway-production-caf0.up.railway.app';
```

---

## Service Communication

Services communicate internally using these URLs:

| From Service | To Service | URL |
|-------------|-----------|-----|
| Gateway | AI | https://ai-production-5753.up.railway.app |
| Gateway | Email | https://email-production-264c.up.railway.app |
| Gateway | Calendar | https://calendar-production-325a.up.railway.app |
| Gateway | Workflow | https://workflow-production-a5d2.up.railway.app |

---

## Last Health Check Results

**Timestamp**: 2025-10-07 18:04 UTC

- ✅ AI Service: `{"status":"healthy","service":"ai-service"}`
- ✅ Email Service: `{"status":"healthy","service":"email"}`
- ✅ Calendar Service: `{"status":"healthy","service":"calendar"}`
- ⚠️ Workflow Service: `{"status":"not_ready","message":"Workflow service not configured (Week 9-12)"}`
- ✅ Gateway: `{"status":"healthy","service":"api-gateway","uptime":3498.2s}`

---

## Monitoring

Monitor services at: https://railway.app/project/5c107a1f-4e2b-4181-83a4-bf0637daa822

---

**Note**: These URLs are permanent for this Railway project. If you redeploy, the URLs remain the same.
