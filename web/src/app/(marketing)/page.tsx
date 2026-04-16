import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { SocialProof } from "@/components/marketing/SocialProof";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { Pricing } from "@/components/marketing/Pricing";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CtaSection } from "@/components/marketing/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <SocialProof />
      <HowItWorks />
      <ComparisonTable />
      <Pricing />
      <CtaSection />
    </>
  );
}
