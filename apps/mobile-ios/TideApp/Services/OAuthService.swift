/**
 * OAuth Service
 * Handles OAuth authentication flows for Google, Microsoft, and Apple
 */

import Foundation
import AuthenticationServices
import Supabase

@MainActor
final class OAuthService: NSObject, ObservableObject {
    // MARK: - Properties

    @Published var isAuthenticating = false
    @Published var authError: Error?

    private var authSession: ASWebAuthenticationSession?
    private let supabaseClient: SupabaseClient

    // MARK: - Initialization

    init(supabaseClient: SupabaseClient) {
        self.supabaseClient = supabaseClient
        super.init()
    }

    // MARK: - OAuth Methods

    /// Sign in with Google OAuth
    func signInWithGoogle() async throws -> Session {
        isAuthenticating = true
        defer { isAuthenticating = false }

        // Start OAuth flow with Supabase
        let session = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Session, Error>) in
            Task { @MainActor in
                do {
                    // Get the OAuth URL from Supabase
                    guard let redirectURL = URL(string: "com.tide.app://oauth-callback") else {
                        continuation.resume(throwing: OAuthError.invalidRedirectURL)
                        return
                    }

                    let provider: Provider = .google
                    var options = SignInWithOAuthOptions(
                        redirectTo: redirectURL,
                        scopes: "email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar"
                    )

                    // Add query params to get refresh token
                    options.queryParams = [
                        "access_type": "offline",  // Get refresh token
                        "prompt": "consent"        // Force consent screen
                    ]

                    // Get the OAuth URL
                    let authURL = try await supabaseClient.auth.getOAuthSignInURL(
                        provider: provider,
                        options: options
                    )

                    // Open OAuth in web authentication session
                    let session = ASWebAuthenticationSession(
                        url: authURL,
                        callbackURLScheme: "com.tide.app"
                    ) { [weak self] callbackURL, error in
                        Task { @MainActor in
                            if let error = error {
                                continuation.resume(throwing: OAuthError.authenticationFailed(error.localizedDescription))
                                return
                            }

                            guard let callbackURL = callbackURL else {
                                continuation.resume(throwing: OAuthError.noCallbackURL)
                                return
                            }

                            // Exchange callback for session
                            do {
                                let session = try await self?.supabaseClient.auth.session(from: callbackURL)
                                guard let session = session else {
                                    continuation.resume(throwing: OAuthError.noSession)
                                    return
                                }

                                // Extract and store provider tokens in backend
                                if let providerToken = session.providerToken,
                                   let providerRefreshToken = session.providerRefreshToken {
                                    do {
                                        try await self?.storeProviderTokens(
                                            userId: session.user.id.uuidString,
                                            provider: "gmail",
                                            accessToken: providerToken,
                                            refreshToken: providerRefreshToken,
                                            supabaseAccessToken: session.accessToken
                                        )
                                        print("✅ Provider tokens stored in backend")
                                    } catch {
                                        print("⚠️ Failed to store provider tokens: \(error.localizedDescription)")
                                        // Continue anyway - user is authenticated, tokens can be re-requested
                                    }
                                }

                                continuation.resume(returning: session)
                            } catch {
                                continuation.resume(throwing: error)
                            }
                        }
                    }

                    session.presentationContextProvider = self
                    session.prefersEphemeralWebBrowserSession = false

                    if !session.start() {
                        continuation.resume(throwing: OAuthError.failedToStart)
                    }

                    self.authSession = session
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }

        return session
    }

