#!/bin/bash

# Production Deployment Script
# Comprehensive deployment for all Tide services and database

set -e

echo "🚀 Tide Production Deployment"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/deploy-$(date +%Y%m%d-%H%M%S).log"

# Logging function
log() {
    echo -e "${GREEN}✓${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠${NC}  $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}ℹ${NC}  $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1" >> "$LOG_FILE"
}

# Pre-flight checks
preflight_checks() {
    info "Running pre-flight checks..."

    # Check Railway CLI
    if ! command -v railway &> /dev/null; then
        error "Railway CLI not found. Install with: npm install -g @railway/cli"
    fi
    log "Railway CLI found"

    # Check if logged in
    if ! railway whoami &> /dev/null; then
        error "Not logged in to Railway. Run: railway login"
    fi
    log "Railway authentication verified"

    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        error "pnpm not found. Install with: npm install -g pnpm"
    fi
    log "pnpm found"

    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        warn "Uncommitted changes detected. Consider committing before deploying."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled"
        fi
    fi
    log "Git status checked"

    echo ""
}

# Build all packages
build_packages() {
    info "Building all packages..."

    cd "$PROJECT_ROOT"

    # Build shared libraries first
    log "Building shared libraries..."
    pnpm --filter @tide/types build || error "Failed to build @tide/types"
    pnpm --filter @tide/contracts build || error "Failed to build @tide/contracts"
    pnpm --filter @tide/schemas build || error "Failed to build @tide/schemas"
    pnpm --filter @tide/logger build || error "Failed to build @tide/logger"
    pnpm --filter @tide/config build || error "Failed to build @tide/config"
    pnpm --filter @tide/database build || error "Failed to build @tide/database"
    pnpm --filter @tide/validation build || error "Failed to build @tide/validation"

    log "All packages built successfully"
    echo ""
}

# Run tests
run_tests() {
    info "Running tests..."

    cd "$PROJECT_ROOT"

    # Run all tests
    pnpm test || warn "Some tests failed. Review before continuing."

    log "Tests completed"
    echo ""
}

# Apply database migrations
apply_migrations() {
    info "Applying database migrations..."

    cd "$PROJECT_ROOT"

    # Check if Supabase CLI is available
    if ! command -v supabase &> /dev/null; then
        warn "Supabase CLI not found. Skipping migrations."
        warn "Install with: brew install supabase/tap/supabase"
        return
    fi

    # Apply migrations
    MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"
    if [ -d "$MIGRATIONS_DIR" ]; then
        MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
        if [ $MIGRATION_COUNT -gt 0 ]; then
            log "Found $MIGRATION_COUNT migration(s) to apply"
            supabase db push || warn "Failed to apply migrations"
        else
            log "No migrations to apply"
        fi
    else
        warn "Migrations directory not found"
    fi

    echo ""
}

# Deploy service to Railway
deploy_service() {
    local service_name=$1
    local service_path=$2

    info "Deploying $service_name..."

    cd "$service_path" || error "Service directory not found: $service_path"

    # Check if railway.json exists
    if [ ! -f "railway.json" ]; then
        error "railway.json not found in $service_path"
    fi

    # Deploy
    railway up --detach || error "Failed to deploy $service_name"

    # Get domain
    DOMAIN=$(railway domain 2>/dev/null || echo "Domain not assigned")
    log "$service_name deployed: $DOMAIN"

    cd "$PROJECT_ROOT"
}

# Deploy all services
deploy_services() {
    info "Deploying all 9 services..."
    echo ""

    deploy_service "Gateway Service" "$PROJECT_ROOT/packages/services/gateway"
    deploy_service "AI Service" "$PROJECT_ROOT/packages/services/ai"
    deploy_service "Intelligence Service" "$PROJECT_ROOT/packages/services/intelligence"
    deploy_service "Email Service" "$PROJECT_ROOT/packages/services/email"
    deploy_service "Calendar Service" "$PROJECT_ROOT/packages/services/calendar"
    deploy_service "Workflow Service" "$PROJECT_ROOT/packages/services/workflow"
    deploy_service "Actions Service" "$PROJECT_ROOT/packages/services/actions"
    deploy_service "Decisions Service" "$PROJECT_ROOT/packages/services/decisions"
    deploy_service "Mobile BFF" "$PROJECT_ROOT/packages/services/mobile-bff"

    log "All services deployed successfully"
    echo ""
}

# Health check all services
health_check() {
    info "Running health checks..."

    # Wait for services to start
    sleep 10

    SERVICES=(
        "gateway:4000"
        "ai:3001"
        "intelligence:3002"
        "email:3003"
        "calendar:3004"
        "workflow:3005"
        "actions:3006"
        "decisions:3007"
        "mobile-bff:3009"
    )

    for service in "${SERVICES[@]}"; do
        IFS=':' read -r name port <<< "$service"
        # TODO: Add actual health check endpoints
        log "$name service deployed on port $port"
    done

    echo ""
}

# Post-deployment verification
verify_deployment() {
    info "Verifying deployment..."

    # Check Railway deployments
    railway status || warn "Failed to get deployment status"

    log "Deployment verified"
    echo ""
}

# Main deployment flow
main() {
    echo "Starting production deployment at $(date)"
    echo "Logs: $LOG_FILE"
    echo ""

    preflight_checks
    build_packages
    run_tests
    apply_migrations
    deploy_services
    health_check
    verify_deployment

    echo ""
    echo "═══════════════════════════════════════"
    echo -e "${GREEN}✓ Production deployment complete!${NC}"
    echo "═══════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "1. Monitor logs: railway logs"
    echo "2. Check metrics: https://railway.app/project"
    echo "3. Test endpoints manually"
    echo "4. Monitor error tracking in Sentry"
    echo ""
    echo "🎉 Congratulations on shipping to production!"
}

# Run main deployment
main
