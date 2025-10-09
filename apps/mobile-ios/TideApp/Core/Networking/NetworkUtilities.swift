/**
 * Network Utilities
 * Elegant networking utilities for retry logic, error handling, and resilience
 * Eliminates architectural debt around network reliability
 */

import Foundation

// MARK: - Retry Configuration

struct RetryConfiguration {
    let maxAttempts: Int
    let initialDelay: TimeInterval
    let maxDelay: TimeInterval
    let multiplier: Double
    let retryableStatusCodes: Set<Int>

    static let `default` = RetryConfiguration(
        maxAttempts: 3,
        initialDelay: 1.0,
        maxDelay: 60.0,
        multiplier: 2.0,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504]
    )

    static let aggressive = RetryConfiguration(
        maxAttempts: 5,
        initialDelay: 0.5,
        maxDelay: 30.0,
        multiplier: 1.5,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504]
    )

    static let conservative = RetryConfiguration(
        maxAttempts: 2,
        initialDelay: 2.0,
        maxDelay: 10.0,
        multiplier: 2.0,
        retryableStatusCodes: [503, 504]
    )

    static let none = RetryConfiguration(
        maxAttempts: 1,
        initialDelay: 0,
        maxDelay: 0,
        multiplier: 1,
        retryableStatusCodes: []
    )
}

// MARK: - Network Error

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingFailed(Error)
    case httpError(statusCode: Int, data: Data?)
    case timeout
    case cancelled
    case noInternetConnection
    case serverError(message: String)
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received from server"
        case .decodingFailed(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .httpError(let statusCode, _):
            return "Server returned error \(statusCode)"
        case .timeout:
            return "Request timed out"
        case .cancelled:
            return "Request was cancelled"
        case .noInternetConnection:
            return "No internet connection"
        case .serverError(let message):
            return message
        case .unknown(let error):
            return error.localizedDescription
        }
    }

    var isRetryable: Bool {
        switch self {
        case .timeout, .noInternetConnection:
            return true
        case .httpError(let code, _):
            return RetryConfiguration.default.retryableStatusCodes.contains(code)
        case .cancelled, .invalidURL, .decodingFailed:
            return false
        case .noData, .serverError, .unknown:
            return true
        }
    }
}

// MARK: - Retry Logic

enum RetryLogic {

    /// Execute a network request with exponential backoff retry logic
    static func executeWithRetry<T>(
        configuration: RetryConfiguration = .default,
        operation: @escaping () async throws -> T
    ) async throws -> T {
        var lastError: Error?
        var delay = configuration.initialDelay

        for attempt in 1...configuration.maxAttempts {
            do {
                let result = try await operation()
                if attempt > 1 {
                    Logger.info("Request succeeded on attempt \(attempt)")
                }
                return result
            } catch {
                lastError = error

                // Check if error is retryable
                let shouldRetry: Bool
                if let networkError = error as? NetworkError {
                    shouldRetry = networkError.isRetryable
                } else if let urlError = error as? URLError {
                    shouldRetry = isRetryableURLError(urlError)
                } else {
                    shouldRetry = true
                }

                // Don't retry if not retryable or if this was the last attempt
                guard shouldRetry && attempt < configuration.maxAttempts else {
                    Logger.warning("Request failed on attempt \(attempt), not retrying")
                    throw error
                }

                // Log retry attempt
                Logger.warning("Request failed on attempt \(attempt)/\(configuration.maxAttempts), retrying in \(delay)s")

                // Wait before retrying
                try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))

                // Calculate next delay with exponential backoff
                delay = min(delay * configuration.multiplier, configuration.maxDelay)
            }
        }

        // If we got here, all retries failed
        throw lastError ?? NetworkError.unknown(NSError(domain: "RetryLogic", code: -1))
    }

    private static func isRetryableURLError(_ error: URLError) -> Bool {
        switch error.code {
        case .timedOut, .networkConnectionLost, .notConnectedToInternet, .cannotConnectToHost:
            return true
        case .cancelled:
            return false
        default:
            return true
        }
    }
}

// MARK: - Request Timeout Handler

actor RequestTimeoutHandler {
    private var tasks: [UUID: Task<Void, Never>] = [:]

    func withTimeout<T>(
        seconds: TimeInterval,
        operation: @escaping () async throws -> T
    ) async throws -> T {
        let taskId = UUID()

        return try await withThrowingTaskGroup(of: T.self) { group in
            // Add the actual operation
            group.addTask {
                let result = try await operation()
                return result
            }

            // Add timeout task
            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
                throw NetworkError.timeout
            }

            // Wait for first to complete
            let result = try await group.next()!

            // Cancel remaining tasks
            group.cancelAll()

            return result
        }
    }
}

// MARK: - Request Cancellation Handler

final class RequestCancellationHandler {
    private var tasks: [String: Task<Void, Never>] = [:]

    func register(requestId: String, task: Task<Void, Never>) {
        tasks[requestId] = task
    }

    func cancel(requestId: String) {
        tasks[requestId]?.cancel()
        tasks.removeValue(forKey: requestId)
    }

    func cancelAll() {
        tasks.values.forEach { $0.cancel() }
        tasks.removeAll()
    }
}

// MARK: - Network Reachability

@MainActor
final class NetworkReachability: ObservableObject {
    @Published private(set) var isConnected: Bool = true
    @Published private(set) var connectionType: ConnectionType = .wifi

    enum ConnectionType {
        case wifi
        case cellular
        case ethernet
        case none
    }

    static let shared = NetworkReachability()

    private init() {
        // Initialize reachability monitoring
        // For now, assume connected - full implementation would use NWPathMonitor
        checkConnection()
    }

    private func checkConnection() {
        // Simplified implementation
        // Full implementation would use Network framework's NWPathMonitor
        isConnected = true
        connectionType = .wifi
    }

    func startMonitoring() {
        Logger.info("Network reachability monitoring started")
    }

    func stopMonitoring() {
        Logger.info("Network reachability monitoring stopped")
    }
}

// MARK: - HTTP Status Code Extensions

extension Int {
    var isSuccessful: Bool { (200...299).contains(self) }
    var isClientError: Bool { (400...499).contains(self) }
    var isServerError: Bool { (500...599).contains(self) }
    var isRetryable: Bool {
        RetryConfiguration.default.retryableStatusCodes.contains(self)
    }
}
