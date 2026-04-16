"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, ArrowUpRight, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier, PlanStatus } from "@/types";

const PLAN_ORDER: PlanTier[] = ["free", "starter", "pro", "agency"];

interface PlanGuardProps {
  /** Minimum plan required to access the wrapped content. */
  requiredPlan: PlanTier;
  /**
   * Minimum credits required. If set, even a qualifying plan holder will see
   * the upgrade modal when they have fewer credits than this threshold.
   */
  requiredCredits?: number;
  /** Feature name shown in the upgrade modal. */
  featureName?: string;
  /** Content to render when the user has access. */
  children: React.ReactNode;
  /**
   * When true the children are always rendered but wrapped in a locked
   * overlay instead of being hidden. Useful for previewing locked features.
   */
  overlay?: boolean;
}

function planIndex(tier: PlanTier): number {
  return PLAN_ORDER.indexOf(tier);
}

function requiredPlanLabel(tier: PlanTier): string {
  const plan = PLANS[tier as keyof typeof PLANS];
  return plan?.name ?? tier;
}

/**
 * PlanGuard wraps features that require a specific plan or credit balance.
 * It renders the children when the user qualifies, or shows an upgrade modal
 * (and optionally a locked overlay) when they do not.
 */
export function PlanGuard({
  requiredPlan,
  requiredCredits,
  featureName = "this feature",
  children,
  overlay = false,
}: PlanGuardProps) {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<PlanStatus | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data } = await supabase
        .from("profiles")
        .select("plan, credits_remaining")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      setUserPlan((data?.plan as PlanStatus) ?? "free");
      setUserCredits(data?.credits_remaining ?? 0);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Determine access while profile is loading — show nothing (avoid flash)
  if (loading) return null;

  const effectivePlan: PlanTier =
    userPlan === "payment_failed" || userPlan === null ? "free" : userPlan;

  const hasPlanAccess = planIndex(effectivePlan) >= planIndex(requiredPlan);
  const hasCreditAccess =
    requiredCredits === undefined || userCredits >= requiredCredits;
  const hasAccess = hasPlanAccess && hasCreditAccess;

  // If access is granted render children directly
  if (hasAccess) return <>{children}</>;

  // Determine the reason for denial so the modal copy is accurate
  const needsHigherPlan = !hasPlanAccess;
  const targetPlan = needsHigherPlan ? requiredPlan : effectivePlan;

  function handleUpgradeClick() {
    setModalOpen(false);
    router.push("/settings/billing");
  }

  const upgradeModal = (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="bg-[#111] border-[#222] max-w-sm">
        <DialogHeader>
          <div className="h-12 w-12 rounded-xl bg-[#FF0000]/10 flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-[#FF0000]" />
          </div>
          <DialogTitle className="text-[#FAFAFA]">Upgrade to unlock</DialogTitle>
          <DialogDescription className="text-[#52525B]">
            {needsHigherPlan ? (
              <>
                <span className="text-[#A1A1AA] font-medium">{featureName}</span> requires the{" "}
                <Badge className="bg-[#FF0000]/20 text-[#FF0000] border-0 text-[10px] align-middle">
                  {requiredPlanLabel(targetPlan)}
                </Badge>{" "}
                plan or higher.
              </>
            ) : (
              <>
                You need at least{" "}
                <span className="text-[#A1A1AA] font-medium">
                  {requiredCredits} credits
                </span>{" "}
                to use{" "}
                <span className="text-[#A1A1AA] font-medium">{featureName}</span>.
                You currently have{" "}
                <span className="text-[#FF0000] font-medium">{userCredits}</span>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-xl border border-[#222] bg-[#0a0a0a] p-4 space-y-1.5">
          {(PLANS[targetPlan as keyof typeof PLANS]?.features ?? []).map((f: string) => (
            <div key={f} className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-[#FF0000] mt-0.5 shrink-0" />
              <span className="text-xs text-[#A1A1AA]">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-[#222] text-[#52525B]"
            onClick={() => setModalOpen(false)}
          >
            Maybe later
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#FF0000] hover:bg-[#CC0000] text-white"
            onClick={handleUpgradeClick}
          >
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
            {needsHigherPlan ? "Upgrade plan" : "Get more credits"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Overlay mode: render children behind a locked scrim
  if (overlay) {
    return (
      <>
        {upgradeModal}
        <div className="relative">
          <div className="pointer-events-none select-none opacity-40">{children}</div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/60 backdrop-blur-[2px] transition-opacity hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]"
            aria-label={`Unlock ${featureName}`}
          >
            <Lock className="h-6 w-6 text-[#FAFAFA]" />
            <span className="text-xs font-semibold text-[#FAFAFA]">
              {needsHigherPlan
                ? `Requires ${requiredPlanLabel(targetPlan)} plan`
                : `Need ${requiredCredits} credits`}
            </span>
          </button>
        </div>
      </>
    );
  }

  // Default mode: render a compact locked placeholder that opens the modal
  return (
    <>
      {upgradeModal}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#333] bg-[#0a0a0a] px-4 py-6 text-sm text-[#52525B] transition-colors hover:border-[#FF0000]/30 hover:text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]"
        aria-label={`Unlock ${featureName}`}
      >
        <Lock className="h-4 w-4 shrink-0" />
        <span>
          {needsHigherPlan
            ? `${featureName} — requires ${requiredPlanLabel(targetPlan)} plan`
            : `${featureName} — need ${requiredCredits} credits`}
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0" />
      </button>
    </>
  );
}
