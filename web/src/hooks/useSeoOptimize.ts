"use client";

import { useMutation } from "@tanstack/react-query";
import { useCredits } from "./useCredits";

interface SeoInput {
  topic: string;
  scriptContent?: string;
  targetAudience?: string;
  channelNiche?: string;
}

interface SeoResult {
  titles: string[];
  description: string;
  tags: string[];
  chapters: string[];
  ctrScore: number;
  creditsRemaining: number;
}

async function fetchSeo(input: SeoInput): Promise<SeoResult> {
  const response = await fetch("/api/seo/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "SEO optimization failed" }));
    throw new Error(err.message ?? "SEO optimization failed");
  }

  return response.json() as Promise<SeoResult>;
}

export function useSeoOptimize() {
  const { optimisticDeduct, setBalance } = useCredits();

  return useMutation({
    mutationFn: fetchSeo,
    onMutate: () => {
      optimisticDeduct(2);
    },
    onSuccess: (data) => {
      setBalance(data.creditsRemaining);
    },
  });
}
