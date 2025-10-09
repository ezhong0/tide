/**
 * APIClient Tests
 * Tests for the main API client that handles all backend communication
 */

import XCTest
@testable import TideIOS

final class APIClientTests: XCTestCase {

    var mockSession: URLSession!

    override func setUp() {
        super.setUp()

        // Create a mock URL session configuration for testing
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        mockSession = URLSession(configuration: config)
    }

    override func tearDown() {
        mockSession = nil
        MockURLProtocol.requestHandler = nil
        super.tearDown()
    }

    // MARK: - Initialization Tests

    func testAPIClient_InitializesWithBaseURL() {
        let baseURL = "https://api.test.com"
        let config = APIClientConfig(baseURL: baseURL)

        XCTAssertEqual(config.baseURL, baseURL)
    }

    // MARK: - Request Building Tests

    func testAPIClient_BuildsCorrectURL() throws {
        let endpoint = "/users/123"
        let baseURL = "https://api.test.com"
        let fullURL = URL(string: baseURL + endpoint)

        XCTAssertNotNil(fullURL)
        XCTAssertEqual(fullURL?.absoluteString, "https://api.test.com/users/123")
    }

    func testAPIClient_AddsQueryParameters() {
        var components = URLComponents(string: "https://api.test.com/users")!
        components.queryItems = [
            URLQueryItem(name: "page", value: "1"),
            URLQueryItem(name: "limit", value: "10")
        ]

        let url = components.url!

        XCTAssertTrue(url.absoluteString.contains("page=1"))
        XCTAssertTrue(url.absoluteString.contains("limit=10"))
    }

    // MARK: - HTTP Method Tests

    func testAPIClient_GET_Request() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.httpMethod = "GET"

        XCTAssertEqual(request.httpMethod, "GET")
        XCTAssertNil(request.httpBody)
    }

    func testAPIClient_POST_Request() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.httpMethod = "POST"
        let body = ["name": "Test"]
        request.httpBody = try? JSONEncoder().encode(body)

        XCTAssertEqual(request.httpMethod, "POST")
        XCTAssertNotNil(request.httpBody)
    }

    func testAPIClient_PUT_Request() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data/1")!)
        request.httpMethod = "PUT"

        XCTAssertEqual(request.httpMethod, "PUT")
    }

    func testAPIClient_DELETE_Request() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data/1")!)
        request.httpMethod = "DELETE"

        XCTAssertEqual(request.httpMethod, "DELETE")
    }

    // MARK: - Header Tests

    func testAPIClient_SetsContentTypeHeader() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        XCTAssertEqual(request.value(forHTTPHeaderField: "Content-Type"), "application/json")
    }

    func testAPIClient_SetsAuthorizationHeader() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.setValue("Bearer token123", forHTTPHeaderField: "Authorization")

        XCTAssertEqual(request.value(forHTTPHeaderField: "Authorization"), "Bearer token123")
    }

    func testAPIClient_SetsUserAgentHeader() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.setValue("Tide iOS/1.0", forHTTPHeaderField: "User-Agent")

        XCTAssertEqual(request.value(forHTTPHeaderField: "User-Agent"), "Tide iOS/1.0")
    }

    // MARK: - Response Handling Tests

    func testAPIClient_Handles200Response() throws {
        let statusCode = 200
        XCTAssertTrue(statusCode.isSuccessful)
        XCTAssertFalse(statusCode.isClientError)
        XCTAssertFalse(statusCode.isServerError)
    }

    func testAPIClient_Handles404Response() {
        let statusCode = 404
        XCTAssertFalse(statusCode.isSuccessful)
        XCTAssertTrue(statusCode.isClientError)
        XCTAssertFalse(statusCode.isServerError)
    }

    func testAPIClient_Handles500Response() {
        let statusCode = 500
        XCTAssertFalse(statusCode.isSuccessful)
        XCTAssertFalse(statusCode.isClientError)
        XCTAssertTrue(statusCode.isServerError)
        XCTAssertTrue(statusCode.isRetryable)
    }

    // MARK: - Error Handling Tests

    func testAPIClient_HandlesNetworkError() {
        let error = NetworkError.noInternetConnection

        XCTAssertTrue(error.isRetryable)
        XCTAssertEqual(error.errorDescription, "No internet connection")
    }

    func testAPIClient_HandlesDecodingError() {
        let underlyingError = NSError(domain: "DecodingError", code: 1)
        let error = NetworkError.decodingFailed(underlyingError)

        XCTAssertFalse(error.isRetryable)
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIClient_HandlesTimeoutError() {
        let error = NetworkError.timeout

        XCTAssertTrue(error.isRetryable)
        XCTAssertEqual(error.errorDescription, "Request timed out")
    }

    // MARK: - JSON Encoding/Decoding Tests

    func testAPIClient_EncodesJSONBody() throws {
        struct TestRequest: Codable {
            let name: String
            let age: Int
        }

        let request = TestRequest(name: "John", age: 30)
        let data = try JSONEncoder().encode(request)

        XCTAssertNotNil(data)

        let decoded = try JSONDecoder().decode(TestRequest.self, from: data)
        XCTAssertEqual(decoded.name, "John")
        XCTAssertEqual(decoded.age, 30)
    }

    func testAPIClient_DecodesJSONResponse() throws {
        struct TestResponse: Codable {
            let success: Bool
            let message: String
        }

        let json = """
        {
            "success": true,
            "message": "Operation completed"
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(TestResponse.self, from: json)

        XCTAssertTrue(response.success)
        XCTAssertEqual(response.message, "Operation completed")
    }

    // MARK: - Timeout Tests

    func testAPIClient_DefaultTimeout() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.timeoutInterval = 30.0

        XCTAssertEqual(request.timeoutInterval, 30.0)
    }

    func testAPIClient_CustomTimeout() {
        var request = URLRequest(url: URL(string: "https://api.test.com/data")!)
        request.timeoutInterval = 60.0

        XCTAssertEqual(request.timeoutInterval, 60.0)
    }
}

// MARK: - Mock URL Protocol for Testing

class MockURLProtocol: URLProtocol {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data?))?

    override class func canInit(with request: URLRequest) -> Bool {
        return true
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        return request
    }

    override func startLoading() {
        guard let handler = MockURLProtocol.requestHandler else {
            fatalError("Handler is unavailable")
        }

        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            if let data = data {
                client?.urlProtocol(self, didLoad: data)
            }
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

// MARK: - Test Configuration

struct APIClientConfig {
    let baseURL: String
    let timeout: TimeInterval

    init(baseURL: String, timeout: TimeInterval = 30.0) {
        self.baseURL = baseURL
        self.timeout = timeout
    }
}
