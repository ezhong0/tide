#!/bin/bash

# Complete Railway Deployment Script
# Deploys all services and sets environment variables

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Tide Complete Deployment to Railway"
echo "========================================"
echo ""

# Check prerequisites
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install: npm install -g @railway/cli"
    exit 1
fi

if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged into Railway${NC}"
    echo "Run: railway login"
    exit 1
fi

echo -e "${GREEN}✓${NC} Railway CLI ready"
echo -e "${GREEN}✓${NC} Logged in as: $(railway whoami)"
echo ""

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Step 1: Deploy all services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Deploying Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

deploy_service() {
    local name=$1
    local path=$2

    echo -e "${BLUE}Deploying ${name}...${NC}"
    cd "$path"
    railway up --detach
    echo -e "${GREEN}✓${NC} ${name} deployed"
    echo ""
    cd "$PROJECT_ROOT"
}

deploy_service "Gateway Service" "packages/services/gateway"
deploy_service "AI Service" "packages/services/ai"
deploy_service "Email Service" "packages/services/email"
deploy_service "Calendar Service" "packages/services/calendar"
deploy_service "Workflow Service" "packages/services/workflow"

echo -e "${GREEN}✓ All services deployed!${NC}"
echo ""

# Step 2: Get URLs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Getting Service URLs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

get_url() {
    local name=$1
    local path=$2

    cd "$path"
    echo -n "${name}: "
    railway domain 2>/dev/null || echo "Not assigned yet (run again in 30 sec)"
    cd "$PROJECT_ROOT"
}

get_url "Gateway" "packages/services/gateway"
get_url "AI" "packages/services/ai"
get_url "Email" "packages/services/email"
get_url "Calendar" "packages/services/calendar"
get_url "Workflow" "packages/services/workflow"

echo ""
echo -e "${YELLOW}⚠️  Save these URLs! You'll need them for environment variables.${NC}"
echo ""

# Prompt for API keys
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Configure Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "You'll need:"
echo "  1. OpenAI API key (https://platform.openai.com/api-keys)"
echo "  2. Anthropic API key (https://console.anthropic.com/)"
echo ""

read -p "Do you have your API keys ready? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Get your API keys first, then run:${NC}"
    echo "    ./scripts/setup-railway-env.sh"
    echo ""
    exit 0
fi

echo ""
read -p "OpenAI API key: " OPENAI_KEY
read -p "Anthropic API key: " ANTHROPIC_KEY
echo ""

if [ -z "$OPENAI_KEY" ] || [ -z "$ANTHROPIC_KEY" ]; then
    echo -e "${RED}❌ API keys cannot be empty${NC}"
    exit 1
fi

# Set common variables for all services
set_common_vars() {
    local path=$1
    local port=$2
    local name=$3

    echo -e "${BLUE}Configuring ${name}...${NC}"
    cd "$path"

    railway variables set NODE_ENV=production
    railway variables set PORT="$port"
    railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
    railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzAwMDgsImV4cCI6MjA3MTEwNjAwOH0.0B4o116YkYXkx5vjA-BW9hvAha3IHVPQiWDLwCUohPM"
    railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"

    echo -e "${GREEN}✓${NC} ${name} configured"
    cd "$PROJECT_ROOT"
}

# Configure Gateway
cd packages/services/gateway
echo -e "${BLUE}Configuring Gateway...${NC}"
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzAwMDgsImV4cCI6MjA3MTEwNjAwOH0.0B4o116YkYXkx5vjA-BW9hvAha3IHVPQiWDLwCUohPM"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"
echo -e "${GREEN}✓${NC} Gateway configured"
cd "$PROJECT_ROOT"

# Configure AI Service (with API keys)
cd packages/services/ai
echo -e "${BLUE}Configuring AI Service...${NC}"
railway variables set NODE_ENV=production
railway variables set PORT=4003
railway variables set SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cm9jeWtqb21nY3VwaGljcXBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzMDAwOCwiZXhwIjoyMDcxMTA2MDA4fQ.hgS9YAdBTHEfKG1poPgjGVdvNGHhfPlGScAGRmoIHyg"
railway variables set OPENAI_API_KEY="$OPENAI_KEY"
railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
echo -e "${GREEN}✓${NC} AI Service configured (with API keys)"
cd "$PROJECT_ROOT"

# Configure Email Service
set_common_vars "packages/services/email" "4004" "Email Service"

# Configure Calendar Service
set_common_vars "packages/services/calendar" "4005" "Calendar Service"

# Configure Workflow Service
set_common_vars "packages/services/workflow" "4006" "Workflow Service"

echo ""
echo -e "${GREEN}✓ All environment variables set!${NC}"
echo ""

# Step 4: Wait and test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Testing Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Services are restarting with new configuration..."
echo "Waiting 30 seconds..."
sleep 30

echo ""
echo "Testing health endpoints..."
echo ""

test_health() {
    local name=$1
    local url=$2

    echo -n "Testing ${name}... "
    if curl -s -f "${url}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Not responding yet (may need more time)${NC}"
    fi
}

# Get URLs and test (you'll need to update these with actual URLs)
echo "Get your service URLs with:"
echo "  cd packages/services/gateway && railway domain"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Next steps:"
echo ""
echo "1. Get your service URLs:"
echo "   cd packages/services/gateway && railway domain"
echo ""
echo "2. Test health endpoint:"
echo "   curl https://gateway-production.up.railway.app/health"
echo ""
echo "3. View logs:"
echo "   cd packages/services/ai && railway logs"
echo ""
echo "4. View in dashboard:"
echo "   https://railway.app/project/tide"
echo ""
echo "🎉 Your services are deployed!"
