# RAG Testing Guide

## Quick Test (No Server Required)

```bash
# Run basic structure test
node test-rag.js
```

This verifies:
- ✅ All files created
- ✅ Feature flag is disabled by default
- ✅ Error handling in place
- ✅ No breaking changes

## API Testing (Requires Dev Server)

### Option 1: Using Node.js Test Script

```bash
# 1. Start your dev server
npm run dev

# 2. In another terminal, run test
node test-rag-api.js
```

### Option 2: Using curl

```bash
# 1. Start your dev server
npm run dev

# 2. Run curl test script
./test-rag-curl.sh

# Or test manually:
curl -X POST http://localhost:3000/api/checkMention \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "kommi",
    "query": "best brand tracking tools",
    "user_email": "test@example.com",
    "user_id": "test-user-id"
  }'
```

### Option 3: Using Browser/Postman

**Test Standard Endpoint:**
```
POST http://localhost:3000/api/checkMention
Content-Type: application/json

{
  "brand": "kommi",
  "query": "best brand tracking tools",
  "user_email": "test@example.com",
  "user_id": "test-user-id"
}
```

**Test Realtime Endpoint:**
```
POST http://localhost:3000/api/trackBrand/realtime
Content-Type: application/json

{
  "brand": "kommi",
  "query": "best brand tracking tools",
  "user_email": "test@example.com",
  "user_id": "test-user-id"
}
```

## Testing Scenarios

### Scenario 1: RAG Disabled (Default)

**Expected Behavior:**
- ✅ Standard endpoint works normally
- ✅ Realtime endpoint falls back to standard
- ✅ No RAG code executes
- ✅ All existing functionality works

**Test:**
```bash
# Don't set ENABLE_RAG_TRACKING or set to false
# Run tests - should work normally
```

### Scenario 2: RAG Enabled

**Expected Behavior:**
- ✅ Standard endpoint uses optional RAG enhancement
- ✅ Realtime endpoint uses RAG
- ✅ Enhanced results with sources
- ✅ Falls back to standard if RAG fails

**Test:**
```bash
# 1. Set in .env.local
echo "ENABLE_RAG_TRACKING=true" >> .env.local

# 2. Ensure OPENAI_API_KEY is set
# (Already should be set)

# 3. Restart server
npm run dev

# 4. Run tests
node test-rag-api.js
```

### Scenario 3: RAG Failure Handling

**Expected Behavior:**
- ✅ If RAG fails, standard flow continues
- ✅ No errors thrown
- ✅ Existing functionality unaffected

**Test:**
```bash
# 1. Enable RAG
export ENABLE_RAG_TRACKING=true

# 2. Set invalid API key temporarily
export OPENAI_API_KEY=invalid_key

# 3. Run tests - should fallback gracefully
```

## What to Look For

### ✅ Success Indicators

1. **Standard Endpoint Works:**
   - Returns `{ brand, query, mentioned, evidence }`
   - Status 200
   - No errors in console

2. **RAG Enhancement (if enabled):**
   - Console logs show "✨ RAG enhancement available"
   - Response includes sources if available
   - Faster or more accurate results

3. **Realtime Endpoint:**
   - Returns enhanced response
   - Includes `method: 'rag_realtime'` if RAG used
   - Falls back gracefully if RAG fails

### ⚠️ Warning Signs

- ❌ Standard endpoint stops working
- ❌ Errors thrown (should be caught)
- ❌ No fallback behavior
- ❌ Breaking changes

## Server Logs to Check

When testing, check your dev server logs for:

```
✅ Good logs:
- "🔍 Checking mention: brand=..."
- "✨ RAG enhancement available: mentioned=..."
- "🔒 RAG tracking disabled (feature flag off)"

⚠️ Warning logs (acceptable):
- "⚠️ RAG enhancement failed, continuing with existing flow"
- "⚠️ RAG not enabled, using standard checkMention logic"

❌ Error logs (should be caught):
- Any unhandled errors (should be caught and logged safely)
```

## Troubleshooting

### Issue: "RAG not working"

**Check:**
1. Is `ENABLE_RAG_TRACKING=true` set?
2. Is `OPENAI_API_KEY` valid?
3. Check server logs for errors
4. Verify RAG service file exists

### Issue: "Standard endpoint broken"

**Check:**
1. Revert changes to `checkMention/route.ts`
2. Set `ENABLE_RAG_TRACKING=false`
3. Restart server
4. Check for syntax errors

### Issue: "Realtime endpoint not found"

**Check:**
1. Verify file exists: `src/app/api/trackBrand/realtime/route.ts`
2. Restart dev server
3. Check Next.js routing

## Next Steps

After testing:

1. ✅ Verify existing functionality works
2. ✅ Test with RAG enabled
3. ✅ Verify fallback behavior
4. ✅ Check error handling
5. ✅ Review server logs

If all tests pass, you're ready to use RAG! 🚀

