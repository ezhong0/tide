# Quick Deploy to Railway

**5-Minute Deployment Guide**

---

## Prerequisites

✅ Supabase project: `ozrocykjomgcuphicqpg.supabase.co`
✅ Services built locally: `pnpm build`
✅ `.env` file with your credentials

---

## Step 1: Install Railway (1 minute)

```bash
# Install CLI
npm install -g @railway/cli

# Login (opens browser)
railway login

# Create project
cd /Users/edwardzhong/Projects/tide
railway init
# Name: tide-production
```

---

## Step 2: Deploy All Services (2 minutes)

```bash
# Automated deployment
./scripts/deploy-railway.sh
```

**Or manually:**
```bash
cd packages/services/gateway && railway up
cd ../ai && railway up
cd ../email && railway up
cd ../calendar && railway up
cd ../workflow && railway up
```

---

## Step 3: Set Environment Variables (1 minute)

```bash
# Automated setup
./scripts/setup-railway-env.sh
```

**Or manually for each service:**
```bash
cd packages/services/ai
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your-key>
railway variables set OPENAI_API_KEY=<your-key>
railway variables set ANTHROPIC_API_KEY=<your-key>
```

---

## Step 4: Get URLs (30 seconds)

```bash
cd packages/services/gateway
railway domain
# Copy this URL: https://gateway-production.up.railway.app

cd ../ai
railway domain
# Copy this URL: https://ai-production.up.railway.app

# Repeat for other services...
```

---

## Step 5: Test (30 seconds)

```bash
# Test health checks
curl https://gateway-production.up.railway.app/health
curl https://ai-production.up.railway.app/health

# Test authenticated request
# 1. Get token from: https://ozrocykjomgcuphicqpg.supabase.co
# 2. Sign in with Google
# 3. Copy JWT token

curl -X POST https://ai-production.up.railway.app/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

---

## Deployed! 🎉

Your services are now live:
- Gateway: https://gateway-production.up.railway.app
- AI: https://ai-production.up.railway.app
- Email: https://email-production.up.railway.app
- Calendar: https://calendar-production.up.railway.app
- Workflow: https://workflow-production.up.railway.app

---

## Cost

**Alpha (5 services):**
- Railway: ~$25/month ($5 per service)
- Supabase: $0 (free tier) or $25 (Pro)
- **Total: $25-50/month**

---

## Useful Commands

```bash
# View logs
cd packages/services/ai
railway logs

# Follow logs in real-time
railway logs -f

# Restart service
railway restart

# View environment variables
railway variables

# Set new variable
railway variables set KEY=value

# SSH into service (debugging)
railway shell

# View metrics
# Go to: https://railway.app/project/<your-project>
```

---

## Troubleshooting

**Build fails:**
```bash
# Check logs
railway logs

# Rebuild
railway up
```

**Service unreachable:**
```bash
# Check if running
railway status

# Restart
railway restart
```

**Environment variable not working:**
```bash
# List all variables
railway variables

# Re-set
railway variables set SUPABASE_URL=...

# Restart for changes to take effect
railway restart
```

---

## Next Steps

1. **Add custom domain** (optional)
   - Railway dashboard → Service → Settings → Domains
   - Add CNAME: `api.yourdomain.com` → `gateway-production.up.railway.app`

2. **Set up CI/CD** (optional)
   - Railway dashboard → Project → Integrations → GitHub
   - Auto-deploy on push to main

3. **Monitor** (ongoing)
   - Railway dashboard → Service → Metrics
   - View CPU, Memory, Requests

---

## Support

- **Full Guide:** `RAILWAY-DEPLOYMENT-GUIDE.md`
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway

---

**That's it! You're deployed.** 🚀
