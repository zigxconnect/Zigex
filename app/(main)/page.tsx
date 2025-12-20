import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import FeaturedInternships from "@/components/sections/landing/FeaturesSection";
import { VisionMissionSection } from "@/components/sections/landing/VisionMissionSection";
import SectionDivider from "@/components/sections/landing/SectionDivider";
import CommunitySection from "@/components/sections/landing/CommunitySection";
import FeaturesGridSection from "@/components/sections/landing/FeaturesGridSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section (Includes Navbar and id='home' implicitly) */}
      <BamendaHeroSection />

      {/* Features Section - Linked to #features */}
      <FeaturesGridSection />

      {/* Divider */}
      <SectionDivider variant="wave" />

      {/* Vision & Mission Section - Linked to #mission */}
      <VisionMissionSection />

      {/* Divider */}
      <SectionDivider variant="default" />

      {/* Internships Section - Linked to #internships */}
      <FeaturedInternships />
      
      {/* Community Section - Linked to #community */}
      <CommunitySection />

      {/* Bottom spacing or additional divider if needed */}
      <div className="pb-10"></div>
    </div>
  );
}
