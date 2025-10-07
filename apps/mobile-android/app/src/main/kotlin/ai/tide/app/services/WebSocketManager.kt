package ai.tide.app.services

import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.*
import org.json.JSONObject
import java.util.UUID
import java.util.concurrent.TimeUnit

/**
 * Real-time WebSocket manager for bidirectional communication with Tide backend
 */
class WebSocketManager(
    private val baseUrl: String = "ws://10.0.2.2:4002" // Android emulator localhost
) {
    companion object {
        private const val TAG = "WebSocketManager"
        private const val HEARTBEAT_INTERVAL_MS = 30000L
        private const val RECONNECT_DELAY_MS = 2000L

        @Volatile
        private var instance: WebSocketManager? = null

        fun getInstance(): WebSocketManager {
            return instance ?: synchronized(this) {
                instance ?: WebSocketManager().also { instance = it }
            }
        }
    }

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _connectionError = MutableStateFlow<String?>(null)
    val connectionError: StateFlow<String?> = _connectionError.asStateFlow()

    private var webSocket: WebSocket? = null
    private var accessToken: String? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var heartbeatJob: Job? = null

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .pingInterval(30, TimeUnit.SECONDS) // Automatic ping/pong
        .build()

    // Callbacks
    var onMessageReceived: ((WebSocketMessage) -> Unit)? = null
    var onConnected: (() -> Unit)? = null
    var onDisconnected: (() -> Unit)? = null

    // MARK: - Connection Management

    fun connect(token: String) {
        this.accessToken = token

        val url = "$baseUrl/realtime?token=$token"
        val request = Request.Builder()
            .url(url)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket opened: ${response.message}")
                scope.launch {
                    _isConnected.value = true
                    _connectionError.value = null
                    startHeartbeat()
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "Message received: $text")
                scope.launch {
                    handleMessage(text)
                }
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closing: $code - $reason")
                webSocket.close(1000, null)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closed: $code - $reason")
                scope.launch {
                    _isConnected.value = false
                    stopHeartbeat()
                    onDisconnected?.invoke()
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket error: ${t.message}", t)
                scope.launch {
                    _connectionError.value = t.message
                    _isConnected.value = false
                    stopHeartbeat()
                    onDisconnected?.invoke()

                    // Attempt reconnection
                    delay(RECONNECT_DELAY_MS)
                    reconnect()
                }
            }
        })

        Log.d(TAG, "WebSocket connecting to: $url")
    }

    fun disconnect() {
        webSocket?.close(1000, "Normal closure")
        webSocket = null
        stopHeartbeat()
        _isConnected.value = false
        onDisconnected?.invoke()
        Log.d(TAG, "WebSocket disconnected")
    }

    fun reconnect() {
        disconnect()
        accessToken?.let { token ->
            scope.launch {
                delay(RECONNECT_DELAY_MS)
                connect(token)
            }
        }
    }

    // MARK: - Message Sending

    fun sendMessage(message: WebSocketMessage) {
        if (!_isConnected.value) {
            Log.w(TAG, "Cannot send message: Not connected")
            return
        }

        try {
            val json = message.toJson()
            val success = webSocket?.send(json) ?: false

            if (!success) {
                Log.e(TAG, "Failed to send message")
                _connectionError.value = "Failed to send message"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error sending message", e)
            _connectionError.value = e.message
        }
    }

    fun sendChatMessage(conversationId: String, content: String) {
        val message = WebSocketMessage(
            type = "message",
            payload = mapOf(
                "conversationId" to conversationId,
                "content" to content
            ),
            messageId = UUID.randomUUID().toString()
        )

        sendMessage(message)
    }

    fun sendTypingIndicator(conversationId: String, isTyping: Boolean) {
        val message = WebSocketMessage(
            type = "typing",
            payload = mapOf(
                "conversationId" to conversationId,
                "isTyping" to isTyping
            )
        )

        sendMessage(message)
    }

    fun sendPing() {
        val message = WebSocketMessage(
            type = "ping",
            messageId = UUID.randomUUID().toString()
        )

        sendMessage(message)
    }

    // MARK: - Message Receiving

    private suspend fun handleMessage(text: String) {
        try {
            val json = JSONObject(text)
            val message = WebSocketMessage.fromJson(json)

            withContext(Dispatchers.Main) {
                processMessage(message)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse message: $text", e)
        }
    }

    private fun processMessage(message: WebSocketMessage) {
        Log.d(TAG, "Processing message type: ${message.type}")

        when (message.type) {
            "connected" -> {
                Log.d(TAG, "WebSocket connection confirmed by server")
                _isConnected.value = true
                _connectionError.value = null
                onConnected?.invoke()
            }

            "message" -> {
                // Incoming chat message
                onMessageReceived?.invoke(message)
            }

            "message_ack" -> {
                // Message acknowledgment
                Log.d(TAG, "Message acknowledged: ${message.messageId}")
            }

            "pong" -> {
                // Heartbeat response
                Log.d(TAG, "Heartbeat pong received")
            }

            "typing_ack" -> {
                // Typing indicator acknowledged
            }

            "error" -> {
                val errorMessage = message.payload?.get("error")?.toString()
                    ?: message.payload?.get("message")?.toString()
                    ?: "Unknown error"
                _connectionError.value = errorMessage
                Log.e(TAG, "Server error: $errorMessage")
            }

            else -> {
                Log.w(TAG, "Unknown message type: ${message.type}")
            }
        }
    }

    // MARK: - Heartbeat

    private fun startHeartbeat() {
        stopHeartbeat()

        heartbeatJob = scope.launch {
            while (isActive && _isConnected.value) {
                delay(HEARTBEAT_INTERVAL_MS)
                sendPing()
            }
        }
    }

    private fun stopHeartbeat() {
        heartbeatJob?.cancel()
        heartbeatJob = null
    }

    fun cleanup() {
        disconnect()
        scope.cancel()
    }
}

// MARK: - Message Models

data class WebSocketMessage(
    val type: String,
    val payload: Map<String, Any>? = null,
    val messageId: String? = null,
    val timestamp: String? = null
) {
    fun toJson(): String {
        val json = JSONObject().apply {
            put("type", type)
            payload?.let {
                put("payload", JSONObject(it))
            }
            messageId?.let { put("messageId", it) }
            timestamp?.let { put("timestamp", it) }
        }
        return json.toString()
    }

    companion object {
        fun fromJson(json: JSONObject): WebSocketMessage {
            val payload = if (json.has("payload")) {
                val payloadJson = json.getJSONObject("payload")
                payloadJson.keys().asSequence().associateWith { key ->
                    payloadJson.get(key)
                }
            } else null

            return WebSocketMessage(
                type = json.getString("type"),
                payload = payload,
                messageId = json.optString("messageId").takeIf { it.isNotEmpty() },
                timestamp = json.optString("timestamp").takeIf { it.isNotEmpty() }
            )
        }
    }
}
