import { Pricing } from "@/components/marketing/Pricing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - SemeStudio",
  description: "Simple, transparent pricing for YouTube creators. Start free, scale as you grow.",
};

export default function PricingPage() {
  return (
    <div className="pt-24">
      <Pricing />
    </div>
  );
}
