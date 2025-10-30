import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const redirectParam = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent(error.message)}`);
    }

    if (data.session) {
      // User is authenticated - create user profile and subscription if they don't exist
      const user = data.session.user;

      // Check if user profile exists
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      // Create user profile if it doesn't exist
      if (!existingUser) {
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'User';
        
        await supabaseAdmin
          .from("users")
          .insert([{
            id: user.id,
            email: user.email,
            full_name: fullName,
            created_at: new Date().toISOString(),
          }]);
      }

      // Check if subscription exists
      const { data: existingSubscription } = await supabaseAdmin
        .from("subscriptions")
        .select("user_email")
        .eq("user_email", user.email)
        .single();

      // Create free subscription if it doesn't exist
      if (!existingSubscription && user.email) {
        await supabaseAdmin
          .from("subscriptions")
          .insert([{
            user_email: user.email,
            plan_type: "free",
            status: "active",
            max_trackers: 3,
            max_brand_mentions: 50,
          }]);
      }

      // Redirect to the specified page (or dashboard)
      return NextResponse.redirect(`${requestUrl.origin}${redirectParam}`);
    }
  }

  // If no code, redirect to auth page
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}
