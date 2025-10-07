# Alpha Deployment - Live and Working! 🎉

The Tide platform alpha is now successfully deployed on Railway and accessible.

## Gateway URL
**Base URL:** `https://gateway-production-caf0.up.railway.app`

## Available Endpoints

### Health Check
```bash
curl https://gateway-production-caf0.up.railway.app/health
```

### Services List
```bash
curl https://gateway-production-caf0.up.railway.app/api/services
```

### Service Health Checks
```bash
# AI Service
curl https://gateway-production-caf0.up.railway.app/api/ai/health

# Email Service
curl https://gateway-production-caf0.up.railway.app/api/email/health

# Calendar Service
curl https://gateway-production-caf0.up.railway.app/api/calendar/health

# Workflow Service (Week 9-12)
curl https://gateway-production-caf0.up.railway.app/api/workflow/health
```

## Service URLs (Direct Access)
- **Gateway:** https://gateway-production-caf0.up.railway.app
- **AI Service:** https://ai-production-5753.up.railway.app
- **Email Service:** https://email-production-264c.up.railway.app
- **Calendar Service:** https://calendar-production-325a.up.railway.app
- **Workflow Service:** https://workflow-production-a5d2.up.railway.app

## Example API Usage

### Test AI Service (via Gateway)
```bash
curl https://gateway-production-caf0.up.railway.app/api/ai/health
```

### Get Service Information
```bash
curl https://gateway-production-caf0.up.railway.app/api/services | jq .
```

## Status
- ✅ Gateway: **Healthy** (port 4000)
- ✅ AI Service: **Healthy**
- ✅ Email Service: **Healthy**
- ✅ Calendar Service: **Healthy**
- ⏳ Workflow Service: Not configured (Week 9-12)

## What Was Fixed
The gateway was returning 502 errors due to:
1. Using a startup wrapper script that Railway couldn't handle properly
2. Explicitly binding to 0.0.0.0 (Railway handles this automatically)
3. Using PORT env var instead of service-specific GATEWAY_PORT

**Solution:** Simplified the startup to match the working AI service pattern:
- Direct start command: `node packages/services/gateway/dist/index.js`
- Let Node.js handle host binding automatically
- Use GATEWAY_PORT environment variable (set to 4000)

## Next Steps for Mobile Apps
Update your React Native apps to use the gateway URL:
```typescript
const API_BASE_URL = 'https://gateway-production-caf0.up.railway.app';
```

All API requests should go through the gateway using the `/api/{service}` prefix.
