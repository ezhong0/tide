/**
 * Configuration Error
 * Errors related to app configuration and initialization
 */

import Foundation

enum ConfigurationError: LocalizedError {
    case invalidSupabaseURL(String)
    case invalidSupabaseKey
    case missingGoogleClientID
    case missingAPIEndpoint
    case invalidEnvironment
    case networkUnavailable

    var errorDescription: String? {
        switch self {
        case .invalidSupabaseURL(let url):
            return "Invalid Supabase URL: \(url)"
        case .invalidSupabaseKey:
            return "Supabase API key is missing or invalid"
        case .missingGoogleClientID:
            return "Google OAuth is not configured properly"
        case .missingAPIEndpoint:
            return "API endpoint is not configured"
        case .invalidEnvironment:
            return "Invalid environment configuration"
        case .networkUnavailable:
            return "Network connection is unavailable"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .invalidSupabaseURL, .invalidSupabaseKey, .missingAPIEndpoint:
            return "Try reinstalling the app. If the problem persists, contact support@tide.ai"
        case .missingGoogleClientID:
            return "Please contact support@tide.ai for assistance."
        case .invalidEnvironment:
            return "This appears to be a development environment issue."
        case .networkUnavailable:
            return "Please check your internet connection and try again."
        }
    }

    var failureReason: String? {
        switch self {
        case .invalidSupabaseURL:
            return "The Supabase URL is not properly formatted"
        case .invalidSupabaseKey:
            return "The Supabase API key could not be loaded"
        case .missingGoogleClientID:
            return "Google OAuth client ID is not found in configuration"
        case .missingAPIEndpoint:
            return "API endpoint URL is not configured"
        case .invalidEnvironment:
            return "Environment configuration is corrupt or missing"
        case .networkUnavailable:
            return "No internet connection detected"
        }
    }
}

