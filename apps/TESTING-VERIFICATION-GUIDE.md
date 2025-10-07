# ✅ Testing & Verification Guide - Alpha Integration

**Purpose:** Comprehensive testing checklist to verify 100% Alpha Integration readiness

**Time Required:** 30-45 minutes for complete testing

---

## 🎯 Test Prerequisites

Before starting tests, ensure:

- [ ] Docker Desktop running
- [ ] PostgreSQL healthy
- [ ] Redis healthy
- [ ] Auth service running (port 4001)
- [ ] WebSocket service running (port 4002)
- [ ] iOS app builds successfully
- [ ] Android app builds successfully

**If any are missing, see: `EXTERNAL-SETUP-GUIDE.md`**

---

## Test Suite 1: Backend Services (5 minutes)

### 1.1 Auth Service Health Check

```bash
curl http://localhost:4001/health
```

**✅ Expected:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-10-07T...",
  "uptime": 123.45,
  "version": "0.1.0"
}
```

---

### 1.2 WebSocket Service Health Check

```bash
curl http://localhost:4002/health
```

**✅ Expected:**
```json
{
  "status": "healthy",
  "service": "realtime-service",
  "timestamp": "2025-10-07T...",
  "uptime": 89.12,
  "version": "0.1.0",
  "websocket": {
    "enabled": true,
    "path": "/realtime"
  }
}
```

---

### 1.3 User Registration

```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-backend@tide.ai",
    "password": "TestPass123!",
    "name": "Backend Tester"
  }'
```

**✅ Expected:**
- HTTP 201 Created
- Response includes: `user`, `accessToken`, `refreshToken`
- `accessToken` starts with `eyJ`

**📝 Save the accessToken for next test!**

---

### 1.4 User Login

```bash
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-backend@tide.ai",
    "password": "TestPass123!"
  }'
```

**✅ Expected:**
- HTTP 200 OK
- Response includes: `user`, `accessToken`, `refreshToken`
- User email matches registered email

---

### 1.5 WebSocket Connection

**Using wscat:**

```bash
# Install if needed
npm install -g wscat

# Connect (use token from 1.3 or 1.4)
wscat -c "ws://localhost:4002/realtime?token=YOUR_ACCESS_TOKEN"
```

**✅ Expected:**
```json
< {"type":"connected","payload":{"connectionId":"...","userId":"...","message":"Connected to Tide real-time service"},"timestamp":"..."}
```

**Test message:**
```json
> {"type":"ping"}
< {"type":"pong","payload":{"timestamp":"..."},"timestamp":"..."}

