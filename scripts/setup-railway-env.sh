#!/bin/bash

# Railway Environment Setup Script
# Configures all services with required environment variables

set -e

echo "🚂 Railway Environment Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install: npm i -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo "Run: railway login"
    exit 1
fi

# Load local .env if exists
if [ -f "${PROJECT_ROOT}/.env" ]; then
    echo -e "${GREEN}✓ Loading .env file${NC}"
    export $(cat "${PROJECT_ROOT}/.env" | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠ No .env file found, using environment variables${NC}"
fi

# Verify required variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
    echo "Set in .env or export OPENAI_API_KEY=sk-..."
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ SUPABASE_URL not set${NC}"
    echo "Set in .env or export SUPABASE_URL=https://..."
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    echo "Set in .env or export SUPABASE_SERVICE_ROLE_KEY=..."
    exit 1
fi

echo ""
echo "📋 Configuration Summary"
echo "================================"
echo "SUPABASE_URL: ${SUPABASE_URL:0:40}..."
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}..."
echo ""

# Function to set variables for a service
set_service_vars() {
    local service=$1
    shift
    local vars=("$@")

    echo -e "${YELLOW}⚙️  Configuring $service service...${NC}"

    cd "${PROJECT_ROOT}/packages/services/$service" 2>/dev/null || cd "${PROJECT_ROOT}/packages/services/gateway" 2>/dev/null

    for var in "${vars[@]}"; do
        IFS='=' read -r key value <<< "$var"
        echo "  Setting $key..."
        if railway variables set "$key=$value" 2>&1 | grep -qi "error"; then
            echo -e "${RED}  ❌ Failed to set $key${NC}"
        else
            echo -e "${GREEN}  ✓ $key set${NC}"
        fi
    done

    cd "${PROJECT_ROOT}" > /dev/null
    echo ""
}

# Configure AI Service
echo "🤖 AI Service"
echo "================================"
set_service_vars "ai" \
    "NODE_ENV=production" \
    "PORT=8080" \
    "OPENAI_API_KEY=$OPENAI_API_KEY" \
    "SUPABASE_URL=$SUPABASE_URL" \
    "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
    "LOG_LEVEL=info" \
    "ENABLE_REASONING=true" \
    "ENABLE_LEARNING=true"

# Configure Email Service
echo "📧 Email Service"
echo "================================"
set_service_vars "email" \
    "NODE_ENV=production" \
    "PORT=8080" \
    "SUPABASE_URL=$SUPABASE_URL" \
    "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
    "LOG_LEVEL=info" \
    "ENABLE_SMART_COMPOSE=true" \
    "ENABLE_RELATIONSHIP_TRACKING=true"

# Configure Calendar Service
echo "📅 Calendar Service"
echo "================================"
set_service_vars "calendar" \
    "NODE_ENV=production" \
    "PORT=8080" \
    "SUPABASE_URL=$SUPABASE_URL" \
    "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
    "LOG_LEVEL=info" \
    "ENABLE_SMART_SCHEDULING=true"

# Configure Workflow Service
echo "⚡ Workflow Service"
echo "================================"
set_service_vars "workflow" \
    "NODE_ENV=production" \
    "PORT=8080" \
    "SUPABASE_URL=$SUPABASE_URL" \
    "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
    "LOG_LEVEL=info" \
    "ENABLE_WORKFLOW_ENGINE=true"

echo ""
echo "🔍 Discovering Service URLs..."
echo "================================"

# Get service URLs from Railway (using railway service command)
get_service_url() {
    local service=$1
    cd "${PROJECT_ROOT}/packages/services/$service" 2>/dev/null || cd "${PROJECT_ROOT}/packages/services/gateway" 2>/dev/null

    # Try to get URL from railway status
    local url=$(railway status 2>/dev/null | grep -i "url" | awk '{print $NF}' || echo "")

    cd "${PROJECT_ROOT}" > /dev/null

    if [ -n "$url" ]; then
        echo "$url"
    else
        # Fallback to Railway internal DNS
        echo "http://$service:8080"
    fi
}

