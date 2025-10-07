import Foundation

struct AuthService {
    static let shared = AuthService()

    private let apiClient = APIClient.shared

    // MARK: - Models
    struct RegisterRequest: Codable {
        let email: String
        let password: String
        let name: String
    }

    struct LoginRequest: Codable {
        let email: String
        let password: String
    }

    struct RegisterResponse: Codable {
        let user: User
        let accessToken: String
        let refreshToken: String
    }

    struct LoginResponse: Codable {
        let user: User
        let accessToken: String
        let refreshToken: String
    }

    struct Session {
        let user: User
        let accessToken: String
        let refreshToken: String
    }

    // MARK: - Authentication Methods

    func register(email: String, password: String, name: String) async throws -> User {
        let request = RegisterRequest(email: email, password: password, name: name)

        let response: RegisterResponse = try await apiClient.post(
            endpoint: "/auth/register",
            body: request
        )

        return response.user
    }

    func login(email: String, password: String) async throws -> Session {
        let request = LoginRequest(email: email, password: password)

        let response: LoginResponse = try await apiClient.post(
            endpoint: "/auth/login",
            body: request
        )

        return Session(
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
        )
    }

    func refreshToken() async throws -> String {
        guard let refreshToken = KeychainService.shared.getRefreshToken() else {
            throw AuthError.noRefreshToken
        }

        struct RefreshResponse: Codable {
            let accessToken: String
        }

        let response: RefreshResponse = try await apiClient.post(
            endpoint: "/auth/refresh",
            body: ["refreshToken": refreshToken]
        )

        try KeychainService.shared.saveAccessToken(response.accessToken)

        return response.accessToken
    }

    func logout() async throws {
        // Clear local tokens
        KeychainService.shared.deleteTokens()

        // Optional: Notify backend
        // try await apiClient.post(endpoint: "/auth/logout", body: [:])
    }
}

// MARK: - Auth Errors
enum AuthError: LocalizedError {
    case noRefreshToken
    case invalidCredentials
    case networkError

    var errorDescription: String? {
        switch self {
        case .noRefreshToken:
            return "No refresh token available"
        case .invalidCredentials:
            return "Invalid email or password"
        case .networkError:
            return "Network error. Please try again."
        }
    }
}
