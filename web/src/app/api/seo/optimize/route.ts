import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  authenticateAndCheckCredits,
  deductAndLog,
  apiError,
  type AuthenticatedContext,
} from "@/lib/api-helpers";

interface SeoInput {
  topic: string;
  scriptContent?: string;
  targetAudience?: string;
  channelNiche?: string;
}

interface SeoOutput {
  titles: string[];
  description: string;
  tags: string[];
  chapters: string[];
  ctrScore: number;
}

const SYSTEM_PROMPT = `You are a YouTube SEO expert. Optimize video metadata for maximum CTR and discoverability.

Rules:
- Titles should be under 60 characters, use power words, create curiosity
- Description should be 3000-5000 characters with keyword density 1-2%
- Include timestamps placeholder section
- Tags should be a mix of broad and specific keywords
- Chapters should have clear timestamps

Output ONLY valid JSON:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "description": "Full description text with links section and timestamps section...",
  "tags": ["tag1", "tag2", ...up to 30 tags],
  "chapters": ["0:00 Introduction", "1:30 Main Content", ...],
  "ctrScore": 78
}`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SeoInput>;

    if (!body.topic || typeof body.topic !== "string" || body.topic.trim().length === 0) {
      return apiError("topic is required.", 400, "invalid_input");
    }

    const input: SeoInput = {
      topic: body.topic.trim(),
      scriptContent: body.scriptContent?.trim(),
      targetAudience: body.targetAudience?.trim(),
      channelNiche: body.channelNiche?.trim(),
    };

    const ctx = await authenticateAndCheckCredits("ai_seo");
    if (ctx instanceof NextResponse) return ctx;

    const openaiKey = process.env.OPENAI_API_KEY;

    let seoResult: SeoOutput;
    if (!openaiKey) {
      seoResult = buildMockSeo(input);
    } else {
      seoResult = await generateSeo(openaiKey, input);
    }

    const { creditsRemaining } = await deductAndLog(
      ctx,
      "ai_seo",
      `SEO optimization: "${input.topic}"`
    );

    await saveSeo(ctx, input, seoResult);

    return NextResponse.json({ ...seoResult, creditsRemaining });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SEO optimization failed";
    return apiError(message, 500);
  }
}

async function generateSeo(apiKey: string, input: SeoInput): Promise<SeoOutput> {
  const openai = new OpenAI({ apiKey });

  const userPrompt = `Optimize YouTube SEO for:
- Topic: ${input.topic}
${input.targetAudience ? `- Target Audience: ${input.targetAudience}` : ""}
${input.channelNiche ? `- Channel Niche: ${input.channelNiche}` : ""}
${input.scriptContent ? `- Script excerpt (first 500 chars): ${input.scriptContent.slice(0, 500)}` : ""}

Generate 5 click-worthy title variants, a comprehensive description, 30 optimized tags, chapter suggestions, and a CTR prediction score.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content ?? "";

  try {
    return JSON.parse(content) as SeoOutput;
  } catch {
    return buildMockSeo(input);
  }
}

function buildMockSeo(input: SeoInput): SeoOutput {
  const topic = input.topic;
  return {
    titles: [
      `${topic} - The Ultimate Guide (2026)`,
      `I Tried ${topic} for 30 Days, Here's What Happened`,
      `${topic}: What NOBODY Tells You`,
      `Stop Making This ${topic} Mistake (Do THIS Instead)`,
      `The Truth About ${topic} That Experts Won't Share`,
    ],
    description: `In this video, I break down everything you need to know about ${topic}.

Whether you're a complete beginner or experienced, this guide covers all the essential strategies and tips to help you succeed.

TIMESTAMPS:
0:00 - Introduction
1:30 - What is ${topic}?
3:00 - Common Mistakes to Avoid
5:00 - Step-by-Step Guide
8:00 - Advanced Tips
10:00 - Final Thoughts

RESOURCES MENTIONED:
(Links will be added here)

CONNECT WITH ME:
Subscribe for more content like this!
Turn on notifications so you never miss an upload.

#${topic.replace(/\s+/g, "")} #Tutorial #Guide

DISCLAIMER:
This video is for educational purposes only. Always do your own research before making any decisions.`,
    tags: [
      topic,
      `${topic} tutorial`,
      `${topic} 2026`,
      `${topic} guide`,
      `${topic} for beginners`,
      `how to ${topic}`,
      `best ${topic}`,
      `${topic} tips`,
      `${topic} explained`,
      `${topic} review`,
      `learn ${topic}`,
      `${topic} strategy`,
      `${topic} mistakes`,
      `${topic} step by step`,
      `${topic} advanced`,
      `${topic} basics`,
      `${topic} complete guide`,
      `what is ${topic}`,
      `${topic} 101`,
      `${topic} masterclass`,
      `${topic} secrets`,
      `${topic} hack`,
      `${topic} pros and cons`,
      `${topic} comparison`,
      `${topic} beginner`,
      `${topic} expert`,
      `${topic} walkthrough`,
      `${topic} deep dive`,
      `${topic} analysis`,
      `${topic} trends`,
    ],
    chapters: [
      "0:00 Introduction",
      "1:30 What You Need to Know",
      "3:00 Common Mistakes",
      "5:00 Step-by-Step Guide",
      "8:00 Advanced Tips",
      "10:00 Final Thoughts & CTA",
    ],
    ctrScore: 72,
  };
}

async function saveSeo(
  ctx: AuthenticatedContext,
  input: SeoInput,
  seo: SeoOutput
): Promise<void> {
  await ctx.supabase.from("yt_seo_configs").insert({
    user_id: ctx.user.id,
    input_topic: input.topic,
    titles: seo.titles,
    description: seo.description,
    tags: seo.tags,
    chapters: seo.chapters,
    ctr_score: seo.ctrScore,
    credits_used: 2,
  });
}
