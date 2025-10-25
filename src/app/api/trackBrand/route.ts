import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { brand, query, interval } = await req.json();

    if (!brand || !query) {
      return new Response(JSON.stringify({ error: "Missing brand or query" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("tracked_brands")
      .insert([{ brand, query, interval_minutes: interval || 5, active: true }]);

    if (error) throw error;

    console.log(`✅ Tracking added for brand="${brand}" query="${query}"`);
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    console.error("❌ Error adding tracked brand:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
