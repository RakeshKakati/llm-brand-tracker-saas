import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await req.json();
    const { token, user_email } = body;

    if (!token || !user_email) {
      return NextResponse.json(
        { error: "Token and user email are required" },
        { status: 400 }
      );
    }

    console.log(`✅ Accepting invitation: token=${token}, team=${teamId}, user=${user_email}`);

    // Fetch the invitation using admin client (bypasses RLS)
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("team_members")
      .select("*, team:teams(*)")
      .eq("id", token)
      .eq("team_id", teamId)
      .single();

    if (fetchError || !invitation) {
      console.error("❌ Invitation not found:", fetchError);
      return NextResponse.json(
        { error: "Invitation not found or has expired" },
        { status: 404 }
      );
    }

    // Check if user email matches
    if (invitation.user_email !== user_email) {
      console.error(`❌ Email mismatch: invitation=${invitation.user_email}, user=${user_email}`);
      return NextResponse.json(
        { 
          error: `This invitation is for ${invitation.user_email}, but you're signed in as ${user_email}.` 
        },
        { status: 403 }
      );
    }

    // Check if already accepted
    if (invitation.status === "active") {
      return NextResponse.json(
        { 
          message: `You're already a member of ${(invitation.team as any).name || "this team"}.`,
          alreadyAccepted: true
        },
        { status: 200 }
      );
    }

    // Accept the invitation using admin client
    const { data: member, error: updateError } = await supabaseAdmin
      .from("team_members")
      .update({
        status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("id", token)
      .eq("team_id", teamId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error accepting invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to accept invitation. Please try again." },
        { status: 500 }
      );
    }

    console.log(`✅ Invitation accepted successfully for ${user_email}`);
    return NextResponse.json(
      { 
        member,
        message: `Successfully joined ${(invitation.team as any).name || "the team"}!`,
        team: invitation.team
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("💥 Fatal error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

