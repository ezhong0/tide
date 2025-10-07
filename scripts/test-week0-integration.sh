#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌊 Week 0 Foundation Integration Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

FAILED_TESTS=0
PASSED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -e "${BLUE}Testing:${NC} $test_name"

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} $test_name"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} $test_name"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Test 1: PostgreSQL
echo -e "\n${YELLOW}━━━ Database Tests ━━━${NC}"
run_test "PostgreSQL is running" \
    "docker exec -it tide-postgres psql -U tide -d tide -c 'SELECT 1' 2>&1"

run_test "PostgreSQL has tide schema" \
    "docker exec -it tide-postgres psql -U tide -d tide -c \"SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'tide'\" | grep -q tide"

run_test "Database has at least 11 tables" \
    "[ \$(docker exec -it tide-postgres psql -U tide -d tide -t -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'tide';\" | tr -d ' \r\n') -ge 11 ]"

run_test "users table exists" \
    "docker exec -it tide-postgres psql -U tide -d tide -c \"SELECT 1 FROM tide.users LIMIT 0\" 2>&1"

run_test "conversations table exists" \
    "docker exec -it tide-postgres psql -U tide -d tide -c \"SELECT 1 FROM tide.conversations LIMIT 0\" 2>&1"

run_test "events table exists" \
    "docker exec -it tide-postgres psql -U tide -d tide -c \"SELECT 1 FROM tide.events LIMIT 0\" 2>&1"

run_test "outbox table exists" \
    "docker exec -it tide-postgres psql -U tide -d tide -c \"SELECT 1 FROM tide.outbox LIMIT 0\" 2>&1"

# Test 2: Redis
echo -e "\n${YELLOW}━━━ Cache Tests ━━━${NC}"
run_test "Redis is running" \
    "docker exec -it tide-redis redis-cli ping | grep -q PONG"

run_test "Redis can SET and GET" \
    "docker exec -it tide-redis redis-cli SET test_key test_value && docker exec -it tide-redis redis-cli GET test_key | grep -q test_value"

run_test "Redis can DELETE" \
    "docker exec -it tide-redis redis-cli DEL test_key"

# Test 3: Kafka
echo -e "\n${YELLOW}━━━ Event Bus Tests ━━━${NC}"
run_test "Kafka is running" \
    "docker exec -it tide-kafka kafka-topics --list --bootstrap-server localhost:9092"

run_test "Zookeeper is running" \
    "docker ps | grep -q tide-zookeeper"

# Test 4: Monitoring
echo -e "\n${YELLOW}━━━ Monitoring Tests ━━━${NC}"
run_test "Kafka UI is accessible" \
    "curl -f http://localhost:8080 -s -o /dev/null"

run_test "Prometheus is accessible" \
    "curl -f http://localhost:9090 -s -o /dev/null"

run_test "Grafana is accessible" \
    "curl -f http://localhost:3001 -s -o /dev/null"

# Test 5: Packages
echo -e "\n${YELLOW}━━━ Package Tests ━━━${NC}"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ FAIL${NC} pnpm is not installed"
    ((FAILED_TESTS++))
else
    echo -e "${GREEN}✅ PASS${NC} pnpm is installed"
    ((PASSED_TESTS++))

    # Test package builds (only if pnpm is available)
    run_test "All packages build successfully" \
        "pnpm build"

    run_test "@tide/config package exists" \
        "[ -d packages/shared/config ]"

    run_test "@tide/types package exists" \
        "[ -d packages/shared/types ]"

    run_test "@tide/errors package exists" \
        "[ -d packages/shared/errors ]"

    run_test "@tide/validation package exists" \
        "[ -d packages/shared/validation ]"

    run_test "@tide/contracts package exists" \
        "[ -d packages/shared/contracts ]"

    run_test "@tide/logger library exists" \
        "[ -d packages/libraries/logger ]"

    run_test "@tide/database library exists" \
        "[ -d packages/libraries/database ]"

    run_test "@tide/mocks library exists" \
        "[ -d packages/libraries/mocks ]"
fi

# Test 6: Service Templates
echo -e "\n${YELLOW}━━━ Service Template Tests ━━━${NC}"
run_test "Auth service template exists" \
    "[ -f packages/services/auth/package.json ]"

run_test "API Gateway template exists" \
    "[ -f packages/services/gateway/package.json ]"

# Test 7: Environment
echo -e "\n${YELLOW}━━━ Environment Tests ━━━${NC}"
run_test ".env.example exists" \
    "[ -f .env.example ]"

run_test "docker-compose.yml exists" \
    "[ -f docker-compose.yml ]"

run_test "package.json exists" \
    "[ -f package.json ]"

run_test "pnpm-workspace.yaml exists" \
    "[ -f pnpm-workspace.yaml ]"

# Test 8: Documentation
echo -e "\n${YELLOW}━━━ Documentation Tests ━━━${NC}"
run_test "README.md exists" \
    "[ -f README.md ]"

run_test "docs/planning directory exists" \
    "[ -d docs/planning ]"

run_test "docs/architecture directory exists" \
    "[ -d docs/architecture ]"

run_test "docs/guides directory exists" \
    "[ -d docs/guides ]"

run_test "docs/tracks directory exists" \
    "[ -d docs/tracks ]"

run_test "Integration milestones document exists" \
    "[ -f docs/tracks/integration-milestones.md ]"

# Test 9: Scripts
echo -e "\n${YELLOW}━━━ Script Tests ━━━${NC}"
run_test "dev-start.sh exists and is executable" \
    "[ -x scripts/dev-start.sh ]"

run_test "dev-stop.sh exists and is executable" \
    "[ -x scripts/dev-stop.sh ]"

run_test "dev-reset.sh exists and is executable" \
    "[ -x scripts/dev-reset.sh ]"

run_test "db-migrate.sh exists and is executable" \
    "[ -x scripts/db-migrate.sh ]"

run_test "check-health.sh exists and is executable" \
    "[ -x scripts/check-health.sh ]"

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Passed:${NC} $PASSED_TESTS"
echo -e "${RED}❌ Failed:${NC} $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Week 0 Foundation: READY FOR PARALLEL TRACK DEVELOPMENT${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Tracks can start building their services"
    echo "  2. Use Auth service template as reference"
    echo "  3. Use API Gateway template for GraphQL"
    echo "  4. See docs/tracks/ for track requirements"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Week 0 Foundation: ISSUES FOUND${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. Run: pnpm dev:start"
    echo "  2. Run: pnpm db:migrate"
    echo "  3. Run: pnpm install"
    echo "  4. Run: pnpm build"
    echo "  5. Check Docker: docker ps"
    echo "  6. See: README.md troubleshooting section"
    echo ""
    exit 1
fi
