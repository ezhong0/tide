/**
 * API Client Protocol
 * Defines the interface for HTTP communication with backend services
 * Allows for dependency injection and testability
 */

import Foundation

protocol APIClientProtocol {
    // MARK: - Auth
    func getAuthToken() -> String?

    // MARK: - Chat
    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse
    func getConversations() async throws -> [Conversation]
    func getConversationMessages(conversationId: String) async throws -> [ChatMessage]

    // MARK: - Email
    func getEmails(category: String?) async throws -> [Email]
    func getEmailDetail(id: String) async throws -> Email
    func generateEmailDrafts(emailId: String) async throws -> [EmailDraft]
    func generateEmailDrafts(emailId: String, userId: String, context: EmailComposeContext?) async throws -> [EmailDraft]
    func sendEmail(to: [String], subject: String, body: String) async throws
    func getGmailAuthURL() async throws -> String
    func checkEmailConnection() async throws -> Bool

    // Email Actions
    func getEmailThread(id: String) async throws -> [Email]
    func markEmailRead(id: String) async throws
    func markEmailUnread(id: String) async throws
    func starEmail(id: String) async throws
    func unstarEmail(id: String) async throws
    func archiveEmail(id: String) async throws
    func deleteEmail(id: String) async throws
    func replyToEmail(id: String, body: String) async throws
    func forwardEmail(id: String, to: [String], body: String) async throws

    // MARK: - Email Intelligence
    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence
    func getAutomatedEmailActions(userId: String) async throws -> [AutomatedEmailAction]
    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary
    func getLearningInsights(userId: String) async throws -> [LearningInsight]
    func undoAutomatedAction(actionId: String, userId: String) async throws
    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws
    func markContactAsVIP(userId: String, contactEmail: String) async throws

    // MARK: - Calendar
    func getCalendarEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent]
    func getCalendarEvent(id: String) async throws -> CalendarEvent
    func getMeetingBrief(eventId: String) async throws -> MeetingBrief
    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent
    func updateEvent(id: String, event: CreateEventRequest) async throws -> CalendarEvent
    func deleteEvent(id: String) async throws

    // MARK: - Calendar Intelligence
    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief]
    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief
    func getCalendarOptimizations(userId: String) async throws -> [CalendarOptimization]
    func acceptOptimization(optimizationId: String, userId: String) async throws
    func rejectOptimization(optimizationId: String, userId: String) async throws
    func getMeetingConflicts(userId: String) async throws -> [MeetingConflict]
    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws
    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot]

    // MARK: - Tasks
    func getTasks(status: String?) async throws -> [TaskAPIModel]
    func getTask(id: String) async throws -> TaskAPIModel
    func createTask(task: CreateTaskRequest) async throws -> TaskAPIModel
    func updateTask(id: String, task: CreateTaskRequest) async throws -> TaskAPIModel
    func deleteTask(id: String) async throws
    func updateTaskStatus(taskId: String, status: String) async throws

    // MARK: - Intelligence
    func getDailySnapshot(userId: String) async throws -> DailySnapshot
    func refreshDailySnapshot(userId: String) async throws -> DailySnapshot
    func getPriorityItems(userId: String) async throws -> [PriorityItem]
    func getPendingDecisions(userId: String) async throws -> [PendingDecision]
    func getPredictions(userId: String) async throws -> [Prediction]

    // MARK: - Actions
    func executeAction(_ action: SuggestedAction) async throws
    func getPendingActions(userId: String) async throws -> [ActionSuggestion]
    func approveAction(actionId: String, userId: String, approved: Bool, modifications: [String: AnyCodable]?) async throws
    func undoAction(actionId: String, userId: String) async throws
    func getActionHistory(userId: String) async throws -> [ActionSuggestion]

    // MARK: - Decisions
    func getPendingDecisions(userId: String) async throws -> [Decision]
    func makeDecision(decisionId: String, userId: String, chosenOption: String?, reasoning: String?, status: String) async throws
    func getDecisionHistory(userId: String) async throws -> [Decision]
}
