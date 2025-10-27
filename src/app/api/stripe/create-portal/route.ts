import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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

    console.log("🏛️  Creating portal session for:", user_email);

    // Get user's subscription
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_email", user_email)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active Stripe subscription found" },
        { status: 404 }
      );
    }

    // Get Stripe subscription to find customer ID
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeSubscription.customer as string,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    console.log("✅ Portal session created");

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error("❌ Portal creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}

