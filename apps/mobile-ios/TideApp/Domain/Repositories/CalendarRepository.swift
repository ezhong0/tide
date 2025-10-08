/**
 * Calendar Repository Protocol
 * Defines interface for calendar data access
 */

import Foundation

protocol CalendarRepository {
    // MARK: - Event Operations
    func getEvents(startDate: Date, endDate: Date) async throws -> [CalendarEvent]
    func getEvent(id: String) async throws -> CalendarEvent
    func createEvent(event: CreateEventRequest) async throws -> CalendarEvent
    func updateEvent(id: String, event: CreateEventRequest) async throws -> CalendarEvent
    func deleteEvent(id: String) async throws

    // MARK: - Meeting Briefs
    func getMeetingBrief(eventId: String) async throws -> MeetingBrief
    func getMeetingBriefs(userId: String) async throws -> [MeetingBrief]
    func generateMeetingBrief(eventId: String, userId: String) async throws -> MeetingBrief

    // MARK: - Intelligence
    func getOptimizations(userId: String) async throws -> [CalendarOptimization]
    func acceptOptimization(optimizationId: String, userId: String) async throws
    func rejectOptimization(optimizationId: String, userId: String) async throws
    func getConflicts(userId: String) async throws -> [MeetingConflict]
    func resolveConflict(conflictId: String, userId: String, resolution: String) async throws
    func findOptimalTimeSlots(title: String, attendees: [String], durationMinutes: Int, userId: String) async throws -> [TimeSlot]
}
