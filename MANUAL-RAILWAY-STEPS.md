# What YOU Need to Do in Railway (Manual Steps)

**Date:** October 7, 2025
**Status:** Everything is ready locally, here's what you do in Railway

---

## ✅ What I've Done For You

- ✅ Railway CLI installed
- ✅ Logged in as: Edward Zhong (edwardrzhong@gmail.com)
- ✅ Railway project linked: `tide` (production environment)
- ✅ All services built successfully
- ✅ `railway.json` configs created for all 5 services
- ✅ Deployment scripts created

---

## 🎯 What YOU Need to Do (30 minutes total)

### Step 1: Deploy Services via CLI (10 minutes)

Open your terminal and run these commands:

```bash
cd /Users/edwardzhong/Projects/tide

# Deploy Gateway Service
cd packages/services/gateway
railway up --detach
echo "Gateway deployed! ✓"

# Deploy AI Service
cd ../ai
railway up --detach
echo "AI Service deployed! ✓"

# Deploy Email Service
cd ../email
railway up --detach
echo "Email Service deployed! ✓"

# Deploy Calendar Service
cd ../calendar
railway up --detach
echo "Calendar Service deployed! ✓"

# Deploy Workflow Service
cd ../workflow
railway up --detach
echo "Workflow Service deployed! ✓"

cd ../../..
echo ""
echo "All services deployed! 🎉"
```

**What happens:**
- Railway reads `railway.json` in each folder
- Runs `pnpm install && pnpm build` in the cloud
- Starts the service with `node dist/index.js`
- Assigns a public URL

---

### Step 2: Get Service URLs (2 minutes)

After deployment, get the URLs:

```bash
cd packages/services/gateway
railway domain
# Copy this URL

cd ../ai
railway domain
# Copy this URL

cd ../email
railway domain
# Copy this URL

cd ../calendar
railway domain
# Copy this URL

cd ../workflow
railway domain
# Copy this URL
```

**Save these URLs!** You'll need them for Step 3.

---

### Step 3: Set Environment Variables (15 minutes)

For **EACH** service, set these variables in Railway dashboard:

#### Option A: Via CLI (Recommended)

```bash
# === Gateway Service ===
cd /Users/edwardzhong/Projects/tide/packages/services/gateway

railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzAwMDgsImV4cCI6MjA3MTEwNjAwOH0.0B4o116YkYXkx5vjA-BW9hvAha3IHVPQiWDLwCUohPM"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"

# Add service URLs (use the URLs you got from Step 2)
railway variables set AI_SERVICE_URL="https://ai-production.up.railway.app"
railway variables set EMAIL_SERVICE_URL="https://email-production.up.railway.app"
railway variables set CALENDAR_SERVICE_URL="https://calendar-production.up.railway.app"
railway variables set WORKFLOW_SERVICE_URL="https://workflow-production.up.railway.app"

echo "Gateway configured! ✓"

# === AI Service ===
cd ../ai

railway variables set NODE_ENV=production
railway variables set PORT=4003
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"

# ⚠️ ADD YOUR API KEYS HERE ⚠️
railway variables set OPENAI_API_KEY="sk-proj-your-key-here"
railway variables set ANTHROPIC_API_KEY="sk-ant-your-key-here"

echo "AI Service configured! ✓"

# === Email Service ===
cd ../email

railway variables set NODE_ENV=production
railway variables set PORT=4004
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"

echo "Email Service configured! ✓"

# === Calendar Service ===
cd ../calendar

railway variables set NODE_ENV=production
railway variables set PORT=4005
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"

echo "Calendar Service configured! ✓"

# === Workflow Service ===
cd ../workflow

railway variables set NODE_ENV=production
railway variables set PORT=4006
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"

echo "Workflow Service configured! ✓"

cd ../../..
echo ""
echo "All environment variables set! 🎉"
echo "Services will auto-restart with new config."
```

#### Option B: Via Railway Dashboard

If you prefer using the web interface:

1. Go to: https://railway.app/project/tide
2. Click on **Gateway Service**
3. Click **Variables** tab
4. Click **+ New Variable**
5. Add each variable from the list above
6. Repeat for AI, Email, Calendar, Workflow services

---

### Step 4: Verify Deployment (3 minutes)

```bash
# Test health endpoints
curl https://gateway-production.up.railway.app/health
curl https://ai-production.up.railway.app/health
curl https://email-production.up.railway.app/health
curl https://calendar-production.up.railway.app/health
curl https://workflow-production.up.railway.app/health

# All should return: { "status": "healthy" } or similar
```

**If you get 502 Bad Gateway:** Service is still starting (wait 30-60 seconds)

---

## 🚨 Important: Add Your API Keys

**In Step 3, replace these placeholders:**

```bash
# Find your OpenAI API key at: https://platform.openai.com/api-keys
railway variables set OPENAI_API_KEY="sk-proj-YOUR-ACTUAL-KEY"

# Find your Anthropic API key at: https://console.anthropic.com/
railway variables set ANTHROPIC_API_KEY="sk-ant-YOUR-ACTUAL-KEY"
```

**Without these, the AI service won't work!**

---

## 📋 Quick Checklist

Copy this and check off as you go:

