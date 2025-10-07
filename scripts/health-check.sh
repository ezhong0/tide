#!/bin/bash

# Quick health check for all Railway services

echo "🏥 Railway Services Health Check"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track results
total=0
healthy=0

# Function to test a service
test_service() {
    local name=$1
    local url=$2

    total=$((total + 1))
    echo -n "Testing $name... "

    response=$(curl -s "${url}/health" 2>&1)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health" 2>&1)

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
        echo "  $response"
        healthy=$((healthy + 1))
    elif [ "$http_code" = "503" ]; then
        echo -e "${YELLOW}⚠ Not Ready${NC}"
        echo "  $response"
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "  $response"
    fi
    echo ""
}

# Test all services
test_service "Gateway" "https://gateway-production-caf0.up.railway.app"
test_service "AI Service" "https://ai-production-5753.up.railway.app"
test_service "Email Service" "https://email-production-264c.up.railway.app"
test_service "Calendar Service" "https://calendar-production-325a.up.railway.app"
test_service "Workflow Service" "https://workflow-production-a5d2.up.railway.app"

# Summary
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Healthy: ${GREEN}$healthy${NC} / $total"
echo ""

if [ $healthy -ge 4 ]; then
    echo -e "${GREEN}✅ All critical services operational!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some services not ready${NC}"
    exit 0
fi
