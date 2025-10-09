/**
 * Keychain Manager Protocol
 * Defines the interface for secure storage of sensitive data
 * Allows for dependency injection and testability
 */

import Foundation

protocol KeychainManagerProtocol {
    // MARK: - String Storage
    func save(_ value: String, for key: KeychainManager.Key) throws
    func retrieve(for key: KeychainManager.Key) throws -> String

    // MARK: - Codable Storage
    func save<T: Codable>(_ value: T, for key: KeychainManager.Key) throws
    func retrieve<T: Codable>(for key: KeychainManager.Key, as type: T.Type) throws -> T

    // MARK: - Delete
    func delete(for key: KeychainManager.Key) throws
    func clearAll() throws

    // MARK: - Check Existence
    func exists(for key: KeychainManager.Key) -> Bool

    // MARK: - Convenience Properties
    var accessToken: String? { get set }
    var refreshToken: String? { get set }
    var userID: String? { get set }

    // MARK: - Session Management
    func clearSession()
}

// Make KeychainManager conform to the protocol
extension KeychainManager: KeychainManagerProtocol {}
