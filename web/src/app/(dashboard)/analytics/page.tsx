"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Clock, Users, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const VIEW_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: `Apr ${i + 1}`,
  views: Math.floor(3000 + Math.random() * 5000 + (i > 15 ? 2000 : 0)),
  subs: Math.floor(8 + Math.random() * 20),
}));

const TOP_VIDEOS = [
  { title: "Bitcoin ETF Explained", views: 45200 },
  { title: "Top 5 Altcoins 2026", views: 32100 },
  { title: "How to DCA Guide", views: 18700 },
  { title: "Crypto Staking Rewards", views: 14300 },
  { title: "Best Hardware Wallets", views: 11800 },
];

const VIDEO_TABLE = [
  { title: "Bitcoin ETF Explained in 10 Minutes", views: "45.2K", ctr: "8.4%", avgWatch: "6:42", revenue: "$142" },
  { title: "Top 5 Altcoins for 2026", views: "32.1K", ctr: "7.2%", avgWatch: "5:18", revenue: "$98" },
  { title: "How to DCA: Complete Guide", views: "18.7K", ctr: "6.8%", avgWatch: "8:05", revenue: "$64" },
  { title: "Ethereum Staking Rewards Guide", views: "14.3K", ctr: "5.9%", avgWatch: "7:22", revenue: "$47" },
  { title: "Best Crypto Hardware Wallets", views: "11.8K", ctr: "6.1%", avgWatch: "4:55", revenue: "$38" },
  { title: "Solana DeFi Tutorial", views: "9.4K", ctr: "5.5%", avgWatch: "6:12", revenue: "$31" },
];

const STATS = [
  { label: "Total Views", value: "124.5K", change: "+12.3%", up: true, icon: Eye, color: "#3B82F6" },
  { label: "Watch Time", value: "8,432h", change: "+8.1%", up: true, icon: Clock, color: "#7C3AED" },
  { label: "Subscribers", value: "+342", change: "+4.2%", up: true, icon: Users, color: "#22C55E" },
  { label: "Revenue", value: "$1,247", change: "-2.1%", up: false, icon: DollarSign, color: "#F59E0B" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Analytics</h1>
          <p className="text-sm text-[#52525B] mt-1">Track your channel performance</p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="bg-[#111] border border-[#222]">
            <TabsTrigger value="7d" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">7d</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">30d</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">90d</TabsTrigger>
            <TabsTrigger value="1y" className="text-xs data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FAFAFA] text-[#52525B]">1y</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-[#222] bg-[#111]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}12` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#FAFAFA] tracking-tight">{stat.value}</p>
                <p className="text-xs text-[#52525B] mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Views chart */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VIEW_DATA}>
                <defs>
                  <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF0000" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#FF0000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#52525B", fontSize: 11 }}
                  axisLine={{ stroke: "#222" }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: "#52525B", fontSize: 11 }}
                  axisLine={{ stroke: "#222" }}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #222",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#FF0000"
                  strokeWidth={2}
                  fill="url(#viewGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top videos bar chart */}
        <Card className="border-[#222] bg-[#111]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Top Videos by Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_VIDEOS} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "#52525B", fontSize: 10 }}
                    axisLine={{ stroke: "#222" }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fill: "#A1A1AA", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid #222",
                      borderRadius: "8px",
                      color: "#FAFAFA",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="views" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Video performance table */}
        <Card className="lg:col-span-2 border-[#222] bg-[#111]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Video Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left text-xs font-medium text-[#52525B] px-6 py-3">Title</th>
                    <th className="text-right text-xs font-medium text-[#52525B] px-4 py-3">Views</th>
                    <th className="text-right text-xs font-medium text-[#52525B] px-4 py-3">CTR</th>
                    <th className="text-right text-xs font-medium text-[#52525B] px-4 py-3">Avg Watch</th>
                    <th className="text-right text-xs font-medium text-[#52525B] px-6 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {VIDEO_TABLE.map((video) => (
                    <tr key={video.title} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#141414] transition-colors">
                      <td className="px-6 py-3 text-[#FAFAFA] font-medium truncate max-w-[200px]">{video.title}</td>
                      <td className="px-4 py-3 text-right text-[#A1A1AA]">{video.views}</td>
                      <td className="px-4 py-3 text-right text-[#A1A1AA]">{video.ctr}</td>
                      <td className="px-4 py-3 text-right text-[#A1A1AA]">{video.avgWatch}</td>
                      <td className="px-6 py-3 text-right text-[#22C55E] font-medium">{video.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
