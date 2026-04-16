"use client";

import { motion } from "framer-motion";
import { Search, Wand2, Upload } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Research",
    description:
      "Find trending topics with AI-powered analysis. See search volume, competition, and growth trends before you commit to a video idea.",
    color: "#3B82F6",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Create",
    description:
      "Generate scripts, thumbnails, titles, and descriptions in seconds. AI handles the heavy lifting while you keep creative control.",
    color: "#7C3AED",
  },
  {
    number: "03",
    icon: Upload,
    title: "Publish",
    description:
      "Upload with optimized metadata, schedule across time zones, and track performance — all from one dashboard.",
    color: "#FF0000",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-32 px-6"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <h2
            id="how-heading"
            className="text-3xl md:text-5xl font-black tracking-tight text-[#FAFAFA] mb-4"
          >
            Three steps.
            <br />
            <span className="text-[#A1A1AA]">Zero friction.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-[#222] via-[#2a2a2a] to-[#222] hidden md:block" />

          <div className="space-y-16 md:space-y-24">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Number dot on timeline */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-12 w-12 items-center justify-center rounded-full border-2 border-[#222] bg-[#080808] z-10">
                    <span
                      className="text-sm font-bold"
                      style={{ color: step.color }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div className={`flex-1 ${isEven ? "md:text-right md:pr-20" : "md:text-left md:pl-20"}`}>
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4`}
                      style={{ backgroundColor: `${step.color}12` }}
                    >
                      <Icon size={24} style={{ color: step.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#A1A1AA] leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
