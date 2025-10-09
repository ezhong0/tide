/**
 * Dependency Injection Container
 * Central container for managing app dependencies
 */

import Foundation
import SwiftUI

@MainActor
final class DependencyContainer: ObservableObject {
    // MARK: - Singleton (for app entry point only)
    static let shared = DependencyContainer()

    // MARK: - Services
    let apiClient: APIClientProtocol
    let authManager: AuthManagerProtocol
    let supabaseManager: SupabaseManagerProtocol

    // MARK: - Error State
    var configurationError: Error?
    var isValid: Bool {
        return configurationError == nil
    }

    // MARK: - Initializer
    init(
        apiClient: APIClientProtocol? = nil,
        authManager: AuthManagerProtocol? = nil,
        supabaseManager: SupabaseManagerProtocol? = nil
    ) {
        // Use provided dependencies or create default instances
        self.apiClient = apiClient ?? APIClient.shared
        self.authManager = authManager ?? AuthManager.shared
        self.supabaseManager = supabaseManager ?? SupabaseManager.shared
    }

    // MARK: - Production Factory Method
    /// Create production container with configuration validation
    static func production() throws -> DependencyContainer {
        // Validate configuration first
        try Config.validateConfiguration()

        // Print config in debug mode
        Config.printConfiguration()

        // Create services with proper dependency injection
        // 1. SupabaseManager (no dependencies)
        let supabaseManager = SupabaseManager.shared

        // 2. AuthManager (depends on SupabaseManager)
        let authManager = AuthManager(supabaseManager: supabaseManager)

        // 3. APIClient (depends on AuthManager)
        let apiClient = APIClient(
            authManager: authManager,
            baseURL: Config.apiBaseURL
        )

        let container = DependencyContainer(
            apiClient: apiClient,
            authManager: authManager,
            supabaseManager: supabaseManager
        )

        return container
    }

    // MARK: - Placeholder for Error Cases
    /// Create a placeholder container for error scenarios with mock services
    static func placeholder(error: Error) -> DependencyContainer {
        let mockSupabase = MockSupabaseManager()
        let mockAuth = MockAuthManager()
        let mockAPI = MockAPIClient()

        let container = DependencyContainer(
            apiClient: mockAPI,
            authManager: mockAuth,
            supabaseManager: mockSupabase
        )

        container.setConfigurationError(error)
        return container
    }

    // MARK: - Error Setter (internal)
    private func setConfigurationError(_ error: Error) {
        self.configurationError = error
    }

    // MARK: - Factory Methods for ViewModels

    func makeChatViewModel() -> ChatViewModel {
        return ChatViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    // TODO: Implement EmailViewModel when needed
    // func makeEmailViewModel() -> EmailViewModel {
    //     return EmailViewModel(
    //         apiClient: apiClient,
    //         authManager: authManager
    //     )
    // }

    func makeEmailInboxViewModel() -> EmailInboxViewModel {
        return EmailInboxViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeEmailDetailViewModel(emailId: String) -> EmailDetailViewModel {
        return EmailDetailViewModel(
            emailId: emailId,
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeEmailComposeViewModel(replyTo: String?, mode: ComposeMode) -> EmailComposeViewModel {
        return EmailComposeViewModel(
            replyTo: replyTo,
            mode: mode,
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeTaskListViewModel() -> TaskListViewModel {
        return TaskListViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeTaskDetailViewModel(taskId: String) -> TaskDetailViewModel {
        return TaskDetailViewModel(
            taskId: taskId,
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeCalendarViewModel() -> CalendarGridViewModel {
        return CalendarGridViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeEventDetailViewModel(eventId: String) -> EventDetailViewModel {
        return EventDetailViewModel(
            eventId: eventId,
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeActionsViewModel() -> ActionsViewModel {
        return ActionsViewModel(
            apiClient: apiClient,
            authManager: authManager,
            supabaseManager: supabaseManager
        )
    }

    // TODO: Implement DecisionsViewModel when needed
    // func makeDecisionsViewModel() -> DecisionsViewModel {
    //     return DecisionsViewModel(
    //         apiClient: apiClient,
    //         authManager: authManager
    //     )
    // }

    func makeDailySnapshotViewModel() -> DailySnapshotViewModel {
        return DailySnapshotViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeEmailDraftViewModel(email: Email) -> EmailDraftViewModel {
        return EmailDraftViewModel(
            email: email,
            apiClient: apiClient,
            supabaseManager: supabaseManager
        )
    }

    func makeAutomatedEmailActionsViewModel() -> AutomatedEmailActionsViewModel {
        return AutomatedEmailActionsViewModel(
            apiClient: apiClient,
            supabaseManager: supabaseManager
        )
    }

    func makeMeetingBriefsViewModel() -> MeetingBriefsViewModel {
        return MeetingBriefsViewModel(
            apiClient: apiClient,
            supabaseManager: supabaseManager
        )
    }

    // MARK: - Test Container
    static func makeTestContainer(
        apiClient: APIClientProtocol? = nil,
        authManager: AuthManagerProtocol? = nil,
        supabaseManager: SupabaseManagerProtocol? = nil
    ) -> DependencyContainer {
        return DependencyContainer(
            apiClient: apiClient,
            authManager: authManager,
            supabaseManager: supabaseManager
        )
    }
}

// MARK: - Environment Key

struct DependencyContainerKey: EnvironmentKey {
    static let defaultValue = DependencyContainer.shared
}

extension EnvironmentValues {
    var dependencies: DependencyContainer {
        get { self[DependencyContainerKey.self] }
        set { self[DependencyContainerKey.self] = newValue }
    }
}