> {"type":"message","messageId":"test_1","payload":{"conversationId":"conv_test","content":"Hello"}}
< {"type":"message_ack","messageId":"test_1","payload":{"messageId":"msg_...","status":"delivered"},"timestamp":"..."}
< {"type":"message","payload":{"conversationId":"conv_test","messageId":"msg_...","content":"Hello","role":"user","status":"sent","timestamp":"..."},"timestamp":"..."}
< {"type":"message","payload":{"conversationId":"conv_test","messageId":"msg_...","content":"AI received: \"Hello\". Processing...","role":"assistant","status":"sent","timestamp":"..."},"timestamp":"..."}
```

---

## Test Suite 2: iOS App (10-15 minutes)

### 2.1 App Launch

1. Open Xcode project
2. Select simulator (iPhone 15 Pro)
3. Press Cmd+R to build and run

**✅ Expected:**
- App builds without errors
- App launches in simulator
- Shows authentication screen (or chat if already logged in)

---

### 2.2 User Registration Flow

1. Navigate to Register screen
2. Enter:
   - Name: `iOS Test User`
   - Email: `ios-test@tide.ai`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
3. Tap "Register"

**✅ Expected:**
- Loading indicator appears
- Registration succeeds
- Navigates to chat screen
- **Check Terminal 1 (Auth Service):** See "User registered successfully"
- **Check Terminal 2 (WebSocket):** See "WebSocket connected"

---

### 2.3 Message Sending (WebSocket)

1. In chat screen, type: "Hello from iOS!"
2. Send message

**✅ Expected:**
- User message appears immediately
- Shows "Processing..." or typing indicator
- AI response appears within 1-2 seconds
- Message content: "AI received: \"Hello from iOS!\". Processing..."
- **Check Terminal 2:** See "Message received: message"

---

### 2.4 Multiple Messages

Send these messages in sequence:
1. "Schedule a meeting tomorrow"
2. "Check my email"
3. "Create a task"

**✅ Expected:**
- All messages sent successfully
- All get AI responses
- Each response is contextually appropriate:
  - Meeting: mentions scheduling
  - Email: mentions email handling
  - Task: mentions task creation
- Messages persist (verify by scrolling)

---

### 2.5 Data Persistence

1. Send message: "Test persistence"
2. Wait for AI response
3. **Force quit** the app (swipe up in simulator)
4. **Relaunch** the app

**✅ Expected:**
- All previous messages still visible
- Conversation history preserved
- No data loss

---

### 2.6 WebSocket Reconnection

1. In chat screen, send: "Test reconnection"
2. **Stop WebSocket service** (Ctrl+C in Terminal 2)
3. Try sending: "I am offline"
4. Wait 5 seconds
5. **Restart WebSocket service:** `pnpm dev`
6. Send: "I am back online"

**✅ Expected:**
- After stopping service: Connection status shows "Disconnected" (if UI added)
- "I am offline" uses simulated response
- After restarting service: Automatically reconnects
- "I am back online" goes via WebSocket with AI simulation response

---

### 2.7 Logout

1. Navigate to settings/profile
2. Tap "Logout"

**✅ Expected:**
- Returns to authentication screen
- **Check Terminal 2:** See "WebSocket disconnected" or connection closed
- Clears user session

---

## Test Suite 3: Android App (10-15 minutes)

### 3.1 App Launch

1. Open Android Studio
2. Wait for Gradle sync
3. Start emulator
4. Click Run button (Shift+F10)

**✅ Expected:**
- Gradle sync succeeds
- App builds without errors
- App installs and launches on emulator
- Shows authentication screen

---

### 3.2 User Registration Flow

1. Navigate to Register screen
2. Enter:
   - Name: `Android Test User`
   - Email: `android-test@tide.ai`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
3. Tap "Register"

**✅ Expected:**
- Loading indicator appears
- Registration succeeds
- Navigates to chat screen
- **Check Terminal 1:** See "User registered successfully"
- **Check Terminal 2:** See "WebSocket connected"

---

### 3.3 Message Sending (WebSocket)

1. In chat screen, type: "Hello from Android!"
2. Send message

**✅ Expected:**
- User message appears immediately
- Processing indicator visible
- AI response appears within 1-2 seconds
- **Check Terminal 2:** See "Message received: message"

---

### 3.4 Multiple Messages

Send these messages:
1. "Help me with my calendar"
2. "Send an email"
3. "What can you do?"

**✅ Expected:**
- All messages sent successfully
- All get contextual AI responses
- UI remains responsive
- No crashes or freezes

---

### 3.5 Data Persistence

1. Send message: "Android persistence test"
2. Wait for AI response
3. **Force stop** app (swipe up to close)
4. **Reopen** app from app drawer

**✅ Expected:**
- All previous messages visible
- Conversation restored
- No data loss

---

### 3.6 WebSocket Reconnection

1. Send message: "Test Android reconnection"
2. **Stop WebSocket service** (Ctrl+C in Terminal 2)
3. Wait 10 seconds
4. Try sending: "Offline message"
5. **Restart WebSocket service**
6. Send: "Back online"

**✅ Expected:**
- After stopping: Connection status updates
- "Offline message" uses fallback
- After restart: Auto-reconnects within 2-5 seconds
- "Back online" via WebSocket

---

### 3.7 Logout

1. Open menu/settings
2. Tap "Logout"

**✅ Expected:**
- Returns to login screen
- WebSocket disconnects
- Session cleared

---

## Test Suite 4: End-to-End Integration (5-10 minutes)

### 4.1 Cross-Platform User Management

**Register on iOS:**
1. Register: `cross-platform@tide.ai`

**Login on Android:**
1. Login with same credentials

**✅ Expected:**
- Login succeeds
- Same user ID
- Can access from both platforms

---

### 4.2 Concurrent Connections

**Both iOS and Android running:**

1. Send message from iOS: "From iOS"
2. Send message from Android: "From Android"
3. Verify both appear in each platform

**✅ Expected:**
- Both messages sent successfully
- Each gets AI response
- Services handle concurrent connections

---

### 4.3 Service Restart

**With both apps connected:**

1. **Stop WebSocket service**
2. Wait 10 seconds
3. **Restart WebSocket service**

**✅ Expected:**
- Both apps show disconnected
- Both auto-reconnect after service restart
- Both can send messages again

---

### 4.4 High Load

**Send 10 messages rapidly from one app:**

```
Message 1
Message 2
Message 3
...
Message 10
```

**✅ Expected:**
- All messages sent
- All get responses (may take time)
- No crashes
- Messages in correct order
- **Check Terminal 2:** See all 10 messages processed

---

## Test Suite 5: Error Scenarios (5 minutes)

### 5.1 Invalid Credentials

```bash
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }'
```

**✅ Expected:**
- HTTP 401 Unauthorized
- Error message: "Invalid credentials" or similar

---

### 5.2 Expired Token

**Connect with old/invalid token:**

```bash
wscat -c "ws://localhost:4002/realtime?token=invalid_token_here"
```

**✅ Expected:**
- Connection rejected
- Error message: "Authentication failed"
- Connection closes with code 1008

---

### 5.3 Service Down

1. **Stop Auth service** (Ctrl+C in Terminal 1)
2. Try to register/login in app

**✅ Expected:**
- Shows error message
- "Connection refused" or "Service unavailable"
- App doesn't crash

**Restart service:** `pnpm dev`

---

### 5.4 Database Down

1. **Stop PostgreSQL:**
   ```bash
   docker compose stop postgres
   ```
2. Try to register

**✅ Expected:**
- Service returns error
- Error logged in Terminal 1
- No crash

**Restart PostgreSQL:**
```bash
docker compose start postgres
sleep 10  # Wait for it to be ready
```

---

## 📊 Test Results Summary

**After completing all tests, fill out:**

| Test Suite | Tests | Passed | Failed | Notes |
|------------|-------|--------|--------|-------|
| 1. Backend Services | 5 | ___ | ___ | |
| 2. iOS App | 7 | ___ | ___ | |
| 3. Android App | 7 | ___ | ___ | |
| 4. End-to-End | 4 | ___ | ___ | |
| 5. Error Scenarios | 4 | ___ | ___ | |
| **TOTAL** | **27** | ___ | ___ | |

**Success Criteria:** ≥ 24/27 tests passing (89%)

**Alpha Integration Ready:** ≥ 26/27 tests passing (96%)

---

## 🐛 Common Issues & Solutions

### "Cannot connect to WebSocket"

**Solution:**
- Check service is running: `curl http://localhost:4002/health`
- Check token is valid (not expired)
- Android emulator: Uses `10.0.2.2` not `localhost`

