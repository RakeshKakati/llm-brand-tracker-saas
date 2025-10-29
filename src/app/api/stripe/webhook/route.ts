import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable Vercel Authentication for webhooks
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log("🎣 Stripe webhook received:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Payment succeeded for:", invoice.customer_email);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error("❌ Payment failed for:", invoice.customer_email);
        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const user_email = session.metadata?.user_email || session.customer_email;
  const subscriptionId = session.subscription as string;

  if (!user_email) {
    console.error("❌ No user email in checkout session");
    return;
  }

  console.log("✅ Checkout completed for:", user_email);

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData: any = subscription; // Type cast for flexible property access

  // Update user's subscription in database
  const updateData: any = {
    plan_type: "pro",
    status: "active",
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: subscription.customer as string,
    max_trackers: 10, // Pro plan: 10 trackers
    max_brand_mentions: 100, // Pro plan: 100 brand mentions
    updated_at: new Date().toISOString(),
  };

  // Add period dates if available
  if (subData.current_period_start) {
    updateData.current_period_start = new Date(subData.current_period_start * 1000).toISOString();
  }
  if (subData.current_period_end) {
    updateData.current_period_end = new Date(subData.current_period_end * 1000).toISOString();
  }

  // Add user_email to updateData for upsert
  updateData.user_email = user_email;

  // Use upsert to create or update subscription
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(updateData, { 
      onConflict: "user_email",
      ignoreDuplicates: false 
    });

  if (error) {
    console.error("❌ Failed to upsert subscription:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
  } else {
    console.log("✅ Subscription upgraded to Pro for:", user_email);
    console.log("✅ Update data:", updateData);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const user_email = subscription.metadata?.user_email;

  if (!user_email) {
    console.error("❌ No user email in subscription metadata");
    return;
  }

  console.log("🔄 Subscription updated for:", user_email);

  const status = subscription.status === "active" ? "active" : "expired";
  const subData: any = subscription; // Type cast for flexible property access

  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString(),
  };

  // Add period dates if available
  if (subData.current_period_start) {
    updateData.current_period_start = new Date(subData.current_period_start * 1000).toISOString();
  }
  if (subData.current_period_end) {
    updateData.current_period_end = new Date(subData.current_period_end * 1000).toISOString();
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("❌ Failed to update subscription:", error);
  } else {
    console.log("✅ Subscription status updated to:", status);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user_email = subscription.metadata?.user_email;

  if (!user_email) {
    console.error("❌ No user email in subscription metadata");
    return;
  }

  console.log("🗑️  Subscription cancelled for:", user_email);

  // Downgrade to free plan
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_type: "free",
      status: "cancelled",
      stripe_subscription_id: null,
      stripe_customer_id: null,
      current_period_start: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("❌ Failed to downgrade subscription:", error);
  } else {
    console.log("✅ User downgraded to Free plan:", user_email);
  }
}

