# Phase 0 Browser Setup Tasks

This document contains detailed step-by-step instructions for all tasks that need to be completed in a browser to finish Phase 0 of the Tide project.

## Table of Contents

1. [OAuth Application Setup](#oauth-application-setup)
   - [Google OAuth (Gmail & Calendar)](#1-google-oauth-gmail--calendar)
   - [Microsoft OAuth (Outlook & Calendar)](#2-microsoft-oauth-outlook--calendar)
2. [Third-Party Service Accounts](#third-party-service-accounts)
   - [OpenAI API](#3-openai-api)
   - [Deepgram Speech-to-Text](#4-deepgram-speech-to-text)
   - [Pinecone Vector Database](#5-pinecone-vector-database)
   - [Sentry Error Tracking](#6-sentry-error-tracking)
3. [Cloud Infrastructure Setup](#cloud-infrastructure-setup)
   - [Option A: Railway (Recommended for MVP)](#option-a-railway-recommended-for-mvp)
   - [Option B: AWS](#option-b-aws)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Optional Services](#optional-services)

---

## OAuth Application Setup

### 1. Google OAuth (Gmail & Calendar)

**Purpose**: Enable users to authenticate with their Google accounts to access Gmail and Google Calendar.

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project details:
   - **Project name**: `Tide AI Assistant`
   - **Organization**: (leave default or select your org)
   - **Location**: (leave default or select your org)
5. Click "Create"
6. Wait for project creation (usually takes a few seconds)

#### Step 2: Enable Required APIs

1. In the Google Cloud Console, make sure your new project is selected
2. Go to "APIs & Services" > "Library" (or navigate to [API Library](https://console.cloud.google.com/apis/library))
3. Search for and enable the following APIs:
   - **Gmail API**
     - Click on "Gmail API"
     - Click "Enable"
     - Wait for it to be enabled
   - **Google Calendar API**
     - Go back to Library
     - Click on "Google Calendar API"
     - Click "Enable"
     - Wait for it to be enabled

#### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select User Type:
   - **During Development**: Choose "Internal" if you have a Google Workspace, or "External"
   - **For Production**: Choose "External"
3. Click "Create"

4. Fill in App Information (Page 1):
   - **App name**: `Tide - AI Executive Assistant`
   - **User support email**: Your email address
   - **App logo**: (optional for now, can add later)
   - **App domain** (for External):
     - Application home page: `https://tide.app` (or your domain)
     - Application privacy policy: `https://tide.app/privacy` (will need to create this)
     - Application terms of service: `https://tide.app/terms` (will need to create this)
   - **Authorized domains**:
     - Add: `tide.app` (or your domain)
     - For local dev, you don't need to add localhost
   - **Developer contact information**: Your email address
5. Click "Save and Continue"

6. Add Scopes (Page 2):
   - Click "Add or Remove Scopes"
   - Search for and add these scopes:
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/calendar`
   - Click "Update"
   - Click "Save and Continue"

7. Test Users (Page 3 - only if External and in Testing):
   - Click "Add Users"
   - Add your email and any test users' emails
   - Click "Save and Continue"

8. Summary (Page 4):
   - Review everything
   - Click "Back to Dashboard"

#### Step 4: Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth client:
   - **Application type**: Web application
   - **Name**: `Tide API Server`
   - **Authorized JavaScript origins**: (leave empty for now)
   - **Authorized redirect URIs**:
     - Click "Add URI"
     - Add: `http://localhost:3000/auth/google/callback` (for local dev)
     - Click "Add URI"
     - Add: `https://api.tide.app/auth/google/callback` (for production - replace with your domain)
4. Click "Create"

5. **IMPORTANT**: Copy the credentials that appear:
   - **Client ID**: Looks like `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: Random string
   - Save these to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your-client-id-here
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
     ```

#### Step 5: Verify Setup

1. Keep the credentials page open for reference
2. You can download the credentials JSON if needed (click the download icon)

---

### 2. Microsoft OAuth (Outlook & Calendar)

**Purpose**: Enable users to authenticate with their Microsoft accounts to access Outlook and Microsoft Calendar.

#### Step 1: Register Application

1. Go to [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. If you don't have an account, create one (free tier is sufficient)
3. Click "New registration"
4. Fill in the application details:
   - **Name**: `Tide AI Assistant`
   - **Supported account types**:
     - Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"
   - **Redirect URI**:
     - Platform: Web
     - URI: `http://localhost:3000/auth/microsoft/callback`
5. Click "Register"

#### Step 2: Add Additional Redirect URIs

1. In your new app, go to "Authentication" in the left menu
2. Under "Platform configurations" > "Web", click "Add URI"
3. Add production redirect URI: `https://api.tide.app/auth/microsoft/callback`
4. Under "Implicit grant and hybrid flows", ensure nothing is checked
5. Click "Save" at the top

#### Step 3: Configure API Permissions

1. Go to "API permissions" in the left menu
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Search for and add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `offline_access`
   - `Mail.ReadWrite`
   - `Calendars.ReadWrite`
6. Click "Add permissions"
7. **Optional**: Click "Grant admin consent for [your organization]" (requires admin rights)
   - This step is optional but recommended to avoid users seeing consent screen

#### Step 4: Create Client Secret

1. Go to "Certificates & secrets" in the left menu
2. Under "Client secrets", click "New client secret"
3. Add description:
   - **Description**: `Tide API Server Secret`
   - **Expires**: 24 months (or longer if preferred)
4. Click "Add"
5. **IMMEDIATELY COPY THE SECRET VALUE** - it will only be shown once!
   - **Value**: Random string - this is your client secret

#### Step 5: Get Application (Client) ID

1. Go to "Overview" in the left menu
2. Copy the **Application (client) ID**
3. Copy the **Directory (tenant) ID**

#### Step 6: Save Credentials

Add these to your `.env` file:
```
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback
```

---

## Third-Party Service Accounts

### 3. OpenAI API

**Purpose**: Use GPT-5 for natural language understanding, intent detection, and text generation.

#### Step 1: Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Click "Sign up" or "Log in"
3. Create account or log in with existing credentials
4. Complete email verification if required

#### Step 2: Set Up Billing

1. Go to [Billing Settings](https://platform.openai.com/account/billing)
2. Click "Add payment method"
3. Enter credit card information
4. Set up usage limits (recommended):
   - Click "Usage limits"
   - Set a **monthly budget limit** (e.g., $100 to start)
   - Set an **email alert** at 75% and 90% of budget

#### Step 3: Create API Key

1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name:
   - **Name**: `Tide Development`
4. Click "Create secret key"
5. **IMMEDIATELY COPY THE KEY** - it will only be shown once!
   - Starts with `sk-`

#### Step 4: Get Organization ID (Optional)

1. Go to [Organization Settings](https://platform.openai.com/account/org-settings)
2. Copy your **Organization ID**

#### Step 5: Save Credentials

Add to your `.env` file:
```
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_ORGANIZATION=your-org-id-here
```

#### Monitoring Usage

- Monitor usage at: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- Check costs daily during development
- Expected cost for development: ~$10-50/month

---

### 4. Deepgram Speech-to-Text

**Purpose**: Convert voice commands to text with high accuracy.

#### Step 1: Create Deepgram Account

1. Go to [Deepgram Console](https://console.deepgram.com/signup)
2. Click "Sign up"
3. Fill in registration details:
   - Email
   - Password
   - Company name: Your name or "Personal Project"
4. Complete email verification

#### Step 2: Get Free Credits

- New accounts get **$200 in free credits**
- No credit card required initially
- Enough for ~400 hours of transcription

#### Step 3: Create API Key

1. After logging in, go to [API Keys](https://console.deepgram.com/project/default/keys)
2. Click "Create a New API Key"
3. Give it a name:
   - **Name**: `Tide Development`
   - **Expiration**: No expiration (or set expiration if preferred)
4. Click "Create Key"
5. **COPY THE KEY** - save it immediately

#### Step 4: Save Credentials

Add to your `.env` file:
```
DEEPGRAM_API_KEY=your-deepgram-api-key
```

#### Monitoring Usage

- Check usage at: [https://console.deepgram.com/project/default/usage](https://console.deepgram.com/project/default/usage)
- Monitor credit balance
- Expected usage: ~1-5 hours/day during development

---

### 5. Pinecone Vector Database

**Purpose**: Store and search email embeddings for semantic search ("What did Sarah say about the Q4 project?").

#### Step 1: Create Pinecone Account

1. Go to [Pinecone](https://www.pinecone.io/)
2. Click "Sign Up"
3. Fill in registration:
   - Email
   - Password
   - Organization name
4. Complete email verification

#### Step 2: Create a Project

1. After logging in, you'll be in the console
2. Click "Create Project" if prompted
3. Select free tier: **"Starter"** plan
   - 1 index
   - 1 million vectors free
   - Sufficient for MVP

#### Step 3: Create an Index

1. Go to "Indexes" in the left menu
2. Click "Create Index"
3. Configure index:
   - **Index name**: `tide-emails`
   - **Dimensions**: `3072` (for OpenAI's text-embedding-3-large)
   - **Metric**: `cosine`
   - **Cloud Provider**: AWS (or GCP)
   - **Region**: `us-east-1` (or closest to your users)
4. Click "Create Index"
5. Wait for index to be created (takes 1-2 minutes)

#### Step 4: Get API Key

1. Go to "API Keys" in the left menu
2. You should see a default API key already created
3. Click "Copy" to copy the API key
4. Note the **Environment** (e.g., `us-east1-gcp`)

#### Step 5: Save Credentials

Add to your `.env` file:
```
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=tide-emails
```

---

### 6. Sentry Error Tracking

**Purpose**: Monitor errors and exceptions in production.

#### Step 1: Create Sentry Account

1. Go to [Sentry](https://sentry.io/signup/)
2. Sign up with email or GitHub
3. Complete registration

#### Step 2: Create a Project

1. After logging in, click "Create Project"
2. Select platform:
   - Choose **Node.js**
3. Set alert frequency:
   - Select "Alert me on every new issue"
4. Name your project:
   - **Project name**: `tide-api`
5. Click "Create Project"

#### Step 3: Get DSN

1. After project creation, you'll see setup instructions
2. Find and copy your **DSN** (Data Source Name)
   - Looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
3. Save this for later

#### Step 4: Configure Environments

1. Go to Project Settings > Environments
2. Add environments:
   - `development`
   - `staging`
   - `production`

#### Step 5: Save Credentials

Add to your `.env` file:
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
```

---

## Cloud Infrastructure Setup

You have three options for hosting your infrastructure. Choose one based on your needs:

### Option A: Railway (Recommended for MVP)

**Best for**: Quick MVP, minimal DevOps, focus on product development

**Pros**:
- Extremely simple setup
- Automatic deployments from GitHub
- Built-in PostgreSQL and Redis
- ~$20-50/month for MVP

#### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app/)
2. Click "Login" and sign up with GitHub
3. Authorize Railway to access your GitHub account

#### Step 2: Create a New Project

1. Click "New Project"
2. Select "Provision PostgreSQL"
3. Wait for PostgreSQL to be provisioned
4. Note the connection string

#### Step 3: Add Redis

1. In your project, click "New"
2. Select "Provision Redis"
3. Wait for Redis to be provisioned
4. Note the connection string

#### Step 4: Deploy API

1. In your project, click "New"
2. Select "GitHub Repo"
3. Select your `tide` repository
4. Railway will auto-detect it's a Node.js project
5. Configure:
   - **Root Directory**: `/apps/api`
   - **Build Command**: `pnpm build`
   - **Start Command**: `pnpm start`

#### Step 5: Add Environment Variables

1. Click on your API service
2. Go to "Variables" tab
3. Add all environment variables from your `.env.example`:
   - `NODE_ENV=production`
   - `DATABASE_URL` (use the PostgreSQL connection string from Railway)
   - `REDIS_URL` (use the Redis connection string from Railway)
   - Add all OAuth credentials
   - Add all third-party API keys
   - Generate new secrets:
     - `JWT_SECRET` (generate with: `openssl rand -hex 32`)
     - `ENCRYPTION_KEY` (generate with: `openssl rand -hex 32`)

#### Step 6: Generate Domain

1. Go to "Settings" tab
2. Under "Domains", click "Generate Domain"
3. Railway will give you a domain like `tide-api-production.up.railway.app`
4. Use this as your `API_URL`

#### Step 7: Enable Automatic Deployments

1. Go to "Settings" tab
2. Under "Deploy", ensure "Auto Deploy" is enabled
3. Set branch to `main`

#### Step 8: Deploy

1. Railway will automatically deploy on push to `main`
2. Monitor deployment in the "Deployments" tab
3. Check logs for any errors

**Total Setup Time**: 20-30 minutes

---

### Option B: AWS

**Best for**: Production scale, full control, enterprise requirements

**Pros**:
- Full control and scalability
- Comprehensive service ecosystem
- Production-grade reliability

**Cons**:
- More complex setup
- Requires AWS knowledge
- Higher costs (~$100-200/month)

#### Prerequisites

1. AWS Account with billing enabled
2. AWS CLI installed locally
3. Basic knowledge of AWS services

#### Step 1: Set Up RDS PostgreSQL

1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Click "Create database"
3. Configuration:
   - **Engine**: PostgreSQL
   - **Version**: PostgreSQL 16.x
   - **Template**: Free tier (for testing) or Production
   - **DB instance identifier**: `tide-postgres`
   - **Master username**: `tide`
   - **Master password**: (generate strong password)
   - **DB instance class**: db.t3.micro (free tier) or db.t3.medium (production)
   - **Storage**: 20 GB (can auto-scale)
   - **VPC**: Default VPC
   - **Public access**: Yes (for development; No for production with VPN)
   - **VPC security group**: Create new (allow port 5432 from your IP)
4. Click "Create database"
5. Wait 5-10 minutes for creation
6. Copy the endpoint URL

#### Step 2: Set Up ElastiCache Redis

1. Go to [ElastiCache Console](https://console.aws.amazon.com/elasticache/)
2. Click "Create"
3. Choose "Redis"
4. Configuration:
   - **Cluster mode**: Disabled
   - **Name**: `tide-redis`
   - **Node type**: cache.t3.micro (free tier) or cache.t3.medium
   - **Number of replicas**: 0 (for testing) or 1-2 (production)
   - **Subnet group**: Default
   - **VPC**: Same as RDS
   - **Security group**: Allow port 6379 from your app
5. Click "Create"
6. Copy the endpoint URL

#### Step 3: Set Up S3 Bucket

1. Go to [S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Configuration:
   - **Bucket name**: `tide-email-archives` (must be globally unique)
   - **Region**: us-east-1 (or your preferred region)
   - **Block Public Access**: Keep all enabled
   - **Versioning**: Disabled (enable for production if needed)
   - **Encryption**: Enable with AWS KMS
4. Click "Create bucket"

#### Step 4: Set Up IAM User for API Access

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" > "Add user"
3. Configuration:
   - **User name**: `tide-api`
   - **Access type**: Programmatic access
4. Click "Next: Permissions"
5. Attach policies:
   - `AmazonS3FullAccess` (or create custom policy for your bucket)
   - `AmazonSQSFullAccess` (if using SQS)
6. Click through to create
7. **SAVE THE ACCESS KEY AND SECRET** immediately

#### Step 5: Deploy API to ECS (Optional - Advanced)

This is more complex and optional. For MVP, you can:
- Use Railway for the API
- Use AWS only for PostgreSQL, Redis, and S3
- Or use EC2 with a simple setup script

If you want full ECS setup, follow [AWS ECS Deployment Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started.html).

#### Step 6: Save Credentials

Add to your `.env` file:
```
DATABASE_URL=postgresql://tide:password@tide-postgres.xxxxx.us-east-1.rds.amazonaws.com:5432/tide
REDIS_URL=redis://tide-redis.xxxxx.cache.amazonaws.com:6379
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=tide-email-archives
```

**Total Setup Time**: 2-4 hours (for first time)

---

## Environment Variables Configuration

After completing all the above steps, your `.env` file should look like this:

```bash
# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
WEB_URL=http://localhost:3001

# Database (from Railway or AWS RDS)
DATABASE_URL=postgresql://user:password@host:5432/tide_dev

# Redis (from Railway or AWS ElastiCache)
REDIS_URL=redis://host:6379

# JWT Authentication (generate these)
JWT_SECRET=your-generated-jwt-secret-32-bytes
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OAuth - Google
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# OAuth - Microsoft
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ORGANIZATION=your-org-id

# Deepgram Speech-to-Text
DEEPGRAM_API_KEY=your-deepgram-api-key

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=tide-emails

# AWS (if using AWS)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=tide-email-archives

# Sentry Error Tracking
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=development

# Encryption (generate this)
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:8081
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
LOG_PRETTY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Secrets

Run these commands to generate secure secrets:

```bash
# JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## Optional Services

These are optional and can be added later:

### DataDog / Axiom (Logging & Monitoring)

1. **DataDog**: [datadog.com](https://www.datadoghq.com/)
   - Create account
   - Get API key
   - Add: `DATADOG_API_KEY=your-key`

2. **Axiom**: [axiom.co](https://axiom.co/)
   - Simpler alternative to DataDog
   - Better for small teams
   - Create account and get API key

### BetterStack (Uptime Monitoring)

1. Go to [BetterStack](https://betterstack.com/)
2. Create account
3. Add your API endpoints for monitoring
4. Set up alerts

---

## Verification Checklist

After completing all tasks, verify:

- [ ] Google OAuth works (test with `/auth/google`)
- [ ] Microsoft OAuth works (test with `/auth/microsoft`)
- [ ] OpenAI API responds (test with a simple completion)
- [ ] Deepgram STT works (test with a sample audio file)
- [ ] Pinecone index is ready (check console)
- [ ] Sentry receives test errors
- [ ] Database is accessible (run `pnpm db:migrate`)
- [ ] Redis is accessible (check connection)
- [ ] All environment variables are set
- [ ] API starts without errors (`pnpm dev:api`)
- [ ] API docs are accessible at `http://localhost:3000/docs`

---

## Next Steps

Once all browser tasks are complete:

1. **Test the API**:
   ```bash
   # Install dependencies
   pnpm install

   # Start database
   docker-compose up -d

   # Run migrations
   pnpm db:migrate

   # Seed database
   pnpm db:seed

   # Start API
   pnpm dev:api
   ```

2. **Test OAuth flows**:
   - Visit `http://localhost:3000/auth/google`
   - Visit `http://localhost:3000/auth/microsoft`

3. **Check API docs**:
   - Visit `http://localhost:3000/docs`

4. **Run tests**:
   ```bash
   pnpm test
   ```

5. **Move to Phase 1**: Email & Calendar Integration

---

## Estimated Time

| Task | Time |
|------|------|
| Google OAuth setup | 15-20 min |
| Microsoft OAuth setup | 15-20 min |
| OpenAI setup | 5-10 min |
| Deepgram setup | 5-10 min |
| Pinecone setup | 10-15 min |
| Sentry setup | 10-15 min |
| Railway setup | 20-30 min |
| Environment variables | 10-15 min |
| **Total** | **1.5-2.5 hours** |

---

## Support Resources

- **Google OAuth**: [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- **Microsoft OAuth**: [Microsoft Identity Platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
- **OpenAI**: [OpenAI API Documentation](https://platform.openai.com/docs)
- **Deepgram**: [Deepgram Documentation](https://developers.deepgram.com/)
- **Pinecone**: [Pinecone Documentation](https://docs.pinecone.io/)
- **Railway**: [Railway Documentation](https://docs.railway.app/)

---

## Troubleshooting

### Google OAuth Error: redirect_uri_mismatch
- Ensure redirect URI in Google Console exactly matches your `.env` file
- Check for trailing slashes
- Verify you're using the correct project in Google Console

### Microsoft OAuth Error: AADSTS50011
- Ensure redirect URI is added in Azure Portal under "Authentication"
- Wait 5-10 minutes after adding URI for changes to propagate

### OpenAI API Error: Insufficient Quota
- Add payment method to your OpenAI account
- Set up usage limits to avoid unexpected charges

### Deepgram Error: Invalid API Key
- Verify you copied the entire API key
- Check for extra spaces or line breaks

### Pinecone Connection Error
- Verify environment name matches (e.g., `us-east1-gcp`)
- Ensure index dimensions are 3072 for OpenAI embeddings

### Railway Deployment Fails
- Check build logs in Railway dashboard
- Verify all environment variables are set
- Ensure `package.json` scripts are correct

---

**Phase 0 Complete!** 🎉

Once all these tasks are done, Phase 0 (Foundation) is complete and you're ready to move to Phase 1 (Email & Calendar Integration).
