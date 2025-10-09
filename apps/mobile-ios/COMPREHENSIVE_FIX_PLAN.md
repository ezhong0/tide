# Comprehensive Build Fix Plan

## Executive Summary

Current state: **~2,475 compilation errors** (many duplicates across targets)

Root causes identified:
1. **Model Inconsistency** - Multiple conflicting definitions of core models
2. **Incomplete Design System** - Missing Typography/Font extensions
3. **Platform Incompatibility** - iOS-specific code without proper guards
4. **Type Confusion** - Mixing SDK types (Supabase.User) with app types
5. **Protocol Gaps** - Missing methods in protocol definitions

## Strategic Approach

### Philosophy: Fix Root Causes, Not Symptoms

Instead of patching individual errors, we'll:
1. **Consolidate** - Single source of truth for all models
2. **Complete** - Finish incomplete systems (Design, Protocols)
3. **Isolate** - Platform-specific code properly guarded
4. **Standardize** - Consistent patterns across codebase

---

## Phase 1: Model Consolidation & Type Safety
**Priority: CRITICAL | Impact: ~600 errors | Time: 2-3 hours**

### 1.1 Email Model Unification

**Problem**: Multiple Email model definitions conflict
- `Models/Email.swift` - Has `EmailContact`, `timestamp`, `isRead`, `isStarred`, `aiSummary`
- `TideApp/Models/EmailDraft.swift` - Has `String` for from/to, `receivedAt`, simpler structure
- Usage scattered across codebase expects different properties

**Solution**:
```swift
// Define ONE canonical Email model in TideApp/Models/Email.swift
struct Email: Identifiable, Codable {
    let id: String
    let from: EmailContact          // Structured type
    let to: [EmailContact]          // Array of contacts
    let subject: String
    let preview: String
    let body: String
    let receivedAt: Date            // Renamed from timestamp for clarity
    var isRead: Bool
    var isStarred: Bool
    var priority: EmailPriority
    var aiSummary: String?
    var suggestedActions: [EmailAction]?
}

struct EmailContact: Codable {
    let email: String
    let name: String?
}

enum EmailPriority: String, Codable {
    case low, medium, high, urgent
}
```

**Action Items**:
- [x] Create canonical Email model
- [ ] Delete duplicate definitions
- [ ] Update all imports to use canonical model
- [ ] Fix EmailDraft.swift to reference canonical Email
- [ ] Update MockAPIClient to use canonical model
- [ ] Update all view models expecting Email properties

### 1.2 User Type Disambiguation

**Problem**: Confusion between Supabase.User and app User types
- `Supabase.User` has `id: UUID`, `userMetadata`, etc
- `TideIOS.User` (from AuthManager) has `id: String`, simpler structure
- Protocol methods expect different types

**Solution**:
```swift
// Keep app-specific User separate from Supabase.User
// TideApp/Models/User.swift
struct TideUser: Codable, Identifiable {
    let id: String                  // String, not UUID
    let email: String
    let name: String
    let avatarUrl: String?

    // Initializer from Supabase.User
    init(from supabaseUser: Supabase.User) {
        self.id = supabaseUser.id.uuidString
        self.email = supabaseUser.email ?? ""
        self.name = supabaseUser.userMetadata["full_name"]?.value as? String
                    ?? supabaseUser.email ?? "User"
        self.avatarUrl = supabaseUser.userMetadata["avatar_url"]?.value as? String
    }
}

// Update AuthManager to use TideUser
typealias User = TideUser  // For backward compatibility
```

**Action Items**:
- [ ] Create TideUser model with clear conversion from Supabase.User
- [ ] Update AuthManager to use TideUser
- [ ] Update all references expecting `.userMetadata`
- [ ] Fix all UUID vs String conversions
- [ ] Update protocol definitions

### 1.3 UserProfile Consolidation

**Problem**: Two UserProfile structs with different fields
- `Services/SupabaseManager.swift` - Has fullName, avatarUrl, primaryProvider, timezone, language, theme
- `TideApp/Services/SupabaseManager.swift` - Has email, name, preferences, createdAt

**Solution**:
```swift
// Single canonical UserProfile
struct UserProfile: Codable {
    let id: String
    let email: String
    let fullName: String
    let avatarUrl: String?
    let primaryProvider: String
    var timezone: String
    var language: String
    var theme: String
    var preferences: [String: String]
    let createdAt: Date
    let updatedAt: Date
}
```

**Action Items**:
- [ ] Merge UserProfile definitions
- [ ] Update all usage sites
- [ ] Fix protocol requirements

---

## Phase 2: Design System Completion
**Priority: HIGH | Impact: ~350 errors | Time: 1-2 hours**

### 2.1 Typography System

