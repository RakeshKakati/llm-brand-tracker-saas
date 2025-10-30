import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, email, full_name } = body;

    if (!user_id || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user profile exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    // Create user profile if it doesn't exist
    if (!existingUser) {
      const { error: profileError } = await supabaseAdmin
        .from("users")
        .insert([{
          id: user_id,
          email: email,
          full_name: full_name || email.split("@")[0] || "User",
          created_at: new Date().toISOString(),
        }]);

      if (profileError) {
        console.error("⚠️ Profile creation error:", profileError);
        // Don't fail - continue to subscription creation
      } else {
        console.log("✅ User profile created for OAuth user:", email);
      }
    }

    // Check if subscription exists
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("user_email")
      .eq("user_email", email)
      .single();

    // Create free subscription if it doesn't exist
    if (!existingSubscription) {
      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .insert([{
          user_email: email,
          plan_type: "free",
          status: "active",
          max_trackers: 3,
          max_brand_mentions: 50,
        }]);

      if (subError) {
        console.error("⚠️ Subscription creation error:", subError);
      } else {
        console.log("✅ Free subscription created for OAuth user:", email);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ OAuth callback API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

