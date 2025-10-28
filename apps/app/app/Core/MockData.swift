import Foundation

/// Mock data provider for preview mode and screenshots
struct MockData {
    // MARK: - Dashboard Mock Data

    static func mockDashboardResponse() -> MobileBFFService.DashboardResponse {
        return MobileBFFService.DashboardResponse(
            user: mockUser(),
            stats: MobileBFFService.DashboardStats(
                unreadEmails: 12,
                upcomingEvents: 3,
                todayTasks: 5
            ),
            upcomingEvents: mockUpcomingEvents(),
            priorityEmails: mockPriorityEmails(),
            todayTasks: mockTodayTasks(),
            aiSummary: "You have 3 urgent emails requiring attention. Your afternoon is packed with 4 back-to-back meetings. Consider rescheduling the 3pm call to create buffer time.",
            metadata: mockMetadata()
        )
    }

    static func mockUser() -> MobileBFFService.UserProfile {
        return MobileBFFService.UserProfile(
            id: "mock-user-1",
            email: "you@company.com",
            name: "Alex Chen"
        )
    }

    static func mockMetadata() -> MobileBFFService.Metadata {
        return MobileBFFService.Metadata(
            fetchedAt: Date(),
            took: 45
        )
    }

    static func mockPriorityEmails() -> [MobileBFFService.PriorityEmail] {
        let now = Date()
        return [
            MobileBFFService.PriorityEmail(
                id: "email-1",
                subject: "Q4 Budget Review - Action Required",
                from: "Sarah Johnson",
                receivedAt: now.addingTimeInterval(-3600),
                priority: 9,
                summary: "Board meeting moved to Friday. Need your budget proposal by EOD Thursday."
            ),
            MobileBFFService.PriorityEmail(
                id: "email-2",
                subject: "Critical: Production System Alert",
                from: "Marcus Williams",
                receivedAt: now.addingTimeInterval(-7200),
                priority: 10,
                summary: "API response times increased 300%. Infrastructure team investigating. May need your approval for scaling."
            ),
            MobileBFFService.PriorityEmail(
                id: "email-3",
                subject: "Client Meeting Rescheduled",
                from: "Emily Rodriguez",
                receivedAt: now.addingTimeInterval(-10800),
                priority: 8,
                summary: "Acme Corp wants to move our demo to next week. Confirms your availability for Tuesday 2pm."
            )
        ]
    }

    static func mockUpcomingEvents() -> [MobileBFFService.UpcomingEvent] {
        let calendar = Calendar.current
        let now = Date()

        return [
            MobileBFFService.UpcomingEvent(
                id: "event-1",
                title: "Product Team Sync",
                start: calendar.date(byAdding: .hour, value: 1, to: now)!,
                end: calendar.date(byAdding: .hour, value: 2, to: now)!,
                location: "Conference Room B",
                attendeeCount: 8
            ),
            MobileBFFService.UpcomingEvent(
                id: "event-2",
                title: "1:1 with Manager",
                start: calendar.date(byAdding: .hour, value: 3, to: now)!,
                end: calendar.date(byAdding: .minute, value: 210, to: now)!,
                location: "Zoom",
                attendeeCount: 2
            ),
            MobileBFFService.UpcomingEvent(
                id: "event-3",
                title: "Engineering All-Hands",
                start: calendar.date(byAdding: .hour, value: 5, to: now)!,
                end: calendar.date(byAdding: .hour, value: 6, to: now)!,
                location: "Main Auditorium",
                attendeeCount: 45
            )
        ]
    }

