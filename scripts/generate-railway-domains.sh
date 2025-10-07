#!/bin/bash

# Generate Railway domains for all services

echo "🌐 Generating Railway domains for all services..."
echo ""

for service in ai email calendar workflow gateway; do
    echo "=== $service ==="

    # Generate domain (this will prompt if one doesn't exist)
    railway domain --service $service 2>&1 || echo "  Failed or already exists"

    echo ""
done

echo ""
echo "✅ Domain generation complete"
echo ""
echo "Now fetching service URLs..."
echo ""

# Try to get status for each
for service in ai email calendar workflow gateway; do
    echo "=== $service ==="
    railway status --service $service 2>&1 | grep -i "domain\|url" || echo "  No URL found"
    echo ""
done
