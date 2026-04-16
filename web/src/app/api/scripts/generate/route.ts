import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  authenticateAndCheckCredits,
  deductAndLog,
  apiError,
  type AuthenticatedContext,
} from "@/lib/api-helpers";
import type { ScriptStyle } from "@/types";

interface ScriptInput {
  topic: string;
  targetAudience: string;
  durationMinutes: number;
  style: ScriptStyle;
  videoId?: string;
}

const VALID_STYLES: ScriptStyle[] = [
  "educational",
  "tutorial",
  "opinion",
  "story",
  "review",
  "news",
];

const SYSTEM_PROMPT = `You are an expert YouTube scriptwriter. Write engaging, high-retention scripts optimized for viewer watch time.

Rules:
- Start with a powerful hook (first 5-10 seconds) that creates curiosity
- Use pattern interrupts every 60-90 seconds to maintain attention
- Write in a conversational, natural tone
- Include B-roll suggestions in brackets [B-ROLL: description]
- Use open loops to keep viewers watching
- End with a strong call-to-action

Output ONLY valid JSON matching this structure:
{
  "hook": "The opening hook text (first 10 seconds)",
  "outline": [
    {
      "section": "Section title",
      "duration": "estimated duration like 2:00",
      "content": "Full script content for this section",
      "brollSuggestions": ["suggestion 1", "suggestion 2"]
    }
  ],
  "fullScript": "The complete script as one continuous text",
  "wordCount": 1500,
  "estimatedDuration": "10:00"
}`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ScriptInput>;

    const validation = validateInput(body);
    if (validation) return validation;

    const input: ScriptInput = {
      topic: body.topic!.trim(),
      targetAudience: body.targetAudience?.trim() ?? "General YouTube audience",
      durationMinutes: body.durationMinutes ?? 10,
      style: body.style ?? "educational",
      videoId: body.videoId,
    };

    const ctx = await authenticateAndCheckCredits("ai_script");
    if (ctx instanceof NextResponse) return ctx;

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      // Return mock streamed response when OpenAI is not configured
      const mockScript = buildMockScript(input);
      const { creditsRemaining } = await deductAndLog(
        ctx,
        "ai_script",
        `Script: "${input.topic}"`
      );
      await saveScript(ctx, input, mockScript);
      return NextResponse.json({ ...mockScript, creditsRemaining });
    }

    // Stream response from OpenAI
    const openai = new OpenAI({ apiKey: openaiKey });
    const userPrompt = buildUserPrompt(input);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              fullContent += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk: delta })}\n\n`)
              );
            }
          }

          // Parse the full response and save
          let parsedScript: ScriptResponse;
          try {
            parsedScript = JSON.parse(fullContent) as ScriptResponse;
          } catch {
            parsedScript = buildFallbackScript(fullContent, input);
          }

          const { creditsRemaining } = await deductAndLog(
            ctx,
            "ai_script",
            `Script: "${input.topic}"`
          );

          await saveScript(ctx, input, parsedScript);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                script: parsedScript,
                creditsRemaining,
              })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream failed";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Script generation failed";
    return apiError(message, 500);
  }
}

interface ScriptSection {
  section: string;
  duration: string;
  content: string;
  brollSuggestions: string[];
}

interface ScriptResponse {
  hook: string;
  outline: ScriptSection[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
}

function validateInput(body: Partial<ScriptInput>): NextResponse | null {
  if (!body.topic || typeof body.topic !== "string" || body.topic.trim().length === 0) {
    return apiError("topic is required.", 400, "invalid_input");
  }
  if (body.durationMinutes !== undefined) {
    const dur = Number(body.durationMinutes);
    if (isNaN(dur) || dur < 1 || dur > 60) {
      return apiError("durationMinutes must be between 1 and 60.", 400, "invalid_input");
    }
  }
  if (body.style && !VALID_STYLES.includes(body.style)) {
    return apiError(`style must be one of: ${VALID_STYLES.join(", ")}`, 400, "invalid_input");
  }
  return null;
}

function buildUserPrompt(input: ScriptInput): string {
  return `Write a YouTube script with these specifications:
