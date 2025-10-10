/**
 * Supabase Manager
 * Handles Supabase authentication and database operations for macOS
 */

import Foundation
import Supabase

@MainActor
final class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()

    @Published var currentUser: Supabase.User?
    @Published var isAuthenticated: Bool = false

    let client: SupabaseClient

    private init() {
        // Initialize Supabase client
        guard let supabaseURL = URL(string: Config.supabaseURL) else {
            fatalError("CRITICAL: Invalid Supabase URL configuration. Check Config.swift")
        }

        let anonKey = Config.supabaseAnonKey
        guard !anonKey.isEmpty else {
            fatalError("CRITICAL: Missing Supabase anon key. Check Config.swift")
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
        let response = try await client.auth.signUp(
            email: email,
            password: password,
            data: data
        )
        guard let session = response.session else {
            throw NSError(domain: "SupabaseManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "No session returned from signUp"])
        }
        currentUser = response.user
        isAuthenticated = true
        return session
    }

    func signOut() async throws {
        try await client.auth.signOut()
        currentUser = nil
        isAuthenticated = false
    }

    func getCurrentSession() async throws -> Session? {
        do {
            return try await client.auth.session
        } catch {
            return nil
        }
    }

    // MARK: - OAuth Methods

    /// Get OAuth URL for sign in with provider
    func getOAuthSignInURL(provider: Provider, redirectTo: URL, scopes: String, queryParams: [String: String]? = nil) async throws -> URL {
        // Build query parameters including scopes and any additional params
        var allQueryParams = queryParams ?? [:]

        // Add scopes to query params
        if !scopes.isEmpty {
            allQueryParams["scopes"] = scopes
        }

        // Convert dictionary to array of tuples for Supabase API
        let queryParamsArray = allQueryParams.map { (name: $0.key, value: $0.value) }

        return try client.auth.getOAuthSignInURL(
            provider: provider,
            redirectTo: redirectTo,
            queryParams: queryParamsArray
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
