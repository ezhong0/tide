/**
 * API Client
 * Handles all HTTP communication with backend services
 */

import Foundation

class APIClient {
    static let shared = APIClient()

    private let baseURL: String
    private let session: URLSession

    private init() {
        #if DEBUG
        baseURL = "http://localhost:3002" // Local development
        #else
        baseURL = "https://gateway.tide.ai" // Production
        #endif

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        session = URLSession(configuration: config)
    }

    // MARK: - Auth

    func getAuthToken() -> String? {
        guard let token = AuthManager.shared.accessToken else {
            return nil
        }

        // Check if token is expired (JWT tokens typically have expiry in payload)
        // In production, would decode JWT and check exp claim
        // For now, add basic validation that token exists and is not empty
        if token.isEmpty {
            return nil
        }

        // TODO: Add proper JWT expiry check by decoding token and checking exp claim
        // If expired, trigger token refresh before returning

        return token
    }

    // MARK: - Chat

    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse {
        let request = ChatRequest(
            message: message,
            conversationId: conversationId
        )

        return try await post("/api/ai/chat", body: request)
    }

    func getConversations() async throws -> [Conversation] {
        return try await get("/api/ai/conversations")
    }

    func getConversationMessages(conversationId: String) async throws -> [ChatMessage] {
        return try await get("/api/ai/conversations/\(conversationId)/messages")
    }

    // MARK: - Email

    func getEmails(category: String? = nil) async throws -> [Email] {
        var path = "/api/email/messages"
        if let category = category {
            path += "?category=\(category)"
        }
        return try await get(path)
    }

    func getEmailDetail(id: String) async throws -> Email {
        return try await get("/api/email/messages/\(id)")
    }

    func generateEmailDrafts(emailId: String) async throws -> [EmailDraft] {
        return try await post("/api/email/compose/\(emailId)/drafts", body: EmptyBody())
    }

    func sendEmail(to: [String], subject: String, body: String) async throws {
        let request = SendEmailRequest(to: to, subject: subject, body: body)
        let _: EmptyResponse = try await post("/api/email/send", body: request)
    }

    func getGmailAuthURL() async throws -> String {
        let response: AuthURLResponse = try await get("/api/email/oauth/google/url")
        return response.url
    }

    func checkEmailConnection() async throws -> Bool {
        let response: ConnectionStatus = try await get("/api/email/status")
        return response.connected
    }

    // MARK: - Calendar

    func getCalendarEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent] {
        let dateFormatter = ISO8601DateFormatter()
        let start = dateFormatter.string(from: startDate)
        let end = dateFormatter.string(from: endDate)
        return try await get("/api/calendar/events?start=\(start)&end=\(end)")
    }

    func getMeetingBrief(eventId: String) async throws -> MeetingBrief {
        return try await get("/api/calendar/events/\(eventId)/brief")
    }

    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent {
        return try await post("/api/calendar/events", body: event)
    }

    // MARK: - Tasks

    func getTasks(status: String? = nil) async throws -> [Task] {
        var path = "/api/workflow/tasks"
        if let status = status {
            path += "?status=\(status)"
        }
        return try await get(path)
    }

    func createTask(task: CreateTaskRequest) async throws -> Task {
        return try await post("/api/workflow/tasks", body: task)
    }

    func updateTaskStatus(taskId: String, status: String) async throws {
        let request = UpdateTaskStatusRequest(status: status)
        let _: EmptyResponse = try await put("/api/workflow/tasks/\(taskId)/status", body: request)
    }

    // MARK: - Actions

    func executeAction(_ action: SuggestedAction) async throws {
        let _: EmptyResponse = try await post("/api/ai/actions/execute", body: action)
    }

    // MARK: - Generic HTTP Methods

    private func get<T: Decodable>(_ path: String) async throws -> T {
        guard let url = URL(string: baseURL + path) else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        addAuthHeader(&request)

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(T.self, from: data)
    }

    private func post<T: Encodable, U: Decodable>(_ path: String, body: T) async throws -> U {
        let url = URL(string: baseURL + path)!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(&request)

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(body)

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(U.self, from: data)
    }

    private func put<T: Encodable, U: Decodable>(_ path: String, body: T) async throws -> U {
        let url = URL(string: baseURL + path)!
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(&request)

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(body)

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(U.self, from: data)
    }

    private func addAuthHeader(_ request: inout URLRequest) {
        if let token = getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }

        // Validate Content-Type for JSON responses
        if let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type") {
            // Accept application/json or application/json; charset=utf-8
            let isValidContentType = contentType.lowercased().contains("application/json")
            if !isValidContentType && httpResponse.statusCode != 204 {
                // 204 No Content responses don't require Content-Type validation
                print("Warning: Unexpected Content-Type: \(contentType)")
            }
        }
    }
}

// MARK: - Request/Response Types

struct ChatRequest: Encodable {
    let message: String
    let conversationId: String?
}

struct ChatResponse: Decodable {
    let conversationId: String
    let content: String
    let confidence: Double?
    let suggestedActions: [SuggestedAction]?
}

struct AuthURLResponse: Decodable {
    let url: String
}

struct ConnectionStatus: Decodable {
    let connected: Bool
}

struct SendEmailRequest: Encodable {
    let to: [String]
    let subject: String
    let body: String
}

struct CreateEventRequest: Encodable {
    let title: String
    let startTime: Date
    let endTime: Date
    let description: String?
}

struct CreateTaskRequest: Encodable {
    let title: String
    let description: String?
    let priority: String
    let dueDate: Date?
}

struct UpdateTaskStatusRequest: Encodable {
    let status: String
}

struct EmptyBody: Encodable {}
struct EmptyResponse: Decodable {}

enum APIError: Error {
    case invalidResponse
    case httpError(statusCode: Int)
}
