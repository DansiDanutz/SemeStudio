"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const FEATURES_LIST = [
  "AI Script Writer",
  "Thumbnail Generator",
  "SEO Optimizer",
  "Analytics",
  "Upload Automation",
  "Cross-Platform Posting",
  "Credit System",
  "Starting Price",
];

const TOOLS = [
  {
    name: "SemeStudio",
    highlight: true,
    values: [true, true, true, true, true, true, true, "$9/mo"],
  },
  {
    name: "VidIQ",
    highlight: false,
    values: [false, false, true, true, false, false, false, "$10/mo"],
  },
  {
    name: "TubeBuddy",
    highlight: false,
    values: [false, false, true, true, false, false, false, "$9/mo"],
  },
  {
    name: "Descript",
    highlight: false,
    values: [false, false, false, false, false, false, false, "$12/mo"],
  },
];

export function ComparisonTable() {
  return (
    <section className="relative py-32 px-6" aria-labelledby="comparison-heading">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF0000]/[0.025] rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <h2
            id="comparison-heading"
            className="text-3xl md:text-5xl font-black tracking-tight text-[#FAFAFA] mb-4"
          >
            See how we compare
          </h2>
          <p className="text-[#52525B] text-lg max-w-xl mx-auto">
            SemeStudio does what five separate tools do — for a fraction of the price.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-x-auto rounded-2xl border border-[#222]"
        >
          <table className="w-full" role="table" aria-label="Feature comparison table">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th
                  scope="col"
                  className="bg-[#0d0d0d] px-6 py-5 text-left text-sm font-semibold text-[#52525B] w-[220px]"
                >
                  Feature
                </th>
                {TOOLS.map((tool) => (
                  <th
                    key={tool.name}
                    scope="col"
                    className={`px-6 py-5 text-center text-sm font-bold relative ${
                      tool.highlight
                        ? "bg-[#110808] text-[#FAFAFA]"
                        : "bg-[#0d0d0d] text-[#52525B]"
                    }`}
                  >
                    {tool.highlight && (
                      <>
                        {/* Glow border on highlighted column header */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          aria-hidden="true"
                          style={{
                            boxShadow: "inset 0 0 0 1px rgba(255,0,0,0.25), inset 0 1px 0 0 rgba(255,0,0,0.4)",
                          }}
                        />
                        <span className="relative">
                          <span className="text-gradient-hero">{tool.name}</span>
                        </span>
                      </>
                    )}
                    {!tool.highlight && tool.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES_LIST.map((feature, fi) => (
                <tr
                  key={feature}
                  className={`border-b border-[#1a1a1a] last:border-0 transition-colors hover:bg-[#0f0f0f] ${
                    fi % 2 === 0 ? "bg-[#0b0b0b]" : "bg-[#0d0d0d]"
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[#A1A1AA] font-medium">{feature}</td>
                  {TOOLS.map((tool) => {
                    const val = tool.values[fi];
                    const isPrice = typeof val === "string";
                    return (
                      <td
                        key={tool.name}
                        className={`px-6 py-4 text-center relative ${
                          tool.highlight ? "bg-[#110808]/80" : ""
                        }`}
                      >
                        {tool.highlight && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            aria-hidden="true"
                            style={{
                              boxShadow: "inset 1px 0 0 rgba(255,0,0,0.12), inset -1px 0 0 rgba(255,0,0,0.12)",
                            }}
                          />
                        )}
                        {isPrice ? (
                          <span
                            className={`text-sm font-bold relative ${
                              tool.highlight ? "text-[#FF0000]" : "text-[#52525B]"
                            }`}
                          >
                            {val}
                          </span>
                        ) : val === true ? (
                          <div className="flex justify-center">
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                tool.highlight
                                  ? "bg-[#FF0000]/15"
                                  : "bg-[#22C55E]/10"
                              }`}
                            >
                              <Check
                                size={13}
                                className={tool.highlight ? "text-[#FF0000]" : "text-[#22C55E]"}
                                strokeWidth={2.5}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <X size={15} className="text-[#2a2a2a]" strokeWidth={2} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center text-sm text-[#2a2a2a] mt-6"
        >
          Pricing data based on public plans as of 2025. Subject to change.
        </motion.p>
      </div>
    </section>
  );
}
