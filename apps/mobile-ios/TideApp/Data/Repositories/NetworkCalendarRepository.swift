/**
 * Network Calendar Repository
 * Concrete implementation of CalendarRepository using API Client
 */

import Foundation

final class NetworkCalendarRepository: CalendarRepository {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    // MARK: - Event Operations

    func getEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent] {
        return try await apiClient.getCalendarEvents(startDate: startDate, endDate: endDate)
    }

    func getEvent(id: String) async throws -> CalendarEvent {
        return try await apiClient.getCalendarEvent(id: id)
    }

    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent {
        return try await apiClient.createEvent(event: event)
    }

    func updateEvent(id: String, event: CreateEventRequest) async throws -> CalendarEvent {
        return try await apiClient.updateEvent(id: id, event: event)
    }

    func deleteEvent(id: String) async throws {
        try await apiClient.deleteEvent(id: id)
    }

    // MARK: - Meeting Briefs

    func getMeetingBrief(eventId: String) async throws -> MeetingBrief {
        return try await apiClient.getMeetingBrief(eventId: eventId)
    }

    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief] {
        return try await apiClient.getMeetingBriefs(userId: userId)
    }

    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief {
        return try await apiClient.generateMeetingBrief(eventId: eventId, userId: userId)
    }

    // MARK: - Intelligence

    func getOptimizations(userId: String) async throws -> [CalendarOptimization] {
        return try await apiClient.getCalendarOptimizations(userId: userId)
    }

    func acceptOptimization(optimizationId: String, userId: String) async throws {
        try await apiClient.acceptOptimization(optimizationId: optimizationId, userId: userId)
    }

    func rejectOptimization(optimizationId: String, userId: String) async throws {
        try await apiClient.rejectOptimization(optimizationId: optimizationId, userId: userId)
    }

    func getConflicts(userId: String) async throws -> [MeetingConflict] {
        return try await apiClient.getMeetingConflicts(userId: userId)
    }

    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws {
        try await apiClient.resolveConflict(conflictId: conflictId, userId: userId, resolution: resolution)
    }

    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot] {
        return try await apiClient.findOptimalTimeSlots(title: title, attendees: attendees, durationMinutes: durationMinutes, userId: userId)
    }
}
