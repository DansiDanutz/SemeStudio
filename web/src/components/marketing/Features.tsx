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

const FEATURES = [
  {
    icon: Search,
    title: "Topic Research",
    description: "Find trending topics before anyone else. AI analyzes search volume, competition, and growth potential.",
    color: "#3B82F6",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: PenTool,
    title: "AI Script Writer",
    description: "Full scripts in 60 seconds. Choose style, tone, and duration. Edit inline with AI suggestions.",
    color: "#7C3AED",
    span: "col-span-1",
  },
  {
    icon: Palette,
    title: "Thumbnail Generator",
    description: "AI-designed thumbnails that get clicks. Multiple styles, A/B test variants, one-click export.",
    color: "#FF0000",
    span: "col-span-1",
  },
  {
    icon: TrendingUp,
    title: "SEO Optimizer",
    description: "Title, tags, description — auto-optimized. CTR prediction and keyword gap analysis built in.",
    color: "#22C55E",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Analytics Hub",
    description: "Know exactly what's working. Real-time metrics, trend detection, revenue tracking across channels.",
    color: "#F59E0B",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: Rocket,
    title: "Upload Automation",
    description: "Schedule and cross-post everywhere. Bulk upload queue with automatic metadata and thumbnail assignment.",
    color: "#EC4899",
    span: "col-span-1",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className={`${feature.span} group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111111] p-8 transition-all duration-300 hover:border-[#2a2a2a] hover:bg-[#141414]`}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: feature.color, opacity: 0 }}
                />
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon size={22} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-[#FAFAFA] mb-2">{feature.title}</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{feature.description}</p>

                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}40, transparent)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
