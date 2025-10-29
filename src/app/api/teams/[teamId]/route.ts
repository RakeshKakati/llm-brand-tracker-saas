import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const userEmail = searchParams.get("user_email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching team: ${teamId} for user: ${userEmail}`);

    // Fetch team using admin client to bypass RLS
    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (error || !team) {
      console.error("❌ Team not found:", error);
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Verify user has access (owner or active member)
    const isOwner = team.owner_email === userEmail;
    
    if (!isOwner) {
      const { data: member } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_email", userEmail)
        .eq("status", "active")
        .single();

      if (!member) {
        return NextResponse.json(
          { error: "Unauthorized - Not a team member" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ team }, { status: 200 });
  } catch (error: any) {
    console.error("💥 Fatal error fetching team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

