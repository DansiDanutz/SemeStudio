"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Clock, CheckCircle2, AlertCircle, Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type QueueStatus = "queued" | "uploading" | "processing" | "complete" | "failed";

interface QueueItem {
  id: string;
  title: string;
  channel: string;
  status: QueueStatus;
  scheduledAt: string;
  progress?: number;
}

const QUEUE: QueueItem[] = [
  { id: "1", title: "Solana vs Ethereum 2026", channel: "SemeBitcoin", status: "queued", scheduledAt: "Apr 18, 2:00 PM" },
  { id: "2", title: "Hardware Wallet Setup Guide", channel: "SemeBitcoin", status: "queued", scheduledAt: "Apr 20, 10:00 AM" },
  { id: "3", title: "DeFi Basics Explained", channel: "SemeBitcoin", status: "queued", scheduledAt: "Apr 22, 3:00 PM" },
  { id: "4", title: "Bitcoin ETF Explained", channel: "SemeBitcoin", status: "complete", scheduledAt: "Apr 14, 2:00 PM" },
  { id: "5", title: "Top 5 Altcoins 2026", channel: "SemeBitcoin", status: "complete", scheduledAt: "Apr 12, 10:00 AM" },
  { id: "6", title: "Crypto Tax Report Failed", channel: "Tech Reviews", status: "failed", scheduledAt: "Apr 11, 4:00 PM" },
];

const STATUS_CONFIG: Record<QueueStatus, { icon: React.ElementType; color: string; label: string; badgeClass: string }> = {
  queued: { icon: Clock, color: "#3B82F6", label: "Queued", badgeClass: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" },
  uploading: { icon: Upload, color: "#F59E0B", label: "Uploading", badgeClass: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
  processing: { icon: Clock, color: "#7C3AED", label: "Processing", badgeClass: "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20" },
  complete: { icon: CheckCircle2, color: "#22C55E", label: "Published", badgeClass: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" },
  failed: { icon: AlertCircle, color: "#EF4444", label: "Failed", badgeClass: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" },
};

export default function UploadPage() {
  const queued = QUEUE.filter((q) => q.status === "queued");
  const completed = QUEUE.filter((q) => q.status === "complete" || q.status === "failed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Upload Queue</h1>
          <p className="text-sm text-[#52525B] mt-1">Schedule and manage your video uploads</p>
        </div>
        <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Add to Queue
        </Button>
      </div>

      {/* Queued */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#3B82F6]" />
            Scheduled ({queued.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#1a1a1a]">
            {queued.map((item) => {
              const config = STATUS_CONFIG[item.status];
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#141414] transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
                    <Upload className="h-4 w-4 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAFA] truncate">{item.title}</p>
                    <p className="text-xs text-[#52525B] mt-0.5">{item.channel} &middot; {item.scheduledAt}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                    {config.label}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-[#52525B] hover:text-[#FAFAFA]" />}>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-[#222] bg-[#111] text-[#FAFAFA]">
                      <DropdownMenuItem className="focus:bg-[#161616]">Edit metadata</DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-[#161616]">Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-[#161616] text-[#EF4444]">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#1a1a1a]">
            {completed.map((item) => {
              const config = STATUS_CONFIG[item.status];
              const StatusIcon = config.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#141414] transition-colors">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}12` }}
                  >
                    <StatusIcon className="h-4 w-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAFA] truncate">{item.title}</p>
                    <p className="text-xs text-[#52525B] mt-0.5">{item.channel} &middot; {item.scheduledAt}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
