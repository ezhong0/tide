import Foundation
import SwiftUI

/// Calendar Service - Connects to Tide Calendar backend
class CalendarService {
    static let shared = CalendarService()

    private init() {}

    // MARK: - Request/Response Models

    struct EventResponse: Codable {
        let id: String
        let userId: String
        let title: String
        let description: String?
        let location: String?
        let startTime: Date
        let endTime: Date
        let isAllDay: Bool
        let attendees: [String]?
        let meetingUrl: String?
        let intelligence: EventIntelligence?

        struct EventIntelligence: Codable {
            let brief: MeetingBrief?
            let conflicts: [String]?
            let preparation: [String]?

            struct MeetingBrief: Codable {
                let summary: String?
                let keyDiscussionPoints: [String]?
                let preparationChecklist: [String]?
            }
        }
    }

    struct FetchEventsResponse: Codable {
        let events: [EventResponse]
        let count: Int
    }

    struct CreateEventRequest: Codable {
        let userId: String
        let title: String
        let description: String?
        let location: String?
        let startTime: Date
        let endTime: Date
        let isAllDay: Bool
        let attendees: [String]?
    }

    // MARK: - Public Methods

    /// Fetch calendar events from the API
    func fetchEvents(from startDate: Date? = nil, to endDate: Date? = nil) async throws -> [CalendarEvent] {
        // Get the current user ID from AuthManager
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw CalendarServiceError.notAuthenticated
        }

        // Build endpoint with optional date range
        var endpoint = "/api/calendar/events/\(userId)"

        if let start = startDate, let end = endDate {
            let formatter = ISO8601DateFormatter()
            endpoint += "?start=\(formatter.string(from: start))&end=\(formatter.string(from: end))"
        }

        do {
            let response: FetchEventsResponse = try await APIClient.shared.get(endpoint: endpoint)

            // Convert API response to app CalendarEvent models
            return response.events.compactMap { convertToCalendarEvent($0) }

        } catch {
            print("❌ Calendar fetch error: \(error)")
            throw CalendarServiceError.fetchFailed(error.localizedDescription)
        }
    }

    /// Create a new calendar event
    func createEvent(_ event: CalendarEvent) async throws {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw CalendarServiceError.notAuthenticated
        }

        let request = CreateEventRequest(
            userId: userId,
            title: event.title,
            description: event.description,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            isAllDay: false,  // Default to false, not supported in model yet
            attendees: event.attendees.map { $0.email }
        )

        let endpoint = "/api/calendar/events"

        do {
            let _: EventResponse = try await APIClient.shared.post(
                endpoint: endpoint,
                body: request
            )
            print("✅ Event created: \(event.title)")

        } catch {
            print("❌ Create event error: \(error)")
            throw CalendarServiceError.createFailed(error.localizedDescription)
        }
    }

    // MARK: - Private Helpers

    private func convertToCalendarEvent(_ response: EventResponse) -> CalendarEvent? {
        // Parse meeting prep from intelligence
        var meetingPrep: MeetingPrep? = nil
        if let brief = response.intelligence?.brief {
            meetingPrep = MeetingPrep(
                agenda: brief.summary ?? "",
                keyPoints: brief.keyDiscussionPoints ?? [],
                participants: response.attendees ?? [],
                requiredDocuments: response.intelligence?.preparation,
                aiInsights: brief.preparationChecklist?.joined(separator: "\n")
            )
        }

        // Determine color based on event properties
        let colorValue: Color
        if response.meetingUrl != nil {
            colorValue = .blue  // Video calls
        } else if response.attendees?.isEmpty == false {
            colorValue = .purple  // Meetings with attendees
        } else {
            colorValue = .green  // Personal events
        }

        // Convert attendee emails to Attendee objects
        let attendeeObjects = (response.attendees ?? []).map { email in
            Attendee(name: email, email: email, status: .accepted)
        }

        return CalendarEvent(
            id: response.id,
            title: response.title,
            description: response.description,
            startTime: response.startTime,
            endTime: response.endTime,
            location: response.location,
            attendees: attendeeObjects,
            color: CodableColor(color: colorValue),
            hasPrep: meetingPrep != nil,
            meetingPrep: meetingPrep,
            status: .confirmed
        )
    }
}

// MARK: - Errors
enum CalendarServiceError: LocalizedError {
    case notAuthenticated
    case fetchFailed(String)
    case createFailed(String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User not authenticated. Please login first."
        case .fetchFailed(let message):
            return "Failed to fetch events: \(message)"
        case .createFailed(let message):
            return "Failed to create event: \(message)"
        }
    }
}
