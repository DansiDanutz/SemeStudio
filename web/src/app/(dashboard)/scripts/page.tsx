"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Plus, Clock, FileText, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ScriptStatus, ScriptStyle } from "@/types";
import { useScriptGenerate } from "@/hooks/useScriptGenerate";
import { useCredits } from "@/hooks/useCredits";

interface ScriptListItem {
  id: string;
  topic: string;
  wordCount: number;
  status: ScriptStatus;
  style: string;
  createdAt: string;
}

const INITIAL_SCRIPTS: ScriptListItem[] = [
  { id: "1", topic: "Bitcoin ETF Explained in 10 Minutes", wordCount: 2400, status: "complete", style: "Educational", createdAt: "2 hours ago" },
  { id: "2", topic: "Top 5 Altcoins for 2026", wordCount: 1800, status: "in_progress", style: "Opinion", createdAt: "5 hours ago" },
  { id: "3", topic: "How to DCA: Complete Guide", wordCount: 3200, status: "complete", style: "Tutorial", createdAt: "1 day ago" },
  { id: "4", topic: "Solana vs Ethereum Performance", wordCount: 0, status: "draft", style: "Review", createdAt: "2 days ago" },
  { id: "5", topic: "Hardware Wallet Setup Guide", wordCount: 1200, status: "in_progress", style: "Tutorial", createdAt: "3 days ago" },
];

const STATUS_BADGE: Record<ScriptStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-[#52525B]/10 text-[#52525B] border-[#52525B]/20" },
  in_progress: { label: "In Progress", className: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" },
  complete: { label: "Complete", className: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" },
  archived: { label: "Archived", className: "bg-[#52525B]/10 text-[#52525B] border-[#52525B]/20" },
};

export default function ScriptsPage() {
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scripts, setScripts] = useState<ScriptListItem[]>(INITIAL_SCRIPTS);

  // Form state
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState("10");
  const [style, setStyle] = useState<ScriptStyle>("educational");

  const { generate, streamedText, script, isGenerating, error, reset } = useScriptGenerate();
  const { credits } = useCredits();
  const streamRef = useRef<HTMLPreElement>(null);

  const filtered = filter === "all"
    ? scripts
    : scripts.filter((s) => s.status === filter);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const result = await generate({
      topic: topic.trim(),
      targetAudience: audience.trim() || undefined,
      durationMinutes: parseInt(duration, 10),
      style,
    });

    if (result) {
      const newScript: ScriptListItem = {
        id: crypto.randomUUID(),
        topic: topic.trim(),
        wordCount: result.wordCount,
        status: "complete",
        style: style.charAt(0).toUpperCase() + style.slice(1),
        createdAt: "Just now",
      };
      setScripts((prev) => [newScript, ...prev]);
      // Reset form but keep dialog open to show result
    }
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      reset();
      setTopic("");
      setAudience("");
      setDuration("10");
      setStyle("educational");
    }
    setDialogOpen(open);
  };

  const hasEnoughCredits = credits >= 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Scripts</h1>
          <p className="text-sm text-[#52525B] mt-1">AI-generated scripts for your videos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger render={<Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            New Script
          </DialogTrigger>
          <DialogContent className="border-[#222] bg-[#111] text-[#FAFAFA] max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Generate New Script</DialogTitle>
            </DialogHeader>

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Script result */}
            {script && !isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                  <p className="text-sm text-[#22C55E]">
                    Script generated - {script.wordCount.toLocaleString()} words, ~{script.estimatedDuration}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0a0a0a] border border-[#222] p-4 max-h-60 overflow-y-auto">
                  <p className="text-xs text-[#A1A1AA] mb-2 font-semibold uppercase tracking-wider">Hook</p>
                  <p className="text-sm text-[#FAFAFA] mb-4">{script.hook}</p>
                  <p className="text-xs text-[#A1A1AA] mb-2 font-semibold uppercase tracking-wider">Sections</p>
                  {script.outline.map((section, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-xs font-medium text-[#7C3AED]">{section.section} ({section.duration})</p>
                      <p className="text-xs text-[#71717A] mt-1 line-clamp-3">{section.content}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleCloseDialog(false)}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold h-11"
                >
                  Done
                </Button>
              </div>
            )}

            {/* Streaming text view */}
            {isGenerating && streamedText && (
              <div className="rounded-lg bg-[#0a0a0a] border border-[#222] p-4 max-h-48 overflow-y-auto">
                <p className="text-xs text-[#A1A1AA] mb-2 font-semibold uppercase tracking-wider">Generating...</p>
                <pre
                  ref={streamRef}
                  className="text-xs text-[#FAFAFA] whitespace-pre-wrap font-mono leading-relaxed"
                >
                  {streamedText}
                </pre>
              </div>
            )}

            {/* Form (hidden after generation completes) */}
            {!script && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#A1A1AA]">Topic</Label>
                  <Input
                    placeholder="What's this video about?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isGenerating}
                    className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-[#A1A1AA]">Target Audience</Label>
                  <Textarea
                    placeholder="Who is this video for?"
                    rows={2}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={isGenerating}
                    className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#A1A1AA]">Duration</Label>
                    <Select value={duration} onValueChange={(v) => { if (v) setDuration(v); }} disabled={isGenerating}>
                      <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-[#A1A1AA]">Style</Label>
                    <Select value={style} onValueChange={(v) => { if (v) setStyle(v as ScriptStyle); }} disabled={isGenerating}>
                      <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="opinion">Opinion</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!hasEnoughCredits && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-400">
                      Not enough credits. You need 5 credits but have {credits}.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim() || !hasEnoughCredits}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Script (5 credits)
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-[#111] border border-[#222]">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">All</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">Drafts</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">In Progress</TabsTrigger>
          <TabsTrigger value="complete" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">Complete</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((scriptItem) => {
          const badge = STATUS_BADGE[scriptItem.status];
          return (
            <Link key={scriptItem.id} href={`/scripts/${scriptItem.id}`}>
              <Card className="border-[#222] bg-[#111] hover:border-[#2a2a2a] hover:bg-[#141414] transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className="h-10 w-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                    <PenTool className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#FAFAFA] truncate">{scriptItem.topic}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#52525B] flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {scriptItem.wordCount > 0 ? `${scriptItem.wordCount.toLocaleString()} words` : "No content yet"}
                      </span>
                      <span className="text-xs text-[#52525B]">{scriptItem.style}</span>
                      <span className="text-xs text-[#52525B] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {scriptItem.createdAt}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${badge.className}`}>
                    {badge.label}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <PenTool className="h-7 w-7 text-[#52525B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-1">No scripts yet</h3>
          <p className="text-sm text-[#52525B] max-w-sm mb-4">
            Generate your first AI script and never stare at a blank page again.
          </p>
          <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Script
          </Button>
        </div>
      )}
    </div>
  );
}
