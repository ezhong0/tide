# 🔧 External Setup Guide - Manual Steps Required

> **Things YOU need to do: Browser testing, Mobile app testing**

**Last Updated**: October 7, 2025
**Status**: ✅ **INFRASTRUCTURE READY** - Backend services running!

---

## ✅ COMPLETED VIA CLI

The following have been **automatically completed**:
- ✅ Docker containers running (PostgreSQL + Redis)
- ✅ Database migrations executed
- ✅ `.env` file created with configuration
- ✅ Auth Service running on port 4001
- ✅ WebSocket Service running on port 4002
- ✅ Auth schema issue fixed (firstName/lastName)
- ✅ User registration tested successfully
- ✅ User login tested successfully

**Services are running in background shells:**
- Auth Service: Shell ID `8b92d7`
- WebSocket Service: Shell ID `ff32b8`

---

## 🎯 REMAINING MANUAL ACTIONS

### Required Now:
1. [Test WebSocket in Browser](#3-test-websocket-in-browser) - 5 minutes
2. [Test on iOS](#4-test-on-ios-simulator) - 10 minutes
3. [Test on Android](#5-test-on-android-emulator) - 10 minutes

### For Later:
4. [External API Keys](#6-external-api-keys-future) - Production only

---

## 📋 Table of Contents

### Part 1: Manual Testing (Required Now)
1. [Quick Verification](#1-quick-verification) - 1 minute
2. [Test in Browser](#3-test-websocket-in-browser) - 5 minutes
3. [Test on iOS](#4-test-on-ios-simulator) - 10 minutes
4. [Test on Android](#5-test-on-android-emulator) - 10 minutes

### Part 2: Reference (If Needed)
5. [Restart Services](#2-restart-services-if-needed) - Reference
6. [External API Keys](#6-external-api-keys-future) - Future
7. [Cost Estimates](#cost-estimates) - Reference

---

## 1. Quick Verification

### Verify Services Are Running

```bash
# Check Docker
docker ps | grep tide

# Check Auth Service
curl http://localhost:4001/health

# Check WebSocket Service
curl http://localhost:4002/health
```

**Expected:** All should return healthy status.

**If services stopped**, see [Restart Services](#2-restart-services-if-needed) below.

---

## 2. Restart Services (If Needed)

**Only if services stopped! Skip if they're running.**

### 1.1 Open Docker Desktop (REQUIRED)

**Open Terminal and run:**

```bash
# Start Docker Desktop application
open -a Docker

# Wait for Docker to be ready (watch menu bar for whale icon)
# Usually takes 30-60 seconds
```

**Verify Docker is running:**

```bash
docker ps

# ✅ Should show: CONTAINER ID   IMAGE   ...
# ❌ Should NOT show: "Cannot connect to the Docker daemon"
```

**If Docker isn't installed:**
1. Download: https://www.docker.com/products/docker-desktop
2. Install and restart terminal
3. Come back here

---

### Start Services

**Open NEW terminal windows and run these commands:**

**Terminal 1 - Auth Service:**
```bash
cd /Users/edwardzhong/Projects/tide
set -a && source .env && set +a
cd packages/services/auth && pnpm dev
```

**Terminal 2 - WebSocket Service:**
```bash
cd /Users/edwardzhong/Projects/tide
set -a && source .env && set +a
cd packages/services/realtime && pnpm dev
```

**Wait for:**
- ✅ "Auth service started on port 4001"
- ✅ "Realtime service started on port 4002"

**Verify:**
```bash
curl http://localhost:4001/health
curl http://localhost:4002/health
```

---

## 3. Test WebSocket in Browser

### 3.1 Register a Test User

**In a NEW terminal, run this command:**

```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "browser-test@tide.ai",
    "password": "TestPass123!",
    "firstName": "Browser",
    "lastName": "Tester"
  }'
```

**IMPORTANT: Copy the entire access token from the response!**

The response looks like:
```json
{
  "user": {
    "id": "...",
    "email": "browser-test@tide.ai",
    "name": "Browser Tester",
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW...",
  "refreshToken": "..."
}
```

**Copy everything after "accessToken": "..." (the long string starting with eyJ)**

**Note:** The API expects `firstName` and `lastName` (these are combined into `name` in the response).

---

### 3.2 Test in Browser Console

1. **Open your web browser** (Chrome recommended)

2. **Press F12** (or Cmd+Option+I on Mac) to open Developer Console

3. **Click "Console" tab**

4. **Paste this code** (REPLACE YOUR_ACCESS_TOKEN with the token from step 3.1):

```javascript
// PASTE YOUR TOKEN HERE:
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsImVtYWlsIjoidGVzdEB0aWRlLmFpIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTcyODI4MDgwMCwiZXhwIjoxNzI4MjgxNzAwfQ.abc123";

const ws = new WebSocket(`ws://localhost:4002/realtime?token=${token}`);

ws.onopen = () => {
  console.log("✅ WebSocket Connected!");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📨 Received:", data.type, data);
};

ws.onerror = (error) => {
  console.error("❌ WebSocket Error:", error);
};

ws.onclose = () => {
  console.log("🔌 WebSocket Closed");
};

// Send a test message after 2 seconds
setTimeout(() => {
  console.log("📤 Sending test message...");
  ws.send(JSON.stringify({
    type: "message",
    messageId: "test_123",
    payload: {
      conversationId: "conv_test",
      content: "Hello from browser!"
    }
  }));
}, 2000);
```

5. **Press Enter to run the code**

---

### 3.3 What You Should See

**In browser console, you should see:**

```
✅ WebSocket Connected!
📨 Received: connected {type: "connected", payload: {...}}
📤 Sending test message...
📨 Received: message_ack {...}
📨 Received: message {...content: "Hello from browser!"...}
📨 Received: message {...content: "AI received: \"Hello from browser!\". Processing..."...}
```

**If you see these messages: ✅ SUCCESS! WebSocket is working!**

---

### 3.4 Common Browser Issues

**"Authentication failed":**
- Token expired (they expire after 15 minutes)
- Register a new user to get fresh token

**"Connection refused":**
- WebSocket service not running (check Terminal 2)
- Wrong port (should be 4002)

**"SyntaxError":**
- Token has quotes or spaces
- Copy only the token string, not the quotes

---

## 4. Test on iOS Simulator

### 4.1 Open Xcode Project

```bash
open /Users/edwardzhong/Projects/tide/apps/mobile-ios/*.xcodeproj
```

---

### 4.2 Build and Run

1. **Select simulator:** iPhone 15 Pro (or any recent model)
2. **Press Cmd+R** to build and run
3. **Wait for app to launch** in simulator

---

### 4.3 Register a User

1. **In the app**, go to Register screen
2. Enter:
   - Email: `ios-test@tide.ai`
   - Password: `TestPass123!`
   - First Name: `iOS`
   - Last Name: `Tester`
3. **Tap "Register"**

**Note:** iOS app combines firstName + lastName into full name.

**Watch Terminal 1 (Auth Service)** - you should see:
```
User registered successfully
```

---

### 4.4 Test Messaging

1. **Send a message** in the chat: "Hello from iOS!"

2. **You should see:**
   - ✅ Your message appears immediately
   - ✅ Typing indicator shows briefly
   - ✅ AI response appears within 1-2 seconds
   - ✅ Message persists (close and reopen app)

**Watch Terminal 2 (WebSocket Service)** - you should see:
```
WebSocket connected
Message received: message
```

---

### 4.5 iOS Troubleshooting

**App won't build:**
```bash
# Clean build
Product → Clean Build Folder (Cmd+Shift+K)

# Try again
```

**"Connection refused":**
- Auth service not running (Terminal 1)
- WebSocket service not running (Terminal 2)
- Check both are on ports 4001 and 4002

**No messages appearing:**
- Check Xcode console for errors
- Check TideCore integration (should be updated with WebSocket)

---

## 5. Test on Android Emulator

### 5.1 Open Android Studio

```bash
open -a "Android Studio" /Users/edwardzhong/Projects/tide/apps/mobile-android
```

**Wait for Gradle sync** to complete (bottom right of window)

---

### 5.2 Start Emulator

1. **Tools → Device Manager**
2. **Select or create** a Pixel 5 emulator (API 30+)
3. **Click Play** button to start emulator
4. **Wait** for emulator to fully boot

---

### 5.3 Run the App

1. **Click green "Run" button** (or Shift+F10)
2. **Select your emulator**
3. **Wait for app to install and launch**

---

### 5.4 Register a User

1. **In the app**, go to Register screen
2. Enter:
   - Email: `android-test@tide.ai`
   - Password: `TestPass123!`
   - First Name: `Android`
   - Last Name: `Tester`
3. **Tap "Register"**

**Note:** Android app combines firstName + lastName into full name.

**Watch Terminal 1 (Auth Service)** - you should see:
```
User registered successfully
```

---

### 5.5 Test Messaging

1. **Send a message**: "Hello from Android!"

2. **You should see:**
   - ✅ Your message appears immediately
   - ✅ Typing indicator (if implemented)
   - ✅ AI response within 1-2 seconds
   - ✅ Connection status indicator

**Watch Terminal 2 (WebSocket Service)** - you should see:
```
WebSocket connected
Message received: message
```

**Android Note:** Emulator uses `10.0.2.2` to reach host `localhost` - WebSocketManager already configured for this!

---

### 5.6 Android Troubleshooting

**Gradle sync fails:**
```bash
# In Android Studio terminal:
./gradlew clean

# File → Invalidate Caches → Invalidate and Restart
```

**Emulator can't connect:**
```bash
# Check services are reachable from emulator
# In Android Studio terminal:
adb shell
curl http://10.0.2.2:4001/health
curl http://10.0.2.2:4002/health
```

**App crashes:**
- Check Logcat for errors (View → Tool Windows → Logcat)
- Filter by "WebSocket" or "Tide"

---

## ✅ Verification Checklist

**Check all boxes before proceeding:**

### Infrastructure
- [ ] Docker Desktop running
- [ ] PostgreSQL container healthy
- [ ] Redis container healthy
- [ ] Database migrations completed

### Services
- [ ] Auth service running (port 4001)
- [ ] WebSocket service running (port 4002)
- [ ] Health checks return "healthy"

### Browser Testing
- [ ] Registered test user
- [ ] WebSocket connected in browser
- [ ] Sent message successfully
- [ ] Received AI response

### iOS Testing
- [ ] App builds and runs
- [ ] Registered iOS test user
- [ ] Sent message successfully
- [ ] Received AI response
- [ ] Messages persist after restart

### Android Testing
- [ ] App builds and runs
- [ ] Registered Android test user
- [ ] Sent message successfully
- [ ] Received AI response
- [ ] Connection status shows

---

## 🆘 If Something Doesn't Work

### Check Service Logs

**Auth Service (Terminal 1):**
- Look for "User registered successfully"
- Look for "User logged in successfully"
- Look for errors

**WebSocket Service (Terminal 2):**
- Look for "WebSocket connected"
- Look for "Message received"
- Look for authentication errors

**Docker Logs:**
```bash
docker compose logs postgres | tail -50
docker compose logs redis | tail -50
```

---

### Get Fresh Tokens

**Tokens expire after 15 minutes!**

If testing later, register a new user or login again:

```bash
# Login to get fresh tokens
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "browser-test@tide.ai",
    "password": "TestPass123!"
  }'

# Copy the new accessToken
```

---

## 6. External API Keys (Future)

**NOT NEEDED FOR ALPHA TESTING**

For production, you'll need API keys from:

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

### 2.1 Google OAuth (Gmail + Calendar) 🟡 REQUIRED

**Purpose**: Unified OAuth for all Google services (Gmail, Calendar, Drive, etc.)

**Setup URL**: https://console.cloud.google.com/

**Why unified?** Single OAuth flow for better UX - users authorize once for all Google services!

#### Steps:

**Part A: Create Project**
1. Go to Google Cloud Console
2. Create new project: **"Tide AI"**
3. Select project from dropdown

**Part B: Enable APIs**
1. Navigate to **APIs & Services** → **Library**
2. Search and enable:
   - ✅ **Gmail API**
   - ✅ **Google Calendar API**
   - ✅ **Google Drive API** (optional, for future)

**Part C: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. User Type: **External** (public) or **Internal** (org only)
3. Fill in:
   - App name: **Tide AI**
   - User support email: your email
   - Developer contact: your email
4. Add scopes (all at once):
   ```
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.compose
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.labels
   https://www.googleapis.com/auth/gmail.settings.basic
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   ```
5. Add test users (for development)
6. Save and continue

**Part D: Create OAuth Credentials**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Create **Web Application** client:
   - Name: **Tide Web**
   - Authorized redirect URIs:
     ```
     http://localhost:4000/auth/google/callback
     https://api.tide.ai/auth/google/callback
     ```
4. (Optional) Create **iOS** client for mobile app:
   - Application type: **iOS**
   - Name: **Tide iOS**
   - Bundle ID: `com.tide.app`
5. **Copy Client IDs and Client Secret**

#### Environment Variables:
```bash
# Single OAuth for all Google services
GOOGLE_CLIENT_ID=526055709746-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
GOOGLE_IOS_CLIENT_ID=526055709746-yyyy.apps.googleusercontent.com  # Optional
```

#### Testing OAuth Flow:
```bash
# Single OAuth flow grants access to Gmail + Calendar + more
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:4000/auth/google/callback&
  response_type=code&
  scope=https://www.googleapis.com/auth/gmail.modify%20https://www.googleapis.com/auth/calendar&
  access_type=offline
```

**✅ Benefits:**
- User authorizes once for all Google services
- Single set of credentials to manage
- Can add more Google services later (Drive, Contacts, etc.)
- Better user experience

---

### 2.2 Microsoft Exchange OAuth (Outlook + Calendar) 🟡 REQUIRED

**Purpose**: Unified OAuth for all Microsoft services (Outlook, Calendar, OneDrive, etc.)

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
     http://localhost:4000/auth/microsoft/callback
     https://api.tide.ai/auth/microsoft/callback
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

### 2.3 Pinecone Vector Database 🟡 REQUIRED FOR AI SEARCH

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

# Microsoft Exchange OAuth - Unified for Outlook + Calendar (REQUIRED)
EXCHANGE_CLIENT_ID=xxxxx
EXCHANGE_CLIENT_SECRET=xxxxx
EXCHANGE_TENANT_ID=xxxxx
EXCHANGE_REDIRECT_URI=http://localhost:4000/auth/microsoft/callback

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
