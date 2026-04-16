"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface SeoResult {
  titles: string[];
  description: string;
  tags: string[];
  chapters: string[];
  ctrScore: number;
}

const MOCK_SEO: SeoResult = {
  titles: [
    "Bitcoin ETF Explained: Everything You Need to Know in 2026",
    "I Bought a Bitcoin ETF: Here's What Happened (Honest Review)",
    "Bitcoin ETF vs Real Bitcoin: Which Should YOU Buy?",
    "Bitcoin ETFs Just Hit $100B — Why This Changes Everything",
    "The Complete Bitcoin ETF Guide for Beginners (2026)",
  ],
  description: `In this video, I break down everything you need to know about Bitcoin ETFs in 2026. From how they work to whether you should buy one — this is the only guide you need.

00:00 - Introduction
00:30 - What is a Bitcoin ETF?
01:30 - How Bitcoin ETFs Work
03:00 - Why This Changes Everything
05:00 - The Risks You Need to Know
07:00 - Should YOU Buy a Bitcoin ETF?
09:00 - Final Thoughts

#Bitcoin #BitcoinETF #Crypto #Investing #BTC #CryptoEducation #Finance #ETF`,
  tags: [
    "bitcoin etf", "bitcoin etf explained", "bitcoin etf 2026", "btc etf",
    "blackrock bitcoin etf", "fidelity bitcoin etf", "ibit", "fbtc",
    "bitcoin investing", "crypto etf", "how to buy bitcoin etf",
    "bitcoin etf vs bitcoin", "spot bitcoin etf", "bitcoin for beginners",
    "crypto education", "bitcoin price", "should i buy bitcoin etf",
    "bitcoin etf risks", "best bitcoin etf", "bitcoin etf review",
  ],
  chapters: [
    "00:00 - Introduction",
    "00:30 - What is a Bitcoin ETF?",
    "01:30 - How Bitcoin ETFs Work",
    "03:00 - Why This Changes Everything",
    "05:00 - The Risks You Need to Know",
    "07:00 - Should YOU Buy a Bitcoin ETF?",
    "09:00 - Final Thoughts",
  ],
  ctrScore: 87,
};

export default function SeoPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<SeoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResult(MOCK_SEO);
    setLoading(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-[#52525B] hover:text-[#FAFAFA]"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">SEO Optimizer</h1>
        <p className="text-sm text-[#52525B] mt-1">Auto-generate titles, descriptions, tags, and chapters. 2 credits per optimization.</p>
      </div>

      <Card className="border-[#222] bg-[#111]">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter your video topic or paste a title..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOptimize()}
              className="h-11 border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000]"
            />
            <Button
              onClick={handleOptimize}
              disabled={loading || !topic.trim()}
              className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold px-6 h-11 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize (2 cr)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Titles */}
            <Card className="border-[#222] bg-[#111]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Title Variants</CardTitle>
                <CopyBtn text={result.titles.join("\n")} field="titles" />
              </CardHeader>
              <CardContent className="space-y-2">
                {result.titles.map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] p-3 hover:border-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-[#52525B] font-mono w-4">{i + 1}</span>
                    <span className="text-sm text-[#FAFAFA] flex-1">{title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-[#222] bg-[#111]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Description</CardTitle>
                <CopyBtn text={result.description} field="desc" />
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-[#A1A1AA] whitespace-pre-wrap font-sans leading-relaxed bg-[#0a0a0a] rounded-lg p-4 border border-[#222]">
                  {result.description}
                </pre>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-[#222] bg-[#111]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-[#FAFAFA]">
                  Tags ({result.tags.length})
                </CardTitle>
                <CopyBtn text={result.tags.join(", ")} field="tags" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-[#222] bg-[#0a0a0a] text-[#A1A1AA] text-xs cursor-pointer hover:border-[#2a2a2a]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card className="border-[#222] bg-[#111]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Chapters</CardTitle>
                <CopyBtn text={result.chapters.join("\n")} field="chapters" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {result.chapters.map((ch) => (
                    <div key={ch} className="text-sm text-[#A1A1AA] font-mono">
                      {ch}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTR Score */}
          <div>
            <Card className="border-[#222] bg-[#111] sticky top-20">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-[#22C55E] mx-auto mb-3" />
                <p className="text-xs text-[#52525B] uppercase tracking-wider font-medium mb-2">
                  Predicted CTR Score
                </p>
                <div className="text-6xl font-black text-[#22C55E] tracking-tighter mb-2">
                  {result.ctrScore}
                </div>
                <p className="text-xs text-[#52525B]">out of 100</p>
                <div className="mt-6 space-y-2 text-left">
                  {[
                    { label: "Title Strength", value: 92, color: "#22C55E" },
                    { label: "Tag Relevance", value: 88, color: "#22C55E" },
                    { label: "Description Quality", value: 85, color: "#22C55E" },
                    { label: "Keyword Coverage", value: 79, color: "#F59E0B" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#52525B]">{metric.label}</span>
                        <span style={{ color: metric.color }} className="font-medium">
                          {metric.value}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1a1a]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <TrendingUp className="h-7 w-7 text-[#52525B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-1">Optimize your SEO</h3>
          <p className="text-sm text-[#52525B] max-w-sm">
            Enter a video topic to generate optimized titles, descriptions, tags, and chapter markers.
          </p>
        </div>
      )}
    </div>
  );
}
