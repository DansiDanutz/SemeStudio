"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlanTier } from "@/types";

interface CreditBalance {
  creditsRemaining: number;
  plan: PlanTier;
  resetAt: string;
}

const CREDITS_QUERY_KEY = ["credits", "balance"] as const;

async function fetchCredits(): Promise<CreditBalance> {
  const response = await fetch("/api/credits/balance");

  if (!response.ok) {
    if (response.status === 401) {
      return { creditsRemaining: 0, plan: "free", resetAt: "" };
    }
    throw new Error("Failed to fetch credit balance");
  }

  return response.json() as Promise<CreditBalance>;
}

export function useCredits() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CREDITS_QUERY_KEY,
    queryFn: fetchCredits,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CREDITS_QUERY_KEY });

  /** Optimistically update the displayed balance after an AI call. */
  const optimisticDeduct = (amount: number) => {
    queryClient.setQueryData<CreditBalance>(CREDITS_QUERY_KEY, (prev) => {
      if (!prev) return prev;
      return { ...prev, creditsRemaining: Math.max(0, prev.creditsRemaining - amount) };
    });
  };

  /** Set exact balance (from API response). */
  const setBalance = (newBalance: number) => {
    queryClient.setQueryData<CreditBalance>(CREDITS_QUERY_KEY, (prev) => {
      if (!prev) return prev;
      return { ...prev, creditsRemaining: newBalance };
    });
  };

  return {
    credits: query.data?.creditsRemaining ?? 0,
    plan: query.data?.plan ?? "free",
    resetAt: query.data?.resetAt ?? "",
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
    optimisticDeduct,
    setBalance,
  };
}