- Topic: ${input.topic}
- Target Audience: ${input.targetAudience}
- Duration: ${input.durationMinutes} minutes (approximately ${input.durationMinutes * 150} words)
- Style: ${input.style}

Make the hook irresistible. Write the full script with B-roll suggestions. Optimize for retention.`;
}

function buildMockScript(input: ScriptInput): ScriptResponse {
  const wordTarget = input.durationMinutes * 150;
  return {
    hook: `What if I told you that 90% of people get ${input.topic} completely wrong? In the next ${input.durationMinutes} minutes, I'll show you exactly why - and how to actually do it right.`,
    outline: [
      {
        section: "Hook & Introduction",
        duration: "0:30",
        content: `What if I told you that 90% of people get ${input.topic} completely wrong? I spent weeks researching this, and what I found will change how you think about it forever.`,
        brollSuggestions: [
          "Quick montage of common misconceptions",
          "Text overlay with shocking statistic",
        ],
      },
      {
        section: "The Problem",
        duration: `${Math.floor(input.durationMinutes * 0.2)}:00`,
        content: `Here's the thing about ${input.topic} that nobody talks about. Most ${input.targetAudience || "people"} approach this completely backwards, and it's costing them time, money, or both.`,
        brollSuggestions: [
          "Screen recording of common mistake",
          "Comparison graphic",
        ],
      },
      {
        section: "The Solution",
        duration: `${Math.floor(input.durationMinutes * 0.5)}:00`,
        content: `Now let me walk you through the exact process I use. Step one is understanding the fundamentals. Step two is applying them in the right order. And step three - this is the one most people skip - is actually measuring your results.`,
        brollSuggestions: [
          "Step-by-step walkthrough",
          "Before/after comparison",
          "Screen capture of tool being used",
        ],
      },
      {
        section: "Conclusion & CTA",
        duration: "0:45",
        content: `Now you have everything you need to master ${input.topic}. If this was helpful, smash that like button and subscribe for more content like this. Drop a comment below telling me which tip was most useful - I read every single one.`,
        brollSuggestions: ["Subscribe animation", "End screen with related videos"],
      },
    ],
    fullScript: `What if I told you that 90% of people get ${input.topic} completely wrong? In the next ${input.durationMinutes} minutes, I'll show you exactly why - and how to actually do it right.\n\nHere's the thing that nobody talks about. Most ${input.targetAudience || "people"} approach this completely backwards...\n\n[This is a mock script. Connect your OpenAI API key for real AI-generated scripts.]`,
    wordCount: wordTarget,
    estimatedDuration: `${input.durationMinutes}:00`,
  };
}

function buildFallbackScript(rawContent: string, input: ScriptInput): ScriptResponse {
  const words = rawContent.split(/\s+/).length;
  return {
    hook: rawContent.slice(0, 200),
    outline: [
      {
        section: "Full Script",
        duration: `${input.durationMinutes}:00`,
        content: rawContent,
        brollSuggestions: [],
      },
    ],
    fullScript: rawContent,
    wordCount: words,
    estimatedDuration: `${input.durationMinutes}:00`,
  };
}

async function saveScript(
  ctx: AuthenticatedContext,
  input: ScriptInput,
  script: ScriptResponse
): Promise<void> {
  await ctx.supabase.from("yt_scripts").insert({
    user_id: ctx.user.id,
    video_id: input.videoId ?? null,
    topic: input.topic,
    target_audience: input.targetAudience,
    duration_minutes: input.durationMinutes,
    style: input.style,
    content: JSON.stringify(script),
    word_count: script.wordCount,
    status: "complete",
    credits_used: 5,
  });
}
