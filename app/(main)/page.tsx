import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/public/SiteHeader";
import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import { LatestOpportunities } from "@/components/sections/landing/LatestOpportunities";
import { HowItWorksSection } from "@/components/sections/landing/HowItWorksSection";
import FeaturedInternships from "@/components/sections/landing/FeaturesSection";
import { ForCompaniesSection } from "@/components/sections/landing/ForCompaniesSection";
import { VisionMissionSection } from "@/components/sections/landing/VisionMissionSection";
import { FaqSection } from "@/components/sections/landing/FaqSection";
import CommunitySection from "@/components/sections/landing/CommunitySection";

/**
 * Landing page, for signed-out visitors (signed-in students are sent to /feed
 * by proxy.ts). Order follows what leading student platforms do: say what it
 * is, show real opportunities, explain the steps, then serve the second
 * audience (companies), then answer questions.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white">
      <SiteHeader />
      <BamendaHeroSection />

      {/* Streams in separately so a slow backend never delays the hero. */}
      <Suspense fallback={null}>
        <LatestOpportunities />
      </Suspense>

      <HowItWorksSection />
      <FeaturedInternships />
      <ForCompaniesSection />
      <VisionMissionSection />
      <FaqSection />
      <CommunitySection />
    </div>
  );
}
