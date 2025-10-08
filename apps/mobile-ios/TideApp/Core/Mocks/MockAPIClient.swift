/**
 * Mock API Client
 * Mock implementation for testing and preview purposes
 */

import Foundation

@MainActor
class MockAPIClient: APIClientProtocol {
    // MARK: - Mock Data Control
    var shouldFail: Bool = false
    var mockDelay: TimeInterval = 0.3

    // MARK: - Auth
    func getAuthToken() -> String? {
        return "mock-token-123"
    }

    // MARK: - Chat
    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return ChatResponse(
            conversationId: conversationId ?? UUID().uuidString,
            content: "This is a mock response to: \(message)",
            confidence: 0.95,
            suggestedActions: []
        )
    }

    func getConversations() async throws -> [Conversation] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return [
            Conversation(
                id: "1",
                title: "Mock Conversation 1",
                lastMessage: "Last message here",
                lastMessageAt: Date(),
                messageCount: 5
            )
        ]
    }

    func getConversationMessages(conversationId: String) async throws -> [ChatMessage] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return [
            ChatMessage(
                id: "1",
                conversationId: conversationId,
                role: "user",
                content: "Hello",
                timestamp: Date().addingTimeInterval(-300)
            ),
            ChatMessage(
                id: "2",
                conversationId: conversationId,
                role: "assistant",
                content: "Hi! How can I help you?",
                timestamp: Date()
            )
        ]
    }

    // MARK: - Email
    func getEmails(category: String?) async throws -> [Email] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func getEmailDetail(id: String) async throws -> Email {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return Email(
            id: id,
            subject: "Mock Email",
            from: "sender@example.com",
            body: "This is a mock email body",
            timestamp: Date(),
            isRead: false,
            category: "inbox"
        )
    }

    func generateEmailDrafts(emailId: String) async throws -> [EmailDraft] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func generateEmailDrafts(emailId: String, userId: String, context: EmailComposeContext?) async throws -> [EmailDraft] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func sendEmail(to: [String], subject: String, body: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func getGmailAuthURL() async throws -> String {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return "https://mock-auth-url.com"
    }

    func checkEmailConnection() async throws -> Bool {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return true
    }

    // MARK: - Email Intelligence
    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return RelationshipIntelligence(
            contactEmail: contactEmail,
            communicationFrequency: "weekly",
            averageResponseTime: 3600,
            sentiment: "positive",
            lastInteraction: Date()
        )
    }

    func getAutomatedEmailActions(userId: String) async throws -> [AutomatedEmailAction] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return ActionsSummary(totalActions: 0, successfulActions: 0, failedActions: 0)
    }

    func getLearningInsights(userId: String) async throws -> [LearningInsight] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func undoAutomatedAction(actionId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func markContactAsVIP(userId: String, contactEmail: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    // MARK: - Calendar
    func getCalendarEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func getMeetingBrief(eventId: String) async throws -> MeetingBrief {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return MeetingBrief(
            eventId: eventId,
            title: "Mock Meeting",
            summary: "This is a mock meeting brief",
            keyPoints: [],
            attendees: []
        )
    }

    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return CalendarEvent(
            id: UUID().uuidString,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            description: event.description,
            location: nil,
            attendees: []
        )
    }

    // MARK: - Calendar Intelligence
    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return MeetingBrief(
            eventId: eventId,
            title: "Mock Meeting",
            summary: "Generated mock brief",
            keyPoints: [],
            attendees: []
        )
    }

    func getCalendarOptimizations(userId: String) async throws -> [CalendarOptimization] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func acceptOptimization(optimizationId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func rejectOptimization(optimizationId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func getMeetingConflicts(userId: String) async throws -> [MeetingConflict] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    // MARK: - Tasks
    func getTasks(status: String?) async throws -> [Task] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func createTask(task: CreateTaskRequest) async throws -> Task {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return Task(
            id: UUID().uuidString,
            title: task.title,
            description: task.description,
            status: "pending",
            priority: task.priority,
            dueDate: task.dueDate,
            createdAt: Date()
        )
    }

    func updateTaskStatus(taskId: String, status: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    // MARK: - Intelligence
    func getDailySnapshot(userId: String) async throws -> DailySnapshot {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }

        return DailySnapshot(
            date: Date(),
            summary: "Mock daily snapshot",
            priorityItems: [],
            upcomingEvents: [],
            pendingTasks: []
        )
    }

    func refreshDailySnapshot(userId: String) async throws -> DailySnapshot {
        try await getDailySnapshot(userId: userId)
    }

    func getPriorityItems(userId: String) async throws -> [PriorityItem] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func getPendingDecisions(userId: String) async throws -> [PendingDecision] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func getPredictions(userId: String) async throws -> [Prediction] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    // MARK: - Actions
    func executeAction(_ action: SuggestedAction) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func getPendingActions(userId: String) async throws -> [ActionSuggestion] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func approveAction(actionId: String, userId: String, approved: Bool, modifications: [String: AnyCodable]?) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func undoAction(actionId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func getActionHistory(userId: String) async throws -> [ActionSuggestion] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    // MARK: - Decisions
    func getPendingDecisions(userId: String) async throws -> [Decision] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }

    func makeDecision(decisionId: String, userId: String, chosenOption: String?, reasoning: String?, status: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
    }

    func getDecisionHistory(userId: String) async throws -> [Decision] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw APIError.networkError }
        return []
    }
}
