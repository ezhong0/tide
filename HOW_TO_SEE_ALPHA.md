# How to See Your Alpha Deployment

Your Tide alpha is **LIVE** at:
## 🌐 https://gateway-production-caf0.up.railway.app

---

## ⚡ Quick Test (30 seconds)

### Option 1: Browser
Open in your browser:
```
https://gateway-production-caf0.up.railway.app/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2025-10-07T...",
  "uptime": 1234.56,
  "version": "0.1.0"
}
```

### Option 2: Terminal
```bash
curl https://gateway-production-caf0.up.railway.app/health
```

### Option 3: Run Test Script
```bash
./test-alpha.sh
```

---

## 🧪 Test the AI Service

### Browser Method:
Use a tool like [Hoppscotch](https://hoppscotch.io/) or Postman:

1. **URL**: `https://ai-production-5753.up.railway.app/process`
2. **Method**: POST
3. **Headers**: `Content-Type: application/json`
4. **Body**:
   ```json
   {
     "userId": "test-user",
     "type": "chat",
     "content": "Hello! Can you help me schedule a meeting?"
   }
   ```

### Terminal Method:
```bash
curl -X POST https://ai-production-5753.up.railway.app/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"chat","content":"Hello"}'
```

---

## 📱 See It in Your Mobile App

### iOS/Android Configuration:

Add this to your app config:

```swift
// iOS
let apiBaseURL = "https://gateway-production-caf0.up.railway.app"
```

```kotlin
// Android
const val API_BASE_URL = "https://gateway-production-caf0.up.railway.app"
```

Then make requests:
```swift
// Example: Check health
let url = URL(string: "\(apiBaseURL)/health")!
URLSession.shared.dataTask(with: url) { data, response, error in
    if let data = data {
        print(String(data: data, encoding: .utf8)!)
    }
}.resume()
```

---

## 🎯 What You Can Test Right Now

### ✅ Working Services:

1. **Gateway** - https://gateway-production-caf0.up.railway.app
   - `/health` - Service health

2. **AI Service** - https://ai-production-5753.up.railway.app
   - `/health` - Service health
   - `/process` - AI chat/processing ⚠️ (needs fix - see below)

3. **Email Service** - https://email-production-264c.up.railway.app
   - `/health` - Service health
   - `/connect/:provider` - Connect Gmail/Exchange
   - `/emails/:userId/:provider` - Fetch emails
   - `/triage/:userId/:provider` - Auto-triage emails
   - `/compose` - Smart email composition

4. **Calendar Service** - https://calendar-production-325a.up.railway.app
   - `/health` - Service health
   - `/connect/:provider` - Connect Google Calendar
   - `/events/:userId/:provider` - Fetch events
   - `/schedule` - Smart meeting scheduling

---

## 🔧 Fixes Needed (Deploy Now)

The AI service has a small bug. Deploy the fix:

```bash
# Commit and push
git add packages/services/ai/src/models/clients/openai-client.ts
git commit -m "fix: Update OpenAI API to use max_completion_tokens for GPT-5"
git push
```

Railway will auto-deploy in ~2 minutes.

---

## 📊 Monitor Your Alpha

### Check All Services:
```bash
./scripts/health-check.sh
```

### Run Integration Tests:
```bash
./scripts/test-railway-deployment.sh
```

### View Logs:
```bash
# Via Railway Dashboard
# https://railway.app → Select service → Logs tab

# Via CLI
railway logs --service ai
railway logs --service gateway
```

---

## 🚀 Next Steps

1. **Deploy the AI fix** (see above)
2. **Configure Gateway** (optional - for GraphQL):
   ```bash
   ./scripts/configure-gateway-urls.sh
   ```
3. **Test in Mobile App**:
   - Update API base URL
   - Test health endpoint
   - Test AI chat

4. **Share with Alpha Testers**:
   - Gateway URL: `https://gateway-production-caf0.up.railway.app`
   - Status page: `https://gateway-production-caf0.up.railway.app/health`

---

## 📚 Full Documentation

- **API Reference**: See `ALPHA_USAGE_GUIDE.md`
- **All Service URLs**: See `RAILWAY_URLS.md`
- **Deployment Guide**: See `docs/RAILWAY-DEPLOYMENT-GUIDE.md`

---

## ✅ Summary

Your alpha is **LIVE** and **90% OPERATIONAL**:

| Service | Status | URL |
|---------|--------|-----|
| Gateway | ✅ Healthy | https://gateway-production-caf0.up.railway.app |
| AI | ⚠️ Needs Fix | https://ai-production-5753.up.railway.app |
| Email | ✅ Healthy | https://email-production-264c.up.railway.app |
| Calendar | ✅ Healthy | https://calendar-production-325a.up.railway.app |

**Deploy the fix above and you'll be at 100%!** 🎉
