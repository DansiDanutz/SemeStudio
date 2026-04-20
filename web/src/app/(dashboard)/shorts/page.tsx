"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scissors, Plus, Sparkles, Loader2, Clock, ChevronRight, Zap, Target, Lightbulb } from "lucide-react";
import { useShortsGenerate, type ShortIdea } from "@/hooks/useShortsGenerate";
import { toast } from "sonner";

const STYLE_ICONS: Record<string, React.ReactNode> = {
  highlights: <Sparkles className="h-3.5 w-3.5" />,
  hooks: <Zap className="h-3.5 w-3.5" />,
  tips: <Lightbulb className="h-3.5 w-3.5" />,
};

export default function ShortsPage() {
  const [showForm, setShowForm] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [count, setCount] = useState("3");
  const [style, setStyle] = useState<"highlights" | "hooks" | "tips">("highlights");
  const [generatedShorts, setGeneratedShorts] = useState<ShortIdea[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const { mutate: generateShorts, isPending } = useShortsGenerate();

  const handleGenerate = () => {
    if (!sourceTitle.trim()) {
      toast.error("Please enter the source video title");
      return;
    }
    generateShorts(
      { sourceTitle, sourceUrl: sourceUrl || undefined, count: Number(count), style },
      {
        onSuccess: (data) => {
          setGeneratedShorts(data.shorts);
          setShowForm(false);
          toast.success(`Generated ${data.shorts.length} Shorts ideas!`);
        },
        onError: (err) => {
          toast.error(err.message ?? "Shorts generation failed");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Shorts Factory</h1>
          <p className="text-sm text-[#52525B] mt-1">Auto-generate Shorts ideas from your long-form videos. 6 credits per batch.</p>
        </div>
        <Button
          className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Short
        </Button>
      </div>

      {showForm && (
        <Card className="border-[#222] bg-[#111]">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Source Video Title <span className="text-[#FF0000]">*</span></Label>
                <Input
                  placeholder="e.g. Bitcoin ETF Explained"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">YouTube URL (optional)</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Number of Shorts</Label>
                <Select value={count} onValueChange={(v) => setCount(v ?? "3")}>
                  <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                    <SelectItem value="1">1 short</SelectItem>
                    <SelectItem value="3">3 shorts</SelectItem>
                    <SelectItem value="5">5 shorts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
                  <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                    <SelectItem value="highlights">Key Highlights</SelectItem>
                    <SelectItem value="hooks">Hook Moments</SelectItem>
                    <SelectItem value="tips">Quick Tips</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isPending}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating shorts...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Shorts (6 credits)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedShorts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">Generated Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {generatedShorts.map((short, idx) => (
              <Card key={idx} className="border-[#222] bg-[#111] overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#FAFAFA] leading-snug">{short.title}</p>
                    <Badge variant="outline" className="shrink-0 bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/20 text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />
                      {short.estimatedDuration}
                    </Badge>
                  </div>

                  <div className="rounded-md bg-[#0a0a0a] border border-[#1a1a1a] p-3">
                    <p className="text-xs text-[#71717A] mb-1 font-medium uppercase tracking-wide">Hook</p>
                    <p className="text-sm text-[#E4E4E7] italic">&ldquo;{short.hook}&rdquo;</p>
                  </div>

                  <button
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className="flex items-center gap-1.5 text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors w-full"
                  >
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedIdx === idx ? "rotate-90" : ""}`} />
                    {expandedIdx === idx ? "Hide" : "Show"} key points &amp; CTA
                  </button>

                  {expandedIdx === idx && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <p className="text-xs text-[#71717A] mb-1.5 font-medium uppercase tracking-wide flex items-center gap-1">
                          <Target className="h-3 w-3" /> Key Points
                        </p>
                        <ul className="space-y-1">
                          {short.keyPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#A1A1AA]">
                              <span className="text-[#7C3AED] font-bold mt-0.5">{i + 1}.</span>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-md bg-[#0a0a0a] border border-[#1a1a1a] p-2.5">
                        <p className="text-xs text-[#71717A] mb-1 font-medium uppercase tracking-wide">Call to Action</p>
                        <p className="text-xs text-[#E4E4E7]">{short.callToAction}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <Badge variant="outline" className="bg-[#1a1a1a] text-[#71717A] border-[#222] text-[10px] flex items-center gap-1 w-fit">
                      {STYLE_ICONS[style]}
                      {style === "highlights" ? "Key Highlights" : style === "hooks" ? "Hook Moments" : "Quick Tips"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {generatedShorts.length === 0 && !showForm && (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mx-auto mb-4">
            <Scissors className="h-8 w-8 text-[#7C3AED]" />
          </div>
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">No Shorts yet</h3>
          <p className="text-sm text-[#52525B] mb-6 max-w-sm mx-auto">
            Click &ldquo;New Short&rdquo; to generate Shorts ideas from any long-form video in seconds.
          </p>
          <Button
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold"
            onClick={() => setShowForm(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate your first Short
          </Button>
        </div>
      )}
    </div>
  );
}
