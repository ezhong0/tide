/**
 * Dependency Injection Container
 * Central container for managing app dependencies
 */

import Foundation

@MainActor
class DependencyContainer: ObservableObject {
    // MARK: - Singleton (for app entry point only)
    static let shared = DependencyContainer()

    // MARK: - Services
    let apiClient: APIClientProtocol
    let authManager: AuthManagerProtocol
    let supabaseManager: SupabaseManagerProtocol

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

    // MARK: - Factory Methods for ViewModels

    func makeChatViewModel() -> ChatViewModel {
        return ChatViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeEmailViewModel() -> EmailViewModel {
        return EmailViewModel(
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

    func makeActionsViewModel() -> ActionsViewModel {
        return ActionsViewModel(
            apiClient: apiClient,
            authManager: authManager,
            supabaseManager: supabaseManager
        )
    }

    func makeDecisionsViewModel() -> DecisionsViewModel {
        return DecisionsViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeDailySnapshotViewModel() -> DailySnapshotViewModel {
        return DailySnapshotViewModel(
            apiClient: apiClient,
            authManager: authManager
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
