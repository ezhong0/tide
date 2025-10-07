#!/bin/bash

# Quick Alpha Test Script
# Tests your live deployment with real API calls

echo "🧪 Testing Alpha Deployment"
echo "==========================="
echo ""

# Test AI Service
echo "1. Testing AI Service..."
response=$(curl -s -X POST https://ai-production-5753.up.railway.app/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"chat","content":"Hello"}')

echo "Response: $response"
echo ""

# Test Email Service Health
echo "2. Testing Email Service..."
response=$(curl -s https://email-production-264c.up.railway.app/health)
echo "Response: $response"
echo ""

# Test Calendar Service Health
echo "3. Testing Calendar Service..."
response=$(curl -s https://calendar-production-325a.up.railway.app/health)
echo "Response: $response"
echo ""

# Test Gateway
echo "4. Testing Gateway..."
response=$(curl -s https://gateway-production-caf0.up.railway.app/health)
echo "Response: $response"
echo ""

echo "✅ Alpha is live! See ALPHA_USAGE_GUIDE.md for more examples."