    static func mockTodayTasks() -> [MobileBFFService.TodayTask] {
        let calendar = Calendar.current
        let now = Date()

        return [
            MobileBFFService.TodayTask(
                id: "task-1",
                title: "Review pull requests for API refactor",
                dueAt: calendar.date(byAdding: .hour, value: 2, to: now),
                priority: "high",
                status: "in_progress"
            ),
            MobileBFFService.TodayTask(
                id: "task-2",
                title: "Prepare slides for client presentation",
                dueAt: calendar.date(byAdding: .hour, value: 4, to: now),
                priority: "high",
                status: "todo"
            ),
            MobileBFFService.TodayTask(
                id: "task-3",
                title: "Update documentation for new features",
                dueAt: calendar.date(byAdding: .hour, value: 6, to: now),
                priority: "medium",
                status: "todo"
            ),
            MobileBFFService.TodayTask(
                id: "task-4",
                title: "Review Q3 performance metrics",
                dueAt: calendar.date(byAdding: .hour, value: -2, to: now),
                priority: "medium",
                status: "completed"
            ),
            MobileBFFService.TodayTask(
                id: "task-5",
                title: "Schedule team lunch for next week",
                dueAt: calendar.date(byAdding: .day, value: 1, to: now),
                priority: "low",
                status: "todo"
            )
        ]
    }

    // MARK: - Email Mock Data

    static func mockInboxResponse() -> MobileBFFService.InboxResponse {
        return MobileBFFService.InboxResponse(
            emails: mockInboxEmails(),
            total: 24,
            filter: "all",
            pagination: MobileBFFService.Pagination(
                limit: 20,
                offset: 0,
                hasMore: true
            ),
            metadata: mockMetadata()
        )
    }

    static func mockInboxEmails() -> [MobileBFFService.InboxEmail] {
        let now = Date()

        return [
            // Priority emails
            MobileBFFService.InboxEmail(
                id: "email-1",
                subject: "Q4 Budget Review - Action Required",
                from: "Sarah Johnson",
                snippet: "Board meeting moved to Friday. Need your budget proposal by EOD Thursday.",
                receivedAt: now.addingTimeInterval(-3600),
                isRead: false,
                isFlagged: true,
                isVIP: true,
                priority: 9,
                category: "work",
                hasAttachment: true
            ),
            MobileBFFService.InboxEmail(
                id: "email-2",
                subject: "Critical: Production System Alert",
                from: "Marcus Williams",
                snippet: "API response times increased 300%. Infrastructure team investigating.",
                receivedAt: now.addingTimeInterval(-7200),
                isRead: false,
                isFlagged: true,
                isVIP: false,
                priority: 10,
                category: "urgent",
                hasAttachment: false
            ),

            // VIP emails
            MobileBFFService.InboxEmail(
                id: "email-3",
                subject: "Thoughts on the new product roadmap",
                from: "Jennifer Lee",
                snippet: "Reviewed the Q4 roadmap with the team. A few suggestions for prioritization.",
                receivedAt: now.addingTimeInterval(-10800),
                isRead: false,
                isFlagged: false,
                isVIP: true,
                priority: 6,
                category: "work",
                hasAttachment: true
            ),

            // Regular emails
            MobileBFFService.InboxEmail(
                id: "email-4",
                subject: "Team lunch next Friday?",
                from: "David Park",
                snippet: "Let's do team building! Mexican or Italian? Vote in the poll.",
                receivedAt: now.addingTimeInterval(-14400),
                isRead: false,
                isFlagged: false,
                isVIP: false,
                priority: 3,
                category: "personal",
                hasAttachment: false
            ),
            MobileBFFService.InboxEmail(
                id: "email-5",
                subject: "Client Meeting Rescheduled",
                from: "Emily Rodriguez",
                snippet: "Acme Corp wants to move our demo to next week. Checking your availability.",
                receivedAt: now.addingTimeInterval(-18000),
                isRead: false,
                isFlagged: false,
                isVIP: false,
                priority: 8,
                category: "work",
                hasAttachment: false
            ),
            MobileBFFService.InboxEmail(
                id: "email-6",
                subject: "Your weekly job matches are here",
                from: "LinkedIn",
                snippet: "Based on your profile, we found 12 new opportunities matching your skills.",
                receivedAt: now.addingTimeInterval(-21600),
                isRead: true,
                isFlagged: false,
                isVIP: false,
                priority: 2,
                category: "personal",
                hasAttachment: false
            ),
            MobileBFFService.InboxEmail(
                id: "email-7",
                subject: "Design review feedback",
                from: "Michael Chen",
                snippet: "Love the new mockups! Minor suggestions on the color palette for accessibility.",
                receivedAt: now.addingTimeInterval(-25200),
                isRead: true,
                isFlagged: false,
                isVIP: false,
                priority: 5,
                category: "work",
                hasAttachment: true
            ),
            MobileBFFService.InboxEmail(
                id: "email-8",
                subject: "[company/api] Pull request #847 merged",
                from: "GitHub",
                snippet: "Your pull request 'Refactor authentication middleware' has been merged.",
                receivedAt: now.addingTimeInterval(-28800),
                isRead: true,
                isFlagged: false,
                isVIP: false,
                priority: 4,
                category: "work",
                hasAttachment: false
            ),
            MobileBFFService.InboxEmail(
                id: "email-9",
                subject: "Your monthly AWS bill is ready",
                from: "Amazon Web Services",
                snippet: "Your total charges for November: $1,247.83. View detailed breakdown.",
                receivedAt: now.addingTimeInterval(-32400),
                isRead: false,
                isFlagged: false,
                isVIP: false,
                priority: 6,
                category: "finance",
                hasAttachment: true
            ),
            MobileBFFService.InboxEmail(
                id: "email-10",
                subject: "Coffee catch-up sometime?",
                from: "Rachel Green",
                snippet: "Been too long! Free for coffee next week? Want to hear about your new role.",
                receivedAt: now.addingTimeInterval(-43200),
                isRead: false,
                isFlagged: false,
                isVIP: true,
                priority: 4,
                category: "personal",
                hasAttachment: false
            )
        ]
    }

