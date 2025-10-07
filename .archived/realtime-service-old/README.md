# 🌊 Real-time WebSocket Service

Production-ready WebSocket service for real-time bidirectional communication in the Tide platform. Enables instant message delivery, typing indicators, presence, and live updates.

## Features

- ✅ WebSocket server with Express integration
- ✅ JWT-based authentication
- ✅ Connection lifecycle management
- ✅ Heartbeat/ping-pong for connection health
- ✅ Message routing (user-to-user, broadcast)
- ✅ Typing indicators
- ✅ Channel subscriptions
- ✅ Automatic reconnection handling
- ✅ Graceful connection cleanup
- ✅ Comprehensive logging
- ✅ Health check endpoint

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the service in development mode
cd packages/services/realtime
pnpm dev

# The service will be available at:
# HTTP: http://localhost:4002
# WebSocket: ws://localhost:4002/realtime
```

## WebSocket Protocol

### Connection

Connect to the WebSocket endpoint with a JWT access token:

```javascript
// Option 1: Query parameter
const ws = new WebSocket('ws://localhost:4002/realtime?token=YOUR_JWT_TOKEN');

// Option 2: Authorization header (if client supports it)
const ws = new WebSocket('ws://localhost:4002/realtime', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
```

### Message Format

All messages follow this JSON structure:

```typescript
interface WebSocketMessage {
  type: string;           // Message type
  payload?: any;          // Message payload
  messageId?: string;     // Optional message ID for tracking
  timestamp?: string;     // ISO timestamp (auto-added by server)
}
```

### Connection Events

#### Connected (Server → Client)

When connection is established:

```json
{
  "type": "connected",
  "payload": {
    "connectionId": "uuid",
    "userId": "user_xxx",
    "message": "Connected to Tide real-time service"
  },
  "timestamp": "2025-10-07T..."
}
```

#### Error (Server → Client)

When error occurs:

```json
{
  "type": "error",
  "payload": {
    "error": "Error message",
    "message": "Descriptive error"
  },
  "timestamp": "2025-10-07T..."
}
```

## Message Types

### 1. Ping/Pong (Health Check)

**Client → Server:**
```json
{
  "type": "ping",
  "messageId": "optional_id"
}
```

**Server → Client:**
```json
{
  "type": "pong",
  "messageId": "optional_id",
  "payload": {
    "timestamp": "2025-10-07T..."
  }
}
```

### 2. Chat Message

**Client → Server:**
```json
{
  "type": "message",
  "messageId": "msg_123",
  "payload": {
    "conversationId": "conv_abc",
    "content": "Hello, world!",
    "recipientId": "user_xyz"
  }
}
```

**Server → Client (Acknowledgment):**
```json
{
  "type": "message_ack",
  "messageId": "msg_123",
  "payload": {
    "messageId": "msg_456",
    "status": "delivered"
  }
}
```

**Server → Client (Incoming Message):**
```json
{
  "type": "message",
  "payload": {
    "conversationId": "conv_abc",
    "messageId": "msg_456",
    "content": "Hello, world!",
    "role": "user",
    "timestamp": "2025-10-07T...",
    "status": "sent"
  }
}
```

### 3. Typing Indicator

**Client → Server:**
```json
{
  "type": "typing",
  "payload": {
    "conversationId": "conv_abc",
    "isTyping": true
  }
}
```

**Server → Client:**
```json
{
  "type": "typing_ack",
  "payload": {
    "conversationId": "conv_abc",
    "isTyping": true
  }
}
```

### 4. Channel Subscriptions

**Subscribe (Client → Server):**
```json
{
  "type": "subscribe",
  "payload": {
    "channel": "conversations:conv_abc"
  }
}
```

**Subscribed (Server → Client):**
```json
{
  "type": "subscribed",
  "payload": {
    "channel": "conversations:conv_abc"
  }
}
```

**Unsubscribe (Client → Server):**
```json
{
  "type": "unsubscribe",
  "payload": {
    "channel": "conversations:conv_abc"
  }
}
```

## Client Implementation Examples

### iOS (Swift + Starscream)

```swift
import Starscream

class WebSocketManager: WebSocketDelegate {
    private var socket: WebSocket?

    func connect(token: String) {
        var request = URLRequest(url: URL(string: "ws://localhost:4002/realtime?token=\(token)")!)
        socket = WebSocket(request: request)
        socket?.delegate = self
        socket?.connect()
    }

    func sendMessage(conversationId: String, content: String) {
        let message: [String: Any] = [
            "type": "message",
            "messageId": UUID().uuidString,
            "payload": [
                "conversationId": conversationId,
                "content": content
            ]
        ]

        if let jsonData = try? JSONSerialization.data(withJSONObject: message),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            socket?.write(string: jsonString)
        }
    }

    // WebSocketDelegate methods
    func didReceive(event: WebSocketEvent, client: WebSocket) {
        switch event {
        case .connected:
            print("WebSocket connected")
        case .text(let string):
            handleMessage(string)
        case .disconnected(let reason, let code):
            print("WebSocket disconnected: \(reason)")
        default:
            break
        }
    }

    private func handleMessage(_ text: String) {
        guard let data = text.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = json["type"] as? String else {
            return
        }

        switch type {
        case "connected":
            print("Connection established")
        case "message":
            // Handle incoming message
            break
        case "error":
            // Handle error
            break
        default:
            break
        }
    }
}
```

### Android (Kotlin + OkHttp)

```kotlin
import okhttp3.*
import org.json.JSONObject

