import Foundation

/// Tide App Configuration
/// Centralized configuration for API endpoints and credentials
enum Config {
    // MARK: - Supabase Configuration

    /// Supabase project URL
    static let supabaseURL = ProcessInfo.processInfo.environment["SUPABASE_URL"]
        ?? "https://ozrocykjomgcuphicqpg.supabase.co"

    /// Supabase anon/public key (safe for client-side use)
    static let supabaseAnonKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"]
        ?? "YOUR_ANON_KEY_HERE" // Replace with actual key from Supabase dashboard

    // MARK: - App Configuration

    /// App version
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"

    /// Build number
    static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"

    /// Environment
    enum Environment: String {
        case development
        case staging
        case production
    }

    static let environment: Environment = {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }()

    // MARK: - Feature Flags

    static let enableLogging = environment == .development
    static let enableAnalytics = environment == .production
}
