"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Check,
  Coins,
  CreditCard,
  ArrowUpRight,
  Zap,
  Crown,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PLANS, CREDIT_PACKS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/client";
import type { Profile, CreditTransaction, PlanTier, PlanStatus } from "@/types";

const PLAN_ORDER: PlanTier[] = ["free", "starter", "pro", "agency"];

function perCreditLabel(price: number, credits: number): string {
  return `$${(price / credits).toFixed(3)}/credit`;
}

function formatResetDate(isoString: string | null): string {
  if (!isoString) return "—";
  try {
    return format(parseISO(isoString), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Load profile + transactions ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const [profileResult, txResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (profileResult.data) setProfile(profileResult.data as Profile);
    if (txResult.data) setTransactions(txResult.data as CreditTransaction[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Handle ?success=true query param ───────────────────────────────────
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful! Your plan and credits have been updated.");
      // Clean the query param without a full page reload
      router.replace("/settings/billing");
      // Re-fetch to get fresh plan data
      void loadData();
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout was cancelled. No charges were made.");
      router.replace("/settings/billing");
    }
  }, [searchParams, router, loadData]);

  // ── Stripe actions ──────────────────────────────────────────────────────
  async function handleUpgrade(priceId: string, planName: string) {
    setActionLoading(`upgrade-${priceId}`);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, type: "subscription" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to upgrade to ${planName}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBuyCreditPack(priceId: string | undefined, credits: number, price: number) {
    if (!priceId) {
      toast.error("This credit pack is not yet configured. Check back soon.");
      return;
    }
    setActionLoading(`credits-${priceId}`);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, type: "credits", credits }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to purchase ${credits} credits for $${price}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleManageSubscription() {
    setActionLoading("portal");
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Portal failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Derived values ──────────────────────────────────────────────────────
  const rawPlan = (profile?.plan ?? "free") as PlanStatus;
  const isPaymentFailed = rawPlan === "payment_failed";
  const currentPlan: PlanTier = isPaymentFailed ? "free" : rawPlan;
  const PAID_TIERS: PlanTier[] = ["starter", "pro", "agency"];
  const isPaidPlan = PAID_TIERS.includes(currentPlan);
  const planData = PLANS[currentPlan] ?? PLANS.free;
  const creditsRemaining = profile?.credits_remaining ?? 0;
  const planCredits = planData.credits;
  const usedCredits = Math.max(0, planCredits - creditsRemaining);
  const usagePercent = planCredits > 0 ? Math.min(100, (usedCredits / planCredits) * 100) : 0;

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <Skeleton className="h-8 w-48 bg-[#1a1a1a]" />
          <Skeleton className="h-4 w-72 bg-[#1a1a1a] mt-2" />
        </div>
        <Skeleton className="h-48 w-full bg-[#1a1a1a] rounded-xl" />
        <Skeleton className="h-40 w-full bg-[#1a1a1a] rounded-xl" />
        <Skeleton className="h-56 w-full bg-[#1a1a1a] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Billing &amp; Credits</h1>
        <p className="text-sm text-[#52525B] mt-1">
          Manage your subscription, credits, and payments
        </p>
      </div>

      {/* Payment failed banner */}
      {isPaymentFailed && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Payment failed</p>
            <p className="text-xs text-amber-500 mt-0.5">
              Your last payment could not be processed. Update your payment method to restore access.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs"
            onClick={handleManageSubscription}
            disabled={actionLoading === "portal"}
          >
            {actionLoading === "portal" ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              "Fix Payment"
            )}
          </Button>
        </div>
      )}

      {/* Current plan card */}
      <Card className="border-[#FF0000]/20 bg-[#111]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#FF0000]/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-[#FF0000]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#FAFAFA]">
                    {isPaidPlan ? planData.name : "Free"} Plan
                  </h3>
                  <Badge className="bg-[#FF0000] text-white border-0 text-[10px]">Current</Badge>
                </div>
                <p className="text-sm text-[#52525B]">
                  {isPaidPlan
                    ? `$${planData.price}/month · Resets ${formatResetDate(profile?.credits_reset_at ?? null)}`
                    : `Free forever · Resets ${formatResetDate(profile?.credits_reset_at ?? null)}`}
                </p>
              </div>
            </div>
            {isPaidPlan && (
              <Button
                variant="outline"
                className="border-[#222] text-[#A1A1AA] hover:text-[#FAFAFA] text-sm"
                onClick={handleManageSubscription}
                disabled={actionLoading === "portal"}
              >
                {actionLoading === "portal" ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A1A1AA]">Credits Used</span>
                <span className="text-sm font-bold text-[#FAFAFA]">
                  {usedCredits} / {planCredits}
                </span>
              </div>
              <Progress value={usagePercent} className="h-2 bg-[#1a1a1a]" />
              <p className="text-xs text-[#52525B] mt-1">{creditsRemaining} credits remaining</p>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-4xl font-black text-[#FAFAFA] tracking-tight">
                  {creditsRemaining}
                </p>
                <p className="text-xs text-[#52525B]">credits left</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit packs */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#7C3AED]" />
            Buy Credit Packs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => {
              const packId = `credits-${pack.priceId ?? pack.credits}`;
              return (
                <div
                  key={pack.credits}
                  className="rounded-xl border border-[#222] bg-[#0a0a0a] p-5 text-center hover:border-[#7C3AED]/30 transition-colors"
                >
                  <Zap className="h-5 w-5 text-[#7C3AED] mx-auto mb-2" />
                  <p className="text-2xl font-black text-[#FAFAFA] tracking-tight">{pack.credits}</p>
                  <p className="text-xs text-[#52525B] mb-3">credits</p>
                  <p className="text-lg font-bold text-[#FAFAFA]">${pack.price}</p>
                  <p className="text-[10px] text-[#52525B] mb-3">
                    {perCreditLabel(pack.price, pack.credits)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs"
                    disabled={actionLoading === packId}
                    onClick={() => handleBuyCreditPack(pack.priceId, pack.credits, pack.price)}
                  >
                    {actionLoading === packId ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Compare Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {PLAN_ORDER.map((tier) => {
              const plan = PLANS[tier];
              const isCurrent = currentPlan === tier || (isPaymentFailed && tier === "free");
              const currentIndex = PLAN_ORDER.indexOf(
                isPaidPlan ? (currentPlan as PlanTier) : "free"
              );
              const thisIndex = PLAN_ORDER.indexOf(tier);
              const isUpgrade = thisIndex > currentIndex;
              const priceId = plan.priceId;

              return (
                <div
                  key={tier}
                  className={`rounded-xl border p-4 text-center ${
                    isCurrent
                      ? "border-[#FF0000]/30 bg-[#FF0000]/5"
                      : "border-[#222] bg-[#0a0a0a]"
                  }`}
                >
                  <p className="text-sm font-bold text-[#FAFAFA] mb-1">{plan.name}</p>
                  <p className="text-2xl font-black text-[#FAFAFA] tracking-tight">
                    ${plan.price}
                    <span className="text-xs text-[#52525B] font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-[#52525B] mt-1 mb-3">{plan.credits} credits</p>

                  <ul className="text-left space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((f: string) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-[#22C55E] mt-0.5 shrink-0" />
                        <span className="text-[10px] text-[#A1A1AA] leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Badge className="bg-[#FF0000] text-white border-0 text-[10px]">Current</Badge>
                  ) : isUpgrade && priceId ? (
                    <Button
                      size="sm"
                      className="bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs w-full"
                      disabled={actionLoading === `upgrade-${priceId}`}
                      onClick={() => handleUpgrade(priceId, plan.name)}
                    >
                      {actionLoading === `upgrade-${priceId}` ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Upgrade
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#222] text-[#52525B] text-xs w-full"
                      disabled
                    >
                      Downgrade
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Credit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-sm text-[#52525B] text-center py-8">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        tx.amount > 0 ? "bg-[#22C55E]/10" : "bg-[#52525B]/10"
                      }`}
                    >
                      <Coins
                        className="h-4 w-4"
                        style={{ color: tx.amount > 0 ? "#22C55E" : "#52525B" }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-[#FAFAFA]">{tx.description}</p>
                      <p className="text-xs text-[#52525B]">
                        {format(parseISO(tx.created_at), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      tx.amount > 0 ? "text-[#22C55E]" : "text-[#A1A1AA]"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount} cr
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
