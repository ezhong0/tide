/**
 * Offline Queue
 * Queues write operations when offline and syncs when online
 */

import Foundation

@MainActor
class OfflineQueue {
    // MARK: - Singleton
    static let shared = OfflineQueue()

    // MARK: - Properties

    private var queue: [QueuedOperation] = []
    private let queueKey = "TideOfflineQueue"
    private let networkMonitor = NetworkMonitor.shared

    // MARK: - Initializer

    private init() {
        loadQueue()
        observeNetworkChanges()
    }

    // MARK: - Public API

    /// Add operation to queue
    func enqueue(_ operation: QueuedOperation) {
        queue.append(operation)
        saveQueue()

        // Try to sync immediately if online
        if networkMonitor.isConnected {
            Task {
                await syncQueue()
            }
        }
    }

    /// Manually trigger sync
    func syncQueue() async {
        guard networkMonitor.isConnected else {
            print("⚠️ Cannot sync: Offline")
            return
        }

        guard !queue.isEmpty else {
            print("✅ Queue is empty, nothing to sync")
            return
        }

        print("🔄 Syncing \(queue.count) queued operations...")

        var failedOperations: [QueuedOperation] = []

        for operation in queue {
            do {
                try await executeOperation(operation)
                print("✅ Synced operation: \(operation.type)")
            } catch {
                print("❌ Failed to sync operation: \(error.localizedDescription)")
                failedOperations.append(operation)
            }
        }

        // Keep only failed operations in queue
        queue = failedOperations
        saveQueue()

        if queue.isEmpty {
            print("✅ All operations synced successfully")
        } else {
            print("⚠️ \(queue.count) operations failed to sync, will retry later")
        }
    }

    /// Clear all queued operations
    func clearQueue() {
        queue.removeAll()
        saveQueue()
    }

    // MARK: - Private Methods

    private func executeOperation(_ operation: QueuedOperation) async throws {
        // TODO: Execute the actual API call based on operation type
        // This will be implemented when integrating with repositories
        print("Executing operation: \(operation.type)")

        // For now, we'll just simulate success
        try await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
    }

    private func observeNetworkChanges() {
        // When network becomes available, sync queue
        Task {
            for await _ in NotificationCenter.default.notifications(named: .networkDidBecomeReachable) {
                await syncQueue()
            }
        }
    }

    // MARK: - Persistence

    private func saveQueue() {
        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(queue)
            UserDefaults.standard.set(data, forKey: queueKey)
        } catch {
            print("❌ Failed to save queue: \(error.localizedDescription)")
        }
    }

    private func loadQueue() {
        guard let data = UserDefaults.standard.data(forKey: queueKey) else {
            return
        }

        do {
            let decoder = JSONDecoder()
            queue = try decoder.decode([QueuedOperation].self, from: data)
            print("📥 Loaded \(queue.count) queued operations")
        } catch {
            print("❌ Failed to load queue: \(error.localizedDescription)")
        }
    }
}

// MARK: - Queued Operation

struct QueuedOperation: Codable, Identifiable {
    let id: String
    let type: OperationType
    let data: [String: String] // Simplified - could use AnyCodable for complex data
    let timestamp: Date

    init(type: OperationType, data: [String: String] = [:]) {
        self.id = UUID().uuidString
        self.type = type
        self.data = data
        self.timestamp = Date()
    }

    enum OperationType: String, Codable {
        case sendEmail
        case createEvent
        case updateEvent
        case deleteEvent
        case createTask
        case updateTask
        case updateTaskStatus
        case deleteTask
        case sendMessage
    }
}

// MARK: - Notifications

extension Notification.Name {
    static let networkDidBecomeReachable = Notification.Name("networkDidBecomeReachable")
}
