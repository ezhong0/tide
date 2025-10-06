# 🌐 External Setup Guide - Everything Outside the Codebase

> Complete step-by-step guide for all browser-based setup, API configurations, and external service registrations needed for Tide.

## 📋 Setup Checklist Overview

### Required Accounts & Services
- [ ] Google Cloud Platform (Gmail API, Calendar API, OAuth)
- [ ] Microsoft Azure (Outlook API, Graph API, OAuth)
- [ ] OpenAI API (GPT-4)
- [ ] Anthropic API (Claude) - optional
- [ ] PostgreSQL hosting (Supabase/Neon/Railway)
- [ ] Redis hosting (Upstash/Railway)
- [ ] Domain name (Namecheap/Cloudflare)
- [ ] Email service (Resend/SendGrid)
- [ ] Monitoring (Sentry)
- [ ] Analytics (PostHog/Mixpanel)
- [ ] Hosting (Vercel/Railway/Render)

### Estimated Time: 4-6 hours
### Estimated Cost: ~$50/month initially

---

## 🔐 Step 1: Google Cloud Platform Setup (45 minutes)

### 1.1 Create Google Cloud Project

1. **Go to**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Click** "Select a Project" → "New Project"
4. **Enter**:
   - Project name: `tide-assistant`
   - Organization: Leave as "No organization"
5. **Click** "Create"
6. **Wait** for project creation (~30 seconds)

### 1.2 Enable Required APIs

1. **Go to**: https://console.cloud.google.com/apis/library
2. **Search and enable each API** (click → Enable):
   - Gmail API
   - Google Calendar API
   - Google People API
   - Google OAuth2 API

### 1.3 Configure OAuth Consent Screen

1. **Go to**: https://console.cloud.google.com/apis/credentials/consent
2. **Choose** "External" (unless you have Google Workspace)
3. **Click** "Create"
4. **Fill out** App Information:
   ```
   App name: Tide Assistant
   User support email: your-email@domain.com
   App logo: (skip for now)
   App domain: (skip for now)
   Developer contact: your-email@domain.com
   ```
5. **Click** "Save and Continue"
6. **Scopes page**:
   - Click "Add or Remove Scopes"
   - Search and add:
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Click "Update" → "Save and Continue"
7. **Test users**:
   - Add your email and any test emails
   - Click "Save and Continue"
8. **Review** and click "Back to Dashboard"

### 1.4 Create OAuth 2.0 Credentials

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Click** "Create Credentials" → "OAuth client ID"
3. **Application type**: "Web application"
4. **Name**: `Tide Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-domain.com (add later)
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3001/auth/google/callback
   https://your-domain.com/auth/google/callback (add later)
   ```