    // MARK: - Calendar Mock Data

    static func mockCalendarResponse() -> MobileBFFService.CalendarResponse {
        return MobileBFFService.CalendarResponse(
            events: mockCalendarEvents(),
            conflicts: mockCalendarConflicts(),
            upcomingBriefs: mockMeetingBriefs(),
            stats: MobileBFFService.CalendarStats(
                totalEvents: 12,
                conflicts: 2,
                meetingsToday: 5
            ),
            metadata: mockMetadata()
        )
    }

    static func mockCalendarEvents() -> [MobileBFFService.CalendarEvent] {
        let calendar = Calendar.current
        let now = Date()

        return [
            // Conflicting events (overlap at 2pm)
            MobileBFFService.CalendarEvent(
                id: "event-conflict-1",
                title: "Product Strategy Meeting",
                start: calendar.date(byAdding: .hour, value: 2, to: now)!,
                end: calendar.date(byAdding: .hour, value: 3, to: now)!,
                allDay: false,
                location: "Conference Room A",
                attendees: ["Sarah Johnson", "Marcus Williams", "Emily Rodriguez", "David Park", "Jennifer Lee"],
                status: "confirmed",
                hasConflict: true
            ),
            MobileBFFService.CalendarEvent(
                id: "event-conflict-2",
                title: "Client Demo - Acme Corp",
                start: calendar.date(byAdding: .minute, value: 135, to: now)!,
                end: calendar.date(byAdding: .hour, value: 3, to: now)!,
                allDay: false,
                location: "Zoom",
                attendees: ["John Smith (Acme)", "Sarah Chen (Acme)", "You"],
                status: "confirmed",
                hasConflict: true
            ),

            // Regular events
            MobileBFFService.CalendarEvent(
                id: "event-1",
                title: "Morning Standup",
                start: calendar.date(byAdding: .minute, value: 30, to: now)!,
                end: calendar.date(byAdding: .minute, value: 45, to: now)!,
                allDay: false,
                location: "Zoom",
                attendees: ["Engineering Team"],
                status: "confirmed",
                hasConflict: false
            ),
            MobileBFFService.CalendarEvent(
                id: "event-2",
                title: "1:1 with Manager",
                start: calendar.date(byAdding: .hour, value: 4, to: now)!,
                end: calendar.date(byAdding: .minute, value: 270, to: now)!,
                allDay: false,
                location: "Conference Room B",
                attendees: ["Jennifer Lee"],
                status: "confirmed",
                hasConflict: false
            ),
            MobileBFFService.CalendarEvent(
                id: "event-3",
                title: "Q4 Budget Review",
                start: calendar.date(byAdding: .hour, value: 6, to: now)!,
                end: calendar.date(byAdding: .hour, value: 7, to: now)!,
                allDay: false,
                location: "Executive Boardroom",
                attendees: ["Sarah Johnson", "CFO", "VP Engineering", "VP Product"],
                status: "confirmed",
                hasConflict: false
            ),
            MobileBFFService.CalendarEvent(
                id: "event-4",
                title: "Team Lunch",
                start: calendar.date(byAdding: .day, value: 1, to: now)!,
                end: calendar.date(byAdding: .day, value: 1, to: calendar.date(byAdding: .hour, value: 1, to: now)!)!,
                allDay: false,
                location: "Chipotle",
                attendees: ["Engineering Team"],
                status: "tentative",
                hasConflict: false
            ),
            MobileBFFService.CalendarEvent(
                id: "event-5",
                title: "Focus Time - Code Review",
                start: calendar.date(byAdding: .day, value: 2, to: now)!,
                end: calendar.date(byAdding: .day, value: 2, to: calendar.date(byAdding: .hour, value: 2, to: now)!)!,
                allDay: false,
                location: nil,
                attendees: nil,
                status: "confirmed",
                hasConflict: false
            ),
            MobileBFFService.CalendarEvent(
                id: "event-6",
                title: "Company All-Hands",
                start: calendar.date(byAdding: .day, value: 3, to: now)!,
                end: calendar.date(byAdding: .day, value: 3, to: calendar.date(byAdding: .hour, value: 1, to: now)!)!,
                allDay: false,
                location: "Main Auditorium",
                attendees: ["All Staff"],
                status: "confirmed",
                hasConflict: false
            )
        ]
    }

