/**
 * Token Refresh Manager
 * Handles JWT token refresh logic elegantly
 * Ensures tokens are always fresh before making requests
 */

import Foundation

@MainActor
final class TokenRefreshManager: ObservableObject {

    // MARK: - Properties

    @Published private(set) var isRefreshing = false

    private var keychain: KeychainManagerProtocol
    private var refreshTask: Task<String, Error>?

    // MARK: - Initialization

    init(keychain: KeychainManagerProtocol) {
        self.keychain = keychain
    }

    // MARK: - Token Refresh

    /// Refresh the access token using the refresh token
    func refreshAccessToken() async throws -> String {
        // If already refreshing, wait for existing task
        if let existingTask = refreshTask {
            return try await existingTask.value
        }

        // Create new refresh task
        let task = Task<String, Error> {
            isRefreshing = true
            defer { isRefreshing = false }

            Logger.authEvent("Refreshing access token...")

            guard let refreshToken = keychain.refreshToken else {
                Logger.authError("No refresh token available")
                throw TokenRefreshError.noRefreshToken
            }

            // Make refresh request
            do {
                let newTokens = try await performRefreshRequest(refreshToken: refreshToken)

                // Save new tokens
                keychain.accessToken = newTokens.accessToken
                if let newRefreshToken = newTokens.refreshToken {
                    keychain.refreshToken = newRefreshToken
                }

                Logger.authEvent("Access token refreshed successfully")

                // Clean up task
                refreshTask = nil

                return newTokens.accessToken

            } catch {
                Logger.authError("Token refresh failed", error: error)

                // Clear tokens on failure
                keychain.clearSession()

                // Clean up task
                refreshTask = nil

                throw TokenRefreshError.refreshFailed(error)
            }
        }

        refreshTask = task
        return try await task.value
    }

    /// Check if access token is expired or about to expire
    func isTokenExpired(_ token: String?) -> Bool {
        guard let token = token else { return true }

        // Decode JWT and check expiration
        guard let expirationDate = JWTDecoder.expirationDate(from: token) else {
            // If we can't decode, assume expired
            return true
        }

        // Consider expired if less than 5 minutes remaining
        let bufferTime: TimeInterval = 300 // 5 minutes
        return expirationDate.timeIntervalSinceNow < bufferTime
    }

    /// Get valid access token (refresh if needed)
    func getValidAccessToken() async throws -> String {
        guard let currentToken = keychain.accessToken else {
            throw TokenRefreshError.noAccessToken
        }

        // Check if token is expired or about to expire
        if isTokenExpired(currentToken) {
            Logger.authEvent("Access token expired, refreshing...")
            return try await refreshAccessToken()
        }

        return currentToken
    }

    // MARK: - Private Helpers

    private func performRefreshRequest(refreshToken: String) async throws -> TokenResponse {
        // Build refresh request
        guard let url = URL(string: Config.apiBaseURL + "/api/auth/refresh") else {
            throw TokenRefreshError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = RefreshRequest(refreshToken: refreshToken)
        request.httpBody = try JSONEncoder().encode(body)

        // Perform request (no retry logic for refresh - single attempt)
        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw TokenRefreshError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw TokenRefreshError.httpError(statusCode: httpResponse.statusCode)
        }

        // Decode response
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        do {
            return try decoder.decode(TokenResponse.self, from: data)
        } catch {
            throw TokenRefreshError.decodingFailed(error)
        }
    }
}

// MARK: - Errors

enum TokenRefreshError: Error, LocalizedError {
    case noAccessToken
    case noRefreshToken
    case refreshFailed(Error)
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingFailed(Error)

    var errorDescription: String? {
        switch self {
        case .noAccessToken:
            return "No access token available"
        case .noRefreshToken:
            return "No refresh token available"
        case .refreshFailed(let error):
            return "Failed to refresh token: \(error.localizedDescription)"
        case .invalidURL:
            return "Invalid refresh URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode):
            return "Server returned error \(statusCode)"
        case .decodingFailed(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        }
    }
}

// MARK: - Request/Response Types

private struct RefreshRequest: Encodable {
    let refreshToken: String
}

struct TokenResponse: Decodable {
    let accessToken: String
    let refreshToken: String?
    let expiresIn: Int?
}
