#!/bin/bash

# Test Railway Deployments
# Tests health endpoints for all deployed services

set -e

echo "🧪 Testing Railway Deployments"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test a health endpoint
test_health() {
    local service=$1
    local url=$2

    echo -n "Testing $service... "

    # Try to curl the health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" 2>&1)

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"

        # Get detailed health info
        health_info=$(curl -s "$url/health" 2>&1)
        echo "  Response: $health_info"
        return 0
    else
        echo -e "${RED}✗ Unhealthy (HTTP $response)${NC}"

        # Try to get error details
        error_info=$(curl -s "$url/health" 2>&1)
        echo "  Response: $error_info"
        return 1
    fi
}

echo "📝 Enter your service URLs from Railway dashboard:"
echo ""

# Prompt for URLs
read -p "Gateway URL (e.g., https://gateway-production.up.railway.app): " GATEWAY_URL
read -p "AI Service URL (e.g., https://ai-production.up.railway.app): " AI_URL
read -p "Email Service URL (e.g., https://email-production.up.railway.app): " EMAIL_URL
read -p "Calendar Service URL (e.g., https://calendar-production.up.railway.app): " CALENDAR_URL
read -p "Workflow Service URL (e.g., https://workflow-production.up.railway.app): " WORKFLOW_URL

echo ""
echo "================================"
echo "🏥 Running Health Checks"
echo "================================"
echo ""

# Track results
total=0
passed=0

# Test each service
if [ -n "$AI_URL" ]; then
    total=$((total + 1))
    test_health "AI Service" "$AI_URL" && passed=$((passed + 1))
    echo ""
fi

if [ -n "$EMAIL_URL" ]; then
    total=$((total + 1))
    test_health "Email Service" "$EMAIL_URL" && passed=$((passed + 1))
    echo ""
fi

if [ -n "$CALENDAR_URL" ]; then
    total=$((total + 1))
    test_health "Calendar Service" "$CALENDAR_URL" && passed=$((passed + 1))
    echo ""
fi

if [ -n "$WORKFLOW_URL" ]; then
    total=$((total + 1))
    test_health "Workflow Service" "$WORKFLOW_URL" && passed=$((passed + 1))
    echo ""
fi

if [ -n "$GATEWAY_URL" ]; then
    total=$((total + 1))
    test_health "Gateway Service" "$GATEWAY_URL" && passed=$((passed + 1))
    echo ""
fi

# Summary
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Passed: ${GREEN}$passed${NC} / $total"

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ All services healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some services failed${NC}"
    exit 1
fi