**Problem**: Views expect Font extensions that don't exist
- `.tideBodyMedium`, `.tideLabelMedium`, `.tideHeadlineLarge` etc. are called but not defined
- `Design.Typography.labelLarge` referenced but doesn't exist

**Solution**:
Create complete Typography system with Font extensions

```swift
// TideApp/Core/Design/Typography+Design.swift
import SwiftUI

extension Design.Typography {
    // Body styles
    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    // Label styles
    static let labelLarge = Font.system(size: 14, weight: .medium)
    static let labelMedium = Font.system(size: 12, weight: .medium)
    static let labelSmall = Font.system(size: 11, weight: .medium)

    // Headline styles
    static let headlineLarge = Font.system(size: 32, weight: .bold)
    static let headlineMedium = Font.system(size: 24, weight: .semibold)
    static let headlineSmall = Font.system(size: 20, weight: .semibold)

    // Title styles
    static let titleLarge = Font.system(size: 22, weight: .semibold)
    static let titleMedium = Font.system(size: 18, weight: .semibold)
    static let titleSmall = Font.system(size: 16, weight: .semibold)
}

// Convenience extensions on Font
extension Font {
    static var tideBodyLarge: Font { Design.Typography.bodyLarge }
    static var tideBodyMedium: Font { Design.Typography.bodyMedium }
    static var tideBodySmall: Font { Design.Typography.bodySmall }

    static var tideLabelLarge: Font { Design.Typography.labelLarge }
    static var tideLabelMedium: Font { Design.Typography.labelMedium }
    static var tideLabelSmall: Font { Design.Typography.labelSmall }

    static var tideHeadlineLarge: Font { Design.Typography.headlineLarge }
    static var tideHeadlineMedium: Font { Design.Typography.headlineMedium }
    static var tideHeadlineSmall: Font { Design.Typography.headlineSmall }

    static var tideTitleLarge: Font { Design.Typography.titleLarge }
    static var tideTitleMedium: Font { Design.Typography.titleMedium }
    static var tideTitleSmall: Font { Design.Typography.titleSmall }
}
```

**Action Items**:
- [ ] Create Typography+Design.swift with all styles
- [ ] Add Font extensions for convenience
- [ ] Update DesignSystem.swift if needed
- [ ] Audit all font usage and ensure consistency

### 2.2 Colors System

**Problem**: CGColor.systemGray5, systemGray6 don't exist

**Solution**:
```swift
// TideApp/Core/Design/Colors.swift
import SwiftUI

extension Design.Colors {
    static let systemGray5 = Color(UIColor.systemGray5)
    static let systemGray6 = Color(UIColor.systemGray6)
}

// Or use Color directly
extension Color {
    static let tideSystemGray5 = Color(UIColor.systemGray5)
    static let tideSystemGray6 = Color(UIColor.systemGray6)
}
```

**Action Items**:
- [ ] Check if Colors.swift exists
- [ ] Add missing color definitions
- [ ] Replace CGColor references with Color

---

## Phase 3: Platform Compatibility
**Priority: MEDIUM | Impact: ~350 errors | Time: 1 hour**

### 3.1 iOS-Specific Navigation Modifiers

**Problem**: `navigationBarTitleDisplayMode`, `navigationBarTrailing` unavailable on macOS

**Solution**:
Create platform-specific view modifiers

```swift
// TideApp/Core/Components/ViewModifiers.swift
import SwiftUI

extension View {
    @ViewBuilder
    func navigationBarTitleDisplayModeCompat(_ mode: NavigationBarItem.TitleDisplayMode) -> some View {
        #if os(iOS)
        self.navigationBarTitleDisplayMode(mode)
        #else
        self
        #endif
    }

    @ViewBuilder
    func toolbarCompat<Content: View>(_ placement: ToolbarItemPlacement, @ViewBuilder content: () -> Content) -> some View {
        #if os(iOS)
        self.toolbar {
            ToolbarItem(placement: placement) {
                content()
            }
        }
        #else
        self.toolbar {
            content()
        }
        #endif
    }
}
```

**Action Items**:
- [ ] Create ViewModifiers.swift with platform wrappers
- [ ] Replace all `.navigationBarTitleDisplayMode()` with `.navigationBarTitleDisplayModeCompat()`
- [ ] Replace all `.toolbar(.navigationBarTrailing)` with `.toolbarCompat(.navigationBarTrailing)`
- [ ] Handle other platform-specific modifiers (keyboardType, etc)

### 3.2 TextField Modifiers

**Problem**: `.keyboardType(.emailAddress)` not available on macOS

**Solution**:
```swift
extension View {
    @ViewBuilder
    func keyboardTypeCompat(_ type: UIKeyboardType) -> some View {
        #if os(iOS)
        self.keyboardType(type)
        #else
        self
        #endif
    }
}
```

