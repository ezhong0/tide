#!/bin/bash

# ==========================================
# Function Calling Effectiveness Test
# ==========================================
# Tests the AI service's ability to execute
# commands through GPT-5 function calling
#
# Usage: ./scripts/test-function-calling.sh
# ==========================================

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
AI_SERVICE_URL="${AI_SERVICE_URL:-http://localhost:3001}"
TEST_USER_ID="test-user-$(date +%s)"

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🧪 FUNCTION CALLING EFFECTIVENESS TEST         ║${NC}"
echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}AI Service URL:${NC} $AI_SERVICE_URL"
echo -e "${BLUE}Test User ID:${NC} $TEST_USER_ID"
echo ""

# Function to make AI request and analyze response
test_function_calling() {
    local test_name="$1"
    local user_request="$2"
    local expected_tools="$3"  # comma-separated list

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test: ${test_name}${NC}"
    echo -e "${YELLOW}Request:${NC} \"${user_request}\""
    echo ""

    # Make the request
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${AI_SERVICE_URL}/api/chat" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"${TEST_USER_ID}\",
        \"content\": \"${user_request}\",
        \"context\": {
          \"userEmail\": \"test@tide.ai\"
        }
      }" 2>&1)

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    # Check HTTP status
    if [ "$HTTP_CODE" != "200" ]; then
        echo -e "${RED}❌ FAILED - HTTP $HTTP_CODE${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        echo ""
        return 1
    fi

    # Parse response
    echo -e "${GREEN}✅ Response received${NC}"
    echo ""

    # Extract key information
    CONTENT=$(echo "$BODY" | jq -r '.content' 2>/dev/null)
    TOOLS_USED=$(echo "$BODY" | jq -r '.metadata.toolsUsed[]?' 2>/dev/null | tr '\n' ',' | sed 's/,$//')
    ITERATIONS=$(echo "$BODY" | jq -r '.metadata.iterations' 2>/dev/null)
    EXECUTION_TIME=$(echo "$BODY" | jq -r '.executionTime' 2>/dev/null)
    TOKENS_USED=$(echo "$BODY" | jq -r '.tokensUsed' 2>/dev/null)
    CONFIDENCE=$(echo "$BODY" | jq -r '.confidence' 2>/dev/null)

    # Display results
    echo -e "${BLUE}📊 Execution Metrics:${NC}"
    echo -e "  Iterations: ${YELLOW}${ITERATIONS}${NC}"
    echo -e "  Execution Time: ${YELLOW}${EXECUTION_TIME}ms${NC}"
    echo -e "  Tokens Used: ${YELLOW}${TOKENS_USED}${NC}"
    echo -e "  Confidence: ${YELLOW}${CONFIDENCE}${NC}"
    echo ""

    if [ -n "$TOOLS_USED" ] && [ "$TOOLS_USED" != "null" ]; then
        echo -e "${BLUE}🔧 Tools Called:${NC}"
        echo -e "  ${GREEN}${TOOLS_USED}${NC}"
        echo ""

        # Check if expected tools were used
        if [ -n "$expected_tools" ]; then
            IFS=',' read -ra EXPECTED <<< "$expected_tools"
            ALL_FOUND=true
            for tool in "${EXPECTED[@]}"; do
                if echo "$TOOLS_USED" | grep -q "$tool"; then
                    echo -e "  ${GREEN}✅ Expected tool found: ${tool}${NC}"
                else
                    echo -e "  ${RED}❌ Expected tool NOT found: ${tool}${NC}"
                    ALL_FOUND=false
                fi
            done
            echo ""

            if [ "$ALL_FOUND" = false ]; then
                echo -e "${RED}⚠️  WARNING: Not all expected tools were called${NC}"
            fi
        fi

        # Show detailed execution log
        echo -e "${BLUE}📝 Detailed Execution Log:${NC}"
        echo "$BODY" | jq -r '.metadata.executionLog[] |
            "  [\(.timestamp | todate)] \(.tool) - " +
            (if .success then "✅ SUCCESS" else "❌ FAILED: \(.error)" end) +
            " (\(.executionTime)ms)"' 2>/dev/null
        echo ""
    else
        echo -e "${YELLOW}ℹ️  No tools were called (direct response)${NC}"
        echo ""
    fi

    echo -e "${BLUE}💬 AI Response:${NC}"
    echo "$CONTENT" | fold -w 70 -s | sed 's/^/  /'
    echo ""

    # Full JSON output (optional, commented by default)
    # echo -e "${BLUE}📄 Full Response JSON:${NC}"
    # echo "$BODY" | jq '.'
    # echo ""

    return 0
}

