"use client";

import { useState, useCallback, useRef } from "react";
import { useCredits } from "./useCredits";
import type { ScriptStyle } from "@/types";

interface ScriptInput {
  topic: string;
  targetAudience?: string;
  durationMinutes?: number;
  style?: ScriptStyle;
  videoId?: string;
}

interface ScriptSection {
  section: string;
  duration: string;
  content: string;
  brollSuggestions: string[];
}

interface ScriptResult {
  hook: string;
  outline: ScriptSection[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
}

interface UseScriptGenerateReturn {
  generate: (input: ScriptInput) => Promise<ScriptResult | null>;
  streamedText: string;
  script: ScriptResult | null;
  isGenerating: boolean;
  error: string | null;
  reset: () => void;
}

export function useScriptGenerate(): UseScriptGenerateReturn {
  const [streamedText, setStreamedText] = useState("");
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { optimisticDeduct, setBalance, invalidate } = useCredits();

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStreamedText("");
    setScript(null);
    setIsGenerating(false);
    setError(null);
  }, []);

  const generate = useCallback(
    async (input: ScriptInput): Promise<ScriptResult | null> => {
      reset();
      setIsGenerating(true);
      optimisticDeduct(5);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/scripts/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: "Generation failed" }));
          throw new Error(err.message ?? "Script generation failed");
        }

        const contentType = response.headers.get("content-type") ?? "";

        // Non-streaming response (mock mode)
        if (contentType.includes("application/json")) {
          const data = await response.json();
          const result: ScriptResult = {
            hook: data.hook,
            outline: data.outline,
            fullScript: data.fullScript,
            wordCount: data.wordCount,
            estimatedDuration: data.estimatedDuration,
          };
          setScript(result);
          setStreamedText(result.fullScript);
          if (typeof data.creditsRemaining === "number") {
            setBalance(data.creditsRemaining);
          }
          setIsGenerating(false);
          return result;
        }

        // Streaming SSE response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let finalResult: ScriptResult | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.chunk) {
                accumulated += event.chunk;
                setStreamedText(accumulated);
              }

              if (event.done && event.script) {
                finalResult = event.script as ScriptResult;
                setScript(finalResult);
                if (typeof event.creditsRemaining === "number") {
                  setBalance(event.creditsRemaining);
                }
              }

              if (event.error) {
                throw new Error(event.error);
              }
            } catch (parseErr) {
              // Skip malformed SSE chunks
              if (parseErr instanceof Error && parseErr.message !== jsonStr) {
                throw parseErr;
              }
            }
          }
        }

        setIsGenerating(false);
        return finalResult;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsGenerating(false);
          return null;
        }
        const message = err instanceof Error ? err.message : "Script generation failed";
        setError(message);
        setIsGenerating(false);
        invalidate();
        return null;
      }
    },
    [reset, optimisticDeduct, setBalance, invalidate]
  );

  return { generate, streamedText, script, isGenerating, error, reset };
}
