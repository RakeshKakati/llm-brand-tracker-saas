import { supabase } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { brand, query, interval } = await req.json();

    if (!brand || !query) {
      return NextResponse.json({ error: "Missing brand or query" }, { status: 400 });
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("max_trackers")
      .eq("user_email", session.user.email)
      .eq("status", "active")
      .single();

    // Count current trackers
    const { count } = await supabase
      .from("tracked_brands")
      .select("*", { count: "exact", head: true })
      .eq("user_email", session.user.email)
      .eq("active", true);

    if (count !== null && subscription?.max_trackers && count >= subscription.max_trackers) {
      return NextResponse.json({ 
        error: `Tracker limit reached. Your plan allows ${subscription.max_trackers} trackers.`,
        limit: subscription.max_trackers,
        current: count
      }, { status: 403 });
    }

    // Insert with user_email and user_id
    const { data, error } = await supabase
      .from("tracked_brands")
      .insert([{ 
        brand, 
        query, 
        interval_minutes: interval || 5, 
        active: true,
        user_email: session.user.email,
        user_id: session.user.id
      }]);

    if (error) throw error;

    console.log(`✅ Tracking added for brand="${brand}" query="${query}" by ${session.user.email}`);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error adding tracked brand:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
