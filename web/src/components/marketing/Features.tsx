"use client";

import { motion } from "framer-motion";
import {
  Search,
  PenTool,
  Palette,
  TrendingUp,
  BarChart3,
  Rocket,
} from "lucide-react";

const BENTO_ITEMS = [
  {
    id: "script",
    icon: PenTool,
    title: "AI Script Writer",
    description: "Full scripts in 60 seconds. Choose style, tone, and duration. Edit inline with AI suggestions that sound like you.",
    color: "#7C3AED",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-2",
    large: true,
  },
  {
    id: "thumbnail",
    icon: Palette,
    title: "Thumbnail Generator",
    description: "AI-designed thumbnails that get clicks. Multiple styles, A/B test variants.",
    color: "#FF0000",
    colSpan: "md:col-span-1",
    rowSpan: "",
    large: false,
  },
  {
    id: "research",
    icon: Search,
    title: "Topic Research",
    description: "Find trending topics before anyone else.",
    color: "#3B82F6",
    colSpan: "",
    rowSpan: "",
    large: false,
    small: true,
  },
  {
    id: "seo",
    icon: TrendingUp,
    title: "SEO Optimizer",
    description: "Title, tags, description — auto-optimized for maximum reach.",
    color: "#22C55E",
    colSpan: "",
    rowSpan: "",
    large: false,
    small: true,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics Hub",
    description: "Real-time metrics and trend detection across all channels.",
    color: "#F59E0B",
    colSpan: "",
    rowSpan: "",
    large: false,
    small: true,
  },
  {
    id: "upload",
    icon: Rocket,
    title: "Upload Automation",
    description: "Schedule and cross-post everywhere automatically.",
    color: "#EC4899",
    colSpan: "",
    rowSpan: "",
    large: false,
    small: true,
  },
];

function ScriptMockup() {
  return (
    <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a1a]">
        <div className="h-2 w-2 rounded-full bg-[#7C3AED]/60" />
        <span className="text-[10px] text-[#3a3a3a] font-mono">script.txt</span>
      </div>
      <div className="p-3 space-y-2">
        {[
          { text: "Hook: Did you know 95% of creators make this mistake...", color: "#7C3AED", w: "100%" },
          { text: "Intro: Welcome back! Today we're covering...", color: "#A1A1AA", w: "88%" },
          { text: "Point 1: The algorithm actually rewards...", color: "#A1A1AA", w: "76%" },
          { text: "Point 2: Most people overlook this simple...", color: "#A1A1AA", w: "82%" },
          { text: "CTA: If you found this helpful, make sure to...", color: "#52525B", w: "65%" },
        ].map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] text-[#2a2a2a] font-mono w-4 shrink-0">{i + 1}</span>
            <div
              className="h-1.5 rounded-full"
              style={{
                width: line.w,
                backgroundColor: i === 0 ? `${line.color}40` : "#1e1e1e",
              }}
            />
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-[#1a1a1a] flex items-center justify-between">
        <span className="text-[10px] text-[#7C3AED]">AI suggestion available</span>
        <div className="flex gap-1">
          {["Casual", "Pro", "Viral"].map((tone) => (
            <span
              key={tone}
              className="text-[9px] px-1.5 py-0.5 rounded border border-[#1e1e1e] text-[#3a3a3a]"
            >
              {tone}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThumbnailMockup() {
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-[#1e1e1e] aspect-video bg-gradient-to-br from-[#1a0a0a] to-[#0a0a0a] flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/10 to-[#7C3AED]/10" />
      <div className="relative text-center px-4">
        <div className="text-[11px] font-black text-[#FAFAFA] leading-tight mb-1">10 YOUTUBE</div>
        <div className="text-[11px] font-black text-[#FF0000] leading-tight">GROWTH HACKS</div>
        <div className="mt-2 flex justify-center gap-1">
          {[1, 2, 3].map((v) => (
            <div
              key={v}
              className="h-1 rounded-full"
              style={{
                width: v === 2 ? "24px" : "12px",
                backgroundColor: v === 2 ? "#FF0000" : "#2a2a2a",
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-2 right-2 text-[9px] text-[#3a3a3a] bg-[#0a0a0a]/80 px-1.5 py-0.5 rounded">
        Variant 1/3
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-32 px-6" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-3xl md:text-5xl font-black tracking-tight text-[#FAFAFA] mb-4"
          >
            Everything you need.
            <br />
            <span className="text-[#A1A1AA]">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-[#52525B] text-lg max-w-xl mx-auto">
            Six AI-powered tools that replace your entire YouTube workflow stack.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
          {/* Large card: AI Script Writer — col-span-2, row-span-2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111111] p-8 transition-all duration-300 hover:border-[#2a2a2a] hover:bg-[#131313]"
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: "#7C3AED" }}
              aria-hidden="true"
            />
            <div
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#7C3AED15" }}
            >
              <PenTool size={22} style={{ color: "#7C3AED" }} />
            </div>
            <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">AI Script Writer</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-sm">
              Full scripts in 60 seconds. Choose style, tone, and duration. Edit inline with AI suggestions that sound exactly like you.
            </p>
            <ScriptMockup />
            <div
              className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(90deg, transparent, #7C3AED40, transparent)" }}
              aria-hidden="true"
            />
          </motion.div>

          {/* Thumbnail generator — col-span-1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111111] p-6 transition-all duration-300 hover:border-[#2a2a2a] hover:bg-[#131313]"
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: "#FF0000" }}
              aria-hidden="true"
            />
            <div
              className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#FF000015" }}
            >
              <Palette size={20} style={{ color: "#FF0000" }} />
            </div>
            <h3 className="text-lg font-bold text-[#FAFAFA] mb-1">Thumbnail Generator</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              AI-designed thumbnails that get clicks. Multiple styles, A/B test variants, one-click export.
            </p>
            <ThumbnailMockup />
          </motion.div>

          {/* Small cards row */}
          {[
            { icon: Search, title: "Topic Research", desc: "Find trending topics before anyone else. AI analyzes search volume and growth potential.", color: "#3B82F6", delay: 0.12 },
            { icon: TrendingUp, title: "SEO Optimizer", desc: "Title, tags, description — auto-optimized. CTR prediction and keyword gap analysis.", color: "#22C55E", delay: 0.16 },
            { icon: BarChart3, title: "Analytics Hub", desc: "Real-time metrics, trend detection, revenue tracking across all your channels.", color: "#F59E0B", delay: 0.20 },
            { icon: Rocket, title: "Upload Automation", desc: "Schedule and cross-post everywhere. Bulk queue with automatic metadata assignment.", color: "#EC4899", delay: 0.24 },
          ].map(({ icon: Icon, title, desc, color, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111111] p-6 transition-all duration-300 hover:border-[#2a2a2a] hover:bg-[#131313]"
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: color }}
                aria-hidden="true"
              />
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-base font-bold text-[#FAFAFA] mb-1.5">{title}</h3>
              <p className="text-[#52525B] text-sm leading-relaxed">{desc}</p>
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
