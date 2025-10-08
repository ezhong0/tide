/**
 * Auth Manager
 * Handles authentication, token management, and user session
 */

import Foundation
import Security

@MainActor
class AuthManager: ObservableObject, AuthManagerProtocol {
    static let shared = AuthManager()

    @Published var isAuthenticated = false
    @Published var currentUser: User?

    private let keychainService = "com.tide.auth"
    private let accessTokenKey = "access_token"
    private let refreshTokenKey = "refresh_token"

    private let supabaseManager: SupabaseManager
    private let oauthService: OAuthService

    private init() {
        // Initialize dependencies
        self.supabaseManager = SupabaseManager.shared

        // Create Supabase client for OAuth service
        guard let supabaseURL = URL(string: Config.supabaseURL),
              let anonKey = Config.supabaseAnonKey, !anonKey.isEmpty else {
            print("❌ CRITICAL: Invalid Supabase configuration in AuthManager")
            // Create placeholder to prevent crash
            let placeholderURL = URL(string: "https://placeholder.supabase.co")!
            let supabaseClient = SupabaseClient(
                supabaseURL: placeholderURL,
                supabaseKey: "placeholder-key"
            )
            self.oauthService = OAuthService(supabaseClient: supabaseClient)
            return
        }

        let supabaseClient = SupabaseClient(
            supabaseURL: supabaseURL,
            supabaseKey: anonKey
        )
        self.oauthService = OAuthService(supabaseClient: supabaseClient)

        // Check if user is already authenticated on init
        Task {
            await checkAuthenticationState()
        }
    }

    // MARK: - Authentication State

    private func checkAuthenticationState() async {
        do {
            let session = try await supabaseManager.getCurrentSession()
            if let session = session {
                // Store tokens
                accessToken = session.accessToken
                refreshToken = session.refreshToken
                isAuthenticated = true

                // Load user profile
                await loadCurrentUser()
            } else {
                isAuthenticated = false
            }
        } catch {
            print("❌ Failed to check authentication state: \(error.localizedDescription)")
            isAuthenticated = false
        }
    }

    // MARK: - Token Management

    var accessToken: String? {
        get {
            return KeychainHelper.load(service: keychainService, account: accessTokenKey)
        }
        set {
            if let token = newValue {
                KeychainHelper.save(service: keychainService, account: accessTokenKey, data: token)
            } else {
                KeychainHelper.delete(service: keychainService, account: accessTokenKey)
            }
        }
    }

    var refreshToken: String? {
        get {
            return KeychainHelper.load(service: keychainService, account: refreshTokenKey)
        }
        set {
            if let token = newValue {
                KeychainHelper.save(service: keychainService, account: refreshTokenKey, data: token)
            } else {
                KeychainHelper.delete(service: keychainService, account: refreshTokenKey)
            }
        }
    }

    // MARK: - Token Validation

    func isTokenValid() -> Bool {
        guard let token = accessToken else {
            return false
        }

        return !JWTDecoder.isExpired(token)
    }

    func shouldRefreshToken() -> Bool {
        guard let token = accessToken else {
            return true
        }

        // Refresh if token expires within 5 minutes
        return JWTDecoder.willExpireSoon(token, within: 300)
    }

    // MARK: - Authentication

    func login(email: String, password: String) async throws {
        // Use Supabase auth for email/password login
        let session = try await supabaseManager.signIn(
            email: email,
            password: password
        )

        // Store real tokens in Keychain
        accessToken = session.accessToken
        refreshToken = session.refreshToken

        isAuthenticated = true

        // Load user profile
        await loadCurrentUser()
    }

    func loginWithOAuth(provider: OAuthProvider) async throws {
        let session: Session

        switch provider {
        case .google:
            session = try await oauthService.signInWithGoogle()
        case .microsoft:
            session = try await oauthService.signInWithMicrosoft()
        case .apple:
            throw AuthError.notImplemented("Apple Sign In should use loginWithApple(identityToken:)")
        }

        // Store tokens
        accessToken = session.accessToken
        refreshToken = session.refreshToken
        isAuthenticated = true

        // Load user profile
        await loadCurrentUser()
    }

    func loginWithApple(identityToken: String, nonce: String? = nil) async throws {
        let session = try await oauthService.signInWithApple(identityToken: identityToken, nonce: nonce)

        // Store tokens
        accessToken = session.accessToken
        refreshToken = session.refreshToken
        isAuthenticated = true

        // Load user profile
        await loadCurrentUser()
    }

    func handleOAuthCallback(url: URL) async throws {
        let session = try await oauthService.handleOAuthCallback(url: url)

        // Store tokens
        accessToken = session.accessToken
        refreshToken = session.refreshToken
        isAuthenticated = true

        // Load user profile
        await loadCurrentUser()
    }

    func signUp(email: String, password: String, name: String) async throws {
        // Use Supabase auth for signup
        let session = try await supabaseManager.signUp(
            email: email,
            password: password,
            data: [
                "full_name": .string(name)
            ]
        )

        // Store real tokens in Keychain
        accessToken = session.accessToken
        refreshToken = session.refreshToken

        isAuthenticated = true

        // Load user profile
        await loadCurrentUser()
    }

    func logout() {
        Task {
            do {
                try await supabaseManager.signOut()
            } catch {
                print("❌ Logout error: \(error.localizedDescription)")
            }

            // Clear local state
            accessToken = nil
            refreshToken = nil
            currentUser = nil
            isAuthenticated = false
        }
    }

    func refreshAccessToken() async throws {
        guard let refreshToken = refreshToken else {
            throw AuthError.noRefreshToken
        }

        // Supabase SDK handles token refresh automatically
        // Just retrieve the current session which will refresh if needed
        let session = try await supabaseManager.getCurrentSession()

        if let session = session {
            accessToken = session.accessToken
            self.refreshToken = session.refreshToken
        } else {
            throw AuthError.noRefreshToken
        }
    }

    // MARK: - User Profile

    private func loadCurrentUser() async {
        do {
            // Get user from Supabase auth
            if let supabaseUser = supabaseManager.currentUser {
                currentUser = User(
                    id: supabaseUser.id.uuidString,
                    email: supabaseUser.email ?? "",
                    name: supabaseUser.userMetadata["full_name"]?.value as? String ?? supabaseUser.email ?? "User",
                    avatarUrl: supabaseUser.userMetadata["avatar_url"]?.value as? String
                )
            }
        } catch {
            print("❌ Failed to load user profile: \(error.localizedDescription)")
        }
    }
}

// MARK: - Models

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let avatarUrl: String?
}

enum OAuthProvider: String {
    case google
    case microsoft
    case apple
}

enum AuthError: LocalizedError {
    case noRefreshToken
    case invalidCredentials
    case networkError
    case notImplemented(String)
    case unknown

    var errorDescription: String? {
        switch self {
        case .noRefreshToken:
            return "No refresh token available"
        case .invalidCredentials:
            return "Invalid email or password"
        case .networkError:
            return "Network error. Please try again."
        case .notImplemented(let message):
            return message
        case .unknown:
            return "An unknown error occurred"
        }
    }
}

// MARK: - Keychain Helper

struct KeychainHelper {
    static func save(service: String, account: String, data: String) {
        guard let data = data.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }

    static func load(service: String, account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }

        return string
    }

    static func delete(service: String, account: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        SecItemDelete(query as CFDictionary)
    }
}
