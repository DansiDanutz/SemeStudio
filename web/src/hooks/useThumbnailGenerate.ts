"use client";

import { useMutation } from "@tanstack/react-query";
import { useCredits } from "./useCredits";
import type { ThumbnailStyle } from "@/types";

interface ThumbnailInput {
  title: string;
  style?: ThumbnailStyle;
  colorTheme?: string;
  videoId?: string;
  variants?: number;
}

interface ThumbnailVariant {
  url: string;
  variantIndex: number;
  revisedPrompt: string;
}

interface ThumbnailResult {
  variants: ThumbnailVariant[];
  creditsUsed: number;
  creditsRemaining: number;
}

async function fetchThumbnails(input: ThumbnailInput): Promise<ThumbnailResult> {
  const response = await fetch("/api/thumbnails/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Thumbnail generation failed" }));
    throw new Error(err.message ?? "Thumbnail generation failed");
  }

  return response.json() as Promise<ThumbnailResult>;
}

export function useThumbnailGenerate() {
  const { optimisticDeduct, setBalance } = useCredits();

  return useMutation({
    mutationFn: fetchThumbnails,
    onMutate: (variables) => {
      const count = variables.variants ?? 3;
      optimisticDeduct(3 * count);
    },
    onSuccess: (data) => {
      setBalance(data.creditsRemaining);
    },
  });
}
