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

    // MARK: - API Configuration

    /// API Gateway base URL
    static let apiBaseURL = ProcessInfo.processInfo.environment["API_BASE_URL"]
        ?? "https://gateway-production-caf0.up.railway.app"

    // MARK: - OAuth Configuration

    /// Google iOS Client ID for OAuth
    /// Get this from Google Cloud Console OAuth 2.0 Client IDs
    static let googleIOSClientId = ProcessInfo.processInfo.environment["GOOGLE_IOS_CLIENT_ID"]
        ?? "526055709746-golq3n9mgv1oh55sgim0s5qrqcped8j6.apps.googleusercontent.com"

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
