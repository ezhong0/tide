/**
 * Coordinator Pattern
 * Manages navigation flow and decouples navigation logic from ViewModels
 */

import SwiftUI

// MARK: - Coordinator Protocol
protocol Coordinator: AnyObject {
    func start()
}

// MARK: - Tab Enum
enum Tab: Int, CaseIterable {
    case chat = 0
    case email = 1
    case calendar = 2
    case tasks = 3
    case more = 4

    var title: String {
        switch self {
        case .chat: return "Chat"
        case .email: return "Email"
        case .calendar: return "Calendar"
        case .tasks: return "Tasks"
        case .more: return "More"
        }
    }

    var icon: String {
        switch self {
        case .chat: return "bubble.left.and.bubble.right.fill"
        case .email: return "envelope.fill"
        case .calendar: return "calendar"
        case .tasks: return "checklist"
        case .more: return "ellipsis.circle"
        }
    }
}

// MARK: - Navigation State
final class NavigationState: ObservableObject {
    @Published var selectedTab: Tab = .chat
    @Published var chatPath = NavigationPath()
    @Published var emailPath = NavigationPath()
    @Published var calendarPath = NavigationPath()
    @Published var tasksPath = NavigationPath()
    @Published var morePath = NavigationPath()

    func path(for tab: Tab) -> Binding<NavigationPath> {
        switch tab {
        case .chat:
            return Binding(
                get: { self.chatPath },
                set: { self.chatPath = $0 }
            )
        case .email:
            return Binding(
                get: { self.emailPath },
                set: { self.emailPath = $0 }
            )
        case .calendar:
            return Binding(
                get: { self.calendarPath },
                set: { self.calendarPath = $0 }
            )
        case .tasks:
            return Binding(
                get: { self.tasksPath },
                set: { self.tasksPath = $0 }
            )
        case .more:
            return Binding(
                get: { self.morePath },
                set: { self.morePath = $0 }
            )
        }
    }

    func popToRoot(for tab: Tab) {
        switch tab {
        case .chat: chatPath = NavigationPath()
        case .email: emailPath = NavigationPath()
        case .calendar: calendarPath = NavigationPath()
        case .tasks: tasksPath = NavigationPath()
        case .more: morePath = NavigationPath()
        }
    }
}

// MARK: - Email Navigation
enum EmailDestination: Hashable {
    case detail(emailId: String)
    case compose(replyTo: String? = nil, mode: ComposeMode = .new)
}

enum ComposeMode: Hashable {
    case new
    case reply
    case replyAll
    case forward
}

// MARK: - Calendar Navigation
enum CalendarDestination: Hashable {
    case detail(eventId: String)
    case edit(eventId: String?)  // nil for new event
}

// MARK: - Task Navigation
enum TaskDestination: Hashable {
    case detail(taskId: String)
    case edit(taskId: String?)  // nil for new task
}
