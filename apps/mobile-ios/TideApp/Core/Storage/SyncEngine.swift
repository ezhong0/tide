/**
 * Sync Engine
 * Handles bi-directional synchronization between local cache and server
 * Implements conflict resolution using last-write-wins strategy
 */

import Foundation

@MainActor
class SyncEngine {
    // MARK: - Singleton
    static let shared = SyncEngine()

    // MARK: - Properties

    private let cacheManager = CacheManager.shared
    private let offlineQueue = OfflineQueue.shared
    private let networkMonitor = NetworkMonitor.shared

    private var isSyncing = false
    private var lastSyncDate: Date?

    // MARK: - Initializer

    private init() {
        observeNetworkChanges()
    }

    // MARK: - Public API

    /// Perform full sync
    func sync() async {
        guard networkMonitor.isConnected else {
            print("⚠️ Cannot sync: Offline")
            return
        }

        guard !isSyncing else {
            print("⚠️ Sync already in progress")
            return
        }

        isSyncing = true
        defer { isSyncing = false }

        print("🔄 Starting full sync...")

        // 1. Sync offline queue (push local changes)
        await offlineQueue.syncQueue()

        // 2. Pull latest data from server
        await pullLatestData()

        // 3. Update last sync date
        lastSyncDate = Date()

        print("✅ Sync completed successfully")
    }

    /// Sync specific entity type
    func syncEntity(_ entityType: EntityType) async {
        guard networkMonitor.isConnected else {
            return
        }

        print("🔄 Syncing \(entityType.rawValue)...")

        // TODO: Implement entity-specific sync logic
        // For now, just clear cache to force refresh
        switch entityType {
        case .emails:
            cacheManager.remove(forKey: CacheManager.CacheKey.emails(category: nil))
        case .events:
            // Clear all calendar caches
            break
        case .tasks:
            cacheManager.remove(forKey: CacheManager.CacheKey.tasks(status: nil))
        case .conversations:
            cacheManager.remove(forKey: CacheManager.CacheKey.conversations())
        }
    }

    /// Check if sync is needed
    func needsSync() -> Bool {
        guard let lastSync = lastSyncDate else {
            return true // Never synced
        }

        // Sync if more than 5 minutes since last sync
        let syncInterval: TimeInterval = 300 // 5 minutes
        return Date().timeIntervalSince(lastSync) > syncInterval
    }

    // MARK: - Conflict Resolution

    /// Resolve conflict using last-write-wins strategy
    func resolveConflict<T>(local: T, remote: T, localTimestamp: Date, remoteTimestamp: Date) -> T {
        // Last-write-wins: Choose the more recent version
        return remoteTimestamp > localTimestamp ? remote : local
    }

    // MARK: - Private Methods

    private func pullLatestData() async {
        // TODO: Implement pulling latest data from server
        // This would typically involve:
        // 1. Get last sync timestamp
        // 2. Request changes since timestamp
        // 3. Update local cache with changes
        // 4. Resolve conflicts if any

        print("📥 Pulling latest data from server...")

        // For now, just clear expired cache entries
        cacheManager.clearExpired()
    }

    private func observeNetworkChanges() {
        Task {
            for await _ in NotificationCenter.default.notifications(named: .networkDidBecomeReachable) {
                // Auto-sync when network becomes available
                if needsSync() {
                    await sync()
                }
            }
        }
    }

    // MARK: - Entity Type

    enum EntityType: String {
        case emails
        case events
        case tasks
        case conversations
    }
}
