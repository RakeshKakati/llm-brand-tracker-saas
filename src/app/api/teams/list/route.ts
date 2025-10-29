import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userEmail = searchParams.get("user_email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    console.log(`👥 Fetching teams for user: ${userEmail}`);

    // Get teams where user is owner
    const { data: ownedTeams } = await supabaseAdmin
      .from("teams")
      .select("*")
      .eq("owner_email", userEmail);

    // Get teams where user is member
    const { data: memberTeams } = await supabaseAdmin
      .from("team_members")
      .select(`
        team:teams(*),
        role,
        status,
        invited_at,
        joined_at
      `)
      .eq("user_email", userEmail)
      .eq("status", "active");

    // Combine and format
    const formattedTeams = [
      ...(ownedTeams || []).map((team: any) => ({
        ...team,
        role: "owner",
        status: "active",
      })),
      ...(memberTeams || []).map((member: any) => ({
        ...member.team,
        role: member.role,
        status: member.status,
        joined_at: member.joined_at,
        invited_at: member.invited_at,
      })),
    ];

    // Remove duplicates
    const uniqueTeams = formattedTeams.filter(
      (team, index, self) =>
        index === self.findIndex((t) => t.id === team.id)
    );

    console.log(`✅ Found ${uniqueTeams.length} teams for user`);
    return NextResponse.json({ teams: uniqueTeams }, { status: 200 });
  } catch (error: any) {
    console.error("💥 Fatal error fetching teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