7. **Click** "Create"
8. **SAVE THESE** (you'll see a popup):
   ```
   Client ID: xxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxxxxxxxxxx
   ```

### 1.5 Set up Gmail Push Notifications (Webhooks)

1. **Go to**: https://console.cloud.google.com/cloudpubsub
2. **Create a topic**:
   - Click "Create Topic"
   - Topic ID: `gmail-push-notifications`
   - Click "Create"
3. **Create a subscription**:
   - Click on the topic
   - Click "Create Subscription"
   - Subscription ID: `gmail-push-subscription`
   - Delivery type: "Push"
   - Endpoint URL: `https://your-domain.com/webhooks/gmail` (update later)
   - Click "Create"
4. **Grant Gmail permission**:
   - Go to topic's "Permissions"
   - Add member: `gmail-api-push@system.gserviceaccount.com`
   - Role: "Pub/Sub Publisher"
   - Save

### 1.6 Create Service Account (for server-to-server)

1. **Go to**: https://console.cloud.google.com/iam-admin/serviceaccounts
2. **Click** "Create Service Account"
3. **Enter**:
   - Name: `tide-service-account`
   - ID: (auto-generated)
4. **Click** "Create and Continue"
5. **Grant roles**:
   - Gmail API Admin
   - Calendar API Admin
6. **Click** "Continue" → "Done"
7. **Create key**:
   - Click on the service account
   - Go to "Keys" tab
   - Add Key → Create new key → JSON
   - **SAVE THE JSON FILE** (downloads automatically)

---

## 🔷 Step 2: Microsoft Azure Setup (45 minutes)

### 2.1 Create Azure Account & App Registration

1. **Go to**: https://portal.azure.com/
2. **Sign in** or create free account
3. **Navigate to**: "Azure Active Directory" (search in top bar)
4. **Click**: "App registrations" → "New registration"
5. **Fill out**:
   ```
   Name: Tide Assistant
   Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   Redirect URI: Web → http://localhost:3001/auth/microsoft/callback
   ```
6. **Click** "Register"
7. **SAVE THESE** (from Overview page):
   ```
   Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### 2.2 Create Client Secret

1. **Click** "Certificates & secrets" (left menu)
2. **Click** "New client secret"
3. **Description**: `Tide Production Secret`
4. **Expires**: 24 months
5. **Click** "Add"
6. **SAVE IMMEDIATELY** (only shown once):
   ```
   Secret Value: xxxxxxxxxxxxxxxxxxxxx
   ```

### 2.3 Configure API Permissions

1. **Click** "API permissions" (left menu)
2. **Click** "Add a permission"
3. **Choose** "Microsoft Graph"
4. **Choose** "Delegated permissions"
5. **Search and add these permissions**:
   ```
   - User.Read
   - Mail.Read
   - Mail.ReadWrite
   - Mail.Send
   - Calendars.Read
   - Calendars.ReadWrite
   - offline_access
   - openid
   - profile
   - email
   ```
6. **Click** "Add permissions"
7. **Click** "Grant admin consent" (if you see it)

### 2.4 Configure Authentication

1. **Click** "Authentication" (left menu)
2. **Add platform** → "Web"
3. **Redirect URIs**:
   ```
   http://localhost:3001/auth/microsoft/callback
   https://your-domain.com/auth/microsoft/callback (add later)
   ```
4. **Implicit grant**:
   - Check "ID tokens"
5. **Supported account types**:
   - Confirm "Multitenant and personal accounts"
6. **Click** "Save"

### 2.5 Set up Outlook Webhooks

1. **Go to**: https://docs.microsoft.com/en-us/graph/webhooks
2. **Note**: Webhooks are configured via API after user auth
3. **Webhook endpoint needed**: `https://your-domain.com/webhooks/outlook`
4. **Required**: HTTPS with valid SSL certificate

---

## 🤖 Step 3: AI API Setup (20 minutes)

### 3.1 OpenAI API

1. **Go to**: https://platform.openai.com/
2. **Sign up/in**
3. **Navigate to**: https://platform.openai.com/api-keys
4. **Click** "Create new secret key"
5. **Name**: `tide-production`
6. **SAVE THE KEY**: `sk-...xxxxx`
7. **Set up billing**:
   - Go to: https://platform.openai.com/account/billing
   - Add payment method
   - Set usage limits: $50/month initially

### 3.2 Anthropic API (Optional)

1. **Go to**: https://console.anthropic.com/
2. **Sign up** (requires approval)
3. **Once approved**, go to: https://console.anthropic.com/settings/keys
4. **Create key**: `tide-production`
5. **SAVE THE KEY**: `sk-ant-...xxxxx`

---

## 🗄️ Step 4: Database & Redis Setup (30 minutes)

### Option A: Supabase (Recommended for PostgreSQL)

1. **Go to**: https://supabase.com/
2. **Sign up** and create new project:
   ```
   Name: tide-production
   Database Password: (generate strong password)
   Region: (closest to you)
   ```
3. **Wait** for project setup (~2 minutes)
4. **Go to** Settings → Database
5. **SAVE** Connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **Enable** pgvector extension:
   - Go to SQL Editor
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

### Option B: Neon (Alternative for PostgreSQL)

1. **Go to**: https://neon.tech/
2. **Sign up** and create project
3. **Get** connection string from dashboard

### Redis Setup: Upstash

1. **Go to**: https://upstash.com/
2. **Sign up** and create new Redis database:
   ```
   Name: tide-redis
   Region: (closest to you)
   Type: Regional
   ```
3. **SAVE** credentials from dashboard:
   ```
   REDIS_URL: redis://default:xxxxx@xxxxx.upstash.io:6379
   ```

---

## 🌐 Step 5: Domain & DNS Setup (30 minutes)

### 5.1 Register Domain

1. **Go to**: https://www.namecheap.com/ or https://domains.google/
2. **Search** for your domain (e.g., `tide-assistant.com`)
3. **Purchase** domain (~$12/year)
4. **Configure** DNS (after purchasing):

### 5.2 Cloudflare Setup (Free SSL & CDN)

1. **Go to**: https://cloudflare.com/
2. **Sign up** and add your site
3. **Update** nameservers at your registrar
4. **Wait** for DNS propagation (~5-30 minutes)
5. **Configure** DNS records:
   ```
   A     @      YOUR_SERVER_IP
   A     api    YOUR_API_SERVER_IP
   CNAME www    @
   CNAME app    YOUR_APP_DOMAIN
   ```
6. **Enable** SSL/TLS → Full (strict)
7. **Enable** Auto HTTPS Rewrites

---

## 📧 Step 6: Transactional Email Setup (15 minutes)

### Option A: Resend (Recommended)

1. **Go to**: https://resend.com/
2. **Sign up** for free account
3. **Verify** your domain:
   - Add DNS records they provide
   - Wait for verification
4. **Get API key**:
   - Go to API Keys
   - Create key: `tide-production`
   - **SAVE**: `re_xxxxxxxxxxxxx`

### Option B: SendGrid

1. **Go to**: https://sendgrid.com/
2. **Sign up** (requires approval)
3. **Verify** sender identity
4. **Get API key** from Settings

---

## 🚀 Step 7: Hosting Setup (20 minutes)

### 7.1 Backend API: Railway

1. **Go to**: https://railway.app/
2. **Sign up** with GitHub
3. **Create** new project
4. **Add** PostgreSQL and Redis services
5. **Note** the deployment URL: `https://tide-api.railway.app`

### 7.2 Frontend Web: Vercel

1. **Go to**: https://vercel.com/
2. **Sign up** with GitHub
3. **Import** your repository (when ready)
4. **Configure** environment variables
5. **Note** the deployment URL: `https://tide.vercel.app`

### 7.3 Alternative: Render

1. **Go to**: https://render.com/
2. **Create** Web Service for API
3. **Create** Static Site for frontend

---

## 📊 Step 8: Monitoring & Analytics (20 minutes)

### 8.1 Error Tracking: Sentry

1. **Go to**: https://sentry.io/
2. **Sign up** for free account
3. **Create** new project:
   ```
   Platform: Node.js (for API)
   Project name: tide-api
   ```
4. **Create** another for frontend:
   ```
   Platform: React Native / Next.js
   Project name: tide-frontend
   ```
5. **SAVE** DSN URLs from project settings

### 8.2 Analytics: PostHog

1. **Go to**: https://posthog.com/
2. **Sign up** for free cloud account
3. **Create** project: `tide-analytics`
4. **Get** API key from Project Settings
5. **SAVE**: `phc_xxxxxxxxxxxxx`

### 8.3 Uptime Monitoring: Better Uptime

1. **Go to**: https://betteruptime.com/
2. **Sign up** for free account
3. **Add monitors**:
   ```
   API Health: https://api.your-domain.com/health
   Web App: https://app.your-domain.com
   ```
4. **Configure** alerts (email/SMS)

---

## 🔐 Step 9: Security & Compliance (15 minutes)

### 9.1 Generate JWT Keys

```bash
# Run locally to generate RSA key pair
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### 9.2 Set up Vault (Optional but recommended)

1. **Go to**: https://www.doppler.com/ or https://www.vaultproject.io/
2. **Create** account and project
3. **Add** all secrets
4. **Install** CLI for deployment

### 9.3 SSL Certificate (if not using Cloudflare)

1. **Go to**: https://letsencrypt.org/
2. **Or use** Certbot: https://certbot.eff.org/

---

## 🏦 Step 10: Payment Processing (Optional - if monetizing)

### Stripe Setup

1. **Go to**: https://stripe.com/
2. **Sign up** for account
3. **Get API keys**:
   - Test mode first
   - Publishable key: `pk_test_xxxxx`
   - Secret key: `sk_test_xxxxx`
4. **Configure** webhooks:
   - Endpoint: `https://api.your-domain.com/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.*`
5. **Set up** products and prices

---

## 📝 Step 11: Environment Variables Template

Create `.env.example` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/tide
REDIS_URL=redis://default:password@host:6379

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=xxxxxxxxxxxxx
MICROSOFT_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_REDIRECT_URI=http://localhost:3001/auth/microsoft/callback

# AI APIs
OPENAI_API_KEY=sk-...xxxxx
ANTHROPIC_API_KEY=sk-ant-...xxxxx (optional)

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx

# Security
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
SESSION_SECRET=randomly-generated-secret-at-least-32-chars

# App URLs
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
MOBILE_URL=http://localhost:19000

# Webhooks
GMAIL_WEBHOOK_URL=https://api.your-domain.com/webhooks/gmail
OUTLOOK_WEBHOOK_URL=https://api.your-domain.com/webhooks/outlook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_SENTRY=true
ENABLE_RATE_LIMITING=true
```

---

## 🚨 Common Issues & Solutions

### Issue: Google OAuth "Access blocked" error
**Solution**: Make sure app is in "Testing" mode and user is added as test user

### Issue: Microsoft "AADSTS50011" error
**Solution**: Redirect URI must match exactly (including trailing slash)

### Issue: Gmail push notifications not working
**Solution**:
1. Verify Pub/Sub topic permissions
2. Endpoint must be HTTPS with valid SSL
3. Must acknowledge webhook within 20 seconds

### Issue: Outlook webhooks failing
**Solution**:
1. Must respond with 202 status immediately
2. Process webhook async
3. Validate webhook signatures

### Issue: Rate limits on APIs
**Solution**:
- OpenAI: 3 RPM initially → request increase
- Gmail: 250 quota units/second → batch operations
- Graph API: 10,000 requests/10 minutes → implement caching

---

## ✅ Setup Verification Checklist

After completing all steps, verify:

### API Access
- [ ] Can authenticate with Google OAuth
- [ ] Can authenticate with Microsoft OAuth
- [ ] Can call Gmail API
- [ ] Can call Calendar API
- [ ] Can call OpenAI API
- [ ] Database connection works
- [ ] Redis connection works

### Webhooks
- [ ] Gmail webhook endpoint accessible
- [ ] Outlook webhook endpoint accessible
- [ ] Webhooks have valid SSL

### Security
- [ ] All secrets in environment variables
- [ ] JWT keys generated
- [ ] HTTPS configured
- [ ] CORS properly configured

### Monitoring
- [ ] Sentry receiving errors
- [ ] Analytics tracking events
- [ ] Uptime monitoring active

---

## 💰 Cost Breakdown

### Monthly Costs (Initial)
- **Google Cloud**: Free tier (Gmail API free up to quota)
- **Microsoft Azure**: Free tier
- **OpenAI**: ~$10-20 (depends on usage)
- **Supabase**: Free tier (up to 500MB)
- **Upstash Redis**: Free tier (up to 10k commands/day)
- **Vercel**: Free tier (hobby)
- **Railway**: ~$5 (if exceeding free tier)
- **Domain**: ~$1/month ($12/year)
- **Total**: ~$20-30/month initially

### When Scaling
- **OpenAI**: $0.03/1k tokens (GPT-4)
- **Database**: ~$25/month (2GB)
- **Redis**: ~$10/month (professional)
- **Hosting**: ~$20-50/month
- **Email**: ~$20/month (10k emails)

---

## 🎯 Next Steps

1. **Complete all setups above** (4-6 hours)
2. **Save all credentials** in password manager
3. **Create `.env.local`** with actual values
4. **Test each integration** individually
5. **Set up staging environment** with separate credentials
6. **Document any specific settings** for your setup

---

## 📚 Quick Reference Links

### OAuth Dashboards
- [Google Cloud Console](https://console.cloud.google.com/)
- [Azure Portal](https://portal.azure.com/)
- [Google API Dashboard](https://console.cloud.google.com/apis/dashboard)
- [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)

### API Documentation
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [OpenAI API Docs](https://platform.openai.com/docs)

### Service Dashboards
- [Supabase Dashboard](https://app.supabase.com/)
- [Upstash Console](https://console.upstash.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app/dashboard)
- [Sentry Dashboard](https://sentry.io/)
- [PostHog Dashboard](https://app.posthog.com/)

Remember: Keep all credentials secure and never commit them to Git!