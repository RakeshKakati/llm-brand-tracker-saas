/**
 * RAG (Retrieval-Augmented Generation) Service
 * 
 * This service provides optional real-time data retrieval using RAG techniques.
 * It's designed to be completely optional - if it fails or is disabled, existing
 * functionality continues to work normally.
 * 
 * Features:
 * - Feature flag controlled (ENABLE_RAG_TRACKING)
 * - Graceful error handling with fallbacks
 * - Real-time web search integration
 * - Source citation extraction
 */

interface RAGResult {
  success: boolean;
  response?: string;
  sources?: Array<{ url: string; title?: string; snippet?: string }>;
  timestamp?: Date;
  error?: string;
}

interface RAGOptions {
  brand: string;
  query: string;
  returnSources?: boolean;
}

/**
 * Get real-time ChatGPT-like response using RAG
 * This is an OPTIONAL enhancement - always returns null if disabled or fails
 */
export async function getRAGTracking(
  options: RAGOptions
): Promise<RAGResult | null> {
  // Feature flag check - if disabled, return null (no error, just skip)
  if (process.env.ENABLE_RAG_TRACKING !== 'true') {
    console.log('🔒 RAG tracking disabled (feature flag off)');
    return null;
  }

  // Safety check - ensure OpenAI API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ RAG tracking requires OPENAI_API_KEY');
    return null;
  }

  try {
    const { brand, query, returnSources = true } = options;
    
    console.log(`🔍 RAG: Fetching real-time data for "${brand}" with query "${query}"`);

    // Use OpenAI Responses API with web_search (same as existing checkMention)
    // This ensures consistency with existing implementation
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: query,
        tools: [{ type: 'web_search' }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RAG: OpenAI API error:', response.status, errorText.slice(0, 200));
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract text response (same logic as checkMention)
    let outputText = '';
    if (data?.output && Array.isArray(data.output)) {
      const messageItem = data.output.find(
        (item: any) => item.type === 'message' && item.content
      );
      
      if (messageItem?.content?.[0]?.text) {
        outputText = messageItem.content[0].text;
      } else {
        const secondItem = data.output[1];
        if (secondItem?.content?.[0]?.text) {
          outputText = secondItem.content[0].text;
        }
      }
    }

    // Extract sources if requested
    const sources: Array<{ url: string; title?: string; snippet?: string }> = [];
    if (returnSources && data?.output && Array.isArray(data.output)) {
      const urlSet = new Set<string>();

      // Extract from annotations
      const messageItem = data.output.find(
        (item: any) => item.type === 'message' && item.content
      );
      
      if (messageItem?.content?.[0]?.annotations) {
        messageItem.content[0].annotations.forEach((ann: any) => {
          if (ann.type === 'url_citation' && ann.url) {
            const url = ann.url.trim();
            if (url && !urlSet.has(url)) {
              urlSet.add(url);
              sources.push({
                url,
                title: ann.title,
                snippet: ann.text,
              });
            }
          }
        });
      }

      // Extract from web_search_call sources
      for (const item of data.output) {
        if (item?.type === 'web_search_call' && item?.action?.sources) {
          item.action.sources.forEach((source: any) => {
            if (source?.url) {
              const url = source.url.trim();
              if (url && !urlSet.has(url)) {
                urlSet.add(url);
                sources.push({
                  url,
                  title: source.title || source.name,
                  snippet: source.snippet,
                });
              }
            }
          });
        }
      }
    }

    console.log(`✅ RAG: Successfully retrieved response (${outputText.length} chars, ${sources.length} sources)`);

    return {
      success: true,
      response: outputText,
      sources: returnSources ? sources : undefined,
      timestamp: new Date(),
    };
  } catch (error: any) {
    // CRITICAL: Never throw - always return null or error object
    // This ensures existing code continues to work
    console.error('❌ RAG: Error in getRAGTracking:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Check if brand is mentioned using RAG (optional enhancement)
 * Returns null if RAG is disabled or fails - existing code handles this gracefully
 */
export async function checkBrandMentionWithRAG(
  brand: string,
  query: string
): Promise<{ mentioned: boolean; evidence: string; sources?: Array<any> } | null> {
  const ragResult = await getRAGTracking({ brand, query, returnSources: true });

  if (!ragResult || !ragResult.success || !ragResult.response) {
    return null; // RAG failed or disabled - return null (existing code continues)
  }

  // Check if brand is mentioned (using same logic as checkMention)
  const brandLower = brand.toLowerCase();
  const responseLower = ragResult.response.toLowerCase();
  const brandRegex = new RegExp(`\\b${brandLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  const mentioned = brandRegex.test(responseLower);

  // Extract evidence snippet
  const evidenceSnippet = ragResult.response
    .split('\n')
    .find((line) => new RegExp(brand, 'i').test(line)) || 'No mention found';

  return {
    mentioned,
    evidence: evidenceSnippet,
    sources: ragResult.sources,
  };
}

