/**
 * API Endpoint Definitions
 * Centralized, type-safe API endpoint definitions
 */

import Foundation

enum Endpoint {
    // MARK: - AI Service
    case aiChat
    case aiConversations
    case aiConversationMessages(conversationId: String)
    case aiConversationDelete(conversationId: String)

    // MARK: - Email Service
    case emailMessages(query: String? = nil)
    case emailMessage(id: String)
    case emailThread(id: String)
    case emailMarkRead(id: String)
    case emailMarkUnread(id: String)
    case emailStar(id: String)
    case emailUnstar(id: String)
    case emailArchive(id: String)
    case emailDelete(id: String)
    case emailComposeDrafts(emailId: String)
    case emailCreateDraft
    case emailSend
    case emailReply(id: String)
    case emailForward(id: String)
    case emailOAuthGoogleURL
    case emailStatus
    case emailRelationship(userId: String, email: String)
    case emailAutomatedActions(userId: String)
    case emailAutomatedActionsSummary(userId: String)
    case emailLearningInsights(userId: String)
    case emailAutomatedActionUndo(actionId: String)
    case emailAutomatedActionFeedback(actionId: String)
    case emailRelationshipVIP(userId: String)

    // MARK: - Calendar Service
    case calendarEvents(start: String? = nil, end: String? = nil)
    case calendarEvent(id: String)
    case calendarEventBrief(eventId: String)
    case calendarCreateEvent
    case calendarUpdateEvent(id: String)
    case calendarDeleteEvent(id: String)
    case calendarBriefs(userId: String)
    case calendarGenerateBrief
    case calendarOptimizations(userId: String)
    case calendarOptimizationAccept(optimizationId: String)
    case calendarOptimizationReject(optimizationId: String)
    case calendarConflicts(userId: String)
    case calendarConflictResolve(conflictId: String)
    case calendarFindTimeSlots

    // MARK: - Workflow Service
    case workflowTasks(status: String? = nil, priority: String? = nil)
    case workflowTask(id: String)
    case workflowCreateTask
    case workflowUpdateTask(id: String)
    case workflowDeleteTask(id: String)
    case workflowTaskStatus(taskId: String)

    // MARK: - Intelligence Service
    case intelligenceDailySnapshot(userId: String)
    case intelligenceGenerateSnapshot(userId: String)
    case intelligencePriorityItems(userId: String)
    case intelligencePendingDecisions(userId: String)
    case intelligencePredictions(userId: String)

    // MARK: - Actions Service
    case aiActionsExecute
    case actionsPending(userId: String)
    case actionsApprove(actionId: String)
    case actionsUndo(actionId: String)
    case actionsHistory(userId: String)

    // MARK: - Decisions Service
    case decisionsPending(userId: String)
    case decisionsDecide(decisionId: String)
    case decisionsHistory(userId: String)

