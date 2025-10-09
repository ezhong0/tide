/**
 * NetworkUtilities Tests
 * Comprehensive tests for network retry logic, timeout handling, and error handling
 */

import XCTest
@testable import TideIOS

final class NetworkUtilitiesTests: XCTestCase {

    // MARK: - Retry Configuration Tests

    func testRetryConfiguration_Default() {
        let config = RetryConfiguration.default

        XCTAssertEqual(config.maxAttempts, 3, "Default should have 3 max attempts")
        XCTAssertEqual(config.initialDelay, 1.0, "Default initial delay should be 1 second")
        XCTAssertEqual(config.multiplier, 2.0, "Default multiplier should be 2.0")
        XCTAssertTrue(config.retryableStatusCodes.contains(503), "503 should be retryable")
        XCTAssertTrue(config.retryableStatusCodes.contains(429), "429 should be retryable")
    }

    func testRetryConfiguration_Aggressive() {
        let config = RetryConfiguration.aggressive

        XCTAssertEqual(config.maxAttempts, 5, "Aggressive should have 5 max attempts")
        XCTAssertEqual(config.initialDelay, 0.5, "Aggressive initial delay should be 0.5 seconds")
        XCTAssertEqual(config.maxDelay, 30.0, "Aggressive max delay should be 30 seconds")
    }

    func testRetryConfiguration_Conservative() {
        let config = RetryConfiguration.conservative

        XCTAssertEqual(config.maxAttempts, 2, "Conservative should have 2 max attempts")
        XCTAssertEqual(config.initialDelay, 2.0, "Conservative initial delay should be 2 seconds")
        XCTAssertEqual(config.retryableStatusCodes, [503, 504], "Conservative should only retry 503/504")
    }

    func testRetryConfiguration_None() {
        let config = RetryConfiguration.none

        XCTAssertEqual(config.maxAttempts, 1, "None should have 1 attempt (no retry)")
        XCTAssertTrue(config.retryableStatusCodes.isEmpty, "None should have no retryable codes")
    }

    // MARK: - NetworkError Tests

    func testNetworkError_ErrorDescriptions() {
        XCTAssertEqual(NetworkError.invalidURL.errorDescription, "Invalid URL")
        XCTAssertEqual(NetworkError.noData.errorDescription, "No data received from server")
        XCTAssertEqual(NetworkError.timeout.errorDescription, "Request timed out")
        XCTAssertEqual(NetworkError.noInternetConnection.errorDescription, "No internet connection")
        XCTAssertEqual(NetworkError.cancelled.errorDescription, "Request was cancelled")
    }

    func testNetworkError_HTTPErrorDescription() {
        let error = NetworkError.httpError(statusCode: 404, data: nil)
        XCTAssertEqual(error.errorDescription, "Server returned error 404")
    }

    func testNetworkError_DecodingErrorDescription() {
        let decodingError = NSError(domain: "DecodingError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON"])
        let error = NetworkError.decodingFailed(decodingError)

