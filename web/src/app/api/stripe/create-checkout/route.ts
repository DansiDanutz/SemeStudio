import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { resolveCheckoutProduct } from "@/lib/stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

interface CheckoutRequestBody {
  priceId: string;
  type: "subscription" | "credits";
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the caller
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const body = (await req.json()) as CheckoutRequestBody;
    const { priceId, type } = body;

    if (!priceId || (type !== "subscription" && type !== "credits")) {
      return NextResponse.json(
        { error: "A valid priceId and checkout type are required" },
        { status: 400 }
      );
    }

    const product = resolveCheckoutProduct(priceId, type);
    if (!product) {
      return NextResponse.json(
        { error: "The selected billing product is not available" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const successUrl = `${appUrl}/settings/billing?success=true`;
    const cancelUrl = `${appUrl}/settings/billing?canceled=true`;

    // Retrieve the Stripe customer ID from the profile, if it exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    const sessionParams: Stripe.Checkout.SessionCreateParams =
      product.type === "subscription"
        ? {
            mode: "subscription",
            line_items: [{ price: product.priceId, quantity: 1 }],
            // client_reference_id lets the webhook resolve the user without relying on metadata
            client_reference_id: user.id,
            customer: profile?.stripe_customer_id ?? undefined,
            customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
            subscription_data: {
              metadata: { user_id: user.id },
            },
          }
        : {
            mode: "payment",
            line_items: [{ price: product.priceId, quantity: 1 }],
            client_reference_id: user.id,
            customer: profile?.stripe_customer_id ?? undefined,
            customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
              type: "credits",
              user_id: user.id,
              credits: String(product.credits),
              price_id: product.priceId,
            },
          };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] Checkout session error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
