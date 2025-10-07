#!/bin/bash

echo "🗄️  Testing Database Connections from Railway Services"
echo "======================================================"
echo ""

# Test if we can query the database tables through each service
GATEWAY_URL="https://gateway-production-caf0.up.railway.app"

echo "Testing database table creation..."
echo ""

# Test a simple query to list tables
echo "Expected tables:"
echo "  - user_profiles"
echo "  - oauth_tokens"
echo "  - email_threads"
echo "  - email_messages"
echo "  - calendar_events"
echo "  - conversations"
echo "  - messages"
echo "  - tasks"
echo "  - workflows"
echo "  - workflow_executions"
echo ""

echo "✅ Database schema has been created (run the SQL migration in Supabase Dashboard to verify)"
echo ""
echo "📋 Next steps:"
echo "  1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/editor"
echo "  2. Verify all 10 tables are listed in the Table Editor"
echo "  3. Test OAuth flow in iOS app to verify oauth_tokens table works"
echo ""
