#!/bin/bash

# Fix Gateway Environment Variables
# Gateway is missing required Supabase env vars

echo "🔧 Setting Gateway Environment Variables"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env with your Supabase credentials"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '^#' | xargs)

# Verify required vars
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not found in .env"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ SUPABASE_ANON_KEY not found in .env"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in .env"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""
echo "Setting variables for gateway service..."
echo ""

# Set variables
railway variables set \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  NODE_ENV=production \
  PORT=8080 \
  CORS_ORIGIN="*" \
  --service gateway

echo ""
echo "✅ Variables set!"
echo ""
echo "Restarting gateway..."
railway restart --service gateway

echo ""
echo "⏳ Wait 30 seconds for restart, then test:"
echo "   curl https://gateway-production-caf0.up.railway.app/health"
