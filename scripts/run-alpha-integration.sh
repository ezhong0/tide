#!/bin/bash
set -e

echo "🌊 Tide - Week 3 Alpha Integration Test"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
PASSED=0
FAILED=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $2${NC}"
        FAILED=$((FAILED + 1))
        if [ ! -z "$3" ]; then
            echo -e "${RED}   Error: $3${NC}"
        fi
    fi
}

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local max_attempts=30
    local attempt=0

    echo "⏳ Waiting for $service on $host:$port..."

    while [ $attempt -lt $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            echo -e "${GREEN}✅ $service is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done

    echo -e "${RED}❌ Timeout waiting for $service${NC}"
    return 1
}

echo "Step 1: Check Docker"
echo "===================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo ""
    echo "Please start Docker Desktop:"
    echo "  macOS: open -a Docker"
    echo "  Linux: sudo systemctl start docker"
    echo ""
    exit 1
fi

print_status 0 "Docker is running"
echo ""

echo "Step 2: Start Infrastructure"
echo "============================"

# Check if services are already running
if docker ps | grep -q tide-postgres; then
    print_status 0 "Infrastructure already running"
else
    echo "Starting PostgreSQL, Redis, Kafka..."
    docker compose up -d postgres redis zookeeper kafka 2>&1 | grep -v "the attribute"

    # Wait for services
    wait_for_service localhost 5432 "PostgreSQL" || exit 1
    wait_for_service localhost 6379 "Redis" || exit 1
    wait_for_service localhost 9092 "Kafka" || exit 1

    print_status 0 "Infrastructure started"
fi
echo ""

echo "Step 3: Verify Database Connection"
echo "==================================="

# Test PostgreSQL connection
if docker exec -it tide-postgres psql -U tide -d tide -c "SELECT 1" > /dev/null 2>&1; then
    print_status 0 "PostgreSQL connection successful"
else
    print_status 1 "PostgreSQL connection failed"
    exit 1
fi
echo ""

echo "Step 4: Check Database Migrations"
echo "=================================="

# Check if workflow tables exist
TABLE_COUNT=$(docker exec -it tide-postgres psql -U tide -d tide -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'tide' AND table_name IN ('workflows', 'tasks', 'user_behaviors', 'detected_patterns')" 2>/dev/null | tr -d '[:space:]')

if [ "$TABLE_COUNT" -eq "4" ]; then
    print_status 0 "Workflow tables exist (migrations already applied)"
else
    echo "⚠️  Some workflow tables missing. Need to run migrations:"
    echo "   pnpm db:migrate"
    echo ""
    echo "Or manually:"
    echo "   docker exec -i tide-postgres psql -U tide -d tide < packages/libraries/database/migrations/006_workflow_tables.sql"
    echo "   docker exec -i tide-postgres psql -U tide -d tide < packages/libraries/database/migrations/007_task_tables.sql"
    echo "   docker exec -i tide-postgres psql -U tide -d tide < packages/libraries/database/migrations/008_pattern_tables.sql"
    echo ""
fi
echo ""

echo "Step 5: Build Workflow Service"
echo "==============================="

cd packages/services/workflow

if [ ! -d "dist" ]; then
    echo "Building workflow service..."
    if pnpm build > /dev/null 2>&1; then
        print_status 0 "Workflow service built successfully"
    else
        print_status 1 "Workflow service build failed"
        exit 1
    fi
else
    print_status 0 "Workflow service already built"
fi

cd ../../..
echo ""

echo "Step 6: Test Workflow Service"
echo "=============================="

# Check if service is running
if curl -s http://localhost:3004/health > /dev/null 2>&1; then
    print_status 0 "Workflow service is running"

    # Get health status
    HEALTH_STATUS=$(curl -s http://localhost:3004/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        print_status 0 "Health check: $HEALTH_STATUS"
    else
        print_status 1 "Health check: $HEALTH_STATUS"
    fi
else
    echo "⚠️  Workflow service not running. To start:"
    echo "   cd packages/services/workflow"
    echo "   pnpm dev"
    echo ""
fi
echo ""

echo "Step 7: Run Integration Tests"
echo "=============================="

cd packages/services/workflow

echo "Running Week 3 Alpha integration tests..."
if pnpm test src/__tests__/integration/week3-alpha.test.ts 2>&1; then
    print_status 0 "Integration tests passed"
else
    print_status 1 "Integration tests failed" "See test output above"
fi

cd ../../..
echo ""

echo "========================================"
echo "📊 Alpha Integration Results"
echo "========================================"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Week 3 Alpha Integration: READY${NC}"
    echo ""
    echo "🎉 Track 4 (Task & Workflow) is ready for alpha testing!"
    echo ""
    echo "Next steps:"
    echo "  • Integration with Track 2 (AI Intelligence)"
    echo "  • Integration with Track 3 (Email & Calendar)"
    echo "  • GraphQL Federation setup"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Week 3 Alpha Integration: INCOMPLETE${NC}"
    echo ""
    echo "Please resolve the failures above before proceeding."
    echo ""
    exit 1
fi
