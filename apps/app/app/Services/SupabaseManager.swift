/**
 * Supabase Manager
 * Handles Supabase authentication and database operations for macOS
 */

import Foundation
import Supabase

@MainActor
final class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()

    @Published var currentUser: User?
    @Published var isAuthenticated: Bool = false

    let client: SupabaseClient

    private init() {
        // Initialize Supabase client
        guard let supabaseURL = URL(string: Config.supabaseURL),
              let anonKey = Config.supabaseAnonKey, !anonKey.isEmpty else {
            fatalError("CRITICAL: Invalid Supabase configuration. Check Config.swift")
        }

        self.client = SupabaseClient(
            supabaseURL: supabaseURL,
            supabaseKey: anonKey
        )

        // Check if user is already authenticated
        Task {
            await checkAuthenticationState()
        }
    }

    // MARK: - Authentication State

    private func checkAuthenticationState() async {
        do {
            let session = try await client.auth.session
            currentUser = session.user
            isAuthenticated = true
            print("✅ User authenticated: \(session.user.email ?? "unknown")")
        } catch {
            print("ℹ️ No active session")
            isAuthenticated = false
        }
    }

    // MARK: - Authentication Methods

    func signIn(email: String, password: String) async throws -> Session {
        let session = try await client.auth.signIn(email: email, password: password)
        currentUser = session.user
        isAuthenticated = true
        return session
    }

    func signUp(email: String, password: String, data: [String: AnyJSON]? = nil) async throws -> Session {
        let session = try await client.auth.signUp(
            email: email,
            password: password,
            data: data
        )
        currentUser = session.user
        isAuthenticated = true
        return session
    }

    func signOut() async throws {
        try await client.auth.signOut()
        currentUser = nil
        isAuthenticated = false
    }

    func getCurrentSession() async throws -> Session? {
        return try? await client.auth.session
    }

    // MARK: - OAuth Methods

    /// Get OAuth URL for sign in with provider
    func getOAuthSignInURL(provider: Provider, redirectTo: URL, scopes: String, queryParams: [String: String]? = nil) async throws -> URL {
        var options = SignInWithOAuthOptions(
            redirectTo: redirectTo,
            scopes: scopes
        )

        // Add query params if provided (for access_type=offline, prompt=consent, etc.)
        if let queryParams = queryParams {
            options.queryParams = queryParams
        }

        return try await client.auth.getOAuthSignInURL(
            provider: provider,
            options: options
        )
    }

    /// Handle OAuth callback and create session
    func handleOAuthCallback(url: URL) async throws -> Session {
        let session = try await client.auth.session(from: url)
        currentUser = session.user
        isAuthenticated = true
        return session
    }
}
