#!/bin/bash

# =====================================================
# Tide Supabase Setup Script
# =====================================================
# This script helps set up Supabase for the Tide project
# Run this AFTER creating your Supabase project in the dashboard
# =====================================================

set -e

echo "🌊 Tide Supabase Setup"
echo "======================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy supabase/.env.example to .env and fill in your values:"
    echo "  cp supabase/.env.example .env"
    echo ""
    echo "Get your Supabase credentials from:"
    echo "  https://app.supabase.com/project/_/settings/api"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Check required variables
echo "📋 Checking environment variables..."
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "   - $VAR"
    done
    echo ""
    echo "Please update your .env file with these values."
    exit 1
fi

echo "✅ All required environment variables present"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    else
        echo "Please install Supabase CLI manually:"
        echo "  https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Link to remote project
echo "🔗 Linking to Supabase project..."
if [ ! -f "supabase/.gitignore" ]; then
    # Extract project ID from URL
    PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
    echo "Project ID: $PROJECT_ID"

    # Link to project
    supabase link --project-ref $PROJECT_ID

    if [ $? -eq 0 ]; then
        echo "✅ Successfully linked to Supabase project"
    else
        echo "❌ Failed to link to Supabase project"
        echo "Please run manually: supabase link --project-ref $PROJECT_ID"
        exit 1
    fi
else
    echo "✅ Already linked to Supabase project"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Apply database schema:"
echo "   - Go to: https://app.supabase.com/project/_/sql"
echo "   - Copy contents of supabase/schema.sql"
echo "   - Paste and run in SQL editor"
echo ""
echo "2. Configure OAuth providers:"
echo "   - Go to: https://app.supabase.com/project/_/auth/providers"
echo "   - Enable Google OAuth and add your credentials"
echo "   - Enable Azure OAuth and add your credentials"
echo ""
echo "3. Update redirect URLs:"
echo "   - Go to: https://app.supabase.com/project/_/auth/url-configuration"
echo "   - Add: exp://localhost:19000 (for Expo)"
echo "   - Add: com.tide.app:// (for iOS)"
echo "   - Add: tideapp:// (for Android)"
echo ""
echo "4. Start building! 🚀"
