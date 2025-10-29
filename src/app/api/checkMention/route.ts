export const runtime = 'nodejs';


import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

// --- helper: safely escape brand in regex ---
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- helper: detect if brand is mentioned ---
function inferMentionStatus(text: string, brand: string) {
  if (!text || !brand) return false;
  const t = text.toLowerCase();
  const b = brand.toLowerCase();

  const brandPresent = new RegExp(`\\b${escapeRegExp(b)}\\b`, "i").test(t);

  const negationPatterns = [
    /does not mention/i,
    /not mentioned/i,
    /no mention/i,
    /doesn't (?:appear|mention)/i,
    /not present/i,
    /\babsent\b/i,
  ];

  const negated = negationPatterns.some((p) => p.test(t));

  if (brandPresent && negated) return false;
  return brandPresent;
}

export async function POST(req: Request) {
  try {
    const bodyIn = await req.json();
    const user_email = bodyIn?.user_email;
    // Normalize brand/query: trim and collapse whitespace
    const brand = String(bodyIn?.brand ?? "").trim().replace(/\s+/g, " ");
    const query = String(bodyIn?.query ?? "").trim().replace(/\s+/g, " ");

    if (!brand || !query)
      return NextResponse.json({ error: "Missing brand or query" }, { status: 400 });

    // Validate authentication - user_email must be provided
    if (!user_email) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required. Please sign in." 
      }, { status: 401 });
    }

    // Optional: Verify the Authorization header if present
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      // You could validate the token here if needed
      console.log("🔐 Request authenticated with token");
    }

    console.log(`🔍 Checking mention: brand="${brand}", query="${query}" for user=${user_email}`);

    // ---- STEP 1: Ask OpenAI to search for the query using Responses API with web_search tool ----
    const body = {
      model: "gpt-4o-mini",
      input: query,
      tools: [{ type: "web_search" }]
    };

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ OpenAI API error:", res.status, errText.slice(0, 200));
      // Fallback: still record the search so analytics/visibility have denominators
      try {
        await supabaseAdmin.from("brand_mentions").insert([
          {
            brand,
            query,
            mentioned: false,
            evidence: "Search failed",
            raw_output: JSON.stringify({ status: res.status, error: errText.slice(0, 500) }),
            user_email,
          },
        ]);
      } catch (e) {
        console.error("❌ Supabase insert fallback error:", e);
      }
      return NextResponse.json({ brand, query, mentioned: false, evidence: "Search failed" }, { status: 200 });
    }

    const data = await res.json();
    console.log("📦 Raw OpenAI response:", JSON.stringify(data, null, 2).slice(0, 2000)); // Log first 2000 chars
    console.log("📦 Response structure keys:", Object.keys(data || {}));
    if (data?.output?.[0]) {
      console.log("📦 Output[0] keys:", Object.keys(data.output[0]));
      if (data.output[0].items) {
        console.log(`📦 Output[0] has ${data.output[0].items.length} items`);
        data.output[0].items.forEach((item: any, idx: number) => {
          console.log(`📦 Item ${idx} keys:`, Object.keys(item || {}));
          if (item?.web_search_call) {
            console.log(`📦 Item ${idx} has web_search_call!`);
            console.log(`📦 web_search_call keys:`, Object.keys(item.web_search_call || {}));
            if (item.web_search_call.action) {
              console.log(`📦 web_search_call.action keys:`, Object.keys(item.web_search_call.action || {}));
              if (item.web_search_call.action.sources) {
                console.log(`📦 Found ${item.web_search_call.action.sources.length} sources!`);
              }
            }
          }
        });
      }
    }

    // ---- STEP 2: Extract text from /v1/responses format ----
    let outputText = "";
    
    // Parse /v1/responses format: output array can contain web_search_call and message items
    // Need to find the message item with type "message"
    if (data?.output && Array.isArray(data.output)) {
      // Find the message item (not web_search_call)
      const messageItem = data.output.find((item: any) => item.type === "message" && item.content);
      
      if (messageItem?.content?.[0]?.text) {
        outputText = messageItem.content[0].text;
        console.log("✅ Extracted text from /v1/responses format");
      } else {
        // Fallback: try output[1] if message is always second
        const secondItem = data.output[1];
        if (secondItem?.content?.[0]?.text) {
          outputText = secondItem.content[0].text;
          console.log("✅ Extracted text from /v1/responses format (fallback)");
        } else {
          console.error("❌ Could not extract content from /v1/responses format");
          console.error("❌ Output items:", data.output.map((item: any) => ({ type: item.type, hasContent: !!item.content })));
          outputText = "";
        }
      }
    }
    else {
      console.error("❌ No output array found in response");
      outputText = "";
    }

    outputText = outputText.trim();
    console.log("🧠 Search result text:", outputText.slice(0, 500));

    // ---- STEP 3: Infer mention ----
    const mentioned = inferMentionStatus(outputText, brand);
    const evidenceSnippet = outputText
      .split("\n")
      .find((line) => new RegExp(brand, "i").test(line)) || "No mention found";

    console.log(`✅ Mention detected: ${mentioned ? "YES" : "NO"} (${brand})`);

    // ---- STEP 3.5: Extract citations from annotations and web_search_call.action.sources ----
    const source_urls: string[] = [];
    const urlSet = new Set<string>(); // For deduplication

    // Extract citations from web_search tool sources
    try {
      // First, extract from annotations in the message content
      if (data?.output && Array.isArray(data.output)) {
        const messageItem = data.output.find((item: any) => item.type === "message" && item.content);
        
        if (messageItem?.content?.[0]?.annotations) {
          const annotations = messageItem.content[0].annotations;
          annotations.forEach((ann: any) => {
            if (ann.type === 'url_citation' && ann.url) {
              const url = ann.url.trim();
              if (url && !urlSet.has(url)) {
                urlSet.add(url);
                source_urls.push(url);
                console.log(`  ✅ Citation from annotation: ${ann.title || 'No title'} - ${url}`);
              }
            }
          });
        }
        
        // Also check web_search_call.action.sources from output items
        for (const item of data.output) {
          if (item?.type === 'web_search_call' && item?.action?.sources) {
            const sources = item.action.sources;
            sources.forEach((source: any) => {
              if (source?.url) {
                const url = source.url.trim();
                if (url && !urlSet.has(url)) {
                  urlSet.add(url);
                  source_urls.push(url);
                  console.log(`  ✅ Citation from web_search: ${source.title || source.name || 'No title'} - ${url}`);
                }
              }
            });
          }
        }
      }

      // Fallback: Extract URLs from text output if no structured citations found
      if (source_urls.length === 0 && outputText) {
        console.log(`⚠️ No structured citations found, falling back to regex extraction from text`);
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
        const textUrls = outputText.match(urlRegex) || [];
        for (const url of textUrls) {
          if (!urlSet.has(url)) {
            urlSet.add(url);
            source_urls.push(url);
          }
        }
      }
      
      console.log(`📚 Total citations extracted: ${source_urls.length}`);
    } catch (e) {
      console.error("❌ Error extracting citations:", e);
      // Fallback to regex extraction
      const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
      const textUrls = outputText.match(urlRegex) || [];
      for (const url of textUrls) {
        if (!urlSet.has(url)) {
          urlSet.add(url);
          source_urls.push(url);
        }
      }
    }

    console.log(`🔗 Extracted ${source_urls.length} unique URLs (${source_urls.length > 0 ? source_urls.slice(0, 3).join(', ') : 'none'})`);

    // ---- STEP 3.6: Calculate brand position/rank based on order of mentions ----
    let brandPosition: number | null = null;
    
    if (mentioned && outputText) {
      try {
        // Extract all brands mentioned (including the tracked brand) from **brand name** patterns
        const brandPattern = /\*\*([^*]+)\*\*/g;
        const allBrands: Array<{ name: string; position: number }> = [];
        let match;
        
        while ((match = brandPattern.exec(outputText)) !== null) {
          let brandName = match[1].trim();
          // Clean markdown links
          brandName = brandName.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
          const position = match.index;
          
          if (brandName.length > 0) {
            allBrands.push({ name: brandName.toLowerCase(), position });
          }
        }
        
        // Also check for brand mentions without ** markers (fallback)
        // Look for brand name with word boundaries
        const brandRegex = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const brandMatch = brandRegex.exec(outputText);
        if (brandMatch && !allBrands.some(b => b.position === brandMatch.index)) {
          allBrands.push({ name: brand.toLowerCase(), position: brandMatch.index });
        }
        
        // Sort all brands by their position in the text
        allBrands.sort((a, b) => a.position - b.position);
        
        // Find the rank of our tracked brand
        const trackedBrandIndex = allBrands.findIndex(b => 
          b.name === brand.toLowerCase() || 
          b.name.includes(brand.toLowerCase()) || 
          brand.toLowerCase().includes(b.name)
        );
        
        if (trackedBrandIndex !== -1) {
          brandPosition = trackedBrandIndex + 1; // Rank: 1-based (1st, 2nd, 3rd...)
          console.log(`📍 Brand position: ${brandPosition} out of ${allBrands.length} brands mentioned`);
        } else if (mentioned) {
          // If brand is mentioned but not in **bold**, estimate position from text location
          const brandTextPosition = outputText.toLowerCase().indexOf(brand.toLowerCase());
          if (brandTextPosition !== -1) {
            // Count how many brands appear before this position
            const brandsBefore = allBrands.filter(b => b.position < brandTextPosition).length;
            brandPosition = brandsBefore + 1;
            console.log(`📍 Estimated brand position: ${brandPosition} based on text location`);
          }
        }
      } catch (e) {
        console.error("❌ Error calculating brand position:", e);
      }
    }

    // ---- STEP 4: Store in Supabase with full raw response, extracted URLs, and position ----
    const rawResponseJson = JSON.stringify(data);
    const { error } = await supabaseAdmin.from("brand_mentions").insert([
      {
        brand,
        query,
        mentioned,
        evidence: evidenceSnippet,
        raw_output: rawResponseJson, // Store complete JSON response from OpenAI API
        source_urls: source_urls, // Store extracted URLs as array
        position: brandPosition, // Store position/rank (1st, 2nd, 3rd, etc.)
        user_email: user_email, // Associate with user
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
    }

    // ---- STEP 5: Respond to frontend ----
    return NextResponse.json({
      brand,
      query,
      mentioned,
      evidence: evidenceSnippet,
    });
  } catch (err: any) {
    console.error("💥 Fatal error in checkMention route:", err);
    // Fallback: record failed search
    try {
      const body = await req.json().catch(() => ({} as any));
      const brand = String(body?.brand ?? "").trim().replace(/\s+/g, " ");
      const query = String(body?.query ?? "").trim().replace(/\s+/g, " ");
      const user_email = body?.user_email;
      if (brand && query && user_email) {
        await supabaseAdmin.from("brand_mentions").insert([
          {
            brand,
            query,
            mentioned: false,
            evidence: "Unexpected error",
            raw_output: JSON.stringify({ error: String(err?.message || err) }),
            user_email,
          },
        ]);
      }
    } catch (e) {
      console.error("❌ Supabase insert on catch failed:", e);
    }
    return NextResponse.json({ error: err?.message || "Unknown error", mentioned: false }, { status: 200 });
  }
}
