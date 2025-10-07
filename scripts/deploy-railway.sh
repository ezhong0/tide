#!/bin/bash

# Railway Deployment Script
# Deploys all 5 Tide services to Railway

set -e

echo "🚀 Tide Railway Deployment Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✓${NC} Railway CLI found"

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Not logged in to Railway"
    echo "Running: railway login"
    railway login
fi

echo -e "${GREEN}✓${NC} Logged in to Railway"
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2

    echo "───────────────────────────────────────"
    echo "Deploying: ${service_name}"
    echo "───────────────────────────────────────"

    cd "${service_path}"

    # Check if railway.json exists
    if [ ! -f "railway.json" ]; then
        echo -e "${RED}❌ railway.json not found in ${service_path}${NC}"
        exit 1
    fi

    # Deploy
    echo "Running: railway up"
    railway up --detach

    # Get domain
    echo ""
    echo "Getting domain..."
    DOMAIN=$(railway domain 2>/dev/null || echo "Not assigned yet")
    echo -e "${GREEN}✓${NC} Deployed: ${DOMAIN}"
    echo ""

    cd - > /dev/null
}

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Project root: ${PROJECT_ROOT}"
echo ""

# Deploy services
echo "Starting deployment of 5 services..."
echo ""

deploy_service "Gateway Service" "${PROJECT_ROOT}/packages/services/gateway"
deploy_service "AI Service" "${PROJECT_ROOT}/packages/services/ai"
deploy_service "Email Service" "${PROJECT_ROOT}/packages/services/email"
deploy_service "Calendar Service" "${PROJECT_ROOT}/packages/services/calendar"
deploy_service "Workflow Service" "${PROJECT_ROOT}/packages/services/workflow"

echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}✓ All services deployed!${NC}"
echo "═══════════════════════════════════════"
echo ""

echo "Next steps:"
echo "1. Set environment variables for each service"
echo "2. Test health endpoints"
echo "3. Configure service-to-service URLs"
echo ""
echo "View deployments: https://railway.app/project/<your-project>"
echo ""
echo "Set env variables:"
echo "  cd packages/services/gateway"
echo "  railway variables set SUPABASE_URL=..."
echo ""
echo "View logs:"
echo "  cd packages/services/ai"
echo "  railway logs"
echo ""