    static func mockCalendarConflicts() -> [MobileBFFService.CalendarConflict] {
        return [
            MobileBFFService.CalendarConflict(
                eventIds: ["event-conflict-1", "event-conflict-2"],
                type: "overlap",
                severity: "high"
            )
        ]
    }

    static func mockMeetingBriefs() -> [MobileBFFService.MeetingBrief] {
        return [
            MobileBFFService.MeetingBrief(
                eventId: "event-conflict-1",
                summary: "Strategic planning session to align on Q4 product roadmap and resource allocation",
                keyPoints: [
                    "Review Q3 performance metrics and customer feedback",
                    "Prioritize new feature requests vs. technical debt",
                    "Discuss hiring plan for Q4 engineering team expansion",
                    "Align on release timeline for v2.0"
                ],
                participants: ["Sarah Johnson (VP Product)", "Marcus Williams (Tech Lead)", "Emily Rodriguez (PM)", "David Park (Design Lead)"]
            ),
            MobileBFFService.MeetingBrief(
                eventId: "event-conflict-2",
                summary: "Product demonstration for Acme Corp's executive team to showcase new features and close enterprise deal",
                keyPoints: [
                    "Demo AI-powered automation features",
                    "Discuss enterprise security and compliance",
                    "Review pricing and implementation timeline",
                    "Address technical integration questions"
                ],
                participants: ["John Smith (CTO, Acme)", "Sarah Chen (VP Engineering, Acme)"]
            ),
            MobileBFFService.MeetingBrief(
                eventId: "event-2",
                summary: "Weekly 1:1 with manager to discuss performance, career development, and current project status",
                keyPoints: [
                    "Review sprint progress and blockers",
                    "Discuss promotion timeline and growth areas",
                    "Align on Q4 personal objectives",
                    "Address work-life balance and workload"
                ],
                participants: ["Jennifer Lee (Engineering Manager)"]
            ),
            MobileBFFService.MeetingBrief(
                eventId: "event-3",
                summary: "Executive review of Q4 budget proposals and resource allocation across departments",
                keyPoints: [
                    "Present engineering budget proposal ($2.3M)",
                    "Justify headcount increase (5 new engineers)",
                    "Discuss infrastructure cost optimization",
                    "Review ROI on AI/ML investments"
                ],
                participants: ["CFO", "VP Engineering", "VP Product", "Sarah Johnson"]
            )
        ]
    }

