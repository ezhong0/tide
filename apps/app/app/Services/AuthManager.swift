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
    @Published var currentUser: User?

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

    func loginWithGoogle() async throws {
        let session = try await oauthService.signInWithGoogle()
        currentUser = session.user
        isAuthenticated = true
        print("✅ Google OAuth successful: \(session.user.email ?? "unknown")")
    }

    func loginWithMicrosoft() async throws {
        let session = try await oauthService.signInWithMicrosoft()
        currentUser = session.user
        isAuthenticated = true
        print("✅ Microsoft OAuth successful: \(session.user.email ?? "unknown")")
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

    // MARK: - User Info

    var userEmail: String? {
        return currentUser?.email
    }

    var userName: String? {
        return currentUser?.userMetadata["full_name"]?.value as? String
    }
}

// MARK: - User Model

struct User: Codable, Identifiable {
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
