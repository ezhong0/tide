#!/bin/bash
# Deploy Tide services to Railway
# Usage: ./scripts/deploy-to-railway.sh [service-name] or ./scripts/deploy-to-railway.sh all

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Tide Alpha - Railway Deployment${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Error: Railway CLI not installed${NC}"
    echo "Install with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Railway${NC}"
    echo "Login with: railway login"
    exit 1
fi

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2

    echo -e "${BLUE}Deploying ${service_name}...${NC}"

    # Link to Railway project
    cd "$service_path"

    # Deploy
    railway up --service "$service_name" --detach

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${service_name} deployed successfully${NC}"
    else
        echo -e "${RED}✗ ${service_name} deployment failed${NC}"
        return 1
    fi

    cd - > /dev/null
    echo ""
}

# Function to verify service health
check_health() {
    local service_name=$1
    local service_url=$2

    echo -e "${BLUE}Checking ${service_name} health...${NC}"

    # Wait for deployment to stabilize
    sleep 10

    # Check health endpoint
    if curl -f -s "${service_url}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ${service_name} is healthy${NC}"
    else
        echo -e "${RED}⚠ ${service_name} health check failed (may still be deploying)${NC}"
    fi
    echo ""
}

# Services to deploy
SERVICE_NAME=${1:-all}

if [ "$SERVICE_NAME" == "all" ]; then
    echo -e "${BLUE}Deploying all services...${NC}"
    echo ""

    # Deploy services in order
    deploy_service "ai" "./packages/services/ai"
    deploy_service "email" "./packages/services/email"
    deploy_service "calendar" "./packages/services/calendar"
    deploy_service "workflow" "./packages/services/workflow"
    deploy_service "gateway" "./packages/services/gateway"

    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}   All services deployed!${NC}"
    echo -e "${GREEN}===========================================${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Verify services are healthy in Railway dashboard"
    echo "2. Configure environment variables"
    echo "3. Run integration tests: pnpm test:integration"
    echo "4. Monitor logs: railway logs --service <service-name>"
    echo ""

elif [ "$SERVICE_NAME" == "ai" ]; then
    deploy_service "ai" "./packages/services/ai"

elif [ "$SERVICE_NAME" == "email" ]; then
    deploy_service "email" "./packages/services/email"

elif [ "$SERVICE_NAME" == "calendar" ]; then
    deploy_service "calendar" "./packages/services/calendar"

elif [ "$SERVICE_NAME" == "workflow" ]; then
    deploy_service "workflow" "./packages/services/workflow"

elif [ "$SERVICE_NAME" == "gateway" ]; then
    deploy_service "gateway" "./packages/services/gateway"

else
    echo -e "${RED}Error: Unknown service '${SERVICE_NAME}'${NC}"
    echo ""
    echo "Usage: ./scripts/deploy-to-railway.sh [service-name]"
    echo "Services: ai, email, calendar, workflow, gateway, all"
    exit 1
fi

echo -e "${GREEN}Deployment complete!${NC}"
