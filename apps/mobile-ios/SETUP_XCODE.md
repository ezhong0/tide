# How to Run the iOS App

The iOS app code is ready, but needs an Xcode project to run. Here's how to set it up:

## Option 1: Quick Setup (Recommended)

### Step 1: Create Xcode Project

1. **Open Xcode**
   ```bash
   open -a Xcode
   ```

2. **Create New Project**
   - File → New → Project...
   - Select **iOS** → **App**
   - Click **Next**

3. **Configure Project**
   - **Product Name**: `Tide`
   - **Team**: Select your team
   - **Organization Identifier**: `com.tide`
   - **Bundle Identifier**: Will auto-fill as `com.tide.Tide` → **Change to** `com.tide.app`
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Storage**: **None**
   - Click **Next**

4. **Save Location**
   - Navigate to: `/Users/edwardzhong/Projects/tide/apps/`
   - **IMPORTANT**: Name the folder `mobile-ios-xcode` (don't overwrite existing mobile-ios)
   - Click **Create**

### Step 2: Replace Default Files

1. **Delete default files** from the new project:
   - Delete `TideApp.swift` (the auto-generated one)
   - Delete `ContentView.swift`
   - Keep `Assets.xcassets`

2. **Add existing source files**:
   - In Xcode, right-click project → **Add Files to "Tide"...**
   - Navigate to `/Users/edwardzhong/Projects/tide/apps/mobile-ios/`
   - Select ALL folders and files:
     - ✅ Core/
     - ✅ Features/
     - ✅ Models/
     - ✅ Services/
     - ✅ TideApp.swift
     - ✅ Info.plist
   - **IMPORTANT**: Check **"Copy items if needed"** is UNCHECKED
   - **IMPORTANT**: Check **"Create groups"** (not folder references)
   - Click **Add**

### Step 3: Add Package Dependencies

1. **Add Supabase Swift**:
   - File → Add Package Dependencies...
   - Enter URL: `https://github.com/supabase/supabase-swift.git`
   - Version: `2.5.0` or higher
   - Click **Add Package**
   - Select **Supabase** library
   - Click **Add Package**

2. **Add KeychainSwift**:
   - File → Add Package Dependencies...
   - Enter URL: `https://github.com/evgenyneu/keychain-swift.git`
   - Version: `20.0.0` or higher
   - Click **Add Package**

### Step 4: Update Info.plist

1. **In Xcode**, select `Info.plist`
2. **Add URL Scheme** (if not already there):
   - Click `+` to add new row
   - Key: `CFBundleURLTypes` (select "URL types")
   - Expand the array
   - Add URL Schemes:
     - Item 0: `com.googleusercontent.apps.526055709746-golq3n9mgv1oh55sgim0s5qrqcped8j6`

### Step 5: Run the App!

1. **Select Simulator**: iPhone 15 Pro (or any iOS 17+ simulator)
2. **Click Run** (▶️) or press `⌘ + R`
3. **App should launch!**

---

## Option 2: Even Quicker - Use Existing Files

If the above seems complex, here's the fastest way:

```bash
# Open Xcode
open -a Xcode

# Then manually:
# 1. File → New → Project → iOS App
# 2. Name: Tide, Bundle ID: com.tide.app
# 3. Save to a NEW folder (not mobile-ios)
# 4. Drag all .swift files from mobile-ios into the Xcode project
# 5. Add Supabase and KeychainSwift packages
# 6. Run!
```

---

## What You'll See When It Runs

1. **Email Tab**: "Connect Gmail" button
2. **Tap it**: OAuth flow opens
3. **Sign in**: With your Google account
4. **Grant permissions**: Allow Gmail access
5. **Back to app**: Your real Gmail emails appear! 🎉

---

## Troubleshooting

### "No such module 'Supabase'"
- Make sure you added the Supabase package dependency
- Clean build folder: `⌘ + Shift + K`
- Rebuild: `⌘ + B`

### "Cannot find 'TideCore' in scope"
- Make sure you added the Core/ folder
- Check all .swift files are included in the target

### App crashes on launch
- Check the console for errors
- Make sure Info.plist has the URL scheme
- Make sure Bundle ID is `com.tide.app`

---

## Next Steps After It Runs

1. ✅ Test "Connect Gmail" flow
2. ✅ Verify OAuth works
3. ✅ See your real emails
4. ✅ Test AI triage (once emails load)

---

**Estimated setup time**: 10-15 minutes