```
[ ] Step 1: Deploy all 5 services (railway up --detach)
[ ] Step 2: Get all 5 service URLs (railway domain)
[ ] Step 3: Set environment variables for all services
    [ ] Gateway: Basic + service URLs
    [ ] AI: Basic + OpenAI + Anthropic keys
    [ ] Email: Basic only
    [ ] Calendar: Basic only
    [ ] Workflow: Basic only
[ ] Step 4: Test all health endpoints
[ ] Bonus: View logs (railway logs)
[ ] Bonus: Check metrics in Railway dashboard
```

---

## 🎬 Complete Script (Copy & Paste)

Save this to a file and run it:

```bash
#!/bin/bash
# deploy-to-railway.sh

set -e

echo "🚀 Deploying Tide to Railway..."
echo ""

cd /Users/edwardzhong/Projects/tide

# Deploy services
echo "1. Deploying services..."
cd packages/services/gateway && railway up --detach
cd ../ai && railway up --detach
cd ../email && railway up --detach
cd ../calendar && railway up --detach
cd ../workflow && railway up --detach
cd ../../..

echo ""
echo "✓ All services deployed!"
echo ""

# Get URLs
echo "2. Getting service URLs..."
echo ""
echo "Gateway:"
cd packages/services/gateway && railway domain
echo ""
echo "AI:"
cd ../ai && railway domain
echo ""
echo "Email:"
cd ../email && railway domain
echo ""
echo "Calendar:"
cd ../calendar && railway domain
echo ""
echo "Workflow:"
cd ../workflow && railway domain
cd ../../..

echo ""
echo "✓ URLs retrieved!"
echo ""
echo "3. Now set environment variables (see MANUAL-RAILWAY-STEPS.md)"
echo ""
echo "4. Test with: curl https://gateway-production.up.railway.app/health"
echo ""
echo "Done! 🎉"
```

---

## 🔧 After Deployment Commands

```bash
# View logs for a service
cd packages/services/ai
railway logs
railway logs -f  # Follow logs in real-time

# Restart a service
railway restart

# View all environment variables
railway variables

# Open service in browser
railway open

# View metrics in dashboard
railway open  # Then click "Metrics"

# Redeploy after code changes
railway up
```

---

## 🆘 Troubleshooting

### "Build failed"
```bash
cd packages/services/ai
railway logs
# Check for errors in build output
# Most common: Missing dependencies or TypeScript errors
```

### "502 Bad Gateway"
```bash
# Wait 60 seconds (service is starting)
# OR check if PORT is set correctly:
railway variables | grep PORT
# Should be: PORT=4003 (or whatever port)
```

### "Unauthorized" when testing
```bash
# Need Supabase JWT token
# 1. Go to: https://ozrocykjomgcuphicqpg.supabase.co
# 2. Sign in with Google
# 3. Open browser console
# 4. Type: supabase.auth.getSession()
# 5. Copy access_token
```

### "Can't reach other services"
```bash
# Gateway can't reach AI service?
# Check Gateway has correct AI_SERVICE_URL
cd packages/services/gateway
railway variables | grep AI_SERVICE_URL

# Update if wrong:
railway variables set AI_SERVICE_URL="https://ai-production.up.railway.app"
railway restart
```

---

## 💰 Cost Estimate

Your current setup:
- 5 services × $5/month = **$25/month**
- Supabase: $0 (free tier)
- **Total: $25/month**

(Railway gives you $5 free credit/month, so first month is $20)

---

## 📊 What to Monitor

In Railway dashboard (https://railway.app/project/tide):

**For each service, check:**
- ✅ **Status:** Should be "Active" (green)
- ✅ **CPU:** Should be <50% normally
- ✅ **Memory:** Should be <200MB normally
- ✅ **Network:** Check requests/sec

**Red flags:**
- ⚠️ Status: "Crashed" (check logs)
- ⚠️ CPU: >80% sustained (need to optimize)
- ⚠️ Memory: >400MB (memory leak?)
- ⚠️ Network: Many 5xx errors (service errors)

---

## 🎯 Success Criteria

You know it works when:

```bash
# All health checks pass
curl https://gateway-production.up.railway.app/health
# Returns: 200 OK

# Authenticated request works
curl -X POST https://ai-production.up.railway.app/chat \
  -H "Authorization: Bearer <supabase-token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
# Returns: AI response (not 401 Unauthorized)

# Services show "Active" in Railway dashboard
# No error logs appearing
```

---

## 📱 Next: Connect Mobile Apps

Once backend is deployed, update mobile apps:

**iOS:**
```swift
// Update API base URL
let baseURL = "https://gateway-production.up.railway.app"
```

**Android:**
```kotlin
// Update API base URL
const val BASE_URL = "https://gateway-production.up.railway.app"
```

---

## 📚 Reference

- **Railway Dashboard:** https://railway.app/project/tide
- **Railway Docs:** https://docs.railway.app
- **Your Supabase:** https://ozrocykjomgcuphicqpg.supabase.co
- **Full Deployment Guide:** `RAILWAY-DEPLOYMENT-GUIDE.md`
- **Quick Reference:** `QUICK-DEPLOY.md`

---

## ✅ You're Done When...

- [ ] All 5 services show "Active" in Railway
- [ ] All health checks return 200 OK
- [ ] You can make authenticated requests
- [ ] No errors in logs
- [ ] Metrics look normal in dashboard

**Then you're deployed! 🎉**

---

**Questions?** Check logs first: `railway logs`

**Need help?** Railway Discord: https://discord.gg/railway
