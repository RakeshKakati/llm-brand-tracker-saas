"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Check } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { toast } from "sonner";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  const token = searchParams.get("token");
  const teamId = searchParams.get("team");

  useEffect(() => {
    if (!token || !teamId) {
      setStatus("error");
      setMessage("Invalid invitation link. Missing token or team ID.");
      setLoading(false);
      return;
    }

    acceptInvitation();
  }, [token, teamId]);

  const acceptInvitation = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setStatus("error");
        setMessage("Please sign in to accept the invitation.");
        setLoading(false);
        // Redirect to auth after a delay
        setTimeout(() => router.push("/auth"), 2000);
        return;
      }

      const userEmail = session.user.email;

      // Fetch the invitation
      const { data: invitation, error: fetchError } = await supabase
        .from("team_members")
        .select("*, team:teams(*)")
        .eq("id", token)
        .eq("team_id", teamId)
        .single();

      if (fetchError || !invitation) {
        setStatus("error");
        setMessage("Invitation not found or has expired.");
        setLoading(false);
        return;
      }

      // Check if user email matches
      if (invitation.user_email !== userEmail) {
        setStatus("error");
        setMessage(`This invitation is for ${invitation.user_email}, but you're signed in as ${userEmail}.`);
        setLoading(false);
        return;
      }

      // Check if already accepted
      if (invitation.status === "active") {
        setStatus("success");
        setMessage(`You're already a member of ${(invitation.team as any).name || "this team"}.`);
        setLoading(false);
        setTimeout(() => router.push("/dashboard?page=teams"), 2000);
        return;
      }

      // Accept the invitation via API endpoint (bypasses RLS)
      setAccepting(true);
      const acceptRes = await fetch(`/api/teams/${teamId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          user_email: userEmail,
        }),
      });

      const acceptData = await acceptRes.json();

      if (!acceptRes.ok) {
        console.error("Error accepting invitation:", acceptData);
        setStatus("error");
        setMessage(acceptData.error || "Failed to accept invitation. Please try again.");
        setLoading(false);
        return;
      }

      if (acceptData.alreadyAccepted) {
        setStatus("success");
        setMessage(acceptData.message);
        setLoading(false);
        setTimeout(() => router.push("/dashboard?page=teams"), 2000);
        return;
      }

      setStatus("success");
      setMessage(acceptData.message || `Successfully joined ${acceptData.team?.name || "the team"}!`);
      toast.success("Invitation accepted!");
      
      // Redirect to teams page
      setTimeout(() => router.push("/dashboard?page=teams"), 2000);
      
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setAccepting(false);
    }
  };

  const handleManualAccept = () => {
    if (token && teamId) {
      acceptInvitation();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Team Invitation</CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Processing your invitation..."}
            {status === "success" && "Invitation accepted!"}
            {status === "error" && "Unable to process invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-center text-sm">{message}</p>
              <p className="text-center text-xs text-muted-foreground">
                Redirecting to teams page...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="w-16 h-16 text-destructive" />
              <p className="text-center text-sm">{message}</p>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard?page=teams")}
                >
                  Go to Teams
                </Button>
                {!message.includes("already a member") && (
                  <Button
                    className="flex-1"
                    onClick={handleManualAccept}
                    disabled={accepting}
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Try Again
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