# ==========================================
# Pre-flight Checks
# ==========================================

echo -e "${BLUE}Step 1: Health Check${NC}"
HEALTH=$(curl -s "${AI_SERVICE_URL}/health" 2>&1)
HEALTH_STATUS=$?

if [ $HEALTH_STATUS -ne 0 ]; then
    echo -e "${RED}❌ AI Service is not running at ${AI_SERVICE_URL}${NC}"
    echo ""
    echo -e "${YELLOW}To start the AI service:${NC}"
    echo "  cd packages/services/ai"
    echo "  pnpm install"
    echo "  pnpm build"
    echo "  pnpm start"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ AI Service is healthy${NC}"
echo "$HEALTH" | jq '.' 2>/dev/null
echo ""

# Check available tools
TOOLS_COUNT=$(echo "$HEALTH" | jq -r '.tools.registered' 2>/dev/null)
echo -e "${BLUE}Available Tools:${NC} ${GREEN}${TOOLS_COUNT}${NC}"
echo ""

# ==========================================
# Test Cases
# ==========================================

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Running Function Calling Tests                 ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Email Search (Single Tool)
test_function_calling \
    "Email Search - Single Tool" \
    "Search my emails from john@example.com in the last week" \
    "search_emails"

# Test 2: Calendar Query (Single Tool)
test_function_calling \
    "Calendar Events - Single Tool" \
    "What meetings do I have tomorrow?" \
    "get_calendar_events"

# Test 3: Task Creation (Single Tool)
test_function_calling \
    "Task Creation - Single Tool" \
    "Create a task to review the Q4 budget report with high priority, due next Friday" \
    "create_task"

# Test 4: Complex Multi-Tool Request
test_function_calling \
    "Multi-Tool Orchestration" \
    "Check my calendar for tomorrow and if I have any free time in the afternoon, create a task to review the marketing proposal" \
    "get_calendar_events,create_task"

# Test 5: Email Composition (Creative Task)
test_function_calling \
    "Email Composition - AI Writing" \
    "Compose a professional email to sarah@company.com thanking her for the demo and asking about pricing options" \
    "compose_email"

# Test 6: Task List Query with Filtering
test_function_calling \
    "Task Query with Filters" \
    "Show me all my high priority tasks that are pending" \
    "get_tasks"

# Test 7: Calendar Analysis
test_function_calling \
    "Calendar Load Analysis" \
    "Analyze my calendar for this week and tell me if I'm overbooked" \
    "get_calendar_events,analyze_calendar_load"

# Test 8: Meeting Time Finding
test_function_calling \
    "Find Meeting Times" \
    "Find a 30-minute slot this week for a meeting with alice@company.com and bob@company.com" \
    "find_meeting_times"

# Test 9: No Function Calling (Direct Response)
test_function_calling \
    "Direct Response - No Tools" \
    "What is the capital of France?" \
    ""

# Test 10: Error Handling (Non-existent service)
test_function_calling \
    "Error Handling Test" \
    "Search my emails for 'important'" \
    "search_emails"

# ==========================================
# Summary
# ==========================================

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ✅ Function Calling Tests Complete             ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Key Observations:${NC}"
echo ""
echo -e "1. ${BLUE}Tool Selection:${NC} Did the AI choose appropriate tools?"
echo -e "2. ${BLUE}Multi-Tool Orchestration:${NC} Can it chain multiple tools?"
echo -e "3. ${BLUE}Error Handling:${NC} Does it handle tool failures gracefully?"
echo -e "4. ${BLUE}Performance:${NC} Are execution times reasonable?"
echo -e "5. ${BLUE}Confidence Scores:${NC} Does confidence reflect success?"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo -e "• Check execution logs above for any failed tool calls"
echo -e "• Verify that expected tools were called for each request"
echo -e "• Review response quality and accuracy"
echo -e "• Test with your own specific use cases"
echo ""
echo -e "${CYAN}For detailed logs, check:${NC}"
echo -e "  packages/services/ai/logs/"
echo ""
