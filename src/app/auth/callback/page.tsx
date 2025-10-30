"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<可以被>"loading" | "error" | "success">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log full URL for debugging
        console.log("🔍 Callback URL:", window.location.href);
        console.log("🔍 Hash:", window.location.hash);
        console.log("🔍 Search:", window.location.search);
        
        // Check for error parameters first
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          console.error("❌ OAuth error from Supabase:", errorParam, errorDescription);
          setError(errorDescription || errorParam || "OAuth authentication failed");
          setStatus("error");
          return;
        }
        
        // Check if we have tokens in the hash (implicit flow - Supabase redirects with hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashError = hashParams.get("error");
        
        if (hashError) {
          console.error("❌ OAuth error in hash:", hashError, hashParams.get("error_description"));
          setError(hashParams.get("error_description") || hashError || "OAuth authentication failed");
          setStatus("error");
          return;
        }
        
        // Check if we have a code in query params (PKCE flow)
        const code = searchParams.get("code");
        
        // Get redirect param from either source
        const redirectParam = searchParams.get("redirect") || hashParams.get("redirect") || "/dashboard";

        console.log("🔍 Found tokens in hash:", !!accessToken, !!refreshToken);
        console.log("🔍 Found code in query:", !!code);

        let sessionData: any = null;
        
        // If no code/tokens, check if there's already a session (might have been set by Supabase automatically)
        if (!accessToken && !refreshToken && !code) {
          console.log("⚠️ No code or tokens found. Checking for existing session...");
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session && session.user) {
            console.log("✅ Found existing session for user:", session.user.email);
            sessionData = { session, user: session.user };
          } else {
            setError("No authorization code or tokens found in URL. Please try signing in again.");
            setStatus("error");
            return;
          }
        }

        // Handle implicit flow (tokens in hash - this is what Supabase is sending)
        if (!sessionData && accessToken && refreshToken) {
          console.log("🔐 Processing OAuth callback with tokens (hash-based flow)");
          
          // Set session directly using tokens from hash
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error("❌ Error setting session:", setSessionError);
            setError(setSessionError.message);
            setStatus("error");
            return;
          }

          if (!data.session || !data.user) {
            setError("Failed to create session from tokens");
            setStatus("error");
            return;
          }

          sessionData = data;
          
          // Clear the hash from URL after extracting tokens
          window.history.replaceState(null, "", window.location.pathname + (window.location.search || ""));
        }
        // Handle PKCE flow (code in query params)
        else if (!sessionData && code) {
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

          sessionData = data;
        }

        if (!sessionData) {
          setError("Failed to authenticate. Please try signing in again.");
          setStatus("error");
          return;
        }

        console.log("✅ Session created for user:", sessionData.user.email);

        // Create user profile and subscription if they don't exist (using admin client via API)
        try {
          const response = await fetch("/api/auth/oauth-callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: sessionData.user.id,
              email: sessionData.user.email,
              full_name: sessionData.user.user_metadata?.full_name || 
                        sessionData.user.user_metadata?.name || 
                        sessionData.user.email?.split("@")[0] || 
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
