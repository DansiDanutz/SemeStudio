"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
  { value: "10k+", label: "Creators" },
  { value: "500M+", label: "Views Generated" },
  { value: "4.9", label: "Rating", suffix: "\u2605" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.07] via-purple-600/[0.04] to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FF0000]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#7C3AED]/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#FAFAFA 1px, transparent 1px), linear-gradient(90deg, #FAFAFA 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-20 text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Badge
            variant="outline"
            className="mb-6 border-[#2a2a2a] bg-[#111111]/80 text-[#A1A1AA] px-4 py-1.5 text-sm backdrop-blur-sm"
          >
            <span className="mr-1.5">🎬</span> The YouTube Creator OS
          </Badge>
        </motion.div>

        <motion.h1
          id="hero-heading"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-[#FAFAFA]">Create YouTube</span>
          <br />
          <span className="text-gradient-hero">Content 10x Faster</span>
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
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

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#FAFAFA] tracking-tight">
                {stat.value}
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
      </div>
    </section>
  );
}
