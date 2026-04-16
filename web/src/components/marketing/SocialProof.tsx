"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "I went from 1k to 50k subscribers in 3 months using SemeStudio's AI scripts. The quality is genuinely better than what I wrote myself.",
    handle: "@TechCreator",
    name: "Alex R.",
    role: "Tech YouTuber",
    avatar: "AR",
    color: "#FF0000",
    stars: 5,
  },
  {
    quote: "The thumbnail generator alone is worth the subscription. I used to spend 2 hours on every thumbnail. Now it takes 3 minutes.",
    handle: "@MarketingPro",
    name: "Sarah K.",
    role: "Marketing Creator",
    avatar: "SK",
    color: "#7C3AED",
    stars: 5,
  },
  {
    quote: "Finally, one tool that does everything. I cancelled 4 other subscriptions after switching to SemeStudio. It just works.",
    handle: "@ContentCreator",
    name: "Mike T.",
    role: "Full-time Creator",
    avatar: "MT",
    color: "#3B82F6",
    stars: 5,
  },
];

const AVATARS = [
  { initials: "JD", color: "#FF0000" },
  { initials: "AM", color: "#7C3AED" },
  { initials: "KL", color: "#3B82F6" },
  { initials: "PR", color: "#22C55E" },
  { initials: "TW", color: "#F59E0B" },
  { initials: "RS", color: "#EC4899" },
];

export function SocialProof() {
  return (
    <section className="relative py-32 px-6" aria-labelledby="social-proof-heading">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#7C3AED]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Social proof header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-16 text-center"
        >
          {/* Avatar row */}
          <div className="flex items-center mb-4">
            {AVATARS.map((avatar, i) => (
              <div
                key={avatar.initials}
                className="relative h-10 w-10 rounded-full border-2 border-[#080808] flex items-center justify-center text-xs font-bold text-white"
                style={{
                  backgroundColor: avatar.color,
                  marginLeft: i === 0 ? "0" : "-10px",
                  zIndex: AVATARS.length - i,
                  opacity: 0.9 - i * 0.05,
                }}
              >
                {avatar.initials}
              </div>
            ))}
            <div
              className="relative h-10 w-10 rounded-full border-2 border-[#080808] bg-[#161616] flex items-center justify-center text-[10px] font-bold text-[#A1A1AA]"
              style={{ marginLeft: "-10px", zIndex: 0 }}
            >
              +9k
            </div>
          </div>

          <h2
            id="social-proof-heading"
            className="text-3xl md:text-4xl font-black tracking-tight text-[#FAFAFA] mb-3"
          >
            10,000+ creators trust SemeStudio
          </h2>
          <p className="text-[#52525B] text-base max-w-md">
            From solo creators to media companies — here&apos;s what they say.
          </p>

          {/* Stars */}
          <div className="flex items-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-[#F59E0B] text-[#F59E0B]" />
            ))}
            <span className="text-sm text-[#A1A1AA] ml-2 font-semibold">4.9 / 5</span>
            <span className="text-sm text-[#52525B] ml-1">from 2,400+ reviews</span>
          </div>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[#222] bg-[#111111] p-6 transition-all duration-300 hover:border-[#2a2a2a] hover:bg-[#131313]"
            >
              {/* Quote accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${t.color}50, transparent)` }}
                aria-hidden="true"
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              <blockquote className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: t.color }}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#FAFAFA]">{t.name}</div>
                  <div className="text-xs text-[#52525B]">{t.role} · {t.handle}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