class WebSocketManager(private val token: String) {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient()

    fun connect() {
        val request = Request.Builder()
            .url("ws://localhost:4002/realtime?token=$token")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                println("WebSocket connected")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                handleMessage(text)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                println("WebSocket error: ${t.message}")
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                println("WebSocket closed: $reason")
            }
        })
    }

    fun sendMessage(conversationId: String, content: String) {
        val message = JSONObject().apply {
            put("type", "message")
            put("messageId", java.util.UUID.randomUUID().toString())
            put("payload", JSONObject().apply {
                put("conversationId", conversationId)
                put("content", content)
            })
        }

        webSocket?.send(message.toString())
    }

    private fun handleMessage(text: String) {
        val json = JSONObject(text)
        val type = json.getString("type")

        when (type) {
            "connected" -> println("Connection established")
            "message" -> {
                // Handle incoming message
            }
            "error" -> {
                // Handle error
            }
        }
    }

    fun disconnect() {
        webSocket?.close(1000, "Normal closure")
    }
}
```

## Architecture

### Connection Lifecycle

1. **Connect**: Client connects with JWT token
2. **Authenticate**: Server verifies token
3. **Connected**: Server sends connection confirmation
4. **Active**: Client can send/receive messages
5. **Heartbeat**: Periodic ping/pong to detect disconnections
6. **Disconnect**: Either side can close connection

### Connection Manager

The `ConnectionManager` class handles:
- Authentication via JWT
- Connection storage (by connectionId and userId)
- Heartbeat checks
- Message routing
- Graceful cleanup

### Message Handler

The `MessageHandler` class processes:
- Ping/pong health checks
- Chat messages
- Typing indicators
- Channel subscriptions
- Custom message types

## API Endpoints

### Health Check

```bash
GET http://localhost:4002/health

# Response:
{
  "status": "healthy",
  "service": "realtime-service",
  "timestamp": "2025-10-07T...",
  "uptime": 123.45,
  "version": "0.1.0",
  "websocket": {
    "enabled": true,
    "path": "/realtime"
  }
}
```

## Environment Variables

```bash
# Service
REALTIME_SERVICE_PORT=4002

# JWT (shared with auth service)
JWT_ACCESS_SECRET=your-access-secret

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

## Security Features

- **JWT Authentication**: All connections require valid access token
- **Token Verification**: Tokens checked on connection
- **Connection Timeout**: Inactive connections automatically closed
- **Heartbeat**: Detects broken connections
- **Error Handling**: All errors logged and handled gracefully
- **CORS**: Configurable origin restrictions
- **Helmet**: Security headers enabled

## Monitoring & Debugging

### Connection Stats

The ConnectionManager provides real-time stats:

```typescript
const stats = connectionManager.getStats();
// Returns:
{
  totalConnections: 42,
  totalUsers: 35,
  connections: [
    {
      connectionId: "uuid",
      userId: "user_xxx",
      isAlive: true
    }
  ]
}
```

### Logs

All events are logged with structured data:
- Connection established/closed
- Messages sent/received
- Errors
- Authentication failures

## Testing

```bash
# Run tests
pnpm test

# Manual testing with wscat
npm install -g wscat

# Connect
wscat -c "ws://localhost:4002/realtime?token=YOUR_JWT_TOKEN"

# Send ping
> {"type":"ping"}

# Send message
> {"type":"message","payload":{"conversationId":"test","content":"Hello"}}
```

## Production Considerations

Before deploying to production:

- [ ] Add rate limiting per connection
- [ ] Implement message persistence
- [ ] Add Redis for horizontal scaling
- [ ] Implement presence tracking
- [ ] Add metrics (Prometheus)
- [ ] Add distributed tracing
- [ ] Implement message queue for offline users
- [ ] Add connection pooling limits
- [ ] Configure load balancer sticky sessions
- [ ] Add DDoS protection
- [ ] Implement backpressure handling
- [ ] Add comprehensive test suite

## Integration with Mobile Apps

### iOS Integration

1. Add Starscream dependency to your iOS project
2. Create WebSocketManager following the example above
3. Connect on app launch with auth token
4. Integrate with TideCore for message sync

### Android Integration

1. Add OkHttp dependency to your Android project
2. Create WebSocketManager following the example above
3. Connect on app launch with auth token
4. Use Kotlin Flows for reactive updates

## Troubleshooting

**Connection fails:**
- Check JWT token is valid
- Verify service is running on correct port
- Check CORS configuration

**Messages not received:**
- Check connection is still alive
- Verify heartbeat is responding
- Check logs for errors

**High latency:**
- Check network conditions
- Verify server load
- Check message size

## Next Steps

- Integrate with AI service for real-time AI responses
- Add presence tracking (online/offline status)
- Implement read receipts
- Add file upload support
- Implement voice/video call signaling
- Add end-to-end encryption

## Resources

- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [ws library](https://github.com/websockets/ws)
- [Starscream (iOS)](https://github.com/daltoniam/Starscream)
- [OkHttp (Android)](https://square.github.io/okhttp/)
