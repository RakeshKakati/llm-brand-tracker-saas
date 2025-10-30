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

    // Verify the price exists before creating checkout
    try {
      await stripe.prices.retrieve(priceId);
      console.log("✅ Price ID verified:", priceId);
    } catch (priceError: any) {
      console.error("❌ Price ID verification failed:", priceError.message);
      
      // Check if it's a mode mismatch (test vs live)
      const secretKey = process.env.STRIPE_SECRET_KEY || '';
      const isLiveMode = secretKey.startsWith('sk_live_');
      const isTestPrice = priceId.startsWith('price_') && priceId.length > 20;
      
      // Try to determine the issue
      if (priceError.code === 'resource_missing') {
        const errorMessage = isLiveMode
          ? `Price ID "${priceId}" not found in LIVE mode. Please create a product and price in your live Stripe account and update STRIPE_PRO_PRICE_ID with the live price ID.`
          : `Price ID "${priceId}" not found in TEST mode. Please check that the price exists in your Stripe test account.`;
        
        return NextResponse.json(
          { 
            error: errorMessage,
            details: "The Stripe price ID in your environment variables doesn't exist. Make sure your STRIPE_PRO_PRICE_ID matches your Stripe account mode (test/live).",
            priceId: priceId,
            isLiveMode: isLiveMode
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `Invalid price ID: ${priceError.message}`,
          details: "Please verify that STRIPE_PRO_PRICE_ID is correct in your environment variables."
        },
        { status: 500 }
      );
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?page=settings&upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?page=settings&cancelled=true`,
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
    
    // Provide more helpful error messages
    if (error.code === 'resource_missing' && error.message.includes('price')) {
      return NextResponse.json(
        { 
          error: "The Stripe price ID doesn't exist. Please check your STRIPE_PRO_PRICE_ID environment variable.",
          details: error.message
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

