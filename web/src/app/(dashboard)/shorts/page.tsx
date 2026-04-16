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
import { Scissors, Plus, Sparkles, Loader2, Play, Clock } from "lucide-react";

interface MockShort {
  id: string;
  title: string;
  sourceVideo: string;
  duration: string;
  status: "generated" | "editing" | "published";
  views: string;
}

const MOCK_SHORTS: MockShort[] = [
  { id: "1", title: "Bitcoin ETF in 60 Seconds", sourceVideo: "Bitcoin ETF Explained", duration: "0:58", status: "published", views: "12.4K" },
  { id: "2", title: "Why DCA Always Wins", sourceVideo: "How to DCA Guide", duration: "0:45", status: "published", views: "8.7K" },
  { id: "3", title: "Solana Speed Test Results", sourceVideo: "Solana vs Ethereum", duration: "0:52", status: "editing", views: "—" },
  { id: "4", title: "3 Crypto Tax Mistakes", sourceVideo: "Crypto Tax Guide", duration: "0:40", status: "generated", views: "—" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  generated: { label: "Ready", className: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
  editing: { label: "Editing", className: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" },
  published: { label: "Published", className: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" },
};

export default function ShortsPage() {
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setGenerating(false);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Shorts Factory</h1>
          <p className="text-sm text-[#52525B] mt-1">Auto-generate Shorts from your long-form videos. 6 credits per short.</p>
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
                <Label className="text-sm text-[#A1A1AA]">Source Video</Label>
                <Select>
                  <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                    <SelectValue placeholder="Select a video" />
                  </SelectTrigger>
                  <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                    <SelectItem value="1">Bitcoin ETF Explained</SelectItem>
                    <SelectItem value="2">Top 5 Altcoins 2026</SelectItem>
                    <SelectItem value="3">How to DCA Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Or paste a YouTube URL</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Number of Shorts</Label>
                <Select defaultValue="3">
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
                <Select defaultValue="highlights">
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
              disabled={generating}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11"
            >
              {generating ? (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_SHORTS.map((short) => {
          const badge = STATUS_BADGE[short.status];
          return (
            <Card key={short.id} className="border-[#222] bg-[#111] overflow-hidden group">
              <div className="aspect-[9/16] relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                <div className="text-center px-4">
                  <Scissors className="h-8 w-8 text-[#52525B] mx-auto mb-2" />
                  <p className="text-xs text-[#52525B]">Short Preview</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {short.duration}
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-[#FAFAFA] truncate mb-1">{short.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#52525B] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {short.views !== "—" ? `${short.views} views` : "Not published"}
                  </span>
                  <Badge variant="outline" className={`text-[9px] ${badge.className}`}>
                    {badge.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
