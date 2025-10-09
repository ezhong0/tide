/**
 * API Client
 * Handles all HTTP communication with backend services
 */

import Foundation

final class APIClient: APIClientProtocol {
    // Keep shared for backward compatibility, but deprecate
    @available(*, deprecated, message: "Use dependency injection instead of shared instance")
    static let shared = APIClient(authManager: AuthManager.shared, baseURL: Config.apiBaseURL)

    private let baseURL: String
    private let session: URLSession
    private let authManager: AuthManagerProtocol

    // MARK: - Initialization

    init(
        authManager: AuthManagerProtocol,
        baseURL: String? = nil,
        session: URLSession? = nil
    ) {
        self.authManager = authManager
        self.baseURL = baseURL ?? Config.apiBaseURL

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = Config.Network.requestTimeout
        config.timeoutIntervalForResource = Config.Network.resourceTimeout
        self.session = session ?? URLSession(configuration: config)
    }

    // MARK: - Auth

    func getAuthToken() -> String? {
        guard let token = authManager.accessToken else {
            return nil
        }

        // Validate token is not empty
        if token.isEmpty {
            return nil
        }

        // Check if token is expired using JWTDecoder
        if let decodedToken = JWTDecoder.decode(token) {
            if decodedToken.isExpired {
                Logger.warning("Access token is expired, needs refresh")
                // Token is expired - authManager should handle refresh
                // Return nil to trigger re-authentication
                return nil
            }

            // Check if token is about to expire (within 5 minutes)
            if decodedToken.isExpiringSoon(within: 300) {
                Logger.info("Access token expiring soon, consider refreshing")
                // Could trigger background refresh here
            }
        } else {
            Logger.warning("Failed to decode JWT token, treating as invalid")
            return nil
        }

        return token
    }

    // MARK: - Chat

    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse {
        let request = ChatRequest(
            message: message,
            conversationId: conversationId
        )

        return try await post(.aiChat, body: request)
    }

    func getConversations() async throws -> [Conversation] {
        return try await get(.aiConversations)
    }

    func getConversationMessages(conversationId: String) async throws -> [ChatMessage] {
        return try await get(.aiConversationMessages(conversationId: conversationId))
    }

    func deleteConversation(id: String) async throws {
        let _: EmptyResponse = try await delete(.aiConversationDelete(conversationId: id))
    }

    // MARK: - Email

    func getEmails(category: String? = nil) async throws -> [Email] {
        return try await get(.emailMessages(query: category))
    }

    func getEmailDetail(id: String) async throws -> Email {
        return try await get(.emailMessage(id: id))
    }

    func generateEmailDrafts(emailId: String) async throws -> [EmailDraft] {
        return try await post(.emailComposeDrafts(emailId: emailId), body: EmptyBody())
    }

    func generateEmailDrafts(emailId: String, userId: String, context: EmailComposeContext? = nil) async throws -> [EmailDraft] {
        let request = DraftRequest(emailId: emailId, userId: userId, context: context)
        let response: DraftResponse = try await post(.emailCreateDraft, body: request)
        return response.drafts
    }

    func sendEmail(to: [String], subject: String, body: String) async throws {
        let request = SendEmailRequest(to: to, subject: subject, body: body)
        let _: EmptyResponse = try await post(.emailSend, body: request)
    }

    func getGmailAuthURL() async throws -> String {
        let response: AuthURLResponse = try await get(.emailOAuthGoogleURL)
        return response.url
    }

    func checkEmailConnection() async throws -> Bool {
        let response: ConnectionStatus = try await get(.emailStatus)
        return response.connected
    }

    // Email Actions
    func getEmailThread(id: String) async throws -> [Email] {
        return try await get(.emailThread(id: id))
    }

    func markEmailRead(id: String) async throws {
        let _: EmptyResponse = try await post(.emailMarkRead(id: id), body: EmptyBody())
    }

    func markEmailUnread(id: String) async throws {
        let _: EmptyResponse = try await post(.emailMarkUnread(id: id), body: EmptyBody())
    }

    func starEmail(id: String) async throws {
        let _: EmptyResponse = try await post(.emailStar(id: id), body: EmptyBody())
    }

    func unstarEmail(id: String) async throws {
        let _: EmptyResponse = try await post(.emailUnstar(id: id), body: EmptyBody())
    }

    func archiveEmail(id: String) async throws {
        let _: EmptyResponse = try await post(.emailArchive(id: id), body: EmptyBody())
    }

    func deleteEmail(id: String) async throws {
        let _: EmptyResponse = try await delete(.emailDelete(id: id))
    }

