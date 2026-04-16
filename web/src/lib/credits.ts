import type { CreditActionType, CreditTransaction } from "@/types";
import { CREDIT_COSTS } from "./stripe";

const DESCRIPTION_MAP: Record<CreditActionType, string> = {
  ai_script: "AI Script Generation",
  ai_thumbnail: "AI Thumbnail Generation",
  ai_seo: "SEO Optimization",
  transcription: "Video Transcription",
  research: "Topic Research",
  shorts_factory: "Shorts Factory",
};

/**
 * Get user's current credit balance.
 * In production, this queries Supabase.
 * Returns mock data when Supabase is not configured.
 */
export async function getUserCredits(
  _userId: string
): Promise<{ remaining: number; total: number; resetAt: string }> {
  // Mock for development — replace with Supabase query
  return {
    remaining: 45,
    total: 100,
    resetAt: new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000
    ).toISOString(),
  };
}

/**
 * Deduct credits for an AI action.
 * Returns the transaction or throws if insufficient balance.
 */
export async function deductCredits(
  userId: string,
  actionType: CreditActionType
): Promise<CreditTransaction> {
  const cost = CREDIT_COSTS[actionType];
  const { remaining } = await getUserCredits(userId);

  if (remaining < cost) {
    throw new Error(
      `Insufficient credits. Need ${cost}, have ${remaining}.`
    );
  }

  // Mock transaction — replace with Supabase insert + profile update
  const transaction: CreditTransaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    amount: -cost,
    type: actionType,
    description: DESCRIPTION_MAP[actionType],
    created_at: new Date().toISOString(),
  };

  return transaction;
}

/**
 * Add credits (purchase or subscription reset).
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransaction["type"],
  description: string
): Promise<CreditTransaction> {
  const transaction: CreditTransaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    amount,
    type,
    description,
    created_at: new Date().toISOString(),
  };

  return transaction;
}

export function getCreditCost(actionType: CreditActionType): number {
  return CREDIT_COSTS[actionType];
}
