# Railway Environment Setup Script

Automated script to configure all Tide services on Railway with the correct environment variables.

## Quick Start

```bash
# From project root
./scripts/setup-railway-env.sh
```

## What It Does

The script automatically:

1. ✅ **Loads environment variables** from `.env` file
2. ✅ **Validates required credentials** (OpenAI API key, Supabase credentials)
3. ✅ **Configures all 5 services**:
   - AI Service (GPT-5 models only)
   - Email Service (with smart compose enabled)
   - Calendar Service (with smart scheduling enabled)
   - Workflow Service (with Kafka disabled for Alpha)
   - Gateway Service (with all backend service URLs)
4. ✅ **Auto-discovers service URLs** from Railway
5. ✅ **Restarts all services** after configuration
6. ✅ **Runs health checks** to verify deployment

## Prerequisites

Before running the script:

1. **Railway CLI installed**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Logged in to Railway**:
   ```bash
   railway login
   ```

3. **Services deployed** to Railway:
   ```bash
   ./scripts/deploy-to-railway.sh all
   ```

4. **`.env` file exists** in project root with required variables:
   ```bash
   OPENAI_API_KEY=sk-...
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

## Services Configured

### 1. AI Service
- OpenAI API key (GPT-5 models)
- Supabase connection
- Reasoning and learning enabled

### 2. Email Service
- Supabase connection
- Smart compose enabled
- Relationship tracking enabled

### 3. Calendar Service
- Supabase connection
- Smart scheduling enabled

### 4. Workflow Service
- Supabase connection
- **Kafka disabled** (request-response only for Alpha)
- Workflow engine enabled

### 5. Gateway Service
- All backend service URLs (auto-discovered)
- JWT secret (auto-generated if not provided)
- CORS enabled
- Supabase connection

## Environment Variables Set

### Common (All Services)
- `NODE_ENV=production`
- `PORT=8080`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOG_LEVEL=info`

### AI Service
- `OPENAI_API_KEY`
- `ENABLE_REASONING=true`
- `ENABLE_LEARNING=true`

### Email Service
- `ENABLE_SMART_COMPOSE=true`
- `ENABLE_RELATIONSHIP_TRACKING=true`

### Calendar Service
- `ENABLE_SMART_SCHEDULING=true`

### Workflow Service
- `KAFKA_ENABLED=false`
- `ENABLE_WORKFLOW_ENGINE=true`

### Gateway Service
- `AI_SERVICE_URL`
- `EMAIL_SERVICE_URL`
- `CALENDAR_SERVICE_URL`
- `WORKFLOW_SERVICE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN=*`

## Service URL Discovery

The script automatically discovers service URLs from Railway using:

```bash
railway status --service <service-name>
```

If URLs are not available (services still starting), it falls back to Railway's internal DNS:
- `http://ai:8080`
- `http://email:8080`
- `http://calendar:8080`
- `http://workflow:8080`

## Health Checks

After configuring and restarting services, the script checks these endpoints:

- `/health` - Gateway health
- `/api/ai/health` - AI service health
- `/api/email/health` - Email service health
- `/api/calendar/health` - Calendar service health
- `/api/workflow/health` - Workflow service health

## Troubleshooting

### Script fails with "Railway CLI not found"
```bash
npm i -g @railway/cli
```

### Script fails with "Not logged in to Railway"
```bash
railway login
```

### Script fails with "OPENAI_API_KEY not set"
Add to `.env`:
```bash
OPENAI_API_KEY=sk-proj-...
```

### Health checks fail
Services may still be starting. Check logs:
```bash
cd packages/services/<service-name>
railway logs
```

### Service URLs not discovered
Check Railway dashboard to ensure services are deployed:
```bash
railway status --service <service-name>
```

## Manual Verification

After running the script, verify configuration:

```bash
# Check AI service variables
cd packages/services/ai
railway variables

# Check AI service logs
railway logs

# Check AI service status
railway status
```

Repeat for other services: `email`, `calendar`, `workflow`, `gateway`

## Key Features for Alpha

- ✅ **GPT-5 models only** (no Claude/Anthropic)
- ✅ **Kafka disabled** (simpler deployment)
- ✅ **Cost optimized** (75% gpt-5-nano, 25% gpt-5-mini)
- ✅ **Smart features enabled** (email composition, relationship tracking, scheduling)
- ✅ **Automatic service discovery** (no manual URL configuration)

## Next Steps After Running Script

1. **Verify all services are healthy**:
   ```bash
   railway status --service ai
   railway status --service email
   railway status --service calendar
   railway status --service workflow
   railway status --service gateway
   ```

2. **Get gateway URL for mobile apps**:
   ```bash
   cd packages/services/gateway
   railway status
   ```

3. **Update mobile app configuration** with gateway URL

4. **Run integration tests**:
   ```bash
   pnpm test:integration
   ```

## Support

For issues or questions:
- Check Railway dashboard: https://railway.app
- Review deployment guide: `docs/RAILWAY-DEPLOYMENT-GUIDE.md`
- Check service logs: `railway logs --service <service-name>`
