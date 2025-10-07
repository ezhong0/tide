#!/bin/bash

# Railway Environment Variables Setup Script
# Sets environment variables for all Tide services

set -e

echo "🔧 Railway Environment Setup"
echo "============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Check if .env exists
if [ ! -f "${PROJECT_ROOT}/.env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Create .env with your credentials first"
    exit 1
fi

echo "Loading environment variables from .env..."
source "${PROJECT_ROOT}/.env"

# Function to set env vars for a service
setup_service_env() {
    local service_name=$1
    local service_path=$2
    local service_port=$3

    echo ""
    echo "───────────────────────────────────────"
    echo -e "${BLUE}Setting up: ${service_name}${NC}"
    echo "───────────────────────────────────────"

    cd "${service_path}"

    # Common variables for all services
    echo "Setting common variables..."
    railway variables set NODE_ENV=production
    railway variables set PORT="${service_port}"
    railway variables set SUPABASE_URL="${SUPABASE_URL}"
    railway variables set SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
    railway variables set SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

    # Service-specific variables
    case "${service_name}" in
        "AI Service")
            echo "Setting AI-specific variables..."
            railway variables set OPENAI_API_KEY="${OPENAI_API_KEY}"
            railway variables set ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
            ;;
        "Gateway Service")
            echo "Setting Gateway-specific variables..."
            railway variables set AI_SERVICE_URL="${AI_SERVICE_URL:-http://ai-service:4003}"
            railway variables set EMAIL_SERVICE_URL="${EMAIL_SERVICE_URL:-http://email-service:4004}"
            railway variables set CALENDAR_SERVICE_URL="${CALENDAR_SERVICE_URL:-http://calendar-service:4005}"
            railway variables set WORKFLOW_SERVICE_URL="${WORKFLOW_SERVICE_URL:-http://workflow-service:4006}"
            ;;
    esac

    echo -e "${GREEN}✓${NC} Environment variables set for ${service_name}"

    cd - > /dev/null
}

echo ""
echo "This will set environment variables for all services"
echo -e "${YELLOW}⚠${NC}  Make sure you've deployed the services first"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Set up each service
setup_service_env "Gateway Service" "${PROJECT_ROOT}/packages/services/gateway" "4000"
setup_service_env "AI Service" "${PROJECT_ROOT}/packages/services/ai" "4003"
setup_service_env "Email Service" "${PROJECT_ROOT}/packages/services/email" "4004"
setup_service_env "Calendar Service" "${PROJECT_ROOT}/packages/services/calendar" "4005"
setup_service_env "Workflow Service" "${PROJECT_ROOT}/packages/services/workflow" "4006"

echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}✓ All environment variables set!${NC}"
echo "═══════════════════════════════════════"
echo ""

echo "Next steps:"
echo "1. Restart services: railway restart"
echo "2. View logs: railway logs"
echo "3. Test health endpoints"
echo ""

echo "Test health checks:"
echo "  curl https://<gateway-url>/health"
echo "  curl https://<ai-url>/health"
echo ""

echo "View variables:"
echo "  cd packages/services/ai"
echo "  railway variables"
echo ""
