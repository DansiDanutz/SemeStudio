"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";

interface CreditsBadgeProps {
  remaining: number;
  total: number;
}

export function CreditsBadge({ remaining, total }: CreditsBadgeProps) {
  const percentage = Math.round((remaining / total) * 100);
  const isLow = percentage < 20;

  return (
    <Link
      href="/settings/billing"
      className="group block rounded-xl border border-[#222] bg-[#111] p-3 transition-all hover:border-[#2a2a2a] hover:bg-[#141414]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Coins className={`h-4 w-4 ${isLow ? "text-[#F59E0B]" : "text-[#7C3AED]"}`} />
          <span className="text-xs font-medium text-[#A1A1AA]">Credits</span>
        </div>
        <span className={`text-xs font-bold ${isLow ? "text-[#F59E0B]" : "text-[#FAFAFA]"}`}>
          {remaining}/{total}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-1.5 bg-[#1a1a1a]"
      />
      {isLow && (
        <p className="text-[10px] text-[#F59E0B] mt-1.5">
          Running low — get more credits
        </p>
      )}
    </Link>
  );
}
