import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { website, user_email } = await req.json();

    if (!website || !user_email) {
      return NextResponse.json({ error: "Missing website or user_email" }, { status: 400 });
    }

    // Normalize website URL
    let url = website.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    console.log(`🔍 Parsing website: ${url} for user: ${user_email}`);

    // Use OpenAI to analyze the website
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a business analyst. Analyze websites and extract:
1. Business name and description
2. Main product/service category
3. Key competitors (list their domain names like "competitor.com")
4. Target audience
5. Industry/niche

Return a JSON object with this structure:
{
  "businessName": "Company Name",
  "description": "What the business does",
  "category": "e.g., CRM Software, E-commerce, SaaS Tool",
  "competitors": ["competitor1.com", "competitor2.com"],
  "targetAudience": "Who they serve",
  "industry": "Industry name"
}`
          },
          {
            role: "user",
            content: `Analyze this website: ${url}\n\nExtract business information, identify competitors, and understand what they do.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", response.status, errorText);
      throw new Error("Failed to analyze website");
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    console.log("✅ Website analysis complete:", analysis);

    return NextResponse.json({
      success: true,
      business: {
        name: analysis.businessName || "Your Business",
        description: analysis.description || "",
        category: analysis.category || "",
        industry: analysis.industry || "",
        targetAudience: analysis.targetAudience || "",
      },
      competitors: (analysis.competitors || []).filter((c: string) => c && typeof c === "string"),
    });
  } catch (error: any) {
    console.error("❌ Error parsing website:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse website" },
      { status: 500 }
    );
  }
}

