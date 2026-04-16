"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";

const TREND_CONFIG = {
  rising: { icon: TrendingUp, color: "#22C55E", label: "Rising" },
  stable: { icon: Minus, color: "#F59E0B", label: "Stable" },
  declining: { icon: TrendingDown, color: "#EF4444", label: "Declining" },
};

const scoreColor = (score: number) =>
  score >= 80 ? "text-[#22C55E]" : score >= 60 ? "text-[#F59E0B]" : "text-[#EF4444]";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const mutation = useResearch();
  const topics = mutation.data?.topics ?? [];

  const handleSearch = () => {
    if (!query.trim()) return;
    mutation.mutate({ keyword: query });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Topic Research</h1>
        <p className="text-sm text-[#52525B] mt-1">Find trending topics before your competition. 1 credit per search.</p>
      </div>

      <Card className="border-[#222] bg-[#111]">
        <CardContent className="p-6 space-y-3">
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
              disabled={mutation.isPending || !query.trim()}
              className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold px-6 h-11"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Research (1 cr)
                </>
              )}
            </Button>
          </div>
          {mutation.isError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {mutation.error instanceof Error ? mutation.error.message : "Research failed"}
            </div>
          )}
        </CardContent>
      </Card>

      {topics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">
            {topics.length} topics found for &ldquo;{query}&rdquo;
          </h2>
          {topics.map((topic, idx) => {
            const trend = TREND_CONFIG[topic.trendDirection];
            const TrendIcon = trend.icon;
            const isExpanded = expandedIdx === idx;

            return (
              <Card key={idx} className="border-[#222] bg-[#111] hover:border-[#2a2a2a] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#FAFAFA] mb-1">{topic.keyword}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs text-[#52525B]">Search score: {topic.searchVolumeScore}/100</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            topic.competitionScore <= 40
                              ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                              : topic.competitionScore <= 70
                              ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                              : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                          }`}
                        >
                          {topic.competitionScore <= 40 ? "low" : topic.competitionScore <= 70 ? "medium" : "high"} competition
                        </Badge>
                        <div className="flex items-center gap-1">
                          <TrendIcon className="h-3 w-3" style={{ color: trend.color }} />
                          <span className="text-xs" style={{ color: trend.color }}>{trend.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-black tracking-tight ${scoreColor(topic.opportunityScore)}`}>
                        {topic.opportunityScore}
                      </div>
                      <div className="text-[10px] text-[#52525B] uppercase tracking-wider">Score</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#52525B] hover:text-[#FAFAFA] p-1.5"
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#1a1a1a] space-y-4">
                      {topic.relatedKeywords.length > 0 && (
                        <div>
                          <p className="text-xs text-[#52525B] uppercase tracking-wider mb-2">Related Keywords</p>
                          <div className="flex flex-wrap gap-1.5">
                            {topic.relatedKeywords.map((kw) => (
                              <Badge key={kw} variant="outline" className="border-[#222] bg-[#0a0a0a] text-[#A1A1AA] text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {topic.videoIdeas.length > 0 && (
                        <div>
                          <p className="text-xs text-[#52525B] uppercase tracking-wider mb-2">Video Ideas</p>
                          <div className="space-y-1.5">
                            {topic.videoIdeas.map((idea, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                                <span className="text-[#52525B] font-mono text-xs mt-0.5">{i + 1}.</span>
                                {idea}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {topics.length === 0 && !mutation.isPending && (
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
