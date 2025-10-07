# Week 3 Alpha - Complete API Guide

This guide shows all available endpoints in the Week 3 alpha deployment.

## Base URL
```
https://gateway-production-caf0.up.railway.app
```

## 🚪 Gateway Endpoints

### Landing Page
```bash
curl https://gateway-production-caf0.up.railway.app/
```

### Health Check
```bash
curl https://gateway-production-caf0.up.railway.app/health
```

### Services List
```bash
curl https://gateway-production-caf0.up.railway.app/api/services
```

---

## 🤖 AI Service

### Health Check
```bash
curl https://gateway-production-caf0.up.railway.app/api/ai/health
```

### Process AI Request
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "email_triage",
    "input": {
      "emails": [
        {
          "id": "email1",
          "from": "boss@company.com",
          "subject": "Urgent: Project deadline",
          "content": "We need to deliver the project by Friday.",
          "timestamp": "2025-10-07T10:00:00Z"
        }
      ]
    }
  }'
```

**Supported AI Request Types:**
- `email_triage` - Prioritize and categorize emails
- `email_compose` - Draft email responses
- `calendar_schedule` - Suggest meeting times
- `task_extraction` - Extract tasks from text
- `summarization` - Summarize content

---

## 📧 Email Service

### Health Check
```bash
curl https://gateway-production-caf0.up.railway.app/api/email/health
```

### Connect Email Provider
```bash
# Connect Gmail
curl -X POST https://gateway-production-caf0.up.railway.app/api/email/connect/gmail \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "accessToken": "your-gmail-oauth-token",
    "refreshToken": "your-gmail-refresh-token"
  }'

# Connect Outlook
curl -X POST https://gateway-production-caf0.up.railway.app/api/email/connect/outlook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "accessToken": "your-outlook-oauth-token",
    "refreshToken": "your-outlook-refresh-token"
  }'
```

### Get Emails
```bash
curl "https://gateway-production-caf0.up.railway.app/api/email/emails/user123/gmail?limit=10&offset=0"
```

### Triage Emails (AI-powered)
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/email/triage \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "emails": [
      {
        "id": "email1",
        "from": "boss@company.com",
        "subject": "Urgent: Project deadline",
        "content": "We need to deliver the project by Friday.",
        "timestamp": "2025-10-07T10:00:00Z"
      }
    ]
  }'
```

### Compose Email Draft (AI-powered)
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/email/compose \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "context": "Reply to boss about project deadline",
    "tone": "professional"
  }'
```

### Send Email
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/email/send/user123/gmail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Meeting follow-up",
    "body": "Thanks for the meeting today...",
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"]
  }'
```

---

## 📅 Calendar Service

### Health Check
```bash
curl https://gateway-production-caf0.up.railway.app/api/calendar/health
```

### Connect Calendar Provider
```bash
# Connect Google Calendar
curl -X POST https://gateway-production-caf0.up.railway.app/api/calendar/connect/google \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "accessToken": "your-google-oauth-token",
    "refreshToken": "your-google-refresh-token"
  }'

# Connect Outlook Calendar
curl -X POST https://gateway-production-caf0.up.railway.app/api/calendar/connect/outlook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "accessToken": "your-outlook-oauth-token",
    "refreshToken": "your-outlook-refresh-token"
  }'
```

### Get Calendar Events
```bash
curl "https://gateway-production-caf0.up.railway.app/api/calendar/events/user123/google?startDate=2025-10-01&endDate=2025-10-31"
```

### Check Availability
```bash
curl "https://gateway-production-caf0.up.railway.app/api/calendar/availability/user123/google?startDate=2025-10-07&endDate=2025-10-14"
```

### Schedule Meeting (AI-powered)
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/calendar/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "participants": ["user456", "user789"],
    "duration": 60,
    "preferences": {
      "timeOfDay": "morning",
      "daysOfWeek": ["monday", "tuesday", "wednesday"]
    }
  }'
