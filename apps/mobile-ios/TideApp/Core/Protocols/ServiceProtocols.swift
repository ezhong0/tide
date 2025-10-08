/**
 * Service Protocols
 * Protocol definitions for dependency injection and testing
 */

import Foundation

// MARK: - API Client Protocol

protocol APIClientProtocol {
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
    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence
    func getAutomatedEmailActions(userId: String) async throws -> [AutomatedEmailAction]
    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary
    func getLearningInsights(userId: String) async throws -> [LearningInsight]
    func undoAutomatedAction(actionId: String, userId: String) async throws
    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws
    func markContactAsVIP(userId: String, contactEmail: String) async throws

    // MARK: - Calendar
    func getCalendarEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent]
    func getMeetingBrief(eventId: String) async throws -> MeetingBrief
    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent
    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief]
    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief
    func getCalendarOptimizations(userId: String) async throws -> [CalendarOptimization]
    func acceptOptimization(optimizationId: String, userId: String) async throws
    func rejectOptimization(optimizationId: String, userId: String) async throws
    func getMeetingConflicts(userId: String) async throws -> [MeetingConflict]
    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws
    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot]

    // MARK: - Tasks
    func getTasks(status: String?) async throws -> [Task]
    func createTask(task: CreateTaskRequest) async throws -> Task
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

// MARK: - Auth Manager Protocol

protocol AuthManagerProtocol: AnyObject {
    var isAuthenticated: Bool { get }
    var currentUser: User? { get }
    var accessToken: String? { get set }

    func login(email: String, password: String) async throws
    func loginWithOAuth(provider: OAuthProvider) async throws
    func logout()
    func refreshAccessToken() async throws
}

// MARK: - Supabase Manager Protocol

protocol SupabaseManagerProtocol: AnyObject {
    func getCurrentUserId() async -> String?
    func getUserProfile(userId: String) async throws -> UserProfile
    func query<T: Codable>(table: String, filters: [String: Any]?, orderBy: String?, limit: Int?) async throws -> [T]
    func insert<T: Codable>(table: String, data: T) async throws -> T
    func update<T: Codable>(table: String, id: String, data: T) async throws -> T
    func delete(table: String, id: String) async throws
    func uploadFile(bucket: String, path: String, data: Data) async throws -> String
}