AI_URL=$(get_service_url "ai")
EMAIL_URL=$(get_service_url "email")
CALENDAR_URL=$(get_service_url "calendar")
WORKFLOW_URL=$(get_service_url "workflow")

echo -e "${GREEN}✓ AI service: $AI_URL${NC}"
echo -e "${GREEN}✓ Email service: $EMAIL_URL${NC}"
echo -e "${GREEN}✓ Calendar service: $CALENDAR_URL${NC}"
echo -e "${GREEN}✓ Workflow service: $WORKFLOW_URL${NC}"
echo ""

# Configure Gateway Service
echo "🌐 Gateway Service"
echo "================================"

# Generate JWT secret if not set
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${YELLOW}⚠ Generated new JWT_SECRET${NC}"
fi

set_service_vars "gateway" \
    "NODE_ENV=production" \
    "PORT=8080" \
    "SUPABASE_URL=$SUPABASE_URL" \
    "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
    "JWT_SECRET=$JWT_SECRET" \
    "AI_SERVICE_URL=$AI_URL" \
    "EMAIL_SERVICE_URL=$EMAIL_URL" \
    "CALENDAR_SERVICE_URL=$CALENDAR_URL" \
    "WORKFLOW_SERVICE_URL=$WORKFLOW_URL" \
    "LOG_LEVEL=info" \
    "CORS_ORIGIN=*"

echo ""
echo "🔄 Restarting Services..."
echo "================================"

# Restart all services
for service in ai email calendar workflow gateway; do
    echo -e "${YELLOW}⚙️  Restarting $service...${NC}"
    cd "${PROJECT_ROOT}/packages/services/$service" 2>/dev/null || cd "${PROJECT_ROOT}/packages/services/gateway" 2>/dev/null

    if railway restart 2>&1 | grep -qi "error"; then
        echo -e "${RED}❌ Failed to restart $service${NC}"
    else
        echo -e "${GREEN}✓ $service restarted${NC}"
    fi

    cd "${PROJECT_ROOT}" > /dev/null
    sleep 2
done

echo ""
echo "⏳ Waiting for services to start (30s)..."
sleep 30

echo ""
echo "🏥 Health Checks"
echo "================================"

# Get gateway URL for health checks
cd "${PROJECT_ROOT}/packages/services/gateway"
GATEWAY_URL=$(railway status 2>/dev/null | grep -i "url" | awk '{print $NF}' || echo "")
cd "${PROJECT_ROOT}" > /dev/null

if [ -n "$GATEWAY_URL" ]; then
    echo "Gateway URL: $GATEWAY_URL"
    echo ""

    # Check health endpoints
    for endpoint in "/health" "/api/ai/health" "/api/email/health" "/api/calendar/health" "/api/workflow/health"; do
        echo -n "  $endpoint: "
        if curl -sf "$GATEWAY_URL$endpoint" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Healthy${NC}"
        else
            echo -e "${RED}✗ Unhealthy (may still be starting)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠ Gateway URL not available yet${NC}"
    echo "Check status with: cd packages/services/gateway && railway status"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo "================================"
echo ""
echo "📊 Next Steps:"
echo "1. Verify services:"
echo "   cd packages/services/<service> && railway status"
echo ""
echo "2. Check logs:"
echo "   cd packages/services/<service> && railway logs"
echo ""
echo "3. Get gateway URL:"
echo "   cd packages/services/gateway && railway status"
echo ""
echo "4. Update mobile apps with gateway URL"
echo ""
echo "🔗 Useful Commands:"
echo "  cd packages/services/ai && railway logs      # View AI service logs"
echo "  cd packages/services/gateway && railway logs # View gateway logs"
echo "  railway list                                  # List all services"
echo ""
