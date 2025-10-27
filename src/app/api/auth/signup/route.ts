import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    console.log("📧 Signup request received:", { email, hasPassword: !!password, fullName });

    if (!email || !password || !fullName) {
      console.error("❌ Missing required fields:", { email: !!email, password: !!password, fullName: !!fullName });
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    console.log("🔐 Creating user in Supabase Auth...");
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
      console.error("❌ Supabase Auth error:", authError.message);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    console.log("✅ User created in Auth:", authData.user?.email);

    // Create user profile in our custom users table (optional)
    if (authData.user) {
      console.log("👤 Creating user profile...");
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
        console.error("⚠️ Profile creation error (non-fatal):", profileError.message);
        // Don't fail the signup if profile creation fails
      } else {
        console.log("✅ User profile created");
      }

      // Create free subscription for new user
      if (authData.user.email) {
        console.log("💳 Creating free subscription...");
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
          console.error("⚠️ Subscription creation error (non-fatal):", subError.message);
          // Don't fail the signup if subscription creation fails
        } else {
          console.log("✅ Free subscription created for:", authData.user.email);
        }
      }
    }

    console.log("🎉 Signup completed successfully for:", authData.user?.email);

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


