"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const code = searchParams.get("code");
        const redirectParam = searchParams.get("redirect") || "/dashboard";

        if (!code) {
          setError("No authorization code found");
          setStatus("error");
          return;
        }

        console.log("🔐 Processing OAuth callback with code:", code.substring(0, 10) + "...");

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("❌ Error exchanging code:", exchangeError);
          setError(exchangeError.message);
          setStatus("error");
          return;
        }

        if (!data.session || !data.user) {
          setError("Failed to create session");
          setStatus("error");
          return;
        }

        console.log("✅ Session created for user:", data.user.email);

        // Create user profile and subscription if they don't exist (using admin client via API)
        try {
          const response = await fetch("/api/auth/oauth-callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || 
                        data.user.user_metadata?.name || 
                        data.user.email?.split("@")[0] || 
                        "User",
            }),
          });

          if (!response.ok) {
            console.warn("⚠️ Failed to create user profile, but continuing...");
          }
        } catch (profileError) {
          console.warn("⚠️ Profile creation error (non-fatal):", profileError);
        }

        setStatus("success");

        // Redirect to the specified page
        setTimeout(() => {
          router.push(redirectParam);
        }, 500);
      } catch (err: any) {
        console.error("❌ Callback error:", err);
        setError(err.message || "An error occurred");
        setStatus("error");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Completing sign-in...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-sm text-destructive font-medium">Sign-in failed</p>
              <p className="text-xs text-muted-foreground text-center">{error}</p>
              <button
                onClick={() => router.push("/auth")}
                className="text-sm text-primary hover:underline"
              >
                Return to sign-in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

