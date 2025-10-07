# ✅ Ready to Deploy to Railway

**Status:** All prep work complete
**Time to deploy:** 10-15 minutes
**What I did for you:** Everything except the actual deployment

---

## What I've Done ✅

- ✅ Railway CLI installed and verified
- ✅ Confirmed you're logged in (Edward Zhong)
- ✅ Confirmed Railway project linked: `tide`
- ✅ Built all services successfully (no errors!)
- ✅ Verified all services have health endpoints
- ✅ Created `railway.json` for all 5 services
- ✅ Created deployment scripts
- ✅ Created environment setup scripts
- ✅ Created complete manual guide

**Everything is ready. You just need to press the button!**

---

## What YOU Do Now (Choose One)

### Option A: Fully Automated (Easiest) ⭐

Run one script, answer prompts:

```bash
cd /Users/edwardzhong/Projects/tide
./scripts/deploy-and-configure.sh
```

**What it does:**
1. Deploys all 5 services
2. Gets service URLs
3. Prompts for your API keys
4. Sets all environment variables
5. Tests health endpoints

**Time:** 10 minutes (mostly waiting for Railway to build)

---

### Option B: Step by Step (More Control)

Follow the manual guide:

```bash
cd /Users/edwardzhong/Projects/tide

# Read this file - it has EVERYTHING
cat MANUAL-RAILWAY-STEPS.md

# Or just run the commands:

# 1. Deploy services
cd packages/services/gateway && railway up --detach
cd ../ai && railway up --detach
cd ../email && railway up --detach
cd ../calendar && railway up --detach
cd ../workflow && railway up --detach

# 2. Get URLs (save these!)
cd packages/services/gateway && railway domain
cd ../ai && railway domain
# ... etc

# 3. Set environment variables (see MANUAL-RAILWAY-STEPS.md for full list)
cd packages/services/ai
railway variables set OPENAI_API_KEY="your-key"
railway variables set ANTHROPIC_API_KEY="your-key"
# ... etc
```

**Time:** 15-20 minutes

---

## Required Information

Before you start, have these ready:

1. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Format: `sk-proj-...`

2. **Anthropic API Key**
   - Get from: https://console.anthropic.com/
   - Format: `sk-ant-...`

3. **Your Supabase credentials** (already in the scripts):
   - URL: `https://ozrocykjomgcuphicqpg.supabase.co`
   - Keys: Already configured ✅

---

## After Deployment

### Test It Works

```bash
# Get your gateway URL
cd packages/services/gateway
railway domain
# Example: https://gateway-production.up.railway.app

# Test health endpoint
curl https://gateway-production.up.railway.app/health

# Should return: { "status": "healthy" } or similar
```

### View Logs

```bash
# View AI service logs
cd packages/services/ai
railway logs

# Follow logs in real-time
railway logs -f
```

### Check Dashboard

Go to: https://railway.app/project/tide

You should see:
- ✅ 5 services, all "Active" (green)
- ✅ CPU usage normal (<50%)
- ✅ Memory normal (<200MB)
- ✅ No errors in logs

---

## Cost

**Your setup:**
- 5 services × $5/month = **$25/month**
- First month: **$20/month** (Railway gives $5 free credit)
- Supabase: **$0** (free tier is fine for Alpha)

**Total: $20-25/month for Alpha**

---

## Files I Created For You

**Deployment:**
- `railway.json` in each service folder (5 files)
- `scripts/deploy-and-configure.sh` - Automated deployment
- `scripts/deploy-railway.sh` - Deploy only (no env setup)
- `scripts/setup-railway-env.sh` - Env setup only

**Guides:**
- `MANUAL-RAILWAY-STEPS.md` - Complete step-by-step manual
- `RAILWAY-DEPLOYMENT-GUIDE.md` - Full reference guide
- `QUICK-DEPLOY.md` - Quick reference
- `READY-TO-DEPLOY.md` - This file

**Total:** 12 new files, all ready to use

---

## Decision Time

Pick one and run it:

### A. Automated (Recommended) ⭐

```bash
./scripts/deploy-and-configure.sh
```

### B. Manual (More control)

```bash
# See: MANUAL-RAILWAY-STEPS.md
```

### C. Just Deploy (configure later)

```bash
./scripts/deploy-railway.sh
# Then set env vars manually later
```

---

## What Happens When You Deploy

1. **Railway reads** `railway.json` in each service
2. **Installs dependencies** with `pnpm install` (in cloud)
3. **Builds TypeScript** with `pnpm build`
4. **Starts service** with `node dist/index.js`
5. **Assigns public URL** like `https://ai-production.up.railway.app`
6. **Health checks** start running (checks `/health` endpoint)
7. **Service shows "Active"** in dashboard when healthy

**Time:** 2-3 minutes per service

---

## Troubleshooting

### "Build failed"
```bash
cd packages/services/ai
railway logs
# Check error in logs
```

**Common causes:**
- TypeScript errors (we already built locally, so unlikely)
- Missing dependencies (pnpm should handle this)
- Out of memory (upgrade plan if needed)

### "502 Bad Gateway"
**This is normal!** Service is still starting.

Wait 30-60 seconds, then try again:
```bash
curl https://ai-production.up.railway.app/health
```

### "Can't set environment variables"
Make sure you're in the right directory:
```bash
cd packages/services/ai
railway variables set KEY=value
```

---

## Success Criteria

You know it worked when:

✅ All 5 services show "Active" in Railway dashboard
✅ Health checks return 200 OK
✅ No errors in logs
✅ Can make authenticated requests

Test authenticated request:
```bash
# 1. Get token from Supabase
# Go to: https://ozrocykjomgcuphicqpg.supabase.co
# Sign in with Google
# Copy JWT token from browser console

# 2. Test AI service
curl -X POST https://ai-production.up.railway.app/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from production!"}'

# Should return AI response (not 401)
```

---

## Next Steps After Deployment

1. **Update mobile apps** with production URLs
2. **Test end-to-end** (mobile → gateway → services)
3. **Set up monitoring** (Railway dashboard has this built-in)
4. **Add custom domain** (optional, via Railway dashboard)
5. **Set up CI/CD** (optional, Railway + GitHub integration)

---

## Support

- **Your Manual:** `MANUAL-RAILWAY-STEPS.md`
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Your Dashboard:** https://railway.app/project/tide

---

## Ready?

```bash
cd /Users/edwardzhong/Projects/tide

# Option A: Automated
./scripts/deploy-and-configure.sh

# Option B: Manual
# See MANUAL-RAILWAY-STEPS.md

# Option C: Deploy first, configure later
./scripts/deploy-railway.sh
```

**Let's ship it! 🚀**
