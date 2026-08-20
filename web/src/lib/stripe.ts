import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export const PLANS = {
  free: {
    name: "Free",
    credits: 10,
    price: 0,
    priceId: null,
    features: [
      "10 AI credits/month",
      "1 channel",
      "Basic analytics",
      "Community support",
    ],
  },
  starter: {
    name: "Starter",
    credits: 100,
    price: 9,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? null,
    features: [
      "100 AI credits/month",
      "1 channel",
      "Full analytics",
      "Email support",
      "Script templates",
    ],
  },
  pro: {
    name: "Pro",
    credits: 500,
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "500 AI credits/month",
      "Unlimited channels",
      "3 team seats",
      "Priority support",
      "Custom thumbnails",
      "SEO autopilot",
    ],
  },
  agency: {
    name: "Agency",
    credits: 2000,
    price: 79,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? null,
    features: [
      "2,000 AI credits/month",
      "Unlimited channels",
      "Unlimited seats",
      "API access",
      "White-label reports",
      "Dedicated account manager",
    ],
  },
} as const;

export const CREDIT_PACKS = [
  { credits: 50, price: 4, priceId: process.env.STRIPE_PACK_50_PRICE_ID },
  { credits: 200, price: 14, priceId: process.env.STRIPE_PACK_200_PRICE_ID },
  { credits: 500, price: 29, priceId: process.env.STRIPE_PACK_500_PRICE_ID },
] as const;

export type CheckoutProduct =
  | { type: "subscription"; priceId: string; tier: "starter" | "pro" | "agency" }
  | { type: "credits"; priceId: string; credits: number };

export const CHECKOUT_SESSION_TTL_SECONDS = 30 * 60;

/** Keep incomplete Checkout sessions at Stripe's documented minimum lifetime. */
export function checkoutExpiresAt(nowSeconds = Math.floor(Date.now() / 1000)) {
  return nowSeconds + CHECKOUT_SESSION_TTL_SECONDS;
}

/** Resolve a client-selected price through the server-owned billing catalog. */
export function resolveCheckoutProduct(
  priceId: string,
  type: "subscription" | "credits"
): CheckoutProduct | null {
  if (type === "subscription") {
    for (const tier of ["starter", "pro", "agency"] as const) {
      const configuredPriceId = PLANS[tier].priceId;
      if (configuredPriceId && configuredPriceId === priceId) {
        return { type, priceId: configuredPriceId, tier };
      }
    }
    return null;
  }

  const pack = CREDIT_PACKS.find(
    (candidate) => candidate.priceId && candidate.priceId === priceId
  );
  return pack?.priceId
    ? { type, priceId: pack.priceId, credits: pack.credits }
    : null;
}

export const CREDIT_COSTS = {
  ai_script: 5,
  ai_thumbnail: 3,
  ai_seo: 2,
  transcription: 4,
  research: 1,
  shorts_factory: 6,
} as const;
