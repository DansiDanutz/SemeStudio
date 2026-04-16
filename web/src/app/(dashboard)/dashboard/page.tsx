"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Clock,
  Users,
  DollarSign,
  Flame,
  PenTool,
  Palette,
  TrendingUp,
  Search,
  ArrowUpRight,
  Coins,
} from "lucide-react";

const STATS = [
  { label: "Views (30d)", value: "124.5K", change: "+12.3%", icon: Eye, color: "#3B82F6" },
  { label: "Watch Time", value: "8,432h", change: "+8.1%", icon: Clock, color: "#7C3AED" },
  { label: "Subscribers", value: "23.1K", change: "+342", icon: Users, color: "#22C55E" },
  { label: "Revenue", value: "$1,247", change: "+18.5%", icon: DollarSign, color: "#F59E0B" },
  { label: "Upload Streak", value: "14 days", change: "Best: 21", icon: Flame, color: "#FF0000" },
];

const RECENT_VIDEOS = [
  { title: "Bitcoin ETF Explained in 10 Minutes", views: "45.2K", ctr: "8.4%", status: "published" },
  { title: "Top 5 Altcoins for 2026", views: "32.1K", ctr: "7.2%", status: "published" },
  { title: "How to DCA: Complete Guide", views: "18.7K", ctr: "6.8%", status: "published" },
  { title: "Solana vs Ethereum 2026", views: "—", ctr: "—", status: "scheduled" },
  { title: "Hardware Wallet Setup Guide", views: "—", ctr: "—", status: "draft" },
];

const QUICK_ACTIONS = [
  { label: "New Script", icon: PenTool, href: "/scripts", color: "#7C3AED" },
  { label: "Thumbnail", icon: Palette, href: "/thumbnails", color: "#FF0000" },
  { label: "SEO Check", icon: TrendingUp, href: "/seo", color: "#22C55E" },
  { label: "Research", icon: Search, href: "/research", color: "#3B82F6" },
];

const STATUS_STYLES: Record<string, string> = {
  published: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  scheduled: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  draft: "bg-[#52525B]/10 text-[#52525B] border-[#52525B]/20",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#52525B] mt-1">Welcome back, Dan. Here&apos;s how your channel is doing.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-[#222] bg-[#111]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}12` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-medium text-[#22C55E]">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-[#FAFAFA] tracking-tight">{stat.value}</p>
                <p className="text-xs text-[#52525B] mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Videos */}
        <Card className="lg:col-span-2 border-[#222] bg-[#111]">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold text-[#FAFAFA]">Recent Videos</CardTitle>
            <Button variant="ghost" size="sm" className="text-[#A1A1AA] hover:text-[#FAFAFA] text-xs" render={<Link href="/analytics" />}>
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1a1a1a]">
              {RECENT_VIDEOS.map((video) => (
                <div key={video.title} className="flex items-center gap-4 px-6 py-3 hover:bg-[#141414] transition-colors">
                  <div className="h-10 w-16 rounded bg-[#1a1a1a] shrink-0 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-[#52525B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAFA] truncate">{video.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[#52525B]">{video.views} views</span>
                      <span className="text-xs text-[#52525B]">{video.ctr} CTR</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[video.status]}`}>
                    {video.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="border-[#222] bg-[#111]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#FAFAFA]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] p-4 transition-all hover:border-[#2a2a2a] hover:bg-[#111]"
                  >
                    <Icon className="h-5 w-5" style={{ color: action.color }} />
                    <span className="text-xs font-medium text-[#A1A1AA]">{action.label}</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className="border-[#222] bg-[#111]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="h-5 w-5 text-[#7C3AED]" />
                <span className="text-sm font-medium text-[#A1A1AA]">AI Credits</span>
              </div>
              <p className="text-4xl font-black text-[#FAFAFA] tracking-tight mb-1">45</p>
              <p className="text-xs text-[#52525B] mb-4">credits remaining this month</p>
              <Progress value={45} className="h-2 mb-4 bg-[#1a1a1a]" />
              <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm" render={<Link href="/settings/billing" />}>
                Get More Credits
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Upcoming Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 overflow-x-auto pb-2">
            {[
              { title: "Solana vs Ethereum 2026", date: "Apr 18", time: "2:00 PM" },
              { title: "Hardware Wallet Guide", date: "Apr 20", time: "10:00 AM" },
              { title: "DeFi Basics Explained", date: "Apr 22", time: "3:00 PM" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex-shrink-0 rounded-xl border border-[#222] bg-[#0a0a0a] p-4 w-64"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <span className="text-xs text-[#3B82F6] font-medium">Scheduled</span>
                </div>
                <p className="text-sm font-medium text-[#FAFAFA] mb-1 truncate">{item.title}</p>
                <p className="text-xs text-[#52525B]">
                  {item.date} at {item.time}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
