import Foundation

/// Real-time WebSocket manager for bidirectional communication with Tide backend
@MainActor
class WebSocketManager: ObservableObject {
    static let shared = WebSocketManager()

    @Published private(set) var isConnected = false
    @Published private(set) var connectionError: String?

    private var webSocketTask: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    private let baseURL: String
    private var accessToken: String?

    // Callbacks
    var onMessageReceived: ((WebSocketMessage) -> Void)?
    var onConnected: (() -> Void)?
    var onDisconnected: (() -> Void)?

    // Heartbeat
    private var heartbeatTimer: Timer?
    private let heartbeatInterval: TimeInterval = 30

    init(baseURL: String = "ws://localhost:4002") {
        self.baseURL = baseURL
        self.urlSession = URLSession(configuration: .default)
    }

    // MARK: - Connection Management

    func connect(token: String) {
        self.accessToken = token

        guard var urlComponents = URLComponents(string: "\(baseURL)/realtime") else {
            connectionError = "Invalid WebSocket URL"
            return
        }

        // Add token as query parameter
        urlComponents.queryItems = [URLQueryItem(name: "token", value: token)]

        guard let url = urlComponents.url else {
            connectionError = "Failed to construct WebSocket URL"
            return
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 10

        webSocketTask = urlSession?.webSocketTask(with: request)
        webSocketTask?.resume()

        // Start listening for messages
        receiveMessage()

        // Start heartbeat
        startHeartbeat()

        isConnected = true
        connectionError = nil

        print("WebSocket connecting to: \(url.absoluteString)")
    }

    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        stopHeartbeat()
        isConnected = false
        onDisconnected?()
        print("WebSocket disconnected")
    }

    func reconnect() {
        disconnect()

        if let token = accessToken {
            // Reconnect after a delay
            Task {
                try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                await connect(token: token)
            }
        }
    }

    // MARK: - Message Sending

    func sendMessage(_ message: WebSocketMessage) {
        guard isConnected else {
            print("Cannot send message: Not connected")
            return
        }

        do {
            let jsonData = try JSONEncoder().encode(message)
            guard let jsonString = String(data: jsonData, encoding: .utf8) else {
                print("Failed to convert message to string")
                return
            }

            let message = URLSessionWebSocketTask.Message.string(jsonString)
            webSocketTask?.send(message) { [weak self] error in
                if let error = error {
                    print("Error sending message: \(error.localizedDescription)")
                    Task { @MainActor in
                        self?.connectionError = error.localizedDescription
                    }
                }
            }
        } catch {
            print("Error encoding message: \(error.localizedDescription)")
        }
    }

    func sendChatMessage(conversationId: String, content: String) {
        let message = WebSocketMessage(
            type: "message",
            payload: ChatMessagePayload(
                conversationId: conversationId,
                content: content
            ),
            messageId: UUID().uuidString
        )

        sendMessage(message)
    }

    func sendTypingIndicator(conversationId: String, isTyping: Bool) {
        let message = WebSocketMessage(
            type: "typing",
            payload: TypingPayload(
                conversationId: conversationId,
                isTyping: isTyping
            )
        )

        sendMessage(message)
    }

    func sendPing() {
        let message = WebSocketMessage(
            type: "ping",
            messageId: UUID().uuidString
        )

        sendMessage(message)
    }

    // MARK: - Message Receiving

    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    self.handleMessage(text)

                case .data(let data):
                    if let text = String(data: data, encoding: .utf8) {
                        self.handleMessage(text)
                    }

