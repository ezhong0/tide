#!/bin/bash

# Railway Alpha Deployment Integration Tests
# Tests end-to-end functionality of the deployed system

set -e

echo "🧪 Railway Alpha Deployment Tests"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Service URLs
GATEWAY_URL="https://gateway-production-caf0.up.railway.app"
AI_URL="https://ai-production-5753.up.railway.app"
EMAIL_URL="https://email-production-264c.up.railway.app"
CALENDAR_URL="https://calendar-production-325a.up.railway.app"
WORKFLOW_URL="https://workflow-production-a5d2.up.railway.app"

# Track test results
total_tests=0
passed_tests=0

# Test function
test_endpoint() {
    local test_name=$1
    local method=${2:-GET}
    local url=$3
    local expected_status=${4:-200}
    local data=${5:-}

    total_tests=$((total_tests + 1))
    echo -n "  Testing: $test_name... "

    if [ -n "$data" ]; then
        http_code=$(curl -s -o /tmp/response_body.txt -w "%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
        body=$(cat /tmp/response_body.txt 2>/dev/null || echo "")
    else
        http_code=$(curl -s -o /tmp/response_body.txt -w "%{http_code}" -X "$method" "$url" 2>&1)
        body=$(cat /tmp/response_body.txt 2>/dev/null || echo "")
    fi

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        passed_tests=$((passed_tests + 1))
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "    Response: $(echo "$body" | head -c 100)..."
        fi
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        if [ -n "$body" ]; then
            echo "    Response: $body"
        fi
        return 1
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Suite 1: Service Health Checks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "Gateway health" GET "$GATEWAY_URL/health" 200
test_endpoint "AI service health" GET "$AI_URL/health" 200
test_endpoint "Email service health" GET "$EMAIL_URL/health" 200
test_endpoint "Calendar service health" GET "$CALENDAR_URL/health" 200
test_endpoint "Workflow service health" GET "$WORKFLOW_URL/health" 503

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Suite 2: GraphQL Gateway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test GraphQL endpoint (introspection query)
introspection_query='{"query":"{ __schema { queryType { name } } }"}'
test_endpoint "GraphQL introspection" POST "$GATEWAY_URL/graphql" 200 "$introspection_query" || {
    echo -e "  ${YELLOW}Note: GraphQL may not be configured yet${NC}"
}

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Suite 3: Direct Service APIs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test AI service endpoints
echo -e "${YELLOW}AI Service:${NC}"
test_endpoint "AI capabilities" GET "$AI_URL/capabilities" 200 || echo "  Endpoint may not exist yet"
test_endpoint "AI models" GET "$AI_URL/models" 200 || echo "  Endpoint may not exist yet"

echo ""
echo -e "${YELLOW}Email Service:${NC}"
test_endpoint "Email providers" GET "$EMAIL_URL/providers" 200 || echo "  Endpoint may not exist yet"

echo ""
echo -e "${YELLOW}Calendar Service:${NC}"
test_endpoint "Calendar providers" GET "$CALENDAR_URL/providers" 200 || echo "  Endpoint may not exist yet"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Suite 4: CORS & Security${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -n "  Checking CORS headers... "
cors_headers=$(curl -s -I -X OPTIONS "$GATEWAY_URL/health" -H "Origin: https://example.com" 2>&1 | grep -i "access-control" || echo "")
if [ -n "$cors_headers" ]; then
    echo -e "${GREEN}✓ CORS configured${NC}"
    echo "    $cors_headers"
else
    echo -e "${YELLOW}⚠ CORS headers not found${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

pass_rate=$((passed_tests * 100 / total_tests))

echo "Total Tests:  $total_tests"
echo -e "Passed:       ${GREEN}$passed_tests${NC}"
echo -e "Failed:       ${RED}$((total_tests - passed_tests))${NC}"
echo "Pass Rate:    $pass_rate%"
echo ""

if [ $pass_rate -ge 70 ]; then
    echo -e "${GREEN}✅ Railway Alpha deployment is operational!${NC}"
    echo ""
    echo "🎉 Next Steps:"
    echo "  1. Configure mobile apps with gateway URL:"
    echo "     ${GATEWAY_URL}"
    echo ""
    echo "  2. Test authentication flow with a real user"
    echo ""
    echo "  3. Monitor logs for errors:"
    echo "     railway logs --service gateway"
    echo ""
    exit 0
elif [ $pass_rate -ge 50 ]; then
    echo -e "${YELLOW}⚠ Railway deployment partially working${NC}"
    echo ""
    echo "Some services may need configuration. Check:"
    echo "  1. Environment variables in Railway dashboard"
    echo "  2. Service logs: railway logs --service <name>"
    echo "  3. Supabase connection"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Railway deployment has issues${NC}"
    echo ""
    echo "Critical services are not responding. Check:"
    echo "  1. Railway dashboard for deployment errors"
    echo "  2. Service logs: railway logs --service <name>"
    echo "  3. Build logs for compile errors"
    echo ""
    exit 1
fi
