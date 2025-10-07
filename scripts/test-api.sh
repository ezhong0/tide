#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Tide API Integration Tests${NC}"
echo ""

# Configuration
GATEWAY_URL="http://localhost:4000"
AUTH_URL="http://localhost:4001"

# Test 1: Gateway Health Check
echo -e "${BLUE}Test 1: Gateway Health Check${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" ${GATEWAY_URL}/health 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Gateway is healthy${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ Gateway health check failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 2: Auth Service Health Check
echo -e "${BLUE}Test 2: Auth Service Health Check${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" ${AUTH_URL}/health 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Auth service is healthy${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ Auth service health check failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 3: User Registration
echo -e "${BLUE}Test 3: User Registration${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@tide.test"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${GATEWAY_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPass123!\",
    \"name\": \"Test User\",
    \"timezone\": \"America/Los_Angeles\"
  }" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "201" ]; then
    echo -e "${GREEN}✅ User registration successful${NC}"
    echo "$BODY" | jq '.'
    ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken')
    REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken')
    USER_ID=$(echo "$BODY" | jq -r '.user.id')
    echo ""
    echo "Captured tokens for subsequent tests:"
    echo "Access Token: ${ACCESS_TOKEN:0:20}..."
    echo "Refresh Token: ${REFRESH_TOKEN:0:20}..."
    echo "User ID: $USER_ID"
else
    echo -e "${RED}❌ User registration failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
    ACCESS_TOKEN=""
    REFRESH_TOKEN=""
fi
echo ""

# Test 4: Login
echo -e "${BLUE}Test 4: User Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${GATEWAY_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPass123!\"
  }" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ User login successful${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ User login failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 5: Login with Wrong Password
echo -e "${BLUE}Test 5: Login with Wrong Password (Should Fail)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${GATEWAY_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123!\"
  }" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✅ Correctly rejected wrong password${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ Should have rejected wrong password (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 6: Token Refresh
if [ -n "$REFRESH_TOKEN" ]; then
    echo -e "${BLUE}Test 6: Token Refresh${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${GATEWAY_URL}/auth/refresh \
      -H "Content-Type: application/json" \
      -d "{
        \"refreshToken\": \"${REFRESH_TOKEN}\"
      }" 2>/dev/null)

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Token refresh successful${NC}"
        echo "$BODY" | jq '.'
    else
        echo -e "${RED}❌ Token refresh failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY" | jq '.'
    fi
    echo ""
fi

# Test 7: Duplicate Registration (Should Fail)
echo -e "${BLUE}Test 7: Duplicate Registration (Should Fail)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${GATEWAY_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPass123!\",
    \"name\": \"Test User Duplicate\",
    \"timezone\": \"America/Los_Angeles\"
  }" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "409" ]; then
    echo -e "${GREEN}✅ Correctly rejected duplicate email${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ Should have rejected duplicate email (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 8: Weak Password (Should Fail)
echo -e "${BLUE}Test 8: Weak Password Validation (Should Fail)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${GATEWAY_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"weak${TIMESTAMP}@tide.test\",
    \"password\": \"weak\",
    \"name\": \"Weak Password User\",
    \"timezone\": \"America/Los_Angeles\"
  }" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "400" ]; then
    echo -e "${GREEN}✅ Correctly rejected weak password${NC}"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}❌ Should have rejected weak password (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}✅ API Integration Tests Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
