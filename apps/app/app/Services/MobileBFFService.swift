import Foundation

/// Mobile BFF Service
/// Provides aggregated screen-based endpoints optimized for mobile
class MobileBFFService {
    static let shared = MobileBFFService()

    private init() {}

    // MARK: - Screen Response Models

    struct DashboardResponse: Codable {
        let user: UserProfile?
        let stats: DashboardStats
        let upcomingEvents: [UpcomingEvent]
        let priorityEmails: [PriorityEmail]
        let todayTasks: [TodayTask]
        let aiSummary: String
        let metadata: Metadata
    }

    struct UserProfile: Codable {
        let id: String
        let email: String
        let name: String?
    }

    struct DashboardStats: Codable {
        let unreadEmails: Int
        let upcomingEvents: Int
        let todayTasks: Int
    }

    struct UpcomingEvent: Codable {
        let id: String
        let title: String
        let start: Date
        let end: Date
        let location: String?
        let attendeeCount: Int
    }

    struct PriorityEmail: Codable {
        let id: String
        let subject: String
        let from: String
        let receivedAt: Date
        let priority: Int
        let summary: String?
    }

    struct TodayTask: Codable {
        let id: String
        let title: String
        let dueAt: Date?
        let priority: String
        let status: String
    }

    struct InboxResponse: Codable {
        let emails: [InboxEmail]
        let total: Int
        let filter: String
        let pagination: Pagination
        let metadata: Metadata
    }

    struct InboxEmail: Codable {
        let id: String
        let subject: String
        let from: String
        let snippet: String
        let receivedAt: Date
        let isRead: Bool
        let isFlagged: Bool
        let isVIP: Bool
        let priority: Int
        let category: String?
        let hasAttachment: Bool
    }

    struct Pagination: Codable {
        let limit: Int
        let offset: Int
        let hasMore: Bool
    }

    struct Metadata: Codable {
        let fetchedAt: Date
        let took: Int
    }

    struct ChatResponse: Codable {
        let conversations: [Conversation]
        let context: ChatContext
        let suggestedQueries: [String]
        let metadata: Metadata
    }

    struct Conversation: Codable {
        let id: String
        let title: String?
        let createdAt: Date
        let updatedAt: Date
    }

    struct ChatContext: Codable {
        let unreadEmails: Int
        let upcomingEvents: [UpcomingEvent]
        let pendingTasks: [TodayTask]
    }

    struct ProfileResponse: Codable {
        let profile: UserProfile?
        let connectedAccounts: [ConnectedAccount]
        let stats: ProfileStats
        let metadata: Metadata
    }

    struct ConnectedAccount: Codable {
        let provider: String
        let service: String
        let createdAt: Date
    }

    struct ProfileStats: Codable {
        let totalEmails: Int
        let totalEvents: Int
        let totalTasks: Int
    }

    struct CalendarResponse: Codable {
        let events: [CalendarEvent]
        let conflicts: [CalendarConflict]
        let upcomingBriefs: [MeetingBrief]
        let stats: CalendarStats
        let metadata: Metadata
    }

    struct CalendarEvent: Codable {
        let id: String
        let title: String
        let start: Date
        let end: Date
        let allDay: Bool
        let location: String?
        let attendees: [String]?
        let status: String
        let hasConflict: Bool
    }

    struct CalendarConflict: Codable {
        let eventIds: [String]
        let type: String
        let severity: String
    }

    struct MeetingBrief: Codable {
        let eventId: String?
        let summary: String?
        let keyPoints: [String]?
        let participants: [String]?
    }

    struct CalendarStats: Codable {
        let totalEvents: Int
        let conflicts: Int
        let meetingsToday: Int
    }

    struct MeetingDetailResponse: Codable {
        let event: CalendarEvent
        let brief: MeetingBrief?
        let conflicts: [CalendarConflict]
        let alternativeSlots: [String]
        let metadata: Metadata
    }

    // MARK: - Public Methods

    /// Fetch dashboard data (aggregated)
    func fetchDashboard() async throws -> DashboardResponse {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw MobileBFFError.notAuthenticated
        }

        let endpoint = "/api/mobile/v1/screen/dashboard?userId=\(userId)"

        let response: DashboardResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response
    }

    /// Fetch inbox emails (with triage data)
    func fetchInbox(filter: String = "all", limit: Int = 20, offset: Int = 0) async throws -> InboxResponse {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw MobileBFFError.notAuthenticated
        }

        let endpoint = "/api/mobile/v1/screen/inbox?userId=\(userId)&filter=\(filter)&limit=\(limit)&offset=\(offset)"

        let response: InboxResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response
    }

    /// Fetch chat screen data
    func fetchChatScreen(limit: Int = 20) async throws -> ChatResponse {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw MobileBFFError.notAuthenticated
        }

        let endpoint = "/api/mobile/v1/screen/chat?userId=\(userId)&limit=\(limit)"

        let response: ChatResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response
    }

    /// Fetch profile screen data
    func fetchProfile() async throws -> ProfileResponse {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw MobileBFFError.notAuthenticated
        }

        let endpoint = "/api/mobile/v1/screen/profile?userId=\(userId)"

        let response: ProfileResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response
    }

    /// Fetch calendar screen data
    func fetchCalendar(startDate: Date? = nil, endDate: Date? = nil) async throws -> CalendarResponse {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw MobileBFFError.notAuthenticated
        }

        var endpoint = "/api/mobile/v1/screen/calendar?userId=\(userId)"

        // Add date range if provided
        if let start = startDate, let end = endDate {
            let formatter = ISO8601DateFormatter()
            endpoint += "&startDate=\(formatter.string(from: start))&endDate=\(formatter.string(from: end))"
        }

        let response: CalendarResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response
    }

    /// Fetch meeting detail
    func fetchMeetingDetail(eventId: String) async throws -> MeetingDetailResponse {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw MobileBFFError.notAuthenticated
        }

        let endpoint = "/api/mobile/v1/screen/meeting/\(eventId)?userId=\(userId)"

        let response: MeetingDetailResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response
    }
}

// MARK: - Errors
enum MobileBFFError: LocalizedError {
    case notAuthenticated

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User not authenticated. Please login first."
        }
    }
}
