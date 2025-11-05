# RAG (Retrieval-Augmented Generation) Implementation

## Overview

This implementation adds optional RAG-powered real-time tracking to the kommi platform. It's designed to be **completely safe** - it won't break existing functionality.

## Safety Features

✅ **Feature Flag Controlled**: Disabled by default  
✅ **Graceful Fallbacks**: If RAG fails, existing code continues  
✅ **Separate Endpoints**: New endpoints don't affect existing ones  
✅ **Error Handling**: All errors are caught and handled  
✅ **Zero Breaking Changes**: Existing endpoints unchanged  

## Files Created

1. **`src/lib/rag-service.ts`** - RAG service with feature flag
2. **`src/app/api/trackBrand/realtime/route.ts`** - New realtime endpoint
3. **Enhanced `src/app/api/checkMention/route.ts`** - Optional RAG enhancement

## Environment Variables

Add to your `.env.local`:

```env
# RAG Feature Flag (optional, defaults to false)
ENABLE_RAG_TRACKING=false

# Required for RAG (already exists)
OPENAI_API_KEY=your_openai_api_key
```

## How It Works

### 1. RAG Service (`src/lib/rag-service.ts`)

- Checks `ENABLE_RAG_TRACKING` feature flag
- Returns `null` if disabled (no errors)
- Uses OpenAI Responses API (same as existing code)
- Extracts sources and citations
- Never throws errors - always returns null on failure

### 2. Optional Enhancement (`src/app/api/checkMention/route.ts`)

- Tries RAG enhancement first (if enabled)
- If RAG fails or is disabled → uses existing flow
- Existing behavior unchanged
- No breaking changes

### 3. Realtime Endpoint (`/api/trackBrand/realtime`)

- Completely separate endpoint
- Optional - users can opt-in
- Falls back to standard endpoint if RAG fails
- Returns enhanced results with sources

## Usage

### Enable RAG Tracking

1. Set environment variable:
```env
ENABLE_RAG_TRACKING=true
```

2. Restart your server

3. Use realtime endpoint (optional):
```typescript
// Frontend call
const response = await fetch('/api/trackBrand/realtime', {
  method: 'POST',
  body: JSON.stringify({
    brand: 'kommi',
    query: 'best brand tracking tools',
    user_email: 'user@example.com',
    user_id: 'user-id'
  })
});
```

### Disable RAG Tracking

Simply set (or remove):
```env
ENABLE_RAG_TRACKING=false
```

Or don't set it at all - it defaults to disabled.

## Testing

### Test RAG Service (Safe)

```typescript
import { getRAGTracking } from '@/lib/rag-service';

// Test with feature flag off (should return null)
const result1 = await getRAGTracking({
  brand: 'test',
  query: 'test query'
});
// Returns null - safe, no errors

// Test with feature flag on
// Set ENABLE_RAG_TRACKING=true
const result2 = await getRAGTracking({
  brand: 'test',
  query: 'test query'
});
// Returns RAG result or null if fails (still safe)
```

### Test Existing Endpoints

All existing endpoints continue to work exactly as before:
- `/api/checkMention` - Works normally (with optional RAG enhancement)
- `/api/trackBrand` - Unchanged
- All cron jobs - Unchanged

## Rollback Plan

If you need to rollback:

1. **Quick Rollback**: Set `ENABLE_RAG_TRACKING=false` (instant)
2. **Code Rollback**: Remove the import from `checkMention/route.ts`
3. **Full Rollback**: Delete the new files (RAG service and realtime endpoint)

## Benefits

- **Real-time Data**: Get current ChatGPT responses
- **Better Sources**: Enhanced source citation extraction
- **Optional**: Can be enabled/disabled instantly
- **Safe**: Never breaks existing functionality
- **Scalable**: Can be extended with vector databases later

## Future Enhancements

Potential additions (all optional):
- Vector database integration (Pinecone, Weaviate)
- Caching layer for common queries
- Batch processing for multiple brands
- Advanced source ranking

## Support

If you encounter any issues:
1. Check `ENABLE_RAG_TRACKING` is set correctly
2. Verify `OPENAI_API_KEY` is valid
3. Check server logs for RAG errors
4. RAG failures automatically fall back to existing code

---

**Remember**: This is completely optional. Your existing platform works exactly as before, with or without RAG enabled.

