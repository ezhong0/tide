#!/bin/bash
# Deploy all services to Railway

set -e

ROOT_DIR="/Users/edwardzhong/Projects/tide"
SERVICES=("email" "calendar" "workflow" "mobile-bff" "ai" "actions" "decisions" "intelligence")

echo "🚀 Deploying all services to Railway..."

for service in "${SERVICES[@]}"; do
  service_dir="$ROOT_DIR/packages/services/$service"

  if [ -f "$service_dir/railway.json" ]; then
    echo "📦 Deploying $service..."
    (cd "$service_dir" && railway up --service "$service" 2>&1 | tail -3) &
  else
    echo "⚠️  No railway.json found for $service, skipping..."
  fi
done

# Wait for all deployments to complete
wait

echo "✅ All services deployed to Railway!"
echo ""
echo "To check deployment status:"
echo "  railway status"
echo ""
echo "To view logs:"
echo "  railway logs --service <service-name>"
