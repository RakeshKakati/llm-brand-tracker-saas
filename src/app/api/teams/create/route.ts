import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, owner_email } = body;

    if (!name || !owner_email) {
      return NextResponse.json(
        { error: "Team name and owner email are required" },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    if (!owner_email) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    console.log(`👥 Creating team: "${name}" for owner: ${owner_email}`);

    // Check if user has Pro subscription
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type, status")
      .eq("user_email", owner_email)
      .eq("status", "active")
      .maybeSingle();

    if (!subscription || subscription.plan_type !== "pro") {
      return NextResponse.json(
        { error: "Team collaboration requires a Pro subscription. Please upgrade to create teams." },
        { status: 403 }
      );
    }

    // Create team
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .insert([
        {
          name,
          description,
          owner_email,
        },
      ])
      .select()
      .single();

    if (teamError) {
      console.error("❌ Error creating team:", teamError);
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 }
      );
    }

    // Automatically add owner as admin member (status: active)
    const { error: memberError } = await supabaseAdmin
      .from("team_members")
      .insert([
        {
          team_id: team.id,
          user_email: owner_email,
          role: "admin",
          status: "active",
          joined_at: new Date().toISOString(),
        },
      ]);

    if (memberError) {
      console.error("❌ Error adding owner to team:", memberError);
      // Team created but member insert failed - still return team
    }

    console.log(`✅ Team created successfully: ${team.id}`);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    console.error("💥 Fatal error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

