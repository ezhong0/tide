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

// MARK: - API Errors

enum APIError: LocalizedError {
    case networkError
    case invalidResponse
    case unauthorized
    case serverError(Int)
    case decodingError
    case unknown

    var errorDescription: String? {
        switch self {
        case .networkError:
            return "Network connection failed"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Authentication required"
        case .serverError(let code):
            return "Server error (code: \(code))"
        case .decodingError:
            return "Failed to decode response"
        case .unknown:
            return "An unknown error occurred"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .networkError:
            return "Please check your internet connection"
        case .invalidResponse:
            return "Please try again later"
        case .unauthorized:
            return "Please sign in again"
        case .serverError:
            return "Please try again later"
        case .decodingError:
            return "App may need an update"
        case .unknown:
            return "Please try again"
        }
    }
}

// MARK: - Auth Errors

enum AuthError: LocalizedError {
    case notAuthenticated
    case tokenExpired
    case invalidToken
    case oauthFailed(String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "You are not signed in"
        case .tokenExpired:
            return "Your session has expired"
        case .invalidToken:
            return "Invalid authentication token"
        case .oauthFailed(let provider):
            return "\(provider) authentication failed"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .notAuthenticated, .tokenExpired, .invalidToken:
            return "Please sign in again"
        case .oauthFailed:
            return "Please try signing in again"
        }
    }
}
