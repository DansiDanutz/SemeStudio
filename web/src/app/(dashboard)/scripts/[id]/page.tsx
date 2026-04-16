"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Copy,
  Download,
  Sparkles,
  Clock,
  FileText,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const MOCK_SCRIPT = {
  topic: "Bitcoin ETF Explained in 10 Minutes",
  style: "Educational",
  duration: "10 min",
  wordCount: 2400,
  status: "complete" as const,
  createdAt: "2 hours ago",
  content: `[HOOK - 0:00-0:30]

Hey everyone. Bitcoin ETFs just crossed $100 billion in total assets, and if you're still confused about what they are or why they matter, this video is going to break it all down in plain English.

Let's get into it.

[INTRO - 0:30-1:30]

So what exactly IS a Bitcoin ETF? Think of it as a bridge. On one side, you have traditional finance — your brokerage account, your 401k, your IRA. On the other side, you have Bitcoin. An ETF connects the two.

Instead of dealing with private keys, hardware wallets, and crypto exchanges, you can now buy Bitcoin exposure the same way you'd buy shares of Apple or an S&P 500 index fund.

[MAIN CONTENT - 1:30-7:00]

SECTION 1: How Bitcoin ETFs Work

When you buy a share of a Bitcoin ETF, the fund manager — companies like BlackRock, Fidelity, or Grayscale — goes out and buys actual Bitcoin on your behalf. They store it in institutional-grade custody solutions, insured and audited.

Your shares track the price of Bitcoin. If Bitcoin goes up 5%, your ETF shares go up roughly 5%. Simple.

SECTION 2: Why This Changes Everything

Before ETFs, if a pension fund wanted Bitcoin exposure, they'd need to set up crypto wallets, manage custody, deal with regulatory uncertainty. Now? They just buy ticker symbol IBIT or FBTC through their existing systems.

This opened the floodgates. We've seen:
- $100B+ in total ETF assets
- Daily inflows exceeding $500M on peak days
- Major financial advisors adding 1-5% Bitcoin allocation to client portfolios

SECTION 3: The Risks You Need to Know

But it's not all sunshine. Here are the key risks:
1. Management fees (0.2-1.5% annually)
2. You don't actually own Bitcoin — you own shares of a fund
3. Trading hours limited to stock market hours
4. Potential tracking errors during volatile periods

[CONCLUSION - 7:00-9:00]

So should YOU buy a Bitcoin ETF? It depends on your situation. If you already know how to self-custody Bitcoin and prefer sovereignty, ETFs might not add much.

But if you want Bitcoin exposure in your retirement account, or you prefer the simplicity of traditional brokerage, ETFs are a game-changer.

[CTA - 9:00-10:00]

If this helped you understand Bitcoin ETFs, smash that like button. Drop a comment telling me: are you buying the ETF or holding real Bitcoin? And subscribe for more crypto education every week.

I'll see you in the next one.`,
};

export default function ScriptEditorPage() {
  const [content, setContent] = useState(MOCK_SCRIPT.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-[#52525B] hover:text-[#FAFAFA]" render={<Link href="/scripts" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#FAFAFA] tracking-tight">{MOCK_SCRIPT.topic}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 text-[10px]">
              Complete
            </Badge>
            <span className="text-xs text-[#52525B] flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {MOCK_SCRIPT.wordCount.toLocaleString()} words
            </span>
            <span className="text-xs text-[#52525B] flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {MOCK_SCRIPT.createdAt}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#222] bg-[#111] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#222] bg-[#111] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Rewrite (5 cr)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-[#222] bg-[#111]">
            <CardContent className="p-0">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[600px] border-0 bg-transparent text-[#FAFAFA] text-sm leading-relaxed p-6 resize-none focus-visible:ring-0 font-mono"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-[#222] bg-[#111]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Script Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Style", value: MOCK_SCRIPT.style },
                { label: "Duration", value: MOCK_SCRIPT.duration },
                { label: "Words", value: MOCK_SCRIPT.wordCount.toLocaleString() },
                { label: "Reading Time", value: `~${Math.ceil(MOCK_SCRIPT.wordCount / 150)} min` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-[#52525B]">{item.label}</span>
                  <span className="text-[#A1A1AA] font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[#222] bg-[#111]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#FAFAFA]">AI Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-[#222] bg-[#0a0a0a] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
              >
                <Sparkles className="h-3 w-3 mr-2 text-[#7C3AED]" />
                Improve hook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-[#222] bg-[#0a0a0a] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
              >
                <Sparkles className="h-3 w-3 mr-2 text-[#7C3AED]" />
                Add more examples
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-[#222] bg-[#0a0a0a] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
              >
                <Sparkles className="h-3 w-3 mr-2 text-[#7C3AED]" />
                Make it shorter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-[#222] bg-[#0a0a0a] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
              >
                <Sparkles className="h-3 w-3 mr-2 text-[#7C3AED]" />
                Generate SEO
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
