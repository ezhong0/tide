import Foundation
import AuthenticationServices

@MainActor
class GoogleOAuthService: NSObject, ObservableObject {
    static let shared = GoogleOAuthService()

    @Published var isAuthenticating = false
    @Published var authError: String?

    private var authSession: ASWebAuthenticationSession?
    private var presentationContext: ASWebAuthenticationPresentationContext?

    private override init() {
        super.init()
    }

    /// Connect Gmail account using Google OAuth
    func connectGmail(userId: String) async throws {
        isAuthenticating = true
        authError = nil

        defer {
            isAuthenticating = false
        }

        // Get OAuth code from Google
        let authCode = try await authorizeWithGoogle()

        // Exchange code for tokens via backend
        try await exchangeCodeForTokens(authCode: authCode, userId: userId, provider: "gmail")
    }

    // MARK: - OAuth Flow

    private func authorizeWithGoogle() async throws -> String {
        // Google OAuth configuration
        // TODO: Move these to Config.swift and set in environment
        let clientId = Config.googleIOSClientId
        let redirectScheme = "com.googleusercontent.apps.\(Config.googleIOSClientId.split(separator: ".").first ?? ""))"
        let scope = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send"

        // Build OAuth URL
        let redirectUri = "\(redirectScheme):/oauth2redirect"

        var components = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        components.queryItems = [
            URLQueryItem(name: "client_id", value: clientId),
            URLQueryItem(name: "redirect_uri", value: redirectUri),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: scope),
            URLQueryItem(name: "access_type", value: "offline"), // Get refresh token
            URLQueryItem(name: "prompt", value: "consent"), // Force consent to get refresh token
        ]

        guard let authURL = components.url else {
            throw OAuthError.invalidURL
        }

        // Open OAuth in web authentication session
        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(
                url: authURL,
                callbackURLScheme: redirectScheme
            ) { callbackURL, error in
                if let error = error {
                    continuation.resume(throwing: OAuthError.authenticationFailed(error.localizedDescription))
                    return
                }

                guard let callbackURL = callbackURL,
                      let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
                      let code = components.queryItems?.first(where: { $0.name == "code" })?.value else {
                    continuation.resume(throwing: OAuthError.noAuthCode)
                    return
                }

                continuation.resume(returning: code)
            }

            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            session.start()

            self.authSession = session
        }
    }

    private func exchangeCodeForTokens(authCode: String, userId: String, provider: String) async throws {
        struct ExchangeRequest: Codable {
            let authCode: String
            let userId: String
        }

        struct ExchangeResponse: Codable {
            let success: Bool
            let provider: String?
        }

        let request = ExchangeRequest(authCode: authCode, userId: userId)

        let response: ExchangeResponse = try await APIClient.shared.post(
            endpoint: "/api/email/connect/\(provider)/oauth",
            body: request
        )

        if !response.success {
            throw OAuthError.tokenExchangeFailed
        }
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension GoogleOAuthService: ASWebAuthenticationPresentationContextProviding {
    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        // Return the key window
        return ASPresentationAnchor()
    }
}

// MARK: - Errors

enum OAuthError: LocalizedError {
    case invalidURL
    case authenticationFailed(String)
    case noAuthCode
    case tokenExchangeFailed

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid OAuth URL"
        case .authenticationFailed(let message):
            return "Authentication failed: \(message)"
        case .noAuthCode:
            return "No authorization code received"
        case .tokenExchangeFailed:
            return "Failed to exchange authorization code for tokens"
        }
    }
}
