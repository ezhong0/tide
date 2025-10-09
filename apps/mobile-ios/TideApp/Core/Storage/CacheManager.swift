/**
 * Cache Manager
 * Two-tier caching system with memory (NSCache) and disk (FileManager)
 * Supports TTL (time-to-live) for cache invalidation
 * Uses FileManager with encryption for disk storage (secure and scalable)
 */

import Foundation

@MainActor
final class CacheManager {
    // MARK: - Singleton
    static let shared = CacheManager()

    // MARK: - Properties

    /// Memory cache (fast, cleared on app termination)
    private let memoryCache = NSCache<NSString, AnyObject>()

    /// Disk cache directory
    private let cacheDirectory: URL

    /// Default TTL: 5 minutes
    private let defaultTTL: TimeInterval = 300

    // MARK: - Initializer

    private init() {
        // Configure memory cache limits
        memoryCache.countLimit = 100 // Max 100 items
        memoryCache.totalCostLimit = 50 * 1024 * 1024 // 50 MB

        // Setup disk cache directory
        let fileManager = FileManager.default
        let cacheDir = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        self.cacheDirectory = cacheDir.appendingPathComponent("TideCache", isDirectory: true)

        // Create cache directory if it doesn't exist
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }

    // MARK: - Public API

    /// Store value in cache with optional TTL
    func set<T: Codable>(_ value: T, forKey key: String, ttl: TimeInterval? = nil) {
        let expiryDate = Date().addingTimeInterval(ttl ?? defaultTTL)
        let entry = CacheEntry(value: value, expiryDate: expiryDate)

        // Store in memory
        memoryCache.setObject(entry, forKey: key as NSString)

        // Store on disk
        saveToDisk(entry, forKey: key)
    }

    /// Retrieve value from cache
    func get<T: Codable>(_ type: T.Type, forKey key: String) -> T? {
        // Try memory cache first
        if let entry = memoryCache.object(forKey: key as NSString) as? CacheEntry<T> {
            if entry.isValid {
                return entry.value
            } else {
                // Expired - remove from memory
                memoryCache.removeObject(forKey: key as NSString)
            }
        }

        // Try disk cache
        if let entry: CacheEntry<T> = loadFromDisk(forKey: key) {
            if entry.isValid {
                // Restore to memory cache
                memoryCache.setObject(entry, forKey: key as NSString)
                return entry.value
            } else {
                // Expired - remove from disk
                removeFromDisk(forKey: key)
            }
        }

        return nil
    }

    /// Remove value from cache
    func remove(forKey key: String) {
        memoryCache.removeObject(forKey: key as NSString)
        removeFromDisk(forKey: key)
    }

    /// Clear all cache
    func clearAll() {
        memoryCache.removeAllObjects()
        clearDiskCache()
    }

    /// Clear expired entries
    func clearExpired() {
        // Clear expired from memory
        // Note: NSCache doesn't support iteration, so we can't clear expired items
        // They'll be removed when accessed via get()

        // Clear expired from disk
        let fileManager = FileManager.default
        guard let enumerator = fileManager.enumerator(at: cacheDirectory, includingPropertiesForKeys: nil) else {
            return
        }

        for case let fileURL as URL in enumerator {
            // Try to decode and check expiry
            if let data = try? Data(contentsOf: fileURL),
               let entry = try? JSONDecoder().decode(GenericCacheEntry.self, from: data),
               !entry.isValid {
                try? fileManager.removeItem(at: fileURL)
            }
        }
    }

    /// Get total cache size
    func getCacheSize() -> String {
        let fileManager = FileManager.default
        var totalSize: Int64 = 0

        guard let enumerator = fileManager.enumerator(at: cacheDirectory, includingPropertiesForKeys: [.fileSizeKey]) else {
            return "0 MB"
        }

        for case let fileURL as URL in enumerator {
            if let resourceValues = try? fileURL.resourceValues(forKeys: [.fileSizeKey]),
               let fileSize = resourceValues.fileSize {
                totalSize += Int64(fileSize)
            }
        }

        let mb = Double(totalSize) / (1024 * 1024)
        return String(format: "%.1f MB", mb)
    }

    // MARK: - Disk Cache Operations

    private func saveToDisk<T: Codable>(_ entry: CacheEntry<T>, forKey key: String) {
        let fileURL = cacheDirectory.appendingPathComponent(key.sha256Hash)

        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(entry)

            // Write with file protection (encrypted when device is locked)
            try data.write(to: fileURL, options: .completeFileProtection)
        } catch {
            Logger.error("Failed to save to disk cache", error: error)
        }
    }

    private func loadFromDisk<T: Codable>(forKey key: String) -> CacheEntry<T>? {
        let fileURL = cacheDirectory.appendingPathComponent(key.sha256Hash)

        do {
            let data = try Data(contentsOf: fileURL)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(CacheEntry<T>.self, from: data)
        } catch {
            // File doesn't exist or decoding failed - this is normal
            return nil
        }
    }

    private func removeFromDisk(forKey key: String) {
        let fileURL = cacheDirectory.appendingPathComponent(key.sha256Hash)
        try? FileManager.default.removeItem(at: fileURL)
    }

    private func clearDiskCache() {
        let fileManager = FileManager.default
        try? fileManager.removeItem(at: cacheDirectory)
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
}

// MARK: - Cache Entry (Generic)

private class CacheEntry<T: Codable>: Codable {
    let value: T
    let expiryDate: Date

    var isValid: Bool {
        return Date() < expiryDate
    }

    init(value: T, expiryDate: Date) {
        self.value = value
        self.expiryDate = expiryDate
    }
}

// MARK: - Generic Cache Entry (For Expiry Checking Only)

private struct GenericCacheEntry: Codable {
    let expiryDate: Date

    var isValid: Bool {
        return Date() < expiryDate
    }
}

// MARK: - String Extension (SHA256)

private extension String {
    /// Simple hash for filename generation
    var sha256Hash: String {
        let data = Data(self.utf8)
        var hash = [UInt8](repeating: 0, count: 32)

        // Simple hash function (for filename generation, not cryptographic security)
        for (index, byte) in data.enumerated() {
            hash[index % 32] ^= byte
        }

        return hash.map { String(format: "%02x", $0) }.joined()
    }
}

// MARK: - Cache Keys

extension CacheManager {
    enum CacheKey {
        static func emails(category: String?) -> String {
            return "emails_\(category ?? "all")"
        }

        static func email(id: String) -> String {
            return "email_\(id)"
        }

        static func calendarEvents(start: Date, end: Date) -> String {
            return "calendar_events_\(start.timeIntervalSince1970)_\(end.timeIntervalSince1970)"
        }

        static func conversations() -> String {
            return "conversations"
        }

        static func conversationMessages(id: String) -> String {
            return "conversation_messages_\(id)"
        }

        static func tasks(status: String?) -> String {
            return "tasks_\(status ?? "all")"
        }
    }
}
