import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { business, competitors, user_email } = await req.json();

    if (!business || !user_email) {
      return NextResponse.json({ error: "Missing business info or user_email" }, { status: 400 });
    }

    console.log(`🎯 Generating prompts for: ${business.name} (${business.category})`);

    // Generate relevant search prompts based on confirmed business info and competitors
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
            content: `You are a search query expert. Generate 5-7 highly relevant search query prompts that potential customers would use when looking for a business like the one described.

Consider:
- The business category and industry
- Target audience
- Competitors (if provided)
- Common customer search patterns

Return a JSON object with this structure:
{
  "prompts": ["prompt 1", "prompt 2", ...]
}

Make prompts natural, specific, and search-friendly (like "best CRM for startups" or "top marketing tools 2024").`
          },
          {
            role: "user",
            content: `Business Name: ${business.name}
Category: ${business.category}
Description: ${business.description || "N/A"}
Industry: ${business.industry || "N/A"}
Target Audience: ${business.targetAudience || "N/A"}
${competitors && competitors.length > 0 ? `Competitors: ${competitors.join(", ")}` : ""}

Generate search prompts that customers would use when searching for this type of business.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", response.status, errorText);
      throw new Error("Failed to generate prompts");
    }

    const data = await response.json();
    let prompts = [];
    
    try {
      const promptContent = JSON.parse(data.choices[0].message.content);
      prompts = promptContent.prompts || promptContent.prompt || [];
    } catch {
      // Fallback prompts if parsing fails
      prompts = [
        `best ${business.category.toLowerCase()}`,
        `top ${business.category.toLowerCase()} 2024`,
        `${business.category.toLowerCase()} for ${business.targetAudience?.toLowerCase() || "business"}`,
        `best ${business.category.toLowerCase()} for startups`,
        `${business.category.toLowerCase()} comparison`
      ];
    }

    // Ensure we have at least 5 prompts, fill with fallbacks if needed
    while (prompts.length < 5) {
      prompts.push(`best ${business.category.toLowerCase()} ${prompts.length + 1}`);
    }

    console.log("✅ Generated prompts:", prompts.slice(0, 7));

    return NextResponse.json({
      success: true,
      prompts: prompts.slice(0, 7), // Limit to 7 prompts
    });
  } catch (error: any) {
    console.error("❌ Error generating prompts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate prompts" },
      { status: 500 }
    );
  }
}

