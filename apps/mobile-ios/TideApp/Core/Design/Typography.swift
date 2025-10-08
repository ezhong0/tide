/**
 * Design System - Typography
 * Consistent text styles across the app
 */

import SwiftUI

enum Typography {
    // MARK: - Display

    /// 34pt, Bold - For large hero text
    static let displayLarge = Font.system(size: 34, weight: .bold, design: .default)

    /// 28pt, Bold - For section headers
    static let displayMedium = Font.system(size: 28, weight: .bold, design: .default)

    // MARK: - Headline

    /// 22pt, Semibold - For card titles
    static let headlineLarge = Font.system(size: 22, weight: .semibold, design: .default)

    /// 17pt, Semibold - For list item titles
    static let headlineMedium = Font.system(size: 17, weight: .semibold, design: .default)

    /// 15pt, Semibold - For small headers
    static let headlineSmall = Font.system(size: 15, weight: .semibold, design: .default)

    // MARK: - Body

    /// 17pt, Regular - For primary body text
    static let bodyLarge = Font.system(size: 17, weight: .regular, design: .default)

    /// 15pt, Regular - For secondary body text
    static let bodyMedium = Font.system(size: 15, weight: .regular, design: .default)

    /// 13pt, Regular - For small body text
    static let bodySmall = Font.system(size: 13, weight: .regular, design: .default)

    // MARK: - Label

    /// 13pt, Medium - For form labels
    static let labelLarge = Font.system(size: 13, weight: .medium, design: .default)

    /// 12pt, Medium - For button text
    static let labelMedium = Font.system(size: 12, weight: .medium, design: .default)

    /// 11pt, Medium - For tiny labels
    static let labelSmall = Font.system(size: 11, weight: .medium, design: .default)

    // MARK: - Caption

    /// 12pt, Regular - For timestamps
    static let caption = Font.system(size: 12, weight: .regular, design: .default)

    /// 11pt, Regular - For metadata
    static let captionSmall = Font.system(size: 11, weight: .regular, design: .default)
}

// MARK: - Font Extension for Common Styles

extension Font {
    static let tideDisplayLarge = Typography.displayLarge
    static let tideDisplayMedium = Typography.displayMedium
    static let tideHeadlineLarge = Typography.headlineLarge
    static let tideHeadlineMedium = Typography.headlineMedium
    static let tideHeadlineSmall = Typography.headlineSmall
    static let tideBodyLarge = Typography.bodyLarge
    static let tideBodyMedium = Typography.bodyMedium
    static let tideBodySmall = Typography.bodySmall
    static let tideLabelLarge = Typography.labelLarge
    static let tideLabelMedium = Typography.labelMedium
    static let tideLabelSmall = Typography.labelSmall
    static let tideCaption = Typography.caption
    static let tideCaptionSmall = Typography.captionSmall
}
