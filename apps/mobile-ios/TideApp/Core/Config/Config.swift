/**
 * App Configuration
 * Central configuration management with safe defaults
 */

import Foundation

struct Config {
    // MARK: - Environment
    
    enum Environment {
        case development
        case staging
        case production
        
        static var current: Environment {
            #if DEBUG
            return .development
            #else
            return .production
            #endif
        }
        
        var name: String {
            switch self {
            case .development: return "Development"
            case .staging: return "Staging"
            case .production: return "Production"
            }
        }
    }
    
    // MARK: - Supabase
    
    static var supabaseURL: String {
        if let url = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String, !url.isEmpty {
            return url
        }
        // Safe default for development
        return "https://ozrocykjomgcuphicqpg.supabase.co"
    }
    
    static var supabaseAnonKey: String {
        if let key = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String, !key.isEmpty {
            return key
        }
        // Return empty string - will be caught by validation
        return ""
    }
    
    static func validateSupabaseConfig() throws {
        // Validate URL format
        guard let _ = URL(string: supabaseURL), !supabaseURL.isEmpty else {
            throw ConfigurationError.invalidSupabaseURL(supabaseURL)
        }
        
        // Validate key exists
        guard !supabaseAnonKey.isEmpty else {
            throw ConfigurationError.invalidSupabaseKey
        }
    }
    
    // MARK: - API Configuration
    
    static var apiBaseURL: String {
        switch Environment.current {
        case .development:
            // Use localhost for local development
            return "http://localhost:3002"
        case .staging:
            return "https://gateway-staging.tide.ai"
        case .production:
            return "https://gateway.tide.ai"
        }
    }
    
    static func validateAPIConfig() throws {
        guard let _ = URL(string: apiBaseURL), !apiBaseURL.isEmpty else {
            throw ConfigurationError.missingAPIEndpoint
        }
    }
    
    // MARK: - Google OAuth
    
    static var googleClientID: String {
        if let clientID = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_CLIENT_ID") as? String, !clientID.isEmpty {
            return clientID
        }
        return ""
    }
    
    static func validateGoogleOAuth() throws {
        guard !googleClientID.isEmpty else {
            throw ConfigurationError.missingGoogleClientID
        }
    }
    
    // MARK: - Feature Flags
    
    struct FeatureFlags {
        static var enableOfflineMode: Bool {
            #if DEBUG
            return true
            #else
            return true
            #endif
        }
        
        static var enableAnalytics: Bool {
            Environment.current == .production
        }
        
        static var enableDetailedLogging: Bool {
            Environment.current == .development
        }
        
        static var enableCrashReporting: Bool {
            Environment.current == .production
        }
    }
    
    // MARK: - App Info
    
    static var appVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "Unknown"
    }
    
    static var buildNumber: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "Unknown"
    }
    
    static var appName: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? "Tide"
    }
    
    static var fullVersion: String {
        "\(appVersion) (\(buildNumber))"
    }
    
    // MARK: - Network Configuration
    
    struct Network {
        static let requestTimeout: TimeInterval = 30
        static let resourceTimeout: TimeInterval = 60
        static let maxRetryAttempts = 3
        static let retryDelay: TimeInterval = 1.0
    }
    
    // MARK: - Cache Configuration
    
    struct Cache {
        static let maxAge: TimeInterval = 3600 // 1 hour
        static let maxMemorySize = 50 * 1024 * 1024 // 50 MB
        static let maxDiskSize = 100 * 1024 * 1024 // 100 MB
    }
    
    // MARK: - Validation
    
    /// Validate all required configuration
    static func validateConfiguration() throws {
        try validateSupabaseConfig()
        try validateAPIConfig()
        // Google OAuth is optional for development
        if Environment.current != .development {
            try validateGoogleOAuth()
        }
    }
    
    // MARK: - Debug Info
    
    static func printConfiguration() {
        #if DEBUG
        Logger.info("=== Tide Configuration ===")
        Logger.info("Environment: \(Environment.current.name)")
        Logger.info("App Version: \(fullVersion)")
        Logger.info("Supabase URL: \(supabaseURL)")
        Logger.info("API Base URL: \(apiBaseURL)")
        Logger.info("Google OAuth: \(googleClientID.isEmpty ? "Not configured" : "Configured")")
        Logger.info("Offline Mode: \(FeatureFlags.enableOfflineMode)")
        Logger.info("Analytics: \(FeatureFlags.enableAnalytics)")
        Logger.info("=========================")
        #endif
    }
}

// MARK: - Environment Values

extension Config {
    /// Check if running in debug mode
    static var isDebug: Bool {
        Environment.current == .development
    }
    
    /// Check if running in production
    static var isProduction: Bool {
        Environment.current == .production
    }
    
    /// Check if running on simulator
    static var isSimulator: Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }
}
