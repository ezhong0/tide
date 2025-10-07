# 🚀 Quick Start - Auth & WebSocket Services

**Purpose:** Get the Auth and WebSocket services running for mobile app integration

**Time Required:** 15-20 minutes

---

## Prerequisites

```bash
# 1. Ensure you're in the project root
cd /Users/edwardzhong/Projects/tide

# 2. Dependencies should already be installed
# If not, run: pnpm install

# 3. Docker should be running (for PostgreSQL, Redis, Kafka)
# Start Docker Desktop if not running
```

---

## Step 1: Start Infrastructure (5 min)

### Option A: With Docker (Recommended)

```bash
# Start PostgreSQL, Redis, and Kafka
docker compose up -d postgres redis

# Wait for services to be healthy
sleep 15

# Check status
docker compose ps
```

### Option B: Without Docker (Development Only)

If Docker isn't available, you can run services with in-memory/mock backends for development:

```bash
# Skip this step for now and run services directly
# They'll fail to connect to DB but you can test the WebSocket functionality
```

---

## Step 2: Run Database Migrations (2 min)

```bash
# Run migrations to create tables
./scripts/db-migrate.sh

# Or manually:
cd packages/libraries/database
psql postgresql://tide:tide_password@localhost:5432/tide < migrations/001_initial_schema.sql
# ... run all migration files in order
```

---

## Step 3: Start Auth Service (1 min)

```bash
# Terminal 1
cd packages/services/auth
pnpm dev

# You should see:
# ✅ Auth service started on port 4001
```

**Test it:**
```bash
# In another terminal
curl http://localhost:4001/health

# Expected response:
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-10-07T...",
  "uptime": 5.23,
  "version": "0.1.0"
}
```

---

## Step 4: Start WebSocket Service (1 min)

```bash
# Terminal 2
cd packages/services/realtime
pnpm dev

# You should see:
# ✅ Realtime service started on port 4002
# ✅ WebSocket path: /realtime
```

**Test it:**
```bash
# In another terminal
curl http://localhost:4002/health

# Expected response:
{
  "status": "healthy",
  "service": "realtime-service",
  "timestamp": "2025-10-07T...",
  "uptime": 3.45,
  "version": "0.1.0",
  "websocket": {
    "enabled": true,
    "path": "/realtime"
  }
}
```

---

## Step 5: Test End-to-End Flow (5-10 min)

### 5.1 Register a User

```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tide.ai",
    "password": "TestPass123!",
    "name": "Test User",
    "timezone": "UTC"
  }'

# Expected response:
{
  "user": {
    "id": "user_xxx",
    "email": "test@tide.ai",
    "name": "Test User",
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Copy the accessToken** for next step!

### 5.2 Test WebSocket Connection

#### Option A: Using wscat (Install first)

```bash
# Install wscat globally
npm install -g wscat

# Connect (replace YOUR_ACCESS_TOKEN)
wscat -c "ws://localhost:4002/realtime?token=YOUR_ACCESS_TOKEN"

# You should see connection established
< {"type":"connected","payload":{"connectionId":"...","userId":"user_xxx","message":"Connected to Tide real-time service"},"timestamp":"..."}

# Send a ping
> {"type":"ping"}

# Receive pong
< {"type":"pong","payload":{"timestamp":"..."},"timestamp":"..."}

# Send a chat message
> {"type":"message","messageId":"test_123","payload":{"conversationId":"conv_test","content":"Hello, world!"}}

# You'll receive:
# 1. Acknowledgment
< {"type":"message_ack","messageId":"test_123","payload":{"messageId":"msg_...","status":"delivered"}}

# 2. Echo of your message
< {"type":"message","payload":{"conversationId":"conv_test","messageId":"msg_...","content":"Hello, world!","role":"user","status":"sent","timestamp":"..."}}

# 3. AI response (after 1 second)
< {"type":"message","payload":{"conversationId":"conv_test","messageId":"msg_...","content":"AI received: \"Hello, world!\". Processing...","role":"assistant","status":"sent","timestamp":"..."}}
```

#### Option B: Using Web Browser Console

```javascript
// Open browser console (Chrome DevTools)
const token = "YOUR_ACCESS_TOKEN"; // From step 5.1
const ws = new WebSocket(`ws://localhost:4002/realtime?token=${token}`);

ws.onopen = () => console.log("Connected!");
ws.onmessage = (event) => console.log("Received:", JSON.parse(event.data));

