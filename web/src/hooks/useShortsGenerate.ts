"use client";

import { useMutation } from "@tanstack/react-query";
import { useCredits } from "./useCredits";

interface ShortsInput {
  sourceTitle: string;
  sourceUrl?: string;
  count?: number;
  style?: "highlights" | "hooks" | "tips";
}

export interface ShortIdea {
  title: string;
  hook: string;
  keyPoints: string[];
  callToAction: string;
  estimatedDuration: string;
}

interface ShortsResponse {
  shorts: ShortIdea[];
  creditsRemaining: number;
  creditsUsed: number;
}

async function fetchShorts(input: ShortsInput): Promise<ShortsResponse> {
  const response = await fetch("/api/shorts/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Shorts generation failed" }));
    throw new Error(err.message ?? "Shorts generation failed");
  }

  return response.json() as Promise<ShortsResponse>;
}

export function useShortsGenerate() {
  const { optimisticDeduct, setBalance } = useCredits();

  return useMutation({
    mutationFn: fetchShorts,
    onMutate: () => {
      optimisticDeduct(6);
    },
    onSuccess: (data) => {
      setBalance(data.creditsRemaining);
    },
  });
}
