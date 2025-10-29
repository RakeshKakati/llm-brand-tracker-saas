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

    console.log(`👥 Fetching members for team: ${teamId}`);

    // Verify user has access to this team
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .or(`owner_email.eq.${userEmail}`)
      .single();

    if (!team) {
      // Check if user is a member
      const { data: member } = await supabaseAdmin
        .from("team_members")
        .select("team:teams(*)")
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

    // Get all members
    const { data: members, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    // Get owner info
    const { data: ownerTeam } = await supabaseAdmin
      .from("teams")
      .select("owner_email")
      .eq("id", teamId)
      .single();

    // Add owner as admin member if not already in members
    const formattedMembers = members || [];
    if (ownerTeam?.owner_email) {
      const ownerExists = formattedMembers.some(
        (m: any) => m.user_email === ownerTeam.owner_email
      );
      if (!ownerExists) {
        formattedMembers.unshift({
          user_email: ownerTeam.owner_email,
          role: "owner",
          status: "active",
          joined_at: team?.created_at,
        });
      } else {
        // Update existing member to show as owner
        const ownerIndex = formattedMembers.findIndex(
          (m: any) => m.user_email === ownerTeam.owner_email
        );
        if (ownerIndex !== -1) {
          formattedMembers[ownerIndex].role = "owner";
        }
      }
    }

    if (error) {
      console.error("❌ Error fetching members:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: formattedMembers }, { status: 200 });
  } catch (error: any) {
    console.error("💥 Fatal error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await req.json();
    const { user_email: inviteeEmail, role = "member", inviter_email } = body;

    if (!inviteeEmail || !inviter_email) {
      return NextResponse.json(
        { error: "Invitee email and inviter email are required" },
        { status: 400 }
      );
    }

    // Verify inviter has permission (owner or admin)
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("owner_email")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isOwner = team.owner_email === inviter_email;
    
    if (!isOwner) {
      // Check if inviter is admin
      const { data: inviter } = await supabaseAdmin
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_email", inviter_email)
        .eq("status", "active")
        .single();

      if (!inviter || inviter.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Only owners and admins can invite members" },
          { status: 403 }
        );
      }
    }

    // Check if member already exists
    const { data: existing } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("user_email", inviteeEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Add member
    const { data: member, error } = await supabaseAdmin
      .from("team_members")
      .insert([
        {
          team_id: teamId,
          user_email: inviteeEmail,
          role,
          status: "invited",
          invited_by: inviter_email,
          invited_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error inviting member:", error);
      return NextResponse.json(
        { error: "Failed to invite member" },
        { status: 500 }
      );
    }

    console.log(`✅ Member invited: ${inviteeEmail} to team ${teamId}`);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("💥 Fatal error inviting member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