    func replyToEmail(id: String, body: String) async throws {
        let request = ReplyEmailRequest(body: body)
        let _: EmptyResponse = try await post(.emailReply(id: id), body: request)
    }

    func forwardEmail(id: String, to: [String], body: String) async throws {
        let request = ForwardEmailRequest(to: to, body: body)
        let _: EmptyResponse = try await post(.emailForward(id: id), body: request)
    }

    // Email Intelligence
    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence {
        return try await get(.emailRelationship(userId: userId, email: contactEmail))
    }

    func getAutomatedEmailActions(userId: String) async throws -> [AutomatedEmailAction] {
        let response: AutomatedActionsResponse = try await get(.emailAutomatedActions(userId: userId))
        return response.actions
    }

    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary {
        return try await get(.emailAutomatedActionsSummary(userId: userId))
    }

    func getLearningInsights(userId: String) async throws -> [LearningInsight] {
        let response: LearningInsightsResponse = try await get(.emailLearningInsights(userId: userId))
        return response.insights
    }

    func undoAutomatedAction(actionId: String, userId: String) async throws {
        let request = UndoAutomatedActionRequest(userId: userId)
        let _: EmptyResponse = try await post(.emailAutomatedActionUndo(actionId: actionId), body: request)
    }

    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws {
        let request = ActionFeedbackRequest(userId: userId, feedback: feedback)
        let _: EmptyResponse = try await post(.emailAutomatedActionFeedback(actionId: actionId), body: request)
    }

    func markContactAsVIP(userId: String, contactEmail: String) async throws {
        let request = MarkVIPRequest(contactEmail: contactEmail)
        let _: EmptyResponse = try await post(.emailRelationshipVIP(userId: userId), body: request)
    }

    // MARK: - Calendar

