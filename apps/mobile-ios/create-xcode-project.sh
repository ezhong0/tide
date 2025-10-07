#!/bin/bash

# Create Xcode Project for Tide iOS App
# This script sets up a basic Xcode project structure

cd /Users/edwardzhong/Projects/tide/apps/mobile-ios

# Create a minimal Xcode project
# Note: This is a basic setup - you may want to customize further

echo "Creating Xcode project for Tide iOS..."

# Method 1: Use Swift Package Manager to generate Xcode project
echo "Generating Xcode project from Package.swift..."
swift package generate-xcodeproj

if [ $? -eq 0 ]; then
    echo "✅ Xcode project created successfully!"
    echo ""
    echo "To open the project:"
    echo "open /Users/edwardzhong/Projects/tide/apps/mobile-ios/TideIOS.xcodeproj"
else
    echo "❌ Failed to create Xcode project"
    exit 1
fi
