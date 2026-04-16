import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  authenticateAndCheckCredits,
  deductAndLog,
  apiError,
  type AuthenticatedContext,
} from "@/lib/api-helpers";
import type { ThumbnailStyle } from "@/types";

interface ThumbnailInput {
  title: string;
  style: ThumbnailStyle;
  colorTheme: string;
  videoId?: string;
  variants?: number;
}

interface ThumbnailVariant {
  url: string;
  variantIndex: number;
  revisedPrompt: string;
}

const VALID_STYLES: ThumbnailStyle[] = [
  "minimal",
  "bold",
  "face_text",
  "cinematic",
  "meme",
  "tutorial",
];

const STYLE_PROMPTS: Record<ThumbnailStyle, string> = {
  minimal: "Clean, minimalist design with lots of whitespace, simple bold text, single focal element",
  bold: "Eye-catching bold design with large text, bright contrasting colors, dramatic composition",
  face_text: "Expressive face reaction on one side, large bold text on the other, split composition",
  cinematic: "Cinematic wide-angle shot, movie poster quality, dramatic lighting, film grain",
  meme: "Meme-style layout, relatable expressions, internet culture aesthetic, bold impact font",
  tutorial: "Screen recording overlay style, numbered steps visible, clean professional look, tech aesthetic",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ThumbnailInput>;

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return apiError("title is required.", 400, "invalid_input");
    }

    if (body.style && !VALID_STYLES.includes(body.style)) {
      return apiError(`style must be one of: ${VALID_STYLES.join(", ")}`, 400, "invalid_input");
    }

    const variantCount = Math.min(body.variants ?? 3, 3);
    const totalCost = 3 * variantCount;

    const input: ThumbnailInput = {
      title: body.title.trim(),
      style: body.style ?? "bold",
      colorTheme: body.colorTheme?.trim() ?? "vibrant",
      videoId: body.videoId,
      variants: variantCount,
    };

    const ctx = await authenticateAndCheckCredits("ai_thumbnail");
    if (ctx instanceof NextResponse) return ctx;

    // Check total cost (3 credits per variant)
    if (ctx.profile.credits_remaining < totalCost) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          message: `You need ${totalCost} credits for ${variantCount} variants but have ${ctx.profile.credits_remaining}.`,
          creditsNeeded: totalCost,
          creditsRemaining: ctx.profile.credits_remaining,
        },
        { status: 402 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    let variants: ThumbnailVariant[];
    if (!openaiKey) {
      variants = buildMockThumbnails(input);
    } else {
      variants = await generateThumbnails(openaiKey, input);
    }

    // Deduct 3 credits per variant actually generated
    for (let i = 0; i < variants.length; i++) {
      const desc = `Thumbnail variant ${i + 1}: "${input.title}"`;
      await deductAndLog(ctx, "ai_thumbnail", desc);
    }

    await saveThumbnails(ctx, input, variants);

    return NextResponse.json({
      variants,
      creditsUsed: 3 * variants.length,
      creditsRemaining: ctx.profile.credits_remaining,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Thumbnail generation failed";
    return apiError(message, 500);
  }
}

async function generateThumbnails(
  apiKey: string,
  input: ThumbnailInput
): Promise<ThumbnailVariant[]> {
  const openai = new OpenAI({ apiKey });
  const count = input.variants ?? 3;
  const styleGuide = STYLE_PROMPTS[input.style];

  const prompt = `YouTube thumbnail for: "${input.title}"
Style: ${styleGuide}
Color theme: ${input.colorTheme}
Requirements:
- Eye-catching at small sizes (mobile feed)
- High contrast and readability
- Professional quality, not AI-looking
- No small text, no cluttered elements
- Bold visual that creates curiosity`;

  const results: ThumbnailVariant[] = [];

  // Generate variants in parallel
  const promises = Array.from({ length: count }, (_, i) =>
    openai.images
      .generate({
        model: "dall-e-3",
        prompt: `${prompt}\nVariant ${i + 1} - unique angle/composition`,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      })
      .then((response) => ({
        url: response.data?.[0]?.url ?? "",
        variantIndex: i,
        revisedPrompt: response.data?.[0]?.revised_prompt ?? prompt,
      }))
      .catch(() => ({
        url: "",
        variantIndex: i,
        revisedPrompt: "Generation failed for this variant",
      }))
  );

  const settled = await Promise.all(promises);
  for (const result of settled) {
    if (result.url) {
      results.push(result);
    }
  }

  if (results.length === 0) {
    return buildMockThumbnails(input);
  }

  return results;
}

function buildMockThumbnails(input: ThumbnailInput): ThumbnailVariant[] {
  const count = input.variants ?? 3;
  return Array.from({ length: count }, (_, i) => ({
    url: `https://placehold.co/1792x1024/1a1a2e/ffffff?text=${encodeURIComponent(
      input.title.slice(0, 30)
    )}+v${i + 1}`,
    variantIndex: i,
    revisedPrompt: `Mock thumbnail for: ${input.title} (variant ${i + 1}). Connect OpenAI API key for real DALL-E 3 generation.`,
  }));
}

async function saveThumbnails(
  ctx: AuthenticatedContext,
  input: ThumbnailInput,
  variants: ThumbnailVariant[]
): Promise<void> {
  const rows = variants.map((v) => ({
    user_id: ctx.user.id,
    video_id: input.videoId ?? null,
    title: input.title,
    style: input.style,
    color_theme: input.colorTheme,
    image_url: v.url,
    variant_index: v.variantIndex,
    selected: v.variantIndex === 0,
    credits_used: 3,
  }));

  await ctx.supabase.from("yt_thumbnails").insert(rows);
}
