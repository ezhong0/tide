import Foundation
import Security

class KeychainService {
    static let shared = KeychainService()

    private let service = "ai.tide.app"
    private let accessTokenKey = "accessToken"
    private let refreshTokenKey = "refreshToken"

    // MARK: - Save Tokens

    func saveTokens(accessToken: String, refreshToken: String) throws {
        try saveAccessToken(accessToken)
        try saveRefreshToken(refreshToken)
    }

    func saveAccessToken(_ token: String) throws {
        try save(key: accessTokenKey, value: token)
    }

    func saveRefreshToken(_ token: String) throws {
        try save(key: refreshTokenKey, value: token)
    }

    // MARK: - Get Tokens

    func getAccessToken() -> String? {
        return get(key: accessTokenKey)
    }

    func getRefreshToken() -> String? {
        return get(key: refreshTokenKey)
    }

    // MARK: - Delete Tokens

    func deleteTokens() {
        delete(key: accessTokenKey)
        delete(key: refreshTokenKey)
    }

    // MARK: - Private Keychain Operations

    private func save(key: String, value: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw KeychainError.encodingError
        }

        // Delete existing item first
        delete(key: key)

        // Add new item
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    private func get(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }

        return value
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - Keychain Errors
enum KeychainError: Error {
    case encodingError
    case saveFailed(OSStatus)
    case loadFailed(OSStatus)
    case deleteFailed(OSStatus)
}
