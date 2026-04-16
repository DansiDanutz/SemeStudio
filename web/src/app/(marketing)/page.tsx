import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { Pricing } from "@/components/marketing/Pricing";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CtaSection } from "@/components/marketing/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CtaSection />
    </>
  );
}
