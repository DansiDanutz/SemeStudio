"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, TrendingUp, FileText, Image as ImageIcon, BarChart3 } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 10000, display: "10,000+", label: "Creators" },
  { value: 500, display: "500M+", label: "Views Generated" },
  { value: 4.9, display: "4.9", label: "Rating", suffix: "★" },
];

function AnimatedCounter({ target, display, duration = 2000 }: { target: number; display: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const isDecimal = target < 10;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(isDecimal ? parseFloat((eased * target).toFixed(1)) : Math.round(eased * target));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  const isDecimal = target < 10;
  const formatted = started
    ? isDecimal
      ? count.toFixed(1)
      : count >= 1000
      ? (count / 1000).toFixed(0) + ",000+"
      : count.toString()
    : "0";

  return <span ref={ref}>{started ? formatted : display}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-white/0" />
      <div className="relative rounded-2xl border border-[#2a2a2a] bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/60">
        {/* Titlebar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#111111]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-[11px] text-[#3a3a3a] font-mono bg-[#0d0d0d] border border-[#1e1e1e] rounded px-3 py-0.5">
              app.semestudio.com/studio
            </div>
          </div>
        </div>

        <div className="flex" style={{ minHeight: "260px" }}>
          {/* Sidebar */}
          <div className="w-14 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col items-center pt-4 gap-4">
            {[
              { Icon: FileText, active: true, color: "#FF0000" },
              { Icon: ImageIcon, active: false, color: "#7C3AED" },
              { Icon: TrendingUp, active: false, color: "#22C55E" },
              { Icon: BarChart3, active: false, color: "#3B82F6" },
            ].map(({ Icon, active, color }, i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: active ? `${color}20` : "transparent",
                  border: active ? `1px solid ${color}30` : "1px solid transparent",
                }}
              >
                <Icon size={16} style={{ color: active ? color : "#3a3a3a" }} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] text-[#3a3a3a] uppercase tracking-wider mb-1">AI Script Writer</div>
                <div className="text-sm font-semibold text-[#FAFAFA]">10 YouTube Growth Hacks in 2025</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-6 px-2.5 rounded-full bg-[#FF0000]/15 border border-[#FF0000]/25 flex items-center">
                  <span className="text-[10px] text-[#FF0000] font-medium">Generating</span>
                  <span className="ml-1.5 flex gap-0.5">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1 w-1 rounded-full bg-[#FF0000] animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { text: "Hook: Did you know 95% of creators make this one mistake...", w: "100%", opacity: 1 },
                { text: "In this video, I'll show you exactly how to 10x your channel growth", w: "90%", opacity: 0.8 },
                { text: "without spending a single dollar on ads. Let's dive in.", w: "70%", opacity: 0.6 },
                { text: "", w: "45%", opacity: 0.3 },
                { text: "", w: "55%", opacity: 0.15 },
              ].map((line, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-[#1e1e1e]"
                  style={{ width: line.w, opacity: line.opacity }}
                >
                  {line.text && (
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2a2a2a] to-[#1e1e1e]" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom stats row */}
            <div className="absolute bottom-4 left-20 right-5 flex gap-3">
              {[
                { label: "CTR", value: "+34%", color: "#22C55E" },
                { label: "Views", value: "48K", color: "#3B82F6" },
                { label: "Score", value: "9.2", color: "#F59E0B" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex-1 rounded-xl border border-[#1e1e1e] bg-[#111111] px-3 py-2"
                >
                  <div className="text-[10px] text-[#3a3a3a] uppercase tracking-wider">{stat.label}</div>
                  <div className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-4 -right-4 rounded-xl border border-[#7C3AED]/30 bg-[#0d0d0d] px-3 py-2 text-[11px] shadow-lg shadow-purple-900/20">
        <div className="text-[#7C3AED] font-semibold">Thumbnail generated</div>
        <div className="text-[#52525B] mt-0.5">3 variants ready</div>
      </div>
      <div className="absolute -bottom-4 -left-4 rounded-xl border border-[#22C55E]/30 bg-[#0d0d0d] px-3 py-2 text-[11px] shadow-lg shadow-green-900/20">
        <div className="text-[#22C55E] font-semibold">SEO Score: 94/100</div>
        <div className="text-[#52525B] mt-0.5">Optimized for search</div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 hero-mesh-bg" aria-hidden="true" />

      {/* Radial glows */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[#FF0000]/[0.04] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#7C3AED]/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#FF0000]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#FAFAFA 1px, transparent 1px), linear-gradient(90deg, #FAFAFA 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24 text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Badge
            variant="outline"
            className="mb-6 border-[#2a2a2a] bg-[#111111]/80 text-[#A1A1AA] px-4 py-1.5 text-sm backdrop-blur-sm"
          >
            <span className="mr-2 text-base">🎬</span> The YouTube Creator OS
          </Badge>
        </motion.div>

        <motion.h1
          id="hero-heading"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.93] mb-6"
        >
          <span className="text-[#FAFAFA]">Create YouTube</span>
          <br />
          <span className="text-gradient-hero inline-block">Content 10x Faster</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl text-lg md:text-xl text-[#A1A1AA] leading-relaxed mb-10"
        >
          Research, script, thumbnail, optimize, upload — all in one AI-powered
          studio. Join 10,000+ creators already growing.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Button
            size="lg"
            className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold text-base px-8 py-6 shadow-xl shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
            render={<Link href="/signup" />}
          >
            Start for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[#2a2a2a] bg-transparent text-[#FAFAFA] hover:bg-[#161616] hover:border-[#333] font-semibold text-base px-8 py-6"
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Stat counters */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-20"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#FAFAFA] tracking-tight tabular-nums">
                <AnimatedCounter target={stat.value} display={stat.display} />
                {stat.suffix && (
                  <span className="text-[#F59E0B] ml-0.5">{stat.suffix}</span>
                )}
              </div>
              <div className="text-sm text-[#52525B] mt-1 uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
