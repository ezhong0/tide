import Foundation
import Supabase

/// Tide Supabase Manager for iOS
/// Handles authentication, database, and realtime subscriptions
class SupabaseManager: ObservableObject {

    // MARK: - Singleton
    static let shared = SupabaseManager()

    // MARK: - Properties
    private let client: SupabaseClient

    @Published var currentUser: User?
    @Published var isAuthenticated: Bool = false

    // MARK: - Initialization
    private init() {
        guard let supabaseURL = URL(string: Config.supabaseURL),
              let supabaseKey = Config.supabaseAnonKey else {
            fatalError("Missing Supabase configuration")
        }

        self.client = SupabaseClient(
            supabaseURL: supabaseURL,
            supabaseKey: supabaseKey
        )

        // Listen for auth state changes
        setupAuthStateListener()
    }

    // MARK: - Authentication

    /// Sign in with Google OAuth
    func signInWithGoogle() async throws {
        try await client.auth.signIn(
            provider: .google,
            scopes: "email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar",
            redirectTo: "com.tide.app://"
        )
    }

    /// Sign in with Microsoft OAuth
    func signInWithMicrosoft() async throws {
        try await client.auth.signIn(
            provider: .azure,
            scopes: "User.Read Mail.ReadWrite Calendars.ReadWrite offline_access",
            redirectTo: "com.tide.app://"
        )
    }

    /// Handle OAuth callback
    func handleOAuthCallback(url: URL) async throws {
        try await client.auth.session(from: url)
    }

    /// Sign out
    func signOut() async throws {
        try await client.auth.signOut()
    }

    /// Get current session
    func getCurrentSession() async throws -> Session? {
        return try await client.auth.session
    }

    // MARK: - User Profile

    /// Fetch user profile
    func fetchUserProfile() async throws -> UserProfile {
        guard let userId = currentUser?.id else {
            throw TideError.notAuthenticated
        }

        let response: UserProfile = try await client
            .from("user_profiles")
            .select()
            .eq("id", value: userId)
            .single()
            .execute()
            .value

        return response
    }

    /// Update user profile
    func updateUserProfile(_ profile: UserProfile) async throws {
        try await client
            .from("user_profiles")
            .update(profile)
            .eq("id", value: profile.id)
            .execute()
    }

    // MARK: - Conversations

