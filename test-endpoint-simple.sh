#!/bin/bash
# Simple endpoint test
# This tests if the server is actually running and routes are accessible

echo "🔍 Testing if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running on port 3000"
else
    echo "❌ Server is NOT running!"
    echo "💡 Start it with: npm run dev"
    exit 1
fi

echo ""
echo "🔍 Testing API endpoint structure..."
echo ""

# Test if checkMention exists by checking the actual response
echo "Testing /api/checkMention..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/checkMention \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "kommi",
    "query": "test query",
    "user_email": "test@example.com",
    "user_id": "test-id"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response body:"
echo "$BODY" | head -20

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ Endpoint works! Status 200"
elif [ "$HTTP_CODE" = "404" ]; then
    echo ""
    echo "❌ Endpoint not found (404)"
    echo "💡 The route might not be loaded. Try:"
    echo "   1. Restart dev server: Stop and run 'npm run dev' again"
    echo "   2. Check if route file exists: ls src/app/api/checkMention/route.ts"
    echo "   3. Check for syntax errors in the route file"
elif [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    echo ""
    echo "✅ Endpoint exists! (Got $HTTP_CODE which is expected for validation)"
else
    echo ""
    echo "⚠️ Got status $HTTP_CODE"
fi