    /// The path string for this endpoint
    var path: String {
        switch self {
        // AI Service
        case .aiChat:
            return "/api/ai/chat"
        case .aiConversations:
            return "/api/ai/conversations"
        case .aiConversationMessages(let conversationId):
            return "/api/ai/conversations/\(conversationId)/messages"
        case .aiConversationDelete(let conversationId):
            return "/api/ai/conversations/\(conversationId)"

        // Email Service
        case .emailMessages(let query):
            var path = "/api/email/messages"
            if let query = query {
                path += "?query=\(query)"
            }
            return path
        case .emailMessage(let id):
            return "/api/email/messages/\(id)"
        case .emailThread(let id):
            return "/api/email/messages/\(id)/thread"
        case .emailMarkRead(let id):
            return "/api/email/messages/\(id)/read"
        case .emailMarkUnread(let id):
            return "/api/email/messages/\(id)/unread"
        case .emailStar(let id):
            return "/api/email/messages/\(id)/star"
        case .emailUnstar(let id):
            return "/api/email/messages/\(id)/unstar"
        case .emailArchive(let id):
            return "/api/email/messages/\(id)/archive"
        case .emailDelete(let id):
            return "/api/email/messages/\(id)"
        case .emailComposeDrafts(let emailId):
            return "/api/email/compose/\(emailId)/drafts"
        case .emailCreateDraft:
            return "/api/email/compose/drafts"
        case .emailSend:
            return "/api/email/send"
        case .emailReply(let id):
            return "/api/email/messages/\(id)/reply"
        case .emailForward(let id):
            return "/api/email/messages/\(id)/forward"
        case .emailOAuthGoogleURL:
            return "/api/email/oauth/google/url"
        case .emailStatus:
            return "/api/email/status"
        case .emailRelationship(let userId, let email):
            let encodedEmail = email.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? email
            return "/api/email/relationship/\(userId)/\(encodedEmail)"
        case .emailAutomatedActions(let userId):
            return "/api/email/automated-actions/\(userId)"
        case .emailAutomatedActionsSummary(let userId):
            return "/api/email/automated-actions/\(userId)/summary"
        case .emailLearningInsights(let userId):
            return "/api/email/learning/\(userId)/insights"
        case .emailAutomatedActionUndo(let actionId):
            return "/api/email/automated-actions/\(actionId)/undo"
        case .emailAutomatedActionFeedback(let actionId):
            return "/api/email/automated-actions/\(actionId)/feedback"
        case .emailRelationshipVIP(let userId):
            return "/api/email/relationship/\(userId)/vip"

        // Calendar Service
        case .calendarEvents(let start, let end):
            var path = "/api/calendar/events"
            if let start = start, let end = end {
                path += "?start=\(start)&end=\(end)"
            }
            return path
        case .calendarEvent(let id):
            return "/api/calendar/events/\(id)"
        case .calendarEventBrief(let eventId):
            return "/api/calendar/events/\(eventId)/brief"
        case .calendarCreateEvent:
            return "/api/calendar/events"
        case .calendarUpdateEvent(let id):
            return "/api/calendar/events/\(id)"
        case .calendarDeleteEvent(let id):
            return "/api/calendar/events/\(id)"
        case .calendarBriefs(let userId):
            return "/api/calendar/briefs/\(userId)"
        case .calendarGenerateBrief:
            return "/api/calendar/briefs/generate"
        case .calendarOptimizations(let userId):
            return "/api/calendar/optimizations/\(userId)"
        case .calendarOptimizationAccept(let optimizationId):
            return "/api/calendar/optimizations/\(optimizationId)/accept"
        case .calendarOptimizationReject(let optimizationId):
            return "/api/calendar/optimizations/\(optimizationId)/reject"
        case .calendarConflicts(let userId):
            return "/api/calendar/conflicts/\(userId)"
        case .calendarConflictResolve(let conflictId):
            return "/api/calendar/conflicts/\(conflictId)/resolve"
        case .calendarFindTimeSlots:
            return "/api/calendar/schedule/find-slots"

        // Workflow Service
        case .workflowTasks(let status, let priority):
            var path = "/api/workflow/tasks"
            var queryParams: [String] = []
            if let status = status {
                queryParams.append("status=\(status)")
            }
            if let priority = priority {
                queryParams.append("priority=\(priority)")
            }
            if !queryParams.isEmpty {
                path += "?" + queryParams.joined(separator: "&")
            }
            return path
        case .workflowTask(let id):
            return "/api/workflow/tasks/\(id)"
        case .workflowCreateTask:
            return "/api/workflow/tasks"
        case .workflowUpdateTask(let id):
            return "/api/workflow/tasks/\(id)"
        case .workflowDeleteTask(let id):
            return "/api/workflow/tasks/\(id)"
        case .workflowTaskStatus(let taskId):
            return "/api/workflow/tasks/\(taskId)/status"

        // Intelligence Service
        case .intelligenceDailySnapshot(let userId):
            return "/api/intelligence/daily-snapshot/\(userId)"
        case .intelligenceGenerateSnapshot(let userId):
            return "/api/intelligence/daily-snapshot/\(userId)"
        case .intelligencePriorityItems(let userId):
            return "/api/intelligence/priority-items/\(userId)"
        case .intelligencePendingDecisions(let userId):
            return "/api/intelligence/pending-decisions/\(userId)"
        case .intelligencePredictions(let userId):
            return "/api/intelligence/predictions/\(userId)"

        // Actions Service
        case .aiActionsExecute:
            return "/api/ai/actions/execute"
        case .actionsPending(let userId):
            return "/api/actions/pending/\(userId)"
        case .actionsApprove(let actionId):
            return "/api/actions/\(actionId)/approve"
        case .actionsUndo(let actionId):
            return "/api/actions/\(actionId)/undo"
        case .actionsHistory(let userId):
            return "/api/actions/history/\(userId)"

        // Decisions Service
        case .decisionsPending(let userId):
            return "/api/decisions/pending/\(userId)"
        case .decisionsDecide(let decisionId):
            return "/api/decisions/\(decisionId)/decide"
        case .decisionsHistory(let userId):
            return "/api/decisions/history/\(userId)"
        }
    }
}
