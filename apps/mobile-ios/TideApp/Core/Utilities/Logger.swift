/**
 * Logger
 * Centralized logging system for debugging and monitoring
 * Elegant approach to observability without cluttering code
 */

import Foundation
import OSLog

enum Logger {

    // MARK: - Log Levels

    enum Level: String {
        case debug = "🔍 DEBUG"
        case info = "ℹ️  INFO"
        case warning = "⚠️  WARNING"
        case error = "❌ ERROR"
        case network = "🌐 NETWORK"
        case auth = "🔐 AUTH"
        case data = "📊 DATA"
    }

    // MARK: - Subsystems

    private static let subsystem = Bundle.main.bundleIdentifier ?? "ai.tide.app"

    private enum Category: String {
        case network = "Network"
        case auth = "Authentication"
        case data = "Data"
        case ui = "UI"
        case general = "General"
    }

    // MARK: - OS Loggers

    private static let networkLogger = os.Logger(subsystem: subsystem, category: Category.network.rawValue)
    private static let authLogger = os.Logger(subsystem: subsystem, category: Category.auth.rawValue)
    private static let dataLogger = os.Logger(subsystem: subsystem, category: Category.data.rawValue)
    private static let uiLogger = os.Logger(subsystem: subsystem, category: Category.ui.rawValue)
    private static let generalLogger = os.Logger(subsystem: subsystem, category: Category.general.rawValue)

    // MARK: - General Logging

    static func debug(_ message: String, file: String = #file, function: String = #function, line: Int = #line) {
        #if DEBUG
        let fileName = (file as NSString).lastPathComponent
        print("\(Level.debug.rawValue) [\(fileName):\(line)] \(function) - \(message)")
        generalLogger.debug("\(message, privacy: .public)")
        #endif
    }

    static func info(_ message: String, file: String = #file, function: String = #function) {
        let fileName = (file as NSString).lastPathComponent
        print("\(Level.info.rawValue) [\(fileName)] \(function) - \(message)")
        generalLogger.info("\(message, privacy: .public)")
    }

    static func warning(_ message: String, file: String = #file, function: String = #function, line: Int = #line) {
        let fileName = (file as NSString).lastPathComponent
        print("\(Level.warning.rawValue) [\(fileName):\(line)] \(function) - \(message)")
        generalLogger.warning("\(message, privacy: .public)")
    }

    static func error(_ message: String, error: Error? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        let fileName = (file as NSString).lastPathComponent
        var fullMessage = "\(Level.error.rawValue) [\(fileName):\(line)] \(function) - \(message)"
        if let error = error {
            fullMessage += " | Error: \(error.localizedDescription)"
        }
        print(fullMessage)
        generalLogger.error("\(fullMessage, privacy: .public)")
    }

    // MARK: - Network Logging

    static func networkRequest(
        method: String,
        url: String,
        headers: [String: String]? = nil,
        body: Data? = nil
    ) {
        #if DEBUG
        var message = "\(Level.network.rawValue) REQUEST: \(method) \(url)"
        if let headers = headers {
            message += "\n  Headers: \(headers)"
        }
        if let body = body, let bodyString = String(data: body, encoding: .utf8) {
            message += "\n  Body: \(bodyString)"
        }
        print(message)
        networkLogger.info("REQUEST: \(method, privacy: .public) \(url, privacy: .public)")
        #endif
    }

    static func networkResponse(
        url: String,
        statusCode: Int,
        data: Data? = nil,
        error: Error? = nil
    ) {
        #if DEBUG
        var message = "\(Level.network.rawValue) RESPONSE: \(statusCode) \(url)"
        if let data = data, let bodyString = String(data: data, encoding: .utf8) {
            message += "\n  Response: \(bodyString.prefix(500))" // Limit to 500 chars
        }
        if let error = error {
            message += "\n  Error: \(error.localizedDescription)"
        }
        print(message)

        if statusCode >= 400 {
            networkLogger.error("RESPONSE: \(statusCode, privacy: .public) \(url, privacy: .public)")
        } else {
            networkLogger.info("RESPONSE: \(statusCode, privacy: .public) \(url, privacy: .public)")
        }
        #endif
    }

    // MARK: - Auth Logging

    static func authEvent(_ message: String) {
        print("\(Level.auth.rawValue) \(message)")
        authLogger.info("\(message, privacy: .public)")
    }

    static func authError(_ message: String, error: Error? = nil) {
        var fullMessage = "\(Level.auth.rawValue) \(message)"
        if let error = error {
            fullMessage += " | Error: \(error.localizedDescription)"
        }
        print(fullMessage)
        authLogger.error("\(fullMessage, privacy: .public)")
    }

    // MARK: - Data Logging

    static func dataOperation(_ operation: String, entity: String, success: Bool, details: String? = nil) {
        var message = "\(Level.data.rawValue) \(operation) \(entity): \(success ? "✅" : "❌")"
        if let details = details {
            message += " - \(details)"
        }
        print(message)

        if success {
            dataLogger.info("\(operation, privacy: .public) \(entity, privacy: .public) succeeded")
        } else {
            dataLogger.error("\(operation, privacy: .public) \(entity, privacy: .public) failed")
        }
    }

    // MARK: - UI Logging

    static func uiEvent(_ event: String, screen: String) {
        #if DEBUG
        print("🎨 UI: \(event) on \(screen)")
        uiLogger.debug("\(event, privacy: .public) on \(screen, privacy: .public)")
        #endif
    }

    // MARK: - Performance Logging

    static func measureTime<T>(_ operation: String, _ block: () throws -> T) rethrows -> T {
        let start = CFAbsoluteTimeGetCurrent()
        let result = try block()
        let duration = (CFAbsoluteTimeGetCurrent() - start) * 1000 // Convert to ms
        debug("⏱️ \(operation) took \(String(format: "%.2f", duration))ms")
        return result
    }

    static func measureTimeAsync<T>(_ operation: String, _ block: () async throws -> T) async rethrows -> T {
        let start = CFAbsoluteTimeGetCurrent()
        let result = try await block()
        let duration = (CFAbsoluteTimeGetCurrent() - start) * 1000 // Convert to ms
        debug("⏱️ \(operation) took \(String(format: "%.2f", duration))ms")
        return result
    }
}
