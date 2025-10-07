#!/bin/bash

echo "🔑 Railway Environment Variables Verification"
echo "============================================"
echo ""

# Critical variables to check for each service
CRITICAL_VARS=(
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "ANTHROPIC_API_KEY"
  "OPENAI_API_KEY"
)

SERVICES=("gateway" "ai" "email" "calendar")

for service in "${SERVICES[@]}"; do
  echo "=== $service Service ==="

  # Get all variables for this service
  vars_output=$(railway variables --service "$service" 2>&1)

  # Check each critical variable
  for var in "${CRITICAL_VARS[@]}"; do
    if echo "$vars_output" | grep -q "$var"; then
      echo "  ✅ $var"
    else
      echo "  ❌ $var (MISSING)"
    fi
  done

  # Service-specific checks
  if [ "$service" = "email" ] || [ "$service" = "calendar" ]; then
    if echo "$vars_output" | grep -q "GOOGLE_CLIENT_ID"; then
      echo "  ✅ GOOGLE_CLIENT_ID"
    else
      echo "  ❌ GOOGLE_CLIENT_ID (MISSING)"
    fi

    if echo "$vars_output" | grep -q "GOOGLE_CLIENT_SECRET"; then
      echo "  ✅ GOOGLE_CLIENT_SECRET"
    else
      echo "  ❌ GOOGLE_CLIENT_SECRET (MISSING)"
    fi
  fi

  echo ""
done

echo "✅ Environment variable verification complete"
