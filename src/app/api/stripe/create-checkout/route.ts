import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

// Check if Stripe secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: Request) {
  try {
    const { user_email } = await req.json();

    if (!user_email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get price ID from server environment
    const priceId = process.env.STRIPE_PRO_PRICE_ID?.replace(/['"]/g, '');
    
    if (!priceId) {
      console.error("❌ STRIPE_PRO_PRICE_ID not found in server environment");
      return NextResponse.json(
        { error: "Stripe is not configured properly. Please contact support." },
        { status: 500 }
      );
    }

    console.log("💳 Creating Stripe checkout for:", user_email);
    console.log("💳 Using Price ID:", priceId);
    console.log("💳 App URL:", process.env.NEXT_PUBLIC_APP_URL);

    // Get user's current subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_email", user_email)
      .single();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true`,
      customer_email: user_email,
      metadata: {
        user_email: user_email,
      },
      subscription_data: {
        metadata: {
          user_email: user_email,
        },
      },
    });

    console.log("✅ Checkout session created:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("❌ Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

