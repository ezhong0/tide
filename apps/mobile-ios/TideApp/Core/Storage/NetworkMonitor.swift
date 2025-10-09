/**
 * Network Monitor
 * Monitors network connectivity status
 */

import Foundation
import Network

@MainActor
final class NetworkMonitor: ObservableObject {
    // MARK: - Singleton
    static let shared = NetworkMonitor()

    // MARK: - Published Properties
    @Published var isConnected = true
    @Published var connectionType: ConnectionType = .wifi

    // MARK: - Private Properties
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")

    // MARK: - Initializer

    private init() {
        startMonitoring()
    }

    // MARK: - Monitoring

    func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = path.status == .satisfied
                self?.updateConnectionType(path)
            }
        }

        monitor.start(queue: queue)
    }

    func stopMonitoring() {
        monitor.cancel()
    }

    private func updateConnectionType(_ path: NWPath) {
        if path.usesInterfaceType(.wifi) {
            connectionType = .wifi
        } else if path.usesInterfaceType(.cellular) {
            connectionType = .cellular
        } else if path.usesInterfaceType(.wiredEthernet) {
            connectionType = .ethernet
        } else {
            connectionType = .unknown
        }
    }

    // MARK: - Connection Type

    enum ConnectionType {
        case wifi
        case cellular
        case ethernet
        case unknown

        var description: String {
            switch self {
            case .wifi: return "Wi-Fi"
            case .cellular: return "Cellular"
            case .ethernet: return "Ethernet"
            case .unknown: return "Unknown"
            }
        }
    }
}
