#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Tide Development Environment${NC}"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
    echo ""
    echo "To start Docker:"
    echo "  - macOS: Open Docker Desktop"
    echo "  - Linux: sudo systemctl start docker"
    echo ""
    exit 1
fi

# Start infrastructure
echo -e "${BLUE}📦 Starting infrastructure (PostgreSQL, Redis, Kafka, etc.)...${NC}"
docker compose up -d

# Wait for services to be healthy
echo ""
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
until docker compose exec -T postgres pg_isready -U tide > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓${NC}"

# Check Redis
echo -n "Checking Redis... "
until docker compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓${NC}"

# Check Kafka
echo -n "Checking Kafka... "
until nc -z localhost 29092 > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}✅ Infrastructure is ready!${NC}"
echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  - Kafka UI:    http://localhost:8080"
echo "  - Prometheus:  http://localhost:9090"
echo "  - Grafana:     http://localhost:3001 (admin/admin)"
echo ""
echo -e "${BLUE}🗄️  Database:${NC}"
echo "  postgresql://tide:tide_dev_password@localhost:5432/tide"
echo ""
echo -e "${BLUE}🚀 Starting application services...${NC}"
echo ""
echo "Run these commands in separate terminals:"
echo ""
echo -e "${YELLOW}Terminal 1:${NC} pnpm --filter @tide/gateway dev"
echo -e "${YELLOW}Terminal 2:${NC} pnpm --filter @tide/auth-service dev"
echo ""
echo -e "${BLUE}Or use tmux/screen to run all in background${NC}"
echo ""
