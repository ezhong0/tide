# Tide Application - External Setup Guide

> **Complete guide to all external services, APIs, and configurations required outside the application**

**Last Updated**: October 6, 2025
**Status**: Development Ready

---

## 📋 Table of Contents

1. [Quick Start Checklist](#quick-start-checklist)
2. [Priority 1: Essential Services](#priority-1-essential-services)
3. [Priority 2: Core Features](#priority-2-core-features)
4. [Priority 3: Optional Services](#priority-3-optional-services)
5. [Priority 4: Production Only](#priority-4-production-only)
6. [Cost Estimates](#cost-estimates)

---

## Quick Start Checklist

### Minimum to Start (Development)
- [x] **Docker Desktop** - ✅ Already required for infrastructure
- [ ] **OpenAI API Key** - Required for AI features
- [ ] **Anthropic API Key** - Required for privacy-sensitive AI
- [ ] **Gmail OAuth** - Required for email integration
- [ ] **Google Calendar OAuth** - Required for calendar
- [ ] **Exchange OAuth** - Required for Outlook/Microsoft 365
- [ ] **Pinecone** - Required for semantic search

### What's Already Configured
- ✅ PostgreSQL (via Docker)
- ✅ Redis (via Docker)
- ✅ Kafka (via Docker)
- ✅ Prometheus (via Docker)
- ✅ Grafana (via Docker)
- ✅ Kafka UI (via Docker)

---

## Priority 1: Essential Services

### 1.1 OpenAI API 🔴 REQUIRED

**Purpose**: GPT-4o, GPT-4o-mini for AI intelligence

**Setup URL**: https://platform.openai.com/

#### Steps:
1. Sign up/login to OpenAI Platform
2. Navigate to API Keys: https://platform.openai.com/api-keys
3. Click **"Create new secret key"**
4. Name: `Tide Production`
5. **Copy key immediately** (starts with `sk-`)
6. Set up billing:
   - Add payment method
   - Set usage limit: **$100/month** (recommended)
7. Note Organization ID (optional): https://platform.openai.com/account/organization

#### Environment Variables:
```bash
OPENAI_API_KEY=sk-...your-key...
OPENAI_ORG_ID=org-...your-org-id...  # Optional
```

#### Cost Estimate:
- Development: **$20-50/month**
- Production (10K users): **$20K/month** (~$2/user)

#### Models Used:
- GPT-4o: Complex reasoning, planning
- GPT-4o-mini: Fast responses, routine tasks
- text-embedding-ada-002: Semantic search

---

### 1.2 Anthropic API (Claude) 🔴 REQUIRED

**Purpose**: Claude for privacy-sensitive operations, multi-model ensemble

**Setup URL**: https://console.anthropic.com/

#### Steps:
1. Sign up/login to Anthropic Console
2. Navigate to **API Keys**
3. Click **"Create Key"**
4. Name: `Tide Production`
5. **Copy key immediately** (starts with `sk-ant-`)
6. Set up billing and review pricing

#### Environment Variables:
```bash
ANTHROPIC_API_KEY=sk-ant-...your-key...
```

#### Cost Estimate:
- Development: **$20-50/month**
- Production: **Included in $2/user** (ensemble with GPT)

#### Models Used:
- Claude Opus: Complex reasoning, critical decisions
- Claude Sonnet: Balanced performance
- Used for: Privacy-sensitive data, legal review, financial analysis

---

## Priority 2: Core Features

### 2.1 Gmail OAuth 🟡 REQUIRED FOR EMAIL

**Purpose**: Gmail integration for email management

**Setup URL**: https://console.cloud.google.com/

#### Steps:

**Part A: Create Project**
1. Go to Google Cloud Console
2. Create new project: **"Tide AI"**
3. Select project from dropdown

**Part B: Enable APIs**
1. Navigate to **APIs & Services** → **Library**
2. Search and enable:
   - ✅ **Gmail API**
   - ✅ **Google Calendar API** (for calendar integration)

**Part C: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. User Type: **External** (public) or **Internal** (org only)
3. Fill in:
   - App name: **Tide AI**
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   ```
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.compose
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.labels
   https://www.googleapis.com/auth/gmail.settings.basic
   ```
5. Add test users (for development)
6. Save and continue

**Part D: Create OAuth Credentials**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: **Tide Gmail Integration**
5. Authorized redirect URIs:
   ```
   http://localhost:4000/auth/gmail/callback
   https://api.tide.ai/auth/gmail/callback
   ```
6. Click **Create**
7. **Copy Client ID and Client Secret**

#### Environment Variables:
```bash
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REDIRECT_URI=http://localhost:4000/auth/gmail/callback
```

#### Testing:
```bash
# OAuth flow URL (replace YOUR_CLIENT_ID)
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:4000/auth/gmail/callback&
  response_type=code&
  scope=https://www.googleapis.com/auth/gmail.modify&
  access_type=offline
```

---

### 2.2 Google Calendar OAuth 🟡 REQUIRED FOR CALENDAR

**Purpose**: Google Calendar integration

**Setup URL**: https://console.cloud.google.com/ (same project as Gmail)

#### Steps:
1. ✅ Gmail API already enabled above
2. Add Calendar scope to OAuth consent screen:
   ```
   https://www.googleapis.com/auth/calendar
   ```
3. Use same OAuth client or create new one
4. Add redirect URI:
   ```
   http://localhost:4000/auth/calendar/callback
   https://api.tide.ai/auth/calendar/callback
   ```

#### Environment Variables:
```bash
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/calendar/callback
```

**Note**: Can use same credentials as Gmail

---

### 2.3 Microsoft Exchange/Outlook OAuth 🟡 REQUIRED FOR OUTLOOK

**Purpose**: Microsoft 365 / Outlook integration

**Setup URL**: https://portal.azure.com/

#### Steps:

**Part A: Register Application**
1. Sign in to Azure Portal
2. Navigate to **Azure Active Directory**
3. Click **App registrations** → **New registration**
4. Configure:
   - Name: **Tide AI**
   - Account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URIs:
     ```
     http://localhost:4000/auth/exchange/callback
     https://api.tide.ai/auth/exchange/callback
     ```
5. Click **Register**

**Part B: Note IDs**
1. Copy **Application (client) ID**
2. Copy **Directory (tenant) ID**

**Part C: Create Client Secret**
1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: **Tide Production**
4. Expires: **24 months**
5. **Copy the VALUE immediately** (shown only once!)

**Part D: Add API Permissions**
1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add:
   - ✅ `Mail.Read`
   - ✅ `Mail.Send`
   - ✅ `Mail.ReadWrite`
   - ✅ `Calendars.ReadWrite`
   - ✅ `Calendars.Read`
   - ✅ `User.Read`
5. Click **Grant admin consent** (if admin)

#### Environment Variables:
```bash
EXCHANGE_CLIENT_ID=xxxxx
EXCHANGE_CLIENT_SECRET=xxxxx
EXCHANGE_TENANT_ID=xxxxx
EXCHANGE_REDIRECT_URI=http://localhost:4000/auth/exchange/callback
```

#### Testing:
```bash
# OAuth flow URL (replace YOUR_CLIENT_ID and YOUR_TENANT_ID)
https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:4000/auth/exchange/callback&
  response_type=code&
  scope=offline_access Mail.Read Mail.Send Calendars.ReadWrite
```

---

### 2.4 Pinecone Vector Database 🟡 REQUIRED FOR AI SEARCH

**Purpose**: Semantic search, AI memory, contextual understanding

**Setup URL**: https://app.pinecone.io/

#### Steps:
1. Sign up/login to Pinecone
2. Create new project: **Tide Production**
3. Create index:
   - Click **Create Index**
   - Name: **`tide-embeddings`**
   - Dimensions: **1536** (OpenAI ada-002)
   - Metric: **cosine**
   - Pod type:
     - Development: **p1.x1** (starter)
     - Production: **p1.x2** or **s1** (storage-optimized)
   - Region: **us-east-1-aws** (or closest to users)
4. Get API credentials:
   - Go to **API Keys**
   - Copy **API Key**
   - Note **Environment** (e.g., `us-east-1-aws`)

#### Environment Variables:
```bash
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=tide-embeddings
```

#### Cost Estimate:
- Starter (p1.x1): **$70/month**
- Production (p1.x2): **$140/month**
- Storage-optimized (s1): **~$100/month** (scales)
- 10K users: **$500-1K/month**

---

## Priority 3: Optional Services

### 3.1 Sentry (Error Tracking) ⭕ OPTIONAL

**Purpose**: Real-time error tracking and monitoring

**Setup URL**: https://sentry.io/

#### Steps:
1. Sign up/login to Sentry
2. Create project:
   - Platform: **Node.js**
   - Name: **Tide Backend**
3. Copy **DSN** from project settings
4. Configure alerts and integrations

#### Environment Variables:
```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

#### Cost:
- Free tier: 5K events/month
- Developer: $26/month
- Team: $80/month

---

### 3.2 Datadog (APM) ⭕ OPTIONAL

**Purpose**: Application performance monitoring

**Setup URL**: https://www.datadoghq.com/

#### Steps:
1. Sign up/login to Datadog
2. Navigate to **Organization Settings** → **API Keys**
3. Create new API key: **Tide Production**
4. Copy key
5. Set up integrations:
   - PostgreSQL
   - Redis
   - Kafka
   - Node.js APM

#### Environment Variables:
```bash
DATADOG_API_KEY=xxxxx
```

#### Cost:
- Free: 5 hosts
- Pro: $15/host/month
- Enterprise: $23/host/month

---

### 3.3 SendGrid (Email Delivery) ⭕ OPTIONAL

**Purpose**: Transactional emails (verification, password reset)

**Setup URL**: https://sendgrid.com/

#### Steps:
1. Sign up/login to SendGrid
2. Create API key
3. Verify sender domain
4. Configure DNS records (SPF, DKIM)

#### Environment Variables:
```bash
SENDGRID_API_KEY=xxxxx
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=xxxxx (SendGrid API key)
SMTP_FROM=noreply@tide.ai
```

#### Cost:
- Free: 100 emails/day
- Essentials: $15/month (40K emails)
- Pro: $60/month (100K emails)

---

## Priority 4: Production Only

### 4.1 Domain & SSL 🔵 PRODUCTION

**Domain Registration**: GoDaddy, Namecheap, Cloudflare

**SSL Options**:
1. **Let's Encrypt** (Free, auto-renewal)
2. **Cloudflare SSL** (Free with Cloudflare)
3. **AWS Certificate Manager** (Free for AWS services)

**DNS Records**:
```
A     api.tide.ai        → Your server IP
A     www.tide.ai        → Your server IP
CNAME *.tide.ai          → tide.ai
```

---

### 4.2 Cloud Infrastructure 🔵 PRODUCTION

**AWS Services**:
- EKS or ECS (containers)
- RDS (PostgreSQL)
- ElastiCache (Redis)
- MSK (Kafka)
- S3 (storage)
- CloudFront (CDN)

**GCP Services**:
- GKE (Kubernetes)
- Cloud SQL
- Memorystore
- Pub/Sub
- Cloud Storage

**Azure Services**:
- AKS (Kubernetes)
- Azure Database
- Azure Cache
- Event Hubs
- Blob Storage

**Not needed for development** - Docker handles everything

---

### 4.3 Mobile App Stores 🔵 FUTURE

**Apple Developer**:
- URL: https://developer.apple.com/
- Cost: $99/year
- Required for: App Store, TestFlight, Push Notifications

**Google Play Console**:
- URL: https://play.google.com/console/
- Cost: $25 one-time
- Required for: Play Store, Beta testing

**Status**: Track 1 (Mobile Apps) - Week 1-3

---

### 4.4 Stripe (Payments) 🔵 FUTURE

**Purpose**: Subscription billing ($30/month)

**Setup URL**: https://stripe.com/

**Required for**:
- Payment processing
- Subscription management
- Invoice generation

**Status**: Future implementation

---

## Cost Estimates

### Development Environment
| Service | Cost | Notes |
|---------|------|-------|
| Docker Desktop | Free | Required |
| OpenAI | $20-50/mo | Usage-based |
| Anthropic | $20-50/mo | Usage-based |
| Pinecone | $70/mo | Starter pod |
| Gmail/Calendar OAuth | Free | No cost |
| Exchange OAuth | Free | No cost |
| **Total** | **$110-170/mo** | Full-featured dev |

### Production (10K Users)
| Service | Monthly | Annual |
|---------|---------|--------|
| OpenAI | $20,000 | $240,000 |
| Anthropic | Included | Included |
| Pinecone | $500-1,000 | $6K-12K |
| AWS/GCP | $5,000-10,000 | $60K-120K |
| Monitoring | $500 | $6,000 |
| **Total** | **$26K-31K** | **$312K-378K** |

**Revenue (10K users @ $30/mo)**: $300K/month = $3.6M/year
**Gross Margin**: ~90% ($270K/month profit)

---

## Complete .env Template

```bash
# =============================================================================
# TIDE ENVIRONMENT CONFIGURATION
# =============================================================================

# Database (Local - Docker)
DATABASE_URL=postgresql://tide:tide_password@localhost:5432/tide
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis (Local - Docker)
REDIS_URL=redis://localhost:6379
REDIS_MAX_RETRIES=3

# Kafka (Local - Docker)
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=tide-client
KAFKA_GROUP_ID=tide-group

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Bcrypt
BCRYPT_ROUNDS=12

# OpenAI (REQUIRED)
OPENAI_API_KEY=sk-...your-openai-key...
OPENAI_ORG_ID=org-...your-org-id...

# Anthropic (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-...your-anthropic-key...

# Gmail OAuth (REQUIRED)
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REDIRECT_URI=http://localhost:4000/auth/gmail/callback

# Google Calendar OAuth (REQUIRED)
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/calendar/callback

# Microsoft Exchange OAuth (REQUIRED)
EXCHANGE_CLIENT_ID=xxxxx
EXCHANGE_CLIENT_SECRET=xxxxx
EXCHANGE_TENANT_ID=xxxxx
EXCHANGE_REDIRECT_URI=http://localhost:4000/auth/exchange/callback

# Pinecone (REQUIRED)
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=tide-embeddings

# Sentry (Optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Datadog (Optional)
DATADOG_API_KEY=xxxxx

# SendGrid SMTP (Optional)
SENDGRID_API_KEY=xxxxx
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=xxxxx
SMTP_FROM=noreply@tide.ai

# Feature Flags
FEATURE_AI_ENABLED=true
FEATURE_EMAIL_ENABLED=true
FEATURE_CALENDAR_ENABLED=true
FEATURE_WORKFLOW_ENABLED=true

# Environment
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug
```

---

## Quick Setup Script

Save this as `setup-env.sh`:

```bash
#!/bin/bash

echo "🌊 Tide Environment Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Copy template
cp .env.example .env
echo "✅ Created .env from template"
echo ""

# Collect required credentials
echo "📝 Please enter your API credentials:"
echo ""

read -p "OpenAI API Key (sk-...): " OPENAI_KEY
read -p "Anthropic API Key (sk-ant-...): " ANTHROPIC_KEY
read -p "Gmail Client ID: " GMAIL_CLIENT
read -p "Gmail Client Secret: " GMAIL_SECRET
read -p "Exchange Client ID: " EXCHANGE_CLIENT
read -p "Exchange Client Secret: " EXCHANGE_SECRET
read -p "Exchange Tenant ID: " EXCHANGE_TENANT
read -p "Pinecone API Key: " PINECONE_KEY

# Update .env
sed -i.bak "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" .env
sed -i.bak "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$ANTHROPIC_KEY/" .env
sed -i.bak "s/GMAIL_CLIENT_ID=.*/GMAIL_CLIENT_ID=$GMAIL_CLIENT/" .env
sed -i.bak "s/GMAIL_CLIENT_SECRET=.*/GMAIL_CLIENT_SECRET=$GMAIL_SECRET/" .env
sed -i.bak "s/EXCHANGE_CLIENT_ID=.*/EXCHANGE_CLIENT_ID=$EXCHANGE_CLIENT/" .env
sed -i.bak "s/EXCHANGE_CLIENT_SECRET=.*/EXCHANGE_CLIENT_SECRET=$EXCHANGE_SECRET/" .env
sed -i.bak "s/EXCHANGE_TENANT_ID=.*/EXCHANGE_TENANT_ID=$EXCHANGE_TENANT/" .env
sed -i.bak "s/PINECONE_API_KEY=.*/PINECONE_API_KEY=$PINECONE_KEY/" .env

rm .env.bak

echo ""
echo "✅ Environment configured!"
echo ""
echo "Next steps:"
echo "  1. Start infrastructure: pnpm dev:start"
echo "  2. Build services: pnpm build"
echo "  3. Run tests: pnpm test:alpha"
```

---

## Support & Documentation

**Questions?**
- 📖 Full docs: `/docs/`
- 🐛 Issues: Create GitHub issue
- 💬 Discussions: GitHub Discussions

**External Service Docs**:
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Microsoft Graph: https://learn.microsoft.com/en-us/graph/
- Pinecone: https://docs.pinecone.io/

---

**Last Updated**: October 6, 2025
**Version**: 0.1.0 (Alpha)
