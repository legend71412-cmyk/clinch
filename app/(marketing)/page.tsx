import { HeroSection } from "@/components/landing/hero";
import { LogoCloud } from "@/components/landing/logo-cloud";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing";
import { FaqSection } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <LogoCloud />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
