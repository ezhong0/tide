/**
 * Auth Manager
 * Coordinates authentication using Supabase for macOS
 */

import Foundation
import Supabase

@MainActor
final class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var isAuthenticated = false
    @Published var currentUser: Supabase.User?

    private let supabaseManager: SupabaseManager
    private let oauthService: OAuthService

    // MARK: - Initialization

    init(supabaseManager: SupabaseManager = .shared) {
        self.supabaseManager = supabaseManager
        self.oauthService = OAuthService(supabaseManager: supabaseManager)

        // Check if user is already authenticated on init
        Task {
            await checkAuthenticationState()
        }
    }

    // MARK: - Authentication State

    private func checkAuthenticationState() async {
        isAuthenticated = supabaseManager.isAuthenticated
        currentUser = supabaseManager.currentUser
    }

    // MARK: - Authentication Methods

    func login(email: String, password: String) async throws {
        let session = try await supabaseManager.signIn(email: email, password: password)
        currentUser = session.user
        isAuthenticated = true
    }

    func signUp(email: String, password: String, name: String) async throws {
        let session = try await supabaseManager.signUp(
            email: email,
            password: password,
            data: [
                "full_name": .string(name)
            ]
        )
        currentUser = session.user
        isAuthenticated = true
    }

    func loginWithOAuth(provider: OAuthProvider) async throws {
        let session: Session

        switch provider {
        case .google:
            session = try await oauthService.signInWithGoogle()
        case .microsoft:
            session = try await oauthService.signInWithMicrosoft()
        case .apple:
            throw AuthError.notImplemented("Apple OAuth not supported on macOS")
        }

        currentUser = session.user
        isAuthenticated = true
        print("✅ \(provider.rawValue.capitalized) OAuth successful: \(session.user.email ?? "unknown")")
    }

    func loginWithGoogle() async throws {
        try await loginWithOAuth(provider: .google)
    }

    func loginWithMicrosoft() async throws {
        try await loginWithOAuth(provider: .microsoft)
    }

    func handleOAuthCallback(url: URL) async throws {
        let session = try await oauthService.handleOAuthCallback(url: url)
        currentUser = session.user
        isAuthenticated = true
        print("✅ OAuth callback handled: \(session.user.email ?? "unknown")")
    }

    func logout() async {
        do {
            try await supabaseManager.signOut()
        } catch {
            print("❌ Logout error: \(error.localizedDescription)")
        }

        currentUser = nil
        isAuthenticated = false
    }

    // MARK: - Token Refresh

    func refreshAccessToken() async throws {
        // Supabase SDK handles token refresh automatically
        _ = try await supabaseManager.getCurrentSession()
    }

    // MARK: - User Info

    var userEmail: String? {
        return currentUser?.email
    }

    var userName: String? {
        return currentUser?.userMetadata["full_name"]?.value as? String
    }
}

// MARK: - OAuth Provider

enum OAuthProvider: String {
    case google
    case microsoft
    case apple
}

// MARK: - Auth Error

enum AuthError: LocalizedError {
    case notImplemented(String)
    case noRefreshToken

    var errorDescription: String? {
        switch self {
        case .notImplemented(let message):
            return message
        case .noRefreshToken:
            return "No refresh token available"
        }
    }
}

// MARK: - User Model (for app-specific use)

struct TideUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let avatarUrl: String?

    init(id: String, email: String, name: String, avatarUrl: String? = nil) {
        self.id = id
        self.email = email
        self.name = name
        self.avatarUrl = avatarUrl
    }

    // Initialize from Supabase.User
    init(from supabaseUser: Supabase.User) {
        self.id = supabaseUser.id.uuidString
        self.email = supabaseUser.email ?? ""
        self.name = supabaseUser.userMetadata["full_name"]?.value as? String
                    ?? supabaseUser.email ?? "User"
        self.avatarUrl = supabaseUser.userMetadata["avatar_url"]?.value as? String
    }
}
