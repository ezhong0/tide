/**
 * Auth Manager Protocol
 * Defines the interface for authentication and token management
 * Allows for dependency injection and testability
 */

import Foundation

protocol AuthManagerProtocol: ObservableObject {
    // MARK: - Published Properties
    var isAuthenticated: Bool { get set }
    var currentUser: User? { get set }

    // MARK: - Token Management
    var accessToken: String? { get set }
    var refreshToken: String? { get set }

    // MARK: - Token Validation
    func isTokenValid() -> Bool
    func shouldRefreshToken() -> Bool

    // MARK: - Authentication
    func login(email: String, password: String) async throws
    func loginWithOAuth(provider: OAuthProvider) async throws
    func loginWithApple(identityToken: String, nonce: String?) async throws
    func handleOAuthCallback(url: URL) async throws
    func signUp(email: String, password: String, name: String) async throws
    func logout()
    func refreshAccessToken() async throws
}
