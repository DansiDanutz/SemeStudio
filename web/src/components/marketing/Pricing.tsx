"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const TIERS = [
  {
    name: "Free",
    monthlyPrice: 0,
    credits: 10,
    description: "Try SemeStudio risk-free",
    features: [
      { text: "10 AI credits/month", included: true },
      { text: "1 YouTube channel", included: true },
      { text: "Basic analytics", included: true },
      { text: "Community support", included: true },
      { text: "Script templates", included: false },
      { text: "Custom thumbnails", included: false },
      { text: "SEO autopilot", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaHref: "/signup",
    highlight: false,
  },
  {
    name: "Starter",
    monthlyPrice: 9,
    credits: 100,
    description: "For solo creators",
    features: [
      { text: "100 AI credits/month", included: true },
      { text: "1 YouTube channel", included: true },
      { text: "Full analytics suite", included: true },
      { text: "Email support", included: true },
      { text: "Script templates", included: true },
      { text: "Custom thumbnails", included: false },
      { text: "SEO autopilot", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Starter",
    ctaHref: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    credits: 500,
    description: "For serious creators",
    features: [
      { text: "500 AI credits/month", included: true },
      { text: "Unlimited channels", included: true },
      { text: "Full analytics suite", included: true },
      { text: "Priority support", included: true },
      { text: "Script templates", included: true },
      { text: "Custom thumbnails", included: true },
      { text: "SEO autopilot", included: true },
      { text: "3 team seats", included: true },
    ],
    cta: "Go Pro",
    ctaHref: "/signup",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    monthlyPrice: 79,
    credits: 2000,
    description: "For teams & agencies",
    features: [
      { text: "2,000 AI credits/month", included: true },
      { text: "Unlimited channels", included: true },
      { text: "Full analytics suite", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Script templates", included: true },
      { text: "Custom thumbnails", included: true },
      { text: "SEO autopilot", included: true },
      { text: "Unlimited seats + API access", included: true },
    ],
    cta: "Contact Sales",
    ctaHref: "/signup",
    highlight: false,
  },
];

const FAQ_ITEMS = [
  {
    question: "What is an AI credit?",
    answer: "One credit powers one AI action — generating a script, creating a thumbnail, running an SEO analysis, or processing an upload. Credits refresh monthly and unused credits don't roll over on monthly plans.",
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes. Upgrade, downgrade, or cancel at any time. When you upgrade mid-cycle, you're charged the prorated difference. Downgrades take effect at the next billing date.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Every account starts with 10 free credits — no credit card required. You can explore the full product before committing to a paid plan.",
  },
  {
    question: "What's included in the 30-day money-back guarantee?",
    answer: "If you're not satisfied within the first 30 days of a paid plan, email us for a full refund. No questions asked, no hoops to jump through.",
  },
  {
    question: "Do you support YouTube and other platforms?",
    answer: "SemeStudio is built primarily for YouTube, with cross-posting support for TikTok, Instagram Reels, and LinkedIn Video on Pro and Agency plans.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a1a] last:border-0">
      <button
        className="flex w-full items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#FAFAFA] group-hover:text-white transition-colors">
          {question}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#52525B] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-[#A1A1AA] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  const getPrice = (monthly: number) => {
    if (monthly === 0) return 0;
    return annual ? Math.round(monthly * 0.8) : monthly;
  };

  return (
    <section id="pricing" className="relative py-32 px-6" aria-labelledby="pricing-heading">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FF0000]/[0.025] rounded-full blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2
            id="pricing-heading"
            className="text-3xl md:text-5xl font-black tracking-tight text-[#FAFAFA] mb-4"
          >
            Simple, transparent pricing
          </h2>
          <p className="text-[#52525B] text-lg max-w-xl mx-auto mb-8">
            Start free. Scale as you grow. No surprise fees.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-xl border border-[#222] bg-[#111111] p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                !annual
                  ? "bg-[#1e1e1e] text-[#FAFAFA] shadow-sm"
                  : "text-[#52525B] hover:text-[#A1A1AA]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual
                  ? "bg-[#1e1e1e] text-[#FAFAFA] shadow-sm"
                  : "text-[#52525B] hover:text-[#A1A1AA]"
              }`}
            >
              Annual
              <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 rounded px-1.5 py-0.5">
                2 months free
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                tier.highlight
                  ? "border-[#FF0000]/35 bg-[#110808] shadow-xl shadow-red-900/10"
                  : "border-[#222] bg-[#111111] hover:border-[#2a2a2a]"
              }`}
            >
              {tier.highlight && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  aria-hidden="true"
                  style={{
                    boxShadow: "0 0 40px rgba(255,0,0,0.08), 0 0 80px rgba(255,0,0,0.04)",
                  }}
                />
              )}

              {tier.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF0000] text-white border-0 px-3 py-0.5 text-xs font-semibold whitespace-nowrap">
                  {tier.badge}
                </Badge>
              )}

              <div className="mb-5">
                <h3 className="text-base font-bold text-[#FAFAFA] mb-1">{tier.name}</h3>
                <p className="text-xs text-[#52525B]">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-[#FAFAFA] tracking-tight tabular-nums">
                    ${getPrice(tier.monthlyPrice)}
                  </span>
                  <span className="text-[#52525B] text-sm mb-1">/mo</span>
                </div>
                {annual && tier.monthlyPrice > 0 && (
                  <div className="text-xs text-[#22C55E] mt-1 font-medium">
                    Save ${(tier.monthlyPrice - getPrice(tier.monthlyPrice)) * 12}/year
                  </div>
                )}
                <div className="text-xs text-[#3a3a3a] mt-1">
                  {tier.credits} credits/month
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 mb-7">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-[#22C55E] mt-0.5 shrink-0" />
                    ) : (
                      <Minus className="h-4 w-4 text-[#2a2a2a] mt-0.5 shrink-0" />
                    )}
                    <span className={feature.included ? "text-[#A1A1AA]" : "text-[#2a2a2a]"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-semibold text-sm transition-all ${
                  tier.highlight
                    ? "bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[#1a1a1a] hover:bg-[#222] text-[#FAFAFA] border border-[#2a2a2a] hover:border-[#333]"
                }`}
                render={<Link href={tier.ctaHref} />}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20 p-4 rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] max-w-xl mx-auto"
        >
          <ShieldCheck size={22} className="text-[#22C55E] shrink-0" />
          <div className="text-center sm:text-left">
            <span className="text-sm font-semibold text-[#FAFAFA]">30-day money-back guarantee</span>
            <span className="text-sm text-[#52525B] ml-1.5">— no questions asked.</span>
          </div>
        </motion.div>

        {/* Credit Packs */}
        <div className="mb-20 text-center">
          <p className="text-[#52525B] text-sm mb-4">
            Need more credits? Buy packs anytime — no subscription required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { credits: 50, price: 4 },
              { credits: 200, price: 14 },
              { credits: 500, price: 29 },
            ].map((pack) => (
              <div
                key={pack.credits}
                className="rounded-xl border border-[#222] bg-[#111111] px-5 py-3 text-sm hover:border-[#2a2a2a] transition-colors cursor-pointer"
              >
                <span className="font-bold text-[#FAFAFA]">{pack.credits} credits</span>
                <span className="text-[#2a2a2a] mx-2">/</span>
                <span className="text-[#A1A1AA]">${pack.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl">
          <h3 className="text-2xl font-black text-[#FAFAFA] tracking-tight mb-8 text-center">
            Frequently asked questions
          </h3>
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] px-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
