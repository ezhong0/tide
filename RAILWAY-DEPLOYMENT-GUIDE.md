# Railway Deployment Guide

**Last Updated:** October 7, 2025
**Status:** Ready to deploy your 5 services

---

## Prerequisites

1. ✅ Supabase project created (you have: `ozrocykjomgcuphicqpg.supabase.co`)
2. ✅ Google OAuth configured
3. ✅ Services built and tested locally
4. ⏳ Railway account (we'll create)

---

## Part 1: Railway Setup (5 minutes)

### Step 1: Create Railway Account

```bash
# 1. Go to https://railway.app
# 2. Sign up with GitHub (recommended)
# 3. Verify email
```

### Step 2: Install Railway CLI

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# This will open browser for GitHub auth
# Click "Authorize Railway"
```

### Step 3: Create Project

```bash
# In your project root
cd /Users/edwardzhong/Projects/tide

# Initialize Railway project
railway init

# When prompted:
# Project name: tide-production
# Environment: production
```

---

## Part 2: Deploy Services (30 minutes)

You'll deploy **5 services** to Railway:
1. Gateway Service (4000)
2. AI Service (4003)
3. Email Service (4004)
4. Calendar Service (4005)
5. Workflow Service (4006)

### Step 1: Deploy Gateway Service

```bash
cd packages/services/gateway

# Create railway.json
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../../../ && pnpm install && pnpm --filter @tide/gateway build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
EOF

# Deploy
railway up

# Get the URL
railway domain
# This will give you: gateway-production.up.railway.app
```

### Step 2: Deploy AI Service

```bash
cd ../ai

# Create railway.json
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../../../ && pnpm install && pnpm --filter @tide/ai build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Deploy
railway up

# Get the URL
railway domain
# This will give you: ai-production.up.railway.app
```

### Step 3: Deploy Email Service

```bash
cd ../email

# Create railway.json
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../../../ && pnpm install && pnpm --filter @tide/email build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Deploy
railway up

# Get the URL
railway domain
```

### Step 4: Deploy Calendar Service

```bash
cd ../calendar

# Create railway.json
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../../../ && pnpm install && pnpm --filter @tide/calendar build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Deploy
railway up

# Get the URL
railway domain
```

### Step 5: Deploy Workflow Service

```bash
cd ../workflow

# Create railway.json
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../../../ && pnpm install && pnpm --filter @tide/workflow build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Deploy
railway up

# Get the URL
railway domain
```

---

## Part 3: Configure Environment Variables (15 minutes)

### Service URLs (After Deployment)

After deploying, note down your URLs:
```bash
GATEWAY_URL=https://gateway-production.up.railway.app
AI_SERVICE_URL=https://ai-production.up.railway.app
EMAIL_SERVICE_URL=https://email-production.up.railway.app
CALENDAR_SERVICE_URL=https://calendar-production.up.railway.app
WORKFLOW_SERVICE_URL=https://workflow-production.up.railway.app
```

### Set Environment Variables for Each Service

**For ALL services (Gateway, AI, Email, Calendar, Workflow):**

```bash
# Go to Railway dashboard: https://railway.app/project/<your-project>
# Or use CLI:

cd packages/services/gateway
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzAwMDgsImV4cCI6MjA3MTEwNjAwOH0.0B4o116YkYXkx5vjA-BW9hvAha3IHVPQiWDLwCUohPM
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg

# Repeat for each service:
cd ../ai
railway variables set NODE_ENV=production
railway variables set PORT=4003
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your-key>
railway variables set OPENAI_API_KEY=<your-openai-key>
railway variables set ANTHROPIC_API_KEY=<your-anthropic-key>

cd ../email
railway variables set NODE_ENV=production
railway variables set PORT=4004
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your-key>

cd ../calendar
railway variables set NODE_ENV=production
railway variables set PORT=4005
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your-key>

cd ../workflow
railway variables set NODE_ENV=production
railway variables set PORT=4006
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your-key>
```

### Configure Service-to-Service Communication

**In Gateway Service:**
```bash
cd packages/services/gateway
railway variables set AI_SERVICE_URL=https://ai-production.up.railway.app
railway variables set EMAIL_SERVICE_URL=https://email-production.up.railway.app
railway variables set CALENDAR_SERVICE_URL=https://calendar-production.up.railway.app
railway variables set WORKFLOW_SERVICE_URL=https://workflow-production.up.railway.app
```

---

## Part 4: Test Deployment (10 minutes)

### Test 1: Health Checks

```bash
# Test each service
curl https://gateway-production.up.railway.app/health
curl https://ai-production.up.railway.app/health
curl https://email-production.up.railway.app/health
curl https://calendar-production.up.railway.app/health
curl https://workflow-production.up.railway.app/health

# All should return: { "status": "healthy" }
```

### Test 2: Authentication

```bash
# Get a token from Supabase
# 1. Go to: https://ozrocykjomgcuphicqpg.supabase.co
# 2. Sign in with Google OAuth
# 3. Copy the JWT token

# Test authenticated request
curl -X POST https://ai-production.up.railway.app/chat \
  -H "Authorization: Bearer <your-supabase-token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test deployment!"}'
```

### Test 3: Gateway Routing

```bash
# Test that Gateway routes to AI service
curl -X POST https://gateway-production.up.railway.app/api/ai/chat \
  -H "Authorization: Bearer <your-supabase-token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello via gateway!"}'
```

---

## Part 5: Monitor & Debug (Ongoing)

### View Logs

```bash
# Via CLI
cd packages/services/ai
railway logs

