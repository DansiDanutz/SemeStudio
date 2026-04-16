"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, Video, GitCommit, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RESOURCES_LINKS = [
  { href: "#", label: "Blog", description: "Creator growth tips and guides", icon: BookOpen },
  { href: "#", label: "Tutorials", description: "Step-by-step video walkthroughs", icon: Video },
  { href: "#", label: "Changelog", description: "What's new in SemeStudio", icon: GitCommit },
  { href: "#", label: "Roadmap", description: "See what we're building next", icon: Map },
];

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How It Works" },
];

function ResourcesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-1 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors duration-200"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Resources
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-xl border border-[#222] bg-[#0d0d0d] shadow-2xl shadow-black/60 overflow-hidden"
          >
            <div className="p-2">
              {RESOURCES_LINKS.map(({ href, label, description, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-[#161616] transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#222] transition-colors">
                    <Icon size={14} className="text-[#52525B] group-hover:text-[#A1A1AA] transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#FAFAFA]">{label}</div>
                    <div className="text-xs text-[#52525B] mt-0.5">{description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
          ? "bg-[#080808]/90 backdrop-blur-xl border-b border-[#1a1a1a] shadow-lg shadow-black/20"
          : "bg-transparent backdrop-blur-none"
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
          <ResourcesDropdown />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#161616] text-sm"
            render={<Link href="/login" />}
          >
            Log in
          </Button>
          <Button
            className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold px-5 text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            render={<Link href="/signup" />}
          >
            Start Free
          </Button>
        </div>

        <button
          className="md:hidden text-[#A1A1AA] hover:text-white p-2 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu — slides in from right conceptually, but animates height for simplicity */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-[#1a1a1a] bg-[#080808]/97 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#A1A1AA] hover:text-[#FAFAFA] py-2.5 text-sm border-b border-[#1a1a1a] last:border-0 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-1 pb-1 border-b border-[#1a1a1a]">
                <div className="text-xs text-[#3a3a3a] uppercase tracking-wider font-medium mb-2 mt-1">Resources</div>
                {RESOURCES_LINKS.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-[#52525B] hover:text-[#A1A1AA] py-2 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 text-[#A1A1AA] border border-[#222]"
                  render={<Link href="/login" />}
                >
                  Log in
                </Button>
                <Button
                  className="flex-1 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold shadow-lg shadow-red-500/20"
                  render={<Link href="/signup" />}
                >
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
