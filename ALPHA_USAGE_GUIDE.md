# Alpha Deployment Usage Guide

**Environment**: Production (Railway)
**Gateway URL**: https://gateway-production-caf0.up.railway.app
**Status**: ✅ Live and operational

---

## 🚀 Quick Start

Your alpha deployment is live! Here's how to actually use it.

---

## 📡 Available API Endpoints

### 🧠 AI Service

**Base URL**: `https://ai-production-5753.up.railway.app`

#### 1. Health Check
```bash
curl https://ai-production-5753.up.railway.app/health
```

#### 2. Process AI Request
```bash
curl -X POST https://ai-production-5753.up.railway.app/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "type": "chat",
    "content": "What is the weather today?",
    "context": {
      "conversationId": "conv-1"
    }
  }'
```

**Response**:
```json
{
  "response": "I'll help you with that...",
  "confidence": 0.95,
  "processingTime": 234
}
```

---

### 📧 Email Service

**Base URL**: `https://email-production-264c.up.railway.app`

#### 1. Connect Gmail
```bash
curl -X POST https://email-production-264c.up.railway.app/connect/gmail \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "tokens": {
      "accessToken": "ya29.a0...",
      "refreshToken": "1//0g...",
      "expiresAt": 1234567890
    }
  }'
```

#### 2. Fetch Emails
```bash
curl https://email-production-264c.up.railway.app/emails/user-123/gmail?limit=20&unreadOnly=true
```

#### 3. Triage Emails
```bash
curl -X POST https://email-production-264c.up.railway.app/triage/user-123/gmail
```

#### 4. Compose Smart Reply
```bash
curl -X POST https://email-production-264c.up.railway.app/compose \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "context": "Reply to meeting request",
    "tone": "professional",
    "length": "medium"
  }'
```

---

### 📅 Calendar Service

**Base URL**: `https://calendar-production-325a.up.railway.app`

#### 1. Connect Google Calendar
```bash
curl -X POST https://calendar-production-325a.up.railway.app/connect/google \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "tokens": {
      "accessToken": "ya29.a0...",
      "refreshToken": "1//0g...",
      "expiresAt": 1234567890
    }
  }'
```

#### 2. Fetch Events
```bash
curl "https://calendar-production-325a.up.railway.app/events/user-123/google?start=2025-10-01&end=2025-10-31"
```

#### 3. Schedule Smart Meeting
```bash
curl -X POST https://calendar-production-325a.up.railway.app/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Team Sync",
    "duration": 30,
    "attendees": ["alice@example.com", "bob@example.com"],
    "preferences": {
      "preferredTimes": ["morning"],
      "buffer": 15
    }
  }'
```

---

### 🌐 Gateway (GraphQL)

**Base URL**: `https://gateway-production-caf0.up.railway.app`

**Note**: GraphQL currently returns 503 because backend service URLs need to be configured. See "Configuration Needed" section below.

---

## 🧪 Testing with Different Tools

### Using cURL (Terminal)

```bash
# Test AI service
curl -X POST https://ai-production-5753.up.railway.app/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"chat","content":"Hello"}'
```

### Using Postman

1. Create new request
2. Method: `POST`
3. URL: `https://ai-production-5753.up.railway.app/process`
4. Headers:
   - `Content-Type: application/json`
5. Body (raw JSON):
   ```json
   {
     "userId": "test-user",
     "type": "chat",
     "content": "What can you help me with?"
   }
   ```

### Using JavaScript/Fetch

```javascript
// Test AI service
const response = await fetch('https://ai-production-5753.up.railway.app/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'test-user',
    type: 'chat',
    content: 'Hello, can you help me?',
  }),
});

const data = await response.json();
console.log(data);
```

---

## 📱 Mobile App Integration

### iOS (Swift)

```swift
let url = URL(string: "https://gateway-production-caf0.up.railway.app")!
let aiEndpoint = URL(string: "https://ai-production-5753.up.railway.app/process")!

var request = URLRequest(url: aiEndpoint)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body = [
    "userId": "user-123",
    "type": "chat",
    "content": "Hello"
]

request.httpBody = try? JSONSerialization.data(withJSONObject: body)

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data {
        let json = try? JSONSerialization.jsonObject(with: data)
        print(json)
    }
}
task.resume()
```

### Android (Kotlin)

```kotlin
val client = OkHttpClient()
val mediaType = "application/json".toMediaType()

val json = """
{
  "userId": "user-123",
  "type": "chat",
  "content": "Hello"
}
""".trimIndent()

val request = Request.Builder()
    .url("https://ai-production-5753.up.railway.app/process")
    .post(json.toRequestBody(mediaType))
    .build()

client.newCall(request).enqueue(object : Callback {
    override fun onResponse(call: Call, response: Response) {
        println(response.body?.string())
    }
})
```