    func getCalendarEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent] {
        let dateFormatter = ISO8601DateFormatter()
        let start = dateFormatter.string(from: startDate)
        let end = dateFormatter.string(from: endDate)
        return try await get(.calendarEvents(start: start, end: end))
    }

    func getCalendarEvent(id: String) async throws -> CalendarEvent {
        return try await get(.calendarEvent(id: id))
    }

    func getMeetingBrief(eventId: String) async throws -> MeetingBrief {
        return try await get(.calendarEventBrief(eventId: eventId))
    }

    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent {
        return try await post(.calendarCreateEvent, body: event)
    }

    func updateEvent(id: String, event: CreateEventRequest) async throws -> CalendarEvent {
        return try await put(.calendarUpdateEvent(id: id), body: event)
    }

    func deleteEvent(id: String) async throws {
        let _: EmptyResponse = try await delete(.calendarDeleteEvent(id: id))
    }

    // Calendar Intelligence
    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief] {
        let response: MeetingBriefsResponse = try await get(.calendarBriefs(userId: userId))
        return response.briefs
    }

    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief {
        let request = GenerateBriefRequest(eventId: eventId, userId: userId)
        return try await post(.calendarGenerateBrief, body: request)
    }

    func getCalendarOptimizations(userId: String) async throws -> [CalendarOptimization] {
        let response: OptimizationsResponse = try await get(.calendarOptimizations(userId: userId))
        return response.optimizations
    }

    func acceptOptimization(optimizationId: String, userId: String) async throws {
        let request = OptimizationActionRequest(userId: userId, action: "accept")
        let _: EmptyResponse = try await post(.calendarOptimizationAccept(optimizationId: optimizationId), body: request)
    }

    func rejectOptimization(optimizationId: String, userId: String) async throws {
        let request = OptimizationActionRequest(userId: userId, action: "reject")
        let _: EmptyResponse = try await post(.calendarOptimizationReject(optimizationId: optimizationId), body: request)
    }

    func getMeetingConflicts(userId: String) async throws -> [MeetingConflict] {
        let response: ConflictsResponse = try await get(.calendarConflicts(userId: userId))
        return response.conflicts
    }

    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws {
        let request = ResolveConflictRequest(userId: userId, resolution: resolution)
        let _: EmptyResponse = try await post(.calendarConflictResolve(conflictId: conflictId), body: request)
    }

    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot] {
        let request = FindSlotsRequest(title: title, attendees: attendees, durationMinutes: durationMinutes, userId: userId)
        let response: TimeSlotsResponse = try await post(.calendarFindTimeSlots, body: request)
        return response.slots
    }

    // MARK: - Tasks

    func getTasks(status: String? = nil) async throws -> [Task] {
        return try await get(.workflowTasks(status: status, priority: nil))
    }

    func getTask(id: String) async throws -> Task {
        return try await get(.workflowTask(id: id))
    }

    func createTask(task: CreateTaskRequest) async throws -> Task {
        return try await post(.workflowCreateTask, body: task)
    }

    func updateTask(id: String, task: CreateTaskRequest) async throws -> Task {
        return try await put(.workflowUpdateTask(id: id), body: task)
    }

    func deleteTask(id: String) async throws {
        let _: EmptyResponse = try await delete(.workflowDeleteTask(id: id))
    }

    func updateTaskStatus(taskId: String, status: String) async throws {
        let request = UpdateTaskStatusRequest(status: status)
        let _: EmptyResponse = try await put(.workflowTaskStatus(taskId: taskId), body: request)
    }

    // MARK: - Intelligence

    func getDailySnapshot(userId: String) async throws -> DailySnapshot {
        return try await get(.intelligenceDailySnapshot(userId: userId))
    }

    func refreshDailySnapshot(userId: String) async throws -> DailySnapshot {
        let request = EmptyBody()
        let response: DailySnapshotResponse = try await post(.intelligenceGenerateSnapshot(userId: userId), body: request)
        return response.snapshot
    }

    func getPriorityItems(userId: String) async throws -> [PriorityItem] {
        let response: PriorityItemsResponse = try await get(.intelligencePriorityItems(userId: userId))
        return response.items
    }

    func getPendingDecisions(userId: String) async throws -> [PendingDecision] {
        let response: PendingDecisionsResponse = try await get(.intelligencePendingDecisions(userId: userId))
        return response.decisions
    }

    func getPredictions(userId: String) async throws -> [Prediction] {
        let response: PredictionsResponse = try await get(.intelligencePredictions(userId: userId))
        return response.predictions
    }

    // MARK: - Actions

    func executeAction(_ action: SuggestedAction) async throws {
        let _: EmptyResponse = try await post(.aiActionsExecute, body: action)
    }

    func getPendingActions(userId: String) async throws -> [ActionSuggestion] {
        let response: ActionsResponse = try await get(.actionsPending(userId: userId))
        return response.actions
    }

    func approveAction(actionId: String, userId: String, approved: Bool, modifications: [String: AnyCodable]? = nil) async throws {
        let request = ApproveActionRequest(userId: userId, approved: approved, modifications: modifications)
        let _: EmptyResponse = try await post(.actionsApprove(actionId: actionId), body: request)
    }

    func undoAction(actionId: String, userId: String) async throws {
        let request = UndoActionRequest(userId: userId)
        let _: EmptyResponse = try await post(.actionsUndo(actionId: actionId), body: request)
    }

    func getActionHistory(userId: String) async throws -> [ActionSuggestion] {
        let response: ActionsResponse = try await get(.actionsHistory(userId: userId))
        return response.actions
    }

    // MARK: - Decisions

    func getPendingDecisions(userId: String) async throws -> [Decision] {
        let response: DecisionsResponse = try await get(.decisionsPending(userId: userId))
        return response.decisions
    }

    func makeDecision(decisionId: String, userId: String, chosenOption: String?, reasoning: String?, status: String) async throws {
        let request = MakeDecisionRequest(userId: userId, chosenOption: chosenOption, reasoning: reasoning, status: status)
        let _: EmptyResponse = try await post(.decisionsDecide(decisionId: decisionId), body: request)
    }

    func getDecisionHistory(userId: String) async throws -> [Decision] {
        let response: DecisionsResponse = try await get(.decisionsHistory(userId: userId))
        return response.decisions
    }

    // MARK: - Generic HTTP Methods

    private func get<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        return try await RetryLogic.executeWithRetry {
            try await self.performRequest(endpoint: endpoint, method: "GET", body: nil as EmptyBody?)
        }
    }

    private func post<T: Encodable, U: Decodable>(_ endpoint: Endpoint, body: T) async throws -> U {
        return try await RetryLogic.executeWithRetry {
            try await self.performRequest(endpoint: endpoint, method: "POST", body: body)
        }
    }

    private func put<T: Encodable, U: Decodable>(_ endpoint: Endpoint, body: T) async throws -> U {
        return try await RetryLogic.executeWithRetry {
            try await self.performRequest(endpoint: endpoint, method: "PUT", body: body)
        }
    }

    private func delete<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        return try await RetryLogic.executeWithRetry {
            try await self.performRequest(endpoint: endpoint, method: "DELETE", body: nil as EmptyBody?)
        }
    }

    // MARK: - Core Request Method

    private func performRequest<T: Encodable, U: Decodable>(
        endpoint: Endpoint,
        method: String,
        body: T?
    ) async throws -> U {
        guard let url = URL(string: baseURL + endpoint.path) else {
            Logger.error("Invalid URL: \(baseURL + endpoint.path)")
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        addAuthHeader(&request)

        // Encode body if present
        if let body = body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            request.httpBody = try encoder.encode(body)
        }

        // Log request
        Logger.networkRequest(
            method: method,
            url: url.absoluteString,
            headers: request.allHTTPHeaderFields,
            body: request.httpBody
        )

        // Perform request
        let (data, response) = try await session.data(for: request)

        // Log response
        guard let httpResponse = response as? HTTPURLResponse else {
            Logger.error("Invalid response type")
            throw NetworkError.unknown(NSError(domain: "InvalidResponse", code: -1))
        }

        Logger.networkResponse(
            url: url.absoluteString,
            statusCode: httpResponse.statusCode,
            data: data
        )

        // Validate response
        try validateResponse(response)

        // Decode response
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        do {
            return try decoder.decode(U.self, from: data)
        } catch {
            Logger.error("Decoding failed", error: error)
            throw NetworkError.decodingFailed(error)
        }
    }

    private func addAuthHeader(_ request: inout URLRequest) {
        if let token = getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.unknown(NSError(domain: "InvalidResponse", code: -1))
        }

        guard httpResponse.statusCode.isSuccessful else {
            Logger.error("HTTP error: \(httpResponse.statusCode)")
            throw NetworkError.httpError(statusCode: httpResponse.statusCode, data: nil)
        }

        // Validate Content-Type for JSON responses
        if let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type") {
            let isValidContentType = contentType.lowercased().contains("application/json")
            if !isValidContentType && httpResponse.statusCode != 204 {
                Logger.warning("Unexpected Content-Type: \(contentType)")
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

struct ReplyEmailRequest: Encodable {
    let body: String
}

struct ForwardEmailRequest: Encodable {
    let to: [String]
    let body: String
}

struct CreateEventRequest: Encodable {
    let title: String
    let startTime: Date
    let endTime: Date
    let description: String?
}

struct UpdateTaskStatusRequest: Encodable {
    let status: String
}

struct DailySnapshotResponse: Decodable {
    let snapshot: DailySnapshot
}

struct PriorityItemsResponse: Decodable {
    let items: [PriorityItem]
}

struct PendingDecisionsResponse: Decodable {
    let decisions: [PendingDecision]
}

struct PredictionsResponse: Decodable {
    let predictions: [Prediction]
}

struct ActionsResponse: Decodable {
    let actions: [ActionSuggestion]
}

struct ApproveActionRequest: Encodable {
    let userId: String
    let approved: Bool
    let modifications: [String: AnyCodable]?
}

struct UndoActionRequest: Encodable {
    let userId: String
}

struct DecisionsResponse: Decodable {
    let decisions: [Decision]
}

struct MakeDecisionRequest: Encodable {
    let userId: String
    let chosenOption: String?
    let reasoning: String?
    let status: String
}

// Email Intelligence
struct AutomatedActionsResponse: Decodable {
    let actions: [AutomatedEmailAction]
}

struct LearningInsightsResponse: Decodable {
    let insights: [LearningInsight]
}

struct UndoAutomatedActionRequest: Encodable {
    let userId: String
}

struct ActionFeedbackRequest: Encodable {
    let userId: String
    let feedback: String
}

struct MarkVIPRequest: Encodable {
    let contactEmail: String
}

// Calendar Intelligence
struct MeetingBriefsResponse: Decodable {
    let briefs: [MeetingBrief]
}

struct GenerateBriefRequest: Encodable {
    let eventId: String
    let userId: String
}

struct OptimizationsResponse: Decodable {
    let optimizations: [CalendarOptimization]
}

struct OptimizationActionRequest: Encodable {
    let userId: String
    let action: String
}

struct ConflictsResponse: Decodable {
    let conflicts: [MeetingConflict]
}

struct ResolveConflictRequest: Encodable {
    let userId: String
    let resolution: String
}

struct FindSlotsRequest: Encodable {
    let title: String
    let attendees: [String]
    let durationMinutes: Int
    let userId: String
}

struct TimeSlotsResponse: Decodable {
    let slots: [TimeSlot]
}

struct TimeSlot: Codable, Identifiable {
    let start: Date
    let end: Date
    let score: Double
    let reasoning: [String]
    let conflicts: [String]
    let attendeeAvailability: [String: Bool]

    var id: String { start.ISO8601Format() + end.ISO8601Format() }
}

struct EmptyBody: Encodable {}
struct EmptyResponse: Decodable {}