    /// Sign in with Microsoft OAuth
    func signInWithMicrosoft() async throws -> Session {
        isAuthenticating = true
        defer { isAuthenticating = false }

        let session = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Session, Error>) in
            Task { @MainActor in
                do {
                    guard let redirectURL = URL(string: "com.tide.app://oauth-callback") else {
                        continuation.resume(throwing: OAuthError.invalidRedirectURL)
                        return
                    }

                    let provider: Provider = .azure
                    var options = SignInWithOAuthOptions(
                        redirectTo: redirectURL,
                        scopes: "User.Read Mail.ReadWrite Calendars.ReadWrite offline_access"
                    )

                    // Add query params to get refresh token
                    options.queryParams = [
                        "prompt": "consent"  // Force consent screen for refresh token
                    ]

                    let authURL = try await supabaseClient.auth.getOAuthSignInURL(
                        provider: provider,
                        options: options
                    )

                    let session = ASWebAuthenticationSession(
                        url: authURL,
                        callbackURLScheme: "com.tide.app"
                    ) { [weak self] callbackURL, error in
                        Task { @MainActor in
                            if let error = error {
                                continuation.resume(throwing: OAuthError.authenticationFailed(error.localizedDescription))
                                return
                            }

                            guard let callbackURL = callbackURL else {
                                continuation.resume(throwing: OAuthError.noCallbackURL)
                                return
                            }

                            do {
                                let session = try await self?.supabaseClient.auth.session(from: callbackURL)
                                guard let session = session else {
                                    continuation.resume(throwing: OAuthError.noSession)
                                    return
                                }

                                // Extract and store provider tokens in backend
                                if let providerToken = session.providerToken,
                                   let providerRefreshToken = session.providerRefreshToken {
                                    do {
                                        try await self?.storeProviderTokens(
                                            userId: session.user.id.uuidString,
                                            provider: "exchange",
                                            accessToken: providerToken,
                                            refreshToken: providerRefreshToken,
                                            supabaseAccessToken: session.accessToken
                                        )
                                        print("✅ Provider tokens stored in backend")
                                    } catch {
                                        print("⚠️ Failed to store provider tokens: \(error.localizedDescription)")
                                        // Continue anyway - user is authenticated, tokens can be re-requested
                                    }
                                }

                                continuation.resume(returning: session)
                            } catch {
                                continuation.resume(throwing: error)
                            }
                        }
                    }

                    session.presentationContextProvider = self
                    session.prefersEphemeralWebBrowserSession = false

                    if !session.start() {
                        continuation.resume(throwing: OAuthError.failedToStart)
                    }

                    self.authSession = session
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }

        return session
    }

    /// Sign in with Apple
    func signInWithApple(identityToken: String, nonce: String? = nil) async throws -> Session {
        isAuthenticating = true
        defer { isAuthenticating = false }

        // Sign in to Supabase with Apple ID token
        let session = try await supabaseClient.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(
                provider: .apple,
                idToken: identityToken,
                nonce: nonce
            )
        )

        return session
    }

    /// Handle OAuth callback URL
    func handleOAuthCallback(url: URL) async throws -> Session {
        return try await supabaseClient.auth.session(from: url)
    }

    // MARK: - Private Methods

    /// Store provider tokens in backend
    private func storeProviderTokens(
        userId: String,
        provider: String,
        accessToken: String,
        refreshToken: String,
        supabaseAccessToken: String
    ) async throws {
        struct TokenRequest: Codable {
            let userId: String
            let tokens: OAuthTokens

            struct OAuthTokens: Codable {
                let accessToken: String
                let refreshToken: String
                let expiresAt: Date
                let scope: [String]?
            }
        }

        let expiresAt = Date(timeIntervalSinceNow: 3600) // 1 hour default

        let request = TokenRequest(
            userId: userId,
            tokens: TokenRequest.OAuthTokens(
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresAt: expiresAt,
                scope: nil
            )
        )

        // Call backend to store tokens
        guard let url = URL(string: "\(Config.apiBaseURL)/api/email/connect/\(provider)") else {
            throw OAuthError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue("Bearer \(supabaseAccessToken)", forHTTPHeaderField: "Authorization")
        urlRequest.httpBody = try JSONEncoder().encode(request)

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            print("❌ Failed to store tokens: \(errorMessage)")
            throw OAuthError.tokenExchangeFailed
        }

        print("✅ Tokens stored successfully in backend")
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension OAuthService: ASWebAuthenticationPresentationContextProviding {
    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        // Return the key window
        return ASPresentationAnchor()
    }
}

// MARK: - Errors

enum OAuthError: LocalizedError {
    case invalidURL
    case invalidRedirectURL
    case authenticationFailed(String)
    case noCallbackURL
    case noSession
    case failedToStart
    case tokenExchangeFailed
    case cancelled

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid OAuth URL"
        case .invalidRedirectURL:
            return "Invalid redirect URL configuration"
        case .authenticationFailed(let message):
            return "Authentication failed: \(message)"
        case .noCallbackURL:
            return "No callback URL received"
        case .noSession:
            return "Failed to create session"
        case .failedToStart:
            return "Failed to start authentication session"
        case .tokenExchangeFailed:
            return "Failed to exchange token"
        case .cancelled:
            return "Authentication was cancelled"
        }
    }
}
