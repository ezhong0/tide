/**
 * Base View Model
 * Common functionality for all ViewModels
 */

import Foundation
import SwiftUI

@MainActor
class BaseViewModel: ObservableObject {
    // MARK: - Common Published Properties

    @Published var isLoading = false
    @Published var error: Error?
    @Published var showError = false

    // MARK: - Dependencies

    let apiClient: APIClientProtocol
    let authManager: AuthManagerProtocol

    // MARK: - Initializer

    init(
        apiClient: APIClientProtocol,
        authManager: AuthManagerProtocol
    ) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    // MARK: - Common Methods

    /// Get the current user ID from the auth manager
    func getCurrentUserId() async -> String? {
        return authManager.currentUser?.id
    }

    /// Handle errors with consistent UI feedback
    func handleError(_ error: Error) {
        self.error = error
        self.showError = true

        // Log error for debugging
        Logger.error("Error in \(String(describing: type(of: self)))", error: error)
    }

    /// Execute an async task with loading state and error handling
    func withLoadingState<T>(_ task: () async throws -> T) async -> T? {
        isLoading = true
        defer { isLoading = false }

        do {
            return try await task()
        } catch {
            handleError(error)
            return nil
        }
    }

    /// Execute an async task without return value
    func withLoadingState(_ task: () async throws -> Void) async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await task()
        } catch {
            handleError(error)
        }
    }

    /// Check if user is authenticated and show error if not
    func requireAuth() -> Bool {
        guard authManager.isAuthenticated else {
            handleError(AuthError.notAuthenticated)
            return false
        }
        return true
    }

    /// Dismiss error alert
    func dismissError() {
        showError = false
        error = nil
    }
}
