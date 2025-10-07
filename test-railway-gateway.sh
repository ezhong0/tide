#!/bin/bash

echo "Testing gateway from Railway deployment..."
echo ""

# Click on Deploy Logs tab in Railway to see this:
echo "In Railway Dashboard:"
echo "1. Go to gateway service"
echo "2. Click 'Deploy Logs' tab (not HTTP Logs)"
echo "3. Look for startup errors"
echo ""

echo "Check these things:"
echo "  ✓ Build succeeded?"
echo "  ✓ Start command running: node packages/services/gateway/dist/index.js"
echo "  ✓ Any error messages in logs?"
echo ""

echo "Common issues:"
echo "  - Missing PORT env var (Railway sets this automatically)"
echo "  - Missing node_modules (check build logs)"
echo "  - Import errors (check deploy logs for 'Cannot find module')"
echo ""

echo "Testing gateway directly (if you can see the URL)..."
timeout 5 curl -v https://gateway-production-caf0.up.railway.app/health 2>&1 | grep -E "Connection|HTTP|refused" || echo "Connection test complete"
