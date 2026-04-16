"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden" aria-label="Call to action">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF0000]/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#7C3AED]/[0.03] rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#FAFAFA] mb-6">
          Ready to 10x
          <br />
          <span className="text-gradient-hero">your channel?</span>
        </h2>
        <p className="text-[#A1A1AA] text-lg mb-10 max-w-xl mx-auto">
          Join thousands of creators who ship more content, get more views, and
          grow faster with SemeStudio.
        </p>
        <Button
          size="lg"
          className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold text-lg px-10 py-7 shadow-xl shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
          render={<Link href="/signup" />}
        >
          Start for Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-[#52525B] text-sm mt-4">
          No credit card required. 10 free credits included.
        </p>
      </motion.div>
    </section>
  );
}