    /// Fetch conversations
    func fetchConversations() async throws -> [DBConversation] {
        let response: [DBConversation] = try await client
            .from("conversations")
            .select()
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    /// Create conversation
    func createConversation(title: String) async throws -> DBConversation {
        let newConversation = CreateConversationRequest(
            title: title,
            userId: currentUser?.id ?? ""
        )

        let response: DBConversation = try await client
            .from("conversations")
            .insert(newConversation)
            .select()
            .single()
            .execute()
            .value

        return response
    }

    /// Fetch messages for conversation
    func fetchMessages(conversationId: String) async throws -> [DBMessage] {
        let response: [DBMessage] = try await client
            .from("messages")
            .select()
            .eq("conversation_id", value: conversationId)
            .order("created_at", ascending: true)
            .execute()
            .value

        return response
    }

    /// Send message
    func sendMessage(conversationId: String, content: String, role: String) async throws -> DBMessage {
        let newMessage = CreateMessageRequest(
            conversationId: conversationId,
            content: content,
            role: role
        )

        let response: DBMessage = try await client
            .from("messages")
            .insert(newMessage)
            .select()
            .single()
            .execute()
            .value

        return response
    }

    // MARK: - Realtime Subscriptions

    /// Subscribe to new messages in a conversation
    func subscribeToMessages(conversationId: String, onMessage: @escaping (DBMessage) -> Void) -> RealtimeChannel {
        let channel = client.channel("messages:\(conversationId)")

        let subscription = channel
            .on(.insert, filter: "conversation_id=eq.\(conversationId)") { message in
                if let payload = message.payload as? [String: Any],
                   let record = payload["record"] as? [String: Any] {
                    do {
                        let data = try JSONSerialization.data(withJSONObject: record)
                        let message = try JSONDecoder().decode(DBMessage.self, from: data)
                        onMessage(message)
                    } catch {
                        print("Error decoding message: \(error)")
                    }
                }
            }

        subscription.subscribe()

        return channel
    }

    /// Unsubscribe from channel
    func unsubscribe(channel: RealtimeChannel) {
        channel.unsubscribe()
    }

    // MARK: - Calendar Events

    /// Fetch calendar events
    func fetchCalendarEvents(from: Date, to: Date) async throws -> [DBCalendarEvent] {
        let response: [DBCalendarEvent] = try await client
            .from("calendar_events")
            .select()
            .gte("start_time", value: from.iso8601)
            .lte("end_time", value: to.iso8601)
            .order("start_time", ascending: true)
            .execute()
            .value

        return response
    }

    // MARK: - Tasks

    /// Fetch tasks
    func fetchTasks(status: TaskStatus? = nil) async throws -> [DBTask] {
        var query = client
            .from("tasks")
            .select()

        if let status = status {
            query = query.eq("status", value: status.rawValue)
        }

        let response: [DBTask] = try await query
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    /// Create task
    func createTask(title: String, description: String?, dueAt: Date?) async throws -> DBTask {
        let newTask = CreateTaskRequest(
            title: title,
            description: description,
            dueAt: dueAt,
            userId: currentUser?.id ?? ""
        )

        let response: DBTask = try await client
            .from("tasks")
            .insert(newTask)
            .select()
            .single()
            .execute()
            .value

        return response
    }

    /// Update task status
    func updateTaskStatus(taskId: String, status: TaskStatus) async throws {
        let update = ["status": status.rawValue]

        try await client
            .from("tasks")
            .update(update)
            .eq("id", value: taskId)
            .execute()
    }

    // MARK: - OAuth Tokens

    // Note: OAuth tokens are managed by backend services
    // Frontend should call AI/Email/Calendar services directly

    // MARK: - Private Helpers

    private func setupAuthStateListener() {
        client.auth.onAuthStateChange { [weak self] event, session in
            DispatchQueue.main.async {
                self?.currentUser = session?.user
                self?.isAuthenticated = session != nil
            }
        }
    }
}

// MARK: - Models

struct UserProfile: Codable {
    let id: String
    var fullName: String
    var avatarUrl: String?
    let primaryProvider: String
    var timezone: String
    var language: String
    var theme: String
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case avatarUrl = "avatar_url"
        case primaryProvider = "primary_provider"
        case timezone
        case language
        case theme
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct DBConversation: Codable, Identifiable {
    let id: String
    let userId: String
    var title: String?
    var summary: String?
    let messageCount: Int
    let lastMessageAt: Date?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case summary
        case messageCount = "message_count"
        case lastMessageAt = "last_message_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct DBMessage: Codable, Identifiable {
    let id: String
    let conversationId: String
    let role: String
    let content: String
    let tokensUsed: Int?
    let model: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case conversationId = "conversation_id"
        case role
        case content
        case tokensUsed = "tokens_used"
        case model
        case createdAt = "created_at"
    }
}

struct DBCalendarEvent: Codable, Identifiable {
    let id: String
    let userId: String
    let provider: String
    let title: String
    let description: String?
    let location: String?
    let startTime: Date
    let endTime: Date
    let timezone: String
    let isAllDay: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case provider
        case title
        case description
        case location
        case startTime = "start_time"
        case endTime = "end_time"
        case timezone
        case isAllDay = "is_all_day"
    }
}

struct DBTask: Codable, Identifiable {
    let id: String
    let userId: String
    var title: String
    var description: String?
    var status: String
    var priority: String
    var dueAt: Date?
    let completedAt: Date?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case description
        case status
        case priority
        case dueAt = "due_at"
        case completedAt = "completed_at"
        case createdAt = "created_at"
    }
}

enum TaskStatus: String, Codable {
    case pending
    case inProgress = "in_progress"
    case completed
    case cancelled
}

enum OAuthProvider: String {
    case google
    case microsoft
}

// MARK: - Request Models

struct CreateConversationRequest: Codable {
    let title: String?
    let userId: String

    enum CodingKeys: String, CodingKey {
        case title
        case userId = "user_id"
    }
}

struct CreateMessageRequest: Codable {
    let conversationId: String
    let content: String
    let role: String

    enum CodingKeys: String, CodingKey {
        case conversationId = "conversation_id"
        case content
        case role
    }
}

struct CreateTaskRequest: Codable {
    let title: String
    let description: String?
    let dueAt: Date?
    let userId: String

    enum CodingKeys: String, CodingKey {
        case title
        case description
        case dueAt = "due_at"
        case userId = "user_id"
    }
}

// MARK: - Errors

enum TideError: Error {
    case notAuthenticated
    case notImplemented(String)
}

// MARK: - Date Extension

extension Date {
    var iso8601: String {
        ISO8601DateFormatter().string(from: self)
    }
}
