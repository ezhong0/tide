/**
 * Design System - Spacing
 * Consistent spacing values across the app
 */

import SwiftUI

enum Spacing {
    /// 4pt
    static let xs: CGFloat = 4

    /// 8pt
    static let sm: CGFloat = 8

    /// 16pt
    static let md: CGFloat = 16

    /// 24pt
    static let lg: CGFloat = 24

    /// 32pt
    static let xl: CGFloat = 32

    /// 48pt
    static let xxl: CGFloat = 48

    /// 64pt
    static let xxxl: CGFloat = 64
}

// MARK: - Edge Insets Extensions

extension EdgeInsets {
    /// All sides: xs (4pt)
    static let xs = EdgeInsets(top: Spacing.xs, leading: Spacing.xs, bottom: Spacing.xs, trailing: Spacing.xs)

    /// All sides: sm (8pt)
    static let sm = EdgeInsets(top: Spacing.sm, leading: Spacing.sm, bottom: Spacing.sm, trailing: Spacing.sm)

    /// All sides: md (16pt)
    static let md = EdgeInsets(top: Spacing.md, leading: Spacing.md, bottom: Spacing.md, trailing: Spacing.md)

    /// All sides: lg (24pt)
    static let lg = EdgeInsets(top: Spacing.lg, leading: Spacing.lg, bottom: Spacing.lg, trailing: Spacing.lg)

    /// All sides: xl (32pt)
    static let xl = EdgeInsets(top: Spacing.xl, leading: Spacing.xl, bottom: Spacing.xl, trailing: Spacing.xl)

    /// Horizontal only: md (16pt)
    static let horizontalMd = EdgeInsets(top: 0, leading: Spacing.md, bottom: 0, trailing: Spacing.md)

    /// Vertical only: md (16pt)
    static let verticalMd = EdgeInsets(top: Spacing.md, leading: 0, bottom: Spacing.md, trailing: 0)
}