---

## ⚙️ Configuration Needed

### Gateway Service URLs

The GraphQL gateway needs to know where backend services are. Configure these in Railway:

**Via Railway Dashboard**:
1. Go to https://railway.app → `gateway` service
2. Variables tab → Add:
   ```
   AI_SERVICE_URL=https://ai-production-5753.up.railway.app
   EMAIL_SERVICE_URL=https://email-production-264c.up.railway.app
   CALENDAR_SERVICE_URL=https://calendar-production-325a.up.railway.app
   WORKFLOW_SERVICE_URL=https://workflow-production-a5d2.up.railway.app
   ```

**Via CLI**:
```bash
./scripts/configure-gateway-urls.sh
railway restart --service gateway
```

---

## 🔐 Authentication Flow

Your services currently don't require authentication for testing. For production:

1. **Sign up/Login via Supabase**:
   - Users authenticate via Supabase Auth
   - Get JWT token

2. **Use JWT in requests**:
   ```bash
   curl -X POST https://ai-production-5753.up.railway.app/process \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"userId":"user-123","type":"chat","content":"Hello"}'
   ```

---

## 📊 Monitoring Your Alpha

### Check Service Health
```bash
./scripts/health-check.sh
```

### Run Full Integration Test
```bash
./scripts/test-railway-deployment.sh
```

### View Logs
```bash
# Via Railway CLI
railway logs --service ai
railway logs --service email
railway logs --service calendar
railway logs --service gateway

# Via Railway Dashboard
# Go to https://railway.app → Select service → "Logs" tab
```

---

## 🎯 Example User Flows

### Flow 1: AI Chat Assistant

```bash
# 1. Send a message
curl -X POST https://ai-production-5753.up.railway.app/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "type": "chat",
    "content": "Schedule a meeting with Bob tomorrow at 2pm"
  }'

# Response will indicate AI understanding and actions to take
```

### Flow 2: Email Triage

```bash
# 1. Connect Gmail (requires real OAuth tokens)
curl -X POST https://email-production-264c.up.railway.app/connect/gmail \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","tokens":{...}}'

# 2. Fetch unread emails
curl "https://email-production-264c.up.railway.app/emails/alice/gmail?unreadOnly=true"

# 3. Triage them
curl -X POST https://email-production-264c.up.railway.app/triage/alice/gmail
```

### Flow 3: Smart Scheduling

```bash
# 1. Connect Google Calendar
curl -X POST https://calendar-production-325a.up.railway.app/connect/google \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","tokens":{...}}'

# 2. Find smart meeting time
curl -X POST https://calendar-production-325a.up.railway.app/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "title": "Weekly Sync",
    "duration": 30,
    "attendees": ["bob@example.com"]
  }'
```

---

## 🐛 Troubleshooting

### Service Returns 404
- Endpoint doesn't exist yet (being built in later weeks)
- Check available endpoints in this guide

### Service Returns 500
- Check logs: `railway logs --service <name>`
- Verify request format matches examples above

### CORS Errors
- All services have CORS enabled with `Access-Control-Allow-Origin: *`
- If still seeing errors, check browser console for details

### Authentication Errors
- For alpha testing, auth is mostly optional
- For OAuth flows (Gmail, Google Calendar), you need real tokens

---

## 📞 Getting OAuth Tokens for Testing

### Gmail/Google Calendar

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Get authorization code
4. Exchange for tokens
5. Use in API calls

**Quick Test (No OAuth)**:
```bash
# Test with mock data (services will return errors for OAuth operations)
curl -X POST https://email-production-264c.up.railway.app/compose \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "context": "Reply to meeting request",
    "tone": "professional"
  }'
```

---

## ✅ What's Working Right Now

- ✅ AI Service `/process` endpoint
- ✅ Email Service `/connect`, `/emails`, `/triage`, `/compose` endpoints
- ✅ Calendar Service `/connect`, `/events`, `/schedule` endpoints
- ✅ All health checks
- ✅ CORS for browser requests
- ⚠️ GraphQL Gateway (needs service URL configuration)

---

## 🚧 What's Coming in Later Weeks

- Week 4-6: Realtime updates, WebSockets
- Week 7-8: Advanced AI features
- Week 9-12: Workflow automation
- Week 13+: Production hardening

---

## 🎉 You're Ready!

Your alpha is **live and operational**. Start testing with:

```bash
# Quick test
curl -X POST https://ai-production-5753.up.railway.app/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"chat","content":"Hello!"}'
```

For mobile apps, use the gateway URL as your base URL:
```
https://gateway-production-caf0.up.railway.app
```

---

**Questions?** Check logs or run health checks:
```bash
./scripts/health-check.sh
./scripts/test-railway-deployment.sh
```
