import Foundation

// MARK: - User Model
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    var profileImageUrl: String?
    var preferences: UserPreferences?

    init(
        id: String = UUID().uuidString,
        email: String,
        name: String,
        profileImageUrl: String? = nil,
        preferences: UserPreferences? = nil
    ) {
        self.id = id
        self.email = email
        self.name = name
        self.profileImageUrl = profileImageUrl
        self.preferences = preferences
    }
}

// MARK: - User Preferences
struct UserPreferences: Codable {
    var notificationsEnabled: Bool
    var theme: AppTheme
    var language: String

    enum AppTheme: String, Codable {
        case light
        case dark
        case system
    }

    init(
        notificationsEnabled: Bool = true,
        theme: AppTheme = .system,
        language: String = "en"
    ) {
        self.notificationsEnabled = notificationsEnabled
        self.theme = theme
        self.language = language
    }
}
