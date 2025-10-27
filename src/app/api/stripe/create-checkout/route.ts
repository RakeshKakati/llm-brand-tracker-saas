import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/app/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  try {
    const { priceId, user_email } = await req.json();

    if (!user_email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    console.log("💳 Creating Stripe checkout for:", user_email);

    // Get user's current subscription
    const { data: existingSubscription } = await supabase
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

