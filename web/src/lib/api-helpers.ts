import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreditActionType, Profile } from "@/types";
import { CREDIT_COSTS } from "@/lib/stripe";

const DESCRIPTION_MAP: Record<CreditActionType, string> = {
  ai_script: "AI Script Generation",
  ai_thumbnail: "AI Thumbnail Generation",
  ai_seo: "SEO Optimization",
  transcription: "Video Transcription",
  research: "Topic Research",
  shorts_factory: "Shorts Factory",
};

export interface AuthenticatedContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string };
  profile: Pick<Profile, "credits_remaining" | "plan">;
}

/**
 * Authenticate the request and verify the user has enough credits.
 * Returns the context or a NextResponse error.
 */
export async function authenticateAndCheckCredits(
  actionType: CreditActionType
): Promise<AuthenticatedContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be signed in." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits_remaining, plan")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "profile_not_found", message: "User profile not found." },
      { status: 404 }
    );
  }

  const cost = CREDIT_COSTS[actionType];
  if (profile.credits_remaining < cost) {
    return NextResponse.json(
      {
        error: "insufficient_credits",
        message: `You need ${cost} credits but have ${profile.credits_remaining}.`,
        creditsNeeded: cost,
        creditsRemaining: profile.credits_remaining,
      },
      { status: 402 }
    );
  }

  return {
    supabase,
    user: { id: user.id, email: user.email ?? "" },
    profile,
  };
}

/**
 * Deduct credits and log the transaction in a single call.
 */
export async function deductAndLog(
  ctx: AuthenticatedContext,
  actionType: CreditActionType,
  customDescription?: string
): Promise<{ creditsRemaining: number }> {
  const cost = CREDIT_COSTS[actionType];
  const newBalance = ctx.profile.credits_remaining - cost;

  await ctx.supabase
    .from("profiles")
    .update({ credits_remaining: newBalance })
    .eq("id", ctx.user.id);

  await ctx.supabase.from("credit_transactions").insert({
    user_id: ctx.user.id,
    amount: -cost,
    type: actionType,
    description: customDescription ?? DESCRIPTION_MAP[actionType],
  });

  // Update the in-memory profile so subsequent checks are accurate
  ctx.profile = { ...ctx.profile, credits_remaining: newBalance };

  return { creditsRemaining: newBalance };
}

/**
 * Authenticate only (no credit check). For read-only endpoints.
 */
export async function authenticateOnly(): Promise<
  | { supabase: AuthenticatedContext["supabase"]; user: AuthenticatedContext["user"] }
  | NextResponse
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be signed in." },
      { status: 401 }
    );
  }

  return { supabase, user: { id: user.id, email: user.email ?? "" } };
}

/**
 * Standard error response helper.
 */
export function apiError(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  return NextResponse.json(
    { error: code ?? "server_error", message },
    { status }
  );
}
