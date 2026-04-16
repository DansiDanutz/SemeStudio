import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";
import type { PlanTier } from "@/types";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

// Map Stripe price IDs back to plan tiers at runtime
function planFromPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return tier as PlanTier;
  }
  return null;
}

function planFromSubscription(subscription: Stripe.Subscription): PlanTier | null {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return null;
  return planFromPriceId(priceId);
}

function creditsForPlan(tier: PlanTier): number {
  if (tier in PLANS) return PLANS[tier as keyof typeof PLANS].credits;
  return PLANS.free.credits;
}

async function getUserIdByCustomer(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      // ── One-time credit pack purchase OR subscription checkout ───────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // client_reference_id is the most reliable — set it in create-checkout
        const userId = session.client_reference_id ?? session.metadata?.user_id;
        if (!userId) break;

        // Always persist Stripe customer ID so future webhooks can resolve the user
        if (session.customer) {
          await supabase
            .from("profiles")
            .update({
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }

        // Credit-pack one-time purchase
        if (session.mode === "payment") {
          const creditsStr = session.metadata?.credits;
          if (!creditsStr) break;
          const credits = parseInt(creditsStr, 10);
          if (isNaN(credits) || credits <= 0) break;

          const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining")
            .eq("id", userId)
            .single();

          const newBalance = (profile?.credits_remaining ?? 0) + credits;

          await supabase
            .from("profiles")
            .update({
              credits_remaining: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: credits,
            type: "purchase",
            description: `Credit pack — ${credits} credits`,
          });
        }

        // Subscription checkout: plan + credit reset handled by subscription.updated
        break;
      }

      // ── Subscription created or changed ──────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userId = await getUserIdByCustomer(supabase, customerId);
        if (!userId) break;

        const tier = planFromSubscription(subscription);
        if (!tier) break;

        const isActive =
          subscription.status === "active" || subscription.status === "trialing";

        const credits = isActive ? creditsForPlan(tier) : PLANS.free.credits;
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);

        await supabase
          .from("profiles")
          .update({
            plan: isActive ? tier : "free",
            stripe_subscription_id: subscription.id,
            credits_remaining: credits,
            credits_reset_at: nextReset.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (isActive) {
          await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: credits,
            type: "subscription_reset",
            description: `Plan activated — ${credits} credits (${tier} plan)`,
          });
        }

        break;
      }

      // ── Subscription cancelled → downgrade to free ───────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userId = await getUserIdByCustomer(supabase, customerId);
        if (!userId) break;

        await supabase
          .from("profiles")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            credits_remaining: PLANS.free.credits,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        await supabase.from("credit_transactions").insert({
          user_id: userId,
          amount: PLANS.free.credits,
          type: "subscription_reset",
          description: "Subscription cancelled — reset to free plan",
        });

        break;
      }

      // ── Successful renewal invoice → reset credits for the month ─────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // Only process subscription renewal cycles, not the initial subscription invoice
        if (invoice.billing_reason !== "subscription_cycle") break;

        const customerId = invoice.customer as string;
        const userId = await getUserIdByCustomer(supabase, customerId);
        if (!userId) break;

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .single();

        const tier = (profile?.plan as PlanTier | null) ?? "free";
        const credits = creditsForPlan(tier);
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);

        await supabase
          .from("profiles")
          .update({
            credits_remaining: credits,
            credits_reset_at: nextReset.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        await supabase.from("credit_transactions").insert({
          user_id: userId,
          amount: credits,
          type: "subscription_reset",
          description: `Monthly credit reset — ${credits} credits (${tier} plan)`,
        });

        break;
      }

      // ── Payment failure → flag account ───────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userId = await getUserIdByCustomer(supabase, customerId);
        if (!userId) break;

        // Use a dedicated column if you have one; otherwise we mark plan as a sentinel.
        // The billing page reads this and shows a "payment failed" banner.
        await supabase
          .from("profiles")
          .update({
            plan: "payment_failed" as PlanTier,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.warn(
          `[stripe] Payment failed — customer: ${customerId}, user: ${userId}`
        );
        break;
      }

      default:
        // Stripe expects a 200 for all events; unhandled ones are fine
        break;
    }
  } catch (err) {
    console.error(`[stripe] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
