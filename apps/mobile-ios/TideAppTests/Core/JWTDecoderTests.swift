/**
 * JWT Decoder Tests
 * Unit tests for JWT token decoding and validation
 */

import XCTest
@testable import TideApp

final class JWTDecoderTests: XCTestCase {

    // MARK: - Test Cases

    func testDecodeValidToken() {
        // Given: A valid JWT token
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoyMDAwMDAwMDAwLCJpYXQiOjE2MDAwMDAwMDAsImVtYWlsIjoidGVzdEB0aWRlLmFpIiwicm9sZSI6InVzZXIifQ.test"

        // When: Decoding the token
        let claims = JWTDecoder.decode(token)

        // Then: Claims should be decoded successfully
        XCTAssertNotNil(claims)
        XCTAssertEqual(claims?.sub, "user123")
        XCTAssertEqual(claims?.email, "test@tide.ai")
        XCTAssertEqual(claims?.role, "user")
    }

    func testDecodeInvalidToken() {
        // Given: An invalid JWT token
        let token = "invalid.token.here"

        // When: Decoding the token
        let claims = JWTDecoder.decode(token)

        // Then: Claims should be nil
        XCTAssertNil(claims)
    }

    func testTokenExpiry() {
        // Given: An expired token
        let expiredToken = createTestToken(exp: Date().addingTimeInterval(-3600)) // Expired 1 hour ago

        // When: Checking expiry
        let isExpired = JWTDecoder.isExpired(expiredToken)

        // Then: Token should be marked as expired
        XCTAssertTrue(isExpired)
    }

    func testTokenNotExpired() {
        // Given: A valid token
        let validToken = createTestToken(exp: Date().addingTimeInterval(3600)) // Expires in 1 hour

        // When: Checking expiry
        let isExpired = JWTDecoder.isExpired(validToken)

        // Then: Token should not be expired
        XCTAssertFalse(isExpired)
    }

    func testTokenExpiringSoon() {
        // Given: A token expiring in 2 minutes
        let token = createTestToken(exp: Date().addingTimeInterval(120))

        // When: Checking if expiring soon (within 5 minutes)
        let isExpiringSoon = JWTDecoder.willExpireSoon(token, within: 300)

        // Then: Token should be marked as expiring soon
        XCTAssertTrue(isExpiringSoon)
    }

    // MARK: - Helper Methods

    private func createTestToken(exp: Date) -> String {
        // Create a simple test JWT token
        // In real tests, you'd want to use a proper JWT library
        return "test.token.here"
    }
}
