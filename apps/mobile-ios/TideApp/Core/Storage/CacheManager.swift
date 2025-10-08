/**
 * Cache Manager
 * Two-tier caching system with memory (NSCache) and disk (UserDefaults)
 * Supports TTL (time-to-live) for cache invalidation
 */

import Foundation

@MainActor
class CacheManager {
    // MARK: - Singleton
    static let shared = CacheManager()

    // MARK: - Properties

    /// Memory cache (fast, cleared on app termination)
    private let memoryCache = NSCache<NSString, CacheEntry>()

    /// Disk cache key prefix
    private let diskCachePrefix = "TideCache_"

    /// Default TTL: 5 minutes
    private let defaultTTL: TimeInterval = 300

    // MARK: - Initializer

    private init() {
        // Configure memory cache limits
        memoryCache.countLimit = 100 // Max 100 items
        memoryCache.totalCostLimit = 50 * 1024 * 1024 // 50 MB
    }

    // MARK: - Public API

    /// Store value in cache with optional TTL
    func set<T: Codable>(_ value: T, forKey key: String, ttl: TimeInterval? = nil) {
        let expiryDate = Date().addingTimeInterval(ttl ?? defaultTTL)
        let entry = CacheEntry(value: value, expiryDate: expiryDate)

        // Store in memory
        memoryCache.setObject(entry, forKey: key as NSString)

        // Store in disk
        saveToDisk(entry, forKey: key)
    }

    /// Retrieve value from cache
    func get<T: Codable>(_ type: T.Type, forKey key: String) -> T? {
        // Try memory cache first
        if let entry = memoryCache.object(forKey: key as NSString) {
            if entry.isValid {
                return entry.value as? T
            } else {
                // Expired - remove from memory
                memoryCache.removeObject(forKey: key as NSString)
            }
        }

        // Try disk cache
        if let entry = loadFromDisk(forKey: key) {
            if entry.isValid {
                // Restore to memory cache
                memoryCache.setObject(entry, forKey: key as NSString)
                return entry.value as? T
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
        let keys = UserDefaults.standard.dictionaryRepresentation().keys
        for key in keys where key.hasPrefix(diskCachePrefix) {
            if let entry = loadFromDisk(forKey: String(key.dropFirst(diskCachePrefix.count))),
               !entry.isValid {
                UserDefaults.standard.removeObject(forKey: key)
            }
        }
    }

    // MARK: - Disk Cache Operations

    private func saveToDisk(_ entry: CacheEntry, forKey key: String) {
        let diskKey = diskCachePrefix + key

        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(entry)
            UserDefaults.standard.set(data, forKey: diskKey)
        } catch {
            print("❌ Failed to save to disk cache: \(error.localizedDescription)")
        }
    }

    private func loadFromDisk(forKey key: String) -> CacheEntry? {
        let diskKey = diskCachePrefix + key

        guard let data = UserDefaults.standard.data(forKey: diskKey) else {
            return nil
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(CacheEntry.self, from: data)
        } catch {
            print("❌ Failed to load from disk cache: \(error.localizedDescription)")
            return nil
        }
    }

    private func removeFromDisk(forKey key: String) {
        let diskKey = diskCachePrefix + key
        UserDefaults.standard.removeObject(forKey: diskKey)
    }

    private func clearDiskCache() {
        let keys = UserDefaults.standard.dictionaryRepresentation().keys
        for key in keys where key.hasPrefix(diskCachePrefix) {
            UserDefaults.standard.removeObject(forKey: key)
        }
    }
}

// MARK: - Cache Entry

private class CacheEntry: Codable {
    let value: Any
    let expiryDate: Date

    var isValid: Bool {
        return Date() < expiryDate
    }

    init(value: Any, expiryDate: Date) {
        self.value = value
        self.expiryDate = expiryDate
    }

    // MARK: - Codable

    enum CodingKeys: String, CodingKey {
        case value
        case expiryDate
    }

    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        expiryDate = try container.decode(Date.self, forKey: .expiryDate)

        // Decode value as Data
        let valueData = try container.decode(Data.self, forKey: .value)
        value = valueData
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(expiryDate, forKey: .expiryDate)

        // Encode value as Data if it's Codable
        if let codableValue = value as? Encodable {
            let jsonEncoder = JSONEncoder()
            let valueData = try jsonEncoder.encode(AnyEncodable(codableValue))
            try container.encode(valueData, forKey: .value)
        }
    }
}

// MARK: - Any Encodable Wrapper

private struct AnyEncodable: Encodable {
    let value: Encodable

    init(_ value: Encodable) {
        self.value = value
    }

    func encode(to encoder: Encoder) throws {
        try value.encode(to: encoder)
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
