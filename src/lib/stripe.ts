import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};

export const STRIPE_PLANS = {
  PRO: {
    name: "Pro",
    price: 29,
    features: [
      "Unlimited trackers",
      "Hourly checks",
      "Advanced analytics",
      "Priority support",
      "1 year history",
      "API access",
    ],
  },
};

