import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  authenticateAndCheckCredits,
  deductAndLog,
  apiError,
} from "@/lib/api-helpers";

interface ShortsInput {
  sourceTitle: string;
  sourceUrl?: string;
  count?: number;
  style?: "highlights" | "hooks" | "tips";
}

interface ShortIdea {
  title: string;
  hook: string;
  keyPoints: string[];
  callToAction: string;
  estimatedDuration: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const ctx = await authenticateAndCheckCredits("shorts_factory");
  if (ctx instanceof NextResponse) return ctx;

  let body: ShortsInput;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const { sourceTitle, sourceUrl, count = 3, style = "highlights" } = body;
  if (!sourceTitle?.trim()) {
    return apiError("sourceTitle is required", 400, "missing_field");
  }

  const clampedCount = Math.min(Math.max(count, 1), 5);

  const styleGuide = {
    highlights: "key moments and most impactful insights",
    hooks: "strong hooks and curiosity-gap moments that make viewers want to watch more",
    tips: "actionable quick tips that can each stand alone as a 30-60 second video",
  }[style];

  const prompt = `You are a YouTube Shorts specialist. Given a long-form video titled "${sourceTitle}"${sourceUrl ? ` (${sourceUrl})` : ""}, generate ${clampedCount} Shorts ideas optimized for the YouTube Shorts algorithm.

Focus on ${styleGuide}.

For each Short, provide:
- A punchy title (under 50 chars, no hashtags)
- An attention-grabbing first sentence/hook (under 15 words)
- 3-4 key points to cover
- A call-to-action for the end
- Estimated duration (30-60 seconds)

Return as JSON array: [{ "title", "hook", "keyPoints": [], "callToAction", "estimatedDuration" }]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let shorts: ShortIdea[] = [];

    try {
      const parsed = JSON.parse(raw);
      shorts = Array.isArray(parsed) ? parsed : (parsed.shorts ?? parsed.ideas ?? []);
    } catch {
      return apiError("Failed to parse AI response", 500, "parse_error");
    }

    const { creditsRemaining } = await deductAndLog(
      ctx,
      "shorts_factory",
      `Shorts Factory: ${clampedCount} shorts from "${sourceTitle}"`
    );

    // Save to DB
    await ctx.supabase.from("yt_research_topics").insert({
      user_id: ctx.user.id,
      query: `shorts:${sourceTitle}`,
      topics: shorts,
      credits_used: 6,
    });

    return NextResponse.json({ shorts, creditsRemaining, creditsUsed: 6 });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      return apiError(`OpenAI error: ${err.message}`, 502, "openai_error");
    }
    return apiError("Shorts generation failed", 500);
  }
}
