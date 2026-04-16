"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const TIERS = [
  {
    name: "Free",
    price: 0,
    credits: 10,
    description: "Try SemeStudio risk-free",
    features: [
      "10 AI credits/month",
      "1 YouTube channel",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Starter",
    price: 9,
    credits: 100,
    description: "For solo creators",
    features: [
      "100 AI credits/month",
      "1 YouTube channel",
      "Full analytics suite",
      "Email support",
      "Script templates",
    ],
    cta: "Start Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: 29,
    credits: 500,
    description: "For serious creators",
    features: [
      "500 AI credits/month",
      "Unlimited channels",
      "3 team seats",
      "Priority support",
      "Custom thumbnails",
      "SEO autopilot",
    ],
    cta: "Go Pro",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: 79,
    credits: 2000,
    description: "For teams & agencies",
    features: [
      "2,000 AI credits/month",
      "Unlimited channels",
      "Unlimited seats",
      "API access",
      "White-label reports",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2
            id="pricing-heading"
            className="text-3xl md:text-5xl font-black tracking-tight text-[#FAFAFA] mb-4"
          >
            Simple, transparent pricing
          </h2>
          <p className="text-[#52525B] text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. No surprise fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                tier.highlight
                  ? "border-[#FF0000]/40 bg-[#111111] glow-red"
                  : "border-[#222] bg-[#111111] hover:border-[#2a2a2a]"
              }`}
            >
              {tier.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF0000] text-white border-0 px-3 py-0.5 text-xs font-semibold">
                  {tier.badge}
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#FAFAFA] mb-1">{tier.name}</h3>
                <p className="text-sm text-[#52525B]">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-[#FAFAFA] tracking-tight">
                  ${tier.price}
                </span>
                <span className="text-[#52525B] text-sm ml-1">/mo</span>
                <div className="text-xs text-[#A1A1AA] mt-1">
                  {tier.credits} credits/month
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#22C55E] mt-0.5 shrink-0" />
                    <span className="text-[#A1A1AA]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-semibold ${
                  tier.highlight
                    ? "bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-lg shadow-red-500/20"
                    : "bg-[#1a1a1a] hover:bg-[#222] text-[#FAFAFA] border border-[#2a2a2a]"
                }`}
                render={<Link href="/signup" />}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="mt-16 text-center">
          <p className="text-[#52525B] text-sm mb-4">
            Need more credits? Buy packs anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { credits: 50, price: 4 },
              { credits: 200, price: 14 },
              { credits: 500, price: 29 },
            ].map((pack) => (
              <div
                key={pack.credits}
                className="rounded-xl border border-[#222] bg-[#111111] px-6 py-3 text-sm"
              >
                <span className="font-bold text-[#FAFAFA]">{pack.credits} credits</span>
                <span className="text-[#52525B] mx-2">/</span>
                <span className="text-[#A1A1AA]">${pack.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
