"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from "lucide-react";

interface TopicResult {
  title: string;
  searchVolume: string;
  competition: "low" | "medium" | "high";
  trend: "rising" | "stable" | "declining";
  score: number;
}

const MOCK_RESULTS: TopicResult[] = [
  { title: "Bitcoin ETF Performance 2026", searchVolume: "45K/mo", competition: "medium", trend: "rising", score: 92 },
  { title: "Best Crypto Hardware Wallets", searchVolume: "32K/mo", competition: "high", trend: "stable", score: 78 },
  { title: "Solana DeFi Tutorial Beginner", searchVolume: "28K/mo", competition: "low", trend: "rising", score: 95 },
  { title: "Ethereum Staking Rewards Guide", searchVolume: "21K/mo", competition: "medium", trend: "stable", score: 74 },
  { title: "Crypto Tax Guide 2026", searchVolume: "18K/mo", competition: "low", trend: "rising", score: 88 },
  { title: "NFT Market Recovery Analysis", searchVolume: "12K/mo", competition: "low", trend: "declining", score: 56 },
];

const TREND_CONFIG = {
  rising: { icon: TrendingUp, color: "#22C55E", label: "Rising" },
  stable: { icon: Minus, color: "#F59E0B", label: "Stable" },
  declining: { icon: TrendingDown, color: "#EF4444", label: "Declining" },
};

const COMP_COLORS = {
  low: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  medium: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  high: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
};

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TopicResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setResults(MOCK_RESULTS);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Topic Research</h1>
        <p className="text-sm text-[#52525B] mt-1">Find trending topics before your competition. 1 credit per search.</p>
      </div>

      <Card className="border-[#222] bg-[#111]">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
              <Input
                placeholder="Enter a topic, niche, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-11 pl-9 border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000]"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold px-6 h-11"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Research (1 cr)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">
            {results.length} topics found for &ldquo;{query}&rdquo;
          </h2>
          {results.map((topic) => {
            const trend = TREND_CONFIG[topic.trend];
            const TrendIcon = trend.icon;
            return (
              <Card key={topic.title} className="border-[#222] bg-[#111] hover:border-[#2a2a2a] transition-colors">
                <CardContent className="p-5 flex items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#FAFAFA] mb-1">{topic.title}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#52525B]">{topic.searchVolume}</span>
                      <Badge variant="outline" className={`text-[10px] ${COMP_COLORS[topic.competition]}`}>
                        {topic.competition}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <TrendIcon className="h-3 w-3" style={{ color: trend.color }} />
                        <span className="text-xs" style={{ color: trend.color }}>{trend.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-black tracking-tight ${
                        topic.score >= 80 ? "text-[#22C55E]" : topic.score >= 60 ? "text-[#F59E0B]" : "text-[#EF4444]"
                      }`}
                    >
                      {topic.score}
                    </div>
                    <div className="text-[10px] text-[#52525B] uppercase tracking-wider">Score</div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#161616] hover:bg-[#1a1a1a] text-[#FAFAFA] border border-[#2a2a2a] text-xs"
                  >
                    Write Script
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-[#52525B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-1">Start your research</h3>
          <p className="text-sm text-[#52525B] max-w-sm">
            Enter a topic or keyword to discover trending content ideas with AI-powered analysis.
          </p>
        </div>
      )}
    </div>
  );
}
