import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { brand, query, interval, user_email, user_id, team_id } = await req.json();

    if (!brand || !query) {
      return NextResponse.json({ error: "Missing brand or query" }, { status: 400 });
    }

    // Validate authentication - user_email and user_id must be provided
    if (!user_email || !user_id) {
      return NextResponse.json({ 
        error: "Unauthorized - Please sign in" 
      }, { status: 401 });
    }

    console.log(`🔍 Creating tracker for user: ${user_email}`);

    // Check subscription limits
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("max_trackers, plan_type")
      .eq("user_email", user_email)
      .eq("status", "active")
      .single();

    console.log(`📊 Subscription:`, subscription);

    // Determine limits based on plan type
    const limit = subscription?.max_trackers || (subscription?.plan_type === 'pro' ? 10 : 3);

    // Count current trackers
    const { count } = await supabaseAdmin
      .from("tracked_brands")
      .select("*", { count: "exact", head: true })
      .eq("user_email", user_email)
      .eq("active", true);

    console.log(`📈 Current trackers: ${count} / ${limit}`);

    // Enforce limit
    if (count !== null && count >= limit) {
      return NextResponse.json({ 
        error: `Tracker limit reached. Your ${subscription?.plan_type || 'free'} plan allows ${limit} trackers.`,
        limit: limit,
        current: count
      }, { status: 403 });
    }

    // Insert with user_email, user_id, and optional team_id
    const { data, error } = await supabaseAdmin
      .from("tracked_brands")
      .insert([{ 
        brand, 
        query, 
        interval_minutes: interval || 5, 
        active: true,
        user_email: user_email,
        user_id: user_id,
        team_id: team_id || null // Optional team assignment
      }]);

    if (error) throw error;

    console.log(`✅ Tracking added for brand="${brand}" query="${query}" by ${user_email}`);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error adding tracked brand:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
