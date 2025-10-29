import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Update member role or status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params;
    const body = await req.json();
    const { role, status, user_email } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    // Verify user has permission (owner or admin)
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("owner_email")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isOwner = team.owner_email === user_email;
    
    if (!isOwner) {
      const { data: inviter } = await supabaseAdmin
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_email", user_email)
        .eq("status", "active")
        .single();

      if (!inviter || inviter.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Only owners and admins can update members" },
          { status: 403 }
        );
      }
    }

    // Update member
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) {
      updateData.status = status;
      if (status === "active") {
        updateData.joined_at = new Date().toISOString();
      }
    }

    const { data: member, error } = await supabaseAdmin
      .from("team_members")
      .update(updateData)
      .eq("id", memberId)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating member:", error);
      return NextResponse.json(
        { error: "Failed to update member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ member }, { status: 200 });
  } catch (error: any) {
    console.error("💥 Fatal error updating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Remove member from team
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const userEmail = searchParams.get("user_email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    // Verify user has permission
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("owner_email")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isOwner = team.owner_email === userEmail;
    
    if (!isOwner) {
      const { data: inviter } = await supabaseAdmin
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_email", userEmail)
        .eq("status", "active")
        .single();

      if (!inviter || inviter.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Only owners and admins can remove members" },
          { status: 403 }
        );
      }
    }

    // Don't allow removing owner
    const { data: memberToRemove } = await supabaseAdmin
      .from("team_members")
      .select("user_email")
      .eq("id", memberId)
      .single();

    if (memberToRemove?.user_email === team.owner_email) {
      return NextResponse.json(
        { error: "Cannot remove team owner" },
        { status: 400 }
      );
    }

    // Delete member
    const { error } = await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .eq("team_id", teamId);

    if (error) {
      console.error("❌ Error removing member:", error);
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("💥 Fatal error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