# Or in dashboard:
# https://railway.app/project/<your-project>
# Click on service → Deployments → View logs
```

### View Metrics

```bash
# In Railway dashboard:
# Click on service → Metrics
# Shows: CPU, Memory, Network, Requests
```

### Restart Service

```bash
# Via CLI
railway restart

# Or in dashboard:
# Click on service → Settings → Restart
```

---

## Part 6: Custom Domain (Optional)

### Add Your Domain

```bash
# In Railway dashboard:
# 1. Go to service (e.g., Gateway)
# 2. Click Settings → Domains
# 3. Click "Add Domain"
# 4. Enter: api.yourdomain.com
# 5. Add CNAME record to your DNS:
#    CNAME api -> gateway-production.up.railway.app

# Wait for DNS propagation (5-30 minutes)
# Test: curl https://api.yourdomain.com/health
```

---

## Part 7: CI/CD (Optional but Recommended)

### GitHub Integration

```bash
# In Railway dashboard:
# 1. Go to project settings
# 2. Click "Integrations"
# 3. Click "Add GitHub repo"
# 4. Select your repo: tide
# 5. Set branch: main

# Now every push to main auto-deploys!
```

### Create `.railway` directory

```bash
cd /Users/edwardzhong/Projects/tide

mkdir -p .railway

# Create service configs
cat > .railway/gateway.json << 'EOF'
{
  "service": "gateway",
  "root": "packages/services/gateway",
  "buildCommand": "cd ../../.. && pnpm install && pnpm --filter @tide/gateway build",
  "startCommand": "node dist/index.js"
}
EOF

# Repeat for other services...
```

---

## Troubleshooting

### Issue 1: Build Fails

**Error:** `pnpm: command not found`

**Fix:**
```bash
# Add to railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "nixpacks.toml"
  }
}

# Create nixpacks.toml in service root
cat > packages/services/ai/nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["nodejs-20_x", "pnpm"]
EOF
```

### Issue 2: Service Can't Reach Other Services

**Error:** `ECONNREFUSED` or timeout

**Fix:** Use internal URLs:
```bash
# Railway provides internal networking
# Instead of: https://ai-production.up.railway.app
# Use: http://ai-service:4003

railway variables set AI_SERVICE_URL=http://ai-service:4003
```

### Issue 3: Environment Variables Not Loading

**Error:** `process.env.SUPABASE_URL is undefined`

**Fix:**
```bash
# Verify variables are set
railway variables

# Re-set if missing
railway variables set SUPABASE_URL=https://...

# Redeploy
railway up --detach
```

### Issue 4: 502 Bad Gateway

**Cause:** Service isn't listening on correct port

**Fix:**
```typescript
// Make sure your service uses PORT from env
const PORT = process.env.PORT || 4003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue 5: Out of Memory

**Error:** `JavaScript heap out of memory`

**Fix:**
```bash
# Upgrade Railway plan
# Free tier: 512MB RAM
# Hobby: $5/month, 8GB RAM

# Or optimize your code
# Add to package.json:
"start": "node --max-old-space-size=512 dist/index.js"
```

---

## Cost Estimate

### Railway Pricing (October 2025)

**Free Tier:**
- $5 free credit/month
- 512MB RAM per service
- 1GB disk per service
- Good for testing

**Hobby Plan (Recommended for Alpha):**
- $5/service/month
- 8GB RAM
- 100GB disk
- Custom domains

**Your Setup (5 services):**
```
Gateway: $5/month
AI:      $5/month
Email:   $5/month
Calendar: $5/month
Workflow: $5/month
─────────────────
Total:   $25/month

Plus Supabase Pro: $25/month
─────────────────
Total Stack: $50/month
```

**At Scale (Pro Plan):**
```
Each service: $20/month (32GB RAM)
5 services: $100/month
Supabase Team: $599/month
─────────────────
Total: $699/month (at 10K users)
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All services build locally
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Health check endpoints work
- [ ] Supabase configured

### Deployment
- [ ] Railway account created
- [ ] CLI installed and logged in
- [ ] Project created
- [ ] 5 services deployed
- [ ] Environment variables set
- [ ] Service URLs noted

### Post-Deployment
- [ ] Health checks pass
- [ ] Authentication works
- [ ] Gateway routes correctly
- [ ] Logs are readable
- [ ] Metrics look normal
- [ ] Custom domain added (optional)
- [ ] GitHub CI/CD set up (optional)

---

## Quick Commands Reference

```bash
# Deploy/Redeploy
railway up

# View logs
railway logs

# Follow logs
railway logs -f

# Restart service
railway restart

# Set env var
railway variables set KEY=value

# List env vars
railway variables

# Delete env var
railway variables delete KEY

# Get service URL
railway domain

# Link to different project
railway link

# Run command in Railway environment
railway run node script.js

# SSH into service (debugging)
railway shell
```

---

## Next Steps

1. **Deploy Gateway first** (it's the entry point)
2. **Deploy other services** (AI, Email, Calendar, Workflow)
3. **Configure environment variables** (Supabase, API keys)
4. **Test health checks** (curl each service)
5. **Test authenticated requests** (get Supabase token, test APIs)
6. **Set up CI/CD** (optional but recommended)
7. **Add custom domain** (when ready)

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Your Services:** https://railway.app/project/<your-project>

---

**Ready to deploy?**

```bash
# Start here:
cd /Users/edwardzhong/Projects/tide
railway login
railway init
cd packages/services/gateway
railway up
```

**Good luck! 🚀**
