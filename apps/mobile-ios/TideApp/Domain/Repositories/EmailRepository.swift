/**
 * Email Repository Protocol
 * Defines interface for email data access
 */

import Foundation

protocol EmailRepository {
    // MARK: - Email Operations
    func getEmails(category: String?) async throws -> [Email]
    func getEmail(id: String) async throws -> Email
    func sendEmail(to: [String], subject: String, body: String) async throws
    func deleteEmail(id: String) async throws

    // MARK: - Draft Operations
    func generateDrafts(emailId: String, userId: String, context: EmailComposeContext?) async throws -> [EmailDraft]
    func saveDraft(draft: EmailDraft) async throws

    // MARK: - Connection
    func checkConnection() async throws -> Bool
    func getGmailAuthURL() async throws -> String

    // MARK: - Intelligence
    func getRelationship(userId: String, contactEmail: String) async throws -> RelationshipIntelligence
    func getAutomatedActions(userId: String) async throws -> [AutomatedEmailAction]
    func getAutomatedActionsSummary(userId: String) async throws -> ActionsSummary
    func getLearningInsights(userId: String) async throws -> [LearningInsight]
    func undoAutomatedAction(actionId: String, userId: String) async throws
    func provideActionFeedback(actionId: String, userId: String, feedback: String) async throws
    func markContactAsVIP(userId: String, contactEmail: String) async throws
}