```

### Create Event
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/calendar/events/user123/google \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startTime": "2025-10-08T10:00:00Z",
    "endTime": "2025-10-08T11:00:00Z",
    "location": "Conference Room A",
    "attendees": ["colleague@company.com"]
  }'
```

### Delete Event
```bash
curl -X DELETE https://gateway-production-caf0.up.railway.app/api/calendar/events/user123/google/event123
```

---

## 🔄 Workflow Service

The Workflow Engine is **not configured** in Week 3 alpha (scheduled for Weeks 9-12).

```bash
curl https://gateway-production-caf0.up.railway.app/api/workflow/health
# Returns: {"status":"not_ready","message":"Workflow service not configured (Week 9-12)"}
```

---

## 🧪 Testing the Alpha

### Quick Test Script
```bash
#!/bin/bash

BASE_URL="https://gateway-production-caf0.up.railway.app"

echo "Testing Gateway..."
curl -s $BASE_URL/health | jq .

echo -e "\nTesting AI Service..."
curl -s $BASE_URL/api/ai/health | jq .

echo -e "\nTesting Email Service..."
curl -s $BASE_URL/api/email/health | jq .

echo -e "\nTesting Calendar Service..."
curl -s $BASE_URL/api/calendar/health | jq .

echo -e "\nAll services healthy!"
```

### Testing AI with Real Request
```bash
curl -X POST https://gateway-production-caf0.up.railway.app/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "type": "email_triage",
    "input": {
      "emails": [
        {
          "id": "1",
          "from": "ceo@company.com",
          "subject": "Q4 Strategy Meeting",
          "content": "Please join us for the quarterly strategy meeting next week.",
          "timestamp": "2025-10-07T09:00:00Z"
        },
        {
          "id": "2",
          "from": "newsletter@tech.com",
          "subject": "Weekly Tech News",
          "content": "Here are this week'\''s top tech stories...",
          "timestamp": "2025-10-07T08:00:00Z"
        }
      ]
    }
  }' | jq .
```

---

## 📱 Using in React Native

```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: 'https://gateway-production-caf0.up.railway.app',
  timeout: 30000,
};

// services/ai.service.ts
export class AIService {
  async processAIRequest(request: AIRequest) {
    const response = await fetch(`${API_CONFIG.baseURL}/api/ai/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}

// services/email.service.ts
export class EmailService {
  async getEmails(userId: string, provider: string) {
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/email/emails/${userId}/${provider}`,
    );
    return response.json();
  }

  async triageEmails(userId: string, emails: any[]) {
    const response = await fetch(`${API_CONFIG.baseURL}/api/email/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, emails }),
    });
    return response.json();
  }
}

// services/calendar.service.ts
export class CalendarService {
  async getEvents(userId: string, provider: string, startDate: string, endDate: string) {
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/calendar/events/${userId}/${provider}?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.json();
  }
}
```

---

## 🔐 Authentication

**Note:** The Week 3 alpha does **not include authentication**. All endpoints are currently public for testing purposes.

Authentication will be added in later weeks:
- Week 4-5: Supabase Auth integration
- Week 6-8: OAuth flows for Gmail/Outlook/Google Calendar

For now, use any `userId` string for testing (e.g., "test-user-123").

---

## ⚠️ Limitations

Current alpha limitations:
1. **No auth** - endpoints are public (do not use real data)
2. **No persistence** - email/calendar connections are in-memory only
3. **No webhooks** - real-time updates not implemented yet
4. **Mock data** - some responses may use mock data
5. **Workflow service** - not available (Week 9-12)

---

## 📊 What's Working

✅ **Gateway**: Routing and proxying to all services
✅ **AI Service**: All AI processing types (email triage, compose, scheduling)
✅ **Email Service**: Connect, fetch, triage, compose, send
✅ **Calendar Service**: Connect, fetch events, check availability, schedule meetings
✅ **Health Checks**: All services reporting healthy status

---

## 🚀 Next Steps

1. **Test the endpoints** using the examples above
2. **Integrate with mobile apps** using the React Native examples
3. **Check logs** in Railway dashboard for debugging
4. **Report issues** on GitHub

Happy testing! 🎉
