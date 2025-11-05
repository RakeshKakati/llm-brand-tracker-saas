#!/bin/bash
# RAG API Testing with curl
# Usage: ./test-rag-curl.sh

BASE_URL="${TEST_URL:-http://localhost:3000}"

echo "🚀 RAG API Testing with curl"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo ""

# Test data
TEST_DATA='{
  "brand": "kommi",
  "query": "best brand tracking tools",
  "user_email": "test@example.com",
  "user_id": "test-user-id"
}'

# Test 1: Standard checkMention endpoint
echo "📝 Test 1: Standard /api/checkMention endpoint"
echo "────────────────────────────────────────────────"
curl -X POST "$BASE_URL/api/checkMention" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response received (install jq for pretty JSON)"

echo ""
echo ""

# Test 2: Realtime endpoint
echo "📝 Test 2: Realtime /api/trackBrand/realtime endpoint"
echo "────────────────────────────────────────────────"
curl -X POST "$BASE_URL/api/trackBrand/realtime" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response received (install jq for pretty JSON)"

echo ""
echo "📊 Test Complete!"
echo ""
echo "💡 To enable RAG:"
echo "   1. Set ENABLE_RAG_TRACKING=true in .env.local"
echo "   2. Restart dev server"
echo "   3. Run tests again"

