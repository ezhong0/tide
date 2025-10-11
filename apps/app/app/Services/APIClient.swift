import Foundation

class APIClient {
    static let shared = APIClient()

    private let baseURL: String
    private let session: URLSession

    init() {
        // Use live Railway gateway URL from Config
        self.baseURL = Config.apiBaseURL

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: config)
    }

    // MARK: - Generic Request Methods

    func get<T: Decodable>(endpoint: String) async throws -> T {
        try await request(endpoint: endpoint, method: "GET", body: nil as String?)
    }

    func post<Body: Encodable, Response: Decodable>(
        endpoint: String,
        body: Body
    ) async throws -> Response {
        try await request(endpoint: endpoint, method: "POST", body: body)
    }

    func put<Body: Encodable, Response: Decodable>(
        endpoint: String,
        body: Body
    ) async throws -> Response {
        try await request(endpoint: endpoint, method: "PUT", body: body)
    }

    func patch<Body: Encodable, Response: Decodable>(
        endpoint: String,
        body: Body
    ) async throws -> Response {
        try await request(endpoint: endpoint, method: "PATCH", body: body)
    }

    func delete<T: Decodable>(endpoint: String) async throws -> T {
        try await request(endpoint: endpoint, method: "DELETE", body: nil as String?)
    }

    // MARK: - Private Request Handler

    private func request<Body: Encodable, Response: Decodable>(
        endpoint: String,
        method: String,
        body: Body?
    ) async throws -> Response {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth token if available
        if let accessToken = KeychainService.shared.getAccessToken() {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        // Encode body if present
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        // Execute request
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        // Handle HTTP errors
        switch httpResponse.statusCode {
        case 200...299:
            // Success - decode response
            do {
                let decoder = JSONDecoder()
                decoder.keyDecodingStrategy = .convertFromSnakeCase

                // Custom ISO8601 date decoding strategy that handles milliseconds
                decoder.dateDecodingStrategy = .custom { decoder in
                    let container = try decoder.singleValueContainer()
                    let dateString = try container.decode(String.self)

                    // Try with fractional seconds first
                    let formatterWithFractional = ISO8601DateFormatter()
                    formatterWithFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                    if let date = formatterWithFractional.date(from: dateString) {
                        return date
                    }

                    // Fallback to standard ISO8601
                    let formatterStandard = ISO8601DateFormatter()
                    formatterStandard.formatOptions = [.withInternetDateTime]
                    if let date = formatterStandard.date(from: dateString) {
                        return date
                    }

                    throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date format: \(dateString)")
                }

                return try decoder.decode(Response.self, from: data)
            } catch {
                print("❌ Decoding error: \(error)")
                print("📦 Response data: \(String(data: data, encoding: .utf8) ?? "nil")")
                throw APIError.decodingError(error)
            }

        case 401:
            // Unauthorized - try to refresh token
            try await refreshTokenAndRetry()
            throw APIError.unauthorized

        case 400...499:
            throw APIError.clientError(httpResponse.statusCode)

        case 500...599:
            throw APIError.serverError(httpResponse.statusCode)

        default:
            throw APIError.unknown
        }
    }

    // MARK: - Token Refresh

    @MainActor
    private func refreshTokenAndRetry() async throws {
        // Try to refresh the access token using AuthManager
        try await AuthManager.shared.refreshAccessToken()
    }
}

// MARK: - API Errors
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case clientError(Int)
    case serverError(Int)
    case decodingError(Error)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid server response"
        case .unauthorized:
            return "Unauthorized. Please login again."
        case .clientError(let code):
            return "Client error: \(code)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .unknown:
            return "Unknown error occurred"
        }
    }
}