                @unknown default:
                    print("Unknown message type received")
                }

                // Continue listening for next message
                self.receiveMessage()

            case .failure(let error):
                print("WebSocket receive error: \(error.localizedDescription)")

                Task { @MainActor in
                    self.connectionError = error.localizedDescription
                    self.isConnected = false
                    self.onDisconnected?()

                    // Attempt reconnection
                    self.reconnect()
                }
            }
        }
    }

    private func handleMessage(_ text: String) {
        guard let data = text.data(using: .utf8) else {
            print("Failed to convert message to data")
            return
        }

        do {
            let decoder = JSONDecoder()
            let message = try decoder.decode(WebSocketMessage.self, from: data)

            Task { @MainActor in
                self.processMessage(message)
            }
        } catch {
            print("Failed to decode message: \(error.localizedDescription)")
            print("Raw message: \(text)")
        }
    }

    private func processMessage(_ message: WebSocketMessage) {
        print("Received WebSocket message: \(message.type)")

        switch message.type {
        case "connected":
            print("WebSocket connection confirmed by server")
            isConnected = true
            connectionError = nil
            onConnected?()

        case "message":
            // Incoming chat message
            onMessageReceived?(message)

        case "message_ack":
            // Message acknowledgment
            print("Message acknowledged: \(message.messageId ?? "unknown")")

        case "pong":
            // Heartbeat response
            print("Heartbeat pong received")

        case "typing_ack":
            // Typing indicator acknowledged
            break

        case "error":
            if let errorPayload = message.payload as? [String: Any],
               let errorMessage = errorPayload["error"] as? String {
                connectionError = errorMessage
                print("Server error: \(errorMessage)")
            }

        default:
            print("Unknown message type: \(message.type)")
        }
    }

    // MARK: - Heartbeat

    private func startHeartbeat() {
        stopHeartbeat()

        heartbeatTimer = Timer.scheduledTimer(withTimeInterval: heartbeatInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.sendPing()
            }
        }
    }

    private func stopHeartbeat() {
        heartbeatTimer?.invalidate()
        heartbeatTimer = nil
    }
}

// MARK: - Message Models

struct WebSocketMessage: Codable {
    let type: String
    let payload: AnyCodable?
    let messageId: String?
    let timestamp: String?

    init(type: String, payload: (some Codable)? = nil, messageId: String? = nil, timestamp: String? = nil) {
        self.type = type
        self.payload = payload.map { AnyCodable($0) }
        self.messageId = messageId
        self.timestamp = timestamp
    }
}

struct ChatMessagePayload: Codable {
    let conversationId: String
    let content: String
    let recipientId: String?

    init(conversationId: String, content: String, recipientId: String? = nil) {
        self.conversationId = conversationId
        self.content = content
        self.recipientId = recipientId
    }
}

struct TypingPayload: Codable {
    let conversationId: String
    let isTyping: Bool
}

// Helper to encode/decode Any as Codable
struct AnyCodable: Codable {
    let value: Any

    init(_ value: some Codable) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let intValue = try? container.decode(Int.self) {
            value = intValue
        } else if let doubleValue = try? container.decode(Double.self) {
            value = doubleValue
        } else if let stringValue = try? container.decode(String.self) {
            value = stringValue
        } else if let boolValue = try? container.decode(Bool.self) {
            value = boolValue
        } else if let dictValue = try? container.decode([String: AnyCodable].self) {
            value = dictValue.mapValues { $0.value }
        } else if let arrayValue = try? container.decode([AnyCodable].self) {
            value = arrayValue.map { $0.value }
        } else {
            value = [:]
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let intValue as Int:
            try container.encode(intValue)
        case let doubleValue as Double:
            try container.encode(doubleValue)
        case let stringValue as String:
            try container.encode(stringValue)
        case let boolValue as Bool:
            try container.encode(boolValue)
        case let dictValue as [String: Any]:
            try container.encode(dictValue.compactMapValues { AnyCodable($0 as! any Codable) })
        case let arrayValue as [Any]:
            try container.encode(arrayValue.map { AnyCodable($0 as! any Codable) })
        default:
            let context = EncodingError.Context(codingPath: [], debugDescription: "Value cannot be encoded")
            throw EncodingError.invalidValue(value, context)
        }
    }
}
