"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { CREDIT_COSTS } from "@/lib/stripe";
import type { CreditActionType } from "@/types";

const SKIP_CONFIRM_KEY = "semestudio:skip_credit_confirm";

function getSkipConfirm(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SKIP_CONFIRM_KEY) === "true";
}

function setSkipConfirm(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(SKIP_CONFIRM_KEY, "true");
  } else {
    localStorage.removeItem(SKIP_CONFIRM_KEY);
  }
}

const ACTION_LABELS: Record<CreditActionType, string> = {
  ai_script: "AI Script Generation",
  ai_thumbnail: "AI Thumbnail Generation",
  ai_seo: "SEO Optimization",
  transcription: "Video Transcription",
  research: "Topic Research",
  shorts_factory: "Shorts Factory",
};

interface ConfirmState {
  actionType: CreditActionType;
  cost: number;
  resolve: (confirmed: boolean) => void;
}

/**
 * useCreditDeduction — shows a confirmation dialog before spending credits.
 *
 * Usage:
 *   const { confirmDeduction, ConfirmDialog } = useCreditDeduction();
 *
 *   // In your handler:
 *   const ok = await confirmDeduction("ai_script");
 *   if (!ok) return;
 *   // proceed with the AI call
 *
 * Render <ConfirmDialog /> once anywhere in your component tree (or at the
 * page level). The hook handles its own open/close state.
 */
export function useCreditDeduction() {
  const { credits } = useCredits();
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  // Track a stable ref so the callback never re-triggers renders
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  /**
   * Request confirmation before spending credits for `actionType`.
   * Returns a Promise<boolean>:
   *   true  — user confirmed (or "don't show again" was set previously)
   *   false — user cancelled or has insufficient credits
   */
  const confirmDeduction = useCallback(
    (actionType: CreditActionType): Promise<boolean> => {
      const cost = CREDIT_COSTS[actionType];

      // Hard block: not enough credits
      if (credits < cost) {
        return Promise.resolve(false);
      }

      // Skip dialog if the user opted out previously
      if (getSkipConfirm()) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setDontShowAgain(false);
        setConfirmState({ actionType, cost, resolve });
      });
    },
    [credits]
  );

  function handleConfirm() {
    if (dontShowAgain) setSkipConfirm(true);
    resolveRef.current?.(true);
    resolveRef.current = null;
    setConfirmState(null);
  }

  function handleCancel() {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setConfirmState(null);
  }

  function handleGetMoreCredits() {
    handleCancel();
    router.push("/settings/billing");
  }

  const insufficient =
    confirmState !== null && credits < confirmState.cost;

  const ConfirmDialog = (
    <Dialog
      open={confirmState !== null}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent className="bg-[#111] border-[#222] max-w-sm">
        <DialogHeader>
          <div className="h-12 w-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-3">
            <Coins className="h-6 w-6 text-[#7C3AED]" />
          </div>
          <DialogTitle className="text-[#FAFAFA]">
            {insufficient ? "Insufficient credits" : "Confirm credit use"}
          </DialogTitle>
          <DialogDescription className="space-y-2 text-[#52525B]">
            <div>
              {insufficient ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-semibold text-amber-300">
                      {ACTION_LABELS[confirmState!.actionType]}
                    </span>{" "}
                    costs{" "}
                    <span className="font-semibold text-amber-300">
                      {confirmState!.cost} credits
                    </span>
                    . You only have{" "}
                    <span className="font-semibold text-amber-300">{credits}</span>.
                  </span>
                </div>
              ) : (
                <>
                  <p>
                    <span className="text-[#A1A1AA] font-medium">
                      {confirmState && ACTION_LABELS[confirmState.actionType]}
                    </span>{" "}
                    will use{" "}
                    <span className="text-[#FAFAFA] font-bold">
                      {confirmState?.cost} credits
                    </span>
                    .
                  </p>
                  <p>
                    You currently have{" "}
                    <span className="text-[#FAFAFA] font-bold">{credits} credits</span>{" "}
                    remaining.
                  </p>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {!insufficient && (
          <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#333] accent-[#7C3AED]"
            />
            <span className="text-xs text-[#52525B]">Don&apos;t show again</span>
          </label>
        )}

        <div className="flex gap-2 mt-4">
          {insufficient ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-[#222] text-[#52525B]"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                onClick={handleGetMoreCredits}
              >
                <Coins className="h-3.5 w-3.5 mr-1" />
                Get More Credits
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-[#222] text-[#52525B]"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                onClick={handleConfirm}
              >
                Use {confirmState?.cost} credits
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return { confirmDeduction, ConfirmDialog };
}