**Action Items**:
- [ ] Add keyboardTypeCompat modifier
- [ ] Replace all keyboardType calls
- [ ] Handle textContentType similarly

---

## Phase 4: Protocol & Interface Fixes
**Priority: MEDIUM | Impact: ~100 errors | Time: 30 min**

### 4.1 SupabaseManagerProtocol Completion

**Problem**: Missing `getCurrentUserId()` method

**Solution**:
```swift
// Add to SupabaseManagerProtocol
protocol SupabaseManagerProtocol: ObservableObject {
    // ... existing methods ...

    // Add missing method
    func getCurrentUserId() async -> String?
}

// Implement in SupabaseManager
extension SupabaseManager {
    func getCurrentUserId() async -> String? {
        return currentUser?.id.uuidString
    }
}

// Implement in MockSupabaseManager
extension MockSupabaseManager {
    func getCurrentUserId() async -> String? {
        return String(describing: currentUser?.id ?? UUID())
    }
}
```

**Action Items**:
- [ ] Add getCurrentUserId() to protocol
- [ ] Implement in SupabaseManager
- [ ] Implement in MockSupabaseManager
- [ ] Remove direct access attempts

### 4.2 EmailComposeContext Missing

**Problem**: generateEmailDrafts expects context parameter

**Solution**:
```swift
// Define EmailComposeContext if missing
struct EmailComposeContext: Codable {
    let replyToId: String?
    let conversationId: String?
    let tone: String?
    let length: String?
}

// Update call sites
let drafts = try await apiClient.generateEmailDrafts(
    emailId: emailId,
    userId: userId,
    context: EmailComposeContext(
        replyToId: email.id,
        conversationId: nil,
        tone: "professional",
        length: "medium"
    )
)
```

**Action Items**:
- [ ] Define EmailComposeContext model
- [ ] Update all generateEmailDrafts calls
- [ ] Provide sensible defaults

---

## Phase 5: Verification & Cleanup
**Priority: LOW | Impact: Remaining errors | Time: 1 hour**

### 5.1 Build Verification

**Process**:
1. Run clean build: `swift build --clean`
2. Capture all errors: `swift build 2>&1 | grep "error:" > errors.txt`
3. Categorize remaining errors
4. Fix systematically by category
5. Repeat until clean build

### 5.2 Testing Strategy

After build succeeds:
1. Test core flows (Auth, Email, Calendar, Tasks, Chat)
2. Verify dependency injection works
3. Test mock implementations
4. Run unit tests if they exist
5. Manual smoke testing

---

## Implementation Order

### Day 1 (4-5 hours)
1. **Morning**: Phase 1.1 - Email Model Consolidation
2. **Afternoon**: Phase 1.2 & 1.3 - User & UserProfile fixes
3. **Evening**: Phase 2.1 - Typography System

### Day 2 (3-4 hours)
1. **Morning**: Phase 2.2 - Colors & Phase 3 - Platform Compatibility
2. **Afternoon**: Phase 4 - Protocol Fixes
3. **Evening**: Phase 5 - Verification & Cleanup

---

## Risk Mitigation

### Risks:
1. **Breaking changes** - Changing models affects entire codebase
2. **Hidden dependencies** - Some errors may reveal deeper issues
3. **Time estimates** - Could take longer than planned

### Mitigation:
1. **Git branching** - Work on feature branch, test before merge
2. **Incremental commits** - Commit after each phase for rollback safety
3. **Documentation** - Document all changes for future reference
4. **Pair review** - Have changes reviewed before finalizing

---

## Success Criteria

- [ ] Zero compilation errors
- [ ] Zero compilation warnings (stretch goal)
- [ ] All core features testable
- [ ] Consistent patterns throughout codebase
- [ ] Platform compatibility verified
- [ ] Documentation updated

---

## Long-Term Recommendations

1. **Establish Model Layer** - Create single Models directory as source of truth
2. **Design System Documentation** - Document all Typography, Colors, Components
3. **Platform Abstraction** - Create ViewModifierKit for all platform-specific code
4. **Protocol-First Development** - Define protocols before implementations
5. **Automated Tests** - Add tests to prevent regression
6. **CI/CD** - Set up continuous integration to catch issues early

---

## Next Steps

1. **Review this plan** with team
2. **Get approval** for breaking changes
3. **Create feature branch**: `git checkout -b fix/comprehensive-build-fixes`
4. **Execute Phase 1** starting with Email model consolidation
5. **Commit incrementally** after each successful phase
6. **Update this document** with actual progress and findings

---

_Generated: October 8, 2025_
_Last Updated: October 8, 2025_
