/**
 * Network Email Repository
 * Concrete implementation of EmailRepository using API Client
 */

import Foundation

class NetworkEmailRepository: EmailRepository {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    // MARK: - Email Operations

    func getEmails(category: String?) async throws -> [Email] {
        return try await apiClient.getEmails(category: category)
    }

    func getEmail(id: String) async throws -> Email {
        return try await apiClient.getEmailDetail(id: id)
    }

    func sendEmail(to: [String], subject: String, body: String) async throws {
        try await apiClient.sendEmail(to: to, subject: subject, body: body)
    }

    func deleteEmail(id: String) async throws {
        // TODO: Implement delete endpoint when backend is ready
        throw RepositoryError.notImplemented
    }

    // MARK: - Draft Operations

    func generateDrafts(emailId: String, userId: String, context: EmailComposeContext?) async throws -> [EmailDraft] {
        return try await apiClient.generateEmailDrafts(emailId: emailId, userId: userId, context: context)
    }

    func saveDraft(draft: EmailDraft) async throws {
        // TODO: Implement save draft endpoint when backend is ready
        throw RepositoryError.notImplemented
    }

    // MARK: - Connection

    func checkConnection() async throws -> Bool {
        return try await apiClient.checkEmailConnection()
    }

    func getGmailAuthURL() async throws -> String {
        return try await apiClient.getGmailAuthURL()
    }

    // MARK: - Intelligence

    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence {
        return try await apiClient.getRelationship(userId: userId, contactEmail: contactEmail)
    }

    func getAutomatedActions(userId: String) async throws -> [AutomatedEmailAction] {
        return try await apiClient.getAutomatedEmailActions(userId: userId)
    }

    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary {
        return try await apiClient.getAutomatedActionsSummary(userId: userId)
    }

    func getLearningInsights(userId: String) async throws -> [LearningInsight] {
        return try await apiClient.getLearningInsights(userId: userId)
    }

    func undoAutomatedAction(actionId: String, userId: String) async throws {
        try await apiClient.undoAutomatedAction(actionId: actionId, userId: userId)
    }

    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws {
        try await apiClient.provideActionFeedback(actionId: actionId, userId: userId, feedback: feedback)
    }

    func markContactAsVIP(userId: String, contactEmail: String) async throws {
        try await apiClient.markContactAsVIP(userId: userId, contactEmail: contactEmail)
    }
}

// MARK: - Repository Error

enum RepositoryError: LocalizedError {
    case notImplemented
    case notFound
    case invalidData

    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "This feature is not yet implemented."
        case .notFound:
            return "The requested item was not found."
        case .invalidData:
            return "The data received was invalid."
        }
    }
}