// Send a message
ws.send(JSON.stringify({
  type: "message",
  messageId: "test_123",
  payload: {
    conversationId: "conv_test",
    content: "Hello from browser!"
  }
}));
```

---

## Step 6: Test from Mobile Apps

### iOS Simulator

1. **Open Xcode project:**
   ```bash
   open apps/mobile-ios/TideIOS.xcodeproj
   ```

2. **Update WebSocketManager.swift** base URL if needed:
   ```swift
   // Change to:
   init(baseURL: String = "ws://localhost:4002") // For simulator
   ```

3. **Run the app** in simulator

4. **In your code, connect to WebSocket:**
   ```swift
   // After user logs in and gets token
   let ws = WebSocketManager.shared
   ws.connect(token: accessToken)

   // Listen for messages
   ws.onMessageReceived = { message in
       print("Received message: \(message)")
   }

   // Send a message
   ws.sendChatMessage(
       conversationId: "conv_123",
       content: "Hello from iOS!"
   )
   ```

### Android Emulator

1. **Open Android Studio:**
   ```bash
   open -a "Android Studio" apps/mobile-android
   ```

2. **WebSocketManager.kt** already uses `ws://10.0.2.2:4002` (emulator localhost)

3. **Run the app** in emulator

4. **In your code, connect to WebSocket:**
   ```kotlin
   // After user logs in and gets token
   val ws = WebSocketManager.getInstance()
   ws.connect(token = accessToken)

   // Listen for messages
   ws.onMessageReceived = { message ->
       Log.d("WebSocket", "Received: $message")
   }

   // Send a message
   ws.sendChatMessage(
       conversationId = "conv_123",
       content = "Hello from Android!"
   )
   ```

---

## 🎉 Success Checklist

- [ ] Auth service running on port 4001
- [ ] Auth service health check returns "healthy"
- [ ] WebSocket service running on port 4002
- [ ] WebSocket service health check returns "healthy"
- [ ] Can register a user via Auth API
- [ ] Can login and get JWT tokens
- [ ] Can connect to WebSocket with JWT token
- [ ] Can send/receive messages via WebSocket
- [ ] Messages echoed back with AI response

---

## 🐛 Troubleshooting

### Docker Issues

**Problem:** `docker: command not found`
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

**Problem:** `Cannot connect to the Docker daemon`
```bash
# Start Docker Desktop application
open -a Docker
# Wait for Docker to start (whale icon in menu bar)
```

### Database Connection Issues

**Problem:** Auth service fails with "connection refused"
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check it's healthy
docker compose logs postgres | tail -20

# Restart if needed
docker compose restart postgres
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::4001`
```bash
# Find and kill the process using the port
lsof -ti:4001 | xargs kill -9

# Or use a different port
AUTH_SERVICE_PORT=4011 pnpm dev
```

### WebSocket Connection Fails

**Problem:** "Authentication failed" on WebSocket connection
```bash
# Check token is valid
# Tokens expire after 15 minutes
# Register/login again to get fresh token
```

**Problem:** Connection closes immediately
```bash
# Check JWT_ACCESS_SECRET environment variable
# Must match between auth and realtime services
echo $JWT_ACCESS_SECRET

# If not set, add to .env file
JWT_ACCESS_SECRET=your-secret-here
```

---

## 📝 Environment Variables

Create/update `.env` file in project root:

```bash
# Database
DATABASE_URL=postgresql://tide:tide_password@localhost:5432/tide

# JWT Secrets (IMPORTANT: Same for all services)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Service Ports
AUTH_SERVICE_PORT=4001
REALTIME_SERVICE_PORT=4002

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Logging
LOG_LEVEL=info
```

---

## 🔗 Service URLs

| Service | HTTP | WebSocket | Health Check |
|---------|------|-----------|--------------|
| **Auth** | http://localhost:4001 | N/A | http://localhost:4001/health |
| **Realtime** | http://localhost:4002 | ws://localhost:4002/realtime | http://localhost:4002/health |
| **PostgreSQL** | localhost:5432 | N/A | `pg_isready -h localhost` |
| **Redis** | localhost:6379 | N/A | `redis-cli ping` |

---

## 📚 API Documentation

### Auth Service

See: `packages/services/auth/README.md`

**Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /health` - Health check

### WebSocket Service

See: `packages/services/realtime/README.md`

**Message Types:**
- `ping/pong` - Health checks
- `message` - Chat messages
- `typing` - Typing indicators
- `subscribe/unsubscribe` - Channel management

---

## 🚀 Next Steps

Once services are running:

1. **Integrate with TideCore** (iOS & Android)
   - Replace simulated responses with WebSocket messages
   - Update message sending to use WebSocket
   - Handle real-time updates

2. **Add Error Handling UI**
   - Connection status indicators
   - Retry mechanisms
   - Error alerts/snackbars

3. **Full Integration Testing**
   - End-to-end message flow
   - Offline/online scenarios
   - Multiple device testing

4. **Deploy to Staging**
   - Configure production secrets
   - Set up load balancing
   - Enable monitoring

---

**Questions?** Check the service READMEs or logs for detailed information.

**Status:** ✅ Services ready for integration testing!
