import { NextResponse } from "next/server";
import { authenticateOnly, apiError } from "@/lib/api-helpers";
import type { CreditActionType } from "@/types";

interface DeductInput {
  amount: number;
  type: CreditActionType | "purchase" | "subscription_reset" | "bonus";
  description: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DeductInput>;

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return apiError("amount must be a positive number.", 400, "invalid_input");
    }
    if (!body.type || typeof body.type !== "string") {
      return apiError("type is required.", 400, "invalid_input");
    }
    if (!body.description || typeof body.description !== "string") {
      return apiError("description is required.", 400, "invalid_input");
    }

    const result = await authenticateOnly();
    if (result instanceof NextResponse) return result;

    const { supabase, user } = result;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits_remaining")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return apiError("User profile not found.", 404, "profile_not_found");
    }

    if (profile.credits_remaining < body.amount) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          message: `Need ${body.amount} credits, have ${profile.credits_remaining}.`,
          creditsNeeded: body.amount,
          creditsRemaining: profile.credits_remaining,
        },
        { status: 402 }
      );
    }

    const newBalance = profile.credits_remaining - body.amount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits_remaining: newBalance })
      .eq("id", user.id);

    if (updateError) {
      return apiError("Failed to deduct credits.", 500, "update_failed");
    }

    const { error: txError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount: -body.amount,
        type: body.type,
        description: body.description,
      });

    if (txError) {
      console.error("Failed to log credit transaction:", txError);
    }

    return NextResponse.json({
      success: true,
      creditsRemaining: newBalance,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Credit deduction failed";
    return apiError(message, 500);
  }
}
