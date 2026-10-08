import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/public/SiteHeader";
import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import { HeroOpportunity } from "@/components/sections/landing/HeroOpportunity";
import { LatestOpportunities, LatestOpportunitiesSkeleton } from "@/components/sections/landing/LatestOpportunities";
import { HowItWorksSection } from "@/components/sections/landing/HowItWorksSection";
import { ForCompaniesSection } from "@/components/sections/landing/ForCompaniesSection";
import { VisionMissionSection } from "@/components/sections/landing/VisionMissionSection";
import { FaqSection } from "@/components/sections/landing/FaqSection";
import CommunitySection from "@/components/sections/landing/CommunitySection";
import { AccountDeletedNotice } from "@/components/sections/landing/AccountDeletedNotice";

/**
 * Landing page, for signed-out visitors (signed-in students are sent to /feed
 * by proxy.ts). Kept short on purpose: say what it is, show real
 * opportunities, explain the steps, serve companies, answer questions, ask.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white">
      <SiteHeader />
      <BamendaHeroSection
        card={
          <Suspense fallback={null}>
            <HeroOpportunity />
          </Suspense>
        }
      />

      {/* Streams in separately so a slow backend never delays the hero; the
          skeleton keeps the section visible (and the page still) meanwhile. */}
      <Suspense fallback={<LatestOpportunitiesSkeleton />}>
        <LatestOpportunities />
      </Suspense>

      <HowItWorksSection />
      <ForCompaniesSection />
      <VisionMissionSection />
      <FaqSection />
      <CommunitySection />
      <AccountDeletedNotice />
    </div>
  );
}
