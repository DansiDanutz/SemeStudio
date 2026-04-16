"use client";

import { useMutation } from "@tanstack/react-query";
import { useCredits } from "./useCredits";

interface ResearchInput {
  keyword: string;
  channelNiche?: string;
}

interface TopicResult {
  keyword: string;
  searchVolumeScore: number;
  competitionScore: number;
  trendDirection: "rising" | "stable" | "declining";
  opportunityScore: number;
  relatedKeywords: string[];
  videoIdeas: string[];
}

interface ResearchResponse {
  topics: TopicResult[];
  creditsRemaining: number;
}

async function fetchResearch(input: ResearchInput): Promise<ResearchResponse> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Research failed" }));
    throw new Error(err.message ?? "Research failed");
  }

  return response.json() as Promise<ResearchResponse>;
}

export function useResearch() {
  const { optimisticDeduct, setBalance } = useCredits();

  return useMutation({
    mutationFn: fetchResearch,
    onMutate: () => {
      optimisticDeduct(1);
    },
    onSuccess: (data) => {
      setBalance(data.creditsRemaining);
    },
    onError: () => {
      // Re-fetch to correct optimistic update
      setBalance(-1); // Will be corrected by invalidation
    },
  });
}
