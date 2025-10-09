/**
 * Calendar Models
 * Data models for Calendar feature
 */

import SwiftUI

// MARK: - Calendar Day

struct CalendarDay: Identifiable, Equatable {
    let id = UUID()
    let date: Date
    let day: Int
    let isCurrentMonth: Bool
    let isToday: Bool
    let hasEvents: Bool
    let events: [CalendarEvent]

    static func == (lhs: CalendarDay, rhs: CalendarDay) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Calendar Event

struct CalendarEvent: Identifiable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let location: String?
    let description: String?
    let attendees: [String]?
    let color: Color
    let hasConflict: Bool
    let hasPrep: Bool
    let meetingPrep: MeetingPrep?
}

// MARK: - Meeting Prep

struct MeetingPrep {
    let keyPoints: [String]
    let suggestedDuration: Int
}

// Note: AttendeeInsight is defined in Models/MeetingBrief.swift
