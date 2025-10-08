/**
 * JWT Decoder
 * Decodes and validates JSON Web Tokens
 */

import Foundation

struct JWTDecoder {
    // MARK: - JWT Claims

    struct JWTClaims: Codable {
        let sub: String?        // Subject (user ID)
        let exp: TimeInterval?  // Expiration time
        let iat: TimeInterval?  // Issued at
        let email: String?
        let role: String?
    }

    // MARK: - Decode JWT

    static func decode(_ token: String) -> JWTClaims? {
        let segments = token.components(separatedBy: ".")
        guard segments.count == 3 else {
            return nil
        }

        // Decode payload (second segment)
        guard let payloadData = base64UrlDecode(segments[1]) else {
            return nil
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(JWTClaims.self, from: payloadData)
        } catch {
            print("❌ Failed to decode JWT claims: \(error.localizedDescription)")
            return nil
        }
    }

    // MARK: - Token Validation

    static func isExpired(_ token: String) -> Bool {
        guard let claims = decode(token),
              let exp = claims.exp else {
            return true // If we can't decode, consider it expired
        }

        let expirationDate = Date(timeIntervalSince1970: exp)
        return Date() >= expirationDate
    }

    static func willExpireSoon(_ token: String, within seconds: TimeInterval = 300) -> Bool {
        guard let claims = decode(token),
              let exp = claims.exp else {
            return true
        }

        let expirationDate = Date(timeIntervalSince1970: exp)
        let thresholdDate = Date().addingTimeInterval(seconds)
        return thresholdDate >= expirationDate
    }

    static func getUserId(from token: String) -> String? {
        return decode(token)?.sub
    }

    // MARK: - Base64 URL Decoding

    private static func base64UrlDecode(_ value: String) -> Data? {
        var base64 = value
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")

        // Add padding if needed
        let length = base64.count
        if length % 4 != 0 {
            base64 += String(repeating: "=", count: 4 - length % 4)
        }

        return Data(base64Encoded: base64)
    }
}
