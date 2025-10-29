import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Get all pending invitations for a user
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

    console.log(`📬 Fetching invitations for: ${userEmail}`);

    // Get all pending invitations for this user
    const { data: invitations, error } = await supabaseAdmin
      .from("team_members")
      .select(`
        *,
        team:teams(*)
      `)
      .eq("user_email", userEmail)
      .eq("status", "invited")
      .order("invited_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching invitations:", error);
      return NextResponse.json(
        { error: "Failed to fetch invitations" },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${invitations?.length || 0} pending invitations`);
    return NextResponse.json({ invitations: invitations || [] }, { status: 200 });
  } catch (error: any) {
    console.error("💥 Fatal error fetching invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Accept or decline an invitation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitationId, action, user_email } = body; // action: "accept" or "decline"

    if (!invitationId || !action || !user_email) {
      return NextResponse.json(
        { error: "Invitation ID, action, and user email are required" },
        { status: 400 }
      );
    }

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    console.log(`📬 ${action === "accept" ? "Accepting" : "Declining"} invitation: ${invitationId} for ${user_email}`);

    // Fetch the invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("team_members")
      .select("*, team:teams(*)")
      .eq("id", invitationId)
      .eq("user_email", user_email)
      .single();

    if (fetchError || !invitation) {
      console.error("❌ Invitation not found:", fetchError);
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.status !== "invited") {
      return NextResponse.json(
        { error: `Invitation is already ${invitation.status}` },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Accept the invitation
      const { data: member, error: updateError } = await supabaseAdmin
        .from("team_members")
        .update({
          status: "active",
          joined_at: new Date().toISOString(),
        })
        .eq("id", invitationId)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error accepting invitation:", updateError);
        return NextResponse.json(
          { error: "Failed to accept invitation" },
          { status: 500 }
        );
      }

      console.log(`✅ Invitation accepted successfully`);
      return NextResponse.json(
        {
          success: true,
          message: `Successfully joined ${(invitation.team as any).name || "the team"}!`,
          member,
        },
        { status: 200 }
      );
    } else {
      // Decline the invitation - delete the record
      const { error: deleteError } = await supabaseAdmin
        .from("team_members")
        .delete()
        .eq("id", invitationId);

      if (deleteError) {
        console.error("❌ Error declining invitation:", deleteError);
        return NextResponse.json(
          { error: "Failed to decline invitation" },
          { status: 500 }
        );
      }

      console.log(`✅ Invitation declined and removed`);
      return NextResponse.json(
        {
          success: true,
          message: "Invitation declined",
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("💥 Fatal error processing invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

