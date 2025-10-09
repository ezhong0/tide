/**
 * Mock Supabase Manager
 * Mock implementation for testing and preview purposes
 */

import Foundation
import Supabase

@MainActor
final class MockSupabaseManager: ObservableObject, SupabaseManagerProtocol {
    // MARK: - Published Properties
    @Published var currentUser: User?
    @Published var isAuthenticated: Bool

    // MARK: - Mock Data Control
    var shouldFail: Bool = false
    var mockDelay: TimeInterval = 0.3

    // MARK: - Initialization
    init(isAuthenticated: Bool = false, currentUser: User? = nil) {
        self.isAuthenticated = isAuthenticated
        self.currentUser = currentUser
    }

    // MARK: - Authentication
    func signIn(email: String, password: String) async throws -> Session {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        let mockUser = User(
            id: UUID(),
            aud: "authenticated",
            role: "authenticated",
            email: email,
            emailConfirmedAt: Date(),
            phone: nil,
            confirmedAt: Date(),
            lastSignInAt: Date(),
            appMetadata: [:],
            userMetadata: ["full_name": .string("Mock User")],
            identities: [],
            createdAt: Date(),
            updatedAt: Date()
        )

        currentUser = mockUser
        isAuthenticated = true

        return Session(
            accessToken: "mock-access-token",
            tokenType: "bearer",
            expiresIn: 3600,
            expiresAt: Date().addingTimeInterval(3600).timeIntervalSince1970,
            refreshToken: "mock-refresh-token",
            user: mockUser
        )
    }

    func signUp(email: String, password: String, data: [String: AnyJSON]?) async throws -> Session {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        let mockUser = User(
            id: UUID(),
            aud: "authenticated",
            role: "authenticated",
            email: email,
            emailConfirmedAt: Date(),
            phone: nil,
            confirmedAt: Date(),
            lastSignInAt: Date(),
            appMetadata: [:],
            userMetadata: data ?? [:],
            identities: [],
            createdAt: Date(),
            updatedAt: Date()
        )

        currentUser = mockUser
        isAuthenticated = true

        return Session(
            accessToken: "mock-access-token",
            tokenType: "bearer",
            expiresIn: 3600,
            expiresAt: Date().addingTimeInterval(3600).timeIntervalSince1970,
            refreshToken: "mock-refresh-token",
            user: mockUser
        )
    }

    func signInWithGoogle() async throws {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }
        isAuthenticated = true
    }

    func signInWithMicrosoft() async throws {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }
        isAuthenticated = true
    }

    func handleOAuthCallback(url: URL) async throws {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }
        isAuthenticated = true
    }

    func signOut() async throws {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }
        currentUser = nil
        isAuthenticated = false
    }

    func getCurrentSession() async throws -> Session? {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        guard isAuthenticated, let user = currentUser else {
            return nil
        }

        return Session(
            accessToken: "mock-access-token",
            tokenType: "bearer",
            expiresIn: 3600,
            expiresAt: Date().addingTimeInterval(3600).timeIntervalSince1970,
            refreshToken: "mock-refresh-token",
            user: user
        )
    }

    // MARK: - User Profile
    func fetchUserProfile() async throws -> UserProfile {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return UserProfile(
            id: currentUser?.id.uuidString ?? UUID().uuidString,
            fullName: "Mock User",
            avatarUrl: nil,
            primaryProvider: "google",
            timezone: "UTC",
            language: "en",
            theme: "light",
            createdAt: Date(),
            updatedAt: Date()
        )
    }

    func updateUserProfile(_ profile: UserProfile) async throws {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }
    }

    // MARK: - Conversations
    func fetchConversations() async throws -> [DBConversation] {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return [
            DBConversation(
                id: UUID().uuidString,
                userId: currentUser?.id.uuidString ?? "",
                title: "Mock Conversation",
                summary: "A mock conversation for testing",
                messageCount: 2,
                lastMessageAt: Date(),
                createdAt: Date(),
                updatedAt: Date()
            )
        ]
    }

    func createConversation(title: String) async throws -> DBConversation {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return DBConversation(
            id: UUID().uuidString,
            userId: currentUser?.id.uuidString ?? "",
            title: title,
            summary: nil,
            messageCount: 0,
            lastMessageAt: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }

    func fetchMessages(conversationId: String) async throws -> [DBMessage] {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return [
            DBMessage(
                id: UUID().uuidString,
                conversationId: conversationId,
                role: "user",
                content: "Hello",
                tokensUsed: 10,
                model: "gpt-4",
                createdAt: Date()
            )
        ]
    }

    func sendMessage(conversationId: String, content: String, role: String) async throws -> DBMessage {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return DBMessage(
            id: UUID().uuidString,
            conversationId: conversationId,
            role: role,
            content: content,
            tokensUsed: 15,
            model: "gpt-4",
            createdAt: Date()
        )
    }

    // MARK: - Realtime Subscriptions
    func subscribeToMessages(conversationId: String, onMessage: @escaping (DBMessage) -> Void) -> RealtimeChannel {
        // Return a mock channel - in real implementation this would be a proper Supabase channel
        // For mock, we create a dummy channel that does nothing
        let mockClient = SupabaseClient(
            supabaseURL: URL(string: "https://mock.supabase.co")!,
            supabaseKey: "mock-key"
        )
        return mockClient.channel("mock-\(conversationId)")
    }

    func unsubscribe(channel: RealtimeChannel) {
        // Mock implementation - do nothing
    }

    // MARK: - Calendar Events
    func fetchCalendarEvents(from: Date, to: Date) async throws -> [DBCalendarEvent] {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return [
            DBCalendarEvent(
                id: UUID().uuidString,
                userId: currentUser?.id.uuidString ?? "",
                provider: "google",
                title: "Mock Event",
                description: "A mock calendar event",
                location: nil,
                startTime: Date(),
                endTime: Date().addingTimeInterval(3600),
                timezone: "UTC",
                isAllDay: false
            )
        ]
    }

    // MARK: - Tasks
    func fetchTasks(status: DBTaskStatus?) async throws -> [DBTask] {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return [
            DBTask(
                id: UUID().uuidString,
                userId: currentUser?.id.uuidString ?? "",
                title: "Mock Task",
                description: "A mock task for testing",
                status: "pending",
                priority: "medium",
                dueAt: Date().addingTimeInterval(86400),
                completedAt: nil,
                createdAt: Date()
            )
        ]
    }

    func createTask(title: String, description: String?, dueAt: Date?) async throws -> DBTask {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }

        return DBTask(
            id: UUID().uuidString,
            userId: currentUser?.id.uuidString ?? "",
            title: title,
            description: description,
            status: "pending",
            priority: "medium",
            dueAt: dueAt,
            completedAt: nil,
            createdAt: Date()
        )
    }

    func updateTaskStatus(taskId: String, status: DBTaskStatus) async throws {
        try await Swift.Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.notAuthenticated
        }
    }
}
