/**
 * Mock Auth Manager
 * Mock implementation for testing and preview purposes
 */

import Foundation

@MainActor
final class MockAuthManager: ObservableObject, AuthManagerProtocol {
    // MARK: - Published Properties
    @Published var isAuthenticated: Bool
    @Published var currentUser: User?

    // MARK: - Token Management
    var accessToken: String?
    var refreshToken: String?

    // MARK: - Mock Data Control
    var shouldFail: Bool = false
    var mockDelay: TimeInterval = 0.3

    // MARK: - Initialization
    init(isAuthenticated: Bool = false, currentUser: User? = nil) {
        self.isAuthenticated = isAuthenticated
        self.currentUser = currentUser
        self.accessToken = isAuthenticated ? "mock-access-token" : nil
        self.refreshToken = isAuthenticated ? "mock-refresh-token" : nil
    }

    // MARK: - Token Validation
    func isTokenValid() -> Bool {
        return accessToken != nil
    }

    func shouldRefreshToken() -> Bool {
        return false // Mock tokens never need refresh
    }

    // MARK: - Authentication
    func login(email: String, password: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.invalidCredentials
        }

        accessToken = "mock-access-token"
        refreshToken = "mock-refresh-token"
        isAuthenticated = true
        currentUser = User(
            id: UUID().uuidString,
            email: email,
            name: "Mock User",
            avatarUrl: nil
        )
    }

    func loginWithOAuth(provider: OAuthProvider) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.networkError
        }

        accessToken = "mock-access-token"
        refreshToken = "mock-refresh-token"
        isAuthenticated = true
        currentUser = User(
            id: UUID().uuidString,
            email: "mock@example.com",
            name: "Mock OAuth User",
            avatarUrl: nil
        )
    }

    func loginWithApple(identityToken: String, nonce: String?) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.networkError
        }

        accessToken = "mock-access-token"
        refreshToken = "mock-refresh-token"
        isAuthenticated = true
        currentUser = User(
            id: UUID().uuidString,
            email: "mock@icloud.com",
            name: "Mock Apple User",
            avatarUrl: nil
        )
    }

    func handleOAuthCallback(url: URL) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.networkError
        }

        accessToken = "mock-access-token"
        refreshToken = "mock-refresh-token"
        isAuthenticated = true
        currentUser = User(
            id: UUID().uuidString,
            email: "mock@example.com",
            name: "Mock User",
            avatarUrl: nil
        )
    }

    func signUp(email: String, password: String, name: String) async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.networkError
        }

        accessToken = "mock-access-token"
        refreshToken = "mock-refresh-token"
        isAuthenticated = true
        currentUser = User(
            id: UUID().uuidString,
            email: email,
            name: name,
            avatarUrl: nil
        )
    }

    func logout() {
        accessToken = nil
        refreshToken = nil
        isAuthenticated = false
        currentUser = nil
    }

    func refreshAccessToken() async throws {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))
        if shouldFail {
            throw AuthError.noRefreshToken
        }

        accessToken = "mock-refreshed-access-token"
    }
}