### "Messages not appearing"

**Solution:**
- Check TideCore integration completed
- Check WebSocket message handler implemented
- Check Terminal 2 for incoming messages

### "App crashes on send"

**Solution:**
- Check TideCore.sendMessage() implementation
- Check conversation exists
- Check Xcode/Android Studio logs for error

### "No AI responses"

**Solution:**
- Check WebSocket service message-handler.ts
- Check AI simulation logic
- Verify message format matches expected payload

---

## ✅ Final Verification Checklist

**Before declaring 100% complete:**

### Infrastructure
- [ ] Docker Desktop running smoothly
- [ ] PostgreSQL container healthy
- [ ] Redis container healthy
- [ ] Auth service stable (no crashes)
- [ ] WebSocket service stable (no crashes)

### Backend Services
- [ ] Can register new users
- [ ] Can login existing users
- [ ] JWT tokens generated correctly
- [ ] Tokens stored in database
- [ ] WebSocket authentication works
- [ ] Health checks return healthy

### iOS App
- [ ] Builds without errors
- [ ] Registration flow works
- [ ] Login flow works
- [ ] WebSocket connects automatically after auth
- [ ] Can send messages via WebSocket
- [ ] Receives AI responses
- [ ] Messages persist across restarts
- [ ] Auto-reconnection works
- [ ] Logout disconnects WebSocket

### Android App
- [ ] Gradle sync succeeds
- [ ] Builds without errors
- [ ] Registration flow works
- [ ] Login flow works
- [ ] WebSocket connects after auth
- [ ] Can send messages via WebSocket
- [ ] Receives AI responses
- [ ] Messages persist across restarts
- [ ] Auto-reconnection works
- [ ] Logout disconnects WebSocket

### Integration
- [ ] iOS and Android can use same backend
- [ ] Multiple concurrent connections work
- [ ] Services handle load (10+ rapid messages)
- [ ] Error handling works (no crashes)
- [ ] Service restart recovery works

---

## 🎉 Success Criteria Met

**100% Alpha Integration Ready when:**

✅ All 5 test suites pass with ≥96% success rate
✅ No critical bugs (crashes, data loss)
✅ WebSocket real-time messaging works
✅ Authentication end-to-end functional
✅ Data persistence works reliably
✅ Both iOS and Android fully functional

---

## 📝 Testing Notes Template

**Date Tested:** _______________
**Tester:** _______________
**Environment:**
- Docker: ☐ Running
- Auth: ☐ Healthy
- WebSocket: ☐ Healthy

**Overall Status:** ☐ PASS  ☐ FAIL
**Issues Found:** _______________
**Next Steps:** _______________

---

**Testing Guide Version:** 1.0
**Last Updated:** October 7, 2025
**Status:** Ready for Alpha Integration Testing
