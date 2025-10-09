/**
 * OAuth Service
 * Handles OAuth authentication flows for Google and Microsoft via Supabase
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
    private let supabaseManager: SupabaseManager

    // MARK: - Initialization

    init(supabaseManager: SupabaseManager = .shared) {
        self.supabaseManager = supabaseManager
        super.init()
    }

    // MARK: - OAuth Methods

    /// Sign in with Google OAuth via Supabase
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

                    // Request Gmail and Calendar scopes
                    let scopes = "email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar"

                    // Get the OAuth URL from Supabase
                    let authURL = try await supabaseManager.getOAuthSignInURL(
                        provider: provider,
                        redirectTo: redirectURL,
                        scopes: scopes
                    )

                    // Open OAuth in web authentication session
                    let session = ASWebAuthenticationSession(
                        url: authURL,
                        callbackURLScheme: "com.tide.app"
                    ) { [weak self] callbackURL, error in
                        Task { @MainActor in
                            if let error = error {
                                if (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                                    continuation.resume(throwing: OAuthError.cancelled)
                                } else {
                                    continuation.resume(throwing: OAuthError.authenticationFailed(error.localizedDescription))
                                }
                                return
                            }

                            guard let callbackURL = callbackURL else {
                                continuation.resume(throwing: OAuthError.noCallbackURL)
                                return
                            }

                            // Exchange callback for session via Supabase
                            do {
                                let session = try await self?.supabaseManager.handleOAuthCallback(url: callbackURL)
                                guard let session = session else {
                                    continuation.resume(throwing: OAuthError.noSession)
                                    return
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

    /// Sign in with Microsoft OAuth via Supabase
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
                    let scopes = "User.Read Mail.ReadWrite Calendars.ReadWrite offline_access"

                    let authURL = try await supabaseManager.getOAuthSignInURL(
                        provider: provider,
                        redirectTo: redirectURL,
                        scopes: scopes
                    )

                    let session = ASWebAuthenticationSession(
                        url: authURL,
                        callbackURLScheme: "com.tide.app"
                    ) { [weak self] callbackURL, error in
                        Task { @MainActor in
                            if let error = error {
                                if (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                                    continuation.resume(throwing: OAuthError.cancelled)
                                } else {
                                    continuation.resume(throwing: OAuthError.authenticationFailed(error.localizedDescription))
                                }
                                return
                            }

                            guard let callbackURL = callbackURL else {
                                continuation.resume(throwing: OAuthError.noCallbackURL)
                                return
                            }

                            do {
                                let session = try await self?.supabaseManager.handleOAuthCallback(url: callbackURL)
                                guard let session = session else {
                                    continuation.resume(throwing: OAuthError.noSession)
                                    return
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

    /// Handle OAuth callback URL
    func handleOAuthCallback(url: URL) async throws -> Session {
        return try await supabaseManager.handleOAuthCallback(url: url)
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
