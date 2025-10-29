import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("user_email");

    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 400 });
    }

    // Get user's subscription
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type, max_trackers, max_brand_mentions")
      .eq("user_email", userEmail)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({
        trackers: { used: 0, limit: 3 },
        mentions: { used: 0, limit: 50 },
        plan: "free",
      });
    }

    // Count current trackers
    const { count: trackerCount } = await supabaseAdmin
      .from("tracked_brands")
      .select("*", { count: "exact", head: true })
      .eq("user_email", userEmail)
      .eq("active", true);

    // Count current brand mentions
    const { count: mentionCount } = await supabaseAdmin
      .from("brand_mentions")
      .select("*", { count: "exact", head: true })
      .eq("user_email", userEmail);

    return NextResponse.json({
      trackers: {
        used: trackerCount || 0,
        limit: subscription.max_trackers || 3,
      },
      mentions: {
        used: mentionCount || 0,
        limit: subscription.max_brand_mentions || 50,
      },
      plan: subscription.plan_type,
    });
  } catch (error: any) {
    console.error("❌ Usage API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

