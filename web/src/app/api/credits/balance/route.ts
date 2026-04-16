import { NextResponse } from "next/server";
import { authenticateOnly, apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const result = await authenticateOnly();
    if (result instanceof NextResponse) return result;

    const { supabase, user } = result;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits_remaining, plan, credits_reset_at")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return apiError("User profile not found.", 404, "profile_not_found");
    }

    return NextResponse.json({
      creditsRemaining: profile.credits_remaining,
      plan: profile.plan,
      resetAt: profile.credits_reset_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch balance";
    return apiError(message, 500);
  }
}
