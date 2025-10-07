#!/bin/bash

# Configure Gateway with Backend Service URLs
# This enables the GraphQL gateway to communicate with backend services

echo "🔧 Configuring Gateway Service URLs"
echo "===================================="
echo ""

# Service URLs
AI_URL="https://ai-production-5753.up.railway.app"
EMAIL_URL="https://email-production-264c.up.railway.app"
CALENDAR_URL="https://calendar-production-325a.up.railway.app"
WORKFLOW_URL="https://workflow-production-a5d2.up.railway.app"

echo "Setting environment variables..."

railway variables set AI_SERVICE_URL="$AI_URL" --service gateway
railway variables set EMAIL_SERVICE_URL="$EMAIL_URL" --service gateway
railway variables set CALENDAR_SERVICE_URL="$CALENDAR_URL" --service gateway
railway variables set WORKFLOW_SERVICE_URL="$WORKFLOW_URL" --service gateway

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Restart gateway for changes to take effect:"
echo "  railway restart --service gateway"