    // MARK: - Chat Mock Data

    static func mockConversation() -> Conversation {
        let now = Date()

        return Conversation(
            id: UUID().uuidString,
            title: "Chat with Tide",
            messages: [
                Message(
                    id: UUID().uuidString,
                    content: "What are my priorities for today?",
                    role: .user,
                    timestamp: now.addingTimeInterval(-400)
                ),
                Message(
                    id: UUID().uuidString,
                    content: "Based on your schedule and emails, here are your top priorities:\n\n1. **Urgent**: Respond to Sarah's Q4 budget email - she needs your proposal by EOD Thursday\n\n2. **Critical**: Production system alert needs your scaling approval\n\n3. **Conflict**: You have two meetings scheduled at 2pm today - Product Strategy Meeting and Client Demo with Acme Corp\n\n4. **High Priority**: Review pull requests before the 2pm team sync\n\nWould you like me to help resolve the scheduling conflict or draft a response to the urgent emails?",
                    role: .assistant,
                    timestamp: now.addingTimeInterval(-390),
                    suggestions: ["Reschedule Product Strategy Meeting", "Draft email response", "Show me the meetings"]
                ),
                Message(
                    id: UUID().uuidString,
                    content: "Reschedule the product strategy meeting to tomorrow at 10am",
                    role: .user,
                    timestamp: now.addingTimeInterval(-200)
                ),
                Message(
                    id: UUID().uuidString,
                    content: "I'll reschedule the Product Strategy Meeting to tomorrow at 10am. Let me check availability with the attendees and send the updated invite.",
                    role: .assistant,
                    timestamp: now.addingTimeInterval(-195),
                    actionPreview: ActionPreview(
                        title: "Reschedule Meeting",
                        description: "Move 'Product Strategy Meeting' to tomorrow at 10:00 AM and notify 5 attendees",
                        actionType: .scheduleEvent,
                        requiresConfirmation: true,
                        isConfirmed: false
                    )
                ),
                Message(
                    id: UUID().uuidString,
                    content: "Show me urgent emails",
                    role: .user,
                    timestamp: now.addingTimeInterval(-120)
                ),
                Message(
                    id: UUID().uuidString,
                    content: "Here are your urgent emails:\n\n📧 **Critical: Production System Alert** from Marcus Williams\nAPI response times up 300%. Needs your scaling approval.\n\n📧 **Q4 Budget Review** from Sarah Johnson (VIP)\nBoard meeting moved to Friday. Budget due Thursday.\n\nWould you like me to draft a response to either of these?",
                    role: .assistant,
                    timestamp: now.addingTimeInterval(-115),
                    suggestions: ["Draft response to Marcus", "Draft budget proposal", "Show more details"]
                ),
                Message(
                    id: UUID().uuidString,
                    content: "Draft a response to Marcus approving the scaling",
                    role: .user,
                    timestamp: now.addingTimeInterval(-60)
                ),
                Message(
                    id: UUID().uuidString,
                    content: "I've drafted a response approving the infrastructure scaling:\n\n---\n\nHi Marcus,\n\nApproved. Please proceed with scaling up the infrastructure to handle the increased load. Let's schedule a quick sync tomorrow to review the root cause analysis and discuss long-term optimization strategies.\n\nThanks for the quick alert.\n\nBest,\n[Your name]\n\n---\n\nWould you like me to send this email?",
                    role: .assistant,
                    timestamp: now.addingTimeInterval(-55),
                    actionPreview: ActionPreview(
                        title: "Send Email",
                        description: "Reply to Marcus Williams: 'Critical: Production System Alert'",
                        actionType: .sendEmail,
                        requiresConfirmation: true,
                        isConfirmed: false
                    ),
                    suggestions: ["Send email", "Edit draft", "Add someone to CC"]
                )
            ],
            createdAt: now.addingTimeInterval(-400),
            updatedAt: now.addingTimeInterval(-55)
        )
    }
}
