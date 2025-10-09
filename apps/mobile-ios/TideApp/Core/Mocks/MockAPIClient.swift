/**
 * Mock API Client
 * Mock implementation for testing and preview purposes
 */

import Foundation

@MainActor
final class MockAPIClient: APIClientProtocol {
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
        if shouldFail { throw NetworkError.noInternetConnection }

        return ChatResponse(
            conversationId: conversationId ?? UUID().uuidString,
            content: "This is a mock response to: \(message)",
            confidence: 0.95,
            suggestedActions: []
        )
    }

    func getConversations() async throws -> [Conversation] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return [
            Conversation(
                id: "1",
                title: "Mock Conversation 1",
                createdAt: Date().addingTimeInterval(-86400),
                updatedAt: Date()
            )
        ]
    }

    func getConversationMessages(conversationId: String) async throws -> [ChatMessage] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return [
            ChatMessage(
                id: "1",
                conversationId: conversationId,
                role: .user,
                content: "Hello",
                timestamp: Date().addingTimeInterval(-300),
                confidence: nil,
                suggestedActions: nil
            ),
            ChatMessage(
                id: "2",
                conversationId: conversationId,
                role: .assistant,
                content: "Hi! How can I help you?",
                timestamp: Date(),
                confidence: 0.95,
                suggestedActions: []
            )
        ]
    }

    func deleteConversation(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    // MARK: - Email
    func getEmails(category: String?) async throws -> [Email] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func getEmailDetail(id: String) async throws -> Email {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return Email(
            id: id,
            from: EmailContact(email: "sender@example.com", name: "Mock Sender"),
            to: [EmailContact(email: "recipient@example.com", name: "Recipient")],
            subject: "Mock Email",
            preview: "This is a mock email preview...",
            body: "This is a mock email body",
            receivedAt: Date(),
            isRead: false,
            isStarred: false,
            priority: .normal,
            aiSummary: "Mock AI summary of the email",
            suggestedActions: nil,
            category: "inbox"
        )
    }

    func generateEmailDrafts(emailId: String) async throws -> [EmailDraft] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func generateEmailDrafts(emailId: String, userId: String, context: EmailComposeContext?) async throws -> [EmailDraft] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func sendEmail(to: [String], subject: String, body: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func getGmailAuthURL() async throws -> String {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return "https://mock-auth-url.com"
    }

    func checkEmailConnection() async throws -> Bool {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return true
    }

    // MARK: - Email Actions
    func getEmailThread(id: String) async throws -> [Email] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func markEmailRead(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func markEmailUnread(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func starEmail(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func unstarEmail(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func archiveEmail(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func deleteEmail(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func replyToEmail(id: String, body: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func forwardEmail(id: String, to: [String], body: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    // MARK: - Email Intelligence
    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return RelationshipIntelligence(
            id: UUID().uuidString,
            contactEmail: contactEmail,
            contactName: "Contact Name",
            relationshipStrength: 0.75,
            interactionFrequency: "weekly",
            lastInteractionAt: Date(),
            totalEmailsSent: 15,
            totalEmailsReceived: 20,
            topics: ["Work", "Projects"],
            sentiment: "positive",
            vipStatus: false
        )
    }

    func getAutomatedEmailActions(userId: String) async throws -> [AutomatedEmailAction] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return ActionsSummary(totalCount: 0, timeSavedMinutes: 0, categories: [])
    }

    func getLearningInsights(userId: String) async throws -> [LearningInsight] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func undoAutomatedAction(actionId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func markContactAsVIP(userId: String, contactEmail: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    // MARK: - Calendar
    func getCalendarEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func getCalendarEvent(id: String) async throws -> CalendarEvent {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return CalendarEvent(
            id: id,
            title: "Mock Event",
            startTime: Date(),
            endTime: Date().addingTimeInterval(3600),
            location: nil,
            description: "Mock event description",
            attendees: [],
            color: .blue,
            hasConflict: false,
            hasPrep: false,
            meetingPrep: nil
        )
    }

    func getMeetingBrief(eventId: String) async throws -> MeetingBrief {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return MeetingBrief(
            id: UUID().uuidString,
            eventId: eventId,
            title: "Mock Meeting",
            startTime: Date(),
            endTime: Date().addingTimeInterval(3600),
            attendees: [],
            attendeeInsights: [],
            relevantEmails: [],
            previousMeetings: [],
            relatedTasks: [],
            keyDiscussionPoints: [],
            backgroundContext: "This is a mock meeting brief",
            preparationChecklist: [],
            suggestedTimeAllocation: [],
            confidence: 0.85,
            generatedAt: Date()
        )
    }

    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return CalendarEvent(
            id: UUID().uuidString,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            location: nil,
            description: event.description,
            attendees: [],
            color: .blue,
            hasConflict: false,
            hasPrep: false,
            meetingPrep: nil
        )
    }

    func updateEvent(id: String, event: CreateEventRequest) async throws -> CalendarEvent {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return CalendarEvent(
            id: id,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            location: nil,
            description: event.description,
            attendees: [],
            color: .blue,
            hasConflict: false,
            hasPrep: false,
            meetingPrep: nil
        )
    }

    func deleteEvent(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    // MARK: - Calendar Intelligence
    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return MeetingBrief(
            id: UUID().uuidString,
            eventId: eventId,
            title: "Mock Meeting",
            startTime: Date(),
            endTime: Date().addingTimeInterval(3600),
            attendees: [],
            attendeeInsights: [],
            relevantEmails: [],
            previousMeetings: [],
            relatedTasks: [],
            keyDiscussionPoints: [],
            backgroundContext: "Generated mock brief",
            preparationChecklist: [],
            suggestedTimeAllocation: [],
            confidence: 0.85,
            generatedAt: Date()
        )
    }

    func getCalendarOptimizations(userId: String) async throws -> [CalendarOptimization] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func acceptOptimization(optimizationId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func rejectOptimization(optimizationId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func getMeetingConflicts(userId: String) async throws -> [MeetingConflict] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    // MARK: - Tasks
    func getTasks(status: String?) async throws -> [TaskAPIModel] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func getTask(id: String) async throws -> TaskAPIModel {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return TaskAPIModel(
            id: id,
            title: "Mock Task",
            description: "This is a mock task",
            status: "pending",
            priority: "medium",
            dueDate: Date().addingTimeInterval(86400),
            createdAt: Date(),
            updatedAt: nil,
            userId: nil,
            isCompleted: false
        )
    }

    func createTask(task: CreateTaskRequest) async throws -> TaskAPIModel {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return TaskAPIModel(
            id: UUID().uuidString,
            title: task.title,
            description: task.description,
            status: "pending",
            priority: task.priority,
            dueDate: task.dueDate,
            createdAt: Date(),
            updatedAt: nil,
            userId: nil,
            isCompleted: false
        )
    }

    func updateTask(id: String, task: CreateTaskRequest) async throws -> TaskAPIModel {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return TaskAPIModel(
            id: id,
            title: task.title,
            description: task.description,
            status: "pending",
            priority: task.priority,
            dueDate: task.dueDate,
            createdAt: Date(),
            updatedAt: Date(),
            userId: nil,
            isCompleted: false
        )
    }

    func deleteTask(id: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func updateTaskStatus(taskId: String, status: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    // MARK: - Intelligence
    func getDailySnapshot(userId: String) async throws -> DailySnapshot {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }

        return DailySnapshot(
            id: UUID().uuidString,
            userId: userId,
            snapshotDate: Date(),
            priorityItems: [],
            pendingDecisions: [],
            meetingPreviews: [],
            predictions: [],
            generatedAt: Date()
        )
    }

    func refreshDailySnapshot(userId: String) async throws -> DailySnapshot {
        try await getDailySnapshot(userId: userId)
    }

    func getPriorityItems(userId: String) async throws -> [PriorityItem] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func getPendingDecisions(userId: String) async throws -> [PendingDecision] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func getPredictions(userId: String) async throws -> [Prediction] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    // MARK: - Actions
    func executeAction(_ action: SuggestedAction) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func getPendingActions(userId: String) async throws -> [ActionSuggestion] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func approveAction(actionId: String, userId: String, approved: Bool, modifications: [String: AnyCodable]?) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func undoAction(actionId: String, userId: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func getActionHistory(userId: String) async throws -> [ActionSuggestion] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    // MARK: - Decisions
    func getPendingDecisions(userId: String) async throws -> [Decision] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }

    func makeDecision(decisionId: String, userId: String, chosenOption: String?, reasoning: String?, status: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
    }

    func getDecisionHistory(userId: String) async throws -> [Decision] {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail { throw NetworkError.noInternetConnection }
        return []
    }
}
