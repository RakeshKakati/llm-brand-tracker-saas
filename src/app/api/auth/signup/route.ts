import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user profile in our custom users table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail the signup if profile creation fails
      }

      // Create free subscription for new user
      if (authData.user.email) {
        const { error: subError } = await supabase
          .from("subscriptions")
          .insert([
            {
              user_email: authData.user.email,
              plan_type: "free",
              status: "active",
              max_trackers: 5,
            },
          ]);

        if (subError) {
          console.error("Subscription creation error:", subError);
          // Don't fail the signup if subscription creation fails
        } else {
          console.log("✅ Free subscription created for:", authData.user.email);
        }
      }
    }

    return NextResponse.json({
      message: "User created successfully. Please check your email to verify your account.",
      user: authData.user,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


