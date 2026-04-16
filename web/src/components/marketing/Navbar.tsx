"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How It Works" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/90 backdrop-blur-xl border-b border-[#222]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-[#FF0000] flex items-center justify-center overflow-hidden">
            <span className="text-white font-black text-sm tracking-tighter">S</span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#FAFAFA] group-hover:text-white transition-colors">
            SemeStudio
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#161616]"
            render={<Link href="/login" />}
          >
            Log in
          </Button>
          <Button
            className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold px-5 shadow-lg shadow-red-500/20"
            render={<Link href="/signup" />}
          >
            Start Free
          </Button>
        </div>

        <button
          className="md:hidden text-[#A1A1AA] hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#222] bg-[#080808]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#A1A1AA] hover:text-[#FAFAFA] py-2 text-sm"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-[#222]">
                <Button variant="ghost" className="flex-1 text-[#A1A1AA]" render={<Link href="/login" />}>
                  Log in
                </Button>
                <Button className="flex-1 bg-[#FF0000] hover:bg-[#CC0000] text-white" render={<Link href="/signup" />}>
                  Start Free
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
