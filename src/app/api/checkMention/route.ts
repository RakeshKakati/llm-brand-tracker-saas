export const runtime = 'nodejs';


import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

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
    const { brand, query } = await req.json();

    if (!brand || !query)
      return NextResponse.json({ error: "Missing brand or query" }, { status: 400 });

    console.log(`🔍 Checking mention: brand="${brand}", query="${query}"`);

    // ---- STEP 1: Ask OpenAI to search for the query ----
    const body = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Search the web for: "${query}". Return a short list of search results and summaries. Include brand and product names if mentioned.`
        }
      ],
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
      return NextResponse.json({ error: "OpenAI API error" }, { status: 500 });
    }

    const data = await res.json();
    console.log("📦 Raw OpenAI response:", data);

    // ---- STEP 2: Extract text from model output ----
    let outputText = data?.choices?.[0]?.message?.content || "";
    
    if (!outputText && data?.choices?.[0]?.message) {
      // Try alternative response structure
      outputText = JSON.stringify(data.choices[0].message);
    }

    outputText = outputText.trim();
    console.log("🧠 Search result text:", outputText.slice(0, 500));

    // ---- STEP 3: Infer mention ----
    const mentioned = inferMentionStatus(outputText, brand);
    const evidenceSnippet = outputText
      .split("\n")
      .find((line) => new RegExp(brand, "i").test(line)) || "No mention found";

    console.log(`✅ Mention detected: ${mentioned ? "YES" : "NO"} (${brand})`);

    // ---- STEP 4: Store in Supabase ----
    const { error } = await supabase.from("brand_mentions").insert([
      {
        brand,
        query,
        mentioned,
        evidence: evidenceSnippet,
        raw_output: outputText.slice(0, 2000),
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
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
