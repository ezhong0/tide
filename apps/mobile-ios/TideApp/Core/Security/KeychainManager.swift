/**
 * Keychain Manager
 * Secure storage for sensitive data (tokens, credentials)
 * Eliminates architectural debt around token storage
 */

import Foundation
import Security

enum KeychainError: Error, LocalizedError {
    case itemNotFound
    case duplicateItem
    case invalidData
    case unexpectedStatus(OSStatus)
    case unableToEncode
    case unableToDecode

    var errorDescription: String? {
        switch self {
        case .itemNotFound:
            return "Item not found in keychain"
        case .duplicateItem:
            return "Item already exists in keychain"
        case .invalidData:
            return "Invalid data format"
        case .unexpectedStatus(let status):
            return "Unexpected keychain status: \(status)"
        case .unableToEncode:
            return "Unable to encode data"
        case .unableToDecode:
            return "Unable to decode data"
        }
    }
}

final class KeychainManager {

    // MARK: - Singleton

    static let shared = KeychainManager()

    private init() {}

    // MARK: - Service Identifier

    private let service = Bundle.main.bundleIdentifier ?? "ai.tide.app"

    // MARK: - Keys

    enum Key: String {
        case accessToken = "accessToken"
        case refreshToken = "refreshToken"
        case userID = "userID"
        case googleAccessToken = "googleAccessToken"
        case googleRefreshToken = "googleRefreshToken"
    }

    // MARK: - Save

    func save(_ value: String, for key: Key) throws {
        guard let data = value.data(using: .utf8) else {
            throw KeychainError.unableToEncode
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        // Delete existing item if it exists
        SecItemDelete(query as CFDictionary)

        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            Logger.error("Keychain save failed for \(key.rawValue): \(status)")
            throw KeychainError.unexpectedStatus(status)
        }

        Logger.debug("Successfully saved \(key.rawValue) to keychain")
    }

    func save<T: Codable>(_ value: T, for key: Key) throws {
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(value) else {
            throw KeychainError.unableToEncode
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        // Delete existing item if it exists
        SecItemDelete(query as CFDictionary)

        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.unexpectedStatus(status)
        }
    }

    // MARK: - Retrieve

    func retrieve(for key: Key) throws -> String {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw KeychainError.itemNotFound
            }
            throw KeychainError.unexpectedStatus(status)
        }

        guard let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            throw KeychainError.invalidData
        }

        return value
    }

    func retrieve<T: Codable>(for key: Key, as type: T.Type) throws -> T {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw KeychainError.itemNotFound
            }
            throw KeychainError.unexpectedStatus(status)
        }

        guard let data = result as? Data else {
            throw KeychainError.invalidData
        }

        let decoder = JSONDecoder()
        guard let value = try? decoder.decode(type, from: data) else {
            throw KeychainError.unableToDecode
        }

        return value
    }

    // MARK: - Delete

    func delete(for key: Key) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue
        ]

        let status = SecItemDelete(query as CFDictionary)

        guard status == errSecSuccess || status == errSecItemNotFound else {
            Logger.error("Keychain delete failed for \(key.rawValue): \(status)")
            throw KeychainError.unexpectedStatus(status)
        }

        Logger.debug("Successfully deleted \(key.rawValue) from keychain")
    }

    // MARK: - Clear All

    func clearAll() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service
        ]

        let status = SecItemDelete(query as CFDictionary)

        guard status == errSecSuccess || status == errSecItemNotFound else {
            Logger.error("Keychain clear all failed: \(status)")
            throw KeychainError.unexpectedStatus(status)
        }

        Logger.info("Successfully cleared all items from keychain")
    }

    // MARK: - Exists

    func exists(for key: Key) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String: false
        ]

        let status = SecItemCopyMatching(query as CFDictionary, nil)
        return status == errSecSuccess
    }
}

// MARK: - Token Storage Extension

extension KeychainManager {

    // MARK: - Access Token

    var accessToken: String? {
        get {
            try? retrieve(for: .accessToken)
        }
        set {
            if let value = newValue {
                try? save(value, for: .accessToken)
            } else {
                try? delete(for: .accessToken)
            }
        }
    }

    // MARK: - Refresh Token

    var refreshToken: String? {
        get {
            try? retrieve(for: .refreshToken)
        }
        set {
            if let value = newValue {
                try? save(value, for: .refreshToken)
            } else {
                try? delete(for: .refreshToken)
            }
        }
    }

    // MARK: - User ID

    var userID: String? {
        get {
            try? retrieve(for: .userID)
        }
        set {
            if let value = newValue {
                try? save(value, for: .userID)
            } else {
                try? delete(for: .userID)
            }
        }
    }

    // MARK: - Clear Session

    func clearSession() {
        accessToken = nil
        refreshToken = nil
        userID = nil
        Logger.authEvent("Session cleared from keychain")
    }
}
