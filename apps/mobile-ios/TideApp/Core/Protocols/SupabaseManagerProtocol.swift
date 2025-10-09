/**
 * Supabase Manager Protocol
 * Defines the interface for Supabase database and auth operations
 * Allows for dependency injection and testability
 */

import Foundation
import Supabase

protocol SupabaseManagerProtocol: ObservableObject {
    // MARK: - Published Properties
    var currentUser: User? { get set }
    var isAuthenticated: Bool { get set }

    // MARK: - Authentication
    func signIn(email: String, password: String) async throws -> Session
    func signUp(email: String, password: String, data: [String: AnyJSON]?) async throws -> Session
    func signInWithGoogle() async throws
    func signInWithMicrosoft() async throws
    func handleOAuthCallback(url: URL) async throws
    func signOut() async throws
    func getCurrentSession() async throws -> Session?

    // MARK: - User Profile
    func fetchUserProfile() async throws -> UserProfile
    func updateUserProfile(_ profile: UserProfile) async throws

    // MARK: - Conversations
    func fetchConversations() async throws -> [DBConversation]
    func createConversation(title: String) async throws -> DBConversation
    func fetchMessages(conversationId: String) async throws -> [DBMessage]
    func sendMessage(conversationId: String, content: String, role: String) async throws -> DBMessage

    // MARK: - Realtime Subscriptions
    func subscribeToMessages(conversationId: String, onMessage: @escaping (DBMessage) -> Void) -> RealtimeChannel
    func unsubscribe(channel: RealtimeChannel)

    // MARK: - Calendar Events
    func fetchCalendarEvents(from: Date, to: Date) async throws -> [DBCalendarEvent]

    // MARK: - Tasks
    func fetchTasks(status: DBTaskStatus?) async throws -> [DBTask]
    func createTask(title: String, description: String?, dueAt: Date?) async throws -> DBTask
    func updateTaskStatus(taskId: String, status: DBTaskStatus) async throws
}
