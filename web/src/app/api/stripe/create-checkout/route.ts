import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

interface CheckoutRequestBody {
  priceId: string;
  userId: string;
  mode: "subscription" | "payment";
  credits?: number;
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = (await req.json()) as CheckoutRequestBody;
    const { priceId, userId, mode, credits } = body;

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: priceId, userId" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=true`,
      cancel_url: `${appUrl}/settings/billing?canceled=true`,
      metadata: {
        user_id: userId,
        ...(credits ? { credits: String(credits) } : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
