"use client";

import { useState } from "react";
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
import { PenTool, Plus, Clock, FileText, Sparkles, Loader2 } from "lucide-react";
import type { ScriptStatus } from "@/types";

interface MockScript {
  id: string;
  topic: string;
  wordCount: number;
  status: ScriptStatus;
  style: string;
  createdAt: string;
}

const MOCK_SCRIPTS: MockScript[] = [
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
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = filter === "all"
    ? MOCK_SCRIPTS
    : MOCK_SCRIPTS.filter((s) => s.status === filter);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Scripts</h1>
          <p className="text-sm text-[#52525B] mt-1">AI-generated scripts for your videos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            New Script
          </DialogTrigger>
          <DialogContent className="border-[#222] bg-[#111] text-[#FAFAFA] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Generate New Script</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Topic</Label>
                <Input
                  placeholder="What's this video about?"
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Target Audience</Label>
                <Textarea
                  placeholder="Who is this video for?"
                  rows={2}
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#A1A1AA]">Duration</Label>
                  <Select defaultValue="10">
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
                  <Select defaultValue="educational">
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
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11"
              >
                {generating ? (
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
        {filtered.map((script) => {
          const badge = STATUS_BADGE[script.status];
          return (
            <Link key={script.id} href={`/scripts/${script.id}`}>
              <Card className="border-[#222] bg-[#111] hover:border-[#2a2a2a] hover:bg-[#141414] transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className="h-10 w-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                    <PenTool className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#FAFAFA] truncate">{script.topic}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#52525B] flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {script.wordCount > 0 ? `${script.wordCount.toLocaleString()} words` : "No content yet"}
                      </span>
                      <span className="text-xs text-[#52525B]">{script.style}</span>
                      <span className="text-xs text-[#52525B] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {script.createdAt}
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