        XCTAssertTrue(error.errorDescription?.contains("Failed to decode response") ?? false)
    }

    func testNetworkError_IsRetryable_Timeout() {
        let error = NetworkError.timeout
        XCTAssertTrue(error.isRetryable, "Timeout errors should be retryable")
    }

    func testNetworkError_IsRetryable_NoInternet() {
        let error = NetworkError.noInternetConnection
        XCTAssertTrue(error.isRetryable, "No internet errors should be retryable")
    }

    func testNetworkError_IsNotRetryable_Cancelled() {
        let error = NetworkError.cancelled
        XCTAssertFalse(error.isRetryable, "Cancelled errors should not be retryable")
    }

    func testNetworkError_IsNotRetryable_InvalidURL() {
        let error = NetworkError.invalidURL
        XCTAssertFalse(error.isRetryable, "Invalid URL errors should not be retryable")
    }

    func testNetworkError_IsRetryable_HTTPError503() {
        let error = NetworkError.httpError(statusCode: 503, data: nil)
        XCTAssertTrue(error.isRetryable, "503 errors should be retryable")
    }

    func testNetworkError_IsNotRetryable_HTTPError400() {
        let error = NetworkError.httpError(statusCode: 400, data: nil)
        XCTAssertFalse(error.isRetryable, "400 errors should not be retryable")
    }

    // MARK: - Retry Logic Tests

    func testRetryLogic_SuccessOnFirstAttempt() async throws {
        var callCount = 0

        let result = try await RetryLogic.executeWithRetry(configuration: .default) {
            callCount += 1
            return "success"
        }

        XCTAssertEqual(callCount, 1, "Should only call once on success")
        XCTAssertEqual(result, "success")
    }

    func testRetryLogic_SuccessOnSecondAttempt() async throws {
        var callCount = 0

        let result = try await RetryLogic.executeWithRetry(configuration: .default) {
            callCount += 1
            if callCount == 1 {
                throw NetworkError.timeout
            }
            return "success"
        }

        XCTAssertEqual(callCount, 2, "Should retry once before succeeding")
        XCTAssertEqual(result, "success")
    }

    func testRetryLogic_FailsAfterMaxAttempts() async {
        var callCount = 0
        let config = RetryConfiguration(
            maxAttempts: 3,
            initialDelay: 0.01,  // Very short for testing
            maxDelay: 0.1,
            multiplier: 1.0,
            retryableStatusCodes: [503]
        )

        do {
            _ = try await RetryLogic.executeWithRetry(configuration: config) {
                callCount += 1
                throw NetworkError.timeout
            }
            XCTFail("Should have thrown error")
        } catch {
            XCTAssertEqual(callCount, 3, "Should retry max attempts")
            XCTAssertTrue(error is NetworkError)
        }
    }

    func testRetryLogic_DoesNotRetryNonRetryableError() async {
        var callCount = 0

        do {
            _ = try await RetryLogic.executeWithRetry(configuration: .default) {
                callCount += 1
                throw NetworkError.invalidURL
            }
            XCTFail("Should have thrown error")
        } catch {
            XCTAssertEqual(callCount, 1, "Should not retry non-retryable errors")
        }
    }

    func testRetryLogic_ExponentialBackoff() async throws {
        var callCount = 0
        var timestamps: [Date] = []
        let config = RetryConfiguration(
            maxAttempts: 3,
            initialDelay: 0.1,
            maxDelay: 1.0,
            multiplier: 2.0,
            retryableStatusCodes: [503]
        )

        do {
            _ = try await RetryLogic.executeWithRetry(configuration: config) {
                callCount += 1
                timestamps.append(Date())
                throw NetworkError.timeout
            }
        } catch {
            // Verify delays increased exponentially
            XCTAssertEqual(timestamps.count, 3)

            let delay1 = timestamps[1].timeIntervalSince(timestamps[0])
            let delay2 = timestamps[2].timeIntervalSince(timestamps[1])

            // Allow some tolerance (±50%) for async timing
            XCTAssertTrue(delay1 >= 0.05, "First delay should be ~0.1s")
            XCTAssertTrue(delay2 >= 0.15, "Second delay should be ~0.2s (doubled)")
            XCTAssertTrue(delay2 > delay1, "Delays should increase exponentially")
        }
    }

    // MARK: - Request Timeout Handler Tests

    func testRequestTimeout_CompletesBeforeTimeout() async throws {
        let handler = RequestTimeoutHandler()

        let result = try await handler.withTimeout(seconds: 1.0) {
            try await Task.sleep(nanoseconds: 10_000_000) // 0.01s
            return "completed"
        }

        XCTAssertEqual(result, "completed", "Should complete before timeout")
    }

    func testRequestTimeout_ThrowsAfterTimeout() async {
        let handler = RequestTimeoutHandler()

        do {
            _ = try await handler.withTimeout(seconds: 0.1) {
                try await Task.sleep(nanoseconds: 500_000_000) // 0.5s
                return "should not reach"
            }
            XCTFail("Should have timed out")
        } catch let error as NetworkError {
            if case .timeout = error {
                // Success - timed out as expected
            } else {
                XCTFail("Wrong error type: \(error)")
            }
        } catch {
            XCTFail("Unexpected error: \(error)")
        }
    }

    // MARK: - Request Cancellation Handler Tests

    func testRequestCancellation_RegisterAndCancel() {
        let handler = RequestCancellationHandler()
        let task = Task {}

        handler.register(requestId: "test-request", task: task)
        handler.cancel(requestId: "test-request")

        XCTAssertTrue(task.isCancelled, "Task should be cancelled")
    }

    func testRequestCancellation_CancelAll() {
        let handler = RequestCancellationHandler()
        let task1 = Task {}
        let task2 = Task {}

        handler.register(requestId: "request-1", task: task1)
        handler.register(requestId: "request-2", task: task2)

        handler.cancelAll()

        XCTAssertTrue(task1.isCancelled, "Task 1 should be cancelled")
        XCTAssertTrue(task2.isCancelled, "Task 2 should be cancelled")
    }

    // MARK: - HTTP Status Code Extension Tests

    func testHTTPStatusCode_IsSuccessful() {
        XCTAssertTrue(200.isSuccessful, "200 should be successful")
        XCTAssertTrue(201.isSuccessful, "201 should be successful")
        XCTAssertTrue(299.isSuccessful, "299 should be successful")
        XCTAssertFalse(300.isSuccessful, "300 should not be successful")
        XCTAssertFalse(400.isSuccessful, "400 should not be successful")
    }

    func testHTTPStatusCode_IsClientError() {
        XCTAssertTrue(400.isClientError, "400 should be client error")
        XCTAssertTrue(404.isClientError, "404 should be client error")
        XCTAssertTrue(499.isClientError, "499 should be client error")
        XCTAssertFalse(500.isClientError, "500 should not be client error")
    }

    func testHTTPStatusCode_IsServerError() {
        XCTAssertTrue(500.isServerError, "500 should be server error")
        XCTAssertTrue(503.isServerError, "503 should be server error")
        XCTAssertTrue(599.isServerError, "599 should be server error")
        XCTAssertFalse(400.isServerError, "400 should not be server error")
    }

    func testHTTPStatusCode_IsRetryable() {
        XCTAssertTrue(503.isRetryable, "503 should be retryable")
        XCTAssertTrue(429.isRetryable, "429 should be retryable")
        XCTAssertTrue(500.isRetryable, "500 should be retryable")
        XCTAssertFalse(400.isRetryable, "400 should not be retryable")
        XCTAssertFalse(404.isRetryable, "404 should not be retryable")
    }

    // MARK: - Performance Tests

    func testRetryLogic_Performance() {
        measure {
            let expectation = expectation(description: "Retry performance")
            let config = RetryConfiguration(
                maxAttempts: 3,
                initialDelay: 0.001,
                maxDelay: 0.01,
                multiplier: 1.0,
                retryableStatusCodes: [503]
            )

            Task {
                var count = 0
                do {
                    _ = try await RetryLogic.executeWithRetry(configuration: config) {
                        count += 1
                        if count < 3 {
                            throw NetworkError.timeout
                        }
                        return "success"
                    }
                } catch {
                    // Ignore
                }
                expectation.fulfill()
            }

            wait(for: [expectation], timeout: 1.0)
        }
    }
}
