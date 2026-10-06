import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import FeaturedInternships from "@/components/sections/landing/FeaturesSection";
import { VisionMissionSection } from "@/components/sections/landing/VisionMissionSection";
import CommunitySection from "@/components/sections/landing/CommunitySection";
import FeaturesGridSection from "@/components/sections/landing/FeaturesGridSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section (Includes Navbar and id='home' implicitly) */}
      <BamendaHeroSection />

      {/* Features Section - Linked to #features */}
      <FeaturesGridSection />

      {/* Vision & Mission Section - Linked to #mission */}
      <VisionMissionSection />

      {/* Internships Section - Linked to #internships */}
      <FeaturedInternships />
      
      {/* Community Section - Linked to #community */}
      <CommunitySection />

    </div>
  );
}
